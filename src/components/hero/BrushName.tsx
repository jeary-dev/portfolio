"use client";

import { useEffect, useId, useRef } from "react";
import { gsap } from "gsap";
import { useIntroDone } from "@/lib/hooks";

/**
 * The name, revealed by brush strokes: thick strokes with ragged ink edges
 * draw across an SVG mask, while a blurred pink copy blooms and fades
 * behind it like ink bleeding into paper.
 */
export function BrushName({ name }: { name: string }) {
  const intro = useIntroDone();
  const root = useRef<SVGSVGElement>(null);
  const uid = useId().replace(/:/g, "");

  // The name paints fully on first load (beneath the loader) so it counts as
  // the LCP immediately; once hydrated, still hidden by the loader, the mask
  // is wiped clean so the reveal can draw it back in.
  useEffect(() => {
    const svg = root.current;
    if (!svg || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!document.querySelector('.loader:not([data-state="done"])')) return;
    gsap.set(svg.querySelectorAll(".brush-stroke"), { strokeDashoffset: 1 });
  }, []);

  useEffect(() => {
    const svg = root.current;
    if (!svg || !intro) return;
    const strokes = svg.querySelectorAll(".brush-stroke");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(strokes, { strokeDashoffset: 0 });
      return;
    }
    const tl = gsap.timeline({ delay: 0.15 });
    tl.fromTo(
      strokes,
      { strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration: 0.95, ease: "power2.inOut", stagger: 0.22 },
    )
      .fromTo(
        svg.querySelector(".ink-bleed"),
        { opacity: 0, scale: 0.98 },
        { opacity: 0.55, scale: 1.02, duration: 0.6, ease: "power2.out", transformOrigin: "50% 50%" },
        0.2,
      )
      .to(svg.querySelector(".ink-bleed"), { opacity: 0, duration: 1.4, ease: "power2.inOut" }, ">-0.1");
    return () => {
      tl.kill();
    };
  }, [intro]);

  const text = (props: React.SVGProps<SVGTextElement>) => (
    <text
      x="400"
      y="205"
      textAnchor="middle"
      className="font-display"
      fontStyle="italic"
      fontWeight={300}
      fontSize="250"
      letterSpacing="-6"
      {...props}
    >
      {name}
    </text>
  );

  return (
    <svg
      ref={root}
      viewBox="110 0 580 280"
      className="h-auto w-full overflow-visible"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <filter id={`rough-${uid}`} filterUnits="userSpaceOnUse" x="0" y="-60" width="800" height="400">
          <feTurbulence type="fractalNoise" baseFrequency="0.035 0.6" numOctaves="2" seed="4" />
          <feDisplacementMap in="SourceGraphic" scale="26" />
        </filter>
        <filter id={`bleed-${uid}`} x="-20%" y="-40%" width="140%" height="180%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <mask id={`mask-${uid}`} maskUnits="userSpaceOnUse" x="40" y="-60" width="720" height="400">
          <g
            filter={`url(#rough-${uid})`}
            fill="none"
            stroke="#fff"
            strokeLinecap="round"
            strokeWidth="132"
          >
            <path className="brush-stroke" pathLength={1} strokeDasharray="1" d="M90 72C260 54 520 50 720 78" />
            <path className="brush-stroke" pathLength={1} strokeDasharray="1" d="M720 160C560 144 280 142 90 168" />
            <path className="brush-stroke" pathLength={1} strokeDasharray="1" d="M90 250C300 236 540 236 720 258" />
          </g>
        </mask>
      </defs>
      <g className="ink-bleed" opacity="0" filter={`url(#bleed-${uid})`} fill="var(--color-sakura)">
        {text({})}
      </g>
      <g mask={`url(#mask-${uid})`} fill="var(--color-shiro)">
        {text({})}
      </g>
    </svg>
  );
}
