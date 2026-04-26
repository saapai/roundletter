"use client";

import { useMemo, useState } from "react";
import type { PositionLive } from "@/lib/portfolio-aggregate";

// StarField — Constellation view of holdings.
// X = entry order (proxy for entry date) · Y = since-entry %
// brightness ∝ |today Δ%| · halo on biggest today-mover.
// Tap a star → emits onSelect with the chosen position.

type Props = {
  holdings: PositionLive[];
  onSelect?: (p: PositionLive | null) => void;
  selected?: string | null;
};

const W = 430;
const H = 560;
const PAD_X = 28;
const PAD_Y = 48;

function hashTicker(t: string): number {
  let h = 0;
  for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export default function StarField({ holdings, onSelect, selected }: Props) {
  const [hover, setHover] = useState<string | null>(null);

  const layout = useMemo(() => {
    const n = holdings.length;
    if (n === 0) return [];
    const maxAbsY = Math.max(
      6,
      ...holdings.map((p) => Math.abs(p.delta_entry_pct)),
    );
    const maxAbsToday = Math.max(
      0.001,
      ...holdings.map((p) => Math.abs(p.delta_today_pct)),
    );
    // Identify today's biggest mover (single).
    let moverIdx = 0;
    let moverMag = -1;
    holdings.forEach((p, i) => {
      const m = Math.abs(p.delta_today_pct);
      if (m > moverMag) {
        moverMag = m;
        moverIdx = i;
      }
    });
    const innerW = W - PAD_X * 2;
    const innerH = H - PAD_Y * 2;
    return holdings.map((p, i) => {
      const tx = n === 1 ? 0.5 : i / (n - 1);
      const x = PAD_X + tx * innerW;
      // Y: positive returns plot UP (smaller y in SVG).
      const yNorm = p.delta_entry_pct / maxAbsY; // -1..1
      const y = PAD_Y + innerH / 2 - yNorm * (innerH / 2);
      const todayMag = Math.abs(p.delta_today_pct) / maxAbsToday;
      const opacity = 0.45 + 0.55 * todayMag; // 0.45..1
      const isUp = p.delta_entry_pct >= 0;
      const isMover = i === moverIdx && moverMag > 0;
      const r = 3.2 + 1.4 * todayMag;
      const hashDelay = (hashTicker(p.ticker) % 1200) / 1000; // 0..1.2s
      return { p, x, y, r, opacity, isUp, isMover, hashDelay };
    });
  }, [holdings]);

  if (holdings.length === 0) return null;

  const ecliptic = PAD_Y + (H - PAD_Y * 2) / 2;

  return (
    <svg
      className="starfield"
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height={H}
      role="img"
      aria-label={`constellation of ${holdings.length} holdings`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onSelect?.(null);
      }}
    >
      {/* ecliptic break-even axis */}
      <line
        className="starfield-ecliptic"
        x1={PAD_X}
        x2={W - PAD_X}
        y1={ecliptic}
        y2={ecliptic}
      />
      <text
        className="starfield-axis-label"
        x={W - PAD_X}
        y={ecliptic - 4}
        textAnchor="end"
      >
        break-even
      </text>

      {layout.map(({ p, x, y, r, opacity, isUp, isMover, hashDelay }) => {
        const sel = selected === p.ticker;
        return (
          <g
            key={p.ticker}
            className={`star ${isUp ? "star--up" : "star--down"} ${
              isMover ? "star--mover" : ""
            } ${sel ? "star--sel" : ""}`}
            style={{
              opacity: isUp ? opacity : opacity * 0.9,
              transformOrigin: `${x}px ${y}px`,
              animationDelay: `-${hashDelay}s`,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(p);
            }}
            onMouseEnter={() => setHover(p.ticker)}
            onMouseLeave={() => setHover(null)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect?.(p);
              }
            }}
          >
            {isMover && (
              <circle className="star-halo" cx={x} cy={y} r={r + 8} />
            )}
            <circle className="star-core" cx={x} cy={y} r={r} />
            <text
              className="star-tick"
              x={x}
              y={y - r - 6}
              textAnchor="middle"
              opacity={hover === p.ticker || sel ? 1 : 0.35}
            >
              {p.ticker}
            </text>
            <text
              className="star-glyph"
              x={x}
              y={y + r + 12}
              textAnchor="middle"
              opacity={hover === p.ticker || sel ? 1 : 0}
            >
              {isUp ? "▲" : "▼"}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
