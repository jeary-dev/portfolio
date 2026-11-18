"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Blossom } from "@/components/ui/Sakura";
import { markIntroDone } from "@/lib/hooks";
import { useLenis } from "@/components/providers/SmoothScroll";

const BLOSSOMS = [
  { x: 172, y: 58, s: 1.5, r: 10 },
  { x: 128, y: 92, s: 1.1, r: -20 },
  { x: 196, y: 108, s: 0.9, r: 40 },
  { x: 92, y: 132, s: 1.25, r: 15 },
  { x: 150, y: 140, s: 0.75, r: -35 },
  { x: 214, y: 70, s: 0.6, r: 5 },
];

/**
 * Intro: a branch draws itself, blossoms open, then the ink lifts away.
 * Hidden by CSS for no-JS and prefers-reduced-motion users.
 */
export function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const lenisRef = useRef(lenis);

  useEffect(() => {
    lenisRef.current = lenis;
    if (root.current?.dataset.state !== "done") lenis?.stop();
  }, [lenis]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || getComputedStyle(el).display === "none") {
      el.dataset.state = "done";
      markIntroDone();
      return;
    }

    let seen = false;
    try {
      seen = sessionStorage.getItem("intro-seen") === "1";
    } catch {}

    const html = document.documentElement;
    html.style.overflow = "hidden";

    const q = gsap.utils.selector(el);
    const finish = () => {
      el.dataset.state = "done";
      el.style.display = "none";
      html.style.overflow = "";
      lenisRef.current?.start();
      try {
        sessionStorage.setItem("intro-seen", "1");
      } catch {}
    };

    const tl = gsap.timeline({ defaults: { ease: "power3.inOut" }, onComplete: finish });
    tl.set(q(".ld-path"), { strokeDashoffset: 1 })
      .set(q(".ld-bloom"), { scale: 0, rotate: -90, transformOrigin: "50% 50%" })
      .to(q(".ld-path"), { strokeDashoffset: 0, duration: 1.1, stagger: 0.12 })
      .to(
        q(".ld-bloom"),
        { scale: 1, rotate: 0, duration: 0.7, stagger: 0.07, ease: "back.out(1.8)" },
        "-=0.55",
      )
      .to(q(".ld-meta"), { opacity: 1, y: 0, duration: 0.5 }, "<")
      .to(q(".ld-content"), { opacity: 0, y: -24, duration: 0.45, ease: "power2.in" }, "+=0.15")
      .addLabel("wipe")
      .to(q(".ld-ink"), { yPercent: -100, duration: 0.9, ease: "expo.inOut" }, "wipe")
      .to(q(".ld-pink"), { yPercent: -100, duration: 0.9, ease: "expo.inOut" }, "wipe+=0.09")
      .call(markIntroDone, [], "wipe+=0.35");

    if (seen) tl.timeScale(2.4);

    const skip = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") tl.timeScale(5);
    };
    window.addEventListener("keydown", skip);

    return () => {
      window.removeEventListener("keydown", skip);
      tl.kill();
      html.style.overflow = "";
    };
  }, []);

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="loader pointer-events-none fixed inset-0 z-[100] items-center justify-center"
    >
      <div className="ld-pink absolute inset-0 bg-sakura-deep will-change-transform" />
      <div className="ld-ink absolute inset-0 flex items-center justify-center overflow-hidden bg-ink will-change-transform">
        <span className="absolute select-none font-jp text-[min(70vmin,560px)] leading-none text-shiro/[0.035]">
          桜
        </span>
        <div className="ld-content relative flex flex-col items-center gap-8">
          <svg viewBox="0 0 260 200" className="w-[min(62vw,300px)] overflow-visible">
            <g fill="none" stroke="var(--color-shiro)" strokeLinecap="round" opacity="0.85">
              <path
                className="ld-path"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={1}
                strokeWidth="2.4"
                d="M10 196C46 168 70 150 92 132S138 98 172 58S206 22 236 14"
              />
              <path className="ld-path" pathLength={1} strokeDasharray="1" strokeDashoffset={1} strokeWidth="1.4" d="M128 92C136 104 144 124 150 140" />
              <path className="ld-path" pathLength={1} strokeDasharray="1" strokeDashoffset={1} strokeWidth="1.2" d="M172 58C182 74 190 92 196 108" />
              <path className="ld-path" pathLength={1} strokeDasharray="1" strokeDashoffset={1} strokeWidth="1" d="M196 34C202 46 208 58 214 70" />
            </g>
            {BLOSSOMS.map((b, i) => (
              <g key={i} transform={`translate(${b.x} ${b.y}) rotate(${b.r}) scale(${b.s})`}>
                <Blossom className="ld-bloom" />
              </g>
            ))}
          </svg>
          <p className="ld-meta flex translate-y-2 items-center gap-3 font-mono text-[11px] uppercase tracking-[0.35em] text-mist opacity-0">
            <span>jeary-dev</span>
            <span className="h-px w-8 bg-line" />
            <span className="font-jp tracking-[0.5em]">開花</span>
          </p>
        </div>
      </div>
    </div>
  );
}
