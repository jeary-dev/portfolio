"use client";

import { motion } from "motion/react";

const draw = (play: boolean, delay: number, duration = 0.9) => ({
  initial: false as const,
  animate: { pathLength: play ? 1 : 0, opacity: play ? 1 : 0 },
  transition: { pathLength: { duration, delay: play ? delay : 0, ease: [0.7, 0, 0.2, 1] as const }, opacity: { duration: 0.01, delay: play ? delay : 0 } },
});

const block = (play: boolean, delay: number) => ({
  initial: false as const,
  animate: { scaleX: play ? 1 : 0, opacity: play ? 1 : 0 },
  style: { transformBox: "fill-box" as const, transformOrigin: "left center" },
  transition: { duration: 0.7, delay: play ? delay : 0, ease: [0.22, 1, 0.36, 1] as const },
});

/** Web: a browser window draws itself, then the page lays out inside it. */
export function BrowserDraw({ play }: { play: boolean }) {
  return (
    <svg viewBox="0 0 320 220" className="w-[min(340px,78vw)]" aria-hidden="true" fill="none">
      <motion.rect x="2" y="2" width="316" height="216" rx="10" stroke="var(--color-shiro)" strokeOpacity="0.5" strokeWidth="1.2" {...draw(play, 0, 1.2)} />
      <motion.path d="M2 34H318" stroke="var(--color-shiro)" strokeOpacity="0.3" {...draw(play, 0.7, 0.6)} />
      {[18, 32, 46].map((cx, i) => (
        <motion.circle
          key={cx}
          cx={cx}
          cy="18"
          r="4"
          fill={i === 0 ? "var(--color-beni)" : "var(--color-charcoal)"}
          initial={false}
          animate={{ scale: play ? 1 : 0 }}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
          transition={{ type: "spring", stiffness: 300, damping: 15, delay: play ? 0.9 + i * 0.08 : 0 }}
        />
      ))}
      <motion.rect x="70" y="11" width="180" height="14" rx="7" fill="var(--color-charcoal)" {...block(play, 1.05)} />
      <motion.rect x="24" y="56" width="150" height="16" rx="2" fill="var(--color-shiro)" fillOpacity="0.85" {...block(play, 1.25)} />
      <motion.rect x="24" y="80" width="110" height="16" rx="2" fill="var(--color-sakura)" {...block(play, 1.35)} />
      <motion.rect x="24" y="108" width="128" height="5" rx="2" fill="var(--color-mist)" fillOpacity="0.6" {...block(play, 1.45)} />
      <motion.rect x="24" y="119" width="100" height="5" rx="2" fill="var(--color-mist)" fillOpacity="0.6" {...block(play, 1.5)} />
      <motion.rect x="24" y="140" width="64" height="20" rx="10" fill="var(--color-sakura)" {...block(play, 1.6)} />
      <motion.rect x="190" y="56" width="106" height="104" rx="4" fill="var(--color-sakura)" fillOpacity="0.12" stroke="var(--color-sakura)" strokeOpacity="0.4" {...block(play, 1.4)} />
      {[0, 1, 2].map((i) => (
        <motion.rect key={i} x={24 + i * 94} y="178" width="84" height="26" rx="3" fill="var(--color-charcoal)" {...block(play, 1.75 + i * 0.08)} />
      ))}
    </svg>
  );
}
