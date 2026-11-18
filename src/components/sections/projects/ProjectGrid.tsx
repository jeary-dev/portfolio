"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { categories, type Category } from "@/config/projects";
import type { FetchStatus, Project } from "@/lib/github";
import { InkLink } from "@/components/ui/InkLink";
import { ProjectCard } from "./ProjectCard";
import { ProjectModal } from "./ProjectModal";

type Filter = "all" | Category;

export function ProjectGrid({
  projects,
  status,
  profileUrl,
}: {
  projects: Project[];
  status: FetchStatus;
  profileUrl: string;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<Project | null>(null);
  const close = useCallback(() => setOpen(null), []);

  const counts = useMemo(() => {
    const c = new Map<Filter, number>([["all", projects.length]]);
    for (const p of projects) c.set(p.category, (c.get(p.category) ?? 0) + 1);
    return c;
  }, [projects]);

  const visible = filter === "all" ? projects : projects.filter((p) => p.category === filter);
  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    ...categories.filter((c) => c.id !== "other" || counts.get("other")).map((c) => ({ id: c.id, label: c.label })),
  ];

  return (
    <div>
      {status !== "ok" && (
        <p role="status" className="mb-8 flex items-start gap-3 rounded-sm border border-beni/40 bg-beni/5 px-4 py-3 text-[14px] text-shiro/85">
          <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-beni" />
          {status === "rate-limited"
            ? "GitHub's API is catching its breath (rate limit reached). Live projects will reappear shortly."
            : "GitHub couldn't be reached just now. Live projects will reappear shortly."}
          {projects.length > 0 && " Showing saved projects meanwhile."}
        </p>
      )}

      <div role="group" aria-label="Filter projects by discipline" className="mb-10 flex flex-wrap gap-2">
        {filters.map((f) => {
          const active = filter === f.id;
          const n = counts.get(f.id) ?? 0;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setFilter(f.id);
                // Layout height changes; let pinned/scrubbed sections re-measure.
                window.setTimeout(() => ScrollTrigger.refresh(), 650);
              }}
              className={`relative rounded-full border px-4 py-2 text-[13px] transition-colors duration-500 ${
                active ? "border-sakura text-ink" : "border-line text-shiro/75 hover:border-sakura/50 hover:text-shiro"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="filter-pill"
                  className="absolute inset-0 rounded-full bg-sakura"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative">
                {f.label}
                <span className={`ml-2 font-mono text-[10px] ${active ? "text-ink/70" : "text-mist"}`}>{n}</span>
              </span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <EmptyState filtered={projects.length > 0} profileUrl={profileUrl} />
      ) : (
        <motion.ul layout className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-live="polite">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((p, i) => (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.25 } }}
                transition={{ duration: 0.6, delay: Math.min(i, 6) * 0.05 }}
                className="[perspective:1000px]"
              >
                <ProjectCard project={p} onExplore={setOpen} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}

      <p className="mt-12 text-[14px] text-mist">
        Everything else lives on{" "}
        <InkLink href={profileUrl} external className="text-shiro">
          GitHub ↗
        </InkLink>
      </p>

      <ProjectModal project={open} onClose={close} />
    </div>
  );
}

function EmptyState({ filtered, profileUrl }: { filtered: boolean; profileUrl: string }) {
  return (
    <div className="flex flex-col items-center gap-5 rounded-sm border border-dashed border-line px-6 py-20 text-center">
      <span aria-hidden="true" className="font-jp text-5xl text-sakura/40">
        蕾
      </span>
      <p className="font-display text-2xl font-light text-shiro">
        {filtered ? "Nothing in this branch yet." : "The first blossoms are on their way."}
      </p>
      <p className="max-w-sm text-[14px] text-mist">
        {filtered ? "Try another discipline, or check back soon." : "Public projects will appear here as soon as they're pushed."}{" "}
        <InkLink href={profileUrl} external className="text-sakura">
          Visit GitHub
        </InkLink>
      </p>
    </div>
  );
}
