"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";

type Props = {
  totalNow: number;
  daysToBirthday: number;
  holdings: Array<{ ticker: string; shares: number; entry_value: number }>;
  pendingCash: number;
  entryValue: number;
};

/* ── Live-polling total ─────────────────────────────────── */
function LiveValue({
  holdings,
  pendingCash,
  fallback,
  entryValue,
}: {
  holdings: Props["holdings"];
  pendingCash: number;
  fallback: number;
  entryValue: number;
}) {
  const [total, setTotal] = useState<number | null>(null);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  const prevRef = useRef<number | null>(null);
  const [counted, setCounted] = useState(false);
  const [displayVal, setDisplayVal] = useState(0);
  const rafRef = useRef<number>();

  /* count-up on first load */
  useEffect(() => {
    const target = total ?? fallback;
    if (counted) return;
    const start = performance.now();
    const duration = 1800;
    const ease = (t: number) => 1 - Math.pow(1 - t, 4);
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setDisplayVal(Math.round(ease(p) * target));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
      else setCounted(true);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [total, fallback, counted]);

  /* poll /api/prices */
  useEffect(() => {
    let alive = true;
    const pull = async () => {
      try {
        const r = await fetch("/api/prices", { cache: "no-store" });
        if (!r.ok || !alive) return;
        const j = await r.json();
        if (!j?.hasData || !alive) return;
        let sum = pendingCash;
        for (const h of holdings) {
          const s = j.data[h.ticker];
          if (s?.closes?.length > 0) sum += h.shares * s.closes[s.closes.length - 1];
          else sum += h.entry_value;
        }
        if (prevRef.current !== null && sum !== prevRef.current) {
          setFlash(sum >= prevRef.current ? "up" : "down");
          setTimeout(() => setFlash(null), 800);
        }
        prevRef.current = sum;
        setTotal(sum);
        if (counted) setDisplayVal(Math.round(sum));
      } catch { /* noop */ }
    };
    pull();
    const id = setInterval(pull, 30_000);
    return () => { alive = false; clearInterval(id); };
  }, [holdings, pendingCash, counted]);

  const value = total ?? fallback;
  const gain = value - entryValue;
  const gainPct = ((gain / entryValue) * 100).toFixed(1);
  const isUp = gain >= 0;
  const progressPct = Math.min(100, ((value - entryValue) / (100_000 - entryValue)) * 100);

  return (
    <>
      <div className={`hc-number ${flash === "up" ? "hc-flash-up" : flash === "down" ? "hc-flash-down" : ""}`}>
        ${displayVal.toLocaleString("en-US")}
      </div>
      <div className={`hc-delta ${isUp ? "hc-up" : "hc-down"}`}>
        {isUp ? "▲" : "▼"} {isUp ? "+" : ""}${Math.round(Math.abs(gain)).toLocaleString("en-US")} ({isUp ? "+" : ""}{gainPct}%)
        <span className="hc-live-dot" />
        <span className="hc-live-label">LIVE</span>
      </div>
      <div className="hc-progress">
        <div className="hc-progress-fill" style={{ width: `${progressPct}%` }} />
      </div>
      <div className="hc-progress-labels">
        <span>${entryValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
        <span>$100,000</span>
      </div>
    </>
  );
}

/* ── Main homepage component ────────────────────────────── */
export default function HomeCover({
  totalNow,
  daysToBirthday,
  holdings,
  pendingCash,
  entryValue,
}: Props) {
  return (
    <div className="hc-root">
      {/* ── HERO (dark) ── */}
      <section className="hc-hero">
        <header className="hc-header">
          <span className="hc-wordmark">aureliex</span>
          <span className="hc-days">{daysToBirthday} days left</span>
        </header>

        <div className="hc-hero-body">
          <h1 className="hc-headline">
            I&rsquo;m turning $3,453 into $100,000.
          </h1>
          <p className="hc-sub">In public. By my 21st birthday. Watch.</p>

          <LiveValue
            holdings={holdings}
            pendingCash={pendingCash}
            fallback={totalNow}
            entryValue={entryValue}
          />

          <div className="hc-ctas">
            <Link href="/buy" className="hc-btn-primary">Get your stake</Link>
            <Link href="/sealed/impossible" className="hc-btn-ghost">5 claims sealed until June 21 →</Link>
          </div>
        </div>
      </section>

      {/* ── BODY (cream, article-style) ── */}
      <section className="hc-body">
        <div className="hc-article">
          <h2 className="hc-article-heading">What&rsquo;s happening</h2>
          <p>
            This is aureliex — a publicly-owned investment studio racing to $100,000 by June 21, 2026.
            Every position, every trade, every dollar in and out is published in real time.
            You can buy a stake from $10. You can redeem it on demand — Venmo or Zelle, under 60 seconds,
            personally guaranteed.
          </p>
          <p>
            The apparatus runs three books: a stock portfolio on Fidelity, prediction markets on Polymarket
            and Kalshi, and one art piece up for sealed auction. The party is in LA on June 21.
            Stake-holders get in.
          </p>
        </div>

        <div className="hc-article">
          <h2 className="hc-article-heading">How it works</h2>
          <div className="hc-steps">
            <div className="hc-step">
              <span className="hc-step-n">1</span>
              <p><strong>Buy a stake</strong> — $10 to $1,000. Funds enter the apparatus via Stripe.</p>
            </div>
            <div className="hc-step">
              <span className="hc-step-n">2</span>
              <p><strong>Watch it grow</strong> — a real portfolio, tracked live, debated by five AI agents.</p>
            </div>
            <div className="hc-step">
              <span className="hc-step-n">3</span>
              <p><strong>Show up June 21</strong> — sealed claims revealed, art auctioned, flights reimbursed.</p>
            </div>
          </div>
        </div>

        <div className="hc-article">
          <h2 className="hc-article-heading">The studio</h2>
          <div className="hc-products">
            <div className="hc-product">
              <span className="hc-product-status hc-live-badge">LIVE</span>
              <strong>The Apparatus</strong> — stock + prediction + art portfolio
            </div>
            <div className="hc-product">
              <span className="hc-product-status hc-ship-badge">SHIPS TODAY</span>
              <strong>The Panel</strong> — public AI debate, 5 agents
            </div>
            <div className="hc-product">
              <span className="hc-product-status hc-stealth-badge">STEALTH</span>
              <strong>Bruin Meals</strong> — UCLA waitlist
            </div>
            <div className="hc-product">
              <span className="hc-product-status hc-open-badge">OPEN</span>
              <strong>Product 3</strong> — TBD
            </div>
          </div>
        </div>

        <div className="hc-footer-cta">
          <Link href="/buy" className="hc-btn-primary">Get your stake — from $10</Link>
          <p className="hc-footer-meta">
            Redeemable in &lt;60s · Venmo or Zelle · personally guaranteed by saapai
          </p>
        </div>
      </section>

      {/* ── Bottom nav (mobile) ── */}
      <nav className="hc-bottom-nav">
        <Link href="/stocks">portfolio</Link>
        <Link href="/art">art</Link>
        <Link href="/prediction">odds</Link>
        <Link href="/panel">debate</Link>
        <Link href="/buy">buy in</Link>
      </nav>
    </div>
  );
}
