"use client";

import { useState, useEffect, useRef } from "react";

/* ── portfolio ── */
const HOLDINGS = [
  { t: "QTUM", s: 5.584, fb: 679.74 }, { t: "MSFT", s: 1.036, fb: 407.87 },
  { t: "GOOG", s: 1.235, fb: 407.17 }, { t: "IONQ", s: 9.489, fb: 416.85 },
  { t: "IBM",  s: 1.553, fb: 373.33 }, { t: "NVDA", s: 1.773, fb: 344.49 },
  { t: "CEG",  s: 1.148, fb: 339.05 }, { t: "RGTI", s: 9.938, fb: 169.50 },
  { t: "SGOV", s: 2.625, fb: 263.94 }, { t: "QBTS", s: 5.951, fb: 101.65 },
];

function useLive(): number {
  const fallback = 46.57 + 250 + HOLDINGS.reduce((s, h) => s + h.fb, 0);
  const [v, setV] = useState(fallback);
  useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const r = await fetch("/api/prices", { cache: "no-store" });
        if (!r.ok || !alive) return;
        const j = await r.json();
        if (!j?.hasData || !alive) return;
        let sum = 46.57 + 250;
        for (const h of HOLDINGS) {
          const d = j.data[h.t];
          sum += d?.closes?.length > 0 ? h.s * d.closes[d.closes.length - 1] : h.fb;
        }
        if (alive) setV(sum);
      } catch {}
    };
    poll();
    const id = setInterval(poll, 30_000);
    return () => { alive = false; clearInterval(id); };
  }, []);
  return v;
}

function fmt(n: number) { return "$" + Math.round(n).toLocaleString(); }
function daysLeft() { return Math.max(0, Math.ceil((new Date("2026-06-21").getTime() - Date.now()) / 86_400_000)); }

/* ══════════════════════════════════════
   THE REVEAL — what appears after the
   3-minute video transforms at /draft.

   Design: dark cinema → warm paper.
   "drinks are on me" bridges the gap.
   ══════════════════════════════════════ */

