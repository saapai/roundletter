"use client";

import { useEffect, useMemo, useState } from "react";
import { isMarketOpen, MARKET_OPEN_POLL_MS, MARKET_SHUT_POLL_MS } from "@/lib/market-hours";

type Holding = { ticker: string; shares: number; entry_value: number };
type PricesResponse = {
  data: Record<string, { timestamps: number[]; closes: number[] } | null>;
  hasData: boolean;
};
type Props = { holdings: Holding[]; pendingCash: number; baseline: number };

function fmtMoney(n: number): string {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function fmtAmt(n: number): string {
  const v = Math.abs(n);
  return v >= 1000 ? `${(v / 1000).toFixed(2)}k` : v.toFixed(0);
}
function fmtUpdated(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/*  LiveStrip — the live book, honest, thin.
    one narrow horizontal row beneath the cover image showing:
      · total · delta · updated ·
      each holding as: TICKER $X ±Δ%
    scrolls horizontally on narrow viewports.  not a chart; not a
    building.  just the numbers, in mono, updating.                   */
export default function LiveStrip({ holdings, pendingCash, baseline }: Props) {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [updated, setUpdated] = useState<Date | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let alive = true;
    let timer: number | null = null;
    const pull = async () => {
      try {
        const r = await fetch("/api/prices", { cache: "no-store" });
        if (!r.ok) return;
        const j = (await r.json()) as PricesResponse;
        if (!alive || !j?.hasData) return;
        const next: Record<string, number> = {};
        for (const h of holdings) {
          const s = j.data[h.ticker];
          if (s && s.closes.length > 0) next[h.ticker] = s.closes[s.closes.length - 1];
        }
        if (Object.keys(next).length > 0) {
          setPrices(next);
          setUpdated(new Date());
          setLive(true);
        }
      } catch { /* silent */ }
    };
    const schedule = () => {
      if (!alive) return;
      const delay = isMarketOpen() ? MARKET_OPEN_POLL_MS : MARKET_SHUT_POLL_MS;
      timer = window.setTimeout(async () => {
        await pull();
        schedule();
      }, delay);
    };
    pull().then(schedule);
    return () => {
      alive = false;
      if (timer != null) window.clearTimeout(timer);
    };
  }, [holdings]);

  const rows = useMemo(() => holdings.map((h) => {
    const px = prices[h.ticker] ?? null;
    const value = px != null ? h.shares * px : h.entry_value;
    const delta = value - h.entry_value;
    const pct = h.entry_value > 0 ? delta / h.entry_value : 0;
    return { ticker: h.ticker, value, delta, pct };
  }), [holdings, prices]);

  const totalValue = rows.reduce((acc, r) => acc + r.value, 0) + pendingCash;
  const totalDelta = totalValue - baseline;
  const totalUp = totalDelta >= 0;

  // hierarch's rule: the cover already shows TOTAL + delta + countdown
  // in the headline · the strip stops carrying that lead and just
  // shows the per-position scroll.  ambient telemetry, not chrome.
  void totalValue; void totalDelta; void totalUp; void updated;

  return (
    <section className="h2-strip" aria-label="the book · live">
      <span className={`h2-strip-pulse${live ? "" : " is-off"}`} aria-hidden="true" />
      <ul className="h2-strip-list">
        {rows.map((r) => {
          const dir = r.delta > 0.5 ? "up" : r.delta < -0.5 ? "down" : "flat";
          const sign = r.delta > 0 ? "+" : r.delta < 0 ? "−" : "·";
          return (
            <li key={r.ticker} className={`h2-strip-item ${dir}`}>
              <span className="h2-strip-t">{r.ticker}</span>
              <span className="h2-strip-val">${Math.round(r.value).toLocaleString("en-US")}</span>
              <span className="h2-strip-pct">
                {sign}{Math.abs(r.pct * 100).toFixed(1)}%
              </span>
            </li>
          );
        })}
        {pendingCash > 0 ? (
          <li className="h2-strip-item flat">
            <span className="h2-strip-t">CASH</span>
            <span className="h2-strip-val">${Math.round(pendingCash).toLocaleString("en-US")}</span>
            <span className="h2-strip-pct">·</span>
          </li>
        ) : null}
      </ul>
    </section>
  );
}
