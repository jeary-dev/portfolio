"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useIntroDone, useReducedMotion } from "@/lib/hooks";
import { StaticPetals } from "./StaticPetals";

// three.js + R3F are only fetched after the intro, in an idle slot.
const PetalField = dynamic(() => import("./PetalField"), { ssr: false });

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Hero background. Shows a static petal composition first (and permanently
 * under reduced motion / no WebGL), then fades in the GPU petal field.
 * The field stops rendering when the hero leaves the viewport or the tab hides.
 */
export function PetalCanvas() {
  const intro = useIntroDone();
  const reduced = useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const [mountField, setMountField] = useState(false);
  const [count, setCount] = useState(0);
  const [ready, setReady] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);

  useEffect(() => {
    if (!intro || reduced || !webglAvailable()) return;
    const mobile = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
    const lowPower = (navigator.hardwareConcurrency ?? 8) <= 4;
    const n = mobile ? 160 : lowPower ? 320 : 650;
    const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const id = ric(() => {
      setCount(n);
      setMountField(true);
    });
    return () => cancel(id);
  }, [intro, reduced]);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { rootMargin: "50px" });
    io.observe(el);
    const onVis = () => setTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const showField = mountField && !reduced;

  return (
    <div ref={wrap} id="hero-canvas" className="absolute inset-0" aria-hidden="true">
      <div
        className="absolute inset-0 transition-opacity duration-[1600ms]"
        style={{ opacity: showField && ready ? 0 : 1 }}
      >
        <StaticPetals />
      </div>
      {showField && (
        <div
          className="absolute inset-0 transition-opacity duration-[1600ms]"
          style={{ opacity: ready ? 1 : 0 }}
        >
          <PetalField count={count} active={onScreen && tabVisible} onReady={() => setReady(true)} />
        </div>
      )}
    </div>
  );
}
