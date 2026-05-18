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
function daysLeft() { return Math.max(0, Math.ceil((new Date("2026-06-20").getTime() - Date.now()) / 86_400_000)); }

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

  /* Phase: dark flash → warm paper */
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
        <div className="R-number">
          <span className="R-currency">$</span>
          {Math.round(total).toLocaleString()}
        </div>
        <div className="R-delta">
          +{((total / 3453 - 1) * 100).toFixed(0)}% since april 12
        </div>
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
        the party is june 20. the painting starts at $25.<br />
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
          <div className="R-painting-terms">
            <div className="R-painting-term">
              <span className="R-painting-label">current bid</span>
              <span className="R-painting-value">$25</span>
            </div>
            <div className="R-painting-term">
              <span className="R-painting-label">cashout value · june 20</span>
              <span className="R-painting-value R-painting-value--live">{fmt(total * 0.1)}</span>
            </div>
          </div>
          <span className="R-painting-meta">
            the winning bidder can cash out 10% of the portfolio on june 20, or keep the painting.
          </span>
          <a href="/art" className="R-painting-bid">bid →</a>
        </div>
      </section>

      <div className="R-rule" />

      {/* ═══════ THE PARTY — full-bleed gradient hero ═══════ */}
      <section className="R-party-hero">
        <div className="R-party-hero-inner">
          <span className="R-party-presents">aureliex presents</span>
          <h2 className="R-party-title">the party.</h2>
          <span className="R-party-sub">the liquidity event · june 20 · 2026</span>
          <div className="R-party-rule" />
          <p className="R-party-tagline">june 20 · salt lake city</p>
          <span className="R-party-details">
            10% of portfolio → flights &amp; reimbursements
          </span>
          <span className="R-party-details">
            proportional to who invested the most, earliest
          </span>
        </div>
      </section>

      {/* ═══════ DARK ZONE — everything after the party gradient ═══════ */}
      <div className="R-dark-zone">

        {/* THE TICKET */}
        <div className="R-ticket-wrap">
          <a href="/invest" className="R-ticket">
            <div className="R-ticket-main">
              <span className="R-ticket-event">the liquidity event</span>
              <div className="R-ticket-meta">
                <span>june 20, 2026</span>
                <span>salt lake city</span>
              </div>
              <span className="R-ticket-cta">rsvp →</span>
            </div>
            <div className="R-ticket-tear">
              <div className="R-ticket-hole R-ticket-hole-t" />
              <div className="R-ticket-perf" />
              <div className="R-ticket-hole R-ticket-hole-b" />
            </div>
            <div className="R-ticket-stub">
              <div className="R-ticket-barcode">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="R-ticket-bar" style={{ height: `${6 + ((i * 7 + 3) % 12)}px` }} />
                ))}
              </div>
              <span className="R-ticket-admit">ADMIT ONE</span>
            </div>
          </a>
        </div>

        {/* BACKED BY */}
        <div className="R-backed R-reveal">
          <span className="R-backed-label">backed by</span>
          <div className="R-backed-names">
            <span>Franco Cachay</span>
            <span>Elijah Bautista</span>
            <span>Yashas Shashidara</span>
            <span>an anonymous donor</span>
          </div>
        </div>

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
          <p className="R-closer-q">
            {"call me if you get lost.".split("").map((ch, i) => (
              <span key={i} className="R-rainbow" style={{ ["--i" as string]: i }}>
                {ch === " " ? "\u00A0" : ch}
              </span>
            ))}
          </p>
          <p className="R-sig">
            {"aureliex.".split("").map((ch, i) => (
              <span key={i} className="R-rainbow" style={{ ["--i" as string]: i }}>
                {ch}
              </span>
            ))}
          </p>
          <span className="R-closer-phone">+1 (385) 368-7238</span>
        </footer>

      </div>{/* end dark zone */}
    </div>
  );
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=JetBrains+Mono:wght@400;500&display=swap');

  /* ── ROOT — starts dark, transitions to cream ── */
  .R {
    min-height: 100vh;
    background: #0a0908;
    color: #e8e4dc;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: clamp(2rem, 5vw, 3.5rem) clamp(1.25rem, 4vw, 2rem) 0;
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

  /* ── GOLDEN FLASH ── */
  .R-flash {
    position: relative;
    margin-bottom: clamp(1.5rem, 3vw, 2.5rem);
    text-align: center;
  }
  .R-flash-text {
    display: block;
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: clamp(3rem, 9vw, 6rem);
    font-style: italic;
    font-weight: 400;
    color: #dbb645;
    letter-spacing: -0.02em;
    line-height: 1;
    position: relative;
    z-index: 2;
    animation: r-flash-in 3s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  .R--warm .R-flash-text {
    color: #8B6B20;
    text-shadow: 0 1px 12px rgba(139,107,32,0.12);
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
    40%  { transform: scale(1); }
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
    margin-bottom: clamp(2.5rem, 5vw, 4rem);
    opacity: 0;
    animation: r-up 1.8s cubic-bezier(0.22, 1, 0.36, 1) 1.8s forwards;
  }
  .R-number {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: clamp(3.5rem, 12vw, 6rem);
    font-weight: 400;
    letter-spacing: -0.015em;
    line-height: 1;
    margin-bottom: 0;
    color: #e8e4dc;
    transition: color 2.5s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .R--warm .R-number { color: #1C1A17; }
  .R-currency {
    font-size: 0.38em;
    font-weight: 400;
    vertical-align: 0.35em;
    margin-right: 0.06em;
    opacity: 0.6;
    letter-spacing: 0.02em;
  }
  .R-delta {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #7dba6a;
    margin-top: 0.6rem;
  }
  .R--warm .R-delta { color: #5a7a48; }

  .R-target {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.58rem;
    letter-spacing: 0.08em;
    opacity: 0.22;
    margin-top: 0.5rem;
  }
  .R-arrow { color: #C9A020; opacity: 0.5; }
  .R-sep { opacity: 0.3; }
  .R-days { opacity: 0.7; }
  .R-live-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: #7dba6a;
    animation: r-pulse 2s ease-in-out infinite;
  }
  .R-live {
    font-size: 0.55rem;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: #7dba6a;
    opacity: 0.7;
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
    margin-top: 0.6rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.58rem;
    opacity: 0.25;
  }
  .R-trace-bar {
    flex: 1;
    height: 4px;
    border-radius: 2px;
    overflow: hidden;
    background: rgba(232,228,220,0.06);
  }
  .R--warm .R-trace-bar { background: rgba(28,26,23,0.1); }
  .R-trace-fill {
    height: 100%;
    border-radius: 1px;
    background: #C9A020;
    transition: width 1s ease;
  }
  .R-trace-s, .R-trace-e { white-space: nowrap; }

  /* ── THE INVITATION ── */
  .R-invite {
    text-align: center;
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: clamp(1.25rem, 2.8vw, 1.55rem);
    font-style: italic;
    line-height: 1.65;
    margin-bottom: clamp(2.5rem, 5vw, 4rem);
    opacity: 0;
    animation: r-up 1.5s ease 3s forwards;
    color: rgba(232,228,220,0.55);
  }
  .R--warm .R-invite { color: #3A3530; }

  /* ── THE PAINTING ── */
  .R-painting {
    margin-bottom: clamp(2rem, 5vw, 3rem);
  }
  .R-painting-frame {
    position: relative;
    border-radius: 2px;
    overflow: hidden;
    box-shadow:
      0 8px 40px rgba(0,0,0,0.4),
      0 2px 8px rgba(0,0,0,0.2);
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
    color: rgba(232,228,220,0.7);
  }
  .R--warm .R-painting-title { color: #1C1A17; }
  .R-painting-terms {
    display: flex; gap: 32px;
    margin: 12px 0 8px;
  }
  .R-painting-term {
    display: flex; flex-direction: column; gap: 2px;
  }
  .R-painting-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.6rem; letter-spacing: 0.1em;
    text-transform: uppercase; opacity: 0.35;
  }
  .R-painting-value {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 1.5rem; font-weight: 500;
    color: rgba(232,228,220,0.8);
  }
  .R--warm .R-painting-value { color: #1C1A17; }
  .R-painting-value--live {
    color: #C9952A;
  }
  .R--warm .R-painting-value--live { color: #8B3A2E; }
  .R-painting-meta {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.6rem;
    letter-spacing: 0.02em;
    line-height: 1.6;
    opacity: 0.35;
    margin-top: 4px;
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
    color: #e8e4dc;
    border: 1px solid rgba(232,228,220,0.15);
  }
  .R--warm .R-painting-bid {
    color: #1C1A17;
    border: 1px solid rgba(28,26,23,0.2);
  }
  .R-painting-bid:hover {
    background: rgba(201,160,32,0.12);
    border-color: rgba(201,160,32,0.3);
    color: #C9A020;
  }
  .R--warm .R-painting-bid:hover {
    background: #1C1A17;
    color: #F4EFE6;
    border-color: #1C1A17;
  }

  /* ── RULE ── */
  .R-rule {
    border: none;
    border-top: 1px solid rgba(232,228,220,0.06);
    margin: clamp(1rem, 3vw, 2rem) 0;
  }
  .R--warm .R-rule {
    border-color: rgba(28,26,23,0.1);
  }

  /* ── PARTY HERO — the shaft of light ── */
  .R-party-hero {
    position: relative;
    width: 100vw !important;
    max-width: none !important;
    margin-left: calc(-50vw + 50%);
    min-height: clamp(28rem, 60vh, 40rem);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0;
    background:
      radial-gradient(ellipse 80% 60% at 88% 92%, rgba(139,74,62,0.18) 0%, transparent 100%),
      radial-gradient(ellipse 60% 50% at 8% 6%, rgba(40,22,38,0.20) 0%, transparent 100%),
      radial-gradient(ellipse 45% 35% at 50% 50%, rgba(194,138,122,0.08) 0%, transparent 100%),
      linear-gradient(
        to bottom,
        #F4EFE6  0%,
        #E8DDD0  4%,
        #d8c4b0  10%,
        #c4a08a  18%,
        #b07a6c  26%,
        #9b6a64  32%,
        #c49a90  40%,
        #dbbcae  46%,
        #E5DDD2  50%,
        #dbbcae  54%,
        #c49a90  60%,
        #9b6a64  68%,
        #6b3a3e  76%,
        #3d1f23  84%,
        #1f1114  90%,
        #0e090b  96%,
        #0a0908  100%
      );
  }
  .R-party-hero::after {
    content: '';
    position: absolute; inset: 0;
    opacity: 0.045;
    mix-blend-mode: soft-light;
    background-image:
      radial-gradient(rgba(229,221,210,0.5) 1px, transparent 1px),
      radial-gradient(rgba(0,0,0,0.4) 1px, transparent 1px);
    background-size: 3px 3px, 5px 5px;
    background-position: 0 0, 2px 2px;
    pointer-events: none;
  }
  .R-party-hero-inner {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: clamp(3rem, 8vh, 5rem) clamp(1.5rem, 5vw, 3rem);
    gap: 0;
  }
  .R-party-presents {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.62rem; letter-spacing: 0.32em;
    text-transform: uppercase;
    color: #8B3A2E;
    margin-bottom: 20px;
  }
  .R-party-title {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: clamp(3.5rem, 10vw, 5.5rem);
    font-weight: 400; font-style: italic;
    color: #1C1A17;
    line-height: 1.05;
    letter-spacing: -0.02em;
    margin: 0 0 16px;
  }
  .R-party-sub {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.6rem; letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #3A2520;
    margin-bottom: 32px;
  }
  .R-party-rule {
    width: min(320px, 55%); height: 2px;
    background: linear-gradient(90deg, transparent, #8B3A2E, transparent);
    margin-bottom: 32px;
  }
  .R-party-tagline {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: clamp(1.5rem, 4vw, 2.4rem);
    font-style: italic;
    color: #1C1A17;
    max-width: 22ch;
    letter-spacing: 0.01em;
    line-height: 1.3;
    margin: 0 0 16px;
  }
  .R-party-details {
    font-family: 'JetBrains Mono', monospace;
    font-size: clamp(0.58rem, 1.5vw, 0.68rem);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #3A2520;
    margin-top: 4px;
  }

  /* ── DARK ZONE — everything after the party gradient ── */
  .R-dark-zone {
    width: 100vw !important;
    max-width: none !important;
    margin-left: calc(-50vw + 50%);
    background: #0a0908;
    color: #e8e4dc;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 3rem;
  }

  /* ── TICKET ── */
  .R-ticket-wrap {
    display: flex;
    justify-content: center;
    padding: clamp(2.5rem, 5vw, 4rem) clamp(1rem, 3vw, 2rem);
    width: 100%;
    max-width: 44rem;
  }
  .R-ticket {
    display: flex;
    max-width: 400px;
    width: 100%;
    border-radius: 4px;
    overflow: visible;
    text-decoration: none;
    color: inherit;
    transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s ease;
    cursor: pointer;
    box-shadow: 0 4px 20px -6px rgba(0,0,0,0.3);
  }
  .R-ticket:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 36px -10px rgba(0,0,0,0.5);
  }
  .R-ticket-main {
    flex: 1;
    background: #141210;
    border: 1px solid rgba(201,149,42,0.12);
    border-right: none;
    border-radius: 4px 0 0 4px;
    padding: 20px 24px;
    display: flex; flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  .R-ticket-event {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 1.2rem;
    font-style: italic; font-weight: 500;
    color: #C9952A;
    line-height: 1.2;
  }
  .R-ticket-meta {
    display: flex; gap: 16px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.5rem; letter-spacing: 0.15em;
    text-transform: uppercase;
    color: rgba(229,221,210,0.4);
  }
  .R-ticket-cta {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 0.85rem; font-style: italic;
    color: rgba(201,149,42,0.5);
    margin-top: 4px;
    transition: color 0.3s;
  }
  .R-ticket:hover .R-ticket-cta {
    color: #C9952A;
  }

  /* Tear */
  .R-ticket-tear {
    width: 1px; position: relative;
    flex-shrink: 0;
  }
  .R-ticket-perf {
    position: absolute; top: 10px; bottom: 10px; left: 0;
    border-left: 1px dashed rgba(229,221,210,0.08);
  }
  .R-ticket-hole {
    position: absolute; left: -6px;
    width: 12px; height: 12px; border-radius: 50%;
    background: #0a0908;
  }
  .R-ticket-hole-t { top: -6px; }
  .R-ticket-hole-b { bottom: -6px; }

  /* Stub */
  .R-ticket-stub {
    width: 52px;
    background: #111010;
    border: 1px solid rgba(201,149,42,0.08);
    border-left: none;
    border-radius: 0 4px 4px 0;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 10px; padding: 12px 6px;
  }
  .R-ticket-barcode { display: flex; gap: 1.5px; align-items: flex-end; }
  .R-ticket-bar {
    width: 1.5px; background: rgba(229,221,210,0.25); border-radius: 1px;
  }
  .R-ticket-admit {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.4rem; letter-spacing: 0.15em;
    color: rgba(229,221,210,0.18);
    writing-mode: vertical-lr;
    transform: rotate(180deg);
    text-transform: uppercase;
  }

  /* ── BACKED BY ── */
  .R-backed {
    text-align: center;
    padding: 0 0 clamp(2.5rem, 5vw, 4rem);
    width: 100%;
    max-width: 44rem;
  }
  .R-backed-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.6rem; letter-spacing: 0.25em;
    text-transform: uppercase;
    color: rgba(229,221,210,0.35);
    display: block;
    margin-bottom: 16px;
  }
  .R-backed-names {
    display: flex; gap: 32px;
    justify-content: center;
    flex-wrap: wrap;
  }
  .R-backed-names span {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 1rem;
    font-weight: 500;
    color: rgba(229,221,210,0.55);
  }

  /* ── ROOMS (four revolutions) — dark cards ── */
  .R-rooms {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 1px;
    width: 100%;
    max-width: 44rem;
    background: rgba(232,228,220,0.04);
    border-radius: 8px; overflow: hidden;
    margin-bottom: 48px;
  }
  .R-room {
    display: flex; flex-direction: column; gap: 8px;
    padding: 28px 24px;
    background: #12110f;
    text-decoration: none;
    color: #e8e4dc;
    transition: background 0.3s;
  }
  .R-room:hover { background: #1a1815; }
  .R-room-n {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 1.2rem; color: #C9952A;
    opacity: 0.5;
  }
  .R-room-name {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 1.1rem; font-weight: 600; font-style: italic;
    color: rgba(232,228,220,0.85);
  }
  .R-room-sub {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.6rem; opacity: 0.3;
    letter-spacing: 0.05em;
    color: rgba(232,228,220,0.5);
  }

  /* ── CLOSER ── */
  .R-closer {
    text-align: center;
    padding-top: clamp(2rem, 4vw, 3rem);
    padding-bottom: 1rem;
  }
  .R-closer-q {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: clamp(1.4rem, 3.5vw, 2rem);
    font-style: italic;
    font-weight: 400;
    margin: 0 0 2rem;
    letter-spacing: 0.02em;
  }
  .R-sig {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: clamp(2.4rem, 6vw, 3.5rem);
    font-style: italic;
    font-weight: 500;
    letter-spacing: -0.02em;
    margin: 0 0 1.5rem;
  }
  .R-closer-phone {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem; letter-spacing: 0.1em;
    opacity: 0.2; display: block; margin-top: 8px;
  }

  /* Per-character rainbow coloring */
  .R-rainbow {
    display: inline-block;
  }

  /* "call me if you get lost" — warm gold tonal drift on dark */
  .R-closer-q .R-rainbow:nth-child(4n+1) { color: #8B7A65; }
  .R-closer-q .R-rainbow:nth-child(4n+2) { color: #9A8A72; }
  .R-closer-q .R-rainbow:nth-child(4n+3) { color: #7E6E58; }
  .R-closer-q .R-rainbow:nth-child(4n)   { color: #8A7960; }
  .R-closer-q .R-rainbow:last-child      { color: #C9A020; }

  /* "aureliex." — CMIYGL poster palette (warm, saturated, reads on dark) */
  .R-sig .R-rainbow:nth-child(1) { color: #D45B4B; }  /* a — warm coral red */
  .R-sig .R-rainbow:nth-child(2) { color: #3B7DD8; }  /* u — cobalt blue */
  .R-sig .R-rainbow:nth-child(3) { color: #D4944A; }  /* r — marigold */
  .R-sig .R-rainbow:nth-child(4) { color: #D45B7A; }  /* e — dusty rose */
  .R-sig .R-rainbow:nth-child(5) { color: #4BA89A; }  /* l — warm jade */
  .R-sig .R-rainbow:nth-child(6) { color: #E8C44A; }  /* i — sunflower */
  .R-sig .R-rainbow:nth-child(7) { color: #D46B4B; }  /* e — burnt sienna */
  .R-sig .R-rainbow:nth-child(8) { color: #7B8ED4; }  /* x — periwinkle */
  .R-sig .R-rainbow:nth-child(9) { color: #C45040; }  /* . — vermillion */

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
    .R-backed-names { flex-direction: column; align-items: center; gap: 12px; }
  }
`;
