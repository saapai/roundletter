"use client";
import { useEffect, useMemo, useState } from "react";
import BirthdayCountdown from "./BirthdayCountdown";
import { isMarketOpen, MARKET_OPEN_POLL_MS, MARKET_SHUT_POLL_MS } from "@/lib/market-hours";

// Savings hero v2 — anchored to the 4/12 baseline.
//
// The old hero showed a $1,296 → $4,825 → today arc with a big "272%" ring,
// which was a savings-accumulation story from jan 2025, not the portfolio
// growth story the rest of the site tracks. That number was misleading on
// this page.
//
// This rebuild leads with the number that matches the rest of the site:
// growth since the 4/12 baseline. Peak / drawdown / jan-2025 context live
// below, visibly demoted, so the history isn't lost — it's just not the
// lede anymore.

type Holding = { ticker: string; shares: number; entry_value: number };
type Series = { timestamps: number[]; closes: number[] };
type PricesResponse = {
  data: Record<string, Series | null>;
  fetchedAt: number;
  hasData: boolean;
};

type ExternalEntry = {
  id: string;
  label: string;
  amount: number;
  date: string;
  status: string;
};

type Props = {
  holdings: Holding[];
  startedValue: number;     // jan 2025 savings start — context only
  peakValue: number;         // 31 jan peak — context only
  peakDate: string;
  baselineValue: number;     // 4/12 baseline — the hero anchor
  goal: number;
  baselineDate: string;      // 2026-04-12
  birthdate: string;
  externalEntries?: ExternalEntry[];
  /** Cash in the book that isn't tied to a ticker (e.g. pending deposit). */
  pendingCash?: number;
};

function fmt$(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}
function fmt2(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}

const MONTHS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
function fmtCatalogDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const [, , mm, dd] = m;
  return `${Number(dd)} ${MONTHS[Number(mm) - 1]}`;
}
function fmtCatalogDateWithYear(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const [, yyyy, mm, dd] = m;
  return `${Number(dd)} ${MONTHS[Number(mm) - 1]} ${yyyy}`;
}

const CACHE_KEY = "prices-cache-v1";
const FRESH_MS = 10 * 60 * 1000;

