"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { categories } from "@/config/projects";
import type { Project, ReadmeResult } from "@/lib/github";
import { useLenis } from "@/components/providers/SmoothScroll";
import { useReducedMotion } from "@/lib/hooks";
import { LANG_COLORS, dateFmt, loadReadme } from "./meta";

const EASE = [0.22, 1, 0.36, 1] as const;
const noopSubscribe = () => () => {};

/** "Explore" modal: project details plus the README rendered by GitHub. */
export function ProjectModal({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>{project && <Dialog key={project.id} project={project} onClose={onClose} />}</AnimatePresence>,
    document.body,
  );
}

function Dialog({ project: p, onClose }: { project: Project; onClose: () => void }) {
  const lenis = useLenis();
  const reduced = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const cat = categories.find((c) => c.id === p.category)!;
  const titleId = `project-${p.id}-title`;

  // Lock page scroll, hide the rest of the page from AT/keyboard, restore focus on close.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    lenis?.stop();

    const siblings = Array.from(document.body.children).filter(
      (el): el is HTMLElement => el instanceof HTMLElement && !el.contains(root.current) && !el.inert,
    );
    siblings.forEach((el) => (el.inert = true));
    closeBtn.current?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      siblings.forEach((el) => (el.inert = false));
      html.style.overflow = prevOverflow;
      lenis?.start();
      opener?.focus({ preventScroll: true });
    };
  }, [lenis, onClose]);

  return (
    <motion.div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6 md:p-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3, delay: 0.1 } }}
      transition={{ duration: 0.35 }}
    >
      {/* Backdrop */}
      <div aria-hidden="true" onClick={onClose} className="absolute inset-0 bg-ink/85 backdrop-blur-sm" />

      <motion.div
        className="relative flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-md border border-line bg-sumi shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9),0_0_80px_-40px_rgba(242,167,195,0.35)] sm:max-h-[88dvh] sm:rounded-sm"
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 60, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduced ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.98 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        {/* Header */}
        <header className="relative flex items-start gap-4 overflow-hidden border-b border-line px-5 pb-5 pt-6 sm:px-8 sm:pt-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_90%_0%,rgba(242,167,195,0.14),transparent_60%)]"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-2 -top-6 font-jp text-[8rem] leading-none text-shiro/[0.05] sm:text-[10rem]"
          >
            {cat.kanji}
          </span>
          <div className="relative min-w-0 flex-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-sakura">
              {cat.label}
              {p.pinned && <span className="ml-3 text-mist">· Pinned</span>}
            </p>
            <h2 id={titleId} className="mt-2 break-words font-display text-[2rem] font-light leading-tight text-shiro sm:text-[2.6rem]">
              {p.title}
            </h2>
          </div>
          <button
            ref={closeBtn}
            type="button"
            onClick={onClose}
            className="relative -mr-1 flex shrink-0 items-center gap-2 rounded-full border border-line px-3.5 py-2 font-mono text-[11px] text-shiro/80 transition-colors duration-300 hover:border-sakura/60 hover:text-sakura"
          >
            <span aria-hidden="true" className="font-jp">閉</span>
            Close
            <span className="sr-only"> project details (Esc)</span>
          </button>
        </header>

        {/* Scrollable body */}
        <div ref={scroller} data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-7 sm:px-8">
          <p className={`max-w-2xl text-[15px] leading-relaxed ${p.description ? "text-shiro/85" : "italic text-mist"}`}>
            {p.description ?? "No description yet."}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-[11px] text-mist">
            {p.language && (
              <span className="flex items-center gap-2">
                <span aria-hidden="true" className="size-2 rounded-full" style={{ background: LANG_COLORS[p.language] ?? "var(--color-sakura)" }} />
                {p.language}
              </span>
            )}
            {p.url && (
              <span className="flex items-center gap-1.5" aria-label={`${p.stars} stars`}>
                <span aria-hidden="true" className="text-sakura">★</span>
                {p.stars}
              </span>
            )}
            {p.pushedAt && <span>Updated {dateFmt.format(new Date(p.pushedAt))}</span>}
          </div>

          {p.topics.length > 0 && (
            <ul aria-label="Topics" className="mt-5 flex flex-wrap gap-2">
              {p.topics.map((t) => (
                <li key={t} className="rounded-full border border-line px-3 py-1 font-mono text-[10.5px] text-shiro/70">
                  {t}
                </li>
              ))}
            </ul>
          )}

          {(p.url || p.homepage) && (
            <div className="mt-7 flex flex-wrap gap-3">
              {p.url && (
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-sakura px-5 py-2.5 text-[13px] font-medium text-ink transition-colors duration-300 hover:bg-shiro"
                >
                  View code ↗<span className="sr-only"> (opens in a new tab)</span>
                </a>
              )}
              {p.homepage && (
                <a
                  href={p.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-line px-5 py-2.5 text-[13px] text-shiro transition-colors duration-300 hover:border-sakura hover:text-sakura"
                >
                  Visit live ↗<span className="sr-only"> (opens in a new tab)</span>
                </a>
              )}
            </div>
          )}

          {p.repo && <Readme repo={p.repo} scroller={scroller} fallbackUrl={p.url} />}
        </div>
      </motion.div>
    </motion.div>
  );
}

