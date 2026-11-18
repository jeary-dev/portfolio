import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter_Tight, JetBrains_Mono, Shippori_Mincho } from "next/font/google";
import { connection } from "next/server";
import { ViewTransition } from "react";
import { site } from "@/config/site";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { Cursor } from "@/components/chrome/Cursor";
import { Header } from "@/components/chrome/Header";
import { Loader } from "@/components/chrome/Loader";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

const sans = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  display: "swap",
});

// Japanese glyphs are delivered as unicode-range slices; only the handful of
// characters used on the page are downloaded, so preloading is disabled.
const jp = Shippori_Mincho({
  variable: "--font-shippori",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
  preload: false,
});

const mono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.handle,
  authors: [{ name: site.name, url: site.github.url }],
  creator: site.name,
  keywords: [
    "Minecraft plugins",
    "Paper",
    "Spigot",
    "Kotlin",
    "Discord bots",
    "Next.js",
    "developer portfolio",
    site.handle,
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: `${site.name} · ${site.handle}`,
    title: site.title,
    description: site.description,
    locale: "en",
  },
  twitter: { card: "summary_large_image", title: site.title, description: site.description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0b0a0c",
  colorScheme: "dark",
};

/**
 * Every page renders per request: the strict CSP in src/proxy.ts needs a fresh
 * nonce on Next's scripts, and GitHub data is fetched at runtime (cached
 * server-side) instead of being frozen into the build. `instant = false`
 * allows the route to wait for the request instead of serving a static shell.
 */
export const instant = false;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  await connection();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable} ${jp.variable} ${mono.variable} antialiased`}
    >
      <body className="washi min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-sakura focus:px-4 focus:py-2 focus:text-ink"
        >
          Skip to content
        </a>
        <MotionProvider>
          <SmoothScroll>
            <Loader />
            <Header />
            <ViewTransition name="page">
              <div id="main">{children}</div>
            </ViewTransition>
            <Cursor />
          </SmoothScroll>
        </MotionProvider>
      </body>
    </html>
  );
}
