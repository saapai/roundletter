"use client";

import { useState, useEffect } from "react";

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
   STANDALONE HOMEPAGE — for iterating
   This is what appears after the video
   transforms at /draft
   ══════════════════════════════════════ */

export default function DraftHomePage() {
  const total = useLive();
  const d = daysLeft();

  return (
    <div className="H">
      <style>{CSS}</style>

      {/* Wave 1: The golden flash */}
      <div className="H-drinks-flash">
        <span className="H-drinks-text">drinks are on me.</span>
        <div className="H-drinks-flare" />
      </div>

      {/* Wave 2: The score */}
      <div className="H-score">
        <div className="H-score-num">{fmt(total)}</div>
        <div className="H-score-meta">
          <span className="H-score-arrow">→</span>
          <span>$100,000</span>
          <span className="H-score-sep">·</span>
          <span className="H-score-days">{d} days</span>
        </div>
        <p className="H-score-q">do you think he makes it?</p>
      </div>

      {/* Wave 3: Two actions */}
      <div className="H-actions">
        <a href="/art" className="H-act">
          <span className="H-act-num">001</span>
          <span className="H-act-div" />
          <div className="H-act-body">
            <span className="H-act-name">the art piece</span>
            <span className="H-act-detail">opening bid $25 · backed by 10% of portfolio</span>
          </div>
          <span className="H-act-go">→</span>
        </a>
        <a href="/invest" className="H-act">
          <span className="H-act-num">002</span>
          <span className="H-act-div" />
          <div className="H-act-body">
            <span className="H-act-name">the party</span>
            <span className="H-act-detail">june 21 · 10% dividend · flight comp · stake ∝ earliness</span>
          </div>
          <span className="H-act-go">→</span>
        </a>
      </div>

      {/* Four doors */}
      <div className="H-doors">
        <a href="https://aureliex.com/green-credit" className="H-door">
          <span className="H-door-r">I</span>
          <span className="H-door-l">the financial<br/>revolution</span>
        </a>
        <a href="https://aureliex.com/archive" className="H-door">
          <span className="H-door-r">II</span>
          <span className="H-door-l">the art<br/>revolution</span>
        </a>
        <a href="https://aureliex.com/letters/round-1" className="H-door">
          <span className="H-door-r">III</span>
          <span className="H-door-l">the socialist<br/>revolution</span>
        </a>
        <a href="https://aureliex.com/letters/entrenched-coils" className="H-door">
          <span className="H-door-r">IV</span>
          <span className="H-door-l">the ai<br/>revolution</span>
        </a>
      </div>

      <p className="H-sig">aureliex.com</p>
    </div>
  );
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=JetBrains+Mono:wght@400;500&display=swap');

  .H {
    position: fixed; inset: 0;
    background: #050505; color: #e8e4dc;
    display: flex; flex-direction: column;
    justify-content: center; align-items: flex-start;
    padding: 48px 10vw 32px;
    overflow-y: auto;
    -webkit-font-smoothing: antialiased;
  }

  /* ── DRINKS ── */
  .H-drinks-flash { position: relative; width: 100%; margin-bottom: 48px; }
  .H-drinks-text {
    display: block;
    font-family: 'EB Garamond', Georgia, serif;
    font-size: clamp(42px, 8vw, 96px);
    font-style: italic; font-weight: 400;
    color: #dbb645; letter-spacing: -0.02em;
    line-height: 1; position: relative; z-index: 2;
    animation: h-drinks-in 2.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  .H-drinks-flare {
    position: absolute; top: 50%; left: 0;
    width: 100%; height: 200%; transform: translateY(-50%);
    background: radial-gradient(ellipse 60% 50% at 30% 50%, rgba(219,182,69,0.15) 0%, rgba(219,182,69,0.04) 40%, transparent 70%);
    pointer-events: none; z-index: 1;
    animation: h-flare 3s ease forwards;
  }
  @keyframes h-drinks-in {
    0% { opacity: 0; transform: scale(1.6) translateY(-10%); filter: blur(12px); color: #f5e6a3; }
    15% { opacity: 1; filter: blur(0); color: #f5e6a3; }
    40% { transform: scale(1.0); color: #dbb645; }
    100% { opacity: 1; transform: scale(1) translateY(0); color: #dbb645; }
  }
  @keyframes h-flare {
    0% { opacity: 0; transform: translateY(-50%) scaleX(0.3); }
    20% { opacity: 1; transform: translateY(-50%) scaleX(1.1); }
    100% { opacity: 0.3; transform: translateY(-50%) scaleX(1); }
  }

  /* ── SCORE ── */
  .H-score { margin-bottom: 40px; opacity: 0; animation: h-fade-up 1.5s ease 1.8s forwards; }
  .H-score-num {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: clamp(36px, 6vw, 64px);
    font-weight: 500; color: #e8e4dc;
    letter-spacing: -0.02em; line-height: 1; margin-bottom: 8px;
  }
  .H-score-meta {
    display: flex; align-items: baseline; gap: 8px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px; color: rgba(232,228,220,0.25); margin-bottom: 20px;
  }
  .H-score-arrow { color: rgba(219,182,69,0.4); }
  .H-score-sep { color: rgba(232,228,220,0.12); }
  .H-score-days { color: rgba(232,228,220,0.2); }
  .H-score-q {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 22px; font-style: italic;
    color: rgba(232,228,220,0.5); margin: 0;
  }

  /* ── ACTIONS ── */
  .H-actions {
    display: flex; flex-direction: column;
    width: 100%; max-width: 560px;
    margin-bottom: 40px; opacity: 0;
    animation: h-fade-up 1.2s ease 3.2s forwards;
  }
  .H-act {
    display: flex; align-items: center; gap: 16px;
    padding: 20px 0; text-decoration: none; color: #e8e4dc;
    border-top: 1px solid rgba(232,228,220,0.06);
    transition: all 0.4s ease; cursor: pointer;
  }
  .H-act:last-child { border-bottom: 1px solid rgba(232,228,220,0.06); }
  .H-act:hover { padding-left: 12px; border-color: rgba(219,182,69,0.15); }
  .H-act-num {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; letter-spacing: 0.2em;
    color: rgba(219,182,69,0.3); width: 36px; flex-shrink: 0;
  }
  .H-act-div { width: 1px; height: 32px; background: rgba(232,228,220,0.06); flex-shrink: 0; }
  .H-act-body { display: flex; flex-direction: column; gap: 4px; flex: 1; }
  .H-act-name {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 20px; font-weight: 500; color: #e8e4dc; transition: color 0.3s;
  }
  .H-act:hover .H-act-name { color: #dbb645; }
  .H-act-detail {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; color: rgba(232,228,220,0.2); line-height: 1.5;
  }
  .H-act-go {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 20px; color: rgba(232,228,220,0.1);
    transition: color 0.3s, transform 0.3s; flex-shrink: 0;
  }
  .H-act:hover .H-act-go { color: rgba(219,182,69,0.5); transform: translateX(4px); }

  /* ── DOORS ── */
  .H-doors {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 2px; width: 100%; max-width: 480px;
    margin-bottom: 24px; opacity: 0;
    animation: h-fade-up 1.5s ease 4s forwards;
  }
  .H-door {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 12px; padding: 24px 8px; text-decoration: none;
    border: 1px solid rgba(232,228,220,0.04); border-radius: 2px;
    transition: all 0.5s ease; cursor: pointer;
    position: relative; overflow: hidden;
  }
  .H-door::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(219,182,69,0.03) 0%, transparent 100%);
    opacity: 0; transition: opacity 0.5s ease;
  }
  .H-door:hover::before { opacity: 1; }
  .H-door:hover { border-color: rgba(219,182,69,0.15); transform: translateY(-2px); }
  .H-door-r {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 24px; color: rgba(219,182,69,0.25);
    transition: color 0.4s; position: relative; z-index: 1;
  }
  .H-door:hover .H-door-r { color: rgba(219,182,69,0.6); }
  .H-door-l {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 12px; font-style: italic;
    color: rgba(232,228,220,0.2); text-align: center;
    line-height: 1.5; transition: color 0.4s;
    position: relative; z-index: 1;
  }
  .H-door:hover .H-door-l { color: rgba(232,228,220,0.5); }

  /* ── SIG ── */
  .H-sig {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; color: rgba(232,228,220,0.06);
    letter-spacing: 0.15em; margin-top: auto;
    opacity: 0; animation: h-fade-up 1s ease 5.5s forwards;
  }

  @keyframes h-fade-up {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* ── MOBILE ── */
  @media (max-width: 768px) {
    .H { padding: 32px 24px 24px; }
    .H-drinks-text { font-size: clamp(32px, 10vw, 52px); }
    .H-score-num { font-size: clamp(28px, 9vw, 44px); }
    .H-score-q { font-size: 18px; }
    .H-actions { max-width: 100%; }
    .H-act { gap: 12px; padding: 16px 0; }
    .H-act-name { font-size: 17px; }
    .H-act-num, .H-act-div { display: none; }
    .H-doors { grid-template-columns: repeat(2, 1fr); max-width: 100%; }
    .H-door { padding: 20px 8px; }
  }
`;
