"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function CopyHandle({ handle }: { handle: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="mt-3 flex flex-wrap items-center gap-4">
      <span className="font-display text-[clamp(2.4rem,5vw,3.5rem)] font-light leading-none text-shiro">{handle}</span>
      <button
        type="button"
        onClick={async () => {
          if (await copyText(handle)) {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1800);
          }
        }}
        className="relative h-9 overflow-hidden rounded-full border border-line px-4 text-[12px] text-shiro/85 transition-colors duration-500 hover:border-sakura/60"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={copied ? "y" : "n"}
            className="block"
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {copied ? "Copied ✓" : "Copy username"}
          </motion.span>
        </AnimatePresence>
        <span className="sr-only" aria-live="polite">
          {copied ? "Username copied to clipboard" : ""}
        </span>
      </button>
    </div>
  );
}
