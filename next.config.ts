import type { NextConfig } from "next";

/**
 * Security headers for every response. The Content-Security-Policy itself is
 * set per request in src/proxy.ts, because it carries a fresh script nonce.
 */
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  /* Self-contained server bundle for the Docker image (see deploy/). */
  output: "standalone",
  poweredByHeader: false,

  cacheComponents: true,
  partialPrefetching: true,

  /** Cache profiles for GitHub data (see src/lib/github.ts). */
  cacheLife: {
    // Good data: refresh hourly in the background, keep serving it for a day.
    github: { stale: 300, revalidate: 3600, expire: 86400 },
    // Failed or rate-limited fetch: retry after five minutes.
    githubRetry: { stale: 60, revalidate: 300, expire: 600 },
  },

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },

  turbopack: {
    // Pin the workspace root (a stray lockfile higher up would otherwise be picked).
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
