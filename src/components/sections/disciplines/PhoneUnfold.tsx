"use client";

import { motion } from "motion/react";
import { Blossom } from "@/components/ui/Sakura";

/** Apps: a folded phone opens on its hinge and the app interface lights up. */
export function PhoneUnfold({ play }: { play: boolean }) {
  return (
    <div className="flex h-[230px] items-center justify-center [perspective:900px]" aria-hidden="true">
      <motion.div
        className="relative flex"
        initial={false}
        animate={{ x: play ? 0 : 54 }}
        transition={{ duration: 1.1, delay: play ? 0.2 : 0, ease: [0.7, 0, 0.2, 1] }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Left half */}
        <div className="relative h-[210px] w-[108px] overflow-hidden rounded-l-[18px] border border-r-0 border-line bg-sumi p-2">
          <div className="size-full overflow-hidden rounded-l-[12px] bg-[linear-gradient(160deg,#2a1d26,#121015)] p-3">
            <motion.div
              initial={false}
              animate={{ opacity: play ? 1 : 0, y: play ? 0 : 10 }}
              transition={{ delay: play ? 1.2 : 0, duration: 0.6 }}
            >
              <p className="font-jp text-[10px] text-sakura">今日</p>
              <div className="mt-3 space-y-2">
                {[70, 52, 62, 40].map((w, i) => (
                  <div key={i} className="h-1.5 rounded-full bg-shiro/20" style={{ width: `${w}%` }} />
                ))}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className={`h-9 rounded ${i === 0 ? "bg-sakura/40" : "bg-shiro/10"}`} />
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right half: hinged on its left edge */}
        <motion.div
          className="relative h-[210px] w-[108px] rounded-r-[18px] border border-l-0 border-line bg-sumi p-2"
          initial={false}
          animate={{ rotateY: play ? 0 : -178 }}
          transition={{ duration: 1.1, delay: play ? 0.2 : 0, ease: [0.7, 0, 0.2, 1] }}
          style={{ transformOrigin: "left center", transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
        >
          <div className="relative size-full overflow-hidden rounded-r-[12px] bg-[linear-gradient(200deg,#2a1d26,#121015)]">
            <motion.svg
              viewBox="-20 -20 40 40"
              className="absolute left-1/2 top-[38%] size-16 -translate-x-1/2 -translate-y-1/2"
              initial={false}
              animate={{ scale: play ? 1 : 0, rotate: play ? 0 : -90 }}
              transition={{ type: "spring", stiffness: 120, damping: 12, delay: play ? 1.25 : 0 }}
            >
              <Blossom transform="scale(1.6)" />
            </motion.svg>
            <motion.div
              className="absolute inset-x-3 bottom-4 h-7 rounded-full bg-sakura"
              initial={false}
              animate={{ scaleX: play ? 1 : 0, opacity: play ? 1 : 0 }}
              transition={{ delay: play ? 1.45 : 0, duration: 0.6 }}
            />
          </div>
        </motion.div>

        {/* Hinge */}
        <span className="absolute left-[107px] top-3 bottom-3 w-px bg-shiro/10" />
      </motion.div>
    </div>
  );
}
