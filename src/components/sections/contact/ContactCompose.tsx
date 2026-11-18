"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, useRef, useState } from "react";
import { Magnetic } from "@/components/ui/Magnetic";
import { copyText } from "./CopyHandle";

const TOPICS = ["A Minecraft plugin", "A Discord bot", "A website", "An app", "Something else"];

/**
 * No email, no backend: the form composes a ready-to-send note, copies it to
 * the clipboard, and points the visitor to Discord.
 */
export function ContactCompose({ username, discordUrl }: { username: string; discordUrl: string | null }) {
  const id = useId();
  const [state, setState] = useState<"idle" | "copied" | "manual">("idle");
  const [composed, setComposed] = useState("");
  const [error, setError] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  const field =
    "w-full border-0 border-b border-line bg-transparent px-0 py-3 text-[16px] text-shiro placeholder:text-mist/80 transition-colors duration-500 focus:border-sakura focus:outline-none focus:ring-0";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const topic = String(data.get("topic") ?? "");
    const message = String(data.get("message") ?? "").trim();
    if (message.length < 10) {
      setError("A sentence or two helps. Tell me a little about what you have in mind.");
      return;
    }
    setError("");
    const text = [`Hi ${username}!${name ? ` I'm ${name}.` : ""}`, topic ? `About: ${topic}` : "", "", message]
      .filter((l, i) => l !== "" || i === 2)
      .join("\n");
    setComposed(text);
    setState((await copyText(text)) ? "copied" : "manual");
    requestAnimationFrame(() => resultRef.current?.focus());
  }

  return (
    <div className="relative rounded-sm border border-line bg-sumi/40 p-7 sm:p-10">
      <p className="mb-8 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.35em] text-mist">
        Compose a message
        <span className="font-jp text-[12px] tracking-[0.4em] text-sakura/70" aria-hidden="true">
          手紙
        </span>
      </p>

      <AnimatePresence mode="wait" initial={false}>
        {state === "idle" ? (
          <motion.form
            key="form"
            onSubmit={onSubmit}
            noValidate
            className="space-y-8"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4 }}
          >
            <div>
              <label htmlFor={`${id}-name`} className="font-mono text-[11px] uppercase tracking-[0.25em] text-mist">
                Your name <span className="normal-case tracking-normal text-mist">(optional)</span>
              </label>
              <input id={`${id}-name`} name="name" autoComplete="name" className={field} placeholder="How should I call you?" />
            </div>

            <fieldset>
              <legend className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-mist">It&apos;s about</legend>
              <div className="flex flex-wrap gap-2">
                {TOPICS.map((t, i) => (
                  <label key={t} className="cursor-pointer">
                    <input type="radio" name="topic" value={t} defaultChecked={i === 0} className="peer sr-only" />
                    <span className="block rounded-full border border-line px-3.5 py-1.5 text-[13px] text-shiro/75 transition-colors duration-300 peer-checked:border-sakura peer-checked:bg-sakura peer-checked:text-ink peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-sakura">
                      {t}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor={`${id}-msg`} className="font-mono text-[11px] uppercase tracking-[0.25em] text-mist">
                Message
              </label>
              <textarea
                id={`${id}-msg`}
                name="message"
                required
                rows={5}
                aria-invalid={!!error}
                aria-describedby={error ? `${id}-err` : `${id}-hint`}
                className={`${field} resize-none`}
                placeholder="What are you building?"
              />
              <p id={`${id}-hint`} className="mt-2 text-[12px] text-mist">
                I&apos;ll copy it for you, ready to paste into a Discord DM.
              </p>
              {error && (
                <p id={`${id}-err`} role="alert" className="mt-2 text-[13px] text-sakura">
                  {error}
                </p>
              )}
            </div>

            <Magnetic>
              <button
                type="submit"
                className="group relative inline-flex h-12 items-center gap-3 overflow-hidden rounded-full bg-sakura px-7 text-[14px] font-medium text-ink"
              >
                <span className="absolute inset-0 translate-y-full rounded-full bg-shiro transition-transform duration-500 ease-[var(--ease-ink)] group-hover:translate-y-0" />
                <span className="relative">Copy message</span>
                <span aria-hidden="true" className="relative transition-transform duration-500 group-hover:translate-x-1">
                  →
                </span>
              </button>
            </Magnetic>
          </motion.form>
        ) : (
          <motion.div
            key="done"
            ref={resultRef}
            tabIndex={-1}
            role="status"
            className="space-y-6 focus:outline-none"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4 }}
          >
            <p className="font-display text-3xl font-light text-shiro">
              {state === "copied" ? "Copied. Now send it my way." : "Almost there."}
            </p>
            <p className="text-[15px] leading-relaxed text-mist">
              {state === "copied" ? (
                <>
                  Your message is on your clipboard. Add <span className="text-sakura">{username}</span> on Discord and
                  paste it into a DM.
                </>
              ) : (
                <>
                  Your browser blocked the clipboard, so select the text below and send it to{" "}
                  <span className="text-sakura">{username}</span> on Discord.
                </>
              )}
            </p>
            <textarea
              readOnly
              value={composed}
              rows={5}
              aria-label="Your composed message"
              className="w-full resize-none rounded-sm border border-line bg-ink/60 p-4 font-mono text-[13px] text-shiro/85"
              onFocus={(e) => e.currentTarget.select()}
            />
            <div className="flex flex-wrap gap-3">
              <a
                href={discordUrl ?? "https://discord.com/app"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center rounded-full bg-sakura px-6 text-[14px] font-medium text-ink"
              >
                Open Discord ↗<span className="sr-only"> (opens in a new tab)</span>
              </a>
              <button
                type="button"
                onClick={() => setState("idle")}
                className="inline-flex h-11 items-center rounded-full border border-line px-6 text-[14px] text-shiro"
              >
                Write another
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
