"use client";

import { motion } from "motion/react";

export function SkillGroup({
  index,
  label,
  kanji,
  items,
}: {
  index: number;
  label: string;
  kanji: string;
  items: { text: string; placeholder: boolean }[];
}) {
  return (
    <motion.li
      className="group relative bg-ink p-7 md:p-8"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -15% 0px" }}
      transition={{ duration: 0.9, delay: index * 0.08 }}
    >
      <div className="mb-8 flex items-start justify-between">
        <h3 className="font-display text-2xl font-light text-shiro">{label}</h3>
        <span
          aria-hidden="true"
          className="font-jp text-3xl text-shiro/10 transition-colors duration-700 group-hover:text-sakura/60"
        >
          {kanji}
        </span>
      </div>
      <ul className="flex flex-wrap gap-2">
        {items.length === 0 && <li className="text-sm text-mist">More soon.</li>}
        {items.map((item, i) => (
          <motion.li
            key={item.text}
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.08 + 0.2 + i * 0.04 }}
            className={
              item.placeholder
                ? "rounded-full border border-dashed border-beni/70 px-3 py-1 text-[12px] text-beni"
                : "rounded-full border border-line px-3 py-1 text-[12px] text-shiro/85 transition-colors duration-500 hover:border-sakura/50"
            }
            title={item.placeholder ? "Placeholder: edit src/config/site.ts (hidden in production)" : undefined}
          >
            {item.placeholder && <span className="mr-1 font-mono text-[10px]">TODO</span>}
            {item.text}
          </motion.li>
        ))}
      </ul>
    </motion.li>
  );
}
