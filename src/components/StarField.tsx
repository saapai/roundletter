"use client";

import { useMemo, useState } from "react";
import type { PositionLive } from "@/lib/portfolio-aggregate";

// StarField v2 — Constellation view of holdings.
// X = entry order (proxy for entry date) · Y = since-entry %
// Star SIZE = position weight (% of portfolio)
// Star OPACITY ∝ |today Δ%| · halo on biggest today-mover
// Subtle gold sparkline trail behind each star (last 5 closes)
// Tap a star → in-SVG popover with ticker / shares / price / today / since-entry
// Hover (desktop): ticker label brightens. Mobile: always-visible small label.

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

function fmtPctSimple(n: number): string {
  if (Math.abs(n) < 0.005) return "0.00%";
  const s = `${Math.abs(n).toFixed(2)}%`;
  return n > 0 ? `+${s}` : `−${s}`;
}

function fmt$Simple(n: number, decimals = 2): string {
  const abs = Math.abs(n);
  const s = `$${abs.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
  if (n > 0.005) return `+${s}`;
  if (n < -0.005) return `−${s}`;
  return s;
}

export default function StarField({ holdings, onSelect, selected }: Props) {
  const [hover, setHover] = useState<string | null>(null);
  // Local popover ticker (separate from external `selected` so popover lives
  // inside the SVG and can be controlled in tandem).
  const [pop, setPop] = useState<string | null>(null);

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
    const totalValue = Math.max(
      1,
      holdings.reduce((a, p) => a + (p.current_value || 0), 0),
    );
    const weights = holdings.map((p) => (p.current_value || 0) / totalValue);
    const maxWeight = Math.max(0.01, ...weights);
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
      const yNorm = p.delta_entry_pct / maxAbsY; // -1..1
      const y = PAD_Y + innerH / 2 - yNorm * (innerH / 2);
      const todayMag = Math.abs(p.delta_today_pct) / maxAbsToday;
      const opacity = 0.45 + 0.55 * todayMag;
      const isUp = p.delta_entry_pct >= 0;
      const isMover = i === moverIdx && moverMag > 0;
      // Star SIZE = position weight (with a baseline so tiny positions still visible).
      const w = weights[i] / maxWeight; // 0..1
      const r = 2.6 + 5.4 * w + 0.6 * todayMag;
      const hashDelay = (hashTicker(p.ticker) % 1200) / 1000;
      // Trail = last 5 sparkline points, positioned to the LEFT of the star.
      const trailPts = (() => {
        const sp = (p.sparkline || []).slice(-5);
        if (sp.length < 2) return "";
        const lo = Math.min(...sp);
        const hi = Math.max(...sp);
        const span = Math.max(0.0001, hi - lo);
        const TRAIL_W = 26;
        const TRAIL_H = 6;
        return sp
          .map((v, idx) => {
            const tX = x - TRAIL_W + (idx / (sp.length - 1)) * TRAIL_W;
            const norm = (v - lo) / span; // 0..1
            const tY = y + TRAIL_H / 2 - norm * TRAIL_H;
            return `${tX.toFixed(1)},${tY.toFixed(1)}`;
          })
          .join(" ");
      })();
      return { p, x, y, r, opacity, isUp, isMover, hashDelay, trailPts, weight: weights[i] };
    });
  }, [holdings]);

  if (holdings.length === 0) return null;

  const ecliptic = PAD_Y + (H - PAD_Y * 2) / 2;
  const popLayout = layout.find((l) => l.p.ticker === pop) || null;

  return (
    <svg
      className="starfield"
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height={H}
      role="img"
      aria-label={`constellation of ${holdings.length} holdings`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setPop(null);
          onSelect?.(null);
        }
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

      {/* trails first so stars layer on top */}
      {layout.map(({ p, trailPts }) =>
        trailPts ? (
          <polyline
            key={`trail-${p.ticker}`}
            className="star-trail"
            points={trailPts}
            fill="none"
          />
        ) : null,
      )}

      {layout.map(({ p, x, y, r, opacity, isUp, isMover, hashDelay }) => {
        const sel = selected === p.ticker || pop === p.ticker;
        const showLabel = hover === p.ticker || sel;
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
              setPop((prev) => (prev === p.ticker ? null : p.ticker));
              onSelect?.(p);
            }}
            onMouseEnter={() => setHover(p.ticker)}
            onMouseLeave={() => setHover(null)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setPop((prev) => (prev === p.ticker ? null : p.ticker));
                onSelect?.(p);
              }
            }}
          >
            {isMover && (
              <circle className="star-halo" cx={x} cy={y} r={r + 8} />
            )}
            <circle className="star-core" cx={x} cy={y} r={r} />
            {/* hover/selected hi-fi label (desktop emphasis) */}
            <text
              className="star-tick"
              x={x}
              y={y - r - 6}
              textAnchor="middle"
              opacity={showLabel ? 1 : 0.35}
            >
              {p.ticker}
            </text>
            {/* always-visible mobile mini-label */}
            <text
              className="star-tick-mobile"
              x={x}
              y={y + r + 11}
              textAnchor="middle"
            >
              {p.ticker}
            </text>
            <text
              className="star-glyph"
              x={x}
              y={y + r + 22}
              textAnchor="middle"
              opacity={showLabel ? 0.9 : 0}
            >
              {isUp ? "▲" : "▼"}
            </text>
          </g>
        );
      })}

      {/* in-SVG popover at the selected star */}
      {popLayout && (() => {
        const POP_W = 152;
        const POP_H = 88;
        const margin = 8;
        // Place to the right by default; flip left if it would overflow.
        let px = popLayout.x + popLayout.r + margin;
        if (px + POP_W > W - 4) px = popLayout.x - popLayout.r - margin - POP_W;
        let py = popLayout.y - POP_H / 2;
        if (py < 4) py = 4;
        if (py + POP_H > H - 4) py = H - 4 - POP_H;
        const sp = popLayout.p;
        const todayUp = sp.delta_today_pct >= 0;
        const entryUp = sp.delta_entry_pct >= 0;
        return (
          <g
            className="star-pop"
            onClick={(e) => e.stopPropagation()}
            pointerEvents="all"
          >
            {/* leader line from star to popover */}
            <line
              className="star-pop-leader"
              x1={popLayout.x}
              y1={popLayout.y}
              x2={px < popLayout.x ? px + POP_W : px}
              y2={py + POP_H / 2}
            />
            <rect
              className="star-pop-bg"
              x={px}
              y={py}
              width={POP_W}
              height={POP_H}
              rx={4}
              ry={4}
            />
            <text className="star-pop-ticker" x={px + 9} y={py + 16}>
              {sp.ticker}
            </text>
            <text className="star-pop-shares" x={px + POP_W - 9} y={py + 16} textAnchor="end">
              {sp.shares.toLocaleString("en-US", { maximumFractionDigits: 3 })} sh
            </text>
            <text className="star-pop-price" x={px + 9} y={py + 34}>
              {sp.current_price != null ? `$${sp.current_price.toFixed(2)}` : "—"}
            </text>
            <text
              className={`star-pop-row ${todayUp ? "star-pop-row--up" : "star-pop-row--down"}`}
              x={px + 9}
              y={py + 54}
            >
              today {fmtPctSimple(sp.delta_today_pct)} · {fmt$Simple(sp.delta_today_dollars)}
            </text>
            <text
              className={`star-pop-row ${entryUp ? "star-pop-row--up" : "star-pop-row--down"}`}
              x={px + 9}
              y={py + 72}
            >
              entry {fmtPctSimple(sp.delta_entry_pct)} · {fmt$Simple(sp.delta_entry_dollars)}
            </text>
          </g>
        );
      })()}
    </svg>
  );
}
