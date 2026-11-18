import { Hero } from "@/components/hero/Hero";
import { About } from "@/components/sections/About";
import { Disciplines } from "@/components/sections/Disciplines";
import { Projects } from "@/components/sections/Projects";
import { Activity } from "@/components/sections/Activity";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";
import { BranchGrowth } from "@/components/decor/BranchGrowth";
import { site } from "@/config/site";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    alternateName: site.handle,
    url: site.url,
    sameAs: [site.github.url],
    jobTitle: "Developer",
    knowsAbout: ["Minecraft plugins", "Kotlin", "Paper", "Spigot", "Discord bots", "Next.js", "TypeScript"],
  };

  return (
    <>
      <main>
        <Hero />
        <div className="relative">
          <BranchGrowth />
          <About />
          <Disciplines />
          <Projects />
          <Activity />
          <Contact />
        </div>
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\u003c") }}
      />
    </>
  );
}
