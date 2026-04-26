"use client";
import { useId, useMemo, useState } from "react";

// Generalized portfolio-growth chart. Pure presentation: takes a pre-computed
// series of { ts, value } points and renders the same nasdaq-quote-style card
// the legacy PortfolioChart used (eyebrow, current value, delta/pct, 1D/2D/All
// pillbox filters, filled SVG sparkline). The legacy `PortfolioChart` now
// delegates here after it finishes its /api/prices fetch + bar reconstruction;
// new callers (e.g. /portfolio category tiles, top-line whole-portfolio) can
// pass any series they like.
//
// `category` is a free-form slug ("portfolio", "personal", "art", …) used in
// the eyebrow line. `label` is the human-readable subtitle.

export type SeriesPoint = { ts: number; value: number };

type Timeframe = "1D" | "2D" | "All";

type Props = {
  category: string;
  series: SeriesPoint[];
  label: string;
  // Bars-per-window for the 1D / 2D filters. Defaults match the legacy
  // PortfolioChart (30-min bars: 13 ≈ one trading day, 26 ≈ two).
  oneDayBars?: number;
  twoDayBars?: number;
  // Optional override for the empty-state copy.
  emptyMessage?: string;
  // When true, suppresses the 1D / 2D / All pill filters (used for tiny
  // sparkline-only contexts like the placeholder CategoryCards).
  hideFilters?: boolean;
};

export default function PortfolioGrowthChart({
  category,
  series,
  label,
  oneDayBars = 13,
  twoDayBars = 26,
  emptyMessage = "quotes unavailable right now. try again shortly.",
  hideFilters = false,
}: Props) {
  const [tf, setTf] = useState<Timeframe>("2D");

  const filtered = useMemo(() => {
    if (series.length === 0) return series;
    if (tf === "1D") return series.slice(-oneDayBars);
    if (tf === "2D") return series.slice(-twoDayBars);
    return series;
  }, [series, tf, oneDayBars, twoDayBars]);

  const { last, delta, pct } = useMemo(() => {
    if (filtered.length < 2) return { last: null as number | null, delta: 0, pct: 0 };
    const a = filtered[0].value;
    const b = filtered[filtered.length - 1].value;
    return { last: b, delta: b - a, pct: a === 0 ? 0 : ((b - a) / a) * 100 };
  }, [filtered]);

  return (
    <section className="port-chart">
      <header className="port-chart-head">
        <div className="pch-title">
          <span className="pch-eyebrow">// {category} · growth</span>
          <span className="pch-sub">{label}</span>
        </div>
        {!hideFilters && (
          <div className="pch-filters" role="tablist">
            {(["1D", "2D", "All"] as Timeframe[]).map((x) => (
              <button
                key={x}
                type="button"
                className={`pch-filter ${tf === x ? "is-active" : ""}`}
                onClick={() => setTf(x)}
              >
                {x}
              </button>
            ))}
          </div>
        )}
      </header>

      {filtered.length < 2 ? (
        <div className="pch-empty"><em>{emptyMessage}</em></div>
      ) : (
        <>
          <div className="pch-values">
            <span className={`pch-value ${delta >= 0 ? "is-up" : "is-down"}`}>
              {last != null ? `$${last.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : "—"}
            </span>
            <span className={`pch-delta ${delta >= 0 ? "is-up" : "is-down"}`}>
              {delta >= 0 ? "+" : "−"}${Math.abs(delta).toLocaleString("en-US", { maximumFractionDigits: 0 })}
              {"  "}
              ({delta >= 0 ? "+" : "−"}
              {Math.abs(pct).toFixed(2)}%) · {tf}
            </span>
          </div>
          <Sparkline points={filtered} up={delta >= 0} />
        </>
      )}
    </section>
  );
}

// Simple SVG line chart with a filled area beneath — nasdaq-quote style.
// Lifted verbatim from the legacy PortfolioChart so the visual is identical.
function Sparkline({
  points,
  up,
}: {
  points: SeriesPoint[];
  up: boolean;
}) {
  const W = 900;
  const H = 220;
  const padX = 8;
  const padY = 16;
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = (W - padX * 2) / Math.max(1, points.length - 1);
  const path = points
    .map((p, i) => {
      const x = padX + i * step;
      const y = padY + (H - padY * 2) * (1 - (p.value - min) / range);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
  const area =
    `${path} L ${(padX + (points.length - 1) * step).toFixed(2)} ${H - padY} L ${padX} ${H - padY} Z`;
  const color = up ? "#3B7A4A" : "#8B3A2E";
  // Unique gradient id per instance so multiple charts on the same page don't
  // collide on the shared `pch-fill` defs id. useId is SSR-safe.
  const reactId = useId();
  const gradId = `pch-fill-${reactId.replace(/:/g, "")}`;
  return (
    <svg
      className="pch-svg"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      {points.length > 0 && (
        <line
          x1={padX}
          y1={padY + (H - padY * 2) * (1 - (points[0].value - min) / range)}
          x2={W - padX}
          y2={padY + (H - padY * 2) * (1 - (points[0].value - min) / range)}
          stroke="rgba(28,26,23,0.12)"
          strokeDasharray="3 3"
          strokeWidth="1"
        />
      )}
    </svg>
  );
}
