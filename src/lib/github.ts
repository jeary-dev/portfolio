import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { categories, projectConfig, type Category, type Screenshot } from "@/config/projects";

/* ── Types ──────────────────────────────────────────────────────────────── */

export type FetchStatus = "ok" | "rate-limited" | "error";

export interface Project {
  id: string;
  /** GitHub repository name (null for config `extras`). Used to load the README. */
  repo: string | null;
  title: string;
  description: string | null;
  category: Category;
  language: string | null;
  stars: number;
  url: string | null;
  homepage: string | null;
  pushedAt: string | null;
  pinned: boolean;
  screenshot: Screenshot | null;
  topics: string[];
}

export interface ProjectsResult {
  status: FetchStatus;
  projects: Project[];
}

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionsResult {
  status: FetchStatus;
  total: number;
  /** Columns of 7 days (Sunday first); missing days are null. */
  weeks: (ContributionDay | null)[][];
}

interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  pushed_at: string | null;
  fork: boolean;
  archived: boolean;
  topics?: string[];
}

/* ── Helpers ────────────────────────────────────────────────────────────── */

const headers = (): HeadersInit => ({
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "portfolio-site",
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
});

const isRateLimited = (res: Response) =>
  res.status === 429 || (res.status === 403 && res.headers.get("x-ratelimit-remaining") === "0");

const INFER: [Category, RegExp][] = [
  ["minecraft", /minecraft|spigot|paper(mc)?\b|bukkit|velocity|bungee|fabric|forge|\bmc/i],
  ["discord", /discord|\bbot\b|jda|discord\.(js|py)/i],
  ["apps", /\bapp\b|android|ios|flutter|react-native|expo|electron|tauri|desktop|mobile/i],
  ["web", /website|web\b|next(\.js|js)?|react|vue|svelte|astro|tailwind|landing|portfolio/i],
];

function inferCategory(repo: GitHubRepo): Category {
  const hay = [repo.name, repo.description ?? "", ...(repo.topics ?? [])].join(" ");
  for (const [cat, re] of INFER) if (re.test(hay)) return cat;
  if (repo.language && /^(HTML|CSS|Astro|Vue|Svelte)$/.test(repo.language)) return "web";
  return "other";
}

const validCategory = (c: unknown): c is Category => categories.some((x) => x.id === c);

/** Merge GitHub repos with the local config (overrides + extras) and sort. */
function buildProjects(repos: GitHubRepo[]): Project[] {
  const cfg = projectConfig;
  const overrides = new Map(cfg.overrides.map((o) => [o.repo.toLowerCase(), o]));
  const order = new Map(cfg.overrides.map((o, i) => [o.repo.toLowerCase(), o.order ?? i]));

  const fromGitHub = repos
    .filter((r) => !(cfg.hideForks && r.fork) && !(cfg.hideArchived && r.archived))
    .filter((r) => !overrides.get(r.name.toLowerCase())?.hidden)
    .map<Project & { order: number }>((r) => {
      const o = overrides.get(r.name.toLowerCase());
      const category = o?.category && validCategory(o.category) ? o.category : cfg.inferCategories ? inferCategory(r) : "other";
      return {
        id: `gh-${r.name}`,
        repo: r.name,
        title: o?.title ?? r.name,
        description: o?.description ?? r.description,
        category,
        language: r.language,
        stars: r.stargazers_count,
        url: r.html_url,
        homepage: o?.homepage ?? (r.homepage || null),
        pushedAt: r.pushed_at,
        pinned: !!o?.pinned,
        screenshot: o?.screenshot ?? null,
        topics: r.topics ?? [],
        order: order.get(r.name.toLowerCase()) ?? 1000,
      };
    });

  const extras = cfg.extras.map<Project & { order: number }>((e, i) => ({
    id: `extra-${i}-${e.title}`,
    repo: null,
    title: e.title,
    description: e.description,
    category: e.category,
    language: e.language ?? null,
    stars: 0,
    url: e.url ?? null,
    homepage: e.homepage ?? null,
    pushedAt: null,
    pinned: !!e.pinned,
    screenshot: e.screenshot ?? null,
    topics: [],
    order: e.order ?? 1000 + i,
  }));

  return [...fromGitHub, ...extras]
    .sort(
      (a, b) =>
        Number(b.pinned) - Number(a.pinned) ||
        a.order - b.order ||
        b.stars - a.stars ||
        (b.pushedAt ?? "").localeCompare(a.pushedAt ?? ""),
    )
    .map((p) => {
      const { order, ...rest } = p;
      void order;
      return rest;
    });
}

