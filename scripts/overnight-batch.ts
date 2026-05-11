#!/usr/bin/env tsx
// OVERNIGHT BATCH — Prediction scoring + data aggregation
// Runs at 9pm PT after the evening debate is complete
// Core feedback loop: did yesterday's consensus match today's actual?
//
// Usage:
//   npx tsx scripts/overnight-batch.ts

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { getPortfolioPrices } from "../src/lib/data-scraper";
import { resolvePredictionsWithDopamine, getDopamineStats, ensureDopamineSchema } from "../src/lib/memory/dopamine";
import { closeMemoryDb } from "../src/lib/memory/db";
import { runSleepCycle } from "../src/lib/memory/sleep";
import type { AgentId } from "../src/lib/agent-debate";
import type { SleepCycleResult } from "../src/lib/memory/sleep";

const ALL_AGENTS: AgentId[] = ["bull", "bear", "macro", "flow", "historian"];

const ROOT = process.cwd();
const LOCAL_DEBATES_JSON = resolve(ROOT, "src/data/local-debates.json");
const CLOUD_DEBATES_JSON = resolve(ROOT, "src/data/debates.json");
const AGENT_SCORES_JSON = resolve(ROOT, "src/data/agent-scores.json");
const PORTFOLIO_JSON = resolve(ROOT, "src/data/portfolio.json");
const DAILY_HISTORY_DIR = resolve(ROOT, "src/data/daily-history");

type AgentScores = {
  updated_at: string;
  agents: Record<string, {
    predictions_total: number;
    predictions_correct: number;
    accuracy_pct: number;
    avg_confidence_when_right: number;
    avg_confidence_when_wrong: number;
    calibration_score: number; // |accuracy - avg_confidence| lower = better calibrated
    streak: number; // positive = correct streak, negative = wrong streak
  }>;
  debates_scored: number;
  last_scored_debate_id: string;
};

