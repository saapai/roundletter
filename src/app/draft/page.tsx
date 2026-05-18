"use client";

import { useState, useRef, useEffect, useCallback } from "react";

/* ── portfolio ── */
const HOLDINGS = [
  { ticker: "QTUM", shares: 5.584, entry_value: 679.74 },
  { ticker: "MSFT", shares: 1.036, entry_value: 407.87 },
  { ticker: "GOOG", shares: 1.235, entry_value: 407.17 },
  { ticker: "IONQ", shares: 9.489, entry_value: 416.85 },
  { ticker: "IBM",  shares: 1.553, entry_value: 373.33 },
  { ticker: "NVDA", shares: 1.773, entry_value: 344.49 },
  { ticker: "CEG",  shares: 1.148, entry_value: 339.05 },
  { ticker: "RGTI", shares: 9.938, entry_value: 169.50 },
  { ticker: "SGOV", shares: 2.625, entry_value: 263.94 },
  { ticker: "QBTS", shares: 5.951, entry_value: 101.65 },
];
const PENDING_CASH = 46.57;
const PREDICTION_OFFSET = 250;

function useLiveTotal() {
  const [total, setTotal] = useState<number | null>(null);
  useEffect(() => {
    let alive = true;
    const pull = async () => {
      try {
        const r = await fetch("/api/prices", { cache: "no-store" });
        if (!r.ok || !alive) return;
        const j = await r.json();
        if (!j?.hasData || !alive) return;
        let sum = PENDING_CASH + PREDICTION_OFFSET;
        for (const h of HOLDINGS) {
          const s = j.data[h.ticker];
          if (s?.closes?.length > 0) sum += h.shares * s.closes[s.closes.length - 1];
          else sum += h.entry_value;
        }
        setTotal(sum);
      } catch {}
    };
    pull();
    const id = setInterval(pull, 30_000);
    return () => { alive = false; clearInterval(id); };
  }, []);
  return total;
}

