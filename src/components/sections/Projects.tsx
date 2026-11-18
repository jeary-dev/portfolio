import { getProjects } from "@/lib/github";
import { site } from "@/config/site";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectGrid } from "./projects/ProjectGrid";

export async function Projects() {
  const { status, projects } = await getProjects();

  return (
    <section id="projects" aria-labelledby="projects-title" className="relative z-[1] px-5 py-28 sm:px-8 md:px-16 md:py-40">
      <div className="mx-auto max-w-[1400px] lg:pr-36">
        <SectionHeading id="projects-title" index="03" label="Projects" kanji="作品" title="Selected work, live from GitHub." />
        <ProjectGrid projects={projects} status={status} profileUrl={site.github.url} />
      </div>
    </section>
  );
}
