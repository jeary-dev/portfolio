import "server-only";
import type { ContactMode } from "./contact-shared";

/**
 * How the contact form delivers, decided at request time from the environment:
 *   - "email":   RESEND_API_KEY + CONTACT_EMAIL: sent from the server via Resend
 *   - "mailto":  CONTACT_EMAIL only: opens the visitor's mail app, pre-filled
 *   - "discord": neither: composes a note to paste into a Discord DM
 */
export function contactEnv() {
  const to = process.env.CONTACT_EMAIL?.trim() || null;
  const apiKey = process.env.RESEND_API_KEY?.trim() || null;
  const from = process.env.RESEND_FROM?.trim() || "Portfolio <onboarding@resend.dev>";
  const mode: ContactMode = to && apiKey ? "email" : to ? "mailto" : "discord";
  return { to, apiKey, from, mode };
}
