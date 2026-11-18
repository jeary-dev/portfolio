"use client";

import { useSyncExternalStore } from "react";

function subscribeMedia(query: string) {
  return (cb: () => void) => {
    const mql = window.matchMedia(query);
    mql.addEventListener("change", cb);
    return () => mql.removeEventListener("change", cb);
  };
}

/** SSR-safe media query. Returns `serverValue` during SSR/hydration. */
export function useMediaQuery(query: string, serverValue = false) {
  return useSyncExternalStore(
    subscribeMedia(query),
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

export const useReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)", false);
export const useFinePointer = () => useMediaQuery("(hover: hover) and (pointer: fine)", false);

/* ── Intro (loader) state ─────────────────────────────────────────────────── */

let introDone = false;
const introListeners = new Set<() => void>();

export function markIntroDone() {
  if (introDone) return;
  introDone = true;
  introListeners.forEach((l) => l());
  window.dispatchEvent(new Event("intro:done"));
}

export function useIntroDone() {
  return useSyncExternalStore(
    (cb) => {
      introListeners.add(cb);
      return () => introListeners.delete(cb);
    },
    () => introDone,
    () => false,
  );
}