export default function DraftHomePage() {
  const total = useLive();
  const d = daysLeft();
  const pct = ((total / 100_000) * 100).toFixed(1);
  const rootRef = useRef<HTMLDivElement>(null);

  /* Phase: dark → warm transition */
  const [phase, setPhase] = useState<"dark" | "warm">("dark");
  useEffect(() => {
    const t = setTimeout(() => setPhase("warm"), 2800);
    return () => clearTimeout(t);
  }, []);

  /* scroll-reveal */
  useEffect(() => {
    const els = rootRef.current?.querySelectorAll(".R-reveal");
    if (!els) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("R-in");
      }),
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className={`R ${phase === "warm" ? "R--warm" : ""}`} ref={rootRef}>
      <style>{CSS}</style>

      {/* ═══════ WAVE 1: Golden flash (bridge from video) ═══════ */}
      <div className="R-flash">
        <span className="R-flash-text">barbecue sauce.</span>
        <div className="R-flash-glow" />
      </div>

      {/* ═══════ WAVE 2: The number ═══════ */}
      <section className="R-hero">
        <div className="R-number">{fmt(total)}</div>
        <div className="R-target">
          <span className="R-arrow">→</span> $100,000
          <span className="R-sep">·</span>
          <span className="R-days">T−{d} days</span>
          <span className="R-sep">·</span>
          <span className="R-live-dot" />
          <span className="R-live">live</span>
        </div>
        <div className="R-trace">
          <span className="R-trace-s">$3,453</span>
          <div className="R-trace-bar">
            <div
              className="R-trace-fill"
              style={{ width: `${Math.min(100, Math.max(0, ((total - 3453) / (100000 - 3453)) * 100))}%` }}
            />
          </div>
          <span className="R-trace-e">$100K</span>
        </div>
      </section>

      {/* ═══════ WAVE 3: The invitation ═══════ */}
      <p className="R-invite">
        the party is june 21. the painting starts at $25.<br />
        you{"\u2019"}re invited.
      </p>

      {/* ═══════ THE PAINTING ═══════ */}
      <section className="R-painting R-reveal">
        <div className="R-painting-frame">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/art/auction-piece.jpg"
            alt="Cityscape with splatter — oil on canvas"
            className="R-painting-img"
          />
        </div>
        <div className="R-painting-caption">
          <span className="R-painting-title">cityscape with splatter</span>
          <span className="R-painting-meta">
            opening bid $25 · backed by 10% of portfolio · the floor moves with the number above
          </span>
          <a href="/art" className="R-painting-bid">bid →</a>
        </div>
      </section>

      <div className="R-rule" />

      {/* ═══════ THE PARTY ═══════ */}
      <section className="R-party R-reveal">
        <div className="R-party-head">
          <span className="R-party-date">june 21 · utah · birthday</span>
          <h2 className="R-party-line">the party is the liquidity event.</h2>
        </div>
        <div className="R-party-details">
          <div className="R-perk">
            <span className="R-perk-n">01</span>
            <span className="R-perk-text">10% of the portfolio goes back to the room</span>
          </div>
          <div className="R-perk">
            <span className="R-perk-n">02</span>
            <span className="R-perk-text">flights reimbursed for holders who show up</span>
          </div>
          <div className="R-perk">
            <span className="R-perk-n">03</span>
            <span className="R-perk-text">five sealed predictions open at 6 pm</span>
          </div>
          <div className="R-perk">
            <span className="R-perk-n">04</span>
            <span className="R-perk-text">early money carries more weight</span>
          </div>
        </div>
        <a href="/invest" className="R-party-cta">come to the party →</a>
      </section>

      <div className="R-rule" />

      {/* ═══════ FOUR REVOLUTIONS ═══════ */}
      <nav className="R-rooms R-reveal">
        <a href="/green-credit" className="R-room">
          <span className="R-room-n">I</span>
          <span className="R-room-name">the financial revolution</span>
          <span className="R-room-sub">green credit · bet on the bet</span>
        </a>
        <a href="/archives" className="R-room">
          <span className="R-room-n">II</span>
          <span className="R-room-name">the art revolution</span>
          <span className="R-room-sub">12 pieces · salon wall · auction</span>
        </a>
        <a href="/letters/round-1" className="R-room">
          <span className="R-room-n">III</span>
          <span className="R-room-name">the socialist revolution</span>
          <span className="R-room-sub">round 1 · what the attention built</span>
        </a>
        <a href="/letters/entrenched-coils" className="R-room">
          <span className="R-room-n">IV</span>
          <span className="R-room-name">the ai revolution</span>
          <span className="R-room-sub">entrenched coils · tension-weighted memory</span>
        </a>
      </nav>

      {/* ═══════ CLOSER ═══════ */}
      <footer className="R-closer R-reveal">
        <p className="R-closer-q"><em>do you think he makes it?</em></p>
        <p className="R-sig">aureliex<span className="R-dot">.</span></p>
      </footer>
    </div>
  );
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=JetBrains+Mono:wght@400;500&display=swap');

  /* ── ROOT ── */
  .R {
    min-height: 100vh;
    background: #0a0908;
    color: #e8e4dc;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: clamp(2rem, 5vw, 3.5rem) clamp(1.25rem, 4vw, 2rem) 3rem;
    overflow-y: auto;
    -webkit-font-smoothing: antialiased;
    transition: background-color 2.5s cubic-bezier(0.22, 1, 0.36, 1),
                color 2.5s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .R--warm {
    background: #F4EFE6;
    color: #1C1A17;
  }

  .R > * {
    width: 100%;
    max-width: 44rem;
  }

  /* ── GOLDEN FLASH (bridge from video) ── */
  .R-flash {
    position: relative;
    margin-bottom: clamp(2rem, 5vw, 3.5rem);
    text-align: center;
  }
  .R-flash-text {
    display: block;
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: clamp(2.8rem, 8vw, 5.5rem);
    font-style: italic;
    font-weight: 500;
    color: #dbb645;
    letter-spacing: -0.02em;
    line-height: 1;
    position: relative;
    z-index: 2;
    animation: r-flash-in 3s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  .R-flash-glow {
    position: absolute;
    top: 50%; left: 50%;
    width: 120%; height: 300%;
    transform: translate(-50%, -50%);
    background: radial-gradient(
      ellipse 50% 40% at 50% 50%,
      rgba(219,182,69,0.2) 0%,
      rgba(219,182,69,0.05) 40%,
      transparent 70%
    );
    pointer-events: none;
    z-index: 1;
    animation: r-glow 4s ease forwards;
  }
  @keyframes r-flash-in {
    0%   { opacity: 0; transform: scale(1.4); filter: blur(8px); color: #f5e6a3; }
    15%  { opacity: 1; filter: blur(0); }
    40%  { transform: scale(1); color: #dbb645; }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes r-glow {
    0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.4); }
    25%  { opacity: 1; }
    100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
  }

  /* ── THE NUMBER ── */
  .R-hero {
    text-align: center;
    margin-bottom: clamp(1.5rem, 4vw, 2.5rem);
    opacity: 0;
    animation: r-up 1.8s cubic-bezier(0.22, 1, 0.36, 1) 1.8s forwards;
  }
  .R-number {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: clamp(3rem, 10vw, 5rem);
    font-weight: 600;
    letter-spacing: -0.03em;
    line-height: 1;
    margin-bottom: 0.5rem;
  }
  .R--warm .R-number { color: #1C1A17; }

  .R-target {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem;
    letter-spacing: 0.04em;
    opacity: 0.35;
  }
  .R-arrow { color: #dbb645; opacity: 0.6; }
  .R-sep { opacity: 0.3; }
  .R-days { opacity: 0.7; }
  .R-live-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #4ade80;
    animation: r-pulse 2s ease-in-out infinite;
  }
  .R-live {
    font-size: 0.625rem;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: #4ade80;
    opacity: 0.8;
  }
  @keyframes r-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  /* Progress trace */
  .R-trace {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-top: 1rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.625rem;
    opacity: 0.25;
  }
  .R-trace-bar {
    flex: 1;
    height: 2px;
    border-radius: 1px;
    overflow: hidden;
  }
  .R--warm .R-trace-bar { background: rgba(28,26,23,0.08); }
  .R:not(.R--warm) .R-trace-bar { background: rgba(232,228,220,0.08); }
  .R-trace-fill {
    height: 100%;
    border-radius: 1px;
    background: #dbb645;
    transition: width 1s ease;
  }
  .R-trace-s, .R-trace-e { white-space: nowrap; }

  /* ── THE INVITATION ── */
  .R-invite {
    text-align: center;
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: clamp(1.15rem, 2.5vw, 1.45rem);
    font-style: italic;
    line-height: 1.65;
    margin-bottom: clamp(2.5rem, 6vw, 4rem);
    opacity: 0;
    animation: r-up 1.5s ease 3s forwards;
  }
  .R--warm .R-invite { color: #6B6560; }
  .R:not(.R--warm) .R-invite { color: rgba(232,228,220,0.55); }

  /* ── THE PAINTING ── */
  .R-painting {
    margin-bottom: clamp(2rem, 5vw, 3rem);
  }
  .R-painting-frame {
    position: relative;
    border-radius: 2px;
    overflow: hidden;
    box-shadow:
      0 4px 24px rgba(0,0,0,0.08),
      0 1px 4px rgba(0,0,0,0.04);
  }
  .R--warm .R-painting-frame {
    box-shadow:
      0 8px 40px rgba(28,26,23,0.1),
      0 2px 8px rgba(28,26,23,0.06);
  }
  .R-painting-img {
    display: block;
    width: 100%;
    height: auto;
    object-fit: contain;
  }
  .R-painting-caption {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    margin-top: 1rem;
    padding: 0 0.25rem;
  }
  .R-painting-title {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 1.1rem;
    font-style: italic;
    font-weight: 500;
  }
  .R-painting-meta {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.02em;
    line-height: 1.6;
    opacity: 0.4;
  }
  .R-painting-bid {
    display: inline-block;
    margin-top: 0.75rem;
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 1rem;
    font-weight: 500;
    text-decoration: none;
    padding: 0.55rem 1.5rem;
    border-radius: 2px;
    transition: all 0.4s ease;
    width: fit-content;
  }
  .R--warm .R-painting-bid {
    color: #1C1A17;
    border: 1px solid rgba(28,26,23,0.2);
  }
  .R--warm .R-painting-bid:hover {
    background: #1C1A17;
    color: #F4EFE6;
    border-color: #1C1A17;
  }
  .R:not(.R--warm) .R-painting-bid {
    color: #e8e4dc;
    border: 1px solid rgba(232,228,220,0.15);
  }
  .R:not(.R--warm) .R-painting-bid:hover {
    background: #e8e4dc;
    color: #0a0908;
  }

  /* ── RULE ── */
  .R-rule {
    border: none;
    border-top: 1px solid rgba(28,26,23,0.12);
    margin: 0 0 clamp(2rem, 5vw, 3rem);
  }
  .R:not(.R--warm) .R-rule {
    border-color: rgba(232,228,220,0.08);
  }

  /* ── THE PARTY ── */
  .R-party {
    margin-bottom: clamp(2rem, 5vw, 3rem);
  }
  .R-party-head {
    margin-bottom: 1.5rem;
  }
  .R-party-date {
    display: block;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    opacity: 0.35;
    margin-bottom: 0.5rem;
  }
  .R-party-line {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: clamp(1.4rem, 3vw, 1.85rem);
    font-style: italic;
    font-weight: 500;
    line-height: 1.25;
    margin: 0;
  }
  .R-party-details {
    display: flex;
    flex-direction: column;
    gap: 0;
    margin-bottom: 1.5rem;
  }
  .R-perk {
    display: flex;
    align-items: baseline;
    gap: 1rem;
    padding: 0.75rem 0;
  }
  .R--warm .R-perk { border-bottom: 1px solid rgba(28,26,23,0.06); }
  .R:not(.R--warm) .R-perk { border-bottom: 1px solid rgba(232,228,220,0.04); }
  .R-perk:last-child { border-bottom: none; }
  .R-perk-n {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.6rem;
    letter-spacing: 0.1em;
    opacity: 0.25;
    min-width: 1.5rem;
    flex-shrink: 0;
  }
  .R-perk-text {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 1.05rem;
    line-height: 1.5;
  }
  .R-party-cta {
    display: inline-block;
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 1rem;
    font-weight: 600;
    text-decoration: none;
    padding: 0.65rem 2rem;
    border-radius: 2px;
    letter-spacing: 0.01em;
    transition: all 0.4s ease;
  }
  .R--warm .R-party-cta {
    background: #1C1A17;
    color: #F4EFE6;
  }
  .R--warm .R-party-cta:hover {
    background: #dbb645;
    color: #1C1A17;
  }
  .R:not(.R--warm) .R-party-cta {
    background: #e8e4dc;
    color: #0a0908;
  }
  .R:not(.R--warm) .R-party-cta:hover {
    background: #dbb645;
    color: #0a0908;
  }

  /* ── ROOMS (four revolutions) ── */
  .R-rooms {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
    margin-bottom: clamp(2.5rem, 6vw, 4rem);
  }
  .R-room {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding: 1.25rem 1rem;
    text-decoration: none;
    transition: all 0.4s ease;
    position: relative;
  }
  .R--warm .R-room { color: #1C1A17; border: 1px solid rgba(28,26,23,0.06); }
  .R--warm .R-room:hover { border-color: rgba(28,26,23,0.2); background: rgba(28,26,23,0.02); }
  .R:not(.R--warm) .R-room { color: #e8e4dc; border: 1px solid rgba(232,228,220,0.04); }
  .R:not(.R--warm) .R-room:hover { border-color: rgba(232,228,220,0.12); }
  .R-room-n {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 1.3rem;
    font-weight: 400;
    opacity: 0.2;
    transition: opacity 0.3s;
  }
  .R-room:hover .R-room-n { opacity: 0.5; }
  .R-room-name {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 0.95rem;
    font-style: italic;
    font-weight: 500;
    line-height: 1.3;
  }
  .R-room-sub {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.575rem;
    opacity: 0.3;
    line-height: 1.5;
  }

  /* ── CLOSER ── */
  .R-closer {
    text-align: center;
    padding-top: clamp(1rem, 3vw, 2rem);
  }
  .R-closer-q {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: clamp(1.1rem, 2.5vw, 1.4rem);
    font-style: italic;
    margin: 0 0 2rem;
    opacity: 0.45;
  }
  .R-sig {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: clamp(1.5rem, 3vw, 1.9rem);
    font-style: italic;
    font-weight: 500;
    letter-spacing: -0.01em;
    opacity: 0.7;
    margin: 0;
  }
  .R-dot { color: #8B3A2E; }

  /* ── SCROLL REVEAL ── */
  .R-reveal {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .R-reveal.R-in {
    opacity: 1;
    transform: translateY(0);
  }

  /* ── ANIMATION: FADE UP ── */
  @keyframes r-up {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── MOBILE ── */
  @media (max-width: 640px) {
    .R { padding: 1.5rem 1.25rem 2rem; }
    .R-flash-text { font-size: clamp(2.2rem, 10vw, 3.2rem); }
    .R-number { font-size: clamp(2.5rem, 12vw, 3.5rem); }
    .R-rooms { grid-template-columns: 1fr; }
    .R-room { padding: 1rem 0.75rem; }
    .R-perk { gap: 0.75rem; }
  }
`;
