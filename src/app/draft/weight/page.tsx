"use client";

import { useState, useRef, useEffect, useCallback } from "react";

/* ── holdings ── */
const H = [
  { t: "QTUM", s: 5.584, e: 679.74 },
  { t: "MSFT", s: 1.036, e: 407.87 },
  { t: "GOOG", s: 1.235, e: 407.17 },
  { t: "IONQ", s: 9.489, e: 416.85 },
  { t: "IBM",  s: 1.553, e: 373.33 },
  { t: "NVDA", s: 1.773, e: 344.49 },
  { t: "CEG",  s: 1.148, e: 339.05 },
  { t: "RGTI", s: 9.938, e: 169.50 },
  { t: "SGOV", s: 2.625, e: 263.94 },
  { t: "QBTS", s: 5.951, e: 101.65 },
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
        let s = 296.57; // 46.57 pending_cash + 250 prediction_offset
        for (const h of H) {
          const d = j.data[h.t];
          s += d?.closes?.length > 0 ? h.s * d.closes[d.closes.length - 1] : h.e;
        }
        setV(s);
      } catch { /* silent */ }
    };
    go();
    const id = setInterval(go, 30_000);
    return () => { on = false; clearInterval(id); };
  }, []);
  return v;
}

function daysLeft() {
  return Math.max(0, Math.ceil((new Date("2026-06-21").getTime() - Date.now()) / 86_400_000));
}

/* ── strata / history milestones ── */
const STRATA = [
  { day: 1,  val: "$3,453", note: "started" },
  { day: 3,  val: "$3,510", note: "first rebalance" },
  { day: 7,  val: "$3,480", note: "first agent disagreement" },
  { day: 14, val: "$3,900", note: "drawdown. published it anyway." },
  { day: 21, val: "$4,050", note: "tension field essay" },
  { day: 28, val: "$4,200", note: "monte carlo says 27.8%" },
  { day: 35, val: "$4,127", note: "you are here" },
];

/* day-over-day delta: positive or negative for band color */
const DAY_DELTAS = [
  1, 1, -1, 1, 1, -1, 1, 1, 1, -1,
  1, -1, -1, 1, 1, 1, -1, 1, 1, 1,
  -1, 1, 1, 1, -1, -1, 1, 1, 1, -1,
  1, 1, -1, 1, 1,
];

const GOAL = 100_000;
const PARTICLE_COUNT = 2000;

/* ── particle type ── */
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
}

