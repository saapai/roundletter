"use client";

import { useEffect, useMemo, useState } from "react";
import { isMarketOpen, MARKET_OPEN_POLL_MS, MARKET_SHUT_POLL_MS } from "@/lib/market-hours";

type Holding = {
  ticker: string;
  shares: number;
  entry_value: number;
};

type PricesResponse = {
  data: Record<string, { timestamps: number[]; closes: number[] } | null>;
  hasData: boolean;
};

type Props = {
  holdings: Holding[];
  pendingCash: number;
  baseline: number;
};

function fmtMoney(n: number): string {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtUpdated(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit" });
}

export default function LedgerColumn({ holdings, pendingCash, baseline }: Props) {
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
    const px = prices[h.ticker];
    const value = px != null ? h.shares * px : h.entry_value;
    const delta = value - h.entry_value;
    return { ticker: h.ticker, shares: h.shares, price: px, value, delta };
  }), [holdings, prices]);

  const totalValue = rows.reduce((acc, r) => acc + r.value, 0) + pendingCash;
  const totalDelta = totalValue - baseline;
  const up = totalDelta >= 0;

  return (
    <div className="h2-ledger" aria-label="the ledger · live positions">
      <div className="h2-ledger-head">
        <span>
          <span className={`h2-ledger-pulse${live ? "" : " is-off"}`} aria-hidden="true" />
          the ledger · {rows.length} positions
        </span>
        <span>{live ? "live" : "paused"}</span>
      </div>
      <ul className="h2-ledger-list">
        {rows.map((r) => {
          const dir = r.delta > 0.005 ? "up" : r.delta < -0.005 ? "down" : "flat";
          const sign = r.delta > 0 ? "+" : r.delta < 0 ? "−" : "·";
          return (
            <li key={r.ticker} className="h2-ledger-row">
              <span className="h2-ledger-t">{r.ticker}</span>
              <span className="h2-ledger-q">
                {r.shares.toFixed(3)}
                {r.price != null ? <> × ${r.price.toFixed(2)}</> : null}
              </span>
              <span className="h2-ledger-v">{fmtMoney(r.value)}</span>
              <span className={`h2-ledger-d ${dir}`}>
                {sign}{fmtMoney(Math.abs(r.delta)).replace("$", "")}
              </span>
            </li>
          );
        })}
        {pendingCash > 0 ? (
          <li className="h2-ledger-row">
            <span className="h2-ledger-t">CASH</span>
            <span className="h2-ledger-q">SPAXX + pending</span>
            <span className="h2-ledger-v">{fmtMoney(pendingCash)}</span>
            <span className="h2-ledger-d flat">·</span>
          </li>
        ) : null}
      </ul>
      <div className="h2-ledger-foot">
        <span className="h2-ledger-foot-k">total</span>
        <span className="h2-ledger-foot-v">{fmtMoney(totalValue)}</span>
        <span className={`h2-ledger-d ${up ? "up" : "down"}`}>
          {up ? "+" : "−"}{fmtMoney(Math.abs(totalDelta)).replace("$", "")} since baseline
        </span>
      </div>
      <div className="h2-ledger-updated">
        {live ? `updated ${fmtUpdated(updated)}` : "waiting on prices…"}
      </div>
    </div>
  );
}
