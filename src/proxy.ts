import { NextResponse, type NextRequest } from "next/server";

/**
 * Strict, nonce-based Content-Security-Policy.
 *
 * Next.js reads the nonce from the request's CSP header and stamps it on its
 * own scripts (framework, page bundles, RSC payload). That only works when the
 * page renders per request, which the root layout opts into (`connection()`).
 * The site has no inline scripts of its own.
 *
 * Styles allow 'unsafe-inline' because React, Motion and GSAP write `style`
 * attributes, and READMEs rendered by GitHub use them too. Images may come
 * from GitHub's CDNs (README images and badges are proxied through camo).
 */
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const dev = process.env.NODE_ENV === "development";
  const github = "https://*.githubusercontent.com https://github.com";

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: ${github}`,
    `media-src 'self' ${github}`,
    "font-src 'self'",
    `connect-src 'self'${dev ? " ws: wss:" : ""}`,
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      // Pages only: skip API routes, build assets, files with an extension and
      // generated metadata images, none of which run scripts.
      source: "/((?!api/|_next/static|_next/image|icon|apple-icon|opengraph-image|.*\\.[a-z0-9]+$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
