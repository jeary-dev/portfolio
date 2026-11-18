import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const PETAL = "M0 0C-4.2-1.8-5.8-6.6-2.4-10L0-8.4L2.4-10C5.8-6.6 4.2-1.8 0 0Z";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: 180, height: 180, background: "#0b0a0c", display: "flex" }}>
        <svg width="180" height="180" viewBox="0 0 180 180">
          <g transform="translate(90 92) scale(6.2)">
            {[0, 72, 144, 216, 288].map((r) => (
              <path key={r} d={PETAL} transform={`rotate(${r})`} fill="#f2a7c3" />
            ))}
            <circle r="1.8" fill="#b8433f" />
          </g>
        </svg>
      </div>
    ),
    size,
  );
}
