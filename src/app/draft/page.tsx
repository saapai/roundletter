"use client";

import { useState, useRef, useEffect } from "react";

/* ── live portfolio ── */
const H = [
  { t: "QTUM", s: 5.584, e: 679.74 }, { t: "MSFT", s: 1.036, e: 407.87 },
  { t: "GOOG", s: 1.235, e: 407.17 }, { t: "IONQ", s: 9.489, e: 416.85 },
  { t: "IBM",  s: 1.553, e: 373.33 }, { t: "NVDA", s: 1.773, e: 344.49 },
  { t: "CEG",  s: 1.148, e: 339.05 }, { t: "RGTI", s: 9.938, e: 169.50 },
  { t: "SGOV", s: 2.625, e: 263.94 }, { t: "QBTS", s: 5.951, e: 101.65 },
];
function useLive() {
  const [v, setV] = useState<number | null>(null);
  useEffect(() => {
    let on = true;
    const go = async () => {
      try {
        const r = await fetch("/api/prices", { cache: "no-store" });
        if (!r.ok || !on) return;
        const j = await r.json();
        if (!j?.hasData || !on) return;
        let s = 296.57; // pending_cash + prediction offset
        for (const h of H) {
          const d = j.data[h.t];
          s += d?.closes?.length > 0 ? h.s * d.closes[d.closes.length - 1] : h.e;
        }
        setV(s);
      } catch {}
    };
    go(); const id = setInterval(go, 30_000);
    return () => { on = false; clearInterval(id); };
  }, []);
  return v;
}

function days() {
  return Math.max(0, Math.ceil((new Date("2026-06-21").getTime() - Date.now()) / 86_400_000));
}

/* ═══════════════════════════════════════
   PAGE — a visual mixtape in 5 moments
   ═══════════════════════════════════════ */

