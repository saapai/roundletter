import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Telling the Same Joke Over and Over and Over and Over - YouTube",
  description: "Aaron Westberry",
};

export default function DraftLayout({ children }: { children: React.ReactNode }) {
  return <div style={{ position: "fixed", inset: 0, zIndex: 9999, overflow: "auto" }}>{children}</div>;
}
