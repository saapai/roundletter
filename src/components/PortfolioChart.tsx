"use client";
import { useEffect, useMemo, useState } from "react";
import PortfolioGrowthChart, { type SeriesPoint } from "./PortfolioGrowthChart";

// Stock-growth-style portfolio chart. Fetches /api/prices (Yahoo 30-min bars,
// 5d range) and computes portfolio value at each timestamp = sum(shares × close).
// Three timeframes: 1D (last ~13 bars), 2D (last ~26), All (5d). Each shows
// $ change + % change relative to the FIRST bar of the selected window.
//
// PR1 NOTE — this component is now a thin shell around the generalized
// `PortfolioGrowthChart`. It keeps its existing public API (holdings,
// baselineTs, accountValueAtEntry) and its existing data-fetch /
// bar-reconstruction pipeline; it just hands the resulting series to
// PortfolioGrowthChart for rendering instead of inlining the SVG.
// `/positions` (the existing caller) is unchanged.

type Holding = { ticker: string; shares: number; entry_value: number };
type Series = { timestamps: number[]; closes: number[] };
type PricesResponse = {
  data: Record<string, Series | null>;
  fetchedAt: number;
  hasData: boolean;
};

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

  const grid: SeriesPoint[] = useMemo(() => {
    if (!prices || !prices.hasData) return [];
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
      return { ts: t, value };
    });

    // Anchor: lead with the book-value opening print at the baseline ts so
    // the "All" timeframe starts at $3,453.83 (or whatever account_value_at_entry
    // was), not at the first Yahoo bar of the day.
    return [{ ts: baselineSec, value: accountValueAtEntry }, ...bars];
  }, [prices, holdings, baselineTs, accountValueAtEntry]);

  if (loading) {
    return (
      <section className="port-chart">
        <header className="port-chart-head">
          <div className="pch-title">
            <span className="pch-eyebrow">// portfolio · growth</span>
            <span className="pch-sub">
              sum of shares × close across all 10 holdings. bars are 30-minute. yahoo quotes, 15-min cache.
            </span>
          </div>
        </header>
        <div className="pch-empty"><em>fetching quotes…</em></div>
      </section>
    );
  }

  return (
    <PortfolioGrowthChart
      category="portfolio"
      series={grid}
      label="sum of shares × close across all 10 holdings. bars are 30-minute. yahoo quotes, 15-min cache."
    />
  );
}
