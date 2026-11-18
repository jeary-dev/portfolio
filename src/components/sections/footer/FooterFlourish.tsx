"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Blossom, PETAL_PATH } from "@/components/ui/Sakura";
import { seeded } from "@/lib/utils";

const rand = seeded(77);
const PETALS = Array.from({ length: 16 }, () => ({
  left: 30 + rand() * 68,
  top: rand() * 20,
  size: 8 + rand() * 9,
  dur: 7 + rand() * 7,
  delay: -rand() * 12,
  drift: 40 + rand() * 120,
  spin: 180 + rand() * 360,
}));

/** The final flourish: a branch reaching in from the right, shedding petals. */
export function FooterFlourish() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Petal animation runs only while the footer is on screen.
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} aria-hidden="true" className={`pointer-events-none absolute inset-0 ${inView ? "in-view" : ""}`}>
      <motion.svg
        viewBox="0 0 520 220"
        className="absolute -right-6 top-0 w-[min(560px,90vw)]"
        initial="hidden"
        whileInView="shown"
        viewport={{ once: true, amount: 0.3 }}
      >
        <g fill="none" stroke="var(--color-shiro)" strokeLinecap="round" strokeOpacity="0.35">
          <motion.path
            d="M540 30C470 40 420 64 360 80S250 110 190 150S110 190 60 196"
            strokeWidth="2"
            variants={{ hidden: { pathLength: 0 }, shown: { pathLength: 1 } }}
            transition={{ duration: 2, ease: [0.7, 0, 0.2, 1] }}
          />
          <motion.path
            d="M360 80C350 110 330 130 300 150"
            strokeWidth="1.2"
            variants={{ hidden: { pathLength: 0 }, shown: { pathLength: 1 } }}
            transition={{ duration: 1, delay: 0.9 }}
          />
          <motion.path
            d="M250 112C262 84 280 66 300 52"
            strokeWidth="1"
            variants={{ hidden: { pathLength: 0 }, shown: { pathLength: 1 } }}
            transition={{ duration: 1, delay: 1.2 }}
          />
        </g>
        {[
          [300, 150, 1.4, 0.9],
          [300, 52, 1.1, 1.3],
          [190, 150, 1.6, 1.5],
          [110, 186, 1.0, 1.8],
          [420, 58, 1.2, 0.8],
          [60, 196, 0.8, 2.0],
        ].map(([x, y, s, d], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <motion.g
              variants={{ hidden: { scale: 0, rotate: -90 }, shown: { scale: s, rotate: 0 } }}
              transition={{ type: "spring", stiffness: 120, damping: 12, delay: d }}
            >
              <Blossom />
            </motion.g>
          </g>
        ))}
      </motion.svg>

      {PETALS.map((p, i) => (
        <svg
          key={i}
          viewBox="-6 -11 12 12"
          className="footer-petal absolute"
          style={
            {
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              "--dur": `${p.dur}s`,
              "--delay": `${p.delay}s`,
              "--drift": `${-p.drift}px`,
              "--spin": `${p.spin}deg`,
            } as React.CSSProperties
          }
        >
          <path d={PETAL_PATH} fill="var(--color-sakura)" />
        </svg>
      ))}
    </div>
  );
}
