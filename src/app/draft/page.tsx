"use client";

import { useState, useRef, useEffect } from "react";

/* ── portfolio ── */
const HOLDINGS = [
  { ticker: "QTUM", shares: 5.584, ev: 679.74 },
  { ticker: "MSFT", shares: 1.036, ev: 407.87 },
  { ticker: "GOOG", shares: 1.235, ev: 407.17 },
  { ticker: "IONQ", shares: 9.489, ev: 416.85 },
  { ticker: "IBM",  shares: 1.553, ev: 373.33 },
  { ticker: "NVDA", shares: 1.773, ev: 344.49 },
  { ticker: "CEG",  shares: 1.148, ev: 339.05 },
  { ticker: "RGTI", shares: 9.938, ev: 169.50 },
  { ticker: "SGOV", shares: 2.625, ev: 263.94 },
  { ticker: "QBTS", shares: 5.951, ev: 101.65 },
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
        let s = 46.57 + 250; // pending_cash + prediction offset
        for (const h of HOLDINGS) {
          const d = j.data[h.ticker];
          s += d?.closes?.length > 0 ? h.shares * d.closes[d.closes.length - 1] : h.ev;
        }
        setV(s);
      } catch {}
    };
    go();
    const id = setInterval(go, 30_000);
    return () => { on = false; clearInterval(id); };
  }, []);
  return v;
}

function days() {
  return Math.max(0, Math.ceil((new Date("2026-06-21").getTime() - Date.now()) / 86_400_000));
}

/* ═══════════════════════════════════════════════
   PARTICLE SYSTEM — crystallizes into the number
   ═══════════════════════════════════════════════ */

interface P {
  x: number; y: number;
  homeX: number; homeY: number;
  tx: number; ty: number;
  sz: number; ph: number;
  alpha: number;
  hasTarget: boolean;
}

