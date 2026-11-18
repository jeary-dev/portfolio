import { PETAL_PATH } from "@/components/ui/Sakura";
import { seeded } from "@/lib/utils";

const rand = seeded(42);
const PETALS = Array.from({ length: 26 }, () => ({
  x: rand() * 100,
  y: rand() * 100,
  r: rand() * 360,
  s: 0.6 + rand() * 1.4,
  o: 0.25 + rand() * 0.55,
}));

/** Calm, static petal composition: the poster frame and reduced-motion fallback. */
export function StaticPetals() {
  return (
    <svg className="absolute inset-0 size-full" aria-hidden="true">
      {PETALS.map((p, i) => (
        <svg key={i} x={`${p.x}%`} y={`${p.y}%`} overflow="visible">
          <path
            d={PETAL_PATH}
            transform={`rotate(${p.r}) scale(${p.s})`}
            fill="var(--color-sakura)"
            opacity={p.o}
          />
        </svg>
      ))}
    </svg>
  );
}
