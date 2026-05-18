"use client";

import { useState, useRef, useEffect } from "react";

/* ── portfolio ── */
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
        let s = 296.57;
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

// TODO: replace with actual YouTube video ID after upload
const VIDEO_ID = "REPLACE_WITH_VIDEO_ID";

/* ═══════════════════════════════════════
   The page transforms as you watch.

   Phase 0 (0-30s): Just the video. Black. Nothing else.
   Phase 1 (30-60s): The edges start breathing — faint amber glow.
                     The portfolio value bleeds in at the bottom.
   Phase 2 (60-120s): The ink simulation starts behind the video.
                      The video shrinks slightly. Text emerges.
   Phase 3 (120-180s): Full reveal. Auction, party, the bet question.
                       The video is now one element among many.
   Phase 4 (180s+): Everything settles. The page is the page.
   ═══════════════════════════════════════ */

export default function ReelPage() {
  const total = useLive();
  const d = days();
  const [elapsed, setElapsed] = useState(0);
  const [started, setStarted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Track time since user started watching
  useEffect(() => {
    if (!started) return;
    timerRef.current = setInterval(() => {
      setElapsed(e => e + 1);
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [started]);

  // Start the timer when page loads (or on first interaction)
  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Phase based on elapsed time
  const phase = elapsed < 30 ? 0 : elapsed < 60 ? 1 : elapsed < 120 ? 2 : elapsed < 180 ? 3 : 4;

  // Smooth progress within each phase (0-1)
  const phaseProgress = (p: number) => {
    if (phase < p) return 0;
    if (phase > p) return 1;
    const starts = [0, 30, 60, 120, 180];
    const ends = [30, 60, 120, 180, 240];
    return Math.min(1, (elapsed - starts[p]) / (ends[p] - starts[p]));
  };

  const p1 = phaseProgress(1);
  const p2 = phaseProgress(2);
  const p3 = phaseProgress(3);
  const p4 = phaseProgress(4);

  // Video scale: starts full, shrinks in phase 2
  const videoScale = phase < 2 ? 1 : 1 - p2 * 0.25;
  const videoOpacity = phase < 4 ? 1 : Math.max(0.4, 1 - p4 * 0.6);

  // Background glow
  const glowOpacity = p1 * 0.15 + p2 * 0.1;

  return (
    <div className="R" data-phase={phase}>
      <style>{css}</style>

      {/* ambient glow — bleeds in during phase 1 */}
      <div className="R-glow" style={{ opacity: glowOpacity }} />

      {/* the video — always present, transforms over time */}
      <div
        className="R-video-wrap"
        style={{
          transform: `scale(${videoScale})`,
          opacity: videoOpacity,
        }}
      >
        <iframe
          src={`https://www.youtube.com/embed/${VIDEO_ID}?rel=0&modestbranding=1&iv_load_policy=3&color=white&autoplay=1`}
          className="R-video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          title="aureliex"
        />
      </div>

      {/* phase 1+: portfolio value bleeds in at bottom */}
      <div className="R-value" style={{ opacity: p1, transform: `translateY(${(1 - p1) * 20}px)` }}>
        <span className="R-value-num">
          {total ? "$" + Math.round(total).toLocaleString() : ""}
        </span>
        <span className="R-value-live">live</span>
      </div>

      {/* phase 2+: context emerges around the video */}
      <div className="R-context" style={{ opacity: p2 }}>
        <div className="R-context-left">
          <p className="R-ctx-line">{d} days left</p>
          <p className="R-ctx-line R-ctx-dim">→ $100,000</p>
        </div>
        <div className="R-context-right">
          <p className="R-ctx-line">5 agents</p>
          <p className="R-ctx-line R-ctx-dim">argue every trade</p>
        </div>
      </div>

      {/* phase 3+: the full reveal — auction, party, the question */}
      <div className="R-reveal" style={{ opacity: p3 }}>
        <div className="R-reveal-top">
          <div className="R-auction">
            <span className="R-auction-lot">LOT 001</span>
            <span className="R-auction-title">The Tarantula · opening bid $25</span>
            <span className="R-auction-back">
              backed by 10% of portfolio
              {total ? ` · $${Math.round(total * 0.1).toLocaleString()}` : ""}
            </span>
          </div>
          <div className="R-party">
            <span className="R-party-date">june 21, 2026</span>
            <span className="R-party-line">the party is the liquidity event</span>
            <span className="R-party-detail">10% dividend pool · flight comp · stake ∝ earliness × size</span>
          </div>
        </div>

        <div className="R-bet">
          <p className="R-bet-q">do you think he makes it?</p>
          <div className="R-bet-opts">
            <span className="R-bet-opt">yes</span>
            <span className="R-bet-opt">no</span>
          </div>
        </div>
      </div>

      {/* phase 4+: settle — aureliex */}
      <div className="R-close" style={{ opacity: p4 }}>
        <a href="https://aureliex.com" target="_blank" rel="noopener noreferrer" className="R-close-word">
          aureliex
        </a>
      </div>

      {/* subtle elapsed indicator */}
      <div className="R-timer">
        {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, "0")}
      </div>
    </div>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=JetBrains+Mono:wght@400;500&display=swap');

  .R {
    position: fixed; inset: 0;
    background: #000;
    color: #e8e4dc;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
    -webkit-font-smoothing: antialiased;
  }

  /* ambient glow */
  .R-glow {
    position: absolute; inset: 0;
    background: radial-gradient(ellipse at center,
      rgba(139, 105, 20, 0.12) 0%,
      rgba(139, 58, 46, 0.06) 40%,
      transparent 70%
    );
    pointer-events: none; z-index: 1;
    transition: opacity 2s ease;
  }

  /* video */
  .R-video-wrap {
    position: relative; z-index: 2;
    width: 85%; max-width: 900px;
    aspect-ratio: 16/9;
    border-radius: 2px; overflow: hidden;
    transition: transform 3s ease, opacity 3s ease;
    box-shadow: 0 0 80px rgba(0,0,0,0.5);
  }
  .R-video {
    width: 100%; height: 100%; border: none;
  }

  /* portfolio value */
  .R-value {
    position: fixed; bottom: 40px; left: 50%;
    transform: translateX(-50%);
    z-index: 5;
    display: flex; align-items: baseline; gap: 12px;
    transition: opacity 2s ease, transform 2s ease;
  }
  .R-value-num {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: clamp(28px, 5vw, 48px);
    font-weight: 500;
    color: rgba(232, 228, 220, 0.7);
  }
  .R-value-live {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: rgba(232, 228, 220, 0.2);
  }

  /* context — flanks the video */
  .R-context {
    position: fixed; z-index: 5;
    inset: 0;
    display: flex; justify-content: space-between;
    align-items: center;
    padding: 0 32px;
    pointer-events: none;
    transition: opacity 3s ease;
  }
  .R-context-left, .R-context-right {
    display: flex; flex-direction: column; gap: 6px;
  }
  .R-context-right { text-align: right; }
  .R-ctx-line {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.15em;
    color: rgba(232, 228, 220, 0.35);
    margin: 0;
  }
  .R-ctx-dim { color: rgba(232, 228, 220, 0.15); }

  /* reveal — auction + party + bet */
  .R-reveal {
    position: fixed; z-index: 5;
    inset: 0;
    display: flex; flex-direction: column;
    justify-content: space-between;
    padding: 24px 32px;
    pointer-events: none;
    transition: opacity 3s ease;
  }
  .R-reveal-top {
    display: flex; justify-content: space-between;
    align-items: flex-start;
  }
  .R-auction, .R-party {
    display: flex; flex-direction: column; gap: 4px;
  }
  .R-party { text-align: right; }
  .R-auction-lot {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px; letter-spacing: 0.2em;
    color: #C9A84C;
  }
  .R-auction-title {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 14px; color: rgba(232, 228, 220, 0.5);
  }
  .R-auction-back {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; color: rgba(232, 228, 220, 0.2);
  }
  .R-party-date {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px; letter-spacing: 0.25em;
    color: rgba(232, 228, 220, 0.25);
  }
  .R-party-line {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 14px; color: rgba(232, 228, 220, 0.5);
    font-style: italic;
  }
  .R-party-detail {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; color: rgba(232, 228, 220, 0.2);
  }

  /* the bet */
  .R-bet {
    text-align: center;
    margin-bottom: 60px;
  }
  .R-bet-q {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 18px; font-style: italic;
    color: rgba(232, 228, 220, 0.4);
    margin: 0 0 16px;
  }
  .R-bet-opts {
    display: flex; justify-content: center; gap: 80px;
    pointer-events: auto;
  }
  .R-bet-opt {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 16px;
    color: rgba(232, 228, 220, 0.2);
    cursor: pointer;
    transition: color 0.3s;
  }
  .R-bet-opt:hover { color: #e8e4dc; }

  /* close */
  .R-close {
    position: fixed; bottom: 12px; left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    transition: opacity 3s ease;
  }
  .R-close-word {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 13px; letter-spacing: 0.1em;
    color: rgba(232, 228, 220, 0.15);
    text-decoration: none;
    transition: color 0.3s;
  }
  .R-close-word:hover { color: rgba(232, 228, 220, 0.6); }

  /* timer */
  .R-timer {
    position: fixed; top: 16px; right: 20px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; letter-spacing: 0.2em;
    color: rgba(232, 228, 220, 0.08);
    z-index: 10;
    font-variant-numeric: tabular-nums;
  }

  /* responsive */
  @media (max-width: 768px) {
    .R-video-wrap { width: 95%; }
    .R-context { padding: 0 16px; }
    .R-reveal-top { flex-direction: column; gap: 8px; }
    .R-party { text-align: left; }
    .R-ctx-line { font-size: 10px; }
  }
`;