export default function SavingsHero(props: Props) {
  const {
    holdings, startedValue, peakValue, peakDate,
    baselineValue, goal, baselineDate, birthdate,
    externalEntries = [],
    pendingCash = 0,
  } = props;
  const [prices, setPrices] = useState<PricesResponse | null>(null);

  useEffect(() => {
    let alive = true;
    let timer: number | null = null;
    const pull = () =>
      fetch("/api/prices", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((j: PricesResponse | null) => {
          if (!alive || !j) return;
          setPrices(j);
          try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ...j, _savedAt: Date.now() })); } catch {}
        })
        .catch(() => {});
    // prime from session cache to avoid a flash of baseline numbers
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw) as PricesResponse & { _savedAt: number };
        if (cached._savedAt && Date.now() - cached._savedAt < FRESH_MS) setPrices(cached);
      }
    } catch {}
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

  const currentBook = useMemo(() => {
    if (!prices || !prices.hasData) return baselineValue;
    let total = 0;
    let anyLive = false;
    for (const h of holdings) {
      const s = prices.data[h.ticker];
      if (s && s.closes.length > 0) {
        total += h.shares * s.closes[s.closes.length - 1];
        anyLive = true;
      } else {
        total += h.entry_value;
      }
    }
    // pending_cash (dividends, deposits not yet deployed) belongs in the
    // book — leaving it out was the source of the /positions 3.7% vs.
    // home 6.9% discrepancy. including it now aligns SavingsHero with
    // getLivePortfolio(), so both surfaces show the same number.
    return anyLive ? total + pendingCash : baselineValue;
  }, [prices, holdings, baselineValue, pendingCash]);

  const externalTotal = useMemo(
    () => externalEntries.reduce((a, e) => a + e.amount, 0),
    [externalEntries],
  );
  const totalOwned = currentBook + externalTotal;

  const isLive = prices?.hasData ?? false;

  // since-4/12 anchor numbers
  const deltaFromBaseline = currentBook - baselineValue;
  const pctFromBaseline = (deltaFromBaseline / baselineValue) * 100;
  const up = deltaFromBaseline >= 0;

  // journey bar — rebased on 4/12, not jan 2025
  const logMin = Math.log(baselineValue);
  const logMax = Math.log(goal);
  const posPct = ((Math.log(Math.max(currentBook, 1)) - logMin) / (logMax - logMin)) * 100;

  // historical context (demoted, not the hero)
  const peakGain = peakValue - startedValue;
  const peakGainPct = (peakGain / startedValue) * 100;

  return (
    <section className="savings-hero">
      <div className="savings-tombstone-eyebrow">
        the book — anchored {fmtCatalogDateWithYear(baselineDate)} · {isLive ? "15-min tape" : "reconciled"}
      </div>

      <div className="savings-tombstone savings-tombstone-v2">
        <div className={`savings-tombstone-figure ${up ? "is-up" : "is-down"}`}>
          {up ? "+" : "−"}{Math.abs(pctFromBaseline).toFixed(1)}<span className="savings-tombstone-pct">%</span>
        </div>
        <div className="savings-tombstone-sub">
          ${fmt$(baselineValue)} <em>{fmtCatalogDate(baselineDate)}</em>
          {" → "}
          <span className="savings-tombstone-current-figure">${fmt$(currentBook)}</span> <em>now</em>
        </div>
        <div className="savings-tombstone-rule" aria-hidden="true" />
        <div className="savings-tombstone-current">
          on the books today · <span className="savings-tombstone-current-figure">${fmt$(currentBook)}</span>
          {externalTotal > 0 ? (
            <>
              {" "}<span className="savings-tombstone-plus">+ ${fmt$(externalTotal)} pending</span>
            </>
          ) : null}
        </div>
        <div className="savings-tombstone-countdown">
          <BirthdayCountdown birthdate={birthdate} />
        </div>
      </div>

      <div className="savings-grid savings-grid-v2">
        <div className="savings-cell">
          <div className="savings-cell-label">since {fmtCatalogDate(baselineDate)}</div>
          <div className={`savings-cell-value ${up ? "savings-up" : "savings-down"}`}>
            {up ? "+" : "−"}${fmt$(Math.abs(deltaFromBaseline))}
          </div>
          <div className="savings-cell-note">
            {up ? "+" : "−"}{Math.abs(pctFromBaseline).toFixed(1)}% vs 4/12 anchor
          </div>
        </div>

        <div className="savings-cell">
          <div className="savings-cell-label">what i own today</div>
          <div className="savings-cell-value savings-neutral">
            ${fmt$(totalOwned)}
          </div>
          <div className="savings-cell-note">
            book ${fmt$(currentBook)}
            {externalTotal > 0 ? ` + pending $${fmt$(externalTotal)}` : null}
          </div>
        </div>

        <div className="savings-cell">
          <div className="savings-cell-label">to six figures by 21 june</div>
          <div className="savings-cell-value savings-goal">{(goal / currentBook).toFixed(1)}×</div>
          <div className="savings-cell-note">${fmt$(goal - currentBook)} to go</div>
        </div>
      </div>

      <div className="savings-bar-wrap" aria-label="journey" aria-hidden="true">
        <div className="savings-bar-track">
          <div className="savings-bar-fill" style={{ width: `${Math.max(0, Math.min(100, posPct))}%` }} />
          <div className="savings-bar-now-mark" style={{ left: `${Math.max(0, Math.min(100, posPct))}%` }} title={`now $${fmt$(currentBook)}`} />
        </div>
        <div className="savings-bar-labels">
          <span>${fmt$(baselineValue)}<br/><em>{fmtCatalogDate(baselineDate)}</em></span>
          <span className="savings-bar-label-goal">${fmt$(goal)}<br/><em>21 june</em></span>
        </div>
      </div>

      <p className="savings-caveat">
        <em>
          {isLive
            ? "live quotes from yahoo (15-min cache). sum of shares × last close across the 10-holding book. growth is measured vs the 4/12 baseline — the day i sealed the round."
            : "live prices unavailable; these are the last reconciled numbers. growth is measured vs the 4/12 baseline — the day i sealed the round."}
        </em>
      </p>

      <details className="savings-history">
        <summary>historical context · jan 2025 savings story · peak · drawdown</summary>
        <div className="savings-history-grid">
          <div>
            <span className="savings-history-k">savings start</span>
            <span className="savings-history-v">${fmt$(startedValue)} · jan 2025</span>
          </div>
          <div>
            <span className="savings-history-k">high-water</span>
            <span className="savings-history-v">${fmt$(peakValue)} · {fmtCatalogDate(peakDate)} · +{peakGainPct.toFixed(0)}% from jan 2025</span>
          </div>
          <div>
            <span className="savings-history-k">current vs peak</span>
            <span className="savings-history-v">
              {(((currentBook - peakValue) / peakValue) * 100).toFixed(1)}% · the drawdown i&rsquo;m holding through
            </span>
          </div>
        </div>
      </details>
    </section>
  );
}

