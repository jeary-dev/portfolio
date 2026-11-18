/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PROJECT CONFIG: shape what the Projects section shows.
 *
 *  Projects are fetched live from GitHub (user below). Use `overrides` to pin,
 *  hide, re-categorise, rename, or add a screenshot to any repo by its name.
 *  Use `extras` for work that isn't a public GitHub repo.
 *
 *  Screenshots go in /public/projects/ and are referenced as "/projects/x.png".
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type Category = "minecraft" | "discord" | "web" | "apps" | "other";

export interface Screenshot {
  /** Path under /public, e.g. "/projects/mcbridge.png" */
  src: string;
  alt: string;
}

export interface ProjectOverride {
  /** Exact GitHub repository name (case-insensitive). */
  repo: string;
  pinned?: boolean;
  hidden?: boolean;
  category?: Category;
  /** Replace the repo name shown on the card. */
  title?: string;
  /** Replace / supply the description. */
  description?: string;
  screenshot?: Screenshot;
  /** Live / download link (defaults to the repo's homepage field). */
  homepage?: string;
  /** Lower numbers sort first (after pinned). */
  order?: number;
}

export interface ExtraProject {
  title: string;
  description: string;
  category: Category;
  url?: string;
  homepage?: string;
  language?: string;
  screenshot?: Screenshot;
  pinned?: boolean;
  order?: number;
}

export interface ProjectConfig {
  githubUser: string;
  hideForks: boolean;
  hideArchived: boolean;
  /** Guess a category from repo name / topics / description when not set. */
  inferCategories: boolean;
  overrides: ProjectOverride[];
  extras: ExtraProject[];
}

export const projectConfig: ProjectConfig = {
  githubUser: "jeary-dev",
  hideForks: true,
  hideArchived: false,
  inferCategories: true,

  overrides: [
    // Examples. Uncomment and edit:
    // { repo: "MCBridge", pinned: true, category: "minecraft", description: "…" },
    // { repo: "mcping", screenshot: { src: "/projects/mcping.png", alt: "mcping output" } },
    // { repo: "some-old-repo", hidden: true },
  ],

  extras: [
    // { title: "Private plugin", description: "…", category: "minecraft", language: "Kotlin" },
  ],
};

export const categories: { id: Category; label: string; kanji: string }[] = [
  { id: "minecraft", label: "Minecraft", kanji: "塊" },
  { id: "discord", label: "Discord", kanji: "話" },
  { id: "web", label: "Web", kanji: "網" },
  { id: "apps", label: "Apps", kanji: "器" },
  { id: "other", label: "Other", kanji: "道" },
];