type ReadmeState = { status: "loading" } | ReadmeResult;

function Readme({
  repo,
  scroller,
  fallbackUrl,
}: {
  repo: string;
  scroller: React.RefObject<HTMLDivElement | null>;
  fallbackUrl: string | null;
}) {
  const [state, setState] = useState<ReadmeState>({ status: "loading" });
  const body = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let live = true;
    loadReadme(repo).then((r) => live && setState(r));
    return () => {
      live = false;
    };
  }, [repo]);

  // External links open in a new tab; in-README anchors scroll the modal, not the page.
  useEffect(() => {
    const el = body.current;
    if (!el || state.status !== "ok") return;
    el.querySelectorAll<HTMLAnchorElement>("a[href^='http']").forEach((a) => {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    });
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[href^='#']");
      if (!a) return;
      e.preventDefault();
      const id = decodeURIComponent(a.getAttribute("href")!.slice(1));
      const target = el.querySelector<HTMLElement>(`[id="user-content-${CSS.escape(id)}"], [id="${CSS.escape(id)}"]`);
      const box = scroller.current;
      if (!target || !box) return;
      const heading = target.closest(".markdown-heading") ?? target;
      const top = heading.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop - 16;
      box.scrollTo({ top, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    };
    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, [state, scroller]);

  const link = state.status !== "loading" ? (state.url ?? fallbackUrl) : null;

  return (
    <section aria-labelledby="readme-label" className="mt-10 border-t border-line pt-8">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <h3 id="readme-label" className="flex items-baseline gap-3 font-mono text-[10px] uppercase tracking-[0.35em] text-mist">
          <span aria-hidden="true" className="font-jp text-base tracking-normal text-sakura/70">読</span>
          README
        </h3>
        {state.status === "ok" && link && (
          <a href={link} target="_blank" rel="noopener noreferrer" className="font-mono text-[11px] text-mist transition-colors hover:text-sakura">
            Open on GitHub ↗
          </a>
        )}
      </div>

      {state.status === "loading" && (
        <div role="status" aria-label="Loading README" className="space-y-3">
          {[92, 78, 85, 40, 88, 70].map((w, i) => (
            <div key={i} className="h-3 animate-pulse rounded-sm bg-charcoal" style={{ width: `${w}%`, animationDelay: `${i * 90}ms` }} />
          ))}
        </div>
      )}

      {state.status === "ok" && (
        <motion.div
          ref={body}
          className="readme"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          // GitHub's own sanitised render of the README (no scripts or inline handlers).
          dangerouslySetInnerHTML={{ __html: state.html }}
        />
      )}

      {state.status === "missing" && (
        <p className="text-[14px] italic text-mist">This project doesn&apos;t have a README yet.</p>
      )}

      {state.status !== "loading" && state.status !== "ok" && state.status !== "missing" && (
        <p className="text-[14px] text-mist">
          {state.status === "rate-limited"
            ? "GitHub's API is catching its breath, so the README can't load just now."
            : "The README couldn't be loaded just now."}
          {link && (
            <>
              {" "}
              <a href={link} target="_blank" rel="noopener noreferrer" className="text-sakura underline-offset-4 hover:underline">
                Read it on GitHub ↗
              </a>
            </>
          )}
        </p>
      )}
    </section>
  );
}
