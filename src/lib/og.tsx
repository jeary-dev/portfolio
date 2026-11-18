import { cacheLife } from "next/cache";
import { site } from "@/config/site";

/** Fetch a Google font subset as TTF for Satori. Returns null when offline. */
async function loadGoogleFont(family: string, text: string, extra = "") {
  "use cache";
  cacheLife("max");
  try {
    const url = `https://fonts.googleapis.com/css2?family=${family}${extra}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(url)).text();
    const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
    if (!src) return null;
    const res = await fetch(src[1]);
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

const PETAL = "M0 0C-4.2-1.8-5.8-6.6-2.4-10L0-8.4L2.4-10C5.8-6.6 4.2-1.8 0 0Z";

/** Shared artwork for the Open Graph image and Apple touch icon. */
export async function ogArtwork(width: number, height: number) {
  const roles = site.roles.join("  ·  ");
  const [display, jp] = await Promise.all([
    loadGoogleFont("Cormorant+Garamond", site.name, ":ital,wght@1,300"),
    loadGoogleFont("Shippori+Mincho", `${site.nameJp}桜開発者`),
  ]);

  const petals = [
    [80, 90, 30, 2.6, 0.6], [1050, 70, 140, 3.4, 0.8], [980, 470, 200, 2.2, 0.5],
    [160, 520, 260, 2.8, 0.45], [640, 60, 80, 1.8, 0.4], [1120, 300, 300, 2, 0.55],
    [420, 560, 120, 1.6, 0.35], [860, 210, 20, 1.4, 0.3],
  ];

  const element = (
    <div style={{ width, height, display: "flex", background: "#0b0a0c", position: "relative", color: "#f3eee8" }}>
      <div style={{ position: "absolute", right: -160, top: -120, width: 640, height: 640, borderRadius: 9999, border: "1px solid rgba(242,167,195,0.18)", display: "flex" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", background: "radial-gradient(ellipse at 75% 20%, rgba(242,167,195,0.16), transparent 60%)" }} />
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {petals.map(([x, y, r, s, o], i) => (
          <path key={i} d={PETAL} transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} fill="#f2a7c3" opacity={o} />
        ))}
      </svg>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 90px 90px", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 22, letterSpacing: 6, color: "#9a95a1" }}>
          <div style={{ width: 60, height: 1, background: "#f2a7c3", display: "flex" }} />
          {site.handle.toUpperCase()}
          {jp && <span style={{ fontFamily: "JP", color: "#f2a7c3", letterSpacing: 8 }}>開発者</span>}
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 30 }}>
          <div style={{ fontFamily: display ? "Display" : undefined, fontStyle: "italic", fontWeight: 300, fontSize: 250, lineHeight: 1.05, letterSpacing: -6 }}>
            {site.name}
          </div>
          {jp && (
            <div style={{ display: "flex", flexDirection: "column", fontFamily: "JP", fontSize: 24, color: "#f2a7c3", marginTop: 50, lineHeight: 1.25 }}>
              {[...site.nameJp].map((c, i) => (
                <span key={i}>{c}</span>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "#f3eee8", opacity: 0.8 }}>{roles}</div>
      </div>
      <div style={{ position: "absolute", right: 90, bottom: 90, width: 64, height: 64, borderRadius: 6, background: "#b8433f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, color: "#0b0a0c", fontFamily: jp ? "JP" : undefined }}>
        {jp ? "桜" : ""}
      </div>
    </div>
  );

  const fonts = [
    ...(display ? [{ name: "Display", data: display, style: "italic" as const, weight: 300 as const }] : []),
    ...(jp ? [{ name: "JP", data: jp, style: "normal" as const, weight: 400 as const }] : []),
  ];
  return { element, fonts };
}
