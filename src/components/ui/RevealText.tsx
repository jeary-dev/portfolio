"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

type Tag = "p" | "h2" | "h3" | "div" | "blockquote";

/**
 * Reveals text line by line as it scrolls into view. Lines are measured after
 * fonts load and re-split on resize (autoSplit). Static under reduced motion.
 */
export function RevealText({
  as: Tag = "p",
  children,
  className,
  delay = 0,
  stagger = 0.09,
  id,
}: {
  id?: string;
  as?: Tag;
  children: React.ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      let played = false;
      const split = SplitText.create(el, {
        type: "lines",
        mask: "lines",
        linesClass: "reveal-line",
        // Line-only splits keep words intact, so the text stays readable as-is.
        aria: "none",
        autoSplit: true,
        onSplit(self) {
          if (played) return;
          return gsap.from(self.lines, {
            yPercent: 110,
            opacity: 0,
            duration: 1.1,
            ease: "expo.out",
            stagger,
            delay,
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
            onComplete: () => {
              played = true;
            },
          });
        },
      });
      return () => split.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref as never} id={id} className={className}>
      {children}
    </Tag>
  );
}
