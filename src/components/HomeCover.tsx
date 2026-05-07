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

/* prediction markets are not in /api/prices — add as static offset */
const PREDICTION_OFFSET = 250; // $200 polymarket + $50 kalshi

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
        let sum = pendingCash + PREDICTION_OFFSET;
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
    // DO NOT shorten this delay. The number must stand alone for 1200ms+.
    setTimeout(() => setPhase("number"), 150);
    setTimeout(() => setPhase("full"), 1400);
  }, []);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("hc_open_v12") === "1") {
        setPhase("full");
        return;
      }
    } catch { /* noop */ }
    sessionStorage.setItem("hc_open_v12", "1");
    runOpen();
  }, [runOpen]);

  const numberVisible = phase === "number" || phase === "full";
  const fullVisible = phase === "full";

  return (
    <div className="hc-root" data-phase={phase}>
      <div className="hc-ambient" aria-hidden="true" />

      {/* ── HERO ── */}
      <section className="hc-hero">
        <div className={`hc-context ${fullVisible ? "hc-visible" : ""}`}>
          <p className="hc-eyebrow">a public wager</p>
          <p className="hc-attention-thesis">attention is the upstream capital.</p>
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
          <Link href="/argument" className="hc-text-link">Five agents disagree about this →</Link>
        </div>
      </section>

      {/* ── TRANSITION ── */}
      <div className="hc-transition" aria-hidden="true" />

      {/* ── BODY: three sections ── */}
      <section className="hc-body">

        {/* I. Making Money */}
        <div className="hc-section">
          <span className="hc-section-index">I.</span>
          <h2 className="hc-section-heading">Early money carries more of the flight.</h2>
          <p>
            The pool is time-weighted. A $50 stake placed now is not the same as
            a $50 stake placed in week eighteen. The early money carries more of
            the upside &mdash; because it took more of the risk. Ten percent of
            the apparatus is reserved to reimburse flights for stake-holders at
            the party. Your share is proportional to your weight.
          </p>
          <p>
            The gains and losses are mine. You are not speculating. You are holding
            a claim on my personal account &mdash; redeemable at par, on demand,
            in under a minute. Venmo or Zelle, under 60 seconds.
          </p>
          <p>
            Stripe is at{" "}
            <Link href="/invest" className="hc-inline-link">/invest</Link>.
            Venmo is{" "}
            <a href="https://venmo.com/saathvikpai" className="hc-inline-link">@saathvikpai</a>.
            Zelle is{" "}
            <a href="tel:3853687238" className="hc-inline-link">385-368-7238</a>.
          </p>
        </div>

        <div className="hc-section-rule" />

        {/* II. The Party */}
        <div className="hc-section">
          <span className="hc-section-index">II.</span>
          <h2 className="hc-section-heading">Utah. June 21. You should be there.</h2>
          <p>
            On the day the deadline expires &mdash; my 20th birthday, June 21,
            2026 &mdash; there is a gathering in Utah.
          </p>
          <p className="hc-gate-line">
            Stake-holders get in.<br />Everyone else does not.
          </p>
          <p>
            Ten percent of the apparatus is reserved exclusively for travel
            reimbursement. If you hold a stake and you fly to Utah, that pool
            distributes to you proportionally. The earlier and larger your claim,
            the more of your ticket it covers.
          </p>
          <p>What happens in the room:</p>
          <p className="hc-section-beat">
            The sealed auction opens. One original artwork &mdash; a physical piece
            that has never been shown publicly. It goes to the highest bidder
            among those present.
          </p>
          <p className="hc-section-beat">
            Five sealed predictions are revealed. These were written before the
            wager began and locked &mdash; no one has read them. On June 21, in
            front of everyone in the room, they open.
          </p>
          <p>
            Whether the number hits or doesn&rsquo;t, you will have been in
            the room.
          </p>
        </div>

        <div className="hc-section-rule" />

        {/* III. The Impossible */}
        <div className="hc-section">
          <span className="hc-section-index">III.</span>
          <h2 className="hc-section-heading">The 8% odds. Out loud. Before the first trade.</h2>
          <p>
            The implied probability that $3,453 becomes $100,000 in 46 days using
            publicly available instruments &mdash; stocks, prediction markets, one
            art piece &mdash; is approximately 8%.
          </p>
          <p>
            I know this. I said it publicly before I started. I wrote an essay
            called the pre-mortem &mdash; a document you write assuming you have
            already failed and asking: what happened, why, and what did you miss?
            I wrote it before the first trade. It is published.
          </p>
          <span className="hc-inline-quote">
            &ldquo;The gap between what is reasonable and what I am asking for
            is the entire joke and the entire point. One day I am going to
            grow wings.&rdquo;
          </span>
          <p>
            <Link href="/let-down" className="hc-inline-link">Read the pre-mortem →</Link>
          </p>
          <p>
            By making the odds public, by publishing every position in real time,
            by writing the failure analysis before the failure, I created a
            situation where I cannot flinch. The accountability is not incidental.
            It is the mechanism.
          </p>
          <p>
            You do not have to invest. You can just watch. The positions update
            in real time at the top of this page. The argument is at{" "}
            <Link href="/argument" className="hc-inline-link">/argument</Link>.
            But you cannot say no one tried.
          </p>
          <p className="hc-coda-thesis">
            Attention is the upstream capital. This was always the investment.
          </p>
        </div>

        {/* Footer */}
        <div className="hc-section-rule" />

        {/* Stats row killed per 10-designer consensus: every number
            in it already appears in the hero or body. — v14 */
        }
        {false && <div className="hc-stats-row">
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
