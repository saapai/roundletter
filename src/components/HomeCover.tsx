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

const PREDICTION_OFFSET = 250;

function LiveNumber({
  holdings, pendingCash, fallback, entryValue,
}: {
  holdings: Props["holdings"]; pendingCash: number; fallback: number;
  entryValue: number;
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
        let sum = pendingCash + PREDICTION_OFFSET;
        for (const h of holdings) {
          const s = j.data[h.ticker];
          if (s?.closes?.length > 0) sum += h.shares * s.closes[s.closes.length - 1];
          else sum += h.entry_value;
        }
        if (prevRef.current !== null && sum !== prevRef.current) {
          setFlash(sum >= prevRef.current ? "up" : "down");
          setTimeout(() => setFlash(null), 600);
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
    <div className="hc-number-block">
      <div className={`hc-number ${flash === "up" ? "hc-flash-up" : flash === "down" ? "hc-flash-down" : ""}`}>
        <span className="hc-currency">$</span>
        {Math.round(value).toLocaleString("en-US")}
      </div>
      <div className="hc-delta">
        <span className={isUp ? "hc-up" : "hc-down"}>
          {isUp ? "+" : ""}{gainPct}%
        </span>
        {" "}since apr 12
        <span className="hc-dot" />
        <span className="hc-live-label">live</span>
      </div>
    </div>
  );
}

export default function HomeCover({
  totalNow, daysToBirthday, holdings, pendingCash, entryValue,
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`hc-root ${mounted ? "hc-in" : ""}`}>

      {/* ── hero ── */}
      <section className="hc-hero">
        <LiveNumber
          holdings={holdings}
          pendingCash={pendingCash}
          fallback={totalNow}
          entryValue={entryValue}
        />

        <p className="hc-context">
          I&rsquo;m Saathvik. I&rsquo;m 19. This is my bankroll &mdash;
          stocks, prediction markets, and art &mdash; updated live.
          I&rsquo;m trying to turn it into $100k by my birthday.
          {daysToBirthday > 0 && <> {daysToBirthday} days left.</>}
        </p>

        <p className="hc-context hc-context-honest">
          It probably won&rsquo;t work. I published the{" "}
          <Link href="/letters/round-0" className="hc-link">pre-mortem</Link>{" "}
          before I started so I can&rsquo;t pretend otherwise later.
        </p>
      </section>

      {/* ── what's here ── */}
      <section className="hc-section">
        <h2 className="hc-heading">What&rsquo;s here</h2>
        <div className="hc-grid">
          <Link href="/stocks" className="hc-card">
            <span className="hc-card-label">Investments</span>
            <span className="hc-card-desc">10 positions, live prices, every trade logged</span>
          </Link>
          <Link href="/prediction" className="hc-card">
            <span className="hc-card-label">Prediction markets</span>
            <span className="hc-card-desc">Polymarket + Kalshi, real bets</span>
          </Link>
          <Link href="/art" className="hc-card">
            <span className="hc-card-label">Art</span>
            <span className="hc-card-desc">12 original pieces, graphite and watercolor</span>
          </Link>
          <Link href="/argument" className="hc-card">
            <span className="hc-card-label">The argument</span>
            <span className="hc-card-desc">5 AI agents debate every trade, daily</span>
          </Link>
          <Link href="/letters/round-0" className="hc-card">
            <span className="hc-card-label">Letters</span>
            <span className="hc-card-desc">What I&rsquo;m thinking, published before it resolves</span>
          </Link>
          <Link href="/invest" className="hc-card">
            <span className="hc-card-label">Green credit</span>
            <span className="hc-card-desc">Back the wager, come to the party</span>
          </Link>
        </div>
      </section>

      {/* ── the party ── */}
      <section className="hc-section">
        <h2 className="hc-heading">June 21</h2>
        <p className="hc-body">
          My birthday. Everyone who backed this gets comped to the party.
          Five sealed predictions open at 6pm. One original artwork goes
          to the highest bidder. The math resolves in front of everyone
          in the room.
        </p>
        <p className="hc-body hc-body-dim">
          Flights reimbursed. Location texted 7 days before.
          Personally guaranteed &mdash;{" "}
          <a href="https://venmo.com/saathvikpai" className="hc-link">venmo</a>
          {" "}or{" "}
          <span className="hc-mono">385-368-7238</span> zelle.
        </p>
      </section>

      {/* ── latest ── */}
      <section className="hc-section">
        <Link href="/letters/round-1" className="hc-letter-link">
          <span className="hc-letter-tag">latest letter</span>
          <span className="hc-letter-title">Round 1 &mdash; What the Attention Built</span>
          <span className="hc-letter-arrow">&rarr;</span>
        </Link>
      </section>

      {/* ── footer ── */}
      <footer className="hc-footer">
        <nav className="hc-footer-nav">
          <Link href="/stocks">investments</Link>
          <Link href="/art">art</Link>
          <Link href="/prediction">prediction</Link>
          <Link href="/argument">panel</Link>
          <Link href="/letters/round-0">letters</Link>
          <Link href="/invest">green credit</Link>
        </nav>
        <p className="hc-footer-sig">saathvik pai</p>
        <p className="hc-footer-note">real money &middot; published in full &middot; not advice</p>
      </footer>
    </div>
  );
}
