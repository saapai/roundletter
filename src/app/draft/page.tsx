"use client";

import { useState, useRef, useEffect, useCallback } from "react";

/* ── portfolio holdings ── */
const HOLDINGS = [
  { t: "QTUM", s: 5.584, fb: 679.74 },
  { t: "MSFT", s: 1.036, fb: 407.87 },
  { t: "GOOG", s: 1.235, fb: 407.17 },
  { t: "IONQ", s: 9.489, fb: 416.85 },
  { t: "IBM",  s: 1.553, fb: 373.33 },
  { t: "NVDA", s: 1.773, fb: 344.49 },
  { t: "CEG",  s: 1.148, fb: 339.05 },
  { t: "RGTI", s: 9.938, fb: 169.50 },
  { t: "SGOV", s: 2.625, fb: 263.94 },
  { t: "QBTS", s: 5.951, fb: 101.65 },
];
const PENDING_CASH = 46.57;
const PREDICTION_OFFSET = 250;
const TARGET = 100_000;
const DEADLINE = new Date("2026-06-21");
const VIDEO_ID = "REPLACE_WITH_VIDEO_ID";

/* ── live price hook ── */
function useLive(): number | null {
  const [v, setV] = useState<number | null>(null);
  useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const r = await fetch("/api/prices", { cache: "no-store" });
        if (!r.ok || !alive) return;
        const j = await r.json();
        if (!j?.hasData || !alive) return;
        let sum = PENDING_CASH + PREDICTION_OFFSET;
        for (const h of HOLDINGS) {
          const d = j.data[h.t];
          sum += d?.closes?.length > 0 ? h.s * d.closes[d.closes.length - 1] : h.fb;
        }
        if (alive) setV(sum);
      } catch { /* swallow */ }
    };
    poll();
    const id = setInterval(poll, 30_000);
    return () => { alive = false; clearInterval(id); };
  }, []);
  return v;
}

function daysLeft(): number {
  return Math.max(0, Math.ceil((DEADLINE.getTime() - Date.now()) / 86_400_000));
}

/* ── lerp / clamp helpers ── */
function lerp(a: number, b: number, t: number): number { return a + (b - a) * t; }
function clamp01(x: number): number { return Math.max(0, Math.min(1, x)); }
function remap(x: number, inLo: number, inHi: number, outLo: number, outHi: number): number {
  return lerp(outLo, outHi, clamp01((x - inLo) / (inHi - inLo)));
}

/* ══════════════════════════════════════════════════════
   PHYSARUM SIMULATION
   ══════════════════════════════════════════════════════ */

interface PhysarumState {
  width: number;
  height: number;
  agentCount: number;
  ax: Float32Array; // x positions
  ay: Float32Array; // y positions
  aa: Float32Array; // angles
  trail: Float32Array; // trail map (width * height)
  trailB: Float32Array; // diffusion buffer
}

function createPhysarum(w: number, h: number, count: number): PhysarumState {
  const ax = new Float32Array(count);
  const ay = new Float32Array(count);
  const aa = new Float32Array(count);
  const cx = w / 2, cy = h / 2;
  for (let i = 0; i < count; i++) {
    const r = Math.random() * Math.min(w, h) * 0.4;
    const a = Math.random() * Math.PI * 2;
    ax[i] = cx + Math.cos(a) * r;
    ay[i] = cy + Math.sin(a) * r;
    aa[i] = Math.random() * Math.PI * 2;
  }
  return {
    width: w, height: h, agentCount: count,
    ax, ay, aa,
    trail: new Float32Array(w * h),
    trailB: new Float32Array(w * h),
  };
}

function resizePhysarum(ps: PhysarumState, newCount: number): void {
  if (newCount <= ps.agentCount) {
    ps.agentCount = newCount;
    return;
  }
  const cx = ps.width / 2, cy = ps.height / 2;
  if (newCount > ps.ax.length) {
    const nax = new Float32Array(newCount);
    const nay = new Float32Array(newCount);
    const naa = new Float32Array(newCount);
    nax.set(ps.ax); nay.set(ps.ay); naa.set(ps.aa);
    for (let i = ps.ax.length; i < newCount; i++) {
      const r = Math.random() * Math.min(ps.width, ps.height) * 0.4;
      const a = Math.random() * Math.PI * 2;
      nax[i] = cx + Math.cos(a) * r;
      nay[i] = cy + Math.sin(a) * r;
      naa[i] = Math.random() * Math.PI * 2;
    }
    ps.ax = nax; ps.ay = nay; ps.aa = naa;
  } else {
    for (let i = ps.agentCount; i < newCount; i++) {
      const r = Math.random() * Math.min(ps.width, ps.height) * 0.4;
      const a = Math.random() * Math.PI * 2;
      ps.ax[i] = cx + Math.cos(a) * r;
      ps.ay[i] = cy + Math.sin(a) * r;
      ps.aa[i] = Math.random() * Math.PI * 2;
    }
  }
  ps.agentCount = newCount;
}

