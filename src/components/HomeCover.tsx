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
        {isUp ? "+" : ""}{gainPct}% from entry
        <span className="hc-live-dot" />
        <span className="hc-live-label">LIVE</span>
      </div>
      <div className="hc-progress">
        <div className="hc-progress-fill" style={{ width: `${progressPct}%` }} />
      </div>
      <div className="hc-progress-labels">
        <span>${entryValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
        <span className="hc-progress-odds">~8% implied odds</span>
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
      {/* ── Warm ambient light ── */}
      <div className="hc-ambient" aria-hidden="true" />

      {/* ── HERO (dark, golden letter) ── */}
      <section className="hc-hero">
        <header className="hc-header">
          <span className="hc-wordmark">aureliex</span>
          <span className="hc-days">{daysToBirthday}d</span>
        </header>

        <div className="hc-hero-body">
          <p className="hc-eyebrow">a public wager</p>
          <h1 className="hc-headline">
            $3,453 <span className="hc-arrow">→</span> $100,000
          </h1>
          <p className="hc-sub">
            Probably impossible. Definitely public. By my 20th birthday.
          </p>

          <LiveValue
            holdings={holdings}
            pendingCash={pendingCash}
            fallback={totalNow}
            entryValue={entryValue}
          />

          <div className="hc-ctas">
            <Link href="/green-credit" className="hc-btn-primary">
              Read the thesis
            </Link>
            <Link href="/argument" className="hc-btn-ghost">
              Watch the AI panel argue →
            </Link>
          </div>

          <p className="hc-disclaimer">
            You get back what you put in. Gains and losses are mine, not yours.
          </p>
        </div>

        {/* ── Right column: countdown + stats (desktop) ── */}
        <aside className="hc-sidebar">
          <div className="hc-stat">
            <span className="hc-stat-label">deadline</span>
            <span className="hc-stat-value">june 21, 2026</span>
          </div>
          <div className="hc-stat">
            <span className="hc-stat-label">books</span>
            <span className="hc-stat-value">stocks + polymarket + kalshi</span>
          </div>
          <div className="hc-stat">
            <span className="hc-stat-label">entry</span>
            <span className="hc-stat-value">from $10</span>
          </div>
          <div className="hc-stat">
            <span className="hc-stat-label">redemption</span>
            <span className="hc-stat-value">venmo/zelle &lt;60s</span>
          </div>
        </aside>
      </section>

      {/* ── TRANSITION (gradient blend) ── */}
      <div className="hc-transition" aria-hidden="true" />

      {/* ── BODY (cream, article-style) ── */}
      <section className="hc-body">
        <div className="hc-article">
          <h2 className="hc-article-heading">What&rsquo;s happening</h2>
          <p>
            One person bet $3,453 on a portfolio of stocks, prediction markets,
            and one art piece — racing to $100,000 by June 21. Every position,
            every trade, every dollar is published in real time. The implied odds
            of hitting the target are about 8%. The gap between what is reasonable
            and what I am asking for is the entire joke and the entire point.
          </p>
          <p>
            You can buy in from $10. You can redeem on demand — I send you Venmo
            or Zelle from my personal bank account in under 60 seconds. You get
            back exactly what you put in. The upside and the risk are mine alone.
          </p>
        </div>

        <div className="hc-article">
          <h2 className="hc-article-heading">How it works</h2>
          <div className="hc-steps">
            <div className="hc-step">
              <span className="hc-step-n">1</span>
              <p><strong>Buy in</strong> — $10 to $1,000. Redeemable at any time, at par.</p>
            </div>
            <div className="hc-step">
              <span className="hc-step-n">2</span>
              <p><strong>Watch the panel</strong> — five AI agents debate every move. <Link href="/argument" className="hc-inline-link">See the latest →</Link></p>
            </div>
            <div className="hc-step">
              <span className="hc-step-n">3</span>
              <p><strong>June 21 in LA</strong> — five sealed claims revealed, art auctioned, flights covered.</p>
            </div>
          </div>
        </div>

        <div className="hc-article hc-letter-section">
          <h2 className="hc-article-heading">From the pre-mortem</h2>
          <blockquote className="hc-pullquote">
            &ldquo;The gap between what is reasonable and what I am asking for
            is the entire joke and the entire point. One day I am going to grow wings.&rdquo;
          </blockquote>
          <Link href="/let-down" className="hc-inline-link">Read the full essay →</Link>
        </div>

        <div className="hc-footer-cta">
          <Link href="/green-credit" className="hc-btn-primary">Read the thesis — then decide</Link>
          <p className="hc-footer-meta">
            from $10 · redeemable at par · venmo or zelle · personally guaranteed by saapai
          </p>
        </div>
      </section>

      {/* ── Bottom nav (mobile) ── */}
      <nav className="hc-bottom-nav">
        <Link href="/stocks">portfolio</Link>
        <Link href="/art">art</Link>
        <Link href="/prediction">odds</Link>
        <Link href="/argument">debate</Link>
        <Link href="/green-credit">buy in</Link>
      </nav>
    </div>
  );
}
