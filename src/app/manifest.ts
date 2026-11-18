import type { MetadataRoute } from "next";
import { site } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} · ${site.handle}`,
    short_name: site.handle,
    description: site.description,
    start_url: "/",
    display: "browser",
    background_color: "#0b0a0c",
    theme_color: "#0b0a0c",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