function daysUntil(d: string) {
  return Math.max(0, Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000));
}
function fmtDollar(n: number) {
  return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

/* ══════════════════════════════════════════════════════════
   PARTICLE CANVAS — the living organism
   ══════════════════════════════════════════════════════════ */

interface Particle {
  x: number; y: number;
  baseX: number; baseY: number;
  vx: number; vy: number;
  size: number;
  hue: number;
  alpha: number;
  phase: number; // individual breathing offset
}

function useParticleCanvas(scrollProgress: number) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: -9999, y: -9999 });
  const dims = useRef({ w: 0, h: 0 });
  const raf = useRef<number>(0);
  const time = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      dims.current.w = window.innerWidth;
      dims.current.h = window.innerHeight;
      canvas.width = dims.current.w * dpr;
      canvas.height = dims.current.h * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = dims.current.w + "px";
      canvas.style.height = dims.current.h + "px";
    };

    const initParticles = () => {
      const count = Math.min(900, Math.floor((dims.current.w * dims.current.h) / 2000));
      const arr: Particle[] = [];
      for (let i = 0; i < count; i++) {
        const x = Math.random() * dims.current.w;
        const y = Math.random() * dims.current.h;
        arr.push({
          x, y, baseX: x, baseY: y,
          vx: 0, vy: 0,
          size: 1 + Math.random() * 2,
          hue: 30 + Math.random() * 20, // warm amber range
          alpha: 0.1 + Math.random() * 0.3,
          phase: Math.random() * Math.PI * 2,
        });
      }
      particles.current = arr;
    };

    const onMouse = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    const onMouseLeave = () => {
      mouse.current.x = -9999;
      mouse.current.y = -9999;
    };

    resize();
    initParticles();
    window.addEventListener("resize", () => { resize(); initParticles(); });
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("mouseleave", onMouseLeave);

    const draw = () => {
      time.current += 0.008;
      const t = time.current;
      const { w, h } = dims.current;
      const mx = mouse.current.x;
      const my = mouse.current.y;
      const sp = scrollProgress; // 0 → 1

      ctx.clearRect(0, 0, w, h);

      // Determine particle behavior based on scroll
      // 0.0–0.2: scattered, dim, breathing (the hook)
      // 0.2–0.4: gathering toward center (the number)
      // 0.4–0.6: expanding ring (the auction)
      // 0.6–0.8: tight cluster bottom-right (the party)
      // 0.8–1.0: constellation scatter (the doors)

      for (const p of particles.current) {
        // Target position based on scroll phase
        let tx = p.baseX;
        let ty = p.baseY;
        let targetAlpha = 0.15 + Math.sin(t + p.phase) * 0.1;
        let targetSize = p.size;

        if (sp < 0.15) {
          // Scattered, alive, breathing
          tx = p.baseX + Math.sin(t * 0.3 + p.phase) * 30;
          ty = p.baseY + Math.cos(t * 0.2 + p.phase * 1.3) * 20;
          targetAlpha = 0.08 + Math.sin(t * 0.5 + p.phase) * 0.06;
        } else if (sp < 0.35) {
          // Gather toward center — breathing mass
          const centerX = w * 0.5;
          const centerY = h * 0.5;
          const angle = Math.atan2(p.baseY - centerY, p.baseX - centerX);
          const dist = 80 + Math.sin(t + p.phase * 2) * 40;
          tx = centerX + Math.cos(angle + t * 0.1) * dist;
          ty = centerY + Math.sin(angle + t * 0.1) * dist;
          targetAlpha = 0.3 + Math.sin(t * 2 + p.phase) * 0.15;
          targetSize = p.size * 1.3;
        } else if (sp < 0.55) {
          // Expanding ring
          const centerX = w * 0.5;
          const centerY = h * 0.5;
          const angle = p.phase + t * 0.15;
          const radius = 120 + Math.sin(p.phase * 3) * 80 + Math.sin(t + p.phase) * 20;
          tx = centerX + Math.cos(angle) * radius;
          ty = centerY + Math.sin(angle) * radius;
          targetAlpha = 0.25 + Math.sin(t * 1.5 + p.phase) * 0.15;
        } else if (sp < 0.75) {
          // Drift to right side, condensed
          tx = w * 0.7 + Math.sin(t * 0.4 + p.phase) * 100;
          ty = h * 0.5 + Math.cos(t * 0.3 + p.phase * 1.7) * 150;
          targetAlpha = 0.2 + Math.sin(t + p.phase) * 0.1;
        } else {
          // Final constellation — settle into fixed positions
          const gridX = (p.phase / (Math.PI * 2)) * w;
          const gridY = p.baseY;
          tx = gridX + Math.sin(t * 0.2 + p.phase) * 5;
          ty = gridY + Math.cos(t * 0.15 + p.phase) * 5;
          targetAlpha = 0.12 + Math.sin(t * 0.3 + p.phase) * 0.05;
          targetSize = p.size * 0.8;
        }

        // Mouse repulsion
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const force = (150 - dist) / 150;
          const angle = Math.atan2(dy, dx);
          tx += Math.cos(angle) * force * 80;
          ty += Math.sin(angle) * force * 80;
          targetAlpha = Math.min(1, targetAlpha + force * 0.4);
          targetSize = p.size * (1 + force * 0.8);
        }

        // Smooth interpolation
        p.x += (tx - p.x) * 0.03;
        p.y += (ty - p.y) * 0.03;
        p.alpha += (targetAlpha - p.alpha) * 0.05;

        // Color shifts with scroll: cool white → warm amber → rust
        const hue = sp < 0.3 ? 220 : sp < 0.6 ? 30 + sp * 30 : 15;
        const sat = sp < 0.3 ? 10 : sp < 0.6 ? 50 : 70;
        const light = 60 + Math.sin(t + p.phase) * 10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, targetSize, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, ${sat}%, ${light}%, ${p.alpha})`;
        ctx.fill();

        // Glow for larger particles near mouse
        if (dist < 120 && targetSize > 2) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, targetSize * 3, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${hue}, ${sat}%, ${light}%, ${p.alpha * 0.1})`;
          ctx.fill();
        }
      }

      // Draw faint connection lines between nearby particles (only some)
      if (sp > 0.2 && sp < 0.7) {
        ctx.strokeStyle = `hsla(30, 40%, 60%, 0.03)`;
        ctx.lineWidth = 0.5;
        const ps = particles.current;
        for (let i = 0; i < ps.length; i += 3) {
          for (let j = i + 1; j < ps.length; j += 5) {
            const dx = ps[i].x - ps[j].x;
            const dy = ps[i].y - ps[j].y;
            const d = dx * dx + dy * dy;
            if (d < 3000) {
              ctx.beginPath();
              ctx.moveTo(ps[i].x, ps[i].y);
              ctx.lineTo(ps[j].x, ps[j].y);
              ctx.stroke();
            }
          }
        }
      }

      raf.current = requestAnimationFrame(draw);
    };

    raf.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [scrollProgress]);

  return canvasRef;
}

