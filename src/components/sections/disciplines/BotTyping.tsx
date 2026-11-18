"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Blossom } from "@/components/ui/Sakura";

const REPLY = "Done! Roles synced and the welcome flow is live.";

/** Discord: a command, a typing indicator, then the bot's reply types out. */
export function BotTyping({ play }: { play: boolean }) {
  const [phase, setPhase] = useState<"idle" | "typing" | "reply">("idle");
  const [chars, setChars] = useState(0);

  useEffect(() => {
    if (!play) return;
    const timers: number[] = [];
    timers.push(window.setTimeout(() => setPhase("typing"), 700));
    timers.push(
      window.setTimeout(() => {
        setPhase("reply");
        let n = 0;
        const id = window.setInterval(() => {
          n += 1;
          setChars(n);
          if (n >= REPLY.length) window.clearInterval(id);
        }, 28);
        timers.push(id);
      }, 2000),
    );
    return () => {
      timers.forEach((t) => {
        window.clearTimeout(t);
        window.clearInterval(t);
      });
      setPhase("idle");
      setChars(0);
    };
  }, [play]);

  return (
    <div className="w-[min(340px,78vw)] overflow-hidden rounded-lg border border-line bg-ink/70 text-left text-[13px]" aria-hidden="true">
      <div className="flex items-center gap-2 border-b border-line px-4 py-2.5 text-mist">
        <span className="text-shiro/40">#</span> general
      </div>
      <div className="flex min-h-[184px] flex-col gap-4 p-4">
        <motion.div
          className="flex gap-3"
          initial={false}
          animate={{ opacity: play ? 1 : 0, y: play ? 0 : 8 }}
          transition={{ duration: 0.4 }}
        >
          <span className="size-8 shrink-0 rounded-full bg-charcoal" />
          <div>
            <p className="text-[12px] text-shiro/70">member</p>
            <p className="font-mono text-shiro">/setup welcome</p>
          </div>
        </motion.div>

        <AnimatePresence>
          {phase !== "idle" && (
            <motion.div
              className="flex gap-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-sakura/15">
                <svg viewBox="-12 -12 24 24" className="size-5">
                  <Blossom />
                </svg>
              </span>
              <div className="min-w-0">
                <p className="text-[12px] text-sakura">
                  bot <span className="ml-1 rounded bg-sakura/20 px-1 text-[9px] uppercase tracking-wider">app</span>
                </p>
                {phase === "typing" ? (
                  <span className="mt-2 flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="size-1.5 rounded-full bg-mist"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </span>
                ) : (
                  <>
                    <p className="text-shiro">
                      {REPLY.slice(0, chars)}
                      {chars < REPLY.length && (
                        <span className="ml-px inline-block h-3.5 w-px translate-y-0.5 animate-[caret_0.8s_steps(1)_infinite] bg-sakura" />
                      )}
                    </p>
                    <motion.div
                      className="mt-2 border-l-2 border-sakura bg-charcoal/60 px-3 py-2 text-[12px] text-mist"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: chars >= REPLY.length ? 1 : 0, y: chars >= REPLY.length ? 0 : 8 }}
                      transition={{ duration: 0.5 }}
                    >
                      Welcome channel · 3 roles · embeds enabled
                    </motion.div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
