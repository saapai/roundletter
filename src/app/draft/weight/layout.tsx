import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Weight",
  description: "Gravity well visualization",
};

export default function WeightLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, overflow: "hidden" }}>
      {children}
    </div>
  );
}
