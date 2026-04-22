"use client";

import { useEffect, useState } from "react";

// MacBook-storage-style allocation bar for the home page. One rounded
// segmented bar + a legend of colored dots below. Segments:
//
//   owned (saapai)           — the main book minus any external stake.
//   external · stock $50     — the pending 4/20 stock investment, not yet
//                              synced into the book; sits as a sliver so
//                              the reader sees the book isn't 100% mine.
//   art portfolio (10%)      — sidecar for ted-lasso submissions + cmiygl
//                              finds + negotiated pieces.
//   prediction book (10%)    — sidecar for kalshi referrals + yes/no on
//                              open bets + waymo monthly share.
//
// Pulls live portfolio value from /api/prices if available, falls back
// to the baseline passed in. Small, elegant — no chart library.

type Props = {
  baseline: number;
  externalTotal: number;   // $ of not-saapai stake sitting in the book
  pendingCash?: number;    // cash in the book not tied to a ticker
};

function fmt$(n: number): string {
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

type PricesResponse = {
  data: Record<string, { timestamps: number[]; closes: number[] } | null>;
  hasData: boolean;
};

const HOLDINGS: Array<{ ticker: string; shares: number; entry_value: number }> = [
  { ticker: "QTUM", shares: 5.509,  entry_value: 670.28 },
  { ticker: "MSFT", shares: 1.022,  entry_value: 402.06 },
  { ticker: "GOOG", shares: 1.219,  entry_value: 401.69 },
  { ticker: "IONQ", shares: 11.336, entry_value: 400.61 },
  { ticker: "IBM",  shares: 1.532,  entry_value: 367.76 },
  { ticker: "NVDA", shares: 1.725,  entry_value: 334.98 },
  { ticker: "CEG",  shares: 1.133,  entry_value: 334.89 },
  { ticker: "RGTI", shares: 9.806,  entry_value: 166.99 },
  { ticker: "SGOV", shares: 1.661,  entry_value: 166.95 },
  { ticker: "QBTS", shares: 5.873,  entry_value: 99.95  },
];

export default function AllocationBar({ baseline, externalTotal }: Props) {
  const [current, setCurrent] = useState<number>(baseline);

  useEffect(() => {
    let alive = true;
    fetch("/api/prices", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: PricesResponse | null) => {
        if (!alive || !j || !j.hasData) return;
        let total = 0;
        let anyLive = false;
        for (const h of HOLDINGS) {
          const s = j.data[h.ticker];
          if (s && s.closes.length > 0) {
            total += h.shares * s.closes[s.closes.length - 1];
            anyLive = true;
          } else {
            total += h.entry_value;
          }
        }
        if (anyLive) setCurrent(total);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // Model: the main book carries 80% as owned + 10% art + 10% prediction.
  // External cash sits ON TOP of the book (pending sync), so total stake
  // is book + external. the "owned" slice is 80% of book minus nothing
  // (external is shown separately).
  const artReserved    = current * 0.1;
  const predReserved   = current * 0.1;
  const owned          = current * 0.8;
  const total          = owned + externalTotal + artReserved + predReserved;

  const segments = [
    { key: "owned",    label: "owned · saapai",        amount: owned,          color: "var(--ink)" },
    { key: "external", label: "external · stock $50",  amount: externalTotal,  color: "var(--zine-yellow)" },
    { key: "art",      label: "art portfolio · 10%",   amount: artReserved,    color: "var(--zine-pink)" },
    { key: "pred",     label: "prediction book · 10%", amount: predReserved,   color: "var(--zine-cyan)" },
  ];
  const pctOf = (n: number) => (total > 0 ? (n / total) * 100 : 0);

  return (
    <section className="alloc" aria-label="portfolio allocation">
      <div className="alloc-head">
        <span className="alloc-eye">// how the stake is split</span>
        <span className="alloc-total">{fmt$(total)} total stake</span>
      </div>
      <div className="alloc-bar" aria-hidden="true">
        {segments.map((s) => {
          const pct = pctOf(s.amount);
          if (pct <= 0) return null;
          return (
            <span
              key={s.key}
              className={`alloc-seg alloc-seg-${s.key}`}
              style={{ width: `${pct}%`, background: s.color }}
              title={`${s.label} · ${fmt$(s.amount)} · ${pct.toFixed(1)}%`}
            />
          );
        })}
      </div>
      <ul className="alloc-legend">
        {segments.map((s) => {
          const pct = pctOf(s.amount);
          return (
            <li key={s.key} className={`alloc-legend-row alloc-legend-row-${s.key}`}>
              <span
                className="alloc-dot"
                style={{ background: s.color }}
                aria-hidden="true"
              />
              <span className="alloc-legend-name">{s.label}</span>
              <span className="alloc-legend-val">{fmt$(s.amount)}</span>
              <span className="alloc-legend-pct">{pct.toFixed(1)}%</span>
            </li>
          );
        })}
      </ul>
      <p className="alloc-foot">
        <em>
          the book rebalances monthly. the 10% sidecars fund the{" "}
          <a href="#open-bets">open bets</a> pool and the{" "}
          <a href="#art">art portfolio</a>; external investments settle into
          the book at the next rebalance.
        </em>
      </p>
    </section>
  );
}
