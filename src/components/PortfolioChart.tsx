"use client";
import { useEffect, useMemo, useState } from "react";

// Stock-growth-style portfolio chart. Fetches /api/prices (Yahoo 30-min bars,
// 5d range) and computes portfolio value at each timestamp = sum(shares × close).
// Three timeframes: 1D (last ~13 bars), 2D (last ~26), All (5d). Each shows
// $ change + % change relative to the FIRST bar of the selected window.

type Holding = { ticker: string; shares: number; entry_value: number };
type Series = { timestamps: number[]; closes: number[] };
type PricesResponse = {
  data: Record<string, Series | null>;
  fetchedAt: number;
  hasData: boolean;
};

type Timeframe = "1D" | "2D" | "All";

type Props = {
  holdings: Holding[];
  // Day-0 anchor: the hypothesis started this many ms-since-epoch ago. The
  // "All" filter is clipped to this date forward — we don't show pre-baseline
  // Yahoo noise, and the chart leads with account_value_at_entry as the
  // opening data point.
  baselineTs: number;
  accountValueAtEntry: number;
};

export default function PortfolioChart({ holdings, baselineTs, accountValueAtEntry }: Props) {
  const [prices, setPrices] = useState<PricesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [tf, setTf] = useState<Timeframe>("2D");

  useEffect(() => {
    // Session cache (10min freshness) so back/forward navigation is instant.
    const CACHE_KEY = "prices-cache-v1";
    const FRESH_MS = 10 * 60 * 1000;
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw) as PricesResponse & { _savedAt: number };
        if (cached._savedAt && Date.now() - cached._savedAt < FRESH_MS) {
          setPrices(cached);
          setLoading(false);
          return;
        }
      }
    } catch {}
    fetch("/api/prices", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        setPrices(j);
        setLoading(false);
        if (j) {
          try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ...j, _savedAt: Date.now() })); } catch {}
        }
      })
      .catch(() => setLoading(false));
  }, []);

  const grid = useMemo(() => {
    if (!prices || !prices.hasData) return [] as Array<{ t: number; value: number }>;
    // Time grid: only keep Yahoo bars at or after the baseline timestamp —
    // we don't care about pre-hypothesis noise.
    const baselineSec = Math.floor(baselineTs / 1000);
    const tsCounts = new Map<number, number>();
    for (const h of holdings) {
      const s = prices.data[h.ticker];
      if (!s) continue;
      for (const t of s.timestamps) {
        if (t < baselineSec) continue;
        tsCounts.set(t, (tsCounts.get(t) ?? 0) + 1);
      }
    }
    const goodTickers = holdings.filter((h) => prices.data[h.ticker]);
    const threshold = Math.max(1, Math.floor(goodTickers.length * 0.8));
    const shared = Array.from(tsCounts.entries())
      .filter(([, n]) => n >= threshold)
      .map(([t]) => t)
      .sort((a, b) => a - b);

    const lookup: Record<string, Map<number, number>> = {};
    for (const h of holdings) {
      const s = prices.data[h.ticker];
      if (!s) continue;
      const m = new Map<number, number>();
      s.timestamps.forEach((t, i) => m.set(t, s.closes[i]));
      lookup[h.ticker] = m;
    }

    const bars = shared.map((t) => {
      let value = 0;
      for (const h of holdings) {
        const m = lookup[h.ticker];
        if (!m) {
          value += h.entry_value;
          continue;
        }
        const c = m.get(t);
        if (c != null) value += h.shares * c;
        else value += h.entry_value;
      }
      return { t, value };
    });

    // Anchor: lead with the book-value opening print at the baseline ts so
    // the "All" timeframe starts at $3,453.83 (or whatever account_value_at_entry
    // was), not at the first Yahoo bar of the day.
    return [{ t: baselineSec, value: accountValueAtEntry }, ...bars];
  }, [prices, holdings, baselineTs, accountValueAtEntry]);

  const filtered = useMemo(() => {
    if (grid.length === 0) return grid;
    if (tf === "1D") return grid.slice(-13);
    if (tf === "2D") return grid.slice(-26);
    // "All" === since baseline. If we only have 2 days of data post-baseline,
    // All naturally equals 2D. Same array either way.
    return grid;
  }, [grid, tf]);

  const { first, last, delta, pct } = useMemo(() => {
    if (filtered.length < 2) return { first: null, last: null, delta: 0, pct: 0 };
    const a = filtered[0].value;
    const b = filtered[filtered.length - 1].value;
    return { first: a, last: b, delta: b - a, pct: ((b - a) / a) * 100 };
  }, [filtered]);

  return (
    <section className="port-chart">
      <header className="port-chart-head">
        <div className="pch-title">
          <span className="pch-eyebrow">// portfolio · growth</span>
          <span className="pch-sub">
            sum of shares × close across all 10 holdings. bars are 30-minute. yahoo quotes, 15-min cache.
          </span>
        </div>
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
      </header>

      {loading ? (
        <div className="pch-empty"><em>fetching quotes…</em></div>
      ) : filtered.length < 2 ? (
        <div className="pch-empty"><em>quotes unavailable right now. try again shortly.</em></div>
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
function Sparkline({
  points,
  up,
}: {
  points: Array<{ t: number; value: number }>;
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
  return (
    <svg
      className="pch-svg"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="pch-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#pch-fill)" />
      <path d={path} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      {/* horizontal gridline at the start value */}
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
