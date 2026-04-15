"use client";
import { useEffect, useMemo, useState } from "react";

// Per-position price-motion row. For each holding: entry price (from
// portfolio.json) → last available close from /api/prices, with % and $ delta
// + a tiny sparkline of the last 26 bars. Client component so we can share
// the /api/prices fetch with PortfolioChart (Next.js dedupes fetches of the
// same URL in the same request).

type Holding = {
  ticker: string;
  name: string;
  shares: number;
  entry_price: number;
};

type Series = { timestamps: number[]; closes: number[] };
type PricesResponse = {
  data: Record<string, Series | null>;
  fetchedAt: number;
  hasData: boolean;
};

export default function StockAnalysisGraph({ holdings }: { holdings: Holding[] }) {
  const [prices, setPrices] = useState<PricesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Shared session cache with PortfolioChart — one /api/prices hit per
    // 10min, so back/forward navigation doesn't re-fetch.
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

  return (
    <section className="stock-graph">
      <div className="stock-graph-head">
        <span className="stock-graph-eyebrow">// price motion · entry → now</span>
        <p className="stock-graph-sub">
          <em>
            each row is one holding, one sparkline, one delta. entry from the
            logbook; now from yahoo. green is up, rust is down, dashed is
            missing.
          </em>
        </p>
      </div>

      <div className="stock-graph-rows">
        {holdings.map((h) => (
          <Row key={h.ticker} holding={h} series={prices?.data?.[h.ticker] ?? null} loading={loading} />
        ))}
      </div>
    </section>
  );
}

function Row({
  holding,
  series,
  loading,
}: {
  holding: Holding;
  series: Series | null;
  loading: boolean;
}) {
  const info = useMemo(() => {
    if (!series || series.closes.length === 0) {
      return { now: null as number | null, delta: 0, pct: 0 };
    }
    const now = series.closes[series.closes.length - 1];
    const delta = now - holding.entry_price;
    const pct = (delta / holding.entry_price) * 100;
    return { now, delta, pct };
  }, [series, holding.entry_price]);

  const up = info.delta >= 0;
  const statusClass = info.now == null ? "sg-delta-pending" : up ? "sg-delta-up" : "sg-delta-down";

  return (
    <div className="stock-graph-row">
      <div className="sg-ticker">
        <span className="sg-symbol">{holding.ticker}</span>
        <span className="sg-name">{holding.name}</span>
      </div>
      <div className="sg-chart" aria-hidden="true">
        <Spark series={series} up={up} missing={!series} />
      </div>
      <div className="sg-entry">
        <span className="sg-k">entry</span>
        <span className="sg-v">${holding.entry_price.toFixed(2)}</span>
      </div>
      <div className="sg-now">
        <span className="sg-k">now</span>
        <span className={`sg-v ${info.now == null ? "sg-pending" : ""}`}>
          {info.now == null ? (loading ? "…" : "—") : `$${info.now.toFixed(2)}`}
        </span>
      </div>
      <div className={`sg-delta ${statusClass}`}>
        <span className="sg-k">Δ</span>
        <span className="sg-v">
          {info.now == null
            ? loading
              ? "…"
              : "pending"
            : `${up ? "+" : "−"}${Math.abs(info.pct).toFixed(1)}%`}
        </span>
      </div>
    </div>
  );
}

function Spark({
  series,
  up,
  missing,
}: {
  series: Series | null;
  up: boolean;
  missing: boolean;
}) {
  if (missing || !series || series.closes.length < 2) {
    return (
      <svg width="100%" height="38" viewBox="0 0 100 38" preserveAspectRatio="none">
        <path
          d="M 0 19 L 100 19"
          stroke="rgba(28, 26, 23, 0.18)"
          strokeWidth="1"
          strokeDasharray="3 3"
          fill="none"
        />
      </svg>
    );
  }
  const tail = series.closes.slice(-26);
  const min = Math.min(...tail);
  const max = Math.max(...tail);
  const range = max - min || 1;
  const step = 100 / Math.max(1, tail.length - 1);
  const d = tail
    .map((c, i) => {
      const x = i * step;
      const y = 4 + 30 * (1 - (c - min) / range);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
  const color = up ? "#3B7A4A" : "#8B3A2E";
  return (
    <svg width="100%" height="38" viewBox="0 0 100 38" preserveAspectRatio="none">
      <path d={d} stroke={color} strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" fill="none" />
    </svg>
  );
}
