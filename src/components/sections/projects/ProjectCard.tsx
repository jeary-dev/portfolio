"use client";

import Image from "next/image";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "motion/react";
import { categories } from "@/config/projects";
import type { Project } from "@/lib/github";
import { useFinePointer, useReducedMotion } from "@/lib/hooks";
import { LANG_COLORS, dateFmt, loadReadme } from "./meta";

/** Project card with spring 3D tilt and a soft pink glow that follows the cursor. */
export function ProjectCard({ project: p, onExplore }: { project: Project; onExplore: (p: Project) => void }) {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const tilt = fine && !reduced;
  const cat = categories.find((c) => c.id === p.category)!;

  const rx = useSpring(useMotionValue(0), { stiffness: 180, damping: 18 });
  const ry = useSpring(useMotionValue(0), { stiffness: 180, damping: 18 });
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const glowOpacity = useSpring(useMotionValue(0), { stiffness: 120, damping: 20 });
  const glowTransform = useMotionTemplate`translate(${gx}px, ${gy}px) translate(-50%, -50%)`;

  const prefetch = () => {
    if (p.repo) void loadReadme(p.repo);
  };

  return (
    <motion.article
      className="group relative flex h-full flex-col overflow-hidden rounded-sm border border-line bg-sumi"
      style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
      onPointerMove={(e) => {
        if (!tilt) return;
        const r = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        ry.set((px - 0.5) * 12);
        rx.set(-(py - 0.5) * 10);
        gx.set(e.clientX - r.left);
        gy.set(e.clientY - r.top);
        glowOpacity.set(1);
      }}
      onPointerEnter={prefetch}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
        glowOpacity.set(0);
      }}
    >
      {/* Cursor glow (transform + opacity only) */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-0 size-[420px] rounded-full bg-[radial-gradient(circle,rgba(242,167,195,0.16),transparent_62%)]"
        style={{ transform: glowTransform, opacity: glowOpacity }}
      />
      {/* Border glow */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 rounded-sm opacity-0 shadow-[inset_0_0_0_1px_rgba(242,167,195,0.5),0_0_40px_-10px_rgba(242,167,195,0.45)] transition-opacity duration-500 group-focus-within:opacity-100 group-hover:opacity-100"
      />

      <div onClick={() => onExplore(p)} className="relative z-10 aspect-[16/9] cursor-pointer overflow-hidden border-b border-line bg-ink">
        {p.screenshot ? (
          <Image
            src={p.screenshot.src}
            alt={p.screenshot.alt}
            fill
            sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
            className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
          />
        ) : (
          <div aria-hidden="true" className="absolute inset-0 flex items-end justify-between p-5">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,rgba(242,167,195,0.13),transparent_60%)]" />
            <span className="relative font-mono text-[10px] uppercase tracking-[0.35em] text-mist">{cat.label}</span>
            <span className="relative font-jp text-[5.5rem] leading-none text-shiro/[0.07] transition-transform duration-[1.2s] ease-[var(--ease-out-soft)] group-hover:-translate-y-2 group-hover:text-sakura/20">
              {cat.kanji}
            </span>
          </div>
        )}
        <span
          aria-hidden="true"
          className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-sakura/40 bg-ink/80 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-sakura opacity-0 transition-all duration-500 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 -translate-y-1 [@media(hover:none)]:translate-y-0"
        >
          Explore <span className="text-[12px] leading-none">+</span>
        </span>
        {p.pinned && (
          <span className="absolute left-4 top-4 rounded-full bg-ink/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-sakura">
            Pinned
          </span>
        )}
      </div>

      <div className="relative z-10 flex flex-1 flex-col p-6" style={{ transform: "translateZ(24px)" }}>
        <h3 className="font-display text-[1.75rem] font-light leading-tight text-shiro">
          <button
            type="button"
            onClick={() => onExplore(p)}
            onFocus={prefetch}
            aria-haspopup="dialog"
            className="text-left after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {p.title}
            <span className="sr-only">: explore project details</span>
          </button>
        </h3>
        <p className={`mt-3 flex-1 text-[14px] leading-relaxed ${p.description ? "text-mist" : "italic text-mist"}`}>
          {p.description ?? "No description yet."}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] text-mist">
          {p.language && (
            <span className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="size-2 rounded-full"
                style={{ background: LANG_COLORS[p.language] ?? "var(--color-sakura)" }}
              />
              {p.language}
            </span>
          )}
          {p.url && (
            <span className="flex items-center gap-1.5" aria-label={`${p.stars} stars`}>
              <span aria-hidden="true" className="text-sakura">
                ★
              </span>
              {p.stars}
            </span>
          )}
          {p.pushedAt && <span>{dateFmt.format(new Date(p.pushedAt))}</span>}

          <span className="relative z-30 ml-auto flex gap-4">
            {p.url && (
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-shiro/80 transition-colors hover:text-sakura"
              >
                Code ↗<span className="sr-only"> for {p.title} (opens in a new tab)</span>
              </a>
            )}
            {p.homepage && (
              <a
                href={p.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="text-shiro/80 transition-colors hover:text-sakura"
              >
                Live ↗<span className="sr-only"> for {p.title} (opens in a new tab)</span>
              </a>
            )}
          </span>
        </div>
      </div>
    </motion.article>
  );
}
