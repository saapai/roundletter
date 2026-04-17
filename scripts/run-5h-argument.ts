#!/usr/bin/env tsx
// 5-hour argument cron — alternates position / design axis per firing.
// Runs the five-agent debate engine with an axis-specific dayContext, then
// appends a compact "argument" entry to src/data/arguments.json (separate
// from debates.json so this workflow doesn't merge-conflict with the daily
// debate cron).

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { runDebate, type Debate } from "../src/lib/agent-debate";

const ROOT = process.cwd();
const PORTFOLIO_JSON = resolve(ROOT, "src/data/portfolio.json");
const HUNCHES_JSON = resolve(ROOT, "src/data/hunches.json");
const ARGUMENTS_JSON = resolve(ROOT, "src/data/arguments.json");

type Axis = "position" | "design";

type ArgumentEntry =
  | {
      id: string;
      ts: string;
      axis: Axis;
      kind: "debate";
      title: string;
      summary: string;
      debate: Debate;
    }
  | {
      id: string;
      ts: string;
      axis: Axis;
      kind: "report";
      title: string;
      summary: string;
      body: string;
    };

type ArgumentsFile = {
  note?: string;
  next_axis?: Axis;
  arguments: ArgumentEntry[];
};

type Portfolio = {
  baseline_date?: string;
  holdings: Array<{ ticker: string; target_pct?: number }>;
};

type Hunch = {
  id: string;
  thesis: string;
  tickers: string[];
  action_suggestion: string;
  expires_on: string;
};

type HunchesFile = {
  hunches: Hunch[];
  catalyst_calendar?: Array<{ date: string; event: string; source: string }>;
};

async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, "utf-8")) as T;
}

async function readJsonOrNull<T>(path: string): Promise<T | null> {
  try {
    return await readJson<T>(path);
  } catch {
    return null;
  }
}

function todayISO(): string {
  return new Date().toISOString();
}

function buildPositionContext(portfolio: Portfolio, hunches: HunchesFile | null): string {
  const universe = portfolio.holdings
    .map((h) => (h.target_pct ? `${h.ticker} ${h.target_pct}%` : h.ticker))
    .join(", ");
  const parts: string[] = [
    `${todayISO().slice(0, 10)} — axis: POSITIONS. universe: ${universe}.`,
  ];
  if (hunches && hunches.hunches.length > 0) {
    parts.push("Active hunches (seeded from external sources S1 heatmap + S2 jack sarfati DM):");
    for (const h of hunches.hunches) {
      parts.push(`  - ${h.id} [${h.tickers.join("/")}] ${h.thesis} → ${h.action_suggestion}`);
    }
  }
  const today = todayISO().slice(0, 10);
  if (hunches?.catalyst_calendar?.length) {
    const upcoming = hunches.catalyst_calendar.filter((c) => c.date >= today).slice(0, 5);
    if (upcoming.length > 0) {
      parts.push("Catalyst calendar: " + upcoming.map((c) => `${c.date} ${c.event}`).join(" · ") + ".");
    }
  }
  parts.push(
    "Moderator directive: pin the argument to a specific position, share count, threshold, or trigger in portfolio.json, OR to one of the active hunches. Each agent should state the delta they would make to a specific line of the book. Do not drift into generic macro.",
  );
  return parts.join("\n");
}

