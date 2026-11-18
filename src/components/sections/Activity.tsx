import { getContributions } from "@/lib/github";
import { site } from "@/config/site";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BlossomGrid } from "./activity/BlossomGrid";

export async function Activity() {
  const data = await getContributions();

  return (
    <section id="activity" aria-labelledby="activity-title" className="relative z-[1] px-5 py-28 sm:px-8 md:px-16 md:py-40">
      <div className="mx-auto max-w-[1400px] lg:pr-36">
        <SectionHeading id="activity-title" index="04" label="GitHub activity" kanji="活動" title="A year in bloom." />
        <BlossomGrid weeks={data.weeks} total={data.total} status={data.status} profileUrl={site.github.url} />
      </div>
    </section>
  );
}
