"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/hooks";

/**
 * Cycles through roles. All roles share one grid cell so the line reserves
 * the width of the longest one, so there is no layout shift.
 */
export function RoleRotator({ roles }: { roles: readonly string[] }) {
  const [i, setI] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % roles.length), 2600);
    return () => window.clearInterval(id);
  }, [roles.length, reduced]);

  return (
    <span className="relative inline-grid align-baseline">
      {/* Width reservers (invisible, not read out). */}
      {roles.map((r) => (
        <span key={r} aria-hidden="true" className="invisible col-start-1 row-start-1 whitespace-nowrap">
          {r}
        </span>
      ))}
      <span className="sr-only">{roles.join(", ")}</span>
      <span aria-hidden="true" className="col-start-1 row-start-1 overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={roles[i]}
            className="block whitespace-nowrap text-sakura"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.75, ease: [0.7, 0, 0.2, 1] }}
          >
            {roles[i]}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}
