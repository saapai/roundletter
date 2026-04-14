import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "aureliex — $3,453 → $100,000 by my birthday";
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
        <div style={{ fontSize: 22, letterSpacing: 8, textTransform: "uppercase", color: "#6B6560" }}>
          aureliex · round letter · 0
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 110, lineHeight: 1, fontStyle: "italic", letterSpacing: -2 }}>
            $3,453 → $100,000
          </div>
          <div style={{ fontSize: 36, lineHeight: 1.2, maxWidth: 980, color: "#1C1A17" }}>
            by my birthday. five AI agents. no job. the pre-mortem, published before I fail.
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, color: "#6B6560" }}>
          <span>a 29x. the S&amp;P does 10x in 25 years.</span>
          <span>aureliex.com</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
