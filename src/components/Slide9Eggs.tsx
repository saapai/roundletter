"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { EGGS, getThemeByN } from "@/lib/v1data";

// Slide 9 is a 100-egg click canvas. Clicks anywhere on the slide jump to the
// nearest egg's /v1/{n} by Euclidean distance (fractions 0..1 of slide box).
// Rare themes have fewer + tighter eggs → smaller effective Voronoi cells →
// rarer random-click hits. A faint indicator tracks the nearest egg under
// the cursor so users get feedback without spoiling the target theme.

function nearestEggIndex(xFrac: number, yFrac: number): number {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < EGGS.length; i++) {
    const e = EGGS[i];
    const dx = e.x - xFrac;
    const dy = e.y - yFrac;
    const d = dx * dx + dy * dy;
    if (d < bestD) { bestD = d; best = i; }
  }
  return best;
}

export default function Slide9Eggs() {
  const router = useRouter();
  const layerRef = useRef<HTMLDivElement | null>(null);
  const [nearest, setNearest] = useState<{ x: number; y: number; glow: string } | null>(null);
  const rafRef = useRef<number | null>(null);
  const pendingRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const el = layerRef.current;
    if (!el) return;

    const flush = () => {
      rafRef.current = null;
      const p = pendingRef.current;
      if (!p) return;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const fx = (p.x - r.left) / r.width;
      const fy = (p.y - r.top) / r.height;
      const idx = nearestEggIndex(fx, fy);
      const egg = EGGS[idx];
      const theme = getThemeByN(egg.n);
      if (!theme) return;
      setNearest({ x: egg.x * r.width, y: egg.y * r.height, glow: theme.green });
    };

    const onMove = (e: MouseEvent) => {
      pendingRef.current = { x: e.clientX, y: e.clientY };
      if (rafRef.current == null) rafRef.current = requestAnimationFrame(flush);
    };
    const onLeave = () => setNearest(null);
    const onClick = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const fx = (e.clientX - r.left) / r.width;
      const fy = (e.clientY - r.top) / r.height;
      const idx = nearestEggIndex(fx, fy);
      const egg = EGGS[idx];
      router.push(`/v1/${egg.n}`);
    };

    el.addEventListener("mousemove", onMove, { passive: true });
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("click", onClick);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("click", onClick);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [router]);

  return (
    <div ref={layerRef} className="s9-egg-layer" aria-hidden="true">
      {nearest && (
        <span
          className="s9-egg-indicator"
          style={{
            left: `${nearest.x}px`,
            top: `${nearest.y}px`,
            ["--egg-glow" as string]: nearest.glow,
          }}
        />
      )}
    </div>
  );
}
