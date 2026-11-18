"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { nav, site } from "@/config/site";
import { Hanko } from "@/components/ui/Sakura";
import { InkLink } from "@/components/ui/InkLink";
import { Magnetic } from "@/components/ui/Magnetic";
import { scrollToTarget, useLenis } from "@/components/providers/SmoothScroll";
import { useIntroDone } from "@/lib/hooks";

export function Header() {
  const intro = useIntroDone();
  const lenis = useLenis();
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);

  // Hide on scroll down, reveal on scroll up.
  useEffect(() => {
    let last = window.scrollY;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        if (Math.abs(y - last) > 6) setHidden(y > last && y > 160);
        last = y;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Mobile menu: lock scroll, Esc to close, focus management.
  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    firstLink.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const btn = menuBtn.current;
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      lenis?.start();
      btn?.focus();
    };
  }, [open, lenis]);

  const go = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setOpen(false);
    // Wait a frame so the menu's scroll lock is released first.
    requestAnimationFrame(() => scrollToTarget(lenis, href));
    history.replaceState(null, "", href);
  };

  const show = intro && (!hidden || open);

  return (
    <>
      <header
        data-show={show}
        className="site-header fixed inset-x-0 top-0 z-[70] transition-transform duration-700 ease-[var(--ease-ink)]"
      >
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-5 sm:px-8 md:px-12">
          <a
            href="#top"
            onClick={(e) => go(e, "#top")}
            className="group flex items-center gap-3"
          >
            <Hanko className="size-7 text-[15px] transition-transform duration-500 group-hover:rotate-[-8deg]" />
            <span className="font-mono text-[12px] tracking-[0.2em] text-shiro">{site.handle}</span>
            <span className="sr-only">, back to top</span>
          </a>

          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-8">
              {nav.map((item) => (
                <li key={item.href}>
                  <InkLink
                    href={item.href}
                    onClick={(e) => go(e, item.href)}
                    className="group gap-2 py-1 text-[13px] tracking-wide text-shiro/80 transition-colors hover:text-shiro"
                  >
                    <span className="font-jp text-[10px] text-sakura/70" aria-hidden="true">
                      {item.jp}
                    </span>
                    {item.label}
                  </InkLink>
                </li>
              ))}
            </ul>
          </nav>

          <Magnetic className="md:hidden">
            <button
              ref={menuBtn}
              type="button"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((o) => !o)}
              className="relative grid size-11 place-items-center rounded-full border border-line"
            >
              <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
              <span
                aria-hidden="true"
                className={`absolute h-px w-4 bg-shiro transition-transform duration-500 ${open ? "rotate-45" : "-translate-y-[3px]"}`}
              />
              <span
                aria-hidden="true"
                className={`absolute h-px w-4 bg-shiro transition-transform duration-500 ${open ? "-rotate-45" : "translate-y-[3px]"}`}
              />
            </button>
          </Magnetic>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-[65] flex flex-col justify-between bg-ink px-6 pb-10 pt-28 md:hidden"
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.7, ease: [0.7, 0, 0.2, 1] }}
          >
            <nav aria-label="Mobile">
              <ul className="flex flex-col gap-2">
                {nav.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + i * 0.06, duration: 0.6 }}
                  >
                    <a
                      ref={i === 0 ? firstLink : undefined}
                      href={item.href}
                      onClick={(e) => go(e, item.href)}
                      className="flex items-baseline gap-4 py-2 font-display text-5xl font-light text-shiro"
                    >
                      <span className="font-mono text-[11px] text-sakura">0{i + 1}</span>
                      {item.label}
                      <span className="ml-auto font-jp text-base text-mist" aria-hidden="true">
                        {item.jp}
                      </span>
                    </a>
                  </motion.li>
                ))}
              </ul>
            </nav>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-mist">
              {site.name} · {site.handle}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
