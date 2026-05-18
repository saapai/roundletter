import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "nothing, except everything — YouTube",
  description: "aureliex",
};

export default function DraftLayout({ children }: { children: React.ReactNode }) {
  return <div style={{ position: "fixed", inset: 0, zIndex: 9999, overflow: "auto" }}>{children}</div>;
}
