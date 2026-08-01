"use client";

import { useRef, useEffect, useCallback } from "react";

/* ── Perlin noise (classic 2D, self-contained) ──────────────── */

const PERM = new Uint8Array(512);
const GRAD = [
  [1, 1], [-1, 1], [1, -1], [-1, -1],
  [1, 0], [-1, 0], [0, 1], [0, -1],
];

(function seedPerm() {
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  // Fisher-Yates with fixed seed for reproducibility
  let s = 42;
  for (let i = 255; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647;
    const j = s % (i + 1);
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) PERM[i] = p[i & 255];
})();

function fade(t: number) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function N(x: number, y: number): number {
  const xi = Math.floor(x) & 255;
  const yi = Math.floor(y) & 255;
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);
  const u = fade(xf);
  const v = fade(yf);

  const aa = PERM[PERM[xi] + yi] & 7;
  const ab = PERM[PERM[xi] + yi + 1] & 7;
  const ba = PERM[PERM[xi + 1] + yi] & 7;
  const bb = PERM[PERM[xi + 1] + yi + 1] & 7;

  const x1 = GRAD[aa][0] * xf + GRAD[aa][1] * yf;
  const x2 = GRAD[ba][0] * (xf - 1) + GRAD[ba][1] * yf;
  const x3 = GRAD[ab][0] * xf + GRAD[ab][1] * (yf - 1);
  const x4 = GRAD[bb][0] * (xf - 1) + GRAD[bb][1] * (yf - 1);

  const l1 = x1 + u * (x2 - x1);
  const l2 = x3 + u * (x4 - x3);
  return l1 + v * (l2 - l1); // range approx -1 to 1
}

/* ── Configuration ──────────────────────────────────────────── */

const CFG = {
  // Particle count & size
  COUNT: 900,
  SIZE: 1.2,
  MAX_AGE: 160,        // frames before respawn

  // Speed
  SPEED: 1.2,          // px per frame — matches "original fast flow field"

  // Noise scales (anisotropic: X stretched relative to Y)
  PRIMARY_SX: 0.0008,  // slow variation in X → horizontal coherence
  PRIMARY_SY: 0.003,   // fast variation in Y → stacked channels
  PRIMARY_T: 0.3,      // time evolution speed

  // Turbulence octave (isotropic, adds life)
  TURB_S: 0.003,
  TURB_T: 0.5,
  TURB_MIX: 0.3,       // 30% turbulence, 70% primary

  // Angle multiplier
  ANGLE_MUL: Math.PI * 2.5,

  // Ridge warp — bends noise coordinates into mountain shapes
  RIDGE_COUNT: 5,

  // Fade trail
  FADE_R: 6,
  FADE_G: 6,
  FADE_B: 8,
  FADE_A: 0.04,

  // Colors (warm gold palette)
  PALETTE: [
    [255, 200, 100],  // bright gold
    [220, 170, 80],   // warm gold
    [200, 150, 60],   // deep gold
    [180, 140, 70],   // amber
    [160, 130, 90],   // dusty gold
  ] as [number, number, number][],

  // Connection lines
  CONNECT_DIST: 50,
  CONNECT_ALPHA: 0.06,
  MAX_CONNECTIONS_PER: 3,

  // Mouse
  MOUSE_RADIUS: 120,
  MOUSE_FORCE: 3,
};

/* ── Ridge curves ───────────────────────────────────────────── */

// Pre-compute ridge Y-positions as functions of X.
// These are abstract mountain silhouette curves.
interface RidgeDef {
  baseY: number;         // 0-1 normalized base Y position
  amplitude: number;     // peak height variation
  freq: number;          // horizontal frequency
  noiseScale: number;    // noise distortion amount
  noiseSeed: number;     // offset into noise space
}

