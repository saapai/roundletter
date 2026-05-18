import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "aureliex",
  description: "nothing, except everything.",
};

export default function ReelLayout({ children }: { children: React.ReactNode }) {
  return <div style={{ position: "fixed", inset: 0, zIndex: 9999, overflow: "hidden" }}>{children}</div>;
}
