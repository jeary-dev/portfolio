import { site } from "@/config/site";
import { isPlaceholder, showPlaceholders } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealText } from "@/components/ui/RevealText";
import { InkLink } from "@/components/ui/InkLink";
import { ContactCompose } from "./contact/ContactCompose";
import { CopyHandle } from "./contact/CopyHandle";

export function Contact() {
  const discordUrl = isPlaceholder(site.discord.url) ? null : site.discord.url;
  const links = site.links.filter((l) => showPlaceholders || !isPlaceholder(l.href));

  return (
    <section id="contact" aria-labelledby="contact-title" className="relative z-[1] px-5 py-28 sm:px-8 md:px-16 md:py-40">
      <div className="mx-auto max-w-[1400px] lg:pr-36">
        <SectionHeading id="contact-title" index="05" label="Contact" kanji="連絡" title="Let's build something." />

        <div className="grid gap-16 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <RevealText className="max-w-md text-[17px] leading-relaxed text-mist">
              The quickest way to reach me is Discord. Send a message about a plugin, a bot, a site or an app and
              I&apos;ll get back to you.
            </RevealText>

            <div className="mt-12 rounded-sm border border-line bg-sumi/60 p-7">
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-mist">Discord</p>
              <CopyHandle handle={site.discord.username} />
              {discordUrl ? (
                <InkLink href={discordUrl} external className="mt-4 text-[14px] text-sakura">
                  Open profile ↗
                </InkLink>
              ) : (
                showPlaceholders && (
                  <p className="mt-4 inline-block rounded-full border border-dashed border-beni/70 px-3 py-1 text-[12px] text-beni">
                    <span className="mr-1 font-mono text-[10px]">TODO</span>
                    {site.discord.url}
                  </p>
                )
              )}
            </div>

            <ul className="mt-10 space-y-4 text-[15px]">
              <li className="flex items-center justify-between border-b border-line pb-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-mist">GitHub</span>
                <InkLink href={site.github.url} external className="text-shiro">
                  {site.github.username} ↗
                </InkLink>
              </li>
              {links.map((l) =>
                isPlaceholder(l.href) ? (
                  <li key={l.label} className="flex items-center justify-between border-b border-line pb-4">
                    <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-mist">{l.label}</span>
                    <span className="rounded-full border border-dashed border-beni/70 px-3 py-1 text-[12px] text-beni">
                      <span className="mr-1 font-mono text-[10px]">TODO</span>
                      {l.href}
                    </span>
                  </li>
                ) : (
                  <li key={l.label} className="flex items-center justify-between border-b border-line pb-4">
                    <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-mist">{l.label}</span>
                    <InkLink href={l.href} external className="text-shiro">
                      Profile ↗
                    </InkLink>
                  </li>
                ),
              )}
            </ul>
          </div>

          <ContactCompose username={site.discord.username} discordUrl={discordUrl} />
        </div>
      </div>
    </section>
  );
}
