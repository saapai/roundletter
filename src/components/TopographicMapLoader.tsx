"use client";

import dynamic from "next/dynamic";

const TopographicMap = dynamic(
  () => import("@/components/TopographicMap"),
  { ssr: false },
);

export default function TopographicMapLoader() {
  return <TopographicMap />;
}
