/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  SITE CONTENT: edit everything personal here.
 *
 *  Any string wrapped in [square brackets] is a PLACEHOLDER. Placeholders are
 *  shown as dashed "TODO" chips while running `npm run dev` and are hidden
 *  automatically in production builds, so the live site never shows them.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { Category } from "./projects";

export const site = {
  /** Shown as the hero name and in titles. */
  name: "czrbyn",
  /** Small vertical Japanese accent beside the hero name. */
  nameJp: "コービン・ジアリー",
  /** Handle / logo mark. */
  handle: "jeary-dev",

  /**
   * Canonical URL (Open Graph, sitemap, robots, JSON-LD). Override with
   * NEXT_PUBLIC_SITE_URL; it is inlined at build time, so pass it as a build arg.
   */
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://jeary.dev").replace(/\/+$/, ""),

  /** SEO */
  title: "czrbyn: Minecraft plugins, Discord bots, web & apps",
  description:
    "czrbyn (jeary-dev) is a developer building Kotlin Minecraft plugins for Paper and Spigot, Discord bots, websites, and apps, with clean architecture, smooth performance and polish.",

  /** The rotating role line in the hero: "I build ____". */
  roles: ["Minecraft plugins", "Discord bots", "websites", "apps"],

  /** About section. Each string is one paragraph. */
  bio: [
    "I'm a developer who builds across the stack and across platforms: Minecraft plugins for Paper and Spigot, Discord bots, websites, and apps.",
    "I write my plugins in Kotlin and make everything configurable, so server owners can shape them without touching code.",
    "I care about clean architecture, smooth performance, and polish in the details people actually notice.",
  ],

  github: {
    username: "jeary-dev",
    url: "https://github.com/jeary-dev",
  },

  discord: {
    /** The username people should DM. */
    username: "czrbyn",
    /** Profile link or server invite. */
    url: "https://discord.gg/YBZVpWR8ma",
  },

  /**
   * Extra profile links (Modrinth, SpigotMC…). Placeholders are hidden in
   * production, so add the real URL when the profile exists.
   */
  links: [
    { label: "Modrinth", href: "https://modrinth.com/user/jeary-dev" },
    { label: "SpigotMC", href: "https://www.spigotmc.org/members/jeary-dev.2637984/" },
  ],
} as const;

/** Skills, grouped by discipline (About section). */
export const skills: { discipline: Category; label: string; kanji: string; items: string[] }[] = [
  {
    discipline: "minecraft",
    label: "Minecraft plugins",
    kanji: "塊",
    items: ["Kotlin", "Java", "Paper API", "Spigot API", "Maven", "YAML-driven configuration"],
  },
  {
    discipline: "discord",
    label: "Discord bots",
    kanji: "話",
    items: ["discord.js", "TypeScript", "JDA", "Kotlin", "Slash commands & components", "SQLite"],
  },
  {
    discipline: "web",
    label: "Websites",
    kanji: "網",
    items: ["Next.js", "TypeScript", "Tailwind CSS", "React", "Node.js", "Docker"],
  },
  {
    discipline: "apps",
    label: "Apps",
    kanji: "器",
    items: ["Kotlin", "Jetpack Compose", "React Native", "Electron"],
  },
];

/** "What I build" panels. Short, editable copy per discipline. */
export const disciplines: {
  id: Category;
  index: string;
  kanji: string;
  title: string;
  body: string;
}[] = [
  {
    id: "minecraft",
    index: "01",
    kanji: "塊",
    title: "Minecraft plugins",
    body: "Paper and Spigot plugins written in Kotlin, configurable end to end through YAML so server owners can shape them without touching code.",
  },
  {
    id: "discord",
    index: "02",
    kanji: "話",
    title: "Discord bots",
    body: "Bots for communities: commands, automation and integrations, built to stay responsive and easy to configure.",
  },
  {
    id: "web",
    index: "03",
    kanji: "網",
    title: "Websites",
    body: "Fast, accessible sites with Next.js, TypeScript and Tailwind, with motion that feels considered, never in the way.",
  },
  {
    id: "apps",
    index: "04",
    kanji: "器",
    title: "Apps",
    body: "Apps with the same priorities: clean architecture underneath, smooth performance, and polish in the details people notice.",
  },
];

export const nav = [
  { href: "#about", label: "About", jp: "私" },
  { href: "#work", label: "Work", jp: "仕事" },
  { href: "#projects", label: "Projects", jp: "作品" },
  { href: "#activity", label: "Activity", jp: "活動" },
  { href: "#contact", label: "Contact", jp: "連絡" },
] as const;
