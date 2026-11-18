"use client";

import { motion } from "motion/react";
import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * An ink-brush stroke: tapered ends, dry-brush texture from a static
 * turbulence filter. It sweeps in with scaleX (transform only).
 */
export function BrushDivider({ className, tone = "shiro" }: { className?: string; tone?: "shiro" | "sakura" | "beni" }) {
  const id = useId().replace(/:/g, "");
  const color =
    tone === "sakura" ? "var(--color-sakura)" : tone === "beni" ? "var(--color-beni)" : "var(--color-shiro)";

  return (
    <motion.div
      aria-hidden="true"
      className={cn("pointer-events-none origin-left", className)}
      initial={{ scaleX: 0, opacity: 0 }}
      whileInView={{ scaleX: 1, opacity: 1 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1.4, ease: [0.7, 0, 0.2, 1] }}
    >
      <svg viewBox="0 0 600 24" preserveAspectRatio="none" className="h-3 w-full md:h-4">
        <defs>
          <filter id={`brush-${id}`} x="-2%" y="-50%" width="104%" height="200%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9 0.08" numOctaves="2" seed="7" />
            <feDisplacementMap in="SourceGraphic" scale="5" />
          </filter>
        </defs>
        <path
          filter={`url(#brush-${id})`}
          fill={color}
          opacity="0.75"
          d="M2 13C40 9 90 7.5 160 8.2S330 10 420 9.4S560 8 598 11.2C560 14 470 15.6 380 15.2S200 14.6 120 15.4S30 17 2 13Z"
        />
      </svg>
    </motion.div>
  );
}
