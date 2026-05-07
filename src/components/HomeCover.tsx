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
      <div className={`rl-number ${flash === "up" ? "rl-flash-up" : flash === "down" ? "rl-flash-down" : ""}`}>
        <span className="rl-currency">$</span>
        {Math.round(value).toLocaleString("en-US")}
      </div>
      {revealed && (
        <div className={`rl-delta ${isUp ? "rl-up" : "rl-down"}`}>
          {isUp ? "↑" : "↓"}{Math.abs(Number(gainPct))}% since I started
          <span className="rl-live-dot" />
          <span className="rl-live-label">LIVE</span>
        </div>
      )}
    </>
  );
}

export default function HomeCover({
  totalNow, daysToBirthday, holdings, pendingCash, entryValue,
}: Props) {
  const [phase, setPhase] = useState<"void" | "number" | "full">("void");
  const rootRef = useRef<HTMLDivElement>(null);

  /* DO NOT shorten these delays. The number must stand alone for 1200ms+. */
  const runOpen = useCallback(() => {
    setTimeout(() => setPhase("number"), 150);
    setTimeout(() => setPhase("full"), 1400);
  }, []);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("rl_seen_v1") === "1") {
        setPhase("full");
        return;
      }
    } catch { /* noop */ }
    sessionStorage.setItem("rl_seen_v1", "1");
    runOpen();
  }, [runOpen]);

  /* scroll-reveal via IntersectionObserver */
  useEffect(() => {
    const els = rootRef.current?.querySelectorAll(".rl-reveal");
    if (!els) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("rl-in");
      }),
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const numVis = phase === "number" || phase === "full";
  const fullVis = phase === "full";

  return (
    <div className="rl-root" data-phase={phase} ref={rootRef}>

      {/* ═══════════ COVER ═══════════ */}
      <section className="rl-cover">
        <div className="rl-cover-bg" aria-hidden="true" />
        <div className="rl-cover-overlay" aria-hidden="true" />
        <div className="rl-cover-glow" aria-hidden="true" />

        <div className={`rl-cover-ctx ${fullVis ? "rl-vis" : ""}`}>
          <p className="rl-eyebrow">a public wager</p>
          <p className="rl-thesis">attention is the upstream capital.</p>
          <h1 className="rl-headline">
            $3,453 <span className="rl-arrow">→</span> $100,000
          </h1>
          <p className="rl-sub">
            Probably impossible.<br />
            Definitely public.<br />
            By my 20th birthday. {daysToBirthday} days left.
          </p>
          <div className="rl-cover-rule" />
        </div>

        <div className={`rl-num-block ${numVis ? "rl-vis" : ""}`}>
          <LiveValue
            holdings={holdings} pendingCash={pendingCash}
            fallback={totalNow} entryValue={entryValue}
            revealed={fullVis}
          />
        </div>

        <div className={`rl-cover-actions ${fullVis ? "rl-vis" : ""}`}>
          <Link href="/invest" className="rl-btn-gold">The wager →</Link>
          <Link href="/argument" className="rl-link-dim">Five agents disagree about this →</Link>
        </div>

        <div className={`rl-scroll-hint ${fullVis ? "rl-vis" : ""}`} aria-hidden="true">
          <span />
        </div>
      </section>

      {/* ═══════════ TYPE RAIL ═══════════ */}
      <div className="rl-type-rail" aria-hidden="true">
        <span>ATTENTION IS THE UPSTREAM CAPITAL</span>
        <span className="rl-rail-dot">·</span>
        <span>ATTENTION IS THE UPSTREAM CAPITAL</span>
        <span className="rl-rail-dot">·</span>
        <span>ATTENTION IS THE UPSTREAM CAPITAL</span>
      </div>

      {/* ═══════════ BODY ═══════════ */}
      <div className="rl-body">

        {/* ── THE LETTER ── */}
        <section className="rl-sect rl-reveal">
          <span className="rl-orn">❦</span>
          <h2 className="rl-sect-head rl-letter-head">The pre-mortem</h2>
          <p className="rl-sect-sub">
            Filed before the math is decided, so I can&rsquo;t quietly
            retrofit the story later.
          </p>
          <div className="rl-prose">
            <p>
              The account opened at <strong>$3,453</strong> on April 12. The
              goal is <strong>$100,000 by June 21</strong> &mdash; my birthday.
              That is about ten weeks. I need a <strong>29&times;</strong>. The
              S&amp;P does that in about 25 years.
            </p>
            <p>
              The gap between those numbers is the joke, and the entire point.
              This is an ego mini-game with a P&amp;L attached, and the
              mini-game <em>is</em> the product. The money is just the
              scoreboard.
            </p>
            <p>
              I am publishing this so when the account is at $5,200 and I am
              quietly telling myself &ldquo;$5,200 is basically $100k if you
              squint,&rdquo; there is a document on the internet with my name
              on it reminding me that no, it is not.
            </p>
          </div>
          <p>
            <Link href="/let-down" className="rl-ink-link">
              Read the full pre-mortem →
            </Link>
          </p>
        </section>

        <div className="rl-rule" />

        {/* ── I. MONEY ── */}
        <section className="rl-sect rl-reveal">
          <span className="rl-idx">I.</span>
          <h2 className="rl-sect-head">Early money carries more of the flight.</h2>
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
            <Link href="/invest" className="rl-ink-link">/invest</Link>.
            Venmo is{" "}
            <a href="https://venmo.com/saathvikpai" className="rl-ink-link">@saathvikpai</a>.
            Zelle is{" "}
            <a href="tel:3853687238" className="rl-ink-link">385-368-7238</a>.
          </p>
        </section>

        <div className="rl-rule" />

        {/* ── II. THE ROOM ── */}
        <section className="rl-sect rl-reveal">
          <span className="rl-idx">II.</span>
          <h2 className="rl-sect-head">Utah. June 21. You should be there.</h2>
          <p>
            On the day the deadline expires &mdash; my 20th birthday, June 21,
            2026 &mdash; there is a gathering in Utah.
          </p>
          <p className="rl-gate">
            Stakeholders get comped.
          </p>
          <p>
            Ten percent of the apparatus is reserved exclusively for travel
            reimbursement. If you hold a stake and you fly to Utah, that pool
            distributes to you proportionally. The earlier and larger your claim,
            the more of your ticket it covers.
          </p>
          <p>What happens in the room:</p>
          <p className="rl-beat">
            The sealed auction opens. One original artwork &mdash; a physical piece
            that has never been shown publicly. It goes to the highest bidder
            among those present.
          </p>
          <p className="rl-beat">
            Five sealed predictions are revealed. These were written before the
            wager began and locked &mdash; no one has read them. On June 21, in
            front of everyone in the room, they open.
          </p>
          <p>
            Whether the number hits or doesn&rsquo;t, you will have been in
            the room.
          </p>
          <div className="rl-seal">
            <span className="rl-seal-tag">SEALED</span>
            <span className="rl-seal-hash">commitment · a8f7c2············</span>
            <span className="rl-seal-when">reveal 21 jun 2026 · 18:00 PT</span>
          </div>
        </section>

        <div className="rl-rule" />

        {/* ── III. THE ODDS ── */}
        <section className="rl-sect rl-reveal">
          <span className="rl-idx">III.</span>
          <h2 className="rl-sect-head">The 8% odds. Out loud. Before the first trade.</h2>
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
          <blockquote className="rl-quote">
            &ldquo;The gap between what is reasonable and what I am asking for
            is the entire joke and the entire point. One day I am going to
            grow wings.&rdquo;
          </blockquote>
          <p>
            <Link href="/let-down" className="rl-ink-link">Read the pre-mortem →</Link>
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
            <Link href="/argument" className="rl-ink-link">/argument</Link>.
            But you cannot say no one tried.
          </p>
          <p className="rl-coda">
            Attention is the upstream capital. This was always the investment.
          </p>
        </section>

        <div className="rl-rule" />

        {/* ── BODY FOOTER ── */}
        <div className="rl-body-foot">
          <p className="rl-body-foot-line">
            If you want the numbers:{" "}
            <Link href="/invest" className="rl-ink-link">/invest →</Link>
          </p>
          <p className="rl-body-foot-meta">
            venmo{" "}
            <a href="https://venmo.com/saathvikpai" className="rl-ink-link">@saathvikpai</a>
            {" "}· zelle{" "}
            <a href="tel:3853687238" className="rl-ink-link">385-368-7238</a>
            {" "}· personally guaranteed
          </p>
        </div>
      </div>

      {/* ═══════════ THE DOOR ═══════════ */}
      <section className="rl-door rl-reveal">
        <p className="rl-door-line">The door is open.</p>
        <div className="rl-door-ctas">
          <Link href="/invest" className="rl-btn-gold">The wager →</Link>
          <Link href="/argument" className="rl-link-light">Five agents disagree about this →</Link>
        </div>
        <p className="rl-door-meta">
          <a href="https://venmo.com/saathvikpai" className="rl-door-rail">venmo @saathvikpai</a>
          {" · "}
          <a href="tel:3853687238" className="rl-door-rail">zelle 385-368-7238</a>
          {" · "}
          <span className="rl-door-note">personally guaranteed</span>
        </p>
      </section>

      {/* ═══════════ COLOPHON ═══════════ */}
      <footer className="rl-colophon">
        <nav className="rl-col-nav">
          <Link href="/positions">stocks</Link>
          <Link href="/letters/round-0">letters</Link>
          <Link href="/art">art</Link>
          <Link href="/argument">panel</Link>
          <Link href="/invest">invest</Link>
          <Link href="/archives">archives</Link>
        </nav>
        <p className="rl-sig">saapai</p>
        <p className="rl-wordmark">aureliex<span className="rl-dot">.</span></p>
      </footer>

      {/* ═══════════ MOBILE NAV ═══════════ */}
      <nav className="rl-mob-nav">
        <Link href="/positions">stocks</Link>
        <Link href="/letters/round-0">letters</Link>
        <Link href="/art">art</Link>
        <Link href="/invest">invest</Link>
      </nav>
    </div>
  );
}
