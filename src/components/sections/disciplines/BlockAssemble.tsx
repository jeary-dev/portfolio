"use client";

import { motion } from "motion/react";
import { seeded } from "@/lib/utils";

const S = 34;
const A = S * 0.866;
const H = S * 0.5;

const rand = seeded(9);
const CUBES: { i: number; j: number; k: number; dx: number; dy: number; rot: number }[] = [];
for (let k = 0; k < 2; k++)
  for (let i = 0; i < 2; i++)
    for (let j = 0; j < 2; j++)
      CUBES.push({ i, j, k, dx: (rand() - 0.5) * 140, dy: -90 - rand() * 80, rot: (rand() - 0.5) * 90 });
// Painter's order: back to front, bottom to top.
CUBES.sort((a, b) => a.k - b.k || a.i + a.j - (b.i + b.j));

/** Minecraft: eight blocks fall and lock into a cube; the plugin "loads". */
export function BlockAssemble({ play }: { play: boolean }) {
  return (
    <div className="flex flex-col items-center gap-6">
      <svg viewBox="-110 -70 220 200" className="w-[min(240px,70vw)] overflow-visible" aria-hidden="true">
        {CUBES.map((c, n) => {
          const x = (c.i - c.j) * A;
          const y = (c.i + c.j) * H - c.k * S;
          return (
            <motion.g
              key={`${c.i}${c.j}${c.k}`}
              initial={false}
              animate={
                play
                  ? { x, y, opacity: 1, rotate: 0 }
                  : { x: x + c.dx, y: y + c.dy, opacity: 0, rotate: c.rot }
              }
              transition={{ type: "spring", stiffness: 140, damping: 16, delay: play ? 0.15 + n * 0.11 : 0 }}
            >
              <path d={`M0 0L${A} ${H}L0 ${2 * H}L${-A} ${H}Z`} fill="#3a2530" stroke="var(--color-sakura)" strokeOpacity="0.55" strokeWidth="0.8" />
              <path d={`M${-A} ${H}L0 ${2 * H}L0 ${2 * H + S}L${-A} ${H + S}Z`} fill="#1d1a22" stroke="var(--color-sakura)" strokeOpacity="0.3" strokeWidth="0.8" />
              <path d={`M${A} ${H}L0 ${2 * H}L0 ${2 * H + S}L${A} ${H + S}Z`} fill="#26222c" stroke="var(--color-sakura)" strokeOpacity="0.3" strokeWidth="0.8" />
            </motion.g>
          );
        })}
      </svg>
      <motion.p
        className="flex items-center gap-2 rounded-full border border-line bg-ink/60 px-4 py-1.5 font-mono text-[11px] text-mist"
        initial={false}
        animate={{ opacity: play ? 1 : 0, y: play ? 0 : 10 }}
        transition={{ delay: play ? 1.3 : 0, duration: 0.6 }}
      >
        <span className="size-1.5 rounded-full bg-sakura" />
        config.yml reloaded
      </motion.p>
    </div>
  );
}
