"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Blossom } from "@/components/ui/Sakura";
import { seeded } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const W = 140;

type Twig = { d: string; at: number };
type Bloom = { x: number; y: number; s: number; r: number; at: number };

/** Procedurally grow a branch for a given height. Deterministic per height bucket. */
function grow(height: number) {
  const rand = seeded(Math.round(height / 200));
  const trunkX = 104;
  const step = 180;
  const pts: [number, number][] = [[trunkX, 0]];
  for (let y = step; y < height; y += step) pts.push([trunkX + (rand() - 0.5) * 36, y]);
  pts.push([trunkX - 6, height]);

  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1];
    const [x, y] = pts[i];
    d += `C${px} ${py + step * 0.5} ${x} ${y - step * 0.5} ${x} ${y}`;
  }

  const twigs: Twig[] = [];
  const blooms: Bloom[] = [];
  for (let i = 1; i < pts.length - 1; i++) {
    if (rand() < 0.3) continue;
    const [x, y] = pts[i];
    const len = 40 + rand() * 50;
    const ex = x - len;
    const ey = y + 30 + rand() * 50;
    twigs.push({ d: `M${x} ${y}C${x - len * 0.3} ${y + 4} ${ex + 10} ${ey - 20} ${ex} ${ey}`, at: y / height });
    blooms.push({ x: ex, y: ey, s: 0.9 + rand() * 0.6, r: rand() * 72, at: ey / height });
    if (rand() > 0.4) {
      blooms.push({ x: x - len * 0.45, y: y + 10 + rand() * 12, s: 0.5 + rand() * 0.4, r: rand() * 72, at: y / height });
    }
    if (rand() > 0.6) blooms.push({ x: x + 6, y: y + 40, s: 0.45, r: rand() * 72, at: (y + 40) / height });
  }
  return { d, twigs, blooms };
}

/**
 * A branch that grows down the page as you scroll, sprouting twigs and
 * opening blossoms as the growth tip passes them. Desktop only (lg+).
 */
export function BranchGrowth() {
  const root = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const [height, setHeight] = useState(0);
  const shape = useMemo(() => (height ? grow(height) : null), [height]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const h = Math.round(e.contentRect.height);
      // Re-grow only on meaningful changes, to avoid churn while content loads.
      setHeight((prev) => (Math.abs(prev - h) > 120 ? h : prev));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const s = svg.current;
    if (!s || !shape) return;
    const trunk = s.querySelector<SVGPathElement>(".trunk")!;
    const twigs = Array.from(s.querySelectorAll<SVGPathElement>(".twig"));
    const blooms = Array.from(s.querySelectorAll<SVGGElement>(".branch-bloom"));
    const tip = s.querySelector<SVGCircleElement>(".tip")!;
    const length = trunk.getTotalLength();

    const render = (p: number) => {
      trunk.style.strokeDashoffset = String(1 - p);
      const pt = trunk.getPointAtLength(length * p);
      tip.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
      tip.style.opacity = p > 0.002 && p < 0.998 ? "1" : "0";
      twigs.forEach((t, i) => {
        const local = Math.min(1, Math.max(0, (p - shape.twigs[i].at) / 0.03));
        t.style.strokeDashoffset = String(1 - local);
      });
      blooms.forEach((b, i) => b.classList.toggle("open", p > shape.blooms[i].at + 0.012));
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      render(1);
      return;
    }

    render(0);
    const st = ScrollTrigger.create({
      trigger: root.current,
      start: "top 65%",
      end: "bottom bottom",
      scrub: 0.8,
      onUpdate: (self) => render(self.progress),
    });
    return () => st.kill();
  }, [shape]);

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="pointer-events-none absolute bottom-0 right-0 top-0 z-0 hidden w-[140px] lg:block xl:right-[2vw]"
    >
      {shape && (
        <svg ref={svg} width={W} height={height} viewBox={`0 0 ${W} ${height}`} className="overflow-visible">
          <path
            className="trunk"
            d={shape.d}
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset="1"
            fill="none"
            stroke="var(--color-shiro)"
            strokeOpacity="0.22"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          {shape.twigs.map((t, i) => (
            <path
              key={i}
              className="twig"
              d={t.d}
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset="1"
              fill="none"
              stroke="var(--color-shiro)"
              strokeOpacity="0.18"
              strokeWidth="1"
              strokeLinecap="round"
            />
          ))}
          {shape.blooms.map((b, i) => (
            <g key={i} transform={`translate(${b.x} ${b.y}) rotate(${b.r}) scale(${b.s})`}>
              <Blossom className="branch-bloom" fill="var(--color-sakura)" opacity="0.85" />
            </g>
          ))}
          <circle className="tip" r="3" fill="var(--color-sakura)" style={{ filter: "drop-shadow(0 0 6px var(--color-sakura))" }} />
        </svg>
      )}
    </div>
  );
}
