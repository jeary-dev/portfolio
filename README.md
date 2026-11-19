# czrbyn · jeary-dev

A personal developer portfolio with a dark sakura theme, built with Next.js (App Router), TypeScript,
Tailwind CSS v4, Motion, GSAP + ScrollTrigger, Lenis and React Three Fiber.

- **Hero:** a GPU sakura petal field (one instanced mesh, all motion in the vertex shader) that
  drifts with the wind, picks up gusts from fast cursor moves and parts around the cursor. The
  name is revealed with brush strokes and an ink bleed.
- **Intro:** a branch draws itself and blossoms open, then the ink lifts away with a sakura edge.
- **Scroll:** a branch grows down the page and opens blossoms as it passes them. Text reveals line
  by line, layers parallax, and "What I build" is a pinned horizontal scroll on desktop.
- **Detail:** a petal-trail cursor, magnetic buttons, 3D-tilt project cards with a pink glow, and
  ink-ripple links.
- **Data:** projects and the blossom contribution grid come live from GitHub and are cached on the
  server.

---

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (type-checks)
npm run start      # serve the production build
npm run lint
```

Requires Node 20.9 or newer.

## Edit your content

Everything personal lives in **two files**:

| File | What's in it |
| --- | --- |
| [`src/config/site.ts`](src/config/site.ts) | Name, Japanese name, handle, bio, rotating roles, skills per discipline, the four "What I build" panels, Discord username/link, extra profile links, SEO title/description |
| [`src/config/projects.ts`](src/config/projects.ts) | GitHub user, plus per-repo overrides: **pin**, **hide**, **categorise**, rename, describe, add a **screenshot**, and `extras` for work that isn't a public repo |

### Placeholders

Any value written in `[square brackets]` is a placeholder, for example
`"[your Modrinth profile URL]"`. While you run `npm run dev`, placeholders show up as dashed
red **TODO** chips so they're easy to find. **Production builds hide them automatically**, so the
live site never shows one. The current placeholders are:

- Discord bot skills (library and language)
- Extra website skills
- App frameworks and languages
- Discord profile/invite URL
- Modrinth and SpigotMC profile URLs

### Projects

```ts
// src/config/projects.ts
overrides: [
  { repo: "MCBridge", pinned: true, category: "minecraft", description: "…" },
  { repo: "mcping", screenshot: { src: "/projects/mcping.png", alt: "mcping in a terminal" } },
  { repo: "old-experiment", hidden: true },
],
extras: [
  { title: "Private plugin", description: "…", category: "minecraft", language: "Kotlin" },
],
```

- Put screenshots in `public/projects/` (16:9 works best).
- Categories are `minecraft`, `discord`, `web`, `apps` and `other`. Without an override, the category
  is guessed from the repo's name, topics and description (for example "mc…", "spigot" or "paper"
  → Minecraft). Adding GitHub **topics** to your repos is an easy way to steer this.
- Sort order: pinned first, then `order`, then stars, then most recently pushed.
- Forks are hidden by default (`hideForks`).
- Clicking a card (or its title) opens an **Explore** modal with the project's details and its
  README, rendered by GitHub. READMEs load on demand from `/api/readme/[repo]` (cached for an
  hour, and warmed when you hover a card). Relative images and links in the README are pointed at
  the repo automatically. Only repos shown in the Projects list are served.

## How the GitHub data works

[`src/lib/github.ts`](src/lib/github.ts) runs **only on the server** and uses Next's
`'use cache'` + `cacheLife`:

- **Repos** come from the REST API and are cached for **1 hour**. If GitHub rate-limits or fails,
  the result is cached for just a few minutes and the page shows a calm notice, with your `extras`
  still visible. Empty results show an empty state, never a broken grid.
- **Contributions** use the GraphQL API when `GITHUB_TOKEN` is set. Otherwise they fall back to
  GitHub's public contribution calendar. If both fail, a "branch is resting" state appears.
- **Nothing is fetched at build time.** Pages render per request (needed for the CSP nonce), and
  GitHub data is cached on the server: refreshed hourly in the background, retried after five
  minutes on failure, and the last good result keeps showing if a refresh fails.

### Environment variables

For local development, copy `deploy/portfolio.env.example` to `.env.local`. All are optional:

| Variable | Why |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for links, Open Graph, the sitemap and robots. Defaults to `https://jeary.dev`. Inlined at build time. |
| `GITHUB_TOKEN` | A fine-grained token with **no scopes**. It raises the API limit from 60 to 5,000 requests per hour and enables the GraphQL contributions source. |

## Deploy

Self-hosted with Docker Compose behind a Cloudflare Tunnel. See [docs/deploy.md](docs/deploy.md).

Generated for you: the Open Graph image (`/opengraph-image`), the favicon (`icon.svg`), the Apple
touch icon, `sitemap.xml`, `robots.txt` and a web manifest.

## Project structure

```
src/
  app/                 layout (fonts, metadata), page, OG image, icons, sitemap, robots, 404
  config/              ← your content: site.ts, projects.ts
  app/api/             readme/[repo] (README for the Explore modal), health
  proxy.ts             per-request CSP nonce
  lib/                 github.ts (server data), hooks.ts, utils.ts, og.tsx
  components/
    providers/         Lenis smooth scroll (shares GSAP's ticker), Motion config
    chrome/            Loader, Header (+ mobile menu), Cursor (+ petal trail)
    hero/              Hero, PetalField (R3F shader), PetalCanvas (lazy + pause), BrushName, RoleRotator
    decor/             BranchGrowth (scroll-grown branch)
    sections/          About, Disciplines (+ 4 vignettes), Projects, Activity, Contact, Footer
    ui/                Magnetic, InkLink, RevealText, BrushDivider, SectionHeading, Parallax, Sakura shapes
```

## Performance and accessibility notes

- **Only transform and opacity are animated.** The exceptions are SVG `stroke-dashoffset` for the
  drawn branches and brush strokes, which is a cheap repaint of a single path.
- **three.js is lazy.** It's fetched after the intro, during idle time. Until then, and always under
  reduced motion or without WebGL, a static petal composition is shown.
- **Offscreen work pauses.** The petal canvas stops rendering when the hero leaves the viewport or
  the tab is hidden. Footer petals only animate while visible.
- **Petal counts scale by device:** 650 on desktop, 320 on low-core CPUs, 160 on mobile and touch.
  DPR is capped at 1.5.
- **No layout shift:** the pinned horizontal section uses CSS `sticky` instead of a JS pin, and the
  role rotator reserves its widest width.
- **`prefers-reduced-motion`** turns off Lenis, the loader, particles, the cursor, parallax and
  scrubbing. The horizontal section becomes a normal stack and everything appears in its final
  state.
- **Keyboard and screen readers:** there's a skip link, visible focus rings, a focus-managed mobile
  menu (Esc closes it), semantic landmarks and headings, labelled form fields, and live regions for
  copy feedback.
- **Without JavaScript,** content stays visible: animated starting states only apply once a `js`
  class is set before first paint.

Lighthouse (desktop, local production build): Performance 97–98, Accessibility 100,
Best Practices 100, SEO 100.

## Contact flow

There's no email and no form backend. The contact form composes a message, copies it to the
visitor's clipboard and opens Discord so they can DM **czrbyn**. If the clipboard is blocked, the
text is shown so they can copy it by hand.
