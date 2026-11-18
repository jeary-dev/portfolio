import type { SVGProps } from "react";

/** One notched sakura petal, base at (0,0), tip pointing up to y = -10. */
export const PETAL_PATH =
  "M0 0C-4.2-1.8-5.8-6.6-2.4-10L0-8.4L2.4-10C5.8-6.6 4.2-1.8 0 0Z";

/** A five-petal blossom centred on (0,0), radius ≈ 10. */
export function Blossom({
  fill = "var(--color-sakura)",
  center = "var(--color-beni)",
  ...props
}: SVGProps<SVGGElement> & { fill?: string; center?: string }) {
  return (
    <g {...props}>
      {[0, 72, 144, 216, 288].map((r) => (
        <path key={r} d={PETAL_PATH} transform={`rotate(${r})`} fill={fill} />
      ))}
      <circle r="1.6" fill={center} />
    </g>
  );
}

/** Standalone petal as an <svg>, for DOM-based effects (cursor trail, footer). */
export function PetalSvg(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="-6 -11 12 12" aria-hidden="true" {...props}>
      <path d={PETAL_PATH} fill="currentColor" />
    </svg>
  );
}

/** Red hanko seal with a kanji. */
export function Hanko({ char = "桜", className }: { char?: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-grid place-items-center rounded-[3px] bg-beni font-jp text-ink ${className ?? ""}`}
    >
      {char}
    </span>
  );
}
