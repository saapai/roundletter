"use client";

import { useState } from "react";

type Tier = "Budget" | "Mid" | "Elite";

type Props = {
  image?: string | null;
  palette?: string[];
  alt?: string;
  tier?: Tier;
};

function hashPosition(seed: string): { x: number; y: number } {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 17 + seed.charCodeAt(i) * 7) >>> 0;
  return { x: 20 + (h % 50), y: 15 + ((h >> 8) % 45) };
}

function buildGradient(palette: string[] | undefined, seed: string): string {
  const p =
    palette && palette.length > 0
      ? palette
      : ["#d8d2c4", "#a89d88", "#6b6560"];
  const stops: string[] = [];
  const n = p.length;
  for (let i = 0; i < n; i++) {
    const pct = Math.round((i / Math.max(1, n - 1)) * 100);
    stops.push(`${p[i]} ${pct}%`);
  }
  const { x, y } = hashPosition(seed);
  return `radial-gradient(ellipse 120% 100% at ${x}% ${y}%, ${stops.join(", ")})`;
}

const TIER_RING: Record<Tier, string> = {
  Budget: "ring-black/10",
  Mid: "ring-black/20",
  Elite: "ring-[#8b3a2e]/40",
};

const TIER_INNER: Record<Tier, string> = {
  Budget:
    "shadow-[inset_0_-10px_24px_rgba(0,0,0,0.10),inset_0_2px_4px_rgba(255,255,255,0.20)]",
  Mid: "shadow-[inset_0_-12px_28px_rgba(0,0,0,0.14),inset_0_2px_5px_rgba(255,255,255,0.22)]",
  Elite:
    "shadow-[inset_0_-14px_32px_rgba(0,0,0,0.18),inset_0_3px_6px_rgba(255,255,255,0.28)]",
};

export default function ApparatusThumb({
  image,
  palette,
  alt = "",
  tier = "Budget",
}: Props) {
  const [errored, setErrored] = useState(false);
  const showImage = image && !errored;
  const gradient = buildGradient(palette, alt || "");
  const ringClass = TIER_RING[tier];
  const innerClass = TIER_INNER[tier];

  return (
    <div
      className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl ring-1 ${ringClass} ${innerClass}`}
      style={{ background: gradient }}
      aria-hidden={!showImage}
    >
      {showImage ? (
        <img
          src={image as string}
          alt={alt}
          loading="lazy"
          onError={() => setErrored(true)}
          className="h-full w-full object-cover"
        />
      ) : null}
    </div>
  );
}
