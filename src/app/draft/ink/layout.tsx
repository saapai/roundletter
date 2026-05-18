import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Living Ink — aureliex",
};

export default function InkLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, overflow: "hidden" }}>
      {children}
    </div>
  );
}
