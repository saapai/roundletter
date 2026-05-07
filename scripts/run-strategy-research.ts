#!/usr/bin/env tsx
// Strategy Research Runner
// Orchestrates 7 specialized research agents + Twitter scraping + debate
// Long-running: ~3-5 minutes with Claude Opus
//
// Usage:
//   npx tsx scripts/run-strategy-research.ts
//   npx tsx scripts/run-strategy-research.ts --capital 400
//   npx tsx scripts/run-strategy-research.ts --rounds 4 --no-twitter
//   npx tsx scripts/run-strategy-research.ts --extra AAPL,TSLA,PLTR
//   npx tsx scripts/run-strategy-research.ts --ticker-focus IONQ,NVDA

import { writeFile, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { runStrategyResearch, type StrategyResearchResult, RESEARCH_AGENTS, DEFAULT_STRATEGY_MODELS, LIGHT_STRATEGY_MODELS, type StrategyModelConfig } from "../src/lib/strategy-research";

const ROOT = process.cwd();
const OUTPUT_DIR = resolve(ROOT, "src/data");
const OUTPUT = resolve(OUTPUT_DIR, "strategy-research.json");

function parseArgs() {
  const args = process.argv.slice(2);
  let capital = 400;
  let rounds = 3;
  let noTwitter = false;
  let noNews = false;
  let extra: string[] = [];
  let focus: string[] = [];
  let light = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--capital" && args[i + 1]) capital = parseInt(args[++i], 10);
    if (args[i] === "--rounds" && args[i + 1]) rounds = parseInt(args[++i], 10);
    if (args[i] === "--no-twitter") noTwitter = true;
    if (args[i] === "--no-news") noNews = true;
    if (args[i] === "--light") light = true;  // use qwen3:14b instead of 32b
    if (args[i] === "--extra" && args[i + 1]) extra = args[++i].split(",").map((t) => t.trim());
    if (args[i] === "--ticker-focus" && args[i + 1]) focus = args[++i].split(",").map((t) => t.trim());
  }

  return { capital, rounds, noTwitter, noNews, extra, focus, light };
}

function printResearchPhase(result: StrategyResearchResult) {
  console.log("\n" + "=".repeat(70));
  console.log("  STRATEGY RESEARCH RESULTS");
  console.log("=".repeat(70));

  console.log("\n--- PHASE 1: INDEPENDENT RESEARCH ---\n");

  for (const r of result.research) {
    const agent = RESEARCH_AGENTS.find((a) => a.id === r.agent);
    console.log(`\n  [${r.agent.toUpperCase()}] ${agent?.name ?? r.agent}`);
    console.log(`  Domain: ${agent?.domain ?? "unknown"}`);
    console.log(`  Strategy: ${r.analysis.strategy_name}`);
    console.log(`  Edge: ${r.analysis.edge_description}`);
    console.log(`  Expected Return: ${r.analysis.expected_annual_return}%/yr`);
    console.log(`  Max Drawdown: ${r.analysis.expected_max_drawdown}%`);
    console.log(`  Sharpe Ratio: ${r.analysis.sharpe_estimate.toFixed(2)}`);
    console.log(`  Works at $4k: ${r.analysis.works_at_small_scale ? "YES" : "NO"}`);
    console.log(`  Min Capital: $${r.analysis.minimum_capital}`);
    console.log(`  Time Commitment: ${r.analysis.time_commitment}`);
    console.log(`  Confidence: ${r.analysis.overall_confidence?.toFixed(2) ?? "N/A"}`);
    console.log(`  Findings:`);
    console.log(`    1. ${r.analysis.finding_1}`);
    console.log(`    2. ${r.analysis.finding_2}`);
    console.log(`    3. ${r.analysis.finding_3}`);

    if (r.twitter_data && r.twitter_data.tweets.length > 0) {
      console.log(`  Twitter: ${r.twitter_data.tweets.length} tweets — ${r.twitter_data.sentiment.bullish}% bull / ${r.twitter_data.sentiment.bearish}% bear`);
    }
  }
}

function printDebatePhase(result: StrategyResearchResult) {
  console.log("\n--- PHASE 2: DEPLOYMENT DEBATE ---\n");

  for (const round of result.debate_rounds) {
    console.log(`\n  Round ${round.round}:`);
    for (const arg of round.arguments) {
      const trades = `${arg.argument.trade_1_action} $${arg.argument.trade_1_dollars} ${arg.argument.trade_1_ticker}${arg.argument.trade_2_dollars > 0 ? `, ${arg.argument.trade_2_action} $${arg.argument.trade_2_dollars} ${arg.argument.trade_2_ticker}` : ""}`;
      console.log(`    [${arg.agent.padEnd(12)}] ${arg.argument.claim}`);
      console.log(`      Trades: ${trades}`);
      console.log(`      E[30d]: ${arg.argument.expected_30d_return > 0 ? "+" : ""}${arg.argument.expected_30d_return}% | Risk: ${arg.argument.max_risk}% | Conf: ${arg.argument.confidence.toFixed(2)}`);
      console.log(`      Strategy: ${arg.argument.strategy_basis}`);
      if (arg.argument.rebuttal) {
        console.log(`      Rebuttal: ${arg.argument.rebuttal}`);
      }
    }
  }
}

