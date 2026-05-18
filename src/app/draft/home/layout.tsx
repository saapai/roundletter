import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "aureliex",
  description: "drinks are on me.",
};

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return <div style={{ position: "fixed", inset: 0, zIndex: 9999, overflow: "auto" }}>{children}</div>;
}
