"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { site } from "@/config/site";
import { useIntroDone } from "@/lib/hooks";
import { Magnetic } from "@/components/ui/Magnetic";
import { scrollToTarget, useLenis } from "@/components/providers/SmoothScroll";
import { PetalCanvas } from "./PetalCanvas";
import { BrushName } from "./BrushName";
import { RoleRotator } from "./RoleRotator";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Hero() {
  const intro = useIntroDone();
  const lenis = useLenis();
  const root = useRef<HTMLElement>(null);

  // Scroll-out: content drifts up and dissolves; the ring sinks slower (parallax).
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const st = { trigger: root.current, start: "top top", end: "bottom top", scrub: true };
        gsap.to(".hero-content", { yPercent: -18, opacity: 0, ease: "none", scrollTrigger: st });
        gsap.to(".hero-ring", { yPercent: 30, ease: "none", scrollTrigger: st });
        gsap.to(".hero-side", { yPercent: -60, ease: "none", scrollTrigger: st });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const jump = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    scrollToTarget(lenis, href);
  };

  return (
    <section
      ref={root}
      id="top"
      aria-labelledby="hero-title"
      className="relative flex h-[100svh] min-h-[600px] flex-col overflow-hidden"
      data-revealed={intro || undefined}
    >
      <PetalCanvas />

      {/* Atmosphere */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(242,167,195,0.10),transparent_55%),radial-gradient(ellipse_at_10%_100%,rgba(184,67,63,0.08),transparent_50%)]"
      />
      <div
        aria-hidden="true"
        className="hero-ring pointer-events-none absolute right-[-18vmin] top-[8vh] size-[min(78vmin,720px)] rounded-full border border-sakura/15"
      >
        <div className="absolute inset-[9%] rounded-full border border-shiro/5" />
      </div>
      <p
        aria-hidden="true"
        className="hero-side vertical pointer-events-none absolute left-4 top-1/2 hidden -translate-y-1/2 text-[13px] text-shiro/25 md:block lg:left-8"
      >
        開発者　·　桜
      </p>

      <div className="hero-content relative mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-end px-5 pb-28 pt-28 sm:px-8 md:px-16 md:pb-32">
        <p
          data-reveal
          style={{ transitionDelay: "0.1s" }}
          className="mb-6 flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.35em] text-mist md:mb-2"
        >
          <span className="h-px w-10 bg-sakura/60" aria-hidden="true" />
          {site.handle}
          <span className="font-jp tracking-[0.4em] text-sakura/80" aria-hidden="true">
            開発者
          </span>
        </p>

        <h1 id="hero-title" className="sr-only">
          {site.name}: developer of {site.roles.join(", ")}
        </h1>

        <div className="relative flex items-start gap-3 sm:gap-6">
          <div className="w-full max-w-[min(100%,860px)]">
            <BrushName name={site.name} />
          </div>
          <span
            data-reveal
            style={{ transitionDelay: "1.1s" }}
            aria-hidden="true"
            className="vertical mt-[2%] shrink-0 text-[11px] text-sakura sm:text-sm"
          >
            {site.nameJp}
          </span>
        </div>

        <div className="mt-6 grid gap-10 md:mt-4 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p
              data-reveal
              style={{ transitionDelay: "0.9s" }}
              className="font-display text-[clamp(1.6rem,3.6vw,2.8rem)] font-light leading-tight text-shiro"
            >
              I build <RoleRotator roles={site.roles} />
            </p>
            <p
              data-reveal
              style={{ transitionDelay: "1.05s" }}
              className="mt-3 max-w-md text-[15px] leading-relaxed text-mist"
            >
              Across the stack and across platforms, with clean architecture, smooth performance and
              polish in the details.
            </p>
          </div>

          <div data-reveal style={{ transitionDelay: "1.2s" }} className="flex flex-wrap gap-3">
            <Magnetic>
              <a
                href="#projects"
                onClick={(e) => jump(e, "#projects")}
                className="group relative inline-flex h-12 items-center gap-3 overflow-hidden rounded-full bg-sakura px-6 text-[14px] font-medium text-ink"
              >
                <span className="absolute inset-0 translate-y-full rounded-full bg-shiro transition-transform duration-500 ease-[var(--ease-ink)] group-hover:translate-y-0" />
                <span className="relative">View projects</span>
                <span aria-hidden="true" className="relative transition-transform duration-500 group-hover:translate-x-1">
                  →
                </span>
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href="#contact"
                onClick={(e) => jump(e, "#contact")}
                className="inline-flex h-12 items-center rounded-full border border-line px-6 text-[14px] text-shiro transition-colors duration-500 hover:border-sakura/60"
              >
                Say hello
              </a>
            </Magnetic>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <a
        href="#about"
        onClick={(e) => jump(e, "#about")}
        data-reveal
        style={{ transitionDelay: "1.4s" }}
        className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 text-mist md:bottom-8"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.4em]">Scroll</span>
        <span aria-hidden="true" className="relative h-12 w-px overflow-hidden bg-line">
          <span className="absolute inset-x-0 top-0 h-1/3 animate-[scroll-drop_2.2s_var(--ease-ink)_infinite] bg-sakura" />
        </span>
        <span className="sr-only">to the About section</span>
      </a>
    </section>
  );
}
