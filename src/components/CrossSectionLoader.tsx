"use client";

import dynamic from "next/dynamic";

const CrossSection = dynamic(
  () => import("@/components/CrossSection"),
  { ssr: false },
);

export default function CrossSectionLoader() {
  return <CrossSection />;
}
