"use client";

import dynamic from "next/dynamic";

const CoilVisualization = dynamic(
  () => import("@/components/CoilVisualization"),
  { ssr: false },
);

export default function CoilVisualizationLoader() {
  return <CoilVisualization />;
}
