"use client";

import { useRef, useEffect, useCallback } from "react";

/* ── curated debate timeline data ─────────────────────────────── */

interface AgentLine {
  id: string;
  label: string;
  color: string;
  rgb: [number, number, number];
  /** depth at each of 20 debate points (0=shallow/optimistic, 1=deep/entrenched) */
  depths: number[];
}

const AGENTS: AgentLine[] = [
  {
    id: "bull",
    label: "bull trench",
    color: "#5F8B4E",
    rgb: [95, 139, 78],
    depths: [
      0.25, 0.22, 0.20, 0.18, 0.22, 0.28, 0.24, 0.20, 0.18, 0.15,
      0.18, 0.22, 0.20, 0.17, 0.15, 0.18, 0.22, 0.20, 0.17, 0.15,
    ],
  },
  {
    id: "bear",
    label: "bear trench",
    color: "#8B3A2E",
    rgb: [139, 58, 46],
    depths: [
      0.55, 0.60, 0.65, 0.70, 0.68, 0.72, 0.75, 0.78, 0.80, 0.82,
      0.80, 0.78, 0.82, 0.85, 0.87, 0.85, 0.82, 0.85, 0.88, 0.90,
    ],
  },
  {
    id: "macro",
    label: "macro",
    color: "#A67A3A",
    rgb: [166, 122, 58],
    depths: [
      0.40, 0.42, 0.45, 0.48, 0.50, 0.45, 0.42, 0.48, 0.52, 0.55,
      0.52, 0.48, 0.50, 0.55, 0.58, 0.55, 0.52, 0.50, 0.52, 0.55,
    ],
  },
  {
    id: "flow",
    label: "flow",
    color: "#5E7098",
    rgb: [94, 112, 152],
    depths: [
      0.30, 0.32, 0.28, 0.25, 0.22, 0.35, 0.42, 0.48, 0.52, 0.55,
      0.58, 0.60, 0.55, 0.50, 0.52, 0.55, 0.58, 0.60, 0.62, 0.65,
    ],
  },
  {
    id: "historian",
    label: "historian",
    color: "#6B6560",
    rgb: [107, 101, 96],
    depths: [
      0.60, 0.62, 0.65, 0.68, 0.70, 0.68, 0.65, 0.68, 0.72, 0.75,
      0.72, 0.70, 0.72, 0.75, 0.78, 0.80, 0.78, 0.75, 0.78, 0.80,
    ],
  },
];

const DEBATE_COUNT = 20;

interface Event {
  index: number;
  label: string;
  type: "debate" | "correction" | "tension";
}

const EVENTS: Event[] = [
  { index: 3, label: "IONQ debate", type: "debate" },
  { index: 5, label: "flow direction change", type: "correction" },
  { index: 9, label: "bear deepens", type: "tension" },
  { index: 13, label: "dilution thesis hardens", type: "tension" },
  { index: 17, label: "earnings catalyst", type: "debate" },
];

/* ── helpers ──────────────────────────────────────────────────── */

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Catmull-Rom spline interpolation for smooth lines */
function catmullRom(
  p0: number,
  p1: number,
  p2: number,
  p3: number,
  t: number,
): number {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
}

/* ── component ───────────────────────────────────────────────── */