function stepPhysarum(
  ps: PhysarumState,
  videoRect: { x: number; y: number; w: number; h: number } | null,
  textMask: Uint8Array | null,
  mouseX: number, mouseY: number, mouseActive: boolean,
  depositBurst: boolean,
): void {
  const { width: W, height: H, trail, agentCount } = ps;
  const sensorDist = 9;
  const sensorAngle = 0.3;
  const stepSize = 1.2;
  const depositAmt = depositBurst ? 1.5 : 0.5;

  // Step agents
  for (let i = 0; i < agentCount; i++) {
    let x = ps.ax[i], y = ps.ay[i], a = ps.aa[i];

    // Sense at three forward points
    const sl = senseAt(trail, W, H, x, y, a - sensorAngle, sensorDist);
    const sc = senseAt(trail, W, H, x, y, a, sensorDist);
    const sr = senseAt(trail, W, H, x, y, a + sensorAngle, sensorDist);

    if (sc >= sl && sc >= sr) {
      // keep going
    } else if (sl > sr) {
      a -= sensorAngle * 0.5;
    } else if (sr > sl) {
      a += sensorAngle * 0.5;
    } else {
      a += (Math.random() - 0.5) * sensorAngle;
    }

    // Random jitter
    a += (Math.random() - 0.5) * 0.1;

    let nx = x + Math.cos(a) * stepSize;
    let ny = y + Math.sin(a) * stepSize;

    // Wrap at edges
    if (nx < 0) nx += W;
    if (nx >= W) nx -= W;
    if (ny < 0) ny += H;
    if (ny >= H) ny -= H;

    // Video mask: bounce agents away from video rect
    if (videoRect) {
      const vx = videoRect.x, vy = videoRect.y, vw = videoRect.w, vh = videoRect.h;
      const margin = 4;
      if (nx >= vx - margin && nx <= vx + vw + margin && ny >= vy - margin && ny <= vy + vh + margin) {
        a = Math.random() * Math.PI * 2;
        nx = x;
        ny = y;
      }
    }

    ps.ax[i] = nx;
    ps.ay[i] = ny;
    ps.aa[i] = a;

    // Deposit
    const ix = Math.floor(nx) | 0;
    const iy = Math.floor(ny) | 0;
    if (ix >= 0 && ix < W && iy >= 0 && iy < H) {
      const idx = iy * W + ix;
      let dep = depositAmt;
      // Text mask: deposit more near text
      if (textMask && textMask[idx] > 0) {
        dep *= 2.5;
      }
      trail[idx] = Math.min(1, trail[idx] + dep);
    }
  }

  // Mouse injection
  if (mouseActive && mouseX >= 0 && mouseX < W && mouseY >= 0 && mouseY < H) {
    const r = 12;
    const mix = Math.floor(mouseX);
    const miy = Math.floor(mouseY);
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy > r * r) continue;
        const px = mix + dx, py = miy + dy;
        if (px >= 0 && px < W && py >= 0 && py < H) {
          trail[py * W + px] = Math.min(1, trail[py * W + px] + 0.3);
        }
      }
    }
  }

  // Diffuse + decay
  const { trailB } = ps;
  const decay = 0.97;
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const idx = y * W + x;
      let sum = trail[idx] * 4
        + trail[idx - 1] + trail[idx + 1]
        + trail[idx - W] + trail[idx + W];
      sum /= 8;
      // Text mask: slower decay near text
      const d = (textMask && textMask[idx] > 0) ? 0.99 : decay;
      trailB[idx] = sum * d;
    }
  }
  // Swap
  ps.trail = trailB;
  ps.trailB = trail;
}