/* ══════════════════════════════════════════════════════════
   PAGE
   ══════════════════════════════════════════════════════════ */

export default function DraftPage() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const total = useLiveTotal();
  const countdown = daysUntil("2026-06-21");

  const canvasRef = useParticleCanvas(scrollProgress);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight;
      setScrollProgress(max > 0 ? el.scrollTop / max : 0);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="d-root">
      <style>{css}</style>
      <canvas ref={canvasRef} className="d-canvas" />
      <div className="d-scroll" ref={scrollRef}>

        {/* 1 — THE HOOK */}
        <section className="d-s">
          <div className="d-video-wrap">
            <iframe
              src="https://www.youtube.com/embed/hif5eI5pBxo?rel=0&modestbranding=1&iv_load_policy=3&color=white"
              className="d-video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              title="nothing, except everything."
            />
          </div>
        </section>

        {/* 2 — THE NUMBER */}
        <section className="d-s">
          <div className="d-number-block">
            <span className="d-eyebrow">live</span>
            <h1 className="d-amount">{total ? fmtDollar(total) : "..."}</h1>
            <div className="d-arrow">→</div>
            <h1 className="d-goal">$100,000</h1>
            <p className="d-deadline">
              <span className="d-days">{countdown}</span> days left
            </p>
          </div>
        </section>

        {/* 3 — THE ART */}
        <section className="d-s">
          <div className="d-art-wrap">
            <img src="/art/tarantula-full.jpg" alt="The Tarantula" className="d-art-img" />
            <div className="d-art-overlay">
              <span className="d-art-lot">LOT 001</span>
              <h2 className="d-art-title">The Tarantula</h2>
              <p className="d-art-back">
                backed by 10% of the portfolio<br />
                <span className="d-art-val">
                  {total ? `currently ${fmtDollar(total * 0.1)}` : "..."}
                </span>
              </p>
              <p className="d-art-bid">opening bid: $25</p>
            </div>
          </div>
        </section>

        {/* 4 — THE PARTY */}
        <section className="d-s">
          <div className="d-party-block">
            <span className="d-eyebrow">june 21, 2026</span>
            <h2 className="d-party-line">the party is the liquidity event.</h2>
            <p className="d-party-sub">
              10% of the portfolio is the dividend pool.<br />
              withdrawable or reinvestable. flight compensation included.<br />
              stake is proportional to earliness × size.
            </p>
            <div className="d-party-nums">
              <div className="d-party-num">
                <span className="d-party-figure">$100</span>
                <span className="d-party-label">invested externally</span>
              </div>
              <div className="d-party-num">
                <span className="d-party-figure">$66</span>
                <span className="d-party-label">gifted as easter eggs</span>
              </div>
              <div className="d-party-num">
                <span className="d-party-figure">{total ? fmtDollar(total * 0.1) : "..."}</span>
                <span className="d-party-label">dividend pool · live</span>
              </div>
            </div>
          </div>
        </section>

        {/* 5 — THE DOORS */}
        <section className="d-s d-s-doors">
          <h2 className="d-doors-title">aureliex</h2>
          <nav className="d-doors">
            {[
              ["/", "the cover"],
              ["/argument", "the argument"],
              ["/about-the-method", "the method"],
              ["/art", "twelve plates"],
              ["/letters/round-0", "round 0"],
              ["/green-credit", "green credit"],
              ["/archive", "the archive"],
            ].map(([href, label]) => (
              <a key={href} href={`https://aureliex.com${href}`} className="d-door" target="_blank" rel="noopener noreferrer">
                {label}
              </a>
            ))}
          </nav>
          <p className="d-coda">attention is what matters the most.</p>
        </section>

      </div>
    </div>
  );
}

