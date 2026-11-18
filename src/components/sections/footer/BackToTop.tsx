"use client";

import { Magnetic } from "@/components/ui/Magnetic";
import { scrollToTarget, useLenis } from "@/components/providers/SmoothScroll";

export function BackToTop() {
  const lenis = useLenis();
  return (
    <Magnetic>
      <a
        href="#top"
        onClick={(e) => {
          e.preventDefault();
          scrollToTarget(lenis, "#top");
        }}
        className="group inline-flex size-14 items-center justify-center rounded-full border border-line text-shiro transition-colors duration-500 hover:border-sakura"
      >
        <span aria-hidden="true" className="transition-transform duration-500 group-hover:-translate-y-1">
          ↑
        </span>
        <span className="sr-only">Back to top</span>
      </a>
    </Magnetic>
  );
}
