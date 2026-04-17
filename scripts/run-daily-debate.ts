#!/usr/bin/env tsx
// Daily debate runner — constructs today's context (date + portfolio universe
// + active hunches seeded from external sources + catalyst calendar), runs the
// five-agent + moderator debate to premise + agreement, appends to
// src/data/debates.json. GitHub Actions commits + pushes the file so Vercel
// redeploys with the fresh state.
//
// Hunches live in src/data/hunches.json and are retired in-place when their
// expires_on passes, so the dayContext stays fresh instead of accumulating
// stale callouts. The moderator is explicitly nudged to keep the roundtable
// on positions, not on generic macro.

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { runDebate } from "../src/lib/agent-debate";

const ROOT = process.cwd();
const PORTFOLIO_JSON = resolve(ROOT, "src/data/portfolio.json");
const DEBATES_JSON = resolve(ROOT, "src/data/debates.json");
const HUNCHES_JSON = resolve(ROOT, "src/data/hunches.json");

async function readJson<T>(path: string): Promise<T> {
  const raw = await readFile(path, "utf-8");
  return JSON.parse(raw) as T;
}

type Portfolio = {
  baseline_date?: string;
  holdings: Array<{ ticker: string; target_pct?: number }>;
};

type Hunch = {
  id: string;
  thesis: string;
  tickers: string[];
  catalyst: string;
  catalyst_date: string | null;
  expires_on: string;
  action_suggestion: string;
  credits: Record<string, number>;
};

type RetiredHunch = Hunch & { retired_on: string; retired_reason: string };

type CatalystEvent = { date: string; event: string; source: string };

type HunchesFile = {
  note?: string;
  generated_at?: string;
  sources?: Array<{ id: string; kind: string; name: string; summary: string }>;
  catalyst_calendar?: CatalystEvent[];
  hunches: Hunch[];
  retired_hunches: RetiredHunch[];
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

async function loadHunches(): Promise<HunchesFile | null> {
  try {
    return await readJson<HunchesFile>(HUNCHES_JSON);
  } catch {
    return null;
  }
}

function retireExpired(file: HunchesFile, today: string): RetiredHunch[] {
  const stillLive: Hunch[] = [];
  const newlyRetired: RetiredHunch[] = [];
  for (const h of file.hunches) {
    if (h.expires_on < today) {
      newlyRetired.push({ ...h, retired_on: today, retired_reason: "expires_on passed" });
    } else {
      stillLive.push(h);
    }
  }
  if (newlyRetired.length === 0) return [];
  file.hunches = stillLive;
  file.retired_hunches = [...(file.retired_hunches ?? []), ...newlyRetired];
  return newlyRetired;
}

function buildDayContext(portfolio: Portfolio, hunches: HunchesFile | null): string {
  const today = todayISO();
  const universe = portfolio.holdings
    .map((h) => (h.target_pct ? `${h.ticker} ${h.target_pct}%` : h.ticker))
    .join(", ");
  const forced = process.env.TICKER;
  if (forced) {
    return `${today} — focus: ${forced}. portfolio universe: ${universe}. live prices pending; reason from first principles and base rates.`;
  }

  const parts: string[] = [`${today} — universe: ${universe}.`];

  if (hunches && hunches.hunches.length > 0) {
    parts.push(
      "Active hunches (seeded from external sources — see src/data/hunches.json for full credit attribution across S1_data / S2_human / future_data_collection / luck):",
    );
    for (const h of hunches.hunches) {
      const tickers = h.tickers.join("/");
      parts.push(`  - ${h.id} [${tickers}] ${h.thesis} → ${h.action_suggestion}`);
    }
  }

  if (hunches?.catalyst_calendar?.length) {
    const upcoming = hunches.catalyst_calendar.filter((c) => c.date >= today).slice(0, 5);
    if (upcoming.length > 0) {
      parts.push(
        "Catalyst calendar: " + upcoming.map((c) => `${c.date} ${c.event}`).join(" · ") + ".",
      );
    }
  }

  parts.push(
    "Moderator directive: the roundtable must hit positions — pin the argument to specific shares, thresholds, or triggers already in the book (portfolio.json), or to one of the active hunches above. Do not drift into generic macro. Each agent should state the delta they would make to a specific line of the book.",
  );

  return parts.join("\n");
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY missing");
    process.exit(1);
  }
  const [portfolio, existingRaw, hunches] = await Promise.all([
    readJson<Portfolio>(PORTFOLIO_JSON),
    readFile(DEBATES_JSON, "utf-8").catch(() => '{"debates":[]}'),
    loadHunches(),
  ]);

  if (hunches) {
    const retired = retireExpired(hunches, todayISO());
    if (retired.length > 0) {
      await writeFile(HUNCHES_JSON, JSON.stringify(hunches, null, 2) + "\n", "utf-8");
      console.log(`retired ${retired.length} expired hunches: ${retired.map((h) => h.id).join(", ")}`);
    }
  }

  const existing = JSON.parse(existingRaw) as { debates?: unknown[] };
  const dayContext = buildDayContext(portfolio, hunches);
  console.log(`running daily debate\n${dayContext}`);
  const debate = await runDebate({ dayContext, maxArgumentRounds: 3 });
  const debates = Array.isArray(existing.debates) ? existing.debates : [];
  debates.push(debate);
  const trimmed = debates.slice(-180);
  await writeFile(DEBATES_JSON, JSON.stringify({ debates: trimmed }, null, 2) + "\n", "utf-8");
  console.log(
    `wrote debate (topic=${debate.topic.subject} · consensus=${debate.consensus.reached} ${
      debate.consensus.direction ?? "split"
    } · ${debate.turns.length} turns)`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