/* ── Repositories ───────────────────────────────────────────────────────── */

export async function getProjects(): Promise<ProjectsResult> {
  "use cache";
  cacheTag("github-projects");

  try {
    const res = await fetch(
      `https://api.github.com/users/${projectConfig.githubUser}/repos?per_page=100&sort=pushed&type=owner`,
      { headers: headers() },
    );
    if (!res.ok) {
      cacheLife("minutes");
      return { status: isRateLimited(res) ? "rate-limited" : "error", projects: buildProjects([]) };
    }
    const repos = (await res.json()) as GitHubRepo[];
    cacheLife("hours");
    return { status: "ok", projects: buildProjects(Array.isArray(repos) ? repos : []) };
  } catch {
    cacheLife("minutes");
    return { status: "error", projects: buildProjects([]) };
  }
}

/* ── READMEs ─────────────────────────────────────────────────────────────── */

export type ReadmeResult =
  | { status: "ok"; html: string; url: string }
  | { status: "missing" | "not-found" | Exclude<FetchStatus, "ok">; html?: undefined; url?: string };

const SKIP_URL = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;
const IMAGE_EXT = /\.(?:png|jpe?g|gif|svg|webp|avif|bmp|ico|mp4|webm|mov)(?:[?#]|$)/i;

/**
 * GitHub renders READMEs with relative paths ("docs/banner.svg", "LICENSE").
 * Point images at raw.githubusercontent.com and links at the repo on github.com.
 * `HEAD` resolves to the default branch, so no extra API call is needed.
 */
function absolutizeReadme(html: string, user: string, repo: string, readmePath: string) {
  const dir = readmePath.includes("/") ? readmePath.slice(0, readmePath.lastIndexOf("/") + 1) : "";
  const raw = `https://raw.githubusercontent.com/${user}/${repo}/HEAD/${dir}`;
  const blob = `https://github.com/${user}/${repo}/blob/HEAD/${dir}`;
  return html.replace(/\b(src|href)="([^"]*)"/g, (whole, attr: string, value: string) => {
    if (!value || SKIP_URL.test(value)) return whole;
    const decoded = value.replace(/&amp;/g, "&");
    const base = attr === "src" || IMAGE_EXT.test(decoded) ? raw : blob;
    try {
      return `${attr}="${new URL(decoded, base).href.replace(/&/g, "&amp;")}"`;
    } catch {
      return whole;
    }
  });
}

/**
 * The rendered README for one of the configured user's repositories, as
 * GitHub-sanitised HTML. Only repos that appear in the Projects list are
 * served, so the endpoint can't be used to proxy arbitrary repositories.
 */
export async function getReadme(repo: string): Promise<ReadmeResult> {
  "use cache";
  cacheTag("github-readme", `github-readme-${repo.toLowerCase()}`);

  const { projects } = await getProjects();
  const match = projects.find((p) => p.repo?.toLowerCase() === repo.toLowerCase());
  if (!match?.repo) {
    cacheLife("minutes");
    return { status: "not-found" };
  }

  const user = projectConfig.githubUser;
  const repoUrl = `https://github.com/${user}/${match.repo}`;
  try {
    const res = await fetch(`https://api.github.com/repos/${user}/${match.repo}/readme`, {
      headers: { ...headers(), Accept: "application/vnd.github.html+json" },
    });
    if (res.status === 404) {
      cacheLife("hours");
      return { status: "missing", url: repoUrl };
    }
    if (!res.ok) {
      cacheLife("minutes");
      return { status: isRateLimited(res) ? "rate-limited" : "error", url: repoUrl };
    }
    const html = await res.text();
    const path = /data-path="([^"]+)"/.exec(html)?.[1] ?? "README.md";
    cacheLife("hours");
    return {
      status: "ok",
      html: absolutizeReadme(html, user, match.repo, path),
      url: `${repoUrl}#readme`,
    };
  } catch {
    cacheLife("minutes");
    return { status: "error", url: repoUrl };
  }
}

