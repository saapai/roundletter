"use client";

import { useRef, useEffect, useCallback } from "react";

/* ── hardcoded agent data ─────────────────────────────────────── */

interface Agent {
  id: string;
  label: string;
  pos: [number, number]; // normalized 0-1
  depth: number;
  color: string;
  rgb: [number, number, number];
}

interface Ridge {
  from: string;
  to: string;
  tension: number;
  label: string;
}

const AGENTS: Agent[] = [
  { id: "bull", label: "bull", pos: [0.3, 0.2], depth: 0.8, color: "#5F8B4E", rgb: [95, 139, 78] },
  { id: "bear", label: "bear", pos: [0.7, 0.3], depth: 0.9, color: "#8B3A2E", rgb: [139, 58, 46] },
  { id: "macro", label: "macro", pos: [0.5, 0.7], depth: 0.7, color: "#A67A3A", rgb: [166, 122, 58] },
  { id: "flow", label: "flow", pos: [0.2, 0.6], depth: 0.5, color: "#5E7098", rgb: [94, 112, 152] },
  { id: "historian", label: "historian", pos: [0.8, 0.7], depth: 0.85, color: "#6B6560", rgb: [107, 101, 96] },
];

const RIDGES: Ridge[] = [
  { from: "bull", to: "historian", tension: 1.74, label: "IONQ thesis ridge" },
  { from: "bull", to: "bear", tension: 1.65, label: "bull/bear divide" },
  { from: "flow", to: "bull", tension: 1.65, label: "flow reversal ridge" },
  { from: "bull", to: "macro", tension: 1.60, label: "macro regime wall" },
  { from: "bear", to: "historian", tension: 1.59, label: "pessimism corridor" },
];

interface MemoryNode {
  agent: string;
  pos: [number, number];
  label: string;
}

const MEMORY_NODES: MemoryNode[] = [
  { agent: "bull", pos: [0.28, 0.17], label: "10-year thesis" },
  { agent: "bull", pos: [0.34, 0.24], label: "quantum momentum" },
  { agent: "bear", pos: [0.68, 0.26], label: "dilution risk" },
  { agent: "bear", pos: [0.74, 0.34], label: "ATM shelf warning" },
  { agent: "macro", pos: [0.48, 0.66], label: "liquidity regime" },
  { agent: "macro", pos: [0.54, 0.74], label: "10Y yield pressure" },
  { agent: "flow", pos: [0.18, 0.57], label: "dealer gamma 60-70%" },
  { agent: "flow", pos: [0.24, 0.64], label: "direction change" },
  { agent: "historian", pos: [0.78, 0.66], label: "90% fail at 10yr" },
  { agent: "historian", pos: [0.83, 0.74], label: "survivorship bias" },
];

/* ── helpers ──────────────────────────────────────────────────── */

