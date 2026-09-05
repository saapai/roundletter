import { ImageResponse } from "next/og";

// Social card for / — The Broadsheet homepage.

export const runtime = "edge";
export const revalidate = 3600;
export const alt = "aureliex — letters on building, taste, and what lasts";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#FAF6F0",
          color: "#1C1A17",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* eyebrow */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 18,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#6B6560",
          }}
        >
          <span>est. april 2026 · los angeles</span>
          <span>563 commits · 6 eras</span>
        </div>

        {/* middle: the wordmark */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <span
            style={{
              fontSize: 140,
              lineHeight: 1,
              letterSpacing: -4,
              fontStyle: "italic",
              color: "#1C1A17",
            }}
          >
            aureliex<span style={{ color: "#8B3A2E" }}>.</span>
          </span>
          <span
            style={{
              fontSize: 32,
              lineHeight: 1.3,
              fontStyle: "italic",
              color: "#6B6560",
            }}
          >
            letters on building, taste, and what lasts
          </span>
        </div>

        {/* bottom */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 18,
            color: "#6B6560",
          }}
        >
          <span>a public record of thinking out loud</span>
          <span>aureliex.com</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
