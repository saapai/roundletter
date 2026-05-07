"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";

type Props = {
  totalNow: number;
  daysToBirthday: number;
  holdings: Array<{ ticker: string; shares: number; entry_value: number }>;
  pendingCash: number;
  entryValue: number;
};

function LiveValue({
  holdings, pendingCash, fallback, entryValue, revealed,
}: {
  holdings: Props["holdings"]; pendingCash: number; fallback: number;
  entryValue: number; revealed: boolean;
}) {
  const [total, setTotal] = useState<number | null>(null);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  const prevRef = useRef<number | null>(null);

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
      } catch { /* noop */ }
    };
    pull();
    const id = setInterval(pull, 30_000);
    return () => { alive = false; clearInterval(id); };
  }, [holdings, pendingCash]);

  const value = total ?? fallback;
  const gain = value - entryValue;
  const gainPct = ((gain / entryValue) * 100).toFixed(1);
  const isUp = gain >= 0;

  return (
    <>
      <div className={`hc-number ${flash === "up" ? "hc-flash-up" : flash === "down" ? "hc-flash-down" : ""}`}>
        <span className="hc-currency">$</span>
        {Math.round(value).toLocaleString("en-US")}
      </div>
      {revealed && (
        <div className={`hc-delta ${isUp ? "hc-up" : "hc-down"}`}>
          {isUp ? "↑" : "↓"}{Math.abs(Number(gainPct))}% since I started
          <span className="hc-live-dot" />
          <span className="hc-live-label">LIVE</span>
        </div>
      )}
    </>
  );
}

export default function HomeCover({
  totalNow, daysToBirthday, holdings, pendingCash, entryValue,
}: Props) {
  const [phase, setPhase] = useState<"void" | "number" | "full">("void");

  const runOpen = useCallback(() => {
    // DO NOT shorten this delay.
    // The number must stand alone for at least 1200ms.
    // That pause IS the design. — v11 spec
    setTimeout(() => setPhase("number"), 150);
    setTimeout(() => setPhase("full"), 1400);
  }, []);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("hc_open_v11") === "1") {
        setPhase("full");
        return;
      }
    } catch { /* noop */ }
    sessionStorage.setItem("hc_open_v11", "1");
    runOpen();
  }, [runOpen]);

  const numberVisible = phase === "number" || phase === "full";
  const fullVisible = phase === "full";

  return (
    <div className="hc-root" data-phase={phase}>
      <div className="hc-ambient" aria-hidden="true" />

      <section className="hc-hero">
        <div className={`hc-context ${fullVisible ? "hc-visible" : ""}`}>
          <p className="hc-eyebrow">a public wager</p>
          <h1 className="hc-headline">
            $3,453 <span className="hc-arrow">→</span> $100,000
          </h1>
          <p className="hc-sub">
            Probably impossible.<br />
            Definitely public.<br />
            By my 20th birthday. {daysToBirthday} days left.
          </p>
          <div className="hc-rule" />
        </div>

        <div className={`hc-live-block ${numberVisible ? "hc-visible" : ""}`}>
          <LiveValue
            holdings={holdings} pendingCash={pendingCash}
            fallback={totalNow} entryValue={entryValue}
            revealed={fullVisible}
          />
        </div>

        <div className={`hc-actions ${fullVisible ? "hc-visible" : ""}`}>
          <Link href="/invest" className="hc-btn-primary">The wager →</Link>
          <Link href="/argument" className="hc-text-link">Watch the AI panel argue →</Link>
        </div>
      </section>

      <div className="hc-transition" aria-hidden="true" />

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
            concentrate in 4&#8211;6 positions, size by conviction, don&rsquo;t
            hedge what you believe.{" "}
            <Link href="/green-credit" className="hc-inline-link">The full argument →</Link>
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
            <span className="hc-stat-label">starting capital</span>
            <span className="hc-stat-value">$3,453</span>
          </div>
          <div className="hc-stat-item">
            <span className="hc-stat-label">target</span>
            <span className="hc-stat-value">$100,000</span>
          </div>
          <div className="hc-stat-item">
            <span className="hc-stat-label">days remaining</span>
            <span className="hc-stat-value">{daysToBirthday}</span>
          </div>
        </div>

        <div className="hc-footer-cta">
          <p className="hc-footer-line">
            If you want the numbers:{" "}
            <Link href="/invest" className="hc-inline-link">/invest →</Link>
          </p>
          <p className="hc-footer-meta">
            venmo{" "}
            <a href="https://venmo.com/saathvikpai" className="hc-inline-link">@saathvikpai</a>
            {" "}· zelle{" "}
            <a href="tel:3853687238" className="hc-inline-link">385-368-7238</a>
            {" "}· personally guaranteed
          </p>
        </div>
      </section>

      <nav className="hc-bottom-nav">
        <Link href="/stocks">stocks</Link>
        <Link href="/letters/round-0">letters</Link>
        <Link href="/art">art</Link>
        <Link href="/invest">invest</Link>
      </nav>
    </div>
  );
}