function sampleText(text: string, w: number, h: number): Array<[number, number]> {
  const c = document.createElement("canvas");
  const sz = Math.min(w * 0.8, 1200);
  const fontSize = Math.min(sz / (text.length * 0.55), 200);
  c.width = w; c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.font = `300 ${fontSize}px "Helvetica Neue", "Arial", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.letterSpacing = `${-fontSize * 0.04}px`;
  ctx.fillText(text, w / 2, h / 2);
  const img = ctx.getImageData(0, 0, w, h);
  const pts: Array<[number, number]> = [];
  const step = Math.max(3, Math.floor(Math.min(w, h) / 200));
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      if (img.data[(y * w + x) * 4 + 3] > 128) {
        pts.push([x, y]);
      }
    }
  }
  return pts;
}

function useCanvas(scroll: number, liveValue: number | null) {
  const ref = useRef<HTMLCanvasElement>(null);
  const ps = useRef<P[]>([]);
  const mouse = useRef({ x: -9999, y: -9999 });
  const dim = useRef({ w: 0, h: 0 });
  const t = useRef(0);
  const lastText = useRef("");
  const textPts = useRef<Array<[number, number]>>([]);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      dim.current.w = window.innerWidth;
      dim.current.h = window.innerHeight;
      cv.width = dim.current.w * dpr;
      cv.height = dim.current.h * dpr;
      ctx.scale(dpr, dpr);
      cv.style.width = dim.current.w + "px";
      cv.style.height = dim.current.h + "px";
    };

    const init = () => {
      const n = Math.min(1000, Math.floor((dim.current.w * dim.current.h) / 1800));
      const arr: P[] = [];
      for (let i = 0; i < n; i++) {
        const x = Math.random() * dim.current.w;
        const y = Math.random() * dim.current.h;
        arr.push({
          x, y, homeX: x, homeY: y, tx: x, ty: y,
          sz: 0.8 + Math.random() * 1.8,
          ph: Math.random() * Math.PI * 2,
          alpha: 0.06 + Math.random() * 0.12,
          hasTarget: false,
        });
      }
      ps.current = arr;
    };

    const onM = (e: MouseEvent) => { mouse.current = { x: e.clientX, y: e.clientY }; };
    const onL = () => { mouse.current = { x: -9999, y: -9999 }; };

    resize(); init();
    window.addEventListener("resize", () => { resize(); init(); });
    window.addEventListener("mousemove", onM);
    window.addEventListener("mouseleave", onL);

    let raf: number;
    const draw = () => {
      t.current += 0.006;
      const T = t.current;
      const { w, h } = dim.current;
      const sp = scroll;
      const mx = mouse.current.x;
      const my = mouse.current.y;
      ctx.clearRect(0, 0, w, h);

      // Update text targets when in crystallize phase
      const text = liveValue ? "$" + Math.round(liveValue).toLocaleString() : "";
      const inCrystallize = sp > 0.12 && sp < 0.42;

      if (inCrystallize && text && text !== lastText.current) {
        textPts.current = sampleText(text, w, h);
        lastText.current = text;
      }

      // Assign text targets to particles
      const pts = textPts.current;
      const particles = ps.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (inCrystallize && i < pts.length && pts.length > 0) {
          // This particle forms part of the number
          p.tx = pts[i][0];
          p.ty = pts[i][1];
          p.hasTarget = true;
        } else if (sp < 0.12) {
          // Scene 1: scattered, dim, drifting — behind the video
          p.tx = p.homeX + Math.sin(T * 0.3 + p.ph) * 40;
          p.ty = p.homeY + Math.cos(T * 0.2 + p.ph * 1.3) * 30;
          p.hasTarget = false;
        } else if (sp >= 0.42 && sp < 0.65) {
          // Scene 3: art — particles drift to edges, frame the center
          const edge = Math.random() > 0.5;
          if (!p.hasTarget) {
            const side = p.ph % 4;
            if (side < 1) { p.tx = Math.random() * w * 0.15; p.ty = Math.random() * h; }
            else if (side < 2) { p.tx = w - Math.random() * w * 0.15; p.ty = Math.random() * h; }
            else if (side < 3) { p.tx = Math.random() * w; p.ty = Math.random() * h * 0.12; }
            else { p.tx = Math.random() * w; p.ty = h - Math.random() * h * 0.12; }
            p.hasTarget = true;
          }
          p.tx += Math.sin(T * 0.4 + p.ph) * 3;
          p.ty += Math.cos(T * 0.3 + p.ph) * 3;
        } else if (sp >= 0.65 && sp < 0.85) {
          // Scene 4: party — particles converge to a slow orbit
          const cx = w * 0.5;
          const cy = h * 0.5;
          const a = p.ph + T * 0.08;
          const r = 200 + Math.sin(p.ph * 3) * 100;
          p.tx = cx + Math.cos(a) * r;
          p.ty = cy + Math.sin(a) * r;
          p.hasTarget = false;
        } else {
          // Scene 5: settle into grid
          p.tx = p.homeX + Math.sin(T * 0.15 + p.ph) * 4;
          p.ty = p.homeY + Math.cos(T * 0.1 + p.ph) * 4;
          p.hasTarget = false;
        }

        // Mouse repulsion
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let repelX = 0, repelY = 0;
        if (dist < 120) {
          const f = (120 - dist) / 120;
          repelX = (dx / dist) * f * 60;
          repelY = (dy / dist) * f * 60;
        }

        // Interpolate
        const speed = p.hasTarget && inCrystallize ? 0.06 : 0.025;
        p.x += (p.tx + repelX - p.x) * speed;
        p.y += (p.ty + repelY - p.y) * speed;

        // Alpha
        let targetA = 0.08;
        if (inCrystallize && i < pts.length) targetA = 0.6 + Math.sin(T * 2 + p.ph) * 0.2;
        else if (sp < 0.12) targetA = 0.04 + Math.sin(T * 0.5 + p.ph) * 0.03;
        else if (sp > 0.42) targetA = 0.1 + Math.sin(T * 0.5 + p.ph) * 0.05;
        if (dist < 120) targetA = Math.min(1, targetA + (120 - dist) / 120 * 0.5);
        p.alpha += (targetA - p.alpha) * 0.04;

        // Color: cool → warm as scroll progresses
        const hue = sp < 0.2 ? 220 : sp < 0.5 ? 40 : 25;
        const sat = sp < 0.2 ? 5 : sp < 0.5 ? 30 : 50;
        const lum = inCrystallize && i < pts.length ? 75 : 55;
        const sz = dist < 100 ? p.sz * (1 + (100 - dist) / 100 * 0.6) : p.sz;

        ctx.beginPath();
        ctx.arc(p.x, p.y, sz, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue},${sat}%,${lum}%,${p.alpha})`;
        ctx.fill();

        // Glow on crystallized particles
        if (inCrystallize && i < pts.length && p.alpha > 0.3) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, sz * 4, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${hue},${sat}%,${lum}%,${p.alpha * 0.06})`;
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onM);
      window.removeEventListener("mouseleave", onL);
    };
  }, [scroll, liveValue]);

  return ref;
}

/* ═══════════════════════════════
   PAGE — sticky-swap film strip
   ═══════════════════════════════ */

export default function DraftPage() {
  const [sp, setSp] = useState(0);
  const total = useLive();
  const d = days();
  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasRef = useCanvas(sp, total);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight;
      setSp(max > 0 ? el.scrollTop / max : 0);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Determine which scene is active
  const scene = sp < 0.12 ? 0 : sp < 0.42 ? 1 : sp < 0.65 ? 2 : sp < 0.85 ? 3 : 4;

  return (
    <div className="D">
      <style>{css}</style>

      {/* particle canvas — always visible, behind everything */}
      <canvas ref={canvasRef} className="D-cv" />

      {/* scroll rail — 500vh tall, drives everything */}
      <div className="D-rail" ref={scrollRef}>
        <div className="D-spacer" />
      </div>

      {/* sticky viewport — content swaps based on scene */}
      <div className="D-frame">

        {/* SCENE 0 — the video */}
        <div className={`D-scene ${scene === 0 ? "on" : ""}`}>
          <div className="D-vid-layout">
            <div className="D-vid-wrap">
              <iframe
                src="https://www.youtube.com/embed/hif5eI5pBxo?rel=0&modestbranding=1&iv_load_policy=3&color=white"
                className="D-vid"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                title="nothing, except everything."
              />
            </div>
            <div className="D-vid-attr">
              <p>&ldquo;nothing, except everything.&rdquo;</p>
              <span>wesley wang</span>
            </div>
          </div>
        </div>

        {/* SCENE 1 — the number (particles form it, DOM is fallback/mobile) */}
        <div className={`D-scene ${scene === 1 ? "on" : ""}`}>
          <div className="D-num-block">
            <span className="D-num-eye">live</span>
            {/* DOM fallback for mobile / before crystallization */}
            <h1 className="D-num" aria-live="polite">
              {total ? "$" + Math.round(total).toLocaleString() : "..."}
            </h1>
            <div className="D-num-goal">→ $100,000</div>
            <p className="D-num-days">
              <span className="D-num-d">{d}</span> days
            </p>
          </div>
        </div>

        {/* SCENE 2 — the art */}
        <div className={`D-scene ${scene === 2 ? "on" : ""}`}>
          <div className="D-art">
            <img src="/art/auction-piece.jpg" alt="The Tarantula" className="D-art-img" />
            <div className="D-art-info">
              <span className="D-art-lot">LOT 001</span>
              <h2>The Tarantula</h2>
              <p>backed by 10% · {total ? "$" + Math.round(total * 0.1).toLocaleString() : "..."}</p>
              <span className="D-art-bid">opening bid $25</span>
            </div>
          </div>
        </div>

        {/* SCENE 3 — the party */}
        <div className={`D-scene ${scene === 3 ? "on" : ""}`}>
          <div className="D-party">
            <p className="D-party-date">june 21, 2026</p>
            <h2 className="D-party-line">the party is the<br />liquidity event.</h2>
            <div className="D-party-row">
              <div className="D-party-n"><span>$100</span>invested</div>
              <div className="D-party-n"><span>$66</span>easter eggs</div>
              <div className="D-party-n">
                <span>{total ? "$" + Math.round(total * 0.1).toLocaleString() : "..."}</span>
                dividend pool
              </div>
            </div>
            <p className="D-party-stake">stake proportional to earliness × size</p>
          </div>
        </div>

        {/* SCENE 4 — the close */}
        <div className={`D-scene ${scene === 4 ? "on" : ""}`}>
          <div className="D-close">
            <a href="https://aureliex.com" target="_blank" rel="noopener noreferrer" className="D-close-word">
              aureliex
            </a>
            <p className="D-close-line">attention is what matters the most.</p>
          </div>
        </div>

      </div>
    </div>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=JetBrains+Mono:wght@400;500&display=swap');

  .D {
    position: fixed; inset: 0;
    background: #050505; color: #e8e4dc;
    overflow: hidden;
    -webkit-font-smoothing: antialiased;
  }

  /* particle canvas */
  .D-cv {
    position: fixed; inset: 0; z-index: 0;
    pointer-events: none;
  }

  /* invisible scroll rail */
  .D-rail {
    position: fixed; inset: 0; z-index: 3;
    overflow-y: auto;
    scrollbar-width: none;
  }
  .D-rail::-webkit-scrollbar { display: none; }
  .D-spacer { height: 500vh; }

  /* sticky viewport */
  .D-frame {
    position: fixed; inset: 0; z-index: 2;
    pointer-events: none;
  }

  /* scenes — hard cut */
  .D-scene {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    opacity: 0;
    transition: opacity 0.15s ease;
    pointer-events: none;
  }
  .D-scene.on {
    opacity: 1;
    pointer-events: auto;
  }

  /* ── SCENE 0: VIDEO ── */
  .D-vid-layout {
    display: flex; align-items: center; gap: 40px;
    padding: 0 8%;
    width: 100%;
  }
  .D-vid-wrap {
    flex: 0 0 65%; aspect-ratio: 16/9;
    border-radius: 2px; overflow: hidden;
    box-shadow: 0 0 100px rgba(0,0,0,0.5);
  }
  .D-vid { width: 100%; height: 100%; border: none; }
  .D-vid-attr {
    flex: 1;
    font-family: 'EB Garamond', Georgia, serif;
  }
  .D-vid-attr p {
    font-size: 18px; font-style: italic;
    color: rgba(232,228,220,0.3);
    margin: 0 0 8px; line-height: 1.5;
  }
  .D-vid-attr span {
    font-size: 13px; color: rgba(232,228,220,0.15);
    font-style: normal;
  }

  /* ── SCENE 1: NUMBER ── */
  .D-num-block {
    text-align: center;
    display: flex; flex-direction: column;
    align-items: center;
  }
  .D-num-eye {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; letter-spacing: 0.35em;
    text-transform: uppercase; color: #333;
    margin-bottom: 16px;
  }
  .D-num {
    font-family: "Helvetica Neue", "Arial", sans-serif;
    font-size: clamp(64px, 18vw, 260px);
    font-weight: 300;
    letter-spacing: -0.04em;
    line-height: 0.9;
    margin: 0;
    color: transparent;
    /* particles render the number — DOM is invisible on desktop */
  }
  .D-num-goal {
    font-family: "Helvetica Neue", "Arial", sans-serif;
    font-size: clamp(20px, 4vw, 40px);
    font-weight: 300;
    color: #222;
    margin-top: 12px;
    letter-spacing: -0.02em;
  }
  .D-num-days {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 15px; color: #333;
    font-style: italic; margin-top: 20px;
  }
  .D-num-d {
    font-family: "Helvetica Neue", sans-serif;
    font-size: 22px; font-weight: 400;
    color: #8B3A2E; font-style: normal;
    margin-right: 4px;
  }

  /* ── SCENE 2: ART ── */
  .D-art {
    position: relative;
    width: min(480px, 80vw);
    cursor: crosshair;
  }
  .D-art-img {
    width: 100%; display: block;
    border-radius: 2px;
    filter: brightness(0.8) contrast(1.05);
    transition: filter 0.6s;
  }
  .D-art:hover .D-art-img {
    filter: brightness(0.5) contrast(1.1);
  }
  .D-art-info {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 32px;
    opacity: 0; transition: opacity 0.4s;
    background: linear-gradient(transparent, rgba(0,0,0,0.8));
    font-family: 'EB Garamond', Georgia, serif;
  }
  .D-art:hover .D-art-info { opacity: 1; }
  .D-art-lot {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px; letter-spacing: 0.2em; color: #888;
    display: block; margin-bottom: 8px;
  }
  .D-art-info h2 {
    font-size: 28px; font-weight: 400; margin: 0 0 8px;
    font-family: "Helvetica Neue", sans-serif;
    letter-spacing: -0.02em;
  }
  .D-art-info p {
    font-size: 14px; color: #aaa; margin: 0 0 6px;
    font-style: italic;
  }
  .D-art-bid {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px; color: #C9A84C;
    letter-spacing: 0.05em;
  }

  /* ── SCENE 3: PARTY ── */
  .D-party {
    text-align: center;
    max-width: 500px;
  }
  .D-party-date {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; letter-spacing: 0.3em;
    color: #333; text-transform: uppercase;
    margin: 0 0 20px;
  }
  .D-party-line {
    font-family: "Helvetica Neue", "Arial", sans-serif;
    font-size: clamp(24px, 5vw, 40px);
    font-weight: 300;
    line-height: 1.25;
    letter-spacing: -0.02em;
    margin: 0 0 32px;
  }
  .D-party-row {
    display: flex; gap: 32px; justify-content: center;
    margin-bottom: 24px;
  }
  .D-party-n {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; color: #555;
    text-transform: uppercase; letter-spacing: 0.1em;
    display: flex; flex-direction: column; gap: 6px;
    align-items: center;
  }
  .D-party-n span {
    font-family: "Helvetica Neue", sans-serif;
    font-size: 24px; font-weight: 300;
    color: #e8e4dc; letter-spacing: -0.02em;
  }
  .D-party-stake {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 14px; color: #444;
    font-style: italic; margin: 0;
  }

  /* ── SCENE 4: CLOSE ── */
  .D-close {
    text-align: center;
  }
  .D-close-word {
    font-family: "Helvetica Neue", "Arial", sans-serif;
    font-size: 18px; font-weight: 400;
    letter-spacing: 0.15em; color: #333;
    text-decoration: none;
    transition: color 0.3s;
    display: block; margin-bottom: 20px;
  }
  .D-close-word:hover { color: #e8e4dc; }
  .D-close-line {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 15px; font-style: italic;
    color: #222; margin: 0;
  }

  /* ── RESPONSIVE ── */
  @media (max-width: 768px) {
    .D-vid-layout {
      flex-direction: column; gap: 20px;
      padding: 0 16px;
    }
    .D-vid-wrap { flex: none; width: 100%; }
    .D-vid-attr { text-align: center; }
    .D-num { color: rgba(232,228,220,0.8); font-size: clamp(48px, 14vw, 120px); }
    /* mobile: show DOM text since particles don't crystallize */
    .D-party-row { gap: 20px; flex-wrap: wrap; }
  }
`;
