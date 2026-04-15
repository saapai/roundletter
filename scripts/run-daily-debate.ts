#!/usr/bin/env tsx
// Daily debate runner — picks one ticker from portfolio.json (round-robin by
// day-of-year), runs the five-agent debate until consensus or max rounds,
// appends to src/data/debates.json. Intended for GitHub Actions; the Action
// commits and pushes the updated JSON so Vercel redeploys with fresh state.

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { runDebate, type AgentDef } from "../src/lib/agent-debate";

const ROOT = process.cwd();
const AGENTS_JSON = resolve(ROOT, "src/data/agents.json");
const PORTFOLIO_JSON = resolve(ROOT, "src/data/portfolio.json");
const DEBATES_JSON = resolve(ROOT, "src/data/debates.json");

async function readJson<T>(path: string): Promise<T> {
  const raw = await readFile(path, "utf-8");
  return JSON.parse(raw) as T;
}

type Holding = { ticker: string };
type Portfolio = { holdings: Holding[] };
type AgentsFile = { agents: AgentDef[] };

function pickTicker(portfolio: Portfolio): string {
  const holdings = portfolio.holdings ?? [];
  if (holdings.length === 0) throw new Error("no holdings in portfolio.json");
  const startOfYear = Date.UTC(new Date().getUTCFullYear(), 0, 0);
  const day = Math.floor((Date.now() - startOfYear) / 86400000);
  return holdings[day % holdings.length].ticker;
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY missing");
    process.exit(1);
  }

  const [agentsFile, portfolio, existingRaw] = await Promise.all([
    readJson<AgentsFile>(AGENTS_JSON),
    readJson<Portfolio>(PORTFOLIO_JSON),
    readFile(DEBATES_JSON, "utf-8").catch(() => '{"debates":[]}'),
  ]);
  const existing = JSON.parse(existingRaw) as { debates?: unknown[] };

  const ticker = process.env.TICKER ?? pickTicker(portfolio);
  console.log(`running daily debate for ${ticker}`);

  const debate = await runDebate({
    ticker,
    agents: agentsFile.agents,
    horizonDays: 30,
    maxRounds: 4,
  });

  const debates = Array.isArray(existing.debates) ? existing.debates : [];
  debates.push(debate);
  const trimmed = debates.slice(-180);

  await writeFile(DEBATES_JSON, JSON.stringify({ debates: trimmed }, null, 2) + "\n", "utf-8");
  console.log(
    `wrote ${ticker} debate — consensus=${debate.consensus.reached} (${debate.consensus.prediction ?? "split"}) across ${debate.rounds.length / agentsFile.agents.length} rounds`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
