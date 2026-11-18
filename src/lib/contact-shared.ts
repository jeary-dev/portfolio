/** Contact helpers shared by the form (client) and the server action. */

export type ContactMode = "email" | "mailto" | "discord";

export const TOPICS = ["A Minecraft plugin", "A Discord bot", "A website", "An app", "Something else"] as const;

export function mailtoHref(to: string, subject: string, body: string) {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function composeSubject(topic: string, name: string) {
  return `${topic || "A message"}${name ? ` from ${name}` : ""} (via jeary.dev)`;
}
