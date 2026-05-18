"use client";

import { useState, useRef, useEffect, useCallback } from "react";

/* ── holdings & live price fetch ── */
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

/* ── physarum simulation ── */

const SENSOR_DIST = 9;
const SENSOR_ANGLE = Math.PI / 4;
const TURN_SPEED = 0.3;
const STEP_SIZE = 1.0;
const DEPOSIT_BASE = 0.4;
const DEPOSIT_TEXT = 1.2;
const DECAY = 0.97;
const MOUSE_RADIUS = 80;
const MOUSE_DEPOSIT = 3.0;

// Color ramp: 0->#0a0a0a, 0.3->#1a1408, 0.6->#8b6914, 1.0->#f0d890
function buildColorRamp(): Uint8Array {
  const ramp = new Uint8Array(256 * 3);
  const stops = [
    { p: 0,    r: 10, g: 10, b: 10 },
    { p: 0.3,  r: 26, g: 20, b: 8 },
    { p: 0.6,  r: 139, g: 105, b: 20 },
    { p: 1.0,  r: 240, g: 216, b: 144 },
  ];
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    let s0 = stops[0], s1 = stops[1];
    for (let j = 1; j < stops.length; j++) {
      if (t <= stops[j].p) { s0 = stops[j - 1]; s1 = stops[j]; break; }
    }
    const frac = s1.p === s0.p ? 0 : (t - s0.p) / (s1.p - s0.p);
    ramp[i * 3]     = Math.round(s0.r + (s1.r - s0.r) * frac);
    ramp[i * 3 + 1] = Math.round(s0.g + (s1.g - s0.g) * frac);
    ramp[i * 3 + 2] = Math.round(s0.b + (s1.b - s0.b) * frac);
  }
  return ramp;
}

class PhysarumSim {
  w: number;
  h: number;
  count: number;
  ax: Float32Array;  // agent x
  ay: Float32Array;  // agent y
  aa: Float32Array;  // agent angle
  trail: Float32Array;
  trailB: Float32Array; // blur buffer
  textMask: Uint8Array;
  colorRamp: Uint8Array;
  mouseX = -1000;
  mouseY = -1000;