const RIDGES: RidgeDef[] = [
  { baseY: 0.18, amplitude: 0.06, freq: 0.0015, noiseScale: 0.08, noiseSeed: 0 },
  { baseY: 0.35, amplitude: 0.08, freq: 0.0012, noiseScale: 0.10, noiseSeed: 50 },
  { baseY: 0.50, amplitude: 0.10, freq: 0.0010, noiseScale: 0.12, noiseSeed: 100 },
  { baseY: 0.65, amplitude: 0.07, freq: 0.0018, noiseScale: 0.09, noiseSeed: 150 },
  { baseY: 0.82, amplitude: 0.05, freq: 0.0014, noiseScale: 0.07, noiseSeed: 200 },
];

function ridgeY(ridge: RidgeDef, px: number, W: number): number {
  // Smooth mountain-shaped curve with noise distortion
  const nx = px / W;
  const base = ridge.baseY;
  const peak = -ridge.amplitude * (
    0.6 * Math.sin(px * ridge.freq * 2.2) +
    0.3 * Math.sin(px * ridge.freq * 4.7 + 1.3) +
    0.1 * Math.sin(px * ridge.freq * 9.1 + 2.7)
  );
  const noiseWarp = ridge.noiseScale * N(px * 0.001 + ridge.noiseSeed, 0.5);
  return base + peak + noiseWarp;
}

// Compute the noise-space warp at a given point: bends the Y coordinate
// in noise space so that flow channels follow ridge curves
function ridgeWarp(px: number, py: number, W: number, H: number): number {
  const ny = py / H;
  let warp = 0;
  for (const r of RIDGES) {
    const ry = ridgeY(r, px, W);
    const dist = ny - ry;
    // Pull noise coordinates toward each ridge (Gaussian influence)
    const sigma = 0.12;
    const pull = Math.exp(-(dist * dist) / (2 * sigma * sigma));
    // The warp pushes the noise Y-coord, creating a "channel" in noise space
    warp += pull * dist * 200;
  }
  return warp;
}

// For spawn bias: distance to nearest ridge (normalized)
function nearestRidgeDist(px: number, py: number, W: number, H: number): number {
  const ny = py / H;
  let minDist = 1;
  for (const r of RIDGES) {
    const ry = ridgeY(r, px, W);
    const d = Math.abs(ny - ry);
    if (d < minDist) minDist = d;
  }
  return minDist;
}

// For coloring: which ridge layer is this particle nearest to?
function nearestRidgeIndex(px: number, py: number, W: number, H: number): number {
  const ny = py / H;
  let minDist = 1;
  let idx = 0;
  for (let i = 0; i < RIDGES.length; i++) {
    const ry = ridgeY(RIDGES[i], px, W);
    const d = Math.abs(ny - ry);
    if (d < minDist) {
      minDist = d;
      idx = i;
    }
  }
  return idx;
}

/* ── Component ──────────────────────────────────────────────── */

