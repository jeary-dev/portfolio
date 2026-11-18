import { site, skills } from "@/config/site";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealText } from "@/components/ui/RevealText";
import { Parallax } from "@/components/ui/Parallax";
import { isPlaceholder, visibleItems } from "@/lib/utils";
import { SkillGroup } from "./SkillGroup";

export function About() {
  const [lead, ...rest] = site.bio;

  return (
    <section id="about" aria-labelledby="about-title" className="relative z-[1] px-5 py-28 sm:px-8 md:px-16 md:py-40">
      <Parallax speed={40} className="pointer-events-none absolute right-[6vw] top-24 hidden select-none lg:block">
        <span className="vertical text-[11rem] leading-none text-shiro/[0.03]">私</span>
      </Parallax>

      <div className="relative mx-auto max-w-[1400px] lg:pr-36">
        <SectionHeading id="about-title" index="01" label="About" kanji="自己紹介" title="Quietly obsessive about craft." />

        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          <RevealText
            className="font-display text-[clamp(1.6rem,3.2vw,2.6rem)] font-light leading-[1.25] text-shiro md:col-span-7"
          >
            {lead}
          </RevealText>
          <div className="space-y-6 text-[16px] leading-relaxed text-mist md:col-span-4 md:col-start-9 md:pt-3">
            {rest.map((p, i) => (
              <RevealText key={i} delay={0.1 * i}>
                {p}
              </RevealText>
            ))}
          </div>
        </div>

        <div className="mt-24 md:mt-32">
          <p className="mb-8 font-mono text-[11px] uppercase tracking-[0.35em] text-mist">
            Toolkit <span className="font-jp tracking-[0.4em] text-sakura/70">道具</span>
          </p>
          <ul className="grid gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {skills.map((group, i) => (
              <SkillGroup
                key={group.discipline}
                index={i}
                label={group.label}
                kanji={group.kanji}
                items={visibleItems(group.items).map((item) => ({
                  text: item,
                  placeholder: isPlaceholder(item),
                }))}
              />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