/* ── styles ── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=JetBrains+Mono:wght@400;500&display=swap');

  .d-root {
    position: fixed; inset: 0;
    background: #050505;
    color: #e8e4dc;
    -webkit-font-smoothing: antialiased;
    overflow: hidden;
  }

  .d-canvas {
    position: fixed; inset: 0; z-index: 0;
    pointer-events: none;
  }

  .d-scroll {
    position: relative; z-index: 1;
    height: 100vh; overflow-y: auto;
    scroll-snap-type: y mandatory;
    scroll-behavior: smooth;
    scrollbar-width: none;
  }
  .d-scroll::-webkit-scrollbar { display: none; }

  .d-s {
    min-height: 100svh;
    scroll-snap-align: start;
    display: flex; align-items: center; justify-content: center;
    padding: 40px;
    position: relative;
  }

  /* ── 1. VIDEO ── */
  .d-video-wrap {
    width: 90%; max-width: 800px;
    aspect-ratio: 16/9;
    border-radius: 2px; overflow: hidden;
    box-shadow: 0 0 80px rgba(139,58,46,0.08);
  }
  .d-video {
    width: 100%; height: 100%; border: none;
  }

  /* ── 2. NUMBER ── */
  .d-number-block {
    text-align: center;
    display: flex; flex-direction: column;
    align-items: center; gap: 8px;
  }
  .d-eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; text-transform: uppercase;
    letter-spacing: 0.3em; color: #555;
  }
  .d-amount {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: clamp(48px, 10vw, 96px);
    font-weight: 300; letter-spacing: -0.03em;
    line-height: 1; margin: 0;
    color: #e8e4dc;
  }
  .d-arrow {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 32px; color: #333;
    margin: 4px 0;
  }
  .d-goal {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: clamp(32px, 6vw, 56px);
    font-weight: 300; letter-spacing: -0.02em;
    line-height: 1; margin: 0;
    color: #444;
  }
  .d-deadline {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 16px; color: #555;
    font-style: italic; margin-top: 16px;
  }
  .d-days {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 24px; font-weight: 400;
    color: #8B3A2E; font-style: normal;
  }

  /* ── 3. ART ── */
  .d-art-wrap {
    position: relative;
    max-width: 500px; width: 90%;
    border-radius: 2px; overflow: hidden;
    cursor: pointer;
  }
  .d-art-img {
    width: 100%; display: block;
    filter: brightness(0.85) contrast(1.05);
    transition: filter 0.6s ease;
  }
  .d-art-wrap:hover .d-art-img {
    filter: brightness(0.6) contrast(1.1);
  }
  .d-art-overlay {
    position: absolute; inset: 0;
    display: flex; flex-direction: column;
    justify-content: flex-end;
    padding: 32px;
    opacity: 0; transition: opacity 0.5s ease;
    background: linear-gradient(transparent 30%, rgba(0,0,0,0.7) 100%);
  }
  .d-art-wrap:hover .d-art-overlay { opacity: 1; }
  .d-art-lot {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; letter-spacing: 0.2em;
    color: #999; margin-bottom: 8px;
  }
  .d-art-title {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 28px; font-weight: 300;
    margin: 0 0 12px;
  }
  .d-art-back {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 14px; color: #aaa;
    line-height: 1.6; margin: 0 0 8px;
  }
  .d-art-val {
    color: #C9A84C;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
  }
  .d-art-bid {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px; color: #777;
    letter-spacing: 0.05em; margin: 0;
  }

  /* ── 4. PARTY ── */
  .d-party-block {
    text-align: center; max-width: 560px;
    display: flex; flex-direction: column;
    align-items: center; gap: 16px;
  }
  .d-party-line {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: clamp(24px, 4vw, 36px);
    font-weight: 300; font-style: italic;
    margin: 0; line-height: 1.3;
    color: #e8e4dc;
  }
  .d-party-sub {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 15px; color: #666;
    line-height: 1.8; margin: 0;
  }
  .d-party-nums {
    display: flex; gap: 32px; margin-top: 12px;
    flex-wrap: wrap; justify-content: center;
  }
  .d-party-num {
    display: flex; flex-direction: column;
    align-items: center; gap: 4px;
  }
  .d-party-figure {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 28px; font-weight: 400;
    color: #e8e4dc;
  }
  .d-party-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px; text-transform: uppercase;
    letter-spacing: 0.15em; color: #555;
  }

  /* ── 5. DOORS ── */
  .d-s-doors { flex-direction: column; gap: 24px; }
  .d-doors-title {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 24px; font-weight: 300;
    letter-spacing: 0.1em; color: #555;
    margin: 0;
  }
  .d-doors {
    display: flex; flex-wrap: wrap;
    gap: 0; justify-content: center;
  }
  .d-door {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 15px; color: #555;
    text-decoration: none;
    padding: 8px 16px;
    transition: color 0.3s;
    font-style: italic;
  }
  .d-door:hover { color: #e8e4dc; }
  .d-coda {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 14px; color: #333;
    font-style: italic; margin-top: 32px;
  }

  /* ── RESPONSIVE ── */
  @media (max-width: 640px) {
    .d-s { padding: 24px 16px; }
    .d-party-nums { gap: 20px; }
    .d-video-wrap { width: 100%; }
  }
`;