/* ── Contributions ──────────────────────────────────────────────────────── */

const LEVELS: Record<string, ContributionDay["level"]> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

async function contributionsViaGraphQL(user: string): Promise<ContributionsResult | null> {
  if (!process.env.GITHUB_TOKEN) return null;
  const query = `query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{date contributionCount contributionLevel weekday}}}}}}`;
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { ...headers(), "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { login: user } }),
  });
  if (!res.ok) return null;
  const json = await res.json();
  const cal = json?.data?.user?.contributionsCollection?.contributionCalendar;
  if (!cal) return null;
  const weeks = (cal.weeks as { contributionDays: { date: string; contributionCount: number; contributionLevel: string; weekday: number }[] }[]).map((w) => {
    const col: (ContributionDay | null)[] = Array(7).fill(null);
    for (const d of w.contributionDays) col[d.weekday] = { date: d.date, count: d.contributionCount, level: LEVELS[d.contributionLevel] ?? 0 };
    return col;
  });
  return { status: "ok", total: cal.totalContributions, weeks };
}

/** Public, unauthenticated fallback: parse GitHub's contribution calendar markup. */
async function contributionsViaHTML(user: string): Promise<ContributionsResult | null> {
  const res = await fetch(`https://github.com/users/${user}/contributions`, {
    headers: { "User-Agent": "portfolio-site", Accept: "text/html" },
  });
  if (!res.ok) return null;
  const html = await res.text();

  const counts = new Map<string, number>();
  for (const m of html.matchAll(/<tool-tip[^>]*for="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
    const n = /^(\d[\d,]*) contribution/.exec(m[2].trim());
    counts.set(m[1], n ? Number(n[1].replace(/,/g, "")) : 0);
  }

  const grid = new Map<number, (ContributionDay | null)[]>();
  for (const m of html.matchAll(/<td[^>]*ContributionCalendar-day[^>]*>/g)) {
    const tag = m[0];
    const date = /data-date="([^"]+)"/.exec(tag)?.[1];
    const id = /id="contribution-day-component-(\d+)-(\d+)"/.exec(tag);
    const level = Number(/data-level="(\d)"/.exec(tag)?.[1] ?? 0) as ContributionDay["level"];
    if (!date || !id) continue;
    const row = Number(id[1]);
    const col = Number(id[2]);
    if (!grid.has(col)) grid.set(col, Array(7).fill(null));
    grid.get(col)![row] = { date, level, count: counts.get(`contribution-day-component-${row}-${col}`) ?? (level ? 1 : 0) };
  }
  if (grid.size === 0) return null;

  const weeks = [...grid.entries()].sort((a, b) => a[0] - b[0]).map(([, w]) => w);
  const totalMatch = /([\d,]+)\s+contributions?\s+in the last year/i.exec(html);
  const total = totalMatch
    ? Number(totalMatch[1].replace(/,/g, ""))
    : weeks.flat().reduce((s, d) => s + (d?.count ?? 0), 0);
  return { status: "ok", total, weeks };
}

export async function getContributions(): Promise<ContributionsResult> {
  "use cache";
  cacheTag("github-contributions");
  const user = projectConfig.githubUser;
  try {
    const result = (await contributionsViaGraphQL(user)) ?? (await contributionsViaHTML(user));
    if (result) {
      cacheLife("hours");
      return result;
    }
  } catch {}
  cacheLife("minutes");
  return { status: "error", total: 0, weeks: [] };
}