export default function WeightPage() {
  const total = useLive();
  const dl = daysLeft();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const scrollRef = useRef(0);
  const animRef = useRef<number>(0);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setFadeIn(true), 100);
    return () => clearTimeout(t);
  }, []);

  /* scroll tracking */
  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight;
      scrollRef.current = max > 0 ? el.scrollTop / max : 0;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  /* mouse tracking */
  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);
  const onMouseLeave = useCallback(() => {
    mouseRef.current = null;
  }, []);

  /* canvas animation */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const onResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    window.addEventListener("resize", onResize);

    /* init particles */
    const particles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h * 0.6,
        vx: (Math.random() - 0.5) * 0.3,
        vy: Math.random() * 0.2,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.6 + 0.2,
      });
    }
    particlesRef.current = particles;

    /* color interpolation */
    const amberR = 201, amberG = 168, amberB = 76;  // #C9A84C
    const blueR = 62,  blueG = 72,  blueB = 82;    // #3E4852

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const frame = () => {
      ctx.clearRect(0, 0, w, h);

      const scroll = scrollRef.current;
      const cameraY = scroll * h * 3; // camera descends through 3x viewport

      /* current value ratio: 0 = at goal, 1 = at $0 */
      const currentVal = total ?? 4127;
      const ratio = Math.max(0, Math.min(1, 1 - currentVal / GOAL));

      /* focal point (the goal) */
      const focalX = w / 2;
      const focalY = h * 3.5; // far below viewport

      /* draw strata bands behind particles */
      const totalBands = DAY_DELTAS.length;
      const bandHeight = (h * 3) / totalBands;
      for (let i = 0; i < totalBands; i++) {
        const bandTop = h * 0.5 + i * bandHeight - cameraY;
        if (bandTop > h || bandTop + bandHeight < 0) continue;
        const isUp = DAY_DELTAS[i] > 0;
        ctx.fillStyle = isUp ? "rgba(42,58,26,0.3)" : "rgba(58,26,26,0.3)";
        ctx.fillRect(0, bandTop, w, bandHeight);
      }

      /* draw strata text */
      if (w > 600) {
        ctx.font = "11px 'JetBrains Mono', monospace";
        ctx.textAlign = "center";
        for (const s of STRATA) {
          const yPos = h * 0.5 + ((s.day - 1) / totalBands) * (h * 3) - cameraY;
          if (yPos < 40 || yPos > h - 20) continue;
          ctx.fillStyle = "rgba(232,228,220,0.5)";
          const label = s.val
            ? `day ${s.day} \u00b7 ${s.val} \u00b7 ${s.note}`
            : `day ${s.day} \u00b7 ${s.note}`;
          ctx.fillText(label, w / 2, yPos);
        }
      }

      /* funnel / well outline */
      ctx.beginPath();
      ctx.strokeStyle = "rgba(201,168,76,0.06)";
      ctx.lineWidth = 1;
      const funnelSteps = 60;
      for (let i = 0; i <= funnelSteps; i++) {
        const t = i / funnelSteps;
        const y = h * 0.2 + t * h * 3 - cameraY;
        const spread = (1 - t * 0.85) * w * 0.45;
        if (i === 0) {
          ctx.moveTo(w / 2 - spread, y);
        } else {
          ctx.lineTo(w / 2 - spread, y);
        }
      }
      for (let i = funnelSteps; i >= 0; i--) {
        const t = i / funnelSteps;
        const y = h * 0.2 + t * h * 3 - cameraY;
        const spread = (1 - t * 0.85) * w * 0.45;
        ctx.lineTo(w / 2 + spread, y);
      }
      ctx.closePath();
      ctx.stroke();

      /* update and draw particles */
      const mouse = mouseRef.current;

      for (const p of particles) {
        /* gravity toward focal point */
        const dx = focalX - p.x;
        const dy = (focalY - cameraY) - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy) + 1;
        const force = 80 / (dist * dist) * dist;
        const ax = (dx / dist) * force * 0.00004;
        const ay = (dy / dist) * force * 0.00006;

        p.vx += ax;
        p.vy += ay;

        /* funnel constraint: push particles inward toward center column */
        const normalizedY = (p.y + cameraY) / (h * 3.5);
        const maxSpread = (1 - normalizedY * 0.85) * w * 0.4;
        const distFromCenter = Math.abs(p.x - w / 2);
        if (distFromCenter > maxSpread) {
          p.vx += (w / 2 - p.x) * 0.002;
        }

        /* mouse repulsion */
        if (mouse) {
          const mdx = p.x - mouse.x;
          const mdy = p.y - mouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 120) {
            const repulse = (120 - mdist) / 120;
            p.vx += (mdx / mdist) * repulse * 0.8;
            p.vy += (mdy / mdist) * repulse * 0.8;
          }
        }

        /* damping + jitter */
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.vx += (Math.random() - 0.5) * 0.08;
        p.vy += (Math.random() - 0.5) * 0.04;

        p.x += p.vx;
        p.y += p.vy;

        /* respawn if out of bounds */
        if (p.y > h + 50 || p.y < -50 || p.x < -50 || p.x > w + 50) {
          p.x = w * 0.2 + Math.random() * w * 0.6;
          p.y = Math.random() * h * 0.3;
          p.vx = (Math.random() - 0.5) * 0.3;
          p.vy = Math.random() * 0.2;
        }

        /* color: amber near top, blue near bottom */
        const colorT = Math.min(1, Math.max(0, p.y / h));
        const r = Math.round(lerp(amberR, blueR, colorT));
        const g = Math.round(lerp(amberG, blueG, colorT));
        const b = Math.round(lerp(amberB, blueB, colorT));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${p.alpha * (1 - scroll * 0.3)})`;
        ctx.fill();
      }

      /* goal text at bottom of well */
      const goalY = h * 3.5 - cameraY;
      if (goalY > 0 && goalY < h + 50) {
        ctx.font = "24px 'EB Garamond', serif";
        ctx.textAlign = "center";
        ctx.fillStyle = `rgba(232,228,220,${Math.max(0, 0.15 + scroll * 0.4)})`;
        ctx.fillText("$100,000", w / 2, goalY);
      }

      animRef.current = requestAnimationFrame(frame);
    };

    animRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [total]);

  const display = total !== null ? `$${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "...";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#050505",
        overflow: "hidden",
      }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500&family=JetBrains+Mono:wght@300;400&display=swap');
        .w-root { position: fixed; inset: 0; }
        .w-canvas { position: fixed; inset: 0; z-index: 1; }
        .w-rail {
          position: fixed; inset: 0; z-index: 2;
          overflow-y: scroll; overflow-x: hidden;
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .w-rail::-webkit-scrollbar { display: none; }
        .w-hud {
          position: fixed; top: 0; left: 0; right: 0;
          z-index: 10; pointer-events: none;
          display: flex; flex-direction: column;
          align-items: center;
          padding-top: min(12vh, 80px);
        }
        .w-value {
          font-family: 'EB Garamond', serif;
          font-size: clamp(36px, 8vw, 72px);
          font-weight: 400;
          color: #e8e4dc;
          letter-spacing: 0.02em;
          opacity: 0;
          transition: opacity 1.5s ease;
        }
        .w-value.visible { opacity: 1; }
        .w-meta {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 300;
          color: rgba(232,228,220,0.4);
          margin-top: 8px;
          letter-spacing: 0.08em;
          opacity: 0;
          transition: opacity 2s ease 0.5s;
        }
        .w-meta.visible { opacity: 1; }
      `}</style>

      {/* canvas */}
      <canvas ref={canvasRef} className="w-canvas" />

      {/* scroll rail */}
      <div ref={railRef} className="w-rail">
        <div style={{ height: "400vh" }} />
      </div>

      {/* HUD */}
      <div className="w-hud">
        <div className={`w-value${fadeIn ? " visible" : ""}`}>{display}</div>
        <div className={`w-meta${fadeIn ? " visible" : ""}`}>
          live &middot; {dl} days left
        </div>
      </div>
    </div>
  );
}