  constructor(w: number, h: number, count: number) {
    this.w = w;
    this.h = h;
    this.count = count;
    this.ax = new Float32Array(count);
    this.ay = new Float32Array(count);
    this.aa = new Float32Array(count);
    this.trail = new Float32Array(w * h);
    this.trailB = new Float32Array(w * h);
    this.textMask = new Uint8Array(w * h);
    this.colorRamp = buildColorRamp();

    // scatter agents from center
    const cx = w / 2, cy = h / 2;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * Math.min(w, h) * 0.4;
      this.ax[i] = cx + Math.cos(angle) * r;
      this.ay[i] = cy + Math.sin(angle) * r;
      this.aa[i] = Math.random() * Math.PI * 2;
    }
  }

  sense(x: number, y: number): number {
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (ix < 0 || ix >= this.w || iy < 0 || iy >= this.h) return 0;
    return this.trail[iy * this.w + ix];
  }

  step() {
    const { w, h, count, ax, ay, aa, trail, textMask } = this;

    // -- mouse injection --
    if (this.mouseX >= 0 && this.mouseX < w && this.mouseY >= 0 && this.mouseY < h) {
      const mx = Math.round(this.mouseX);
      const my = Math.round(this.mouseY);
      const r = MOUSE_RADIUS;
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const px = mx + dx, py = my + dy;
          if (px < 0 || px >= w || py < 0 || py >= h) continue;
          const d2 = dx * dx + dy * dy;
          if (d2 < r * r) {
            const falloff = 1 - Math.sqrt(d2) / r;
            trail[py * w + px] = Math.min(1, trail[py * w + px] + MOUSE_DEPOSIT * falloff * 0.1);
          }
        }
      }
    }

    // -- update agents --
    for (let i = 0; i < count; i++) {
      const x = ax[i], y = ay[i], a = aa[i];

      // sense 3 directions
      const fc = this.sense(
        x + Math.cos(a) * SENSOR_DIST,
        y + Math.sin(a) * SENSOR_DIST
      );
      const fl = this.sense(
        x + Math.cos(a - SENSOR_ANGLE) * SENSOR_DIST,
        y + Math.sin(a - SENSOR_ANGLE) * SENSOR_DIST
      );
      const fr = this.sense(
        x + Math.cos(a + SENSOR_ANGLE) * SENSOR_DIST,
        y + Math.sin(a + SENSOR_ANGLE) * SENSOR_DIST
      );

      // steer
      let newA = a;
      if (fc >= fl && fc >= fr) {
        // go straight
      } else if (fl > fr) {
        newA -= TURN_SPEED;
      } else if (fr > fl) {
        newA += TURN_SPEED;
      } else {
        newA += (Math.random() - 0.5) * TURN_SPEED;
      }

      // mouse attraction
      if (this.mouseX >= 0) {
        const mdx = this.mouseX - x;
        const mdy = this.mouseY - y;
        const md = Math.sqrt(mdx * mdx + mdy * mdy);
        if (md < MOUSE_RADIUS * 2 && md > 0.1) {
          const toMouse = Math.atan2(mdy, mdx);
          let da = toMouse - newA;
          while (da > Math.PI) da -= Math.PI * 2;
          while (da < -Math.PI) da += Math.PI * 2;
          newA += da * 0.1 * (1 - md / (MOUSE_RADIUS * 2));
        }
      }

      // move
      let nx = x + Math.cos(newA) * STEP_SIZE;
      let ny = y + Math.sin(newA) * STEP_SIZE;

      // wrap
      if (nx < 0) nx += w;
      else if (nx >= w) nx -= w;
      if (ny < 0) ny += h;
      else if (ny >= h) ny -= h;

      ax[i] = nx;
      ay[i] = ny;
      aa[i] = newA;

      // deposit
      const ix = Math.round(nx);
      const iy = Math.round(ny);
      if (ix >= 0 && ix < w && iy >= 0 && iy < h) {
        const idx = iy * w + ix;
        const deposit = textMask[idx] > 0 ? DEPOSIT_TEXT : DEPOSIT_BASE;
        trail[idx] = Math.min(1, trail[idx] + deposit * 0.05);
      }
    }

    // -- diffuse + decay (2-pass box blur) --
    this.blur();
  }

  blur() {
    const { w, h, trail, trailB } = this;

    // horizontal pass
    for (let y = 0; y < h; y++) {
      const row = y * w;
      for (let x = 0; x < w; x++) {
        const l = x > 0 ? trail[row + x - 1] : trail[row + x];
        const c = trail[row + x];
        const r = x < w - 1 ? trail[row + x + 1] : trail[row + x];
        trailB[row + x] = (l + c + r) / 3;
      }
    }

    // vertical pass + decay
    for (let y = 0; y < h; y++) {
      const row = y * w;
      const above = y > 0 ? (y - 1) * w : row;
      const below = y < h - 1 ? (y + 1) * w : row;
      for (let x = 0; x < w; x++) {
        const t = trailB[above + x];
        const c = trailB[row + x];
        const b = trailB[below + x];
        // text areas decay slower
        const idx = row + x;
        const d = this.textMask[idx] > 0 ? 0.99 : DECAY;
        trail[idx] = ((t + c + b) / 3) * d;
      }
    }
  }

  render(imageData: ImageData) {
    const { w, h, trail, colorRamp } = this;
    const data = imageData.data;
    for (let i = 0; i < w * h; i++) {
      const v = Math.min(255, Math.round(trail[i] * 255));
      const ci = v * 3;
      const di = i * 4;
      data[di]     = colorRamp[ci];
      data[di + 1] = colorRamp[ci + 1];
      data[di + 2] = colorRamp[ci + 2];
      data[di + 3] = 255;
    }
  }
}

/* ── component ── */

