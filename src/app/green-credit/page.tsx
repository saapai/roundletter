// /green-credit — renders green-credit.md (the manifesto) as the full public-facing
// explainer. Reads the file at request time so edits to the .md are live.
//
// The 4/20 drop: at 04:20 AM ET on 2026-04-20, the page flips into a "drop" phase,
// with accent color interpolating from red to orange over the next 12 hours. At
// 04:20 PM ET, it revises into an all-green phase. Before 04:20 AM on 4/20 the
// page sits in default "pre" state (current ink/paper/orange register).
import fs from "node:fs";
import path from "node:path";
import { headers } from "next/headers";
import { renderMarkdown } from "@/lib/md";
import ViewTracker from "@/components/ViewTracker";
import SealedPrediction from "@/components/SealedPrediction";

const PERSONAL_HOSTS = ["saathvikpai.com", "www.saathvikpai.com"];

// Always recompute phase per request. Next.js would otherwise static-render this.
export const dynamic = "force-dynamic";

function loadManifesto(): string {
  const p = path.join(process.cwd(), "green-credit.md");
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return "# Green Credit\n\n*Manifesto file not found — check the repo root for `green-credit.md`.*";
  }
}

type Phase = {
  name: "pre" | "drop" | "green";
  accent: string;         // hex color driving --accent-phase
  accentDeep: string;     // darker/pair hex
  eyebrow: string;        // label displayed in the eyebrow
};

// All timestamps in US/Eastern (the birthday timezone).
const DROP_START = Date.parse("2026-04-20T04:20:00-04:00");
const DROP_END   = Date.parse("2026-04-20T16:20:00-04:00"); // = revision start

function lerpChannel(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * Math.max(0, Math.min(1, t)));
}
function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}
function rgbToHex(r: number, g: number, b: number): string {
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
function lerpHex(from: string, to: string, t: number): string {
  const [fr, fg, fb] = hexToRgb(from);
  const [tr, tg, tb] = hexToRgb(to);
  return rgbToHex(lerpChannel(fr, tr, t), lerpChannel(fg, tg, t), lerpChannel(fb, tb, t));
}

function computePhase(now: number): Phase {
  const RED = "#C1272D";         // stark red — drop opens here
  const ORANGE = "#E9701A";      // current accent-orange — drop closes here
  const ORANGE_DEEP = "#B95508";
  const GREEN = "#1B7F3A";       // money green — revision lives here
  const GREEN_DEEP = "#0F5132";

  if (now < DROP_START) {
    return { name: "pre", accent: ORANGE, accentDeep: ORANGE_DEEP, eyebrow: "project 2 · v0 · the manifesto" };
  }
  if (now < DROP_END) {
    const t = (now - DROP_START) / (DROP_END - DROP_START);
    const accent = lerpHex(RED, ORANGE, t);
    // Deep tone follows the main one, darker. We derive by subtracting a fixed amount.
    const [r, g, b] = hexToRgb(accent);
    const deep = rgbToHex(
      Math.max(0, r - 46),
      Math.max(0, g - 28),
      Math.max(0, b - 18),
    );
    const pct = (t * 100).toFixed(0);
    return { name: "drop", accent, accentDeep: deep, eyebrow: `project 2 · v0 · drop · ${pct}% red → orange · 4/20 4:20am ET` };
  }
  return { name: "green", accent: GREEN, accentDeep: GREEN_DEEP, eyebrow: "project 2 · v0 · revision · all green · 4/20 4:20pm ET" };
}

export default function GreenCreditPage() {
  const md = loadManifesto();
  const html = renderMarkdown(md);

  // Host-gated early preview: saathvikpai.com shows the drop phase before
  // aureliex.com does. aureliex.com follows the real clock — flips to drop
  // at 2026-04-20 04:20 ET and to green at 2026-04-20 16:20 ET.
  const h = headers();
  const host = (h.get("host") || "").toLowerCase();
  const isPersonal = PERSONAL_HOSTS.some((p) => host === p || host.startsWith(`${p}:`));

  let phase: Phase;
  if (isPersonal) {
    // Halfway-through-drop preview — shows the red→orange midpoint so the
    // register is visible without forcing any single endpoint.
    phase = computePhase(DROP_START + (DROP_END - DROP_START) * 0.5);
    phase = { ...phase, eyebrow: `project 2 · v0 · preview on saathvikpai.com · aureliex drops 4/20 4:20am ET` };
  } else {
    phase = computePhase(Date.now());
  }

  const styleVars = {
    ["--accent-phase" as string]: phase.accent,
    ["--accent-phase-deep" as string]: phase.accentDeep,
  } as React.CSSProperties;

  return (
    <article
      className={`article page green-credit-page green-credit-phase-${phase.name}`}
      data-phase={phase.name}
      style={styleVars}
    >
      <div className="eyebrow green-credit-eyebrow">{phase.eyebrow}</div>

      {isPersonal && (
        <section className="gc-audition" aria-label="the audition — saathvikpai.com preview">
          <div className="gc-audition-eyebrow">// the audition · saathvikpai.com · only here, only now</div>
          <h1 className="gc-audition-line">
            <span className="gc-audition-name">saapai · 19 · ucla · utah</span>
            <span className="gc-audition-break" />
            <span className="gc-audition-stake">$3,453 → $100,000 by 21 jun · no job · five AI agents</span>
          </h1>
          <p className="gc-audition-sub">
            This is the preview of the 4/20 drop. The public version lands on aureliex.com at 4:20 AM ET on 2026-04-20.
            <strong> View growth rate from baseline is the calibration.</strong> One number. The only one that matters.
            Share this URL if you want to be the reason the calibration lands.
          </p>
        </section>
      )}

      <SealedPrediction />

      <div dangerouslySetInnerHTML={{ __html: html }} />
      <ViewTracker slug="green-credit" />
    </article>
  );
}
