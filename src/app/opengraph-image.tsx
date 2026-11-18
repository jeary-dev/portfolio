import { ImageResponse } from "next/og";
import { site } from "@/config/site";
import { ogArtwork } from "@/lib/og";

export const alt = `${site.name}: Minecraft plugins, Discord bots, websites and apps`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const { element, fonts } = await ogArtwork(size.width, size.height);
  return new ImageResponse(element, { ...size, fonts });
}