export default function DraftPage() {
  const [sp, setSp] = useState(0);
  const railRef = useRef<HTMLDivElement>(null);
  const total = useLive();
  const d = days();

  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight;
      setSp(max > 0 ? el.scrollTop / max : 0);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Scene thresholds
  const scene = sp < 0.18 ? 0 : sp < 0.38 ? 1 : sp < 0.58 ? 2 : sp < 0.78 ? 3 : 4;

  // Background color shifts per scene (baked references)
  // 0: black (Wesley Wang — negative space)
  // 1: Chungking Express blue-amber (#1a3a5c → warm)
  // 2: Ted Lasso warm gold (#2a1f0a)
  // 3: EEAO multiverse (dark with color bleeds)
  // 4: back to black (resolve)
  const bgColors = ["#000", "#0a1520", "#12100a", "#0a0510", "#000"];
  const bg = bgColors[scene];

  return (
    <div className="D" style={{ background: bg }}>
      <style>{css}</style>

      {/* scroll rail */}
      <div className="D-rail" ref={railRef}>
        <div style={{ height: "500vh" }} />
      </div>

      {/* ── MOMENT 1: Wesley Wang — nothing, except everything ── */}
      <div className={`D-m ${scene === 0 ? "on" : ""}`}>
        <div className="m1">
          <div className="m1-video">
            <iframe
              src="https://www.youtube.com/embed/hif5eI5pBxo?rel=0&modestbranding=1&iv_load_policy=3&color=white"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              title="nothing, except everything."
            />
          </div>
        </div>
      </div>

      {/* ── MOMENT 2: Chungking Express — the number in neon ──
           Blue and amber. Motion blur. The loneliness of a number. */}
      <div className={`D-m ${scene === 1 ? "on" : ""}`}>
        <div className="m2">
          <div className="m2-glow" />
          <div className="m2-content">
            <p className="m2-above">every day it changes. every day it&rsquo;s real.</p>
            <h1 className="m2-number">
              {total ? "$" + Math.round(total).toLocaleString() : "..."}
            </h1>
            <div className="m2-target">
              <span className="m2-arrow">→</span>
              <span className="m2-goal">$100,000</span>
            </div>
            <p className="m2-days">{d} days left</p>
          </div>
          {/* Chungking blur streaks */}
          <div className="m2-streak m2-streak-1" />
          <div className="m2-streak m2-streak-2" />
          <div className="m2-streak m2-streak-3" />
        </div>
      </div>

      {/* ── MOMENT 3: Ted Lasso — BELIEVE ──
           The handmade sign. Yellow tape. The optimist's bet. */}
      <div className={`D-m ${scene === 2 ? "on" : ""}`}>
        <div className="m3">
          <div className="m3-sign">
            <div className="m3-tape m3-tape-tl" />
            <div className="m3-tape m3-tape-tr" />
            <div className="m3-tape m3-tape-bl" />
            <div className="m3-tape m3-tape-br" />
            <h2 className="m3-word">BELIEVE</h2>
          </div>
          <p className="m3-sub">
            $3,453 → $100,000 by my 20th birthday.<br />
            five AI agents argue every trade.<br />
            the monte carlo says 0.000000%.
          </p>
        </div>
      </div>

      {/* ── MOMENT 4: EEAO — everything, all at once ──
           The painting + the auction + the party. Layered. Dense. */}
      <div className={`D-m ${scene === 3 ? "on" : ""}`}>
        <div className="m4">
          <div className="m4-painting">
            <img src="/art/auction-piece.jpg" alt="Cityscape" />
            <div className="m4-overlay">
              <span className="m4-lot">LOT 001 — opening bid $25</span>
              <p className="m4-backed">
                backed by 10% of the portfolio
                {total ? ` — currently $${Math.round(total * 0.1).toLocaleString()}` : ""}
              </p>
            </div>
          </div>
          <div className="m4-side">
            <p className="m4-date">june 21, 2026</p>
            <p className="m4-party">the party is the<br />liquidity event.</p>
            <div className="m4-stats">
              <span><strong>$100</strong> invested</span>
              <span><strong>$66</strong> easter eggs</span>
              <span><strong>{total ? "$" + Math.round(total * 0.1).toLocaleString() : "..."}</strong> dividend pool</span>
            </div>
            <p className="m4-stake">stake ∝ earliness × size</p>
          </div>
        </div>
      </div>

      {/* ── MOMENT 5: The resolve — just the word ── */}
      <div className={`D-m ${scene === 4 ? "on" : ""}`}>
        <div className="m5">
          <a href="https://aureliex.com" className="m5-word" target="_blank" rel="noopener noreferrer">
            aureliex
          </a>
          <p className="m5-line">attention is what matters the most.</p>
          <nav className="m5-nav">
            {["/argument", "/about-the-method", "/art", "/archive", "/letters/round-0"].map(r => (
              <a key={r} href={`https://aureliex.com${r}`} target="_blank" rel="noopener noreferrer">
                {r.split("/").pop()}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}

/* ── styles ── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap');

  .D {
    position: fixed; inset: 0;
    color: #e8e4dc;
    transition: background 0.8s ease;
    overflow: hidden;
    -webkit-font-smoothing: antialiased;
  }

  .D-rail {
    position: fixed; inset: 0; z-index: 10;
    overflow-y: auto; scrollbar-width: none;
  }
  .D-rail::-webkit-scrollbar { display: none; }

  .D-m {
    position: fixed; inset: 0; z-index: 5;
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity 0.4s ease;
    pointer-events: none;
  }
  .D-m.on { opacity: 1; pointer-events: auto; }

  /* ═══ MOMENT 1 — Wesley Wang ═══
     Black. The video. Nothing else. */
  .m1 { width: 100%; padding: 0 10%; }
  .m1-video {
    width: 100%; max-width: 860px; margin: 0 auto;
    aspect-ratio: 16/9; border-radius: 2px;
    overflow: hidden;
    box-shadow: 0 0 120px rgba(0,0,0,0.6);
  }
  .m1-video iframe { width: 100%; height: 100%; border: none; }

  /* ═══ MOMENT 2 — Chungking Express ═══
     Neon blue + amber. Motion blur. Loneliness. */
  .m2 {
    position: relative; text-align: center;
    width: 100%; overflow: hidden;
  }
  .m2-glow {
    position: absolute; top: 50%; left: 50%;
    width: 600px; height: 600px;
    transform: translate(-50%, -50%);
    background: radial-gradient(circle,
      rgba(30, 80, 140, 0.15) 0%,
      rgba(200, 140, 50, 0.08) 40%,
      transparent 70%
    );
    border-radius: 50%;
    animation: m2-breathe 4s ease infinite;
  }
  @keyframes m2-breathe {
    0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
    50% { transform: translate(-50%, -50%) scale(1.15); opacity: 1; }
  }
  .m2-content { position: relative; z-index: 2; }
  .m2-above {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 15px; font-style: italic;
    color: rgba(200, 160, 100, 0.4);
    margin: 0 0 24px;
  }
  .m2-number {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: clamp(56px, 14vw, 160px);
    font-weight: 500;
    letter-spacing: -0.03em;
    line-height: 1;
    margin: 0;
    color: #e8e4dc;
    text-shadow: 0 0 80px rgba(30, 80, 140, 0.3),
                 0 0 160px rgba(200, 140, 50, 0.1);
  }
  .m2-target {
    margin-top: 16px;
    display: flex; align-items: center;
    justify-content: center; gap: 12px;
  }
  .m2-arrow {
    font-size: 28px; color: rgba(200, 160, 100, 0.25);
    font-family: 'EB Garamond', Georgia, serif;
  }
  .m2-goal {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: clamp(24px, 5vw, 40px);
    font-weight: 400; color: rgba(232, 228, 220, 0.2);
  }
  .m2-days {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px; color: rgba(200, 160, 100, 0.3);
    letter-spacing: 0.2em; text-transform: uppercase;
    margin-top: 20px;
  }
  /* Motion blur streaks — Chungking Express neon trails */
  .m2-streak {
    position: absolute; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(80, 140, 200, 0.15), transparent);
    animation: m2-drift 8s linear infinite;
  }
  .m2-streak-1 { top: 30%; left: -20%; width: 140%; animation-duration: 7s; }
  .m2-streak-2 { top: 55%; left: -10%; width: 120%; animation-duration: 11s; animation-delay: -3s;
    background: linear-gradient(90deg, transparent, rgba(200, 140, 50, 0.1), transparent);
  }
  .m2-streak-3 { top: 72%; left: -15%; width: 130%; animation-duration: 9s; animation-delay: -5s; }
  @keyframes m2-drift {
    from { transform: translateX(-10%); }
    to { transform: translateX(10%); }
  }

  /* ═══ MOMENT 3 — Ted Lasso BELIEVE ═══
     Yellow paper sign. Tape corners. Warm. */
  .m3 {
    text-align: center;
    display: flex; flex-direction: column;
    align-items: center; gap: 32px;
  }
  .m3-sign {
    position: relative;
    background: #f5e6a3;
    padding: 28px 56px;
    border-radius: 2px;
    box-shadow: 0 4px 30px rgba(0,0,0,0.4);
    transform: rotate(-0.8deg);
  }
  .m3-word {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: clamp(40px, 10vw, 80px);
    font-weight: 600;
    color: #1a1a1a;
    letter-spacing: 0.02em;
    margin: 0;
  }
  .m3-tape {
    position: absolute;
    width: 40px; height: 16px;
    background: rgba(200, 190, 150, 0.6);
    border-radius: 1px;
  }
  .m3-tape-tl { top: -6px; left: 12px; transform: rotate(-15deg); }
  .m3-tape-tr { top: -6px; right: 12px; transform: rotate(12deg); }
  .m3-tape-bl { bottom: -6px; left: 16px; transform: rotate(8deg); }
  .m3-tape-br { bottom: -6px; right: 14px; transform: rotate(-10deg); }
  .m3-sub {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 16px; line-height: 1.8;
    color: rgba(232, 228, 220, 0.4);
    font-style: italic;
    max-width: 400px;
  }

  /* ═══ MOMENT 4 — EEAO — everything at once ═══
     The painting + the numbers. Layered. Color bleeds. */
  .m4 {
    display: flex; align-items: center; gap: 40px;
    padding: 0 6%;
    width: 100%; max-width: 1000px;
  }
  .m4-painting {
    flex: 0 0 55%; position: relative;
    border-radius: 3px; overflow: hidden;
    box-shadow:
      0 0 60px rgba(140, 40, 30, 0.2),
      0 0 120px rgba(40, 40, 140, 0.15);
  }
  .m4-painting img {
    width: 100%; display: block;
    filter: contrast(1.1) saturate(1.2);
  }
  .m4-overlay {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 20px;
    background: linear-gradient(transparent, rgba(0,0,0,0.7));
  }
  .m4-lot {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; letter-spacing: 0.15em;
    color: #C9A84C;
  }
  .m4-backed {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 13px; color: #aaa;
    font-style: italic; margin: 6px 0 0;
  }
  .m4-side {
    flex: 1;
    font-family: 'EB Garamond', Georgia, serif;
  }
  .m4-date {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; letter-spacing: 0.25em;
    color: #444; text-transform: uppercase;
    margin: 0 0 12px;
  }
  .m4-party {
    font-size: clamp(20px, 3vw, 28px);
    font-weight: 500; line-height: 1.35;
    margin: 0 0 20px;
    color: #e8e4dc;
  }
  .m4-stats {
    display: flex; flex-direction: column; gap: 8px;
    font-size: 14px; color: #777;
  }
  .m4-stats strong {
    color: #e8e4dc; font-weight: 500;
    margin-right: 6px;
  }
  .m4-stake {
    font-size: 13px; color: #444;
    font-style: italic; margin: 16px 0 0;
  }

  /* ═══ MOMENT 5 — resolve ═══ */
  .m5 {
    text-align: center;
    display: flex; flex-direction: column;
    align-items: center; gap: 16px;
  }
  .m5-word {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 22px; font-weight: 500;
    letter-spacing: 0.12em; color: #444;
    text-decoration: none;
    transition: color 0.3s;
  }
  .m5-word:hover { color: #e8e4dc; }
  .m5-line {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 15px; font-style: italic;
    color: #2a2a2a; margin: 0;
  }
  .m5-nav {
    display: flex; gap: 4px; margin-top: 16px; flex-wrap: wrap;
    justify-content: center;
  }
  .m5-nav a {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px; color: #333;
    text-decoration: none; padding: 6px 10px;
    border-radius: 3px;
    transition: color 0.2s;
  }
  .m5-nav a:hover { color: #e8e4dc; }

  /* ── responsive ── */
  @media (max-width: 768px) {
    .m1 { padding: 0 4%; }
    .m4 { flex-direction: column; gap: 24px; padding: 0 16px; }
    .m4-painting { flex: none; width: 100%; }
    .m3-sign { padding: 20px 32px; }
  }
`;
