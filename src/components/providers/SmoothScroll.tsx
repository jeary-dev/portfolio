"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const LenisContext = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisContext);

/** Scroll to an anchor or element using Lenis when active, native otherwise. */
export function scrollToTarget(lenis: Lenis | null, target: string | HTMLElement) {
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (!el) return;
  if (lenis) {
    lenis.scrollTo(el, { duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
  } else {
    el.scrollIntoView({ behavior: "auto", block: "start" });
  }
  // Move focus for keyboard and screen-reader users without a second scroll jump.
  if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
}

/**
 * Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger and Lenis
 * share a single rAF loop. Disabled entirely under prefers-reduced-motion.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const tickerRef = useRef<((time: number) => void) | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let instance: Lenis | null = null;

    const start = () => {
      instance = new Lenis({ lerp: 0.1, wheelMultiplier: 1, anchors: false });
      instance.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => instance?.raf(time * 1000);
      tickerRef.current = tick;
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      setLenis(instance);
    };
    const stop = () => {
      if (tickerRef.current) gsap.ticker.remove(tickerRef.current);
      instance?.destroy();
      instance = null;
      setLenis(null);
    };

    if (!reduced.matches) start();
    const onChange = () => (reduced.matches ? stop() : start());
    reduced.addEventListener("change", onChange);

    // Fonts change text metrics; re-measure pinned/scrubbed sections afterwards.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      reduced.removeEventListener("change", onChange);
      stop();
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
