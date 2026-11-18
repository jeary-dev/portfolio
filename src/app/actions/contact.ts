"use server";

import { headers } from "next/headers";
import { contactEnv } from "@/lib/contact";
import { TOPICS, composeSubject, mailtoHref } from "@/lib/contact-shared";

export interface ContactInput {
  name: string;
  email: string;
  topic: string;
  message: string;
  /** Honeypot: real visitors never see or fill this. */
  website: string;
}

export type ContactResult =
  | { ok: true }
  | { ok: false; reason: "invalid"; field: "email" | "message"; message: string }
  | { ok: false; reason: "rate-limited" | "unavailable"; mailto: string | null };

/* In-memory limits: one container serves the site, so a Map is enough. */
const WINDOW_MS = 10 * 60 * 1000;
const PER_IP = 5;
const GLOBAL_PER_HOUR = 60;
const hits = new Map<string, number[]>();
let globalHits: number[] = [];

function allow(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  globalHits = globalHits.filter((t) => now - t < 60 * 60 * 1000);
  if (recent.length >= PER_IP || globalHits.length >= GLOBAL_PER_HOUR) return false;
  recent.push(now);
  globalHits.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return true;
}

const EMAIL = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]+$/;
const clean = (v: unknown, max: number) => String(v ?? "").replace(/\r\n?/g, "\n").trim().slice(0, max);

/** Send the contact form through Resend. Falls back to a mailto link on any failure. */
export async function sendContact(input: ContactInput): Promise<ContactResult> {
  const env = contactEnv();
  const name = clean(input.name, 100).replace(/\s+/g, " ");
  const email = clean(input.email, 254);
  const topic = TOPICS.find((t) => t === input.topic) ?? "Something else";
  const message = clean(input.message, 5000);

  if (message.length < 10) {
    return { ok: false, reason: "invalid", field: "message", message: "A sentence or two helps. Tell me a little about what you have in mind." };
  }

  const subject = composeSubject(topic, name);
  const body = `${message}\n\n—\n${name || "(no name)"}${email ? ` <${email}>` : ""}\nAbout: ${topic}`;
  const fallback = env.to ? mailtoHref(env.to, subject, message) : null;

  // Bots that fill the honeypot get a quiet "success" and nothing is sent.
  if (input.website) return { ok: true };
  if (env.mode !== "email" || !env.apiKey || !env.to) return { ok: false, reason: "unavailable", mailto: fallback };

  if (!EMAIL.test(email)) {
    return { ok: false, reason: "invalid", field: "email", message: "Add an email address so I can reply." };
  }

  const h = await headers();
  const ip = h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!allow(ip)) return { ok: false, reason: "rate-limited", mailto: fallback };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: env.from, to: [env.to], reply_to: email, subject, text: body }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error(`[contact] Resend responded ${res.status}: ${(await res.text()).slice(0, 300)}`);
      return { ok: false, reason: "unavailable", mailto: fallback };
    }
    return { ok: true };
  } catch (err) {
    console.error("[contact] Resend request failed:", err);
    return { ok: false, reason: "unavailable", mailto: fallback };
  }
}
