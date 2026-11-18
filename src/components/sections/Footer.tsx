import { cacheLife } from "next/cache";
import { site } from "@/config/site";
import { Hanko } from "@/components/ui/Sakura";
import { InkLink } from "@/components/ui/InkLink";
import { FooterFlourish } from "./footer/FooterFlourish";
import { BackToTop } from "./footer/BackToTop";

async function Year() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line px-5 pb-10 pt-24 sm:px-8 md:px-16">
      <FooterFlourish />
      <div className="relative mx-auto max-w-[1400px]">
        {/* Decorative watermark: drawn as SVG artwork, not text content. */}
        <svg aria-hidden="true" viewBox="0 0 640 170" className="w-[min(100%,1100px)] select-none">
          <text
            x="0"
            y="128"
            className="font-display"
            fontStyle="italic"
            fontWeight={300}
            fontSize="170"
            letterSpacing="-4"
            fill="var(--color-shiro)"
            fillOpacity="0.06"
          >
            {site.name}
          </text>
        </svg>

        <div className="mt-14 flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div className="flex items-center gap-4">
            <Hanko className="size-10 text-xl" />
            <div>
              <p className="font-mono text-[12px] tracking-[0.2em] text-shiro">{site.handle}</p>
              <p className="mt-1 text-[13px] text-mist">
                © <Year /> {site.name}. Designed and built by hand.
              </p>
            </div>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-8 gap-y-4 text-[14px]">
            <InkLink href={site.github.url} external className="text-shiro/80">
              GitHub ↗
            </InkLink>
            <span className="text-shiro/80">
              Discord <span className="text-sakura">{site.discord.username}</span>
            </span>
            <BackToTop />
          </nav>
        </div>
      </div>
    </footer>
  );
}
