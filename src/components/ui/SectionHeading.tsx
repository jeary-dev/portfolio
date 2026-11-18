import { RevealText } from "./RevealText";
import { BrushDivider } from "./BrushDivider";

/** Numbered section heading with a vertical kanji accent and brush divider. */
export function SectionHeading({
  id,
  index,
  label,
  kanji,
  title,
}: {
  id: string;
  index: string;
  label: string;
  kanji: string;
  title: string;
}) {
  return (
    <header className="relative mb-14 md:mb-20">
      <p className="mb-6 flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.35em] text-mist">
        <span className="text-sakura">{index}</span>
        <span className="h-px w-10 bg-line" aria-hidden="true" />
        <span>{label}</span>
      </p>
      <div className="flex items-start gap-6 md:gap-10">
        <RevealText
          as="h2"
          id={id}
          className="font-display text-[clamp(2.6rem,7vw,5.75rem)] font-light leading-[0.95] tracking-[-0.02em] text-shiro"
        >
          {title}
        </RevealText>
        <span
          aria-hidden="true"
          className="vertical mt-2 hidden shrink-0 text-sm text-sakura/80 sm:block"
        >
          {kanji}
        </span>
      </div>
      <BrushDivider className="mt-8 w-[min(420px,70%)]" tone="sakura" />
    </header>
  );
}
