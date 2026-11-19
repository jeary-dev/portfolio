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

  /*
   * Featured: Hanami, Kaizen (pinned, in that order).
   *
   * SCREENSHOT SLOTS: drop an image (WebP, 1600×900 or 1600×1000, under
   * ~300 KB) into public/projects/ and uncomment the matching `screenshot`
   * line. Cards crop to 16:9 from the centre. Leave a slot commented until the
   * file exists, or the card shows a broken image.
   */
  overrides: [
    {
      repo: "Hanami",
      pinned: true,
      order: 1,
      category: "minecraft",
      // ▼ SCREENSHOT SLOT: Hanami (uncomment once public/projects/hanami.webp exists)
      // screenshot: { src: "/projects/hanami.webp", alt: "Hanami particle cosmetics in game" },
    },
    {
      repo: "Kaizen",
      title: "Kaizen",
      pinned: true,
      order: 2,
      category: "minecraft",
      description:
        "Edit your Minecraft server's config files in a real web editor, then apply them with one command. End-to-end encrypted, with live checks, a diff before saving, and one-command undo.",
      homepage: "https://edit.jeary.dev/demo",
      // ▼ SCREENSHOT SLOT: Kaizen
      screenshot: { src: "/projects/kaizen.webp", alt: "The Kaizen web editor with a plugin config open and one unsaved change" },
    },
    {
      repo: "portfolio",
      category: "web",
      description:
        "The site you're on. Next.js with project data pulled live from GitHub, self-hosted in Docker behind a Cloudflare Tunnel.",
      // ▼ SCREENSHOT SLOT: portfolio
      screenshot: { src: "/projects/portfolio.webp", alt: "The hero section of this site" },
    },
    // Not shown, even if these repos are public on GitHub.
    { repo: "MCBridge", hidden: true }, // retired
    { repo: "Ichiba", hidden: true },
  ],

  /*
   * Work that isn't a public GitHub repo. An entry whose description is still a
   * [placeholder] is hidden in production, like every other placeholder.
   */
  extras: [],
};

export const categories: { id: Category; label: string; kanji: string }[] = [
  { id: "minecraft", label: "Minecraft", kanji: "塊" },
  { id: "discord", label: "Discord", kanji: "話" },
  { id: "web", label: "Web", kanji: "網" },
  { id: "apps", label: "Apps", kanji: "器" },
  { id: "other", label: "Other", kanji: "道" },
];