export default function MountainFlowField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return null;

    // Size to window
    const dpr = window.devicePixelRatio || 1;
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Clear to dark
    ctx.fillStyle = `rgb(${CFG.FADE_R},${CFG.FADE_G},${CFG.FADE_B})`;
    ctx.fillRect(0, 0, W, H);

    // Packed particle data: [x, y, age, layer] per particle
    const STRIDE = 4;
    const data = new Float32Array(CFG.COUNT * STRIDE);

    function spawnParticle(i: number) {
      const base = i * STRIDE;
      const px = Math.random() * W;

      // 60% chance: spawn biased toward a ridge line
      // 40% chance: spawn anywhere (maintains screen coverage)
      let py: number;
      if (Math.random() < 0.6) {
        const ridgeIdx = Math.floor(Math.random() * RIDGES.length);
        const ry = ridgeY(RIDGES[ridgeIdx], px, W) * H;
        // Gaussian scatter around ridge (sigma = 40px)
        const scatter = (Math.random() + Math.random() + Math.random() - 1.5) * 2 * 40;
        py = ry + scatter;
        // Clamp
        py = Math.max(0, Math.min(H, py));
      } else {
        py = Math.random() * H;
      }

      data[base] = px;
      data[base + 1] = py;
      data[base + 2] = Math.random() * CFG.MAX_AGE; // stagger ages
      data[base + 3] = nearestRidgeIndex(px, py, W, H);
    }

    // Initialize all particles
    for (let i = 0; i < CFG.COUNT; i++) {
      spawnParticle(i);
    }

    return { ctx, W, H, data, spawnParticle, STRIDE };
  }, []);

  useEffect(() => {
    const state = init();
    if (!state) return;

    const { ctx, data, spawnParticle, STRIDE } = state;
    let { W, H } = state;
    let destroyed = false;
    let time = 0;

    // Mouse tracking
    function onMouseMove(e: MouseEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    }
    function onMouseLeave() {
      mouseRef.current = null;
    }
    function onTouchMove(e: TouchEvent) {
      if (e.touches.length > 0) {
        mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }
    function onTouchEnd() {
      mouseRef.current = null;
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    // Resize handler
    function onResize() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = `rgb(${CFG.FADE_R},${CFG.FADE_G},${CFG.FADE_B})`;
      ctx.fillRect(0, 0, W, H);
    }
    window.addEventListener("resize", onResize);

    // Spatial grid for connection lines (rebuilt each frame)
    const CELL = CFG.CONNECT_DIST;

    function frame() {
      if (destroyed) return;

      time += 0.016;

      // 1. Fade: semi-transparent dark overlay (creates trails)
      ctx.fillStyle = `rgba(${CFG.FADE_R},${CFG.FADE_G},${CFG.FADE_B},${CFG.FADE_A})`;
      ctx.fillRect(0, 0, W, H);

      const mouse = mouseRef.current;

      // 2. Build spatial hash for connections
      const gridW = Math.ceil(W / CELL);
      const gridH = Math.ceil(H / CELL);
      const grid: Int16Array = new Int16Array(gridW * gridH * 8).fill(-1);
      const gridCount = new Uint8Array(gridW * gridH);

      for (let i = 0; i < CFG.COUNT; i++) {
        const base = i * STRIDE;
        const px = data[base];
        const py = data[base + 1];
        const gx = Math.floor(px / CELL);
        const gy = Math.floor(py / CELL);
        if (gx < 0 || gx >= gridW || gy < 0 || gy >= gridH) continue;
        const gi = gy * gridW + gx;
        const cnt = gridCount[gi];
        if (cnt < 8) {
          grid[gi * 8 + cnt] = i;
          gridCount[gi] = cnt + 1;
        }
      }

      // 3. Update and draw particles
      for (let i = 0; i < CFG.COUNT; i++) {
        const base = i * STRIDE;
        let px = data[base];
        let py = data[base + 1];
        let age = data[base + 2];

        // Age out and respawn
        age += 1;
        if (age > CFG.MAX_AGE || px < -10 || px > W + 10 || py < -10 || py > H + 10) {
          spawnParticle(i);
          continue;
        }

        // Compute flow angle using anisotropic noise + ridge warp
        const warp = ridgeWarp(px, py, W, H);

        // Primary: anisotropic noise (horizontal coherence, vertical stratification)
        const primaryAngle = N(
          px * CFG.PRIMARY_SX,
          (py + warp) * CFG.PRIMARY_SY + time * CFG.PRIMARY_T
        ) * CFG.ANGLE_MUL;

        // Turbulence: isotropic noise for life and energy
        const turbAngle = N(
          px * CFG.TURB_S + 300,
          py * CFG.TURB_S + 300 + time * CFG.TURB_T
        ) * Math.PI * 3;

        // Blend
        const mix = CFG.TURB_MIX;
        const anglePrimary = primaryAngle;
        const angleTurb = turbAngle;

        // Circular interpolation to avoid wrapping artifacts
        let da = angleTurb - anglePrimary;
        while (da > Math.PI) da -= Math.PI * 2;
        while (da < -Math.PI) da += Math.PI * 2;
        const angle = anglePrimary + da * mix;

        let vx = Math.cos(angle) * CFG.SPEED;
        let vy = Math.sin(angle) * CFG.SPEED;

        // Mouse repulsion
        if (mouse) {
          const dx = px - mouse.x;
          const dy = py - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CFG.MOUSE_RADIUS && dist > 1) {
            const force = (1 - dist / CFG.MOUSE_RADIUS) * CFG.MOUSE_FORCE;
            vx += (dx / dist) * force;
            vy += (dy / dist) * force;
          }
        }

        // Move
        px += vx;
        py += vy;

        data[base] = px;
        data[base + 1] = py;
        data[base + 2] = age;

        // Determine color from layer / ridge proximity
        const ridgeDist = nearestRidgeDist(px, py, W, H);
        const ridgeProximity = Math.max(0, 1 - ridgeDist * 8); // bright near ridges
        const layerIdx = Math.floor(data[base + 3]) % CFG.PALETTE.length;
        const col = CFG.PALETTE[layerIdx];

        // Alpha: fade in/out at birth/death, brighter near ridges
        const fadeIn = Math.min(1, age / 10);
        const fadeOut = Math.min(1, (CFG.MAX_AGE - age) / 20);
        const baseAlpha = fadeIn * fadeOut;
        const alpha = baseAlpha * (0.4 + ridgeProximity * 0.5);

        // Draw particle
        ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${alpha.toFixed(3)})`;
        ctx.fillRect(px - CFG.SIZE * 0.5, py - CFG.SIZE * 0.5, CFG.SIZE, CFG.SIZE);

        // Connection lines (only check nearby cells)
        if (alpha < 0.15) continue; // skip faint particles for connections

        const gx = Math.floor(px / CELL);
        const gy = Math.floor(py / CELL);
        let connections = 0;

        for (let dy = -1; dy <= 1 && connections < CFG.MAX_CONNECTIONS_PER; dy++) {
          for (let dx = -1; dx <= 1 && connections < CFG.MAX_CONNECTIONS_PER; dx++) {
            const ngx = gx + dx;
            const ngy = gy + dy;
            if (ngx < 0 || ngx >= gridW || ngy < 0 || ngy >= gridH) continue;
            const ngi = ngy * gridW + ngx;
            const cnt = gridCount[ngi];

            for (let k = 0; k < cnt && connections < CFG.MAX_CONNECTIONS_PER; k++) {
              const j = grid[ngi * 8 + k];
              if (j <= i) continue; // avoid duplicates + self

              const jbase = j * STRIDE;
              const jx = data[jbase];
              const jy = data[jbase + 1];
              const jage = data[jbase + 2];

              const ddx = px - jx;
              const ddy = py - jy;
              const dist = Math.sqrt(ddx * ddx + ddy * ddy);

              if (dist < CFG.CONNECT_DIST && dist > 2) {
                const jLifeFade = Math.min(1, jage / 10) * Math.min(1, (CFG.MAX_AGE - jage) / 20);
                const lineAlpha = CFG.CONNECT_ALPHA *
                  (1 - dist / CFG.CONNECT_DIST) *
                  baseAlpha * jLifeFade;

                if (lineAlpha > 0.003) {
                  ctx.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},${lineAlpha.toFixed(3)})`;
                  ctx.lineWidth = 0.5;
                  ctx.beginPath();
                  ctx.moveTo(px, py);
                  ctx.lineTo(jx, jy);
                  ctx.stroke();
                  connections++;
                }
              }
            }
          }
        }
      }

      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);

    return () => {
      destroyed = true;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", onResize);
    };
  }, [init]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "auto",
        display: "block",
      }}
    />
  );
}
