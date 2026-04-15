"use client";
import { useEffect, useMemo, useState } from "react";

// Live savings hero — recomputes current account value from Yahoo last
// closes (sum of shares × last close across all holdings) and derives
// gain-from-start / drawdown-from-peak / distance-to-goal from that.
// Falls back to static baseline when quotes are unavailable.

type Holding = { ticker: string; shares: number; entry_value: number };
type Series = { timestamps: number[]; closes: number[] };
type PricesResponse = {
  data: Record<string, Series | null>;
  fetchedAt: number;
  hasData: boolean;
};

type Props = {
  holdings: Holding[];
  startedValue: number;      // Jan 2025 start value
  peakValue: number;
  peakDate: string;
  baselineValue: number;     // reconciled account value at entry (fallback)
  goal: number;
};

function fmt$(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

const CACHE_KEY = "prices-cache-v1";
const FRESH_MS = 10 * 60 * 1000;

export default function SavingsHero(props: Props) {
  const { holdings, startedValue, peakValue, peakDate, baselineValue, goal } = props;
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

  // Current = sum(shares × last close). For any missing ticker, fall back
  // to entry_value so a partial quote outage doesn't wipe the total.
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

  const gainFromStart = current - startedValue;
  const gainPctFromStart = (gainFromStart / startedValue) * 100;
  const peakGain = peakValue - startedValue;
  const peakGainPct = (peakGain / startedValue) * 100;
  const drawFromPeak = current - peakValue;
  const drawPctFromPeak = (drawFromPeak / peakValue) * 100;
  const toGoal = goal - current;
  const multipleToGoal = goal / current;

  // Log-scale progress bar
  const logMin = Math.log(startedValue);
  const logMax = Math.log(goal);
  const posPct = ((Math.log(Math.max(current, 1)) - logMin) / (logMax - logMin)) * 100;
  const peakPct = ((Math.log(peakValue) - logMin) / (logMax - logMin)) * 100;

  return (
    <section className="savings-hero">
      <div className="savings-eyebrow">// the savings story {isLive ? "· live" : "· reconciled"}</div>

      <div className="savings-grid">
        <div className="savings-cell savings-cell-main">
          <div className="savings-cell-label">current account</div>
          <div className="savings-cell-value">${fmt$(current)}</div>
          <div className="savings-cell-note">
            <span className="savings-up">+${fmt$(gainFromStart)}</span>
            {" "}({gainPctFromStart.toFixed(0)}%) since jan 2025
          </div>
        </div>

        <div className="savings-cell">
          <div className="savings-cell-label">peak</div>
          <div className="savings-cell-value savings-peak">${fmt$(peakValue)}</div>
          <div className="savings-cell-note">
            +${fmt$(peakGain)} ({peakGainPct.toFixed(0)}%) · {peakDate}
          </div>
        </div>

        <div className="savings-cell">
          <div className="savings-cell-label">vs peak</div>
          <div className="savings-cell-value savings-draw">{drawPctFromPeak.toFixed(1)}%</div>
          <div className="savings-cell-note">${fmt$(drawFromPeak)} (gave back)</div>
        </div>

        <div className="savings-cell">
          <div className="savings-cell-label">to $100k</div>
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
          <span className="savings-bar-label-goal">${fmt$(goal)}<br/><em>june 21</em></span>
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