// Expose a second component for rendering JUST the book composition —
// the positions page can render SavingsHero above and BookComposition
// below when it wants the screen-time-style ownership breakdown.
export function BookComposition({
  bookValue,
  externalEntries,
}: {
  bookValue: number;
  externalEntries: ExternalEntry[];
}) {
  const extTotal = externalEntries.reduce((a, e) => a + e.amount, 0);
  const total = bookValue + extTotal;
  if (total <= 0) return null;
  const bookPct = (bookValue / total) * 100;
  const externals = externalEntries.map((e) => ({
    ...e,
    pct: (e.amount / total) * 100,
  }));

  return (
    <section className="book-comp" aria-label="book composition">
      <div className="book-comp-head">
        <span className="book-comp-eye">// what's in the book</span>
        <span className="book-comp-total">total · ${fmt2(total)}</span>
      </div>
      <div className="book-comp-bar" aria-hidden="true">
        <span
          className="book-comp-seg book-comp-seg-core"
          style={{ width: `${bookPct}%` }}
          title={`portfolio book · $${fmt2(bookValue)} (${bookPct.toFixed(1)}%)`}
        />
        {externals.map((e) => (
          <span
            key={e.id}
            className="book-comp-seg book-comp-seg-ext"
            style={{ width: `${e.pct}%` }}
            title={`${e.label} · $${fmt2(e.amount)} (${e.pct.toFixed(1)}%)`}
          />
        ))}
      </div>
      <ul className="book-comp-legend">
        <li>
          <span className="book-comp-sw book-comp-sw-core" aria-hidden="true" />
          <span className="book-comp-legend-name">portfolio book</span>
          <span className="book-comp-legend-val">${fmt2(bookValue)}</span>
          <span className="book-comp-legend-pct">{bookPct.toFixed(1)}%</span>
        </li>
        {externals.map((e) => (
          <li key={e.id}>
            <span className="book-comp-sw book-comp-sw-ext" aria-hidden="true" />
            <span className="book-comp-legend-name">
              {e.label}{" "}
              <em className="book-comp-legend-note">
                {fmtCatalogDate(e.date)} · {e.status}
              </em>
            </span>
            <span className="book-comp-legend-val">${fmt2(e.amount)}</span>
            <span className="book-comp-legend-pct">{e.pct.toFixed(1)}%</span>
          </li>
        ))}
      </ul>
      <p className="book-comp-caveat">
        <em>
          external entries settle into the book at the next rebalance. until then
          they sit here — publicly, on the record. art portfolio coming soon.
        </em>
      </p>
    </section>
  );
}
