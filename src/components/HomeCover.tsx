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

        {/* §1 — The bet */}
        <section className="rl-sect rl-reveal">
          <span className="rl-orn">❦</span>
          <h2 className="rl-sect-head rl-letter-head">The bet</h2>
          <p className="rl-sect-sub">
            Filed before the math is decided, so I can&rsquo;t quietly
            retrofit the story later.
          </p>

          <p>
            The account opened at <strong>$3,453</strong> on April 12. The
            goal is <strong>$100,000 by June 21</strong> &mdash; my 20th
            birthday. Ten weeks. A <strong>29&times;</strong>. The S&amp;P
            does that in about 25 years.
          </p>
          <p>
            I wrote the{" "}
            <Link href="/letters/round-0" className="rl-ink-link">pre-mortem</Link>
            {" "}before the first trade. The implied probability this works
            is <strong>8%</strong>. I published that number before I started,
            because if I am at $5,200 six weeks from now quietly telling
            myself &ldquo;$5,200 is basically $100k if you squint,&rdquo;
            there is a document on the internet with my name on it that says
            no, it is not.
          </p>
          <p>
            The odds are the honesty. The bet is the product. The attention
            the bet generates is the upstream capital for everything else.
          </p>
        </section>

        <div className="rl-rule" />

        {/* §2 — What got built */}
        <section className="rl-sect rl-reveal">
          <h2 className="rl-sect-head rl-letter-head">What got built</h2>

          <p>
            Twenty-five days in, the portfolio is up{" "}
            <strong>+21.9%</strong>. Ten quantum-computing positions. Five
            AI agents argue every trade before I touch it &mdash; the
            consensus scores are{" "}
            <Link href="/argument" className="rl-ink-link">public and archived</Link>.
            Thirty-plus prior arguments on record. The agents run on local
            hardware, zero API cost, and they&rsquo;re specifically built
            to disagree with each other &mdash; the memory system surfaces
            contradictions first, not agreements. Position sizes are{" "}
            <a href="https://saathvikpai.com" className="rl-ink-link">Kelly-sized</a>,
            tied to edge, not conviction. The{" "}
            <Link href="/positions" className="rl-ink-link">live prices</Link>
            {" "}are at the top of this page.
          </p>
          <p>
            The attention that came with publishing the bet produced other
            things. A prediction market on the portfolio itself &mdash;{" "}
            <Link href="/invest" className="rl-ink-link">Green Credit</Link>
            {" "}&mdash; where you can bet on specific theses: portfolio
            above $5,000, IONQ above $60. A $200 Polymarket bot running
            tennis and NBA alongside a $50 Kalshi book. Twelve original
            artworks in pencil, pen, watercolor, and spray paint, starting
            at $1. A{" "}
            <a href="https://saathvikpai.com" className="rl-ink-link">research paper</a>
            {" "}on contradiction-prioritized memory &mdash; Entrenched
            Coils &mdash; that came out of building the debate system.
            Thirty-seven pages, none of which were planned.
          </p>
          <p>
            The Packers did it with a football team. Someone just tried it
            with{" "}
            <a href="https://en.wikipedia.org/wiki/Spirit_Airlines" className="rl-ink-link">an airline</a>.
            The pattern is: make the thing public, let the attention create
            the products, let the products create more attention. The money
            is the scoreboard. The scoreboard is what keeps it honest.
          </p>
        </section>

        <div className="rl-rule" />

        {/* §3 — How to participate */}
        <section className="rl-sect rl-reveal">
          <h2 className="rl-sect-head rl-letter-head">How to participate</h2>

          <p>
            The investment pool is time-weighted. Early money carries more
            upside because it took more of the risk. Venmo or Zelle, under
            60 seconds. No app. No float. No clearing period. You ask. I
            send. The guarantee is personal. $86 has come in so far,
            recorded by date so the curve is not flattering.
          </p>
          <p className="rl-gate">
            Stakeholders get comped to the June 21 gathering in Utah.
          </p>
          <p>
            Ten percent of the pool reimburses flights for holders who show
            up. One original artwork goes to the highest bidder in the room.
            And five sealed predictions &mdash; written before the wager
            began, locked, unread &mdash; open at 6 pm.
          </p>
          <div className="rl-seal">
            <span className="rl-seal-tag">SEALED</span>
            <span className="rl-seal-hash">commitment · a8f7c2············</span>
            <span className="rl-seal-when">reveal 21 jun 2026 · 18:00 PT</span>
          </div>
          <p>
            You can also bet on the outcome without touching the pool &mdash;{" "}
            <Link href="/invest" className="rl-ink-link">Green Credit</Link>
            {" "}is the prediction market. Or{" "}
            <Link href="/art" className="rl-ink-link">bid on the art</Link>.
            Or just{" "}
            <Link href="/argument" className="rl-ink-link">watch the argument</Link>.
            The{" "}
            <Link href="/letters/round-0" className="rl-ink-link">pre-mortem</Link>
            {" "}names four ways this fails. Whether the number hits or not,
            you will have been in the room when someone tried to grow wings
            on the way down.
          </p>
          <blockquote className="rl-quote">
            &ldquo;The gap between what is reasonable and what I am asking
            for is the entire joke and the entire point.&rdquo;
          </blockquote>
          <p>But you cannot say no one tried.</p>
        </section>

        <div className="rl-rule" />

        {/* ── BODY FOOTER ── */}
        <div className="rl-body-foot">
          <p className="rl-body-foot-line">
            <Link href="/invest" className="rl-ink-link">/invest →</Link>
            {" "}·{" "}
            <a href="https://venmo.com/saathvikpai" className="rl-ink-link">venmo</a>
            {" "}·{" "}
            <a href="tel:3853687238" className="rl-ink-link">zelle</a>
            {" "}· personally guaranteed
          </p>
          <p className="rl-body-foot-meta">
            <Link href="/letters/round-0" className="rl-ink-link">the pre-mortem</Link>
            {" "}·{" "}
            <Link href="/letters/round-0" className="rl-ink-link">round 0</Link>
            {" "}·{" "}
            <Link href="/argument" className="rl-ink-link">the argument</Link>
            {" "}·{" "}
            <Link href="/positions" className="rl-ink-link">positions</Link>
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
