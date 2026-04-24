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

type Row = {
  ticker: string;
  shares: number;
  price: number | null;
  value: number;
  entry: number;
  delta: number;
  pct: number;
  isCash?: boolean;
};

// Each column is a "building" of windows. 44 rows tall per column ·
// 11 columns (10 positions + cash) = 484 windows. Dense enough to read
// as a monolith; sparse enough to let individual tickers read.
const CELLS = 44;

// Deterministic PRNG keyed on (ticker, i) so lit/unlit texture is stable
// across renders and doesn't flash between SSR and CSR hydration.
function seeded(ticker: string, i: number): number {
  let h = 2166136261 ^ i;
  for (let k = 0; k < ticker.length; k++) {
    h = (h ^ ticker.charCodeAt(k)) >>> 0;
    h = Math.imul(h, 16777619) >>> 0;
  }
  return (h >>> 0) / 2 ** 32;
}

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

  const allColumns: Row[] = useMemo(() => {
    const rows: Row[] = holdings.map((h) => {
      const px = prices[h.ticker] ?? null;
      const value = px != null ? h.shares * px : h.entry_value;
      const delta = value - h.entry_value;
      const pct = h.entry_value > 0 ? delta / h.entry_value : 0;
      return { ticker: h.ticker, shares: h.shares, price: px, value, entry: h.entry_value, delta, pct };
    });
    if (pendingCash > 0) {
      rows.push({
        ticker: "CASH",
        shares: pendingCash,
        price: 1,
        value: pendingCash,
        entry: pendingCash,
        delta: 0,
        pct: 0,
        isCash: true,
      });
    }
    return rows;
  }, [holdings, prices, pendingCash]);

  const totalValue = allColumns.reduce((acc, r) => acc + r.value, 0);
  const totalDelta = totalValue - baseline;
  const totalUp = totalDelta >= 0;
  const maxValue = Math.max(1, ...allColumns.map((c) => c.value));

  return (
    <div className="h2-tower-wrap" aria-label="the ledger · tower of positions">
      <div className="h2-tower-eye">
        <span>
          <span className={`h2-tower-pulse${live ? "" : " is-off"}`} aria-hidden="true" />
          the ledger · {allColumns.length} columns · {CELLS * allColumns.length} windows
        </span>
        <span>{live ? "live" : "paused"}</span>
      </div>

      <div
        className="h2-tower"
        style={{ gridTemplateColumns: `repeat(${allColumns.length}, 1fr)` }}
        role="img"
        aria-label="portfolio density · one column per holding"
      >
        {allColumns.map((c) => {
          // Waterline: column height proportional to its value relative to the
          // biggest position. Cells below waterline are lit (warm windows);
          // cells above are mostly off with rare sparkles.
          const waterline = Math.max(6, Math.round((c.value / maxValue) * CELLS));
          const cells = [];
          for (let i = 0; i < CELLS; i++) {
            const s = seeded(c.ticker, i);
            const below = i < waterline;
            let cls = "h2-cell";
            if (c.isCash) {
              cls += below ? (s < 0.55 ? " lit" : " off") : " off";
            } else if (!below) {
              cls += s < 0.06 ? " lit" : " off"; // occasional sparkle above the waterline
            } else if (c.pct > 0.06 && s < 0.22) {
              cls += " hot"; // strong gainer — brightest windows
            } else if (c.pct < -0.04 && s < 0.42) {
              cls += " down"; // rust glow on losers
            } else if (s < 0.11) {
              cls += " off"; // organic texture — a few unlit rooms inside the lit mass
            } else {
              cls += " lit";
            }
            cells.push(<span key={i} className={cls} />);
          }
          return (
            <div key={c.ticker} className="h2-tower-col" title={`${c.ticker} · ${fmtMoney(c.value)}`}>
              {cells}
            </div>
          );
        })}
      </div>

      <div
        className="h2-tower-labels"
        style={{ gridTemplateColumns: `repeat(${allColumns.length}, 1fr)` }}
        aria-hidden="true"
      >
        {allColumns.map((c) => {
          const dir = c.delta > 0.005 ? "up" : c.delta < -0.005 ? "down" : "flat";
          return (
            <div key={c.ticker} className={`h2-tower-lbl ${dir}`}>
              {c.ticker}
            </div>
          );
        })}
      </div>

      <div className="h2-tower-foot">
        <span className="h2-tower-foot-k">total</span>
        <span>{fmtMoney(totalValue)}</span>
        <span className={`h2-tower-foot-d ${totalUp ? "up" : "down"}`}>
          {totalUp ? "+" : "−"}${fmtAmt(totalDelta)} since 12 apr
        </span>
      </div>
      <div className="h2-tower-updated">
        {live ? `lights updated ${fmtUpdated(updated)}` : "waiting on prices…"}
      </div>
    </div>
  );
}
