"use client";

import { useEffect, useState } from "react";
import { HUNT_PHONE_TEL, HUNT_PHONE_DISPLAY } from "@/lib/hunt";
import { isMarketOpen, MARKET_OPEN_POLL_MS, MARKET_SHUT_POLL_MS } from "@/lib/market-hours";

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
  /**
   * Total book value at the moment the external money was distributed.
   * Used to compute the external investor's current $ value as
   * externalTotal × (currentBook / externalBookAtEntry).
   * Undefined → treat external as static $50.
   */
  externalBookAtEntry?: number;
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

export default function AllocationBar({ baseline, externalTotal, externalBookAtEntry }: Props) {
  const [current, setCurrent] = useState<number>(baseline);

  useEffect(() => {
    let alive = true;
    let timer: number | null = null;
    const pull = () =>
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
    const schedule = () => {
      if (!alive) return;
      const delay = isMarketOpen() ? MARKET_OPEN_POLL_MS : MARKET_SHUT_POLL_MS;
      timer = window.setTimeout(async () => {
        await pull();
        schedule();
      }, delay);
    };
    const onVis = () => {
      if (document.hidden) {
        if (timer != null) { window.clearTimeout(timer); timer = null; }
      } else if (timer == null) {
        pull().then(schedule);
      }
    };
    pull().then(schedule);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      alive = false;
      if (timer != null) window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // Model: the $50 external is distributed proportionally across all 10
  // positions on the day it landed, so its value tracks the whole book
  // from that instant.  externalNow = externalTotal × (currentBook /
  // externalBookAtEntry).  If book_at_entry wasn't recorded, the $50 is
  // shown statically.
  const externalNow =
    externalBookAtEntry && externalBookAtEntry > 0
      ? externalTotal * (current / externalBookAtEntry)
      : externalTotal;
  const externalDelta = externalNow - externalTotal;
  const externalPct = externalTotal > 0 ? (externalDelta / externalTotal) * 100 : 0;

  // the main book carries 80% as owned + 10% art + 10% prediction.
  // external cash rides ON TOP of the book.
  const artReserved  = current * 0.1;
  const predReserved = current * 0.1;
  const owned        = current * 0.8;
  const total        = owned + externalNow + artReserved + predReserved;

  const segments = [
    { key: "owned",    label: "owned · saapai",        amount: owned,        color: "var(--ink)" },
    { key: "external", label: "external · stock $50",  amount: externalNow,  color: "var(--zine-yellow)" },
    { key: "art",      label: "art portfolio · 10%",   amount: artReserved,  color: "var(--zine-pink)" },
    { key: "pred",     label: "prediction book · 10%", amount: predReserved, color: "var(--zine-cyan)" },
  ];
  const pctOf = (n: number) => (total > 0 ? (n / total) * 100 : 0);

  return (
    <section className="alloc" aria-label="portfolio allocation">
      <div className="alloc-head">
        <span className="alloc-eye">// how the stake is split</span>
        <span className="alloc-total">{fmt$(total)} total stake</span>
      </div>
      <p className="alloc-intro">
        <em>
          all in a 10-holding quantum + bigtech basket. <strong>$50 external</strong>{" "}
          (live since 22 apr); the rest mine, with 20% earmarked for the two
          sidecars and liquidated as needed.
        </em>
      </p>
      {externalBookAtEntry && externalBookAtEntry > 0 ? (
        <div className={`alloc-ext ${externalDelta >= 0 ? "is-up" : "is-dn"}`}>
          <span className="alloc-ext-k">$50 external investment at 4/22 · now worth</span>
          <span className="alloc-ext-v">
            {externalNow.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="alloc-ext-d">
            {externalDelta >= 0 ? "+" : "−"}{Math.abs(externalDelta).toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
            · {externalDelta >= 0 ? "+" : "−"}{Math.abs(externalPct).toFixed(2)}%
          </span>
        </div>
      ) : null}
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
      <div className="alloc-invest" role="group" aria-label="acquire a stake">
        <div className="alloc-invest-eye">// acquire a stake · four ways</div>
        <div className="alloc-invest-row">
          <a
            className="alloc-invest-btn"
            href={smsInvest("stock")}
            aria-label={`invest in the stock book via text to ${HUNT_PHONE_DISPLAY}`}
          >
            <span className="alloc-invest-k">stock book</span>
            <span className="alloc-invest-v">invest · text</span>
          </a>
          <a
            className="alloc-invest-btn alloc-invest-btn-art"
            href={smsInvest("art")}
            aria-label="invest in the art portfolio sidecar"
          >
            <span className="alloc-invest-k">art portfolio</span>
            <span className="alloc-invest-v">invest · text</span>
          </a>
          <a
            className="alloc-invest-btn alloc-invest-btn-pred"
            href={smsInvest("prediction")}
            aria-label="invest in the prediction-market sidecar"
          >
            <span className="alloc-invest-k">prediction book</span>
            <span className="alloc-invest-v">invest · text</span>
          </a>
          <a
            className="alloc-invest-btn alloc-invest-btn-hunt"
            href="/6969#hunt"
            aria-label="mine easter eggs for discounted stakes"
          >
            <span className="alloc-invest-k">the hunt</span>
            <span className="alloc-invest-v">mine · free</span>
          </a>
        </div>
        <p className="alloc-invest-note">
          <em>
            the first three settle at the next weekly rebalance.{" "}
            <strong>the hunt</strong> pays stakes directly — thirteen eggs across
            the site, some bankroll, some portfolio equity, some art-portfolio
            shares. <a href="/6969#hunt">ledger + rules</a>.
          </em>
        </p>
      </div>
    </section>
  );
}

function smsInvest(book: "stock" | "art" | "prediction"): string {
  const label =
    book === "stock" ? "stock book (main)" :
    book === "art"   ? "art portfolio (10% sidecar)" :
                       "prediction-market book (10% sidecar)";
  const body = [
    `invest · ${label}`,
    `amount · $[how much]`,
    `name on ledger · [your name]`,
    "",
    "— via aureliex.com/#alloc",
  ].join("\n");
  const num = HUNT_PHONE_TEL.replace(/^tel:/, "");
  return `sms:${num}?&body=${encodeURIComponent(body)}`;
}