export default function CrossSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);
  const hoverRef = useRef<{ x: number; y: number } | null>(null);

  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, time: number) => {
    const dpr = window.devicePixelRatio || 1;
    const cw = w * dpr;
    const ch = h * dpr;

    // 1. Dark background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, ch);
    grad.addColorStop(0, "#0d0e12");
    grad.addColorStop(1, "#08090c");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, cw, ch);

    const padL = 55 * dpr;
    const padR = 20 * dpr;
    const padT = 45 * dpr;
    const padB = 50 * dpr;
    const iw = cw - padL - padR;
    const ih = ch - padT - padB;

    // 2. Grid lines
    ctx.strokeStyle = "rgba(200,195,185,0.04)";
    ctx.lineWidth = 0.5 * dpr;
    // Vertical
    for (let i = 0; i < DEBATE_COUNT; i++) {
      const x = padL + (i / (DEBATE_COUNT - 1)) * iw;
      ctx.beginPath();
      ctx.moveTo(x, padT);
      ctx.lineTo(x, padT + ih);
      ctx.stroke();
    }
    // Horizontal
    for (let i = 0; i <= 10; i++) {
      const y = padT + (i / 10) * ih;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + iw, y);
      ctx.stroke();
    }

    // 3. Axes
    ctx.strokeStyle = "rgba(200,195,185,0.15)";
    ctx.lineWidth = 1 * dpr;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + ih);
    ctx.lineTo(padL + iw, padT + ih);
    ctx.stroke();

    // X axis labels
    ctx.font = `${7 * dpr}px ui-monospace, SFMono-Regular, monospace`;
    ctx.fillStyle = "rgba(200,195,185,0.3)";
    ctx.textAlign = "center";
    for (let i = 0; i < DEBATE_COUNT; i += 4) {
      const x = padL + (i / (DEBATE_COUNT - 1)) * iw;
      ctx.fillText(`d${i + 1}`, x, padT + ih + 16 * dpr);
    }
    ctx.fillText("debate #", padL + iw / 2, padT + ih + 32 * dpr);

    // Y axis labels
    ctx.textAlign = "right";
    ctx.fillText("shallow", padL - 8 * dpr, padT + 10 * dpr);
    ctx.fillText("deep", padL - 8 * dpr, padT + ih);
    ctx.save();
    ctx.translate(14 * dpr, padT + ih / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.fillText("conviction depth", 0, 0);
    ctx.restore();

    // 4. Fill strata between agents (geological layers)
    const sortedAgents = [...AGENTS].sort((a, b) => {
      const avgA = a.depths.reduce((s, v) => s + v, 0) / a.depths.length;
      const avgB = b.depths.reduce((s, v) => s + v, 0) / b.depths.length;
      return avgA - avgB;
    });

    // Draw filled strata between consecutive agent lines
    for (let ai = 0; ai < sortedAgents.length - 1; ai++) {
      const upper = sortedAgents[ai];
      const lower = sortedAgents[ai + 1];
      const steps = iw / dpr;

      ctx.beginPath();
      // Upper line left to right
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const idx = t * (DEBATE_COUNT - 1);
        const i0 = Math.floor(idx);
        const frac = idx - i0;
        const ip = Math.max(0, i0 - 1);
        const i1 = Math.min(DEBATE_COUNT - 1, i0);
        const i2 = Math.min(DEBATE_COUNT - 1, i0 + 1);
        const i3 = Math.min(DEBATE_COUNT - 1, i0 + 2);
        const d = catmullRom(upper.depths[ip], upper.depths[i1], upper.depths[i2], upper.depths[i3], frac);

        const x = padL + t * iw;
        const y = padT + d * ih;
        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      // Lower line right to left
      for (let s = steps; s >= 0; s--) {
        const t = s / steps;
        const idx = t * (DEBATE_COUNT - 1);
        const i0 = Math.floor(idx);
        const frac = idx - i0;
        const ip = Math.max(0, i0 - 1);
        const i1 = Math.min(DEBATE_COUNT - 1, i0);
        const i2 = Math.min(DEBATE_COUNT - 1, i0 + 1);
        const i3 = Math.min(DEBATE_COUNT - 1, i0 + 2);
        const d = catmullRom(lower.depths[ip], lower.depths[i1], lower.depths[i2], lower.depths[i3], frac);

        const x = padL + t * iw;
        const y = padT + d * ih;
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      const avgR = (upper.rgb[0] + lower.rgb[0]) / 2;
      const avgG = (upper.rgb[1] + lower.rgb[1]) / 2;
      const avgB = (upper.rgb[2] + lower.rgb[2]) / 2;
      ctx.fillStyle = `rgba(${avgR},${avgG},${avgB},0.06)`;
      ctx.fill();
    }

    // 5. Tension ridges — vertical amber glow where bull and bear lines are close
    for (let i = 0; i < DEBATE_COUNT; i++) {
      const bullD = AGENTS[0].depths[i]; // bull
      const bearD = AGENTS[1].depths[i]; // bear
      const gap = Math.abs(bearD - bullD);
      const tension = Math.max(0, 1 - gap * 2.5); // closer = more tension

      if (tension > 0.2) {
        const x = padL + (i / (DEBATE_COUNT - 1)) * iw;
        const midY = padT + ((bullD + bearD) / 2) * ih;
        const spread = gap * ih * 0.8;

        const pulse = 0.5 + Math.sin(time * 2 + i * 0.7) * 0.5;
        const alpha = tension * 0.15 * pulse;

        const glow = ctx.createLinearGradient(x, midY - spread, x, midY + spread);
        glow.addColorStop(0, `rgba(200,160,60,0)`);
        glow.addColorStop(0.3, `rgba(200,160,60,${alpha})`);
        glow.addColorStop(0.5, `rgba(220,180,80,${alpha * 1.5})`);
        glow.addColorStop(0.7, `rgba(200,160,60,${alpha})`);
        glow.addColorStop(1, `rgba(200,160,60,0)`);

        ctx.fillStyle = glow;
        ctx.fillRect(x - 4 * dpr, midY - spread, 8 * dpr, spread * 2);
      }
    }

    // 6. Agent belief depth lines
    const steps = Math.floor(iw / dpr);
    for (const agent of AGENTS) {
      ctx.beginPath();
      ctx.strokeStyle = agent.color;
      ctx.lineWidth = 2 * dpr;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const idx = t * (DEBATE_COUNT - 1);
        const i0 = Math.floor(idx);
        const frac = idx - i0;
        const ip = Math.max(0, i0 - 1);
        const i1 = Math.min(DEBATE_COUNT - 1, i0);
        const i2 = Math.min(DEBATE_COUNT - 1, i0 + 1);
        const i3 = Math.min(DEBATE_COUNT - 1, i0 + 2);

        const d = catmullRom(agent.depths[ip], agent.depths[i1], agent.depths[i2], agent.depths[i3], frac);
        const x = padL + t * iw;
        const y = padT + d * ih;

        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Subtle glow behind
      ctx.save();
      ctx.strokeStyle = `${agent.color}18`;
      ctx.lineWidth = 6 * dpr;
      ctx.beginPath();
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const idx = t * (DEBATE_COUNT - 1);
        const i0 = Math.floor(idx);
        const frac = idx - i0;
        const ip = Math.max(0, i0 - 1);
        const i1 = Math.min(DEBATE_COUNT - 1, i0);
        const i2 = Math.min(DEBATE_COUNT - 1, i0 + 1);
        const i3 = Math.min(DEBATE_COUNT - 1, i0 + 2);
        const d = catmullRom(agent.depths[ip], agent.depths[i1], agent.depths[i2], agent.depths[i3], frac);
        const x = padL + t * iw;
        const y = padT + d * ih;
        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
    }

    // 7. Event markers
    for (const ev of EVENTS) {
      const x = padL + (ev.index / (DEBATE_COUNT - 1)) * iw;

      if (ev.type === "correction") {
        // Sharp shift marker — red triangle
        ctx.fillStyle = "rgba(139,58,46,0.6)";
        ctx.beginPath();
        ctx.moveTo(x, padT + ih + 4 * dpr);
        ctx.lineTo(x - 4 * dpr, padT + ih + 12 * dpr);
        ctx.lineTo(x + 4 * dpr, padT + ih + 12 * dpr);
        ctx.closePath();
        ctx.fill();
      } else if (ev.type === "tension") {
        // Tension marker — amber diamond
        const pulse = 0.7 + Math.sin(time * 2 + ev.index) * 0.3;
        ctx.fillStyle = `rgba(200,160,60,${0.5 * pulse})`;
        ctx.beginPath();
        ctx.moveTo(x, padT + ih + 4 * dpr);
        ctx.lineTo(x - 3 * dpr, padT + ih + 8 * dpr);
        ctx.lineTo(x, padT + ih + 12 * dpr);
        ctx.lineTo(x + 3 * dpr, padT + ih + 8 * dpr);
        ctx.closePath();
        ctx.fill();
      } else {
        // Debate marker — white dot
        ctx.fillStyle = "rgba(200,195,185,0.5)";
        ctx.beginPath();
        ctx.arc(x, padT + ih + 8 * dpr, 2.5 * dpr, 0, Math.PI * 2);
        ctx.fill();
      }

      // Vertical dotted line for events
      ctx.strokeStyle = "rgba(200,195,185,0.08)";
      ctx.lineWidth = 0.5 * dpr;
      ctx.setLineDash([2 * dpr, 3 * dpr]);
      ctx.beginPath();
      ctx.moveTo(x, padT);
      ctx.lineTo(x, padT + ih);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label
      ctx.save();
      ctx.translate(x, padT - 6 * dpr);
      ctx.rotate(-Math.PI / 4);
      ctx.font = `${6.5 * dpr}px ui-monospace, SFMono-Regular, monospace`;
      ctx.textAlign = "left";
      ctx.fillStyle = ev.type === "correction"
        ? "rgba(139,58,46,0.6)"
        : ev.type === "tension"
        ? "rgba(200,160,60,0.5)"
        : "rgba(200,195,185,0.4)";
      ctx.fillText(ev.label, 0, 0);
      ctx.restore();
    }

    // 8. Agent line labels (right side)
    ctx.font = `${8 * dpr}px ui-monospace, SFMono-Regular, monospace`;
    ctx.textAlign = "left";
    for (const agent of AGENTS) {
      const lastD = agent.depths[DEBATE_COUNT - 1];
      const y = padT + lastD * ih;
      ctx.fillStyle = `${agent.color}cc`;
      ctx.fillText(agent.label, padL + iw + 6 * dpr, y + 3 * dpr);
    }

    // 9. Hover interaction
    if (hoverRef.current) {
      const hx = hoverRef.current.x * dpr;
      const hy = hoverRef.current.y * dpr;

      if (hx >= padL && hx <= padL + iw && hy >= padT && hy <= padT + ih) {
        // Vertical crosshair
        ctx.strokeStyle = "rgba(200,195,185,0.2)";
        ctx.lineWidth = 0.5 * dpr;
        ctx.setLineDash([3 * dpr, 3 * dpr]);
        ctx.beginPath();
        ctx.moveTo(hx, padT);
        ctx.lineTo(hx, padT + ih);
        ctx.stroke();
        ctx.setLineDash([]);

        // Find debate index
        const t = (hx - padL) / iw;
        const debateIdx = Math.round(t * (DEBATE_COUNT - 1));
        const clampedIdx = Math.max(0, Math.min(DEBATE_COUNT - 1, debateIdx));

        // Show depths at this debate
        let tipLines: string[] = [`debate ${clampedIdx + 1}`];
        for (const agent of AGENTS) {
          tipLines.push(`${agent.id}: ${agent.depths[clampedIdx].toFixed(2)}`);
        }
        const tipText = tipLines.join("  |  ");

        ctx.font = `${8 * dpr}px ui-monospace, SFMono-Regular, monospace`;
        const tw = ctx.measureText(tipText).width + 16 * dpr;
        const th = 18 * dpr;
        let tx = hx + 10 * dpr;
        let ty = padT - 20 * dpr;
        if (tx + tw > cw - padR) tx = hx - tw - 6 * dpr;

        ctx.fillStyle = "rgba(10,11,14,0.9)";
        ctx.beginPath();
        ctx.roundRect(tx, ty, tw, th, 3 * dpr);
        ctx.fill();
        ctx.strokeStyle = "rgba(200,195,185,0.2)";
        ctx.lineWidth = 0.5 * dpr;
        ctx.stroke();

        ctx.fillStyle = "rgba(200,195,185,0.85)";
        ctx.textAlign = "left";
        ctx.fillText(tipText, tx + 8 * dpr, ty + 13 * dpr);

        // Dots on each agent line at this debate
        for (const agent of AGENTS) {
          const dotX = padL + (clampedIdx / (DEBATE_COUNT - 1)) * iw;
          const dotY = padT + agent.depths[clampedIdx] * ih;
          ctx.beginPath();
          ctx.arc(dotX, dotY, 3.5 * dpr, 0, Math.PI * 2);
          ctx.fillStyle = agent.color;
          ctx.fill();
          ctx.strokeStyle = "#0a0b0e";
          ctx.lineWidth = 1.5 * dpr;
          ctx.stroke();
        }
      }
    }

    // 10. Title
    ctx.font = `${9 * dpr}px ui-monospace, SFMono-Regular, monospace`;
    ctx.fillStyle = "rgba(200,195,185,0.4)";
    ctx.textAlign = "left";
    ctx.fillText("CROSS-SECTION SLICE", padL, 18 * dpr);
    ctx.font = `${7 * dpr}px ui-monospace, SFMono-Regular, monospace`;
    ctx.fillStyle = "rgba(200,195,185,0.25)";
    ctx.fillText("geological strata of agent conviction over 20 debates", padL, 28 * dpr);

    // Legend
    const legendX = cw - padR - 180 * dpr;
    const legendY = 12 * dpr;
    ctx.font = `${7 * dpr}px ui-monospace, SFMono-Regular, monospace`;
    for (let i = 0; i < AGENTS.length; i++) {
      const a = AGENTS[i];
      const lx = legendX + (i % 3) * 60 * dpr;
      const ly = legendY + Math.floor(i / 3) * 12 * dpr;
      ctx.fillStyle = a.color;
      ctx.fillRect(lx, ly, 8 * dpr, 2 * dpr);
      ctx.fillStyle = `${a.color}aa`;
      ctx.fillText(a.id, lx + 12 * dpr, ly + 4 * dpr);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let destroyed = false;

    function resize() {
      if (!canvas || !container) return;
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = 400 * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = "400px";
    }

    resize();

    function onMouse(e: MouseEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      hoverRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
    function onLeave() {
      hoverRef.current = null;
    }

    canvas.addEventListener("mousemove", onMouse);
    canvas.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", resize);

    let time = 0;
    function animate() {
      if (destroyed) return;
      time += 0.016;
      const rect = container!.getBoundingClientRect();
      draw(ctx!, rect.width, 400, time);
      frameRef.current = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      destroyed = true;
      cancelAnimationFrame(frameRef.current);
      canvas.removeEventListener("mousemove", onMouse);
      canvas.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", resize);
    };
  }, [draw]);

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", margin: "1.5rem 0" }}>
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: 400,
          borderRadius: 4,
          cursor: "crosshair",
          display: "block",
        }}
      />
      <p
        style={{
          fontFamily: "ui-monospace, SFMono-Regular, monospace",
          fontSize: 11,
          color: "#6B6560",
          textAlign: "center",
          marginTop: 8,
          lineHeight: 1.6,
          letterSpacing: "0.02em",
        }}
      >
        vertical cross-section through the trenches — each line is an agent&apos;s conviction depth over time.
        amber glow = tension between bull and bear.
      </p>
    </div>
  );
}
