"use client";
import { useEffect, useMemo, useState } from "react";
import BirthdayCountdown from "./BirthdayCountdown";

// Savings-hero tombstone — the ride from $1,296 → peak sets the hero figure
// (serif, flat ink on paper, gilt hairline). Drawdown stays on the record but
// demoted into a three-cell statement row with hairline dividers. A ticking
// HH:MM:SS countdown to the birthday deadline sits under the tombstone —
// the clock the book is racing, not a motion gimmick.

type Holding = { ticker: string; shares: number; entry_value: number };
type Series = { timestamps: number[]; closes: number[] };
type PricesResponse = {
  data: Record<string, Series | null>;
  fetchedAt: number;
  hasData: boolean;
};

type Props = {
  holdings: Holding[];
  startedValue: number;
  peakValue: number;
  peakDate: string;
  baselineValue: number;
  goal: number;
  baselineDate: string;
  birthdate: string;
};

function fmt$(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
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
  const { holdings, startedValue, peakValue, peakDate, baselineValue, goal, baselineDate, birthdate } = props;
  const [prices, setPrices] = useState<PricesResponse | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw) as PricesResponse & { _savedAt: number };
        if (cached._savedAt && Date.now() - cached._savedAt < FRESH_MS) {
          setPrices(cached);
          return;
        }
      }
    } catch {}
    fetch("/api/prices", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j) setPrices(j);
        if (j) {
          try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ...j, _savedAt: Date.now() })); } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const current = useMemo(() => {
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
    return anyLive ? total : baselineValue;
  }, [prices, holdings, baselineValue]);

  const isLive = prices?.hasData ?? false;

  const peakGain = peakValue - startedValue;
  const peakGainPct = (peakGain / startedValue) * 100;
  const drawFromPeak = current - peakValue;
  const drawPctFromPeak = (drawFromPeak / peakValue) * 100;
  const toGoal = goal - current;
  const multipleToGoal = goal / current;

  const logMin = Math.log(startedValue);
  const logMax = Math.log(goal);
  const posPct = ((Math.log(Math.max(current, 1)) - logMin) / (logMax - logMin)) * 100;
  const peakPct = ((Math.log(peakValue) - logMin) / (logMax - logMin)) * 100;

  return (
    <section className="savings-hero">
      <div className="savings-tombstone-eyebrow">
        the savings story — sighted {fmtCatalogDateWithYear(baselineDate)}, {isLive ? "15-min tape" : "reconciled"}
      </div>

      <div className="savings-tombstone">
        <div className="savings-tombstone-figure">
          {peakGainPct.toFixed(0)}<span className="savings-tombstone-pct">%</span>
        </div>
        <div className="savings-tombstone-sub">
          ${fmt$(startedValue)} <em>jan 2025</em>
          {" — "}
          <span className="savings-tombstone-peak">${fmt$(peakValue)}</span> <em>{fmtCatalogDate(peakDate)}</em>
        </div>
        <div className="savings-tombstone-rule" aria-hidden="true" />
        <div className="savings-tombstone-current">
          on the books today · <span className="savings-tombstone-current-figure">${fmt$(current)}</span>
        </div>
        <div className="savings-tombstone-countdown">
          <BirthdayCountdown birthdate={birthdate} />
        </div>
      </div>

      <div className="savings-grid">
        <div className="savings-cell">
          <div className="savings-cell-label">high-water, {fmtCatalogDate(peakDate)}</div>
          <div className="savings-cell-value savings-peak">${fmt$(peakValue)}</div>
          <div className="savings-cell-note">+${fmt$(peakGain)} ({peakGainPct.toFixed(0)}%)</div>
        </div>

        <div className="savings-cell">
          <div className="savings-cell-label">gave some back</div>
          <div className="savings-cell-value savings-draw">{drawPctFromPeak.toFixed(1)}%</div>
          <div className="savings-cell-note">${fmt$(drawFromPeak)}</div>
        </div>

        <div className="savings-cell">
          <div className="savings-cell-label">to six figures by 21 june</div>
          <div className="savings-cell-value savings-goal">{multipleToGoal.toFixed(1)}x</div>
          <div className="savings-cell-note">${fmt$(toGoal)} to go</div>
        </div>
      </div>

      <div className="savings-bar-wrap" aria-hidden="true">
        <div className="savings-bar-track">
          <div className="savings-bar-fill" style={{ width: `${posPct}%` }} />
          <div className="savings-bar-peak-mark" style={{ left: `${peakPct}%` }} title={`peak $${fmt$(peakValue)}`} />
          <div className="savings-bar-now-mark" style={{ left: `${posPct}%` }} title={`now $${fmt$(current)}`} />
        </div>
        <div className="savings-bar-labels">
          <span>${fmt$(startedValue)}<br/><em>jan 2025</em></span>
          <span className="savings-bar-label-goal">${fmt$(goal)}<br/><em>21 june</em></span>
        </div>
      </div>

      <p className="savings-caveat">
        <em>
          {isLive
            ? "live quotes from yahoo (15-min cache). sum of shares × last close across the 10-holding book. the savings story is the one held through the drawdown — not the one at peak."
            : "live prices unavailable; these are the last reconciled numbers. the savings story is the one held through the drawdown — not the one at peak."}
        </em>
      </p>
    </section>
  );
}
