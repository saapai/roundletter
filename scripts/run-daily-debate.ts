#!/usr/bin/env tsx
// Daily debate runner — constructs today's context (date + one-line note about
// the market shape), runs the five-agent + moderator debate to premise + agreement,
// appends to src/data/debates.json. GitHub Actions commits + pushes the file
// so Vercel redeploys with the fresh state.

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { runDebate } from "../src/lib/agent-debate";

const ROOT = process.cwd();
const PORTFOLIO_JSON = resolve(ROOT, "src/data/portfolio.json");
const DEBATES_JSON = resolve(ROOT, "src/data/debates.json");

async function readJson<T>(path: string): Promise<T> {
  const raw = await readFile(path, "utf-8");
  return JSON.parse(raw) as T;
}

type Portfolio = { baseline_date?: string; holdings: Array<{ ticker: string }> };

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// Best-effort one-line context for today. If TICKER env set, focus it; else
// describe the portfolio broadly. When live prices land, replace with
// computed deltas.
function buildDayContext(portfolio: Portfolio): string {
  const tickers = portfolio.holdings.map((h) => h.ticker).join(", ");
  const forced = process.env.TICKER;
  if (forced) {
    return `${todayISO()} — focus: ${forced}. portfolio universe: ${tickers}. live prices pending; reason from first principles and base rates.`;
  }
  return `${todayISO()} — universe: ${tickers}. live prices pending; moderator: decide what actually matters today (a specific position, a macro shift, a news event, a methodological question).`;
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY missing");
    process.exit(1);
  }
  const [portfolio, existingRaw] = await Promise.all([
    readJson<Portfolio>(PORTFOLIO_JSON),
    readFile(DEBATES_JSON, "utf-8").catch(() => '{"debates":[]}'),
  ]);
  const existing = JSON.parse(existingRaw) as { debates?: unknown[] };
  const dayContext = buildDayContext(portfolio);
  console.log(`running daily debate — ${dayContext}`);
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
