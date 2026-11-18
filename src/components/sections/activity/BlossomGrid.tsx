"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ContributionDay, FetchStatus } from "@/lib/github";
import { PETAL_PATH } from "@/components/ui/Sakura";
import { InkLink } from "@/components/ui/InkLink";

const CELL = 16;
const DAYS = ["", "Mon", "", "Wed", "", "Fri", ""];
const monthFmt = new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "UTC" });
const dayFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** A blossom whose openness reflects the day's contribution level. */
function Cell({ day, x, y, delay }: { day: ContributionDay; x: number; y: number; delay: number }) {
  const label = `${day.count === 0 ? "No" : day.count} contribution${day.count === 1 ? "" : "s"} on ${dayFmt.format(new Date(day.date))}`;
  const cx = x + CELL / 2;
  const cy = y + CELL / 2;
  const style = { "--d": delay } as React.CSSProperties;

  if (day.level === 0) {
    return (
      <circle cx={cx} cy={cy} r="1.6" fill="var(--color-shiro)" fillOpacity="0.12" className="bloom-cell" style={style}>
        <title>{label}</title>
      </circle>
    );
  }
  const petals = day.level + 1; // 2..5 petals: a bud opening into a full blossom
  const scale = 0.42 + day.level * 0.07;
  const opacity = 0.45 + day.level * 0.14;
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <g className="bloom-cell" style={style}>
        <title>{label}</title>
        <g transform={`scale(${scale})`} opacity={opacity}>
          {Array.from({ length: petals }, (_, i) => (
            <path key={i} d={PETAL_PATH} transform={`rotate(${(360 / 5) * i - 36})`} fill="var(--color-sakura)" />
          ))}
          {day.level >= 3 && <circle r="1.6" fill="var(--color-beni)" />}
        </g>
      </g>
    </g>
  );
}

export function BlossomGrid({
  weeks,
  total,
  status,
  profileUrl,
}: {
  weeks: (ContributionDay | null)[][];
  total: number;
  status: FetchStatus;
  profileUrl: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -20% 0px" },
    );
    io.observe(el);
    // On narrow screens, start scrolled to the most recent weeks.
    if (scroller.current) scroller.current.scrollLeft = scroller.current.scrollWidth;
    return () => io.disconnect();
  }, []);

  const { months, stats } = useMemo(() => {
    const months: { x: number; label: string }[] = [];
    let last = -1;
    weeks.forEach((w, i) => {
      const first = w.find(Boolean);
      if (!first) return;
      const m = new Date(first.date).getUTCMonth();
      if (m !== last && new Date(first.date).getUTCDate() <= 7) {
        months.push({ x: i * CELL, label: monthFmt.format(new Date(first.date)) });
        last = m;
      }
    });
    const days = weeks.flat().filter(Boolean) as ContributionDay[];
    let longest = 0;
    let run = 0;
    let best = days[0];
    for (const d of days) {
      run = d.count > 0 ? run + 1 : 0;
      longest = Math.max(longest, run);
      if (!best || d.count > best.count) best = d;
    }
    const active = days.filter((d) => d.count > 0).length;
    return { months, stats: { longest, active, best } };
  }, [weeks]);

  if (status !== "ok" || weeks.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-sm border border-dashed border-line px-6 py-16 text-center">
        <span aria-hidden="true" className="font-jp text-4xl text-sakura/40">
          冬
        </span>
        <p className="font-display text-2xl font-light">The branch is resting.</p>
        <p className="text-[14px] text-mist">
          Activity couldn&apos;t be loaded right now.{" "}
          <InkLink href={profileUrl} external className="text-sakura">
            See it on GitHub
          </InkLink>
        </p>
      </div>
    );
  }

  const width = weeks.length * CELL;
  const height = 7 * CELL + 22;

  return (
    <div ref={wrap}>
      <dl className="mb-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
        {[
          ["Contributions", total.toLocaleString("en-GB")],
          ["Active days", String(stats.active)],
          ["Longest streak", `${stats.longest} day${stats.longest === 1 ? "" : "s"}`],
          ["Busiest day", stats.best && stats.best.count > 0 ? String(stats.best.count) : "—"],
        ].map(([k, v]) => (
          <div key={k} className="border-l border-line pl-4">
            <dt className="font-mono text-[10px] uppercase tracking-[0.3em] text-mist">{k}</dt>
            <dd className="mt-2 font-display text-4xl font-light text-shiro">{v}</dd>
          </div>
        ))}
      </dl>

      <figure className="rounded-sm border border-line bg-sumi/50 p-5 md:p-8">
        <div ref={scroller} className="overflow-x-auto pb-2" tabIndex={0} aria-label="Contribution calendar, scrollable">
          <svg
            viewBox={`-30 0 ${width + 30} ${height}`}
            className={`block h-auto min-w-[760px] w-full ${inView ? "in-view" : ""}`}
            role="img"
            aria-label={`${total} contributions in the last year, drawn as blossoms. Fuller blossoms mean busier days.`}
          >
            {months.map((m) => (
              <text key={m.x} x={m.x} y="10" fill="var(--color-mist)" fontSize="9" fontFamily="var(--font-mono)">
                {m.label}
              </text>
            ))}
            {DAYS.map((d, i) =>
              d ? (
                <text key={i} x="-30" y={22 + i * CELL + 11} fill="var(--color-mist)" fontSize="8" fontFamily="var(--font-mono)">
                  {d}
                </text>
              ) : null,
            )}
            <g transform="translate(0 22)">
              {weeks.map((w, wi) =>
                w.map((day, di) =>
                  day ? <Cell key={day.date} day={day} x={wi * CELL} y={di * CELL} delay={wi * 14 + di * 22} /> : null,
                ),
              )}
            </g>
          </svg>
        </div>
        <figcaption className="mt-5 flex flex-wrap items-center justify-between gap-4 text-[12px] text-mist">
          <span className="flex items-center gap-2">
            Less
            <svg viewBox="0 0 90 16" className="h-4 w-[90px]" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((l) => (
                <g key={l} transform={`translate(${8 + l * 18} 8)`}>
                  {l === 0 ? (
                    <circle r="1.6" fill="var(--color-shiro)" fillOpacity="0.2" />
                  ) : (
                    <g transform={`scale(${0.42 + l * 0.07})`} opacity={0.45 + l * 0.14}>
                      {Array.from({ length: l + 1 }, (_, i) => (
                        <path key={i} d={PETAL_PATH} transform={`rotate(${72 * i - 36})`} fill="var(--color-sakura)" />
                      ))}
                    </g>
                  )}
                </g>
              ))}
            </svg>
            More
          </span>
          <InkLink href={profileUrl} external className="text-shiro/80">
            Full history on GitHub ↗
          </InkLink>
        </figcaption>
      </figure>
    </div>
  );
}