function agentById(id: string): Agent {
  return AGENTS.find((a) => a.id === id)!;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

/* Compute elevation: trenches are LOW near agents, ridges are HIGH between contradicting agents */
function elevation(nx: number, ny: number, time: number): number {
  // Start at a mid-level
  let elev = 0.5;

  // Each agent carves a trench (lowers elevation nearby)
  for (const a of AGENTS) {
    const dx = nx - a.pos[0];
    const dy = ny - a.pos[1];
    const dist = Math.sqrt(dx * dx + dy * dy);
    const influence = a.depth * Math.exp(-dist * dist * 18);
    elev -= influence * 0.45;
  }

  // Each ridge RAISES elevation along the line between two agents
  for (const r of RIDGES) {
    const a1 = agentById(r.from);
    const a2 = agentById(r.to);
    // Distance from point to line segment
    const lx = a2.pos[0] - a1.pos[0];
    const ly = a2.pos[1] - a1.pos[1];
    const len2 = lx * lx + ly * ly;
    let t = ((nx - a1.pos[0]) * lx + (ny - a1.pos[1]) * ly) / len2;
    t = clamp01(t);
    const px = a1.pos[0] + t * lx;
    const py = a1.pos[1] + t * ly;
    const dx = nx - px;
    const dy = ny - py;
    const dist = Math.sqrt(dx * dx + dy * dy);
    // Ridge height peaks near midpoint of the line
    const midBoost = 1 - Math.abs(t - 0.5) * 1.2;
    const ridgeStrength = (r.tension / 1.74) * Math.exp(-dist * dist * 60) * Math.max(0, midBoost);
    elev += ridgeStrength * 0.35;
  }

  // Subtle animation shimmer
  elev += Math.sin(nx * 12 + time * 0.4) * Math.cos(ny * 10 + time * 0.3) * 0.012;

  return clamp01(elev);
}

/* ── component ───────────────────────────────────────────────── */

export default function TopographicMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);
  const hoverRef = useRef<{ x: number; y: number } | null>(null);
  const tooltipRef = useRef<string>("");

  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, time: number) => {
    const dpr = window.devicePixelRatio || 1;
    const cw = w * dpr;
    const ch = h * dpr;

    // 1. Dark background
    ctx.fillStyle = "#0a0b0e";
    ctx.fillRect(0, 0, cw, ch);

    const pad = 40 * dpr;
    const iw = cw - pad * 2;
    const ih = ch - pad * 2;

    // 2. Compute elevation field at lower resolution for performance
    const res = 3 * dpr;
    const cols = Math.ceil(iw / res);
    const rows = Math.ceil(ih / res);
    const field: number[][] = [];

    for (let r = 0; r < rows; r++) {
      field[r] = [];
      for (let c = 0; c < cols; c++) {
        const nx = c / cols;
        const ny = r / rows;
        field[r][c] = elevation(nx, ny, time);
      }
    }

    // 3. Draw colored terrain cells
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const nx = c / cols;
        const ny = r / rows;
        const elev = field[r][c];
        const x = pad + c * res;
        const y = pad + r * res;

        // Find nearest agent for territory coloring
        let minDist = Infinity;
        let nearestAgent: Agent = AGENTS[0];
        for (const a of AGENTS) {
          const dx = nx - a.pos[0];
          const dy = ny - a.pos[1];
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < minDist) {
            minDist = d;
            nearestAgent = a;
          }
        }

        // Color: blend agent color with terrain height
        const agentInfluence = Math.exp(-minDist * minDist * 8);
        const baseR = lerp(10, nearestAgent.rgb[0], agentInfluence * 0.5);
        const baseG = lerp(11, nearestAgent.rgb[1], agentInfluence * 0.5);
        const baseB = lerp(14, nearestAgent.rgb[2], agentInfluence * 0.5);

        // Darken trenches, brighten ridges
        const brightness = 0.15 + elev * 0.55;
        const fr = Math.round(baseR * brightness);
        const fg = Math.round(baseG * brightness);
        const fb = Math.round(baseB * brightness);

        ctx.fillStyle = `rgb(${fr},${fg},${fb})`;
        ctx.fillRect(x, y, res + 1, res + 1);
      }
    }

    // 4. Contour lines
    const contourLevels = [0.15, 0.22, 0.29, 0.36, 0.43, 0.50, 0.57, 0.64, 0.71];
    ctx.lineWidth = 0.8 * dpr;

    for (const level of contourLevels) {
      ctx.strokeStyle = `rgba(200,195,185,${0.08 + Math.sin(time * 0.6 + level * 8) * 0.03})`;
      ctx.beginPath();

      for (let r = 0; r < rows - 1; r++) {
        for (let c = 0; c < cols - 1; c++) {
          // Marching squares (simplified: just check if contour crosses cell)
          const v00 = field[r][c];
          const v10 = field[r][c + 1];
          const v01 = field[r + 1][c];
          const v11 = field[r + 1][c + 1];

          const a00 = v00 >= level ? 1 : 0;
          const a10 = v10 >= level ? 1 : 0;
          const a01 = v01 >= level ? 1 : 0;
          const a11 = v11 >= level ? 1 : 0;
          const sum = a00 + a10 + a01 + a11;

          if (sum > 0 && sum < 4) {
            const x = pad + c * res;
            const y = pad + r * res;
            // Simple contour segment approximation
            const edges: [number, number][] = [];

            if (a00 !== a10) {
              const t = (level - v00) / (v10 - v00);
              edges.push([x + t * res, y]);
            }
            if (a10 !== a11) {
              const t = (level - v10) / (v11 - v10);
              edges.push([x + res, y + t * res]);
            }
            if (a01 !== a11) {
              const t = (level - v01) / (v11 - v01);
              edges.push([x + t * res, y + res]);
            }
            if (a00 !== a01) {
              const t = (level - v00) / (v01 - v00);
              edges.push([x, y + t * res]);
            }

            if (edges.length >= 2) {
              ctx.moveTo(edges[0][0], edges[0][1]);
              ctx.lineTo(edges[1][0], edges[1][1]);
            }
          }
        }
      }
      ctx.stroke();
    }

    // 5. Ridge lines (bright glowing lines between contradicting agents)
    for (const r of RIDGES) {
      const a1 = agentById(r.from);
      const a2 = agentById(r.to);
      const x1 = pad + a1.pos[0] * iw;
      const y1 = pad + a1.pos[1] * ih;
      const x2 = pad + a2.pos[0] * iw;
      const y2 = pad + a2.pos[1] * ih;

      const intensity = r.tension / 1.74;
      const pulse = 0.7 + Math.sin(time * 1.5 + r.tension * 2) * 0.3;

      // Glow
      ctx.save();
      ctx.strokeStyle = `rgba(200,160,60,${0.08 * intensity * pulse})`;
      ctx.lineWidth = 12 * dpr * intensity;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Core line
      ctx.strokeStyle = `rgba(220,180,80,${0.25 * intensity * pulse})`;
      ctx.lineWidth = 2 * dpr;
      ctx.setLineDash([4 * dpr, 6 * dpr]);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // 6. Memory node dots
    for (const mn of MEMORY_NODES) {
      const a = agentById(mn.agent);
      const x = pad + mn.pos[0] * iw;
      const y = pad + mn.pos[1] * ih;

      ctx.beginPath();
      ctx.arc(x, y, 3 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = a.color;
      ctx.fill();

      // Subtle glow
      ctx.beginPath();
      ctx.arc(x, y, 6 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = `${a.color}22`;
      ctx.fill();
    }

    // 7. Agent trench labels
    ctx.font = `bold ${10 * dpr}px ui-monospace, SFMono-Regular, monospace`;
    ctx.textAlign = "center";
    for (const a of AGENTS) {
      const x = pad + a.pos[0] * iw;
      const y = pad + a.pos[1] * ih;

      ctx.fillStyle = `${a.color}cc`;
      ctx.fillText(a.label.toUpperCase(), x, y - 12 * dpr);

      ctx.font = `${8 * dpr}px ui-monospace, SFMono-Regular, monospace`;
      ctx.fillStyle = `${a.color}88`;
      ctx.fillText(`depth ${a.depth.toFixed(1)}`, x, y + 2 * dpr);
      ctx.font = `bold ${10 * dpr}px ui-monospace, SFMono-Regular, monospace`;
    }

    // 8. Ridge labels at midpoints
    ctx.font = `${7.5 * dpr}px ui-monospace, SFMono-Regular, monospace`;
    ctx.textAlign = "center";
    for (const r of RIDGES) {
      const a1 = agentById(r.from);
      const a2 = agentById(r.to);
      const mx = pad + (a1.pos[0] + a2.pos[0]) / 2 * iw;
      const my = pad + (a1.pos[1] + a2.pos[1]) / 2 * ih;

      const pulse = 0.6 + Math.sin(time * 1.2 + r.tension * 3) * 0.4;
      ctx.fillStyle = `rgba(220,180,80,${0.6 * pulse})`;
      ctx.fillText(`${r.label} (${r.tension.toFixed(2)})`, mx, my - 4 * dpr);
    }

    // 9. Hover tooltip
    if (hoverRef.current) {
      const hx = hoverRef.current.x;
      const hy = hoverRef.current.y;
      const nx = (hx * dpr - pad) / iw;
      const ny = (hy * dpr - pad) / ih;

      if (nx >= 0 && nx <= 1 && ny >= 0 && ny <= 1) {
        const elev = elevation(nx, ny, time);

        // Find nearest feature
        let nearest = "";
        let nearDist = 0.06;

        for (const mn of MEMORY_NODES) {
          const dx = nx - mn.pos[0];
          const dy = ny - mn.pos[1];
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < nearDist) {
            nearDist = d;
            const a = agentById(mn.agent);
            nearest = `${a.label}: ${mn.label}`;
          }
        }

        const tipText = nearest || `elevation: ${elev.toFixed(2)}`;

        if (tipText !== tooltipRef.current) {
          tooltipRef.current = tipText;
        }

        // Draw crosshair
        ctx.strokeStyle = "rgba(200,195,185,0.25)";
        ctx.lineWidth = 0.5 * dpr;
        ctx.setLineDash([3 * dpr, 3 * dpr]);
        ctx.beginPath();
        ctx.moveTo(hx * dpr, pad);
        ctx.lineTo(hx * dpr, ch - pad);
        ctx.moveTo(pad, hy * dpr);
        ctx.lineTo(cw - pad, hy * dpr);
        ctx.stroke();
        ctx.setLineDash([]);

        // Tooltip background
        ctx.font = `${9 * dpr}px ui-monospace, SFMono-Regular, monospace`;
        const tw = ctx.measureText(tipText).width + 12 * dpr;
        const th = 18 * dpr;
        let tx = hx * dpr + 12 * dpr;
        let ty = hy * dpr - 24 * dpr;
        if (tx + tw > cw - pad) tx = hx * dpr - tw - 8 * dpr;
        if (ty < pad) ty = hy * dpr + 12 * dpr;

        ctx.fillStyle = "rgba(10,11,14,0.9)";
        ctx.beginPath();
        ctx.roundRect(tx, ty, tw, th, 3 * dpr);
        ctx.fill();
        ctx.strokeStyle = "rgba(200,195,185,0.2)";
        ctx.lineWidth = 0.5 * dpr;
        ctx.stroke();

        ctx.fillStyle = "rgba(200,195,185,0.85)";
        ctx.textAlign = "left";
        ctx.fillText(tipText, tx + 6 * dpr, ty + 13 * dpr);
        ctx.textAlign = "center";
      }
    }

    // 10. Title
    ctx.font = `${9 * dpr}px ui-monospace, SFMono-Regular, monospace`;
    ctx.fillStyle = "rgba(200,195,185,0.4)";
    ctx.textAlign = "left";
    ctx.fillText("TOPOGRAPHIC TENSION MAP", pad, 24 * dpr);
    ctx.font = `${7 * dpr}px ui-monospace, SFMono-Regular, monospace`;
    ctx.fillStyle = "rgba(200,195,185,0.25)";
    ctx.fillText("trenches = entrenched beliefs  /  ridges = contradiction tension", pad, 34 * dpr);
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
        the memory landscape — trenches where beliefs entrench, ridges where contradictions create tension.
        hover to explore.
      </p>
    </div>
  );
}
