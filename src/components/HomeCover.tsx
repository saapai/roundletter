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
  holdings, pendingCash, fallback, entryValue,
}: {
  holdings: Props["holdings"]; pendingCash: number; fallback: number; entryValue: number;
}) {
  const [total, setTotal] = useState<number | null>(null);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  const prevRef = useRef<number | null>(null);
  const [counted, setCounted] = useState(false);
  const [displayVal, setDisplayVal] = useState(0);
  const rafRef = useRef<number>();

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

  return (
    <div className="hc-live-block">
      <div className={`hc-number ${flash === "up" ? "hc-flash-up" : flash === "down" ? "hc-flash-down" : ""}`}>
        ${displayVal.toLocaleString("en-US")}
      </div>
      <div className={`hc-delta ${isUp ? "hc-up" : "hc-down"}`}>
        {isUp ? "↑" : "↓"}{Math.abs(Number(gainPct))}% since I started
        <span className="hc-live-dot" />
        <span className="hc-live-label">LIVE</span>
      </div>
    </div>
  );
}

/* ── Homepage ────────────────────────────────────────── */
export default function HomeCover({
  totalNow, daysToBirthday, holdings, pendingCash, entryValue,
}: Props) {
  return (
    <div className="hc-root">
      <div className="hc-ambient" aria-hidden="true" />

      {/* ── HERO ── */}
      <section className="hc-hero">
        <p className="hc-eyebrow">a public wager</p>

        <h1 className="hc-headline">
          $3,453 <span className="hc-arrow">→</span> $100,000
        </h1>
        <p className="hc-sub">
          Probably impossible. Definitely public.<br />
          By my 20th birthday. {daysToBirthday} days left.
        </p>

        <LiveValue
          holdings={holdings}
          pendingCash={pendingCash}
          fallback={totalNow}
          entryValue={entryValue}
        />

        <Link href="/invest" className="hc-btn-primary">
          Read the thesis
        </Link>
        <Link href="/argument" className="hc-text-link">
          Watch the AI panel argue →
        </Link>
      </section>

      {/* ── TRANSITION ── */}
      <div className="hc-transition" aria-hidden="true" />

      {/* ── BODY ── */}
      <section className="hc-body">
        <blockquote className="hc-pullquote">
          &ldquo;The gap between what is reasonable and what I am asking for
          is the entire joke and the entire point.
          One day I am going to grow wings.&rdquo;
        </blockquote>
        <p className="hc-pullquote-attr">
          <Link href="/let-down" className="hc-inline-link">from the pre-mortem →</Link>
        </p>

        <div className="hc-letter">
          <p>
            I put $3,453 into a brokerage account. I was 19. I told people
            about it. Every position, every trade, every dollar in and out is
            published in real time. The implied odds of hitting $100,000 are
            about 8%.
          </p>
          <p>
            The apparatus runs three books: stocks on Fidelity, prediction
            markets on Polymarket and Kalshi, and one art piece up for sealed
            auction. The thesis is simple to state and hard to execute:
            concentrate in 4-6 positions, size by conviction, don&rsquo;t
            hedge what you believe.{" "}
            <Link href="/green-credit" className="hc-inline-link">Read the full argument →</Link>
          </p>
          <p>
            You can buy in from $10. You can redeem on demand &mdash; I send
            you Venmo or Zelle from my personal bank account in under 60
            seconds. You get back exactly what you put in. The upside and the
            risk are mine alone.
          </p>
        </div>

        <div className="hc-stats-row">
          <div className="hc-stat-item">
            <span className="hc-stat-label">deadline</span>
            <span className="hc-stat-value">june 21, 2026</span>
          </div>
          <div className="hc-stat-item">
            <span className="hc-stat-label">books</span>
            <span className="hc-stat-value">stocks · polymarket · kalshi</span>
          </div>
          <div className="hc-stat-item">
            <span className="hc-stat-label">entry</span>
            <span className="hc-stat-value">from $10</span>
          </div>
          <div className="hc-stat-item">
            <span className="hc-stat-label">redemption</span>
            <span className="hc-stat-value">venmo · zelle · &lt;60s</span>
          </div>
        </div>

        <div className="hc-footer-cta">
          <Link href="/invest" className="hc-btn-primary hc-btn-dark">
            Watch it happen
          </Link>
          <p className="hc-footer-meta">
            venmo{" "}
            <a href="https://venmo.com/saathvikpai" className="hc-inline-link">@saathvikpai</a>
            {" "}· zelle{" "}
            <a href="tel:3853687238" className="hc-inline-link">385-368-7238</a>
            {" "}· personally guaranteed
          </p>
        </div>
      </section>

      {/* ── Bottom nav (mobile) ── */}
      <nav className="hc-bottom-nav">
        <Link href="/stocks">stocks</Link>
        <Link href="/letters/round-0">letters</Link>
        <Link href="/art">art</Link>
        <Link href="/invest">invest</Link>
      </nav>
    </div>
  );
}
