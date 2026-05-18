import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "aureliex",
};

export default function BetLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, overflow: "hidden" }}>
      {children}
    </div>
  );
}