function printSynthesis(result: StrategyResearchResult) {
  if (!result.synthesis) return;

  console.log("\n" + "=".repeat(70));
  console.log("  FINAL SYNTHESIS — MODERATOR");
  console.log("=".repeat(70));

  console.log(`\n  ${result.synthesis.narrative}`);
  console.log(`\n  Winning Strategy: ${result.synthesis.winning_strategy}`);

  console.log(`\n  RECOMMENDED DEPLOYMENT ($${result.synthesis.total_deployed} of $${result.deployable_capital}):`);
  const s = result.synthesis;
  console.log(`    ${s.rec_1_action.padEnd(8)} $${s.rec_1_dollars.toString().padStart(4)} ${s.rec_1_ticker.padEnd(6)} — ${s.rec_1_rationale} (conviction: ${s.rec_1_conviction.toFixed(2)})`);
  if (s.rec_2_dollars > 0) {
    console.log(`    ${s.rec_2_action.padEnd(8)} $${s.rec_2_dollars.toString().padStart(4)} ${s.rec_2_ticker.padEnd(6)} — ${s.rec_2_rationale} (conviction: ${s.rec_2_conviction.toFixed(2)})`);
  }

  console.log(`\n  Risk Warnings:`);
  console.log(`    ⚠ ${s.risk_warning_1}`);
  console.log(`    ⚠ ${s.risk_warning_2}`);

  console.log(`\n  Portfolio Impact: ${result.synthesis.expected_portfolio_impact}`);
}

function printSummaryTable(result: StrategyResearchResult) {
  console.log("\n" + "=".repeat(70));
  console.log("  STRATEGY COMPARISON TABLE");
  console.log("=".repeat(70));
  console.log(`\n  ${"Agent".padEnd(14)} ${"Strategy".padEnd(35)} ${"Return".padStart(8)} ${"Sharpe".padStart(8)} ${"MaxDD".padStart(8)} ${"Small?"}`);
  console.log(`  ${"-".repeat(14)} ${"-".repeat(35)} ${"-".repeat(8)} ${"-".repeat(8)} ${"-".repeat(8)} ------`);

  for (const r of result.research) {
    console.log(
      `  ${r.agent.padEnd(14)} ${r.analysis.strategy_name.slice(0, 35).padEnd(35)} ${(r.analysis.expected_annual_return + "%").padStart(8)} ${r.analysis.sharpe_estimate.toFixed(2).padStart(8)} ${(r.analysis.expected_max_drawdown + "%").padStart(8)} ${r.analysis.works_at_small_scale ? "YES" : "NO"}`,
    );
  }
}

async function main() {
  const { capital, rounds, noTwitter, noNews, extra, focus, light } = parseArgs();
  const models: StrategyModelConfig = light ? LIGHT_STRATEGY_MODELS : DEFAULT_STRATEGY_MODELS;

  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║     STRATEGY RESEARCH & DEPLOYMENT DEBATE SYSTEM           ║");
  console.log("║     7 Research Agents + Twitter + News + Multi-Round Debate ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");
  console.log(`\n  Capital: $${capital} | Rounds: ${rounds} | Model: ${models.research_model} | Twitter: ${!noTwitter} | News: ${!noNews}`);
  if (extra.length > 0) console.log(`  Extra tickers: ${extra.join(", ")}`);
  if (focus.length > 0) console.log(`  Focus tickers: ${focus.join(", ")}`);

  const result = await runStrategyResearch({
    deployable_capital: capital,
    max_debate_rounds: rounds,
    models,
    include_twitter: !noTwitter,
    include_news: !noNews,
    extra_research_tickers: extra,
    portfolio_tickers: focus.length > 0
      ? focus
      : ["IONQ", "GOOG", "MSFT", "CEG", "QTUM", "IBM", "NVDA", "HON", "RGTI", "QBTS", "SGOV"],
  });

  // Print results
  printResearchPhase(result);
  printDebatePhase(result);
  printSummaryTable(result);
  printSynthesis(result);

  // Duration
  console.log(`\n  Total duration: ${(result.duration_ms / 1000).toFixed(1)}s`);
  console.log(`  Agents: ${result.research.length} research + 1 moderator`);
  console.log(`  Debate rounds: ${result.debate_rounds.length}`);

  // Save output
  // Load existing research or start fresh
  let existing: StrategyResearchResult[] = [];
  try {
    const raw = await readFile(OUTPUT, "utf-8");
    existing = JSON.parse(raw);
    if (!Array.isArray(existing)) existing = [existing];
  } catch {}

  existing.push(result);
  // Keep last 20 research sessions
  if (existing.length > 20) existing = existing.slice(-20);

  await writeFile(OUTPUT, JSON.stringify(existing, null, 2));
  console.log(`\n  Results saved to: ${OUTPUT}`);
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