export default function InkPage() {
  const total = useLive();
  const d = daysLeft();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<PhysarumSim | null>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const textRef = useRef<HTMLDivElement>(null);

  const handleMouse = useCallback((e: MouseEvent) => {
    mouseRef.current.x = e.clientX;
    mouseRef.current.y = e.clientY;
  }, []);

  const handleTouch = useCallback((e: TouchEvent) => {
    if (e.touches.length > 0) {
      mouseRef.current.x = e.touches[0].clientX;
      mouseRef.current.y = e.touches[0].clientY;
    }
  }, []);

  // build text mask from DOM text positions
  const updateTextMask = useCallback(() => {
    const sim = simRef.current;
    const textEl = textRef.current;
    if (!sim || !textEl) return;

    // Clear
    sim.textMask.fill(0);

    // Render text to offscreen canvas for mask
    const offscreen = document.createElement("canvas");
    offscreen.width = sim.w;
    offscreen.height = sim.h;
    const octx = offscreen.getContext("2d");
    if (!octx) return;

    octx.fillStyle = "#000";
    octx.fillRect(0, 0, sim.w, sim.h);

    // Draw text at the same positions as the DOM elements
    const children = textEl.querySelectorAll("[data-ink]");
    children.forEach((child) => {
      const rect = (child as HTMLElement).getBoundingClientRect();
      const style = getComputedStyle(child as HTMLElement);
      octx.font = style.font;
      octx.fillStyle = "#fff";
      octx.textAlign = "center";
      octx.textBaseline = "middle";
      const text = (child as HTMLElement).textContent || "";
      octx.fillText(text, rect.left + rect.width / 2, rect.top + rect.height / 2);
    });

    const id = octx.getImageData(0, 0, sim.w, sim.h);
    for (let i = 0; i < sim.w * sim.h; i++) {
      sim.textMask[i] = id.data[i * 4] > 40 ? 1 : 0;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = 1; // use 1:1 for perf
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    const isMobile = w < 768;
    const agentCount = isMobile ? 2000 : 5000;

    const sim = new PhysarumSim(w, h, agentCount);
    simRef.current = sim;

    // delay text mask until fonts load and DOM settles
    const maskTimer = setTimeout(() => updateTextMask(), 500);
    const maskTimer2 = setTimeout(() => updateTextMask(), 2000);

    window.addEventListener("mousemove", handleMouse);
    window.addEventListener("touchmove", handleTouch, { passive: true });

    const imageData = ctx.createImageData(w, h);

    let running = true;
    const loop = () => {
      if (!running) return;

      sim.mouseX = mouseRef.current.x;
      sim.mouseY = mouseRef.current.y;

      // 2 sub-steps per frame for density
      sim.step();
      sim.step();

      sim.render(imageData);
      ctx.putImageData(imageData, 0, 0);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
      clearTimeout(maskTimer);
      clearTimeout(maskTimer2);
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("touchmove", handleTouch);
    };
  }, [handleMouse, handleTouch, updateTextMask]);

  // re-generate mask when total changes (text content changes)
  useEffect(() => {
    const t = setTimeout(() => updateTextMask(), 100);
    return () => clearTimeout(t);
  }, [total, updateTextMask]);

  const fmt = (n: number) =>
    "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <>
      {/* Google Fonts */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500&family=JetBrains+Mono:wght@300;400&display=swap"
      />

      {/* simulation canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          background: "#050505",
          display: "block",
        }}
      />

      {/* DOM overlay */}
      <div
        ref={textRef}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          gap: 12,
        }}
      >
        {/* portfolio value */}
        <div
          data-ink
          style={{
            fontFamily: "'EB Garamond', serif",
            fontSize: "clamp(48px, 10vw, 120px)",
            fontWeight: 400,
            color: "#f0d890",
            letterSpacing: "-0.02em",
            lineHeight: 1,
            textShadow: "0 0 40px rgba(139,105,20,0.3)",
          }}
        >
          {total !== null ? fmt(total) : "$..."}
        </div>

        {/* days left */}
        <div
          data-ink
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "clamp(14px, 2vw, 20px)",
            fontWeight: 300,
            color: "rgba(240,216,144,0.6)",
            letterSpacing: "0.05em",
          }}
        >
          {d} days left
        </div>

        {/* target */}
        <div
          data-ink
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "clamp(12px, 1.5vw, 16px)",
            fontWeight: 300,
            color: "rgba(240,216,144,0.2)",
            letterSpacing: "0.1em",
            marginTop: 4,
          }}
        >
          {"\u2192"} $100,000
        </div>

        {/* aureliex.com */}
        <a
          href="https://aureliex.com"
          target="_blank"
          rel="noopener noreferrer"
          data-ink
          style={{
            position: "fixed",
            bottom: 40,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "clamp(11px, 1.2vw, 14px)",
            fontWeight: 300,
            color: "rgba(240,216,144,0.12)",
            letterSpacing: "0.15em",
            textDecoration: "none",
            pointerEvents: "auto",
            transition: "color 0.5s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(240,216,144,0.4)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(240,216,144,0.12)")}
        >
          aureliex.com
        </a>
      </div>
    </>
  );
}
