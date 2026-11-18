"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { PETAL_PATH } from "@/components/ui/Sakura";
import { useFinePointer, useReducedMotion } from "@/lib/hooks";

const TRAIL = 14;

/**
 * Custom cursor: a sakura dot, a lagging ring that swells over interactive
 * elements, and a trail of petals shed as you move. Fine pointers only;
 * everything moves with transform/opacity (gsap.quickTo + WAAPI).
 */
export function Cursor() {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const enabled = fine && !reduced;
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const trail = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const d = dot.current!;
    const r = ring.current!;
    const petals = Array.from(trail.current!.children) as HTMLElement[];
    const html = document.documentElement;
    html.classList.add("has-cursor");

    gsap.set([d, r], { xPercent: -50, yPercent: -50, opacity: 0 });
    const dx = gsap.quickTo(d, "x", { duration: 0.12, ease: "power3" });
    const dy = gsap.quickTo(d, "y", { duration: 0.12, ease: "power3" });
    const rx = gsap.quickTo(r, "x", { duration: 0.5, ease: "power3" });
    const ry = gsap.quickTo(r, "y", { duration: 0.5, ease: "power3" });

    let lastX = 0;
    let lastY = 0;
    let next = 0;
    let visible = false;
    let hovering = false;

    const shed = (x: number, y: number, vx: number, vy: number) => {
      const p = petals[next];
      next = (next + 1) % petals.length;
      const rot = Math.random() * 360;
      const drift = 20 + Math.random() * 30;
      p.animate(
        [
          { transform: `translate(${x}px, ${y}px) rotate(${rot}deg) scale(1)`, opacity: 0.85 },
          {
            transform: `translate(${x - vx * 0.25 + (Math.random() - 0.5) * 30}px, ${y + drift - vy * 0.2}px) rotate(${rot + 160}deg) scale(0.3)`,
            opacity: 0,
          },
        ],
        { duration: 900 + Math.random() * 400, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" },
      );
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (!visible) {
        visible = true;
        gsap.to([d, r], { opacity: 1, duration: 0.3 });
        lastX = e.clientX;
        lastY = e.clientY;
      }
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
      const vx = e.clientX - lastX;
      const vy = e.clientY - lastY;
      if (Math.hypot(vx, vy) > 34) {
        shed(e.clientX, e.clientY, vx, vy);
        lastX = e.clientX;
        lastY = e.clientY;
      }
    };

    const onOver = (e: PointerEvent) => {
      const t = e.target as Element | null;
      const interactive = !!t?.closest("a, button, [role='button'], label, select, [data-cursor]");
      const text = !!t?.closest("input, textarea");
      if (text) {
        gsap.to([d, r], { opacity: 0, duration: 0.2 });
      } else if (visible) {
        gsap.to([d, r], { opacity: 1, duration: 0.2 });
      }
      if (interactive !== hovering) {
        hovering = interactive;
        gsap.to(r, { scale: interactive ? 1.7 : 1, duration: 0.45, ease: "power3.out" });
        gsap.to(d, { scale: interactive ? 0.4 : 1, duration: 0.3 });
        r.dataset.hover = String(interactive);
      }
    };

    const onLeave = () => {
      visible = false;
      gsap.to([d, r], { opacity: 0, duration: 0.3 });
    };
    const onDown = () => gsap.to(r, { scale: hovering ? 1.4 : 0.8, duration: 0.2 });
    const onUp = () => gsap.to(r, { scale: hovering ? 1.7 : 1, duration: 0.3 });

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("pointerleave", onLeave);

    return () => {
      html.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[150]">
      <div ref={trail}>
        {Array.from({ length: TRAIL }, (_, i) => (
          <svg
            key={i}
            viewBox="-6 -11 12 12"
            className="absolute left-0 top-0 size-3 -translate-x-1/2 -translate-y-1/2 opacity-0 will-change-transform"
          >
            <path d={PETAL_PATH} fill="var(--color-sakura)" />
          </svg>
        ))}
      </div>
      <div
        ref={ring}
        className="absolute left-0 top-0 size-9 rounded-full border border-sakura/50 transition-[background-color,border-color] duration-300 data-[hover=true]:border-sakura data-[hover=true]:bg-sakura/10"
      />
      <div ref={dot} className="absolute left-0 top-0 size-1.5 rounded-full bg-sakura" />
    </div>
  );
}