function senseAt(trail: Float32Array, W: number, H: number, x: number, y: number, angle: number, dist: number): number {
  const sx = Math.floor(x + Math.cos(angle) * dist);
  const sy = Math.floor(y + Math.sin(angle) * dist);
  if (sx < 0 || sx >= W || sy < 0 || sy >= H) return 0;
  return trail[sy * W + sx];
}

function renderTrail(ctx: CanvasRenderingContext2D, trail: Float32Array, W: number, H: number): void {
  const img = ctx.createImageData(W, H);
  const d = img.data;
  // Color ramp: #0a0a0a → #1a1408 → #8b6914 → #f0d890
  for (let i = 0; i < W * H; i++) {
    const v = trail[i];
    const o = i * 4;
    if (v < 0.01) {
      d[o] = 10; d[o + 1] = 10; d[o + 2] = 10;
    } else if (v < 0.15) {
      const t = v / 0.15;
      d[o]     = lerp(10, 26, t) | 0;
      d[o + 1] = lerp(10, 20, t) | 0;
      d[o + 2] = lerp(10, 8, t) | 0;
    } else if (v < 0.5) {
      const t = (v - 0.15) / 0.35;
      d[o]     = lerp(26, 139, t) | 0;
      d[o + 1] = lerp(20, 105, t) | 0;
      d[o + 2] = lerp(8, 20, t) | 0;
    } else {
      const t = (v - 0.5) / 0.5;
      d[o]     = lerp(139, 240, t) | 0;
      d[o + 1] = lerp(105, 216, t) | 0;
      d[o + 2] = lerp(20, 144, t) | 0;
    }
    d[o + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}

/* ══════════════════════════════════════════════════════
   PAGE COMPONENT
   ══════════════════════════════════════════════════════ */

export default function DraftPage() {
  const total = useLive();
  const d = daysLeft();

  /* refs */
  const railRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textCanvasRef = useRef<HTMLCanvasElement>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const psRef = useRef<PhysarumState | null>(null);
  const spRef = useRef(0);
  const mouseRef = useRef({ x: -1, y: -1, active: false });
  const burstRef = useRef(0); // burst timer (frames)
  const rafRef = useRef(0);

  /* vote state */
  const [voted, setVoted] = useState<string | null>(null);
  const [votes, setVotes] = useState({ yes: 47, no: 12 });
  const [sp, setSp] = useState(0);

  // Load vote from localStorage
  useEffect(() => {
    const v = localStorage.getItem("draft-vote");
    if (v) setVoted(v);
    const vc = localStorage.getItem("draft-votes");
    if (vc) {
      try { setVotes(JSON.parse(vc)); } catch { /* ignore */ }
    }
  }, []);

  const castVote = useCallback((choice: string) => {
    if (voted) return;
    setVoted(choice);
    localStorage.setItem("draft-vote", choice);
    const nv = { ...votes, [choice]: votes[choice as keyof typeof votes] + 1 };
    setVotes(nv);
    localStorage.setItem("draft-votes", JSON.stringify(nv));
    burstRef.current = 120; // 2 seconds at 60fps
  }, [voted, votes]);

  /* scroll tracking */
  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight;
      const s = max > 0 ? el.scrollTop / max : 0;
      spRef.current = s;
      setSp(s);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  /* mouse tracking (for physarum injection) */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const c = canvasRef.current;
      if (!c) return;
      const rect = c.getBoundingClientRect();
      const scaleX = c.width / rect.width;
      const scaleY = c.height / rect.height;
      mouseRef.current = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
        active: true,
      };
    };
    const onLeave = () => { mouseRef.current.active = false; };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseleave", onLeave); };
  }, []);

  /* text mask for physarum */
  const buildTextMask = useCallback((W: number, H: number, numStr: string): Uint8Array => {
    const mask = new Uint8Array(W * H);
    const tc = textCanvasRef.current;
    if (!tc) return mask;
    tc.width = W;
    tc.height = H;
    const ctx = tc.getContext("2d");
    if (!ctx) return mask;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#fff";
    ctx.font = `500 ${Math.floor(W * 0.14)}px "EB Garamond", Georgia, serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(numStr, W / 2, H / 2);
    const id = ctx.getImageData(0, 0, W, H);
    for (let i = 0; i < W * H; i++) {
      if (id.data[i * 4 + 3] > 128) mask[i] = 1;
    }
    return mask;
  }, []);

  /* main animation loop */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // Size canvas to CSS pixel grid (half-res for perf)
    const resize = () => {
      const w = Math.floor(window.innerWidth * 0.5);
      const h = Math.floor(window.innerHeight * 0.5);
      canvas.width = w;
      canvas.height = h;
      if (!psRef.current) {
        psRef.current = createPhysarum(w, h, 500);
      } else {
        // Rebuild trail maps on resize
        const ps = psRef.current;
        ps.width = w;
        ps.height = h;
        ps.trail = new Float32Array(w * h);
        ps.trailB = new Float32Array(w * h);
      }
    };
    resize();
    window.addEventListener("resize", resize);

    let lastTextMask: Uint8Array | null = null;
    let lastTextStr = "";

    const loop = () => {
      const ps = psRef.current;
      if (!ps) { rafRef.current = requestAnimationFrame(loop); return; }
      const s = spRef.current;

      // Determine agent count based on scroll
      const targetCount = Math.floor(lerp(500, 5000, clamp01(remap(s, 0.05, 0.3, 0, 1))));
      if (targetCount !== ps.agentCount) {
        resizePhysarum(ps, targetCount);
      }

      // Video rect in canvas coords
      let videoRect: { x: number; y: number; w: number; h: number } | null = null;
      const vw = videoWrapRef.current;
      if (vw && s < 0.85) {
        const vr = vw.getBoundingClientRect();
        const cRect = canvas.getBoundingClientRect();
        const sx = canvas.width / cRect.width;
        const sy = canvas.height / cRect.height;
        videoRect = {
          x: (vr.left - cRect.left) * sx,
          y: (vr.top - cRect.top) * sy,
          w: vr.width * sx,
          h: vr.height * sy,
        };
      }

      // Text mask when number is visible (15-50%)
      const numStr = total ? "$" + Math.round(total).toLocaleString() : "";
      if (s >= 0.15 && s <= 0.50 && numStr) {
        if (numStr !== lastTextStr) {
          lastTextMask = buildTextMask(ps.width, ps.height, numStr);
          lastTextStr = numStr;
        }
      } else {
        lastTextMask = null;
        lastTextStr = "";
      }

      // Burst
      const isBurst = burstRef.current > 0;
      if (isBurst) burstRef.current--;

      const m = mouseRef.current;
      stepPhysarum(ps, videoRect, lastTextMask, m.x, m.y, m.active, isBurst);
      renderTrail(ctx, ps.trail, ps.width, ps.height);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [total, buildTextMask]);

  /* ── derived scroll values ── */
  // Video transforms
  const videoOpacity = sp < 0.10 ? 1
    : sp < 0.30 ? remap(sp, 0.10, 0.30, 1, 0.4)
    : sp < 0.50 ? remap(sp, 0.30, 0.50, 0.4, 0.3)
    : sp < 0.70 ? remap(sp, 0.50, 0.70, 0.3, 0.15)
    : sp < 0.85 ? remap(sp, 0.70, 0.85, 0.15, 0)
    : 0;

  const videoScale = sp < 0.30 ? 1
    : sp < 0.50 ? remap(sp, 0.30, 0.50, 1, 0.55)
    : remap(sp, 0.50, 0.70, 0.55, 0.35);

  // Video position: center → left → top-right PIP
  const videoTranslateX = sp < 0.30 ? 0
    : sp < 0.50 ? remap(sp, 0.30, 0.50, 0, -25) // percent
    : remap(sp, 0.50, 0.70, -25, 40);
  const videoTranslateY = sp < 0.50 ? 0
    : remap(sp, 0.50, 0.70, 0, -35);

  // Physarum canvas opacity
  const physarumOpacity = sp < 0.70 ? 1
    : sp < 0.85 ? remap(sp, 0.70, 0.85, 1, 0.3)
    : remap(sp, 0.85, 1, 0.3, 0.05);

  // Phase visibility
  const nothingTextOpacity = remap(sp, 0.08, 0.12, 0, 0.35) * (sp < 0.15 ? 1 : remap(sp, 0.15, 0.20, 1, 0));
  const numberOpacity = remap(sp, 0.15, 0.20, 0, 1) * (sp < 0.30 ? 1 : remap(sp, 0.30, 0.38, 1, 0));
  const substanceOpacity = remap(sp, 0.30, 0.36, 0, 1) * (sp < 0.50 ? 1 : remap(sp, 0.50, 0.56, 1, 0));
  const methodOpacity = remap(sp, 0.50, 0.56, 0, 1) * (sp < 0.70 ? 1 : remap(sp, 0.70, 0.76, 1, 0));
  const questionOpacity = remap(sp, 0.70, 0.76, 0, 1) * (sp < 0.85 ? 1 : remap(sp, 0.85, 0.90, 1, 0));
  const resolveOpacity = remap(sp, 0.85, 0.92, 0, 1);

  const tickers = HOLDINGS.map(h => h.t).join("  ");
  const progressPct = total ? Math.min(100, (total / TARGET) * 100) : 0;

  return (
    <div className="D">
      <style>{CSS}</style>

      {/* physarum canvas — fixed behind everything */}
      <canvas
        ref={canvasRef}
        className="D-phys"
        style={{ opacity: physarumOpacity }}
      />

      {/* hidden canvas for text mask */}
      <canvas ref={textCanvasRef} style={{ display: "none" }} />

      {/* scroll rail */}
      <div className="D-rail" ref={railRef}>
        <div style={{ height: "500vh" }} />
      </div>

      {/* ── STICKY VIDEO ── */}
      <div
        ref={videoWrapRef}
        className="D-video"
        style={{
          opacity: videoOpacity,
          transform: `translate(${videoTranslateX}%, ${videoTranslateY}%) scale(${videoScale})`,
        }}
      >
        <iframe
          src={`https://www.youtube.com/embed/${VIDEO_ID}?rel=0&modestbranding=1&iv_load_policy=3&color=white&autoplay=1&mute=1`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          title="draft"
        />
      </div>

      {/* ── PHASE 1: THE NOTHING (0-15%) ── */}
      <div className="D-layer" style={{ opacity: nothingTextOpacity, pointerEvents: "none" }}>
        <p className="ph1-text">nothing, except everything.</p>
      </div>

      {/* ── PHASE 2: THE NUMBER CRACKS THROUGH (15-30%) ── */}
      <div className="D-layer" style={{ opacity: numberOpacity, pointerEvents: "none" }}>
        <div className="ph2">
          <h1 className="ph2-number">
            {total ? "$" + Math.round(total).toLocaleString() : "..."}
          </h1>
          <div className="ph2-target">
            <span className="ph2-arrow">&rarr;</span>
            <span className="ph2-goal">$100,000</span>
          </div>
          <p className="ph2-days">{d} days left</p>
        </div>
      </div>

      {/* ── PHASE 3: THE SUBSTANCE (30-50%) ── */}
      <div className="D-layer D-layer--right" style={{ opacity: substanceOpacity, pointerEvents: substanceOpacity > 0.3 ? "auto" : "none" }}>
        <div className="ph3">
          <span className="ph3-eyebrow">// lot 001</span>
          <h2 className="ph3-title">The Tarantula &middot; opening bid $25</h2>
          <p className="ph3-backed">backed by 10%{total ? ` · $${Math.round(total * 0.1).toLocaleString()} live` : ""}</p>
          <div className="ph3-details">
            <p>june 21, 2026</p>
            <p className="ph3-party">the party is the liquidity event.</p>
            <p>10% dividend pool &middot; flight comp &middot; stake = earliness &times; size</p>
            <p>$100 invested externally &middot; $66 gifted as easter eggs</p>
          </div>
        </div>
      </div>

      {/* ── PHASE 4: THE METHOD (50-70%) ── */}
      <div className="D-layer" style={{ opacity: methodOpacity, pointerEvents: "none" }}>
        <div className="ph4">
          <p className="ph4-line">five AI agents argue every trade.</p>
          <p className="ph4-line">the monte carlo says 0.000%.</p>
          <p className="ph4-line ph4-real">every dollar is real.</p>
          <div className="ph4-tickers">{tickers}</div>
          <div className="ph4-progress">
            <div className="ph4-bar">
              <div className="ph4-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="ph4-label">
              {total ? "$" + Math.round(total).toLocaleString() : "..."} / $100,000
            </span>
          </div>
        </div>
      </div>

      {/* ── PHASE 5: THE QUESTION (70-85%) ── */}
      <div className="D-layer" style={{ opacity: questionOpacity, pointerEvents: questionOpacity > 0.3 ? "auto" : "none" }}>
        <div className="ph5">
          <p className="ph5-q">do you think he makes it?</p>
          <div className="ph5-btns">
            <button
              className={`ph5-btn ${voted === "yes" ? "ph5-btn--active" : ""}`}
              onClick={() => castVote("yes")}
              disabled={!!voted}
            >
              yes{voted ? ` (${votes.yes})` : ""}
            </button>
            <button
              className={`ph5-btn ${voted === "no" ? "ph5-btn--active" : ""}`}
              onClick={() => castVote("no")}
              disabled={!!voted}
            >
              no{voted ? ` (${votes.no})` : ""}
            </button>
          </div>
          {voted && <p className="ph5-thanks">noted.</p>}
        </div>
      </div>

      {/* ── PHASE 6: THE RESOLVE (85-100%) ── */}
      <div className="D-layer" style={{ opacity: resolveOpacity, pointerEvents: resolveOpacity > 0.3 ? "auto" : "none" }}>
        <div className="ph6">
          <a href="https://aureliex.com" className="ph6-word" target="_blank" rel="noopener noreferrer">
            aureliex
          </a>
          <nav className="ph6-nav">
            <a href="https://aureliex.com/positions">/positions</a>
            <a href="https://aureliex.com/argument">/argument</a>
            <a href="https://aureliex.com/archive">/archive</a>
          </nav>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   STYLES
   ══════════════════════════════════════════════════════ */

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=JetBrains+Mono:wght@400;500&display=swap');

  /* ── base ── */
  .D {
    position: fixed; inset: 0;
    background: #000;
    color: #e8e4dc;
    overflow: hidden;
    -webkit-font-smoothing: antialiased;
  }

  /* ── physarum canvas ── */
  .D-phys {
    position: fixed; inset: 0;
    width: 100%; height: 100%;
    z-index: 1;
    image-rendering: auto;
    transition: opacity 0.5s ease;
  }

  /* ── scroll rail ── */
  .D-rail {
    position: fixed; inset: 0; z-index: 100;
    overflow-y: auto;
    scrollbar-width: none;
  }
  .D-rail::-webkit-scrollbar { display: none; }

  /* ── sticky video ── */
  .D-video {
    position: fixed;
    top: 50%; left: 50%;
    width: 85vw; max-width: 900px;
    aspect-ratio: 16 / 9;
    margin-left: calc(-1 * min(85vw, 900px) / 2);
    margin-top: calc(-1 * min(85vw, 900px) * 9 / 16 / 2);
    z-index: 5;
    border-radius: 3px;
    overflow: hidden;
    transform-origin: center center;
    transition: opacity 0.15s ease;
    box-shadow: 0 0 120px rgba(0,0,0,0.6);
  }
  .D-video iframe {
    width: 100%; height: 100%; border: none;
    display: block;
  }

  /* ── content layers ── */
  .D-layer {
    position: fixed; inset: 0;
    z-index: 10;
    display: flex; align-items: center; justify-content: center;
    transition: opacity 0.1s linear;
  }
  .D-layer--right {
    justify-content: flex-end;
    padding-right: 8%;
  }

  /* ── PHASE 1: THE NOTHING ── */
  .ph1-text {
    position: absolute;
    top: 18%; left: 50%;
    transform: translateX(-50%);
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 15px;
    font-style: italic;
    color: rgba(240, 216, 144, 0.35);
    margin: 0;
    white-space: nowrap;
  }

  /* ── PHASE 2: THE NUMBER ── */
  .ph2 {
    text-align: center;
    z-index: 2;
  }
  .ph2-number {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: clamp(64px, 14vw, 140px);
    font-weight: 500;
    color: #f0d890;
    letter-spacing: -0.03em;
    line-height: 1;
    margin: 0;
    animation: ph2-breathe 5s ease-in-out infinite;
  }
  @keyframes ph2-breathe {
    0%, 100% { transform: scale(0.995); }
    50% { transform: scale(1.005); }
  }
  .ph2-target {
    display: flex; align-items: center;
    justify-content: center; gap: 10px;
    margin-top: 16px;
  }
  .ph2-arrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 16px;
    color: rgba(240, 216, 144, 0.2);
  }
  .ph2-goal {
    font-family: 'JetBrains Mono', monospace;
    font-size: 16px;
    color: rgba(240, 216, 144, 0.2);
  }
  .ph2-days {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: rgba(240, 216, 144, 0.15);
    letter-spacing: 0.15em;
    margin-top: 12px;
  }

  /* ── PHASE 3: THE SUBSTANCE ── */
  .ph3 {
    max-width: 420px;
  }
  .ph3-eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: rgba(201, 168, 76, 0.5);
    letter-spacing: 0.15em;
    display: block;
    margin-bottom: 12px;
  }
  .ph3-title {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: clamp(22px, 3vw, 30px);
    font-weight: 500;
    color: #e8e4dc;
    margin: 0 0 8px;
    line-height: 1.3;
  }
  .ph3-backed {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: rgba(240, 216, 144, 0.35);
    margin: 0 0 24px;
  }
  .ph3-details {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 15px;
    line-height: 1.9;
    color: rgba(232, 228, 220, 0.35);
  }
  .ph3-details p { margin: 0; }
  .ph3-party {
    font-style: italic;
    color: rgba(240, 216, 144, 0.3) !important;
  }

  /* ── PHASE 4: THE METHOD ── */
  .ph4 {
    text-align: center;
    max-width: 480px;
    display: flex; flex-direction: column;
    align-items: center; gap: 12px;
  }
  .ph4-line {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: clamp(16px, 3vw, 22px);
    color: rgba(232, 228, 220, 0.4);
    margin: 0;
    line-height: 1.6;
  }
  .ph4-real {
    color: rgba(240, 216, 144, 0.5);
    font-style: italic;
  }
  .ph4-tickers {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.25em;
    color: rgba(232, 228, 220, 0.12);
    margin-top: 16px;
    word-spacing: 8px;
  }
  .ph4-progress {
    margin-top: 12px;
    width: 100%;
    display: flex; flex-direction: column;
    align-items: center; gap: 6px;
  }
  .ph4-bar {
    width: 200px; height: 2px;
    background: rgba(232, 228, 220, 0.08);
    border-radius: 1px;
    overflow: hidden;
  }
  .ph4-fill {
    height: 100%;
    background: rgba(240, 216, 144, 0.3);
    border-radius: 1px;
    transition: width 1s ease;
  }
  .ph4-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: rgba(232, 228, 220, 0.15);
    letter-spacing: 0.1em;
  }

  /* ── PHASE 5: THE QUESTION ── */
  .ph5 {
    text-align: center;
    display: flex; flex-direction: column;
    align-items: center; gap: 24px;
  }
  .ph5-q {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: clamp(20px, 5vw, 32px);
    font-style: italic;
    color: #e8e4dc;
    margin: 0;
  }
  .ph5-btns {
    display: flex; gap: 80px;
  }
  .ph5-btn {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 20px;
    color: rgba(232, 228, 220, 0.35);
    background: none; border: none;
    cursor: pointer;
    padding: 12px 24px;
    transition: color 0.3s;
    letter-spacing: 0.05em;
  }
  .ph5-btn:hover:not(:disabled) {
    color: #f0d890;
  }
  .ph5-btn:disabled {
    cursor: default;
  }
  .ph5-btn--active {
    color: #f0d890 !important;
  }
  .ph5-thanks {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: rgba(240, 216, 144, 0.2);
    margin: 0;
    letter-spacing: 0.2em;
  }

  /* ── PHASE 6: THE RESOLVE ── */
  .ph6 {
    text-align: center;
    display: flex; flex-direction: column;
    align-items: center; gap: 24px;
  }
  .ph6-word {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 22px;
    font-weight: 500;
    letter-spacing: 0.12em;
    color: rgba(232, 228, 220, 0.3);
    text-decoration: none;
    transition: color 0.3s;
  }
  .ph6-word:hover { color: #e8e4dc; }
  .ph6-nav {
    display: flex; gap: 4px; flex-wrap: wrap;
    justify-content: center;
  }
  .ph6-nav a {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: rgba(232, 228, 220, 0.15);
    text-decoration: none;
    padding: 6px 10px;
    transition: color 0.2s;
  }
  .ph6-nav a:hover { color: #e8e4dc; }

  /* ── responsive ── */
  @media (max-width: 768px) {
    .D-video {
      width: 92vw;
      margin-left: calc(-1 * min(92vw, 900px) / 2);
      margin-top: calc(-1 * min(92vw, 900px) * 9 / 16 / 2);
    }
    .D-layer--right {
      justify-content: center;
      padding-right: 0;
      padding: 0 16px;
    }
    .ph3 { max-width: 100%; }
    .ph5-btns { gap: 48px; }
  }
`;
