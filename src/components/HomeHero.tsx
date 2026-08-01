"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BirthdayCountdown from "@/components/BirthdayCountdown";
import {
  useEggs,
  EggWordmarkTrigger,
  EggPartyListener,
  EggOrnamentTrigger,
  EggToast,
} from "@/components/EasterEggs";

type Holding = {
  ticker: string;
  shares: number;
  entry_price: number;
  entry_value: number;
};

type Series = { timestamps: number[]; closes: number[] };
type PricesResponse = {
  data: Record<string, Series | null>;
  fetchedAt: number;
  hasData: boolean;
};

type Props = {
  holdings: Holding[];
  accountValueAtEntry: number;
  peakValue: number;
  birthdate: string;
  baselineDate: string;
  historyStart: number; // Jan 2025 start value
};

export default function HomeHero({
  holdings,
  accountValueAtEntry,
  peakValue,
  birthdate,
  baselineDate,
  historyStart,
}: Props) {
  const { eggs, findEgg, justFound, allFound, discount } = useEggs();
  const [prices, setPrices] = useState<PricesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const CACHE_KEY = "prices-cache-v1";
    const FRESH_MS = 10 * 60 * 1000;
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw);
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
          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ...j, _savedAt: Date.now() }));
          } catch {}
        }
      })
      .catch(() => setLoading(false));
  }, []);

  // Compute current portfolio value from latest prices
  const currentValue = useMemo(() => {
    if (!prices?.hasData) return null;
    let total = 0;
    for (const h of holdings) {
      const s = prices.data[h.ticker];
      if (s && s.closes.length > 0) {
        total += h.shares * s.closes[s.closes.length - 1];
      } else {
        total += h.entry_value;
      }
    }
    return total;
  }, [prices, holdings]);

  // % gains
  const bookGainPct = currentValue
    ? ((currentValue - accountValueAtEntry) / accountValueAtEntry) * 100
    : null;
  const totalGainPct = currentValue
    ? ((currentValue - historyStart) / historyStart) * 100
    : null;
  const fromPeakPct = currentValue
    ? ((currentValue - peakValue) / peakValue) * 100
    : null;

  // Per-stock gains
  const stockGains = useMemo(() => {
    if (!prices?.hasData) return [];
    return holdings.map((h) => {
      const s = prices.data[h.ticker];
      const currentPrice = s && s.closes.length > 0 ? s.closes[s.closes.length - 1] : null;
      const gainPct = currentPrice
        ? ((currentPrice - h.entry_price) / h.entry_price) * 100
        : null;
      return { ticker: h.ticker, gainPct, currentPrice };
    });
  }, [prices, holdings]);

  // Days since baseline
  const baselineMs = new Date(baselineDate + "T00:00:00").getTime();
  const dayNumber = Math.max(1, Math.ceil((Date.now() - baselineMs) / 86_400_000));

  return (
    <div className="home-hero">
      <EggPartyListener findEgg={findEgg} />
      <EggToast justFound={justFound} />

      {/* Hero value */}
      <section className="hero-value-section">
        <div className="hero-eyebrow">
          <span>aureliex · day {dayNumber} · live</span>
          <BirthdayCountdown birthdate={birthdate} />
        </div>

        <div className="hero-value">
          {loading ? (
            <span className="hero-value-loading">—</span>
          ) : currentValue ? (
            <span className="hero-value-number">
              ${currentValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </span>
          ) : (
            <span className="hero-value-number">
              ${accountValueAtEntry.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </span>
          )}
        </div>

        {/* % Gains row */}
        <div className="hero-gains">
          {bookGainPct !== null && (
            <div className="hero-gain">
              <span className={`hero-gain-pct ${bookGainPct >= 0 ? "is-up" : "is-down"}`}>
                {bookGainPct >= 0 ? "+" : ""}{bookGainPct.toFixed(1)}%
              </span>
              <span className="hero-gain-label">since entry</span>
            </div>
          )}
          {totalGainPct !== null && (
            <div className="hero-gain">
              <span className={`hero-gain-pct ${totalGainPct >= 0 ? "is-up" : "is-down"}`}>
                {totalGainPct >= 0 ? "+" : ""}{totalGainPct.toFixed(1)}%
              </span>
              <span className="hero-gain-label">total (jan '25)</span>
            </div>
          )}
          {fromPeakPct !== null && (
            <div className="hero-gain">
              <span className={`hero-gain-pct ${fromPeakPct >= 0 ? "is-up" : "is-down"}`}>
                {fromPeakPct >= 0 ? "+" : ""}{fromPeakPct.toFixed(1)}%
              </span>
              <span className="hero-gain-label">from peak</span>
            </div>
          )}
        </div>
      </section>

      {/* Stock gains grid */}
      {stockGains.length > 0 && stockGains.some((s) => s.gainPct !== null) && (
        <section className="hero-stocks">
          <div className="hero-stocks-grid">
            {stockGains.map((s) => (
              <div key={s.ticker} className="hero-stock">
                <span className="hero-stock-ticker">{s.ticker}</span>
                {s.gainPct !== null ? (
                  <span className={`hero-stock-gain ${s.gainPct >= 0 ? "is-up" : "is-down"}`}>
                    {s.gainPct >= 0 ? "+" : ""}{s.gainPct.toFixed(1)}%
                  </span>
                ) : (
                  <span className="hero-stock-gain">—</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Easter egg ornament divider */}
      <div className="hero-ornament">
        <EggOrnamentTrigger findEgg={findEgg} />
      </div>

      {/* The thesis */}
      <section className="hero-thesis">
        <p className="hero-thesis-text">
          $3,453 → $100,000 by my birthday. No job. Five AI agents.
          A public logbook. An ego mini-game with a P&L attached.
        </p>
        <p className="hero-thesis-sub">
          <em>The pre-mortem, published before I fail.</em>
        </p>
      </section>

      {/* Invest CTA */}
      <section className="hero-invest">
        <div className="hero-invest-inner">
          <h2>Join the Pool</h2>
          <p>
            Invest early, invest more — your allocation weight grows with time.
          </p>
          <div className="hero-invest-methods">
            <a
              href="https://venmo.com/saathvikpai"
              target="_blank"
              rel="noopener noreferrer"
              className="hero-invest-btn hero-invest-primary"
            >
              Venmo @saathvikpai — no fees
            </a>
            <Link href="/invest" className="hero-invest-btn hero-invest-secondary">
              Invest via Stripe →
            </Link>
          </div>
          <p className="hero-invest-note">
            Paying directly avoids the Stripe processing fee — your full investment enters the pool.
          </p>
          {discount > 0 && (
            <p className="hero-invest-discount">
              ${discount} discount found — applied at checkout
            </p>
          )}
        </div>
      </section>

      {/* Navigation links */}
      <section className="hero-stack">
        <Link href="/letters/round-0">the pre-mortem</Link>
        <Link href="/positions">positions</Link>
        <Link href="/trades">trades</Link>
        <Link href="/invest">invest</Link>
        <Link href="/canvas">canvas</Link>
      </section>
    </div>
  );
}