function buildDesignContext(): string {
  // Hard-coded surface snapshot. Updated manually when the design surface
  // changes — cheap, versioned via git.
  return [
    `${todayISO().slice(0, 10)} — axis: DESIGN. the current /positions surface:`,
    "",
    "Hero (SavingsHero.tsx, Apr-17 tombstone redesign):",
    "  - tombstone eyebrow: serif small-caps `the savings story — sighted 14 april 2026, 15-min tape`",
    "  - hero figure: serif 272%, clamp(4rem, 11vw, 8rem), weight 400, flat ink on paper",
    "  - sub-line italic: `$1,296 jan 2025 — $4,825 31 jan` (peak figure in gold #A67A3A)",
    "  - 4rem gilt hairline under the hero",
    "  - current-account italic subline: `on the books today · $3,581`",
    "  - ticking monospace `Nd HH:MM:SS to 21 june` BirthdayCountdown component, tabular-nums, updates every 1s",
    "  - 3-cell statement row below (replaced 4 equal cards):",
    "    · `high-water, 31 jan` $4,825 · serif, gold",
    "    · `gave some back` −25.8% · serif, ink-70%-opacity (red demoted to restraint)",
    "    · `to six figures by 21 june` 27.9x · serif, ink",
    "  - log-scale bar: 6px height, solid ink fill, no glow/gradient; single gold peak tick; 6px ink `now` dot",
    "  - caveat centered justified serif italic, 3rem hairline ::before, max-width 34rem",
    "  - palette: paper #F4EFE6, ink #1C1A17, gold #A67A3A, rule rgba(28,26,23,0.22)",
    "  - register: Sotheby's catalog / FT Weekend / Picasso auction tombstone. No emoji, no gradients on text, no rocket, no glow.",
    "",
    "Below the hero on /positions: PortfolioChart (yahoo-quote-style with 1D/2D/All filters), StockAnalysisGraph, bucket-grouped position cards with agent color accents, TodayDebate (server-rendered last entry of debates.json).",
    "",
    "Open design questions:",
    "  - is the 272% peak-gain the right hero number vs. e.g. the $4,825 absolute peak or the 29x-to-$100k remainder?",
    "  - is demoting the drawdown to ink-70% restraint-as-flex — or is it hiding the one number that makes the site honest?",
    "  - is the BirthdayCountdown on-brand live-ticker proof-of-process — or gimmicky motion that undercuts the Sotheby's register?",
    "  - is the gold hairline one accent too many, or the thing that sells the whole tombstone?",
    "  - should the caveat paragraph lead or trail the hero? where does the Ted Lasso \"I believe in believe\" honesty land best?",
    "",
    "Moderator directive: pin the argument to a specific CSS value, copy label, component name, or pixel choice. Each agent should state the delta they would make to the current tombstone — a concrete edit, not a vibe. Do not drift into abstract design philosophy. Reference the palette, the typography, the hierarchy.",
  ].join("\n");
}

function toTitle(topicSubject: string): string {
  // Clean up topic.subject for use as an entry title. Lowercase, trim trailing
  // punctuation, keep it under ~90 chars so the panel row doesn't wrap badly.
  let t = topicSubject.trim().toLowerCase();
  t = t.replace(/[.!?]+$/, "");
  if (t.length > 90) t = t.slice(0, 87) + "...";
  return t;
}

function toSummary(debate: Debate): string {
  const bits: string[] = [];
  if (debate.consensus.reached && debate.consensus.direction) {
    bits.push(
      `panel reached ${debate.consensus.direction} by round ${debate.consensus.round ?? "?"}`,
    );
  } else {
    bits.push("panel split — no consensus");
  }
  // Pull the moderator's final scorecard reasoning if present.
  const finalMod = [...debate.turns]
    .reverse()
    .find(
      (t): t is Extract<Debate["turns"][number], { speaker: "moderator" }> =>
        t.speaker === "moderator" && Boolean(t.scorecard),
    );
  if (finalMod && finalMod.scorecard) {
    bits.push(finalMod.scorecard.reasoning);
  } else {
    bits.push(debate.topic.framing);
  }
  return bits.join(" · ").slice(0, 360);
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY missing");
    process.exit(1);
  }
  const [portfolio, hunches, argsFile] = await Promise.all([
    readJson<Portfolio>(PORTFOLIO_JSON),
    readJsonOrNull<HunchesFile>(HUNCHES_JSON),
    readJsonOrNull<ArgumentsFile>(ARGUMENTS_JSON),
  ]);

  const existing: ArgumentsFile = argsFile ?? { arguments: [], next_axis: "position" };
  const axis: Axis = existing.next_axis === "design" ? "design" : "position";
  const nextAxis: Axis = axis === "position" ? "design" : "position";

  const dayContext =
    axis === "position" ? buildPositionContext(portfolio, hunches) : buildDesignContext();

  console.log(`running 5h argument · axis=${axis}\n${dayContext}`);
  const debate = await runDebate({ dayContext, maxArgumentRounds: 3 });

  const ts = todayISO();
  const entry: ArgumentEntry = {
    id: `arg-${axis}-${ts}`,
    ts,
    axis,
    kind: "debate",
    title: toTitle(debate.topic.subject),
    summary: toSummary(debate),
    debate,
  };

  const updated: ArgumentsFile = {
    note: existing.note,
    next_axis: nextAxis,
    arguments: [...existing.arguments, entry].slice(-40),
  };

  await writeFile(ARGUMENTS_JSON, JSON.stringify(updated, null, 2) + "\n", "utf-8");
  console.log(
    `wrote argument · axis=${axis} · title="${entry.title}" · consensus=${debate.consensus.reached} ${debate.consensus.direction ?? "split"} · next=${nextAxis}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