type DailyHistoryEntry = {
  date: string;
  prices: Record<string, { price: number; changePct: number }>;
  portfolio_value_estimate: number;
  debate_consensus: string | null;
  debate_topic: string | null;
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

// Determine if a prediction was correct based on actual price move
function isPredictionCorrect(
  prediction: "up" | "down" | "flat",
  actualChangePct: number,
): boolean {
  const FLAT_THRESHOLD = 0.5; // +/- 0.5% counts as flat
  if (prediction === "up") return actualChangePct > FLAT_THRESHOLD;
  if (prediction === "down") return actualChangePct < -FLAT_THRESHOLD;
  if (prediction === "flat") return Math.abs(actualChangePct) <= FLAT_THRESHOLD;
  return false;
}

// Classify actual price change into direction for dopamine system
function classifyDirection(changePct: number): "up" | "down" | "flat" {
  const FLAT_THRESHOLD = 0.5;
  if (changePct > FLAT_THRESHOLD) return "up";
  if (changePct < -FLAT_THRESHOLD) return "down";
  return "flat";
}

async function main() {
  const today = todayISO();
  const yesterday = yesterdayISO();
  console.log(`[overnight] ${today} — scoring predictions from yesterday (${yesterday})`);

  // Load portfolio
  const portfolio = JSON.parse(await readFile(PORTFOLIO_JSON, "utf-8"));
  const tickers: string[] = portfolio.holdings.map((h: any) => h.ticker);

  // Get today's closing prices to score yesterday's predictions
  const prices = await getPortfolioPrices(tickers);
  console.log(`[overnight] got prices for ${Object.keys(prices).length} tickers`);

  // Save daily history
  await mkdir(DAILY_HISTORY_DIR, { recursive: true });
  const portfolioValue = Object.entries(prices).reduce((sum, [ticker, q]) => {
    const holding = portfolio.holdings.find((h: any) => h.ticker === ticker);
    return sum + (holding ? holding.shares * q.price : 0);
  }, 0) + (portfolio.pending_cash ?? 0);

  // Load debates from yesterday
  let localDebates: any[] = [];
  try {
    const raw = JSON.parse(await readFile(LOCAL_DEBATES_JSON, "utf-8"));
    localDebates = raw.debates ?? [];
  } catch {}

  let cloudDebates: any[] = [];
  try {
    const raw = JSON.parse(await readFile(CLOUD_DEBATES_JSON, "utf-8"));
    cloudDebates = raw.debates ?? [];
  } catch {}

  // Find debates from yesterday
  const yesterdayDebates = [...localDebates, ...cloudDebates].filter(
    (d) => d.ts?.startsWith(yesterday)
  );

  console.log(`[overnight] found ${yesterdayDebates.length} debates from ${yesterday}`);

  // Load or initialize agent scores
  let scores: AgentScores;
  try {
    scores = JSON.parse(await readFile(AGENT_SCORES_JSON, "utf-8"));
  } catch {
    scores = {
      updated_at: today,
      agents: {},
      debates_scored: 0,
      last_scored_debate_id: "",
    };
  }

  // Score each debate
  let newDebatesScored = 0;
  for (const debate of yesterdayDebates) {
    if (!debate.id || debate.id === scores.last_scored_debate_id) continue;
    if (!debate.topic?.subject) continue;

    // Find the relevant ticker for this debate
    const topicTickers = tickers.filter((t) =>
      debate.topic.subject.toUpperCase().includes(t) ||
      debate.day_context?.toUpperCase().includes(t)
    );

    // If no specific ticker, use portfolio-wide average
    let actualChange = 0;
    if (topicTickers.length > 0) {
      const relevantPrices = topicTickers
        .map((t) => prices[t]?.changePct)
        .filter((p): p is number => p !== undefined);
      if (relevantPrices.length > 0) {
        actualChange = relevantPrices.reduce((a, b) => a + b, 0) / relevantPrices.length;
      }
    } else {
      // Use portfolio-wide average
      const allChanges = Object.values(prices).map((q) => q.changePct);
      if (allChanges.length > 0) {
        actualChange = allChanges.reduce((a, b) => a + b, 0) / allChanges.length;
      }
    }

    // Score each agent's argument turns
    const argumentTurns = (debate.turns ?? []).filter(
      (t: any) => t.phase === "argument" && t.speaker !== "moderator" && t.prediction
    );

    for (const turn of argumentTurns) {
      const agentId = turn.speaker as string;
      if (!scores.agents[agentId]) {
        scores.agents[agentId] = {
          predictions_total: 0,
          predictions_correct: 0,
          accuracy_pct: 0,
          avg_confidence_when_right: 0,
          avg_confidence_when_wrong: 0,
          calibration_score: 0,
          streak: 0,
        };
      }

      const agent = scores.agents[agentId];
      const correct = isPredictionCorrect(turn.prediction, actualChange);
      agent.predictions_total++;
      if (correct) {
        agent.predictions_correct++;
        agent.streak = agent.streak >= 0 ? agent.streak + 1 : 1;
        // Running average of confidence when right
        const n = agent.predictions_correct;
        agent.avg_confidence_when_right =
          ((agent.avg_confidence_when_right * (n - 1)) + (turn.confidence ?? 0.5)) / n;
      } else {
        agent.streak = agent.streak <= 0 ? agent.streak - 1 : -1;
        const nWrong = agent.predictions_total - agent.predictions_correct;
        agent.avg_confidence_when_wrong =
          ((agent.avg_confidence_when_wrong * (nWrong - 1)) + (turn.confidence ?? 0.5)) / nWrong;
      }
      agent.accuracy_pct = (agent.predictions_correct / agent.predictions_total) * 100;
      agent.calibration_score = Math.abs(agent.accuracy_pct / 100 - agent.avg_confidence_when_right);
    }

    scores.last_scored_debate_id = debate.id;
    newDebatesScored++;
  }

  scores.debates_scored += newDebatesScored;
  scores.updated_at = new Date().toISOString();
  await writeFile(AGENT_SCORES_JSON, JSON.stringify(scores, null, 2) + "\n", "utf-8");

  // ── RPE feedback loop: resolve prediction nodes in the memory graph ──────
  // Feed actual price outcomes back to the dopamine system so it can update
  // salience and edge weights. Without this, all memories are treated equally.
  console.log(`\n[overnight] resolving prediction nodes via dopamine RPE...`);
  ensureDopamineSchema();
  let totalResolved = 0;
  let totalRPESum = 0;

  for (const ticker of tickers) {
    const priceData = prices[ticker];
    if (!priceData) continue;

    const actual = classifyDirection(priceData.changePct);
    const magnitude = priceData.changePct / 100; // convert pct to decimal

    const result = resolvePredictionsWithDopamine(ticker, actual, magnitude);
    if (result.resolved > 0) {
      console.log(
        `[overnight] ${ticker}: resolved ${result.resolved} predictions, ` +
        `actual=${actual} (${priceData.changePct > 0 ? "+" : ""}${priceData.changePct.toFixed(2)}%), ` +
        `avg RPE=${result.avgRPE.toFixed(3)}`
      );
      for (const r of result.results) {
        console.log(
          `  node ${r.nodeId}: RPE=${r.rpe.toFixed(3)}, ` +
          `salience ${r.oldSalience.toFixed(2)}→${r.newSalience.toFixed(2)}, ` +
          `${r.edgesUpdated} edges updated (${r.supportEdgesAdjusted} support, ${r.contradictEdgesAdjusted} contradict)`
        );
      }
      totalResolved += result.resolved;
      totalRPESum += result.avgRPE * result.resolved;
    }
  }

  // Print dopamine stats
  const dopStats = getDopamineStats();
  console.log(
    `[overnight] dopamine: ${totalResolved} predictions resolved this run, ` +
    `avg RPE=${totalResolved > 0 ? (totalRPESum / totalResolved).toFixed(3) : "n/a"}`
  );
  console.log(
    `[overnight] dopamine lifetime: ${dopStats.totalEvents} events, ` +
    `avg RPE=${dopStats.avgRPE.toFixed(3)}, ` +
    `positive=${dopStats.posRPECount}, negative=${dopStats.negRPECount}`
  );

  // Save daily history entry
  const historyEntry: DailyHistoryEntry = {
    date: today,
    prices,
    portfolio_value_estimate: portfolioValue,
    debate_consensus: yesterdayDebates[0]?.consensus?.direction ?? null,
    debate_topic: yesterdayDebates[0]?.topic?.subject ?? null,
  };
  await writeFile(
    resolve(DAILY_HISTORY_DIR, `${today}.json`),
    JSON.stringify(historyEntry, null, 2) + "\n",
    "utf-8"
  );

  // Print summary
  console.log(`\n=== OVERNIGHT BATCH COMPLETE ===`);
  console.log(`Portfolio value estimate: $${portfolioValue.toFixed(2)}`);
  console.log(`Debates scored: ${newDebatesScored} new (${scores.debates_scored} total)`);
  console.log(`Predictions resolved via RPE: ${totalResolved}`);
  console.log(`\nAgent accuracy:`);
  for (const [id, a] of Object.entries(scores.agents)) {
    console.log(
      `  ${id.padEnd(10)} ${a.accuracy_pct.toFixed(1)}% (${a.predictions_correct}/${a.predictions_total}) ` +
      `streak=${a.streak > 0 ? "+" : ""}${a.streak} ` +
      `cal=${a.calibration_score.toFixed(3)}`
    );
  }

  // ── SLEEP CYCLE — consolidate memory graph for each agent ────────────────
  // Without sleep, graph grows ~22 nodes/debate unbounded.
  // Sleep merges, prunes, downscales, and recomputes edge weights nightly.

  console.log(`\n=== SLEEP CYCLE ===`);
  const sleepResults: SleepCycleResult[] = [];

  for (const agentId of ALL_AGENTS) {
    const result = runSleepCycle(agentId);
    sleepResults.push(result);

    const compression = result.before.nodes > 0
      ? ((1 - result.after.nodes / result.before.nodes) * 100).toFixed(1)
      : "0";

    console.log(
      `[sleep] ${agentId}: ` +
      `${result.before.nodes}→${result.after.nodes} nodes (${compression}% compression), ` +
      `merged=${result.slow_wave.merged_count}, pruned=${result.slow_wave.pruned_nodes}, ` +
      `edges recomputed=${result.wake_prep.edges_recomputed}, ` +
      `dreams=${result.rem.new_associations.length}, ` +
      `${result.duration_ms}ms`
    );
  }

  const totalBefore = sleepResults.reduce((s, r) => s + r.before.nodes, 0);
  const totalAfter = sleepResults.reduce((s, r) => s + r.after.nodes, 0);
  const totalMerged = sleepResults.reduce((s, r) => s + r.slow_wave.merged_count, 0);
  const totalPruned = sleepResults.reduce((s, r) => s + r.slow_wave.pruned_nodes, 0);
  console.log(
    `[sleep] TOTAL: ${totalBefore}→${totalAfter} nodes, ` +
    `${totalMerged} merges, ${totalPruned} pruned`
  );

  // Close memory DB
  closeMemoryDb();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
