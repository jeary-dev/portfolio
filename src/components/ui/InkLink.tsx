"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & { external?: boolean };

/**
 * Link with an ink-ripple hover: a soft pink drop blooms from the exact point
 * the cursor enters, and a hairline underline sweeps through.
 * Uses WAAPI on transform/opacity only.
 */
export function InkLink({ className, children, external, onPointerEnter, ...rest }: Props) {
  const drop = useRef<HTMLSpanElement>(null);

  return (
    <a
      {...rest}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn("ink-link", className)}
      onPointerEnter={(e) => {
        onPointerEnter?.(e);
        const d = drop.current;
        if (!d || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const r = e.currentTarget.getBoundingClientRect();
        d.style.left = `${e.clientX - r.left}px`;
        d.style.top = `${e.clientY - r.top}px`;
        d.animate(
          [
            { transform: "scale(0)", opacity: 1 },
            { transform: "scale(2.6)", opacity: 0 },
          ],
          { duration: 800, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
        );
      }}
    >
      <span ref={drop} className="ink-drop" aria-hidden="true" />
      {children}
      <span className="ink-underline" aria-hidden="true" />
      {external && <span className="sr-only"> (opens in a new tab)</span>}
    </a>
  );
}
