"use client";

import { useEffect, useMemo, useState } from "react";
import { isMarketOpen, MARKET_OPEN_POLL_MS, MARKET_SHUT_POLL_MS } from "@/lib/market-hours";

// Positions table — one row per holding, clean register to match the
// site (paper, serif ticker, mono numbers, rust accents).  reads
// portfolio.json via the caller + live prices from /api/prices so
// value + today's change + total G/L update automatically as the
// market moves.  responsive: full table on wide, condensed card-per-
// row below 680px.

type Holding = {
  ticker: string;
  name: string;
  bucket?: string;
  owner_agent?: string;
  shares: number;
  entry_price: number;
  entry_value: number;
  avg_cost?: number;      // if set, used in place of entry_price
  total_cost?: number;    // if set, used in place of entry_value
};

type Series = { timestamps: number[]; closes: number[] };
type PricesResponse = {
  data: Record<string, Series | null>;
  fetchedAt: number;
  hasData: boolean;
};

type Props = {
  holdings: Holding[];
  pendingCash?: number;
  pendingCashTicker?: string;   // label for the money-market sleeve
};

function fmt$(n: number, d = 2): string {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })}`;
}
function fmtShares(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}
function fmtPct(n: number): string {
  const sign = n > 0 ? "+" : n < 0 ? "" : "";
  return `${sign}${n.toFixed(2)}%`;
}
function fmtDelta(n: number, d = 2): string {
  const sign = n > 0 ? "+" : n < 0 ? "" : "";
  return `${sign}${fmt$(n, d)}`;
}

export default function PositionsTable({ holdings, pendingCash = 0, pendingCashTicker = "SPAXX" }: Props) {
  const [prices, setPrices] = useState<PricesResponse | null>(null);

  useEffect(() => {
    let alive = true;
    let timer: number | null = null;
    const pull = () =>
      fetch("/api/prices", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((j: PricesResponse | null) => {
          if (alive && j) setPrices(j);
        })
        .catch(() => {});
    const schedule = () => {
      if (!alive) return;
      const delay = isMarketOpen() ? MARKET_OPEN_POLL_MS : MARKET_SHUT_POLL_MS;
      timer = window.setTimeout(async () => {
        await pull();
        schedule();
      }, delay);
    };
    pull().then(schedule);
    // pause polling when tab is hidden; resume when it comes back
    const onVis = () => {
      if (document.hidden) {
        if (timer != null) { window.clearTimeout(timer); timer = null; }
      } else if (timer == null) {
        pull().then(schedule);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      alive = false;
      if (timer != null) window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const rows = useMemo(() => {
    return holdings.map((h) => {
      const s = prices?.data?.[h.ticker];
      const last = s && s.closes.length > 0 ? s.closes[s.closes.length - 1] : h.entry_price;
      const prev = s && s.closes.length > 1 ? s.closes[s.closes.length - 2] : last;
      const avgCost = h.avg_cost ?? h.entry_price;
      const totalCost = h.total_cost ?? h.entry_value;
      const value = h.shares * last;
      const todyChg = last - prev;
      const todyVal = h.shares * todyChg;
      const todyPct = prev > 0 ? (todyChg / prev) * 100 : 0;
      const gl = value - totalCost;
      const glPct = totalCost > 0 ? (gl / totalCost) * 100 : 0;
      return {
        ticker: h.ticker,
        name: h.name,
        shares: h.shares,
        avgCost,
        totalCost,
        last,
        value,
        todyChg,
        todyVal,
        todyPct,
        gl,
        glPct,
      };
    });
  }, [holdings, prices]);

  const stockValue = rows.reduce((a, r) => a + r.value, 0);
  const total = stockValue + pendingCash;
  const totalGL = rows.reduce((a, r) => a + r.gl, 0);
  const totalTdy = rows.reduce((a, r) => a + r.todyVal, 0);
  const totalCost = rows.reduce((a, r) => a + r.totalCost, 0);
  const totalGLPct = totalCost > 0 ? (totalGL / totalCost) * 100 : 0;
  const totalTdyPct = stockValue - totalTdy > 0 ? (totalTdy / (stockValue - totalTdy)) * 100 : 0;

  return (
    <section className="pt" aria-label="positions · live">
      <div className="pt-head">
        <div>
          <div className="pt-eye">// the book · live</div>
          <h2 className="pt-title">
            {rows.length + (pendingCash > 0 ? 1 : 0)} positions · {fmt$(total)}
          </h2>
        </div>
        <div className="pt-head-meta">
          <div className={`pt-head-chip ${totalGL >= 0 ? "is-up" : "is-dn"}`}>
            <span className="pt-head-chip-k">total g/l</span>
            <span className="pt-head-chip-v">
              {fmtDelta(totalGL)} · {fmtPct(totalGLPct)}
            </span>
          </div>
          <div className={`pt-head-chip ${totalTdy >= 0 ? "is-up" : "is-dn"}`}>
            <span className="pt-head-chip-k">today</span>
            <span className="pt-head-chip-v">
              {fmtDelta(totalTdy)} · {fmtPct(totalTdyPct)}
            </span>
          </div>
        </div>
      </div>

      {/* table · wide */}
      <div className="pt-table-wrap" role="table">
        <div className="pt-th" role="row">
          <span role="columnheader">symbol</span>
          <span role="columnheader">qty</span>
          <span role="columnheader">avg cost</span>
          <span role="columnheader">last</span>
          <span role="columnheader">value</span>
          <span role="columnheader">% acct</span>
          <span role="columnheader">today</span>
          <span role="columnheader">total g/l</span>
        </div>
        {rows.map((r) => {
          const pctAcct = total > 0 ? (r.value / total) * 100 : 0;
          return (
            <div key={r.ticker} className="pt-row" role="row">
              <span className="pt-tk" role="cell">
                <span className="pt-tk-sym">{r.ticker}</span>
                <span className="pt-tk-name">{r.name}</span>
              </span>
              <span className="pt-num" role="cell">{fmtShares(r.shares)}</span>
              <span className="pt-num" role="cell">{fmt$(r.avgCost)}</span>
              <span className="pt-num" role="cell">{fmt$(r.last)}</span>
              <span className="pt-num pt-val" role="cell">{fmt$(r.value)}</span>
              <span className="pt-num pt-muted" role="cell">{pctAcct.toFixed(2)}%</span>
              <span className={`pt-num ${r.todyVal >= 0 ? "pt-up" : "pt-dn"}`} role="cell">
                {fmtDelta(r.todyVal)} · {fmtPct(r.todyPct)}
              </span>
              <span className={`pt-num ${r.gl >= 0 ? "pt-up" : "pt-dn"}`} role="cell">
                {fmtDelta(r.gl)} · {fmtPct(r.glPct)}
              </span>
            </div>
          );
        })}
        {pendingCash > 0 && (
          <div className="pt-row pt-row-cash" role="row">
            <span className="pt-tk" role="cell">
              <span className="pt-tk-sym">{pendingCashTicker}</span>
              <span className="pt-tk-name">money market · cash</span>
            </span>
            <span className="pt-num" role="cell">{fmtShares(pendingCash)}</span>
            <span className="pt-num pt-muted" role="cell">—</span>
            <span className="pt-num" role="cell">{fmt$(1)}</span>
            <span className="pt-num pt-val" role="cell">{fmt$(pendingCash)}</span>
            <span className="pt-num pt-muted" role="cell">
              {total > 0 ? ((pendingCash / total) * 100).toFixed(2) : "0.00"}%
            </span>
            <span className="pt-num pt-muted" role="cell">—</span>
            <span className="pt-num pt-muted" role="cell">—</span>
          </div>
        )}
        <div className="pt-row pt-row-total" role="row">
          <span className="pt-tk pt-tk-total" role="cell">total</span>
          <span className="pt-num pt-muted" role="cell">—</span>
          <span className="pt-num pt-muted" role="cell">—</span>
          <span className="pt-num pt-muted" role="cell">—</span>
          <span className="pt-num pt-val" role="cell">{fmt$(total)}</span>
          <span className="pt-num pt-muted" role="cell">100.00%</span>
          <span className={`pt-num ${totalTdy >= 0 ? "pt-up" : "pt-dn"}`} role="cell">
            {fmtDelta(totalTdy)} · {fmtPct(totalTdyPct)}
          </span>
          <span className={`pt-num ${totalGL >= 0 ? "pt-up" : "pt-dn"}`} role="cell">
            {fmtDelta(totalGL)} · {fmtPct(totalGLPct)}
          </span>
        </div>
      </div>

      <p className="pt-foot">
        <em>
          live prices · yahoo 15-min cache. positions fixed; money moves
          via the money-market sleeve. value = shares × last; today = shares
          × (last − prev close); g/l = value − total cost.
        </em>
      </p>
    </section>
  );
}
