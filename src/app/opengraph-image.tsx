import { ImageResponse } from "next/og";

// Social card for / — THE RECORD, second edition.
// Static by design: the verdict is the message, not the tick.

export const runtime = "edge";
export const revalidate = 3600;
export const alt = "aureliex — project 0 failed. this is project 1.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#F4EFE6",
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
            fontSize: 22,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#6B6560",
          }}
        >
          <span>aureliex · the record · second edition</span>
          <span>filed july 2026</span>
        </div>

        {/* middle: the verdict */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <span
            style={{
              fontSize: 118,
              lineHeight: 1,
              letterSpacing: -3,
              color: "#1C1A17",
            }}
          >
            project 0 failed.
          </span>
          <span
            style={{
              fontSize: 44,
              lineHeight: 1.2,
              fontStyle: "italic",
              color: "#6B6560",
            }}
          >
            ai could not do the impossible.
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 18,
              marginTop: 14,
              fontSize: 30,
              color: "#1C1A17",
            }}
          >
            <span style={{ color: "#8B6914" }}>$3,453.83</span>
            <span>→</span>
            <span style={{ textDecoration: "line-through", color: "#8B3A2E" }}>
              $100,000
            </span>
            <span style={{ color: "#6B6560" }}>· closed jun 21, 2026</span>
          </div>
        </div>

        {/* bottom */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 22,
            color: "#6B6560",
          }}
        >
          <span>
            this is <span style={{ color: "#0B6E84", fontStyle: "italic" }}>project 1</span> · no goal posts. yet · closes dec 31, 2026
          </span>
          <span>aureliex.com</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
