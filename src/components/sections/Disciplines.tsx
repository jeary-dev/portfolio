"use client";

import { useInView } from "motion/react";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { disciplines } from "@/config/site";
import type { Category } from "@/config/projects";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useReducedMotion } from "@/lib/hooks";
import { BlockAssemble } from "./disciplines/BlockAssemble";
import { BotTyping } from "./disciplines/BotTyping";
import { BrowserDraw } from "./disciplines/BrowserDraw";
import { PhoneUnfold } from "./disciplines/PhoneUnfold";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const VIGNETTES: Record<Exclude<Category, "other">, React.ComponentType<{ play: boolean }>> = {
  minecraft: BlockAssemble,
  discord: BotTyping,
  web: BrowserDraw,
  apps: PhoneUnfold,
};

function Panel({ d }: { d: (typeof disciplines)[number] }) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { amount: 0.5, once: true });
  const reduced = useReducedMotion();
  const Vignette = VIGNETTES[d.id as keyof typeof VIGNETTES];

  return (
    <li
      ref={ref}
      className="panel group relative grid shrink-0 overflow-hidden rounded-sm border border-line bg-sumi lg:min-h-[520px] lg:grid-cols-[1fr_1.1fr] lg:motion-safe:h-[min(72vh,620px)] lg:motion-safe:w-[min(78vw,1040px)]"
    >
      <div className="relative z-10 flex flex-col justify-between gap-10 p-7 sm:p-10 md:p-12">
        <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.35em] text-mist">
          <span>
            <span className="text-sakura">{d.index}</span> / 04
          </span>
          <span className="vertical text-sm text-sakura/70 lg:hidden" aria-hidden="true">
            {d.kanji}
          </span>
        </div>
        <div>
          <h3 className="font-display text-[clamp(2.2rem,4.5vw,4rem)] font-light leading-none text-shiro">{d.title}</h3>
          <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-mist">{d.body}</p>
        </div>
      </div>
      <div className="relative flex min-h-[300px] items-center justify-center border-t border-line bg-ink/40 p-8 lg:border-l lg:border-t-0">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-6 top-4 hidden select-none font-jp text-[9rem] leading-none text-shiro/[0.035] lg:block"
        >
          {d.kanji}
        </span>
        <Vignette play={inView || reduced} />
      </div>
    </li>
  );
}

/**
 * Four discipline panels. On large screens the section pins and the panels
 * travel horizontally with scroll; elsewhere they stack.
 */
export function Disciplines() {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  // Sticky (not ScrollTrigger pin) keeps this free of layout shift: the
  // outer wrapper gets the scroll length, the inner stage sticks, and the
  // track's x is scrubbed from the wrapper's scroll progress.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const t = track.current!;
        const outer = pin.current!;
        const distance = () => Math.max(0, t.scrollWidth - window.innerWidth + 64);
        const size = () => {
          outer.style.height = `${distance() + window.innerHeight}px`;
        };
        size();
        ScrollTrigger.addEventListener("refreshInit", size);
        gsap.to(t, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: outer,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.7,
            invalidateOnRefresh: true,
            onUpdate: (self) => gsap.set(bar.current, { scaleX: self.progress }),
          },
        });
        return () => {
          ScrollTrigger.removeEventListener("refreshInit", size);
          outer.style.height = "";
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section id="work" ref={root} aria-labelledby="work-title" className="relative z-[1] py-28 md:py-40 lg:pb-0">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 md:px-16 lg:pr-36">
        <SectionHeading id="work-title" index="02" label="What I build" kanji="仕事" title="Four crafts, one standard." />
      </div>

      <div ref={pin} className="relative">
        <div className="lg:motion-safe:sticky lg:motion-safe:top-0 lg:motion-safe:flex lg:motion-safe:h-screen lg:motion-safe:flex-col lg:motion-safe:justify-center lg:motion-safe:overflow-hidden">
        <ul
          ref={track}
          className="flex flex-col gap-6 px-5 sm:px-8 md:px-16 lg:pr-36 lg:motion-safe:w-max lg:motion-safe:flex-row lg:motion-safe:gap-10 lg:motion-safe:pl-16 lg:motion-safe:pr-[10vw]"
        >
          {disciplines.map((d) => (
            <Panel key={d.id} d={d} />
          ))}
        </ul>
        <div className="mx-16 mt-10 hidden h-px bg-line lg:motion-safe:block" aria-hidden="true">
          <div ref={bar} className="h-full origin-left scale-x-0 bg-sakura" />
        </div>
        </div>
      </div>
    </section>
  );
}
