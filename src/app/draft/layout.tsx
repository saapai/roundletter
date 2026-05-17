import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "$3,453 → $100,000 in 10 weeks. Here's the entire plan. - YouTube",
  description: "aureliex — the wager is live.",
};

export default function DraftLayout({ children }: { children: React.ReactNode }) {
  return <div style={{ position: "fixed", inset: 0, zIndex: 9999, overflow: "auto" }}>{children}</div>;
}
