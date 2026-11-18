import type { ReadmeResult } from "@/lib/github";

export const LANG_COLORS: Record<string, string> = {
  Kotlin: "#a97bff",
  Java: "#b07219",
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  "C#": "#178600",
  HTML: "#e34c26",
  CSS: "#663399",
  Swift: "#F05138",
  Dart: "#00B4AB",
};

export const dateFmt = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });

/* ── README loading (client) ──────────────────────────────────────────────── */

const readmeCache = new Map<string, Promise<ReadmeResult>>();

/**
 * Fetch a repo's README once per page load. Called on hover/focus to warm it
 * up, and again when the modal opens (which then resolves instantly).
 */
export function loadReadme(repo: string): Promise<ReadmeResult> {
  let pending = readmeCache.get(repo);
  if (!pending) {
    pending = fetch(`/api/readme/${encodeURIComponent(repo)}`)
      .then((res) => res.json() as Promise<ReadmeResult>)
      .catch((): ReadmeResult => ({ status: "error" }));
    // Don't keep failures around: let the next open try again.
    pending.then((r) => r.status !== "ok" && r.status !== "missing" && readmeCache.delete(repo));
    readmeCache.set(repo, pending);
  }
  return pending;
}
