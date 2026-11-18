/** Strings like "[your URL]" are placeholders: visible in dev, hidden in prod. */
export const isPlaceholder = (value: string | undefined | null) =>
  !value || /^\s*\[.*\]\s*$/.test(value);

export const showPlaceholders = process.env.NODE_ENV !== "production";

/** Filter a list of strings, keeping placeholders only in development. */
export const visibleItems = (items: readonly string[]) =>
  items.filter((item) => showPlaceholders || !isPlaceholder(item));

export const cn = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(" ");

/**
 * Deterministic PRNG (mulberry32). Used for decorative layouts so server and
 * client render identical markup, with no Math.random() during render.
 */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
