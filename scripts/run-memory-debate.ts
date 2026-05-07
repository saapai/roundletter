#!/usr/bin/env tsx
// Memory-augmented debate runner — injects per-agent tension-graph memories
// into the debate and stores new memories after completion.
//
// Usage:
//   npx tsx scripts/run-memory-debate.ts                          # default
//   npx tsx scripts/run-memory-debate.ts --profile heavy          # larger models
//   npx tsx scripts/run-memory-debate.ts --rounds 5               # more argument rounds
//   npx tsx scripts/run-memory-debate.ts --benchmark              # A/B: memory vs no-memory
//   npx tsx scripts/run-memory-debate.ts --no-scrape              # skip live data scraping

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { runMemoryDebate } from "../src/lib/memory/debate-integration";
import { runLocalDebate } from "../src/lib/local-debate";
import { closeMemoryDb } from "../src/lib/memory/db";
import { scrapeAll, formatForDebate } from "../src/lib/data-scraper";

const ROOT = process.cwd();
const PORTFOLIO_JSON = resolve(ROOT, "src/data/portfolio.json");
const HUNCHES_JSON = resolve(ROOT, "src/data/hunches.json");
const MEMORY_DEBATES_JSON = resolve(ROOT, "src/data/memory-debates.json");

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
  return new Date().toISOString().slice(0, 10);
}

function parseArgs(): {
  profile: "light" | "default" | "heavy";
  rounds: number;
  benchmark: boolean;
  scrape: boolean;
} {
  const args = process.argv.slice(2);
  let profile: "light" | "default" | "heavy" = "default";
  let rounds = 3;
  let benchmark = false;
  let scrape = true;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--profile" && args[i + 1]) {
      profile = args[++i] as "light" | "default" | "heavy";
    } else if (args[i] === "--rounds" && args[i + 1]) {
      rounds = parseInt(args[++i], 10);
    } else if (args[i] === "--benchmark") {
      benchmark = true;
    } else if (args[i] === "--no-scrape") {
      scrape = false;
    }
  }
  return { profile, rounds, benchmark, scrape };
}

function buildDayContext(
  portfolio: Portfolio,
  hunches: HunchesFile | null,
  today: string,
): string {
  const universe = portfolio.holdings
    .map((h) => (h.target_pct ? `${h.ticker} ${h.target_pct}%` : h.ticker))
    .join(", ");

  const parts: string[] = [`${today} — universe: ${universe}.`];

  if (hunches && hunches.hunches.length > 0) {
    const live = hunches.hunches.filter((h) => h.expires_on >= today);
    if (live.length > 0) {
      parts.push("Active hypotheses (may be wrong — challenge them):");
      for (const h of live) {
        parts.push(`  - ${h.id} [${h.tickers.join("/")}] ${h.thesis}`);
      }
    }
  }

  if (hunches?.catalyst_calendar?.length) {
    const upcoming = hunches.catalyst_calendar.filter((c) => c.date >= today).slice(0, 5);
    if (upcoming.length > 0) {
      parts.push("Catalysts: " + upcoming.map((c) => `${c.date} ${c.event}`).join(" · "));
    }
  }

  parts.push(
    "Moderator directive: pin the argument to specific positions, thresholds, or triggers in the book. Each agent states the delta they would make. Do not drift into generic macro.",
  );

  return parts.join("\n");
}

async function main() {
  const { profile, rounds, benchmark, scrape } = parseArgs();
  const today = todayISO();

  console.log(`\n=== MEMORY DEBATE · ${today} · profile=${profile} · rounds=${rounds} ===\n`);

  // Load portfolio + hunches
  const [portfolio, hunches] = await Promise.all([
    readJson<Portfolio>(PORTFOLIO_JSON),
    readJsonOrNull<HunchesFile>(HUNCHES_JSON),
  ]);

  const tickers = portfolio.holdings.map((h) => h.ticker);

  // Scrape live data
  let newsContext: string | undefined;
  if (scrape) {
    console.log("[scraper] fetching live data...");
    const scrapeResult = await scrapeAll(tickers);
    newsContext = formatForDebate(scrapeResult);
    console.log(`[scraper] got ${scrapeResult.items.length} items from ${scrapeResult.sources_hit.length} sources`);
    if (scrapeResult.errors.length > 0) {
      console.log(`[scraper] errors: ${scrapeResult.errors.join(", ")}`);
    }
  }

  const dayContext = buildDayContext(portfolio, hunches, today);

  // Run memory-augmented debate
  const startTime = Date.now();
  const result = await runMemoryDebate({
    dayContext,
    newsContext,
    maxArgumentRounds: rounds,
    profile,
    tickers,
  });
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  const debate = result.debate;

  console.log(`\n=== MEMORY DEBATE COMPLETE · ${duration}s ===`);
  console.log(`Topic: ${debate.topic.subject}`);
  console.log(`Consensus: ${debate.consensus.reached ? debate.consensus.direction : "split"}`);
  console.log(`Turns: ${debate.turns.length}`);

  // Print debate summary
  console.log("\n--- ARGUMENT SUMMARY ---");
  for (const turn of debate.turns) {
    if (turn.phase === "argument" && turn.speaker !== "moderator") {
      const t = turn as any;
      console.log(`  ${t.speaker}: ${t.prediction} (${t.confidence?.toFixed(2)}) — ${t.claim}`);
    }
  }

  // Print memory stats
  console.log("\n--- MEMORY STATS ---");
  for (const [agent, stats] of Object.entries(result.memory.per_agent)) {
    console.log(
      `  ${agent}: ${stats.memories_retrieved} retrieved / ${stats.total_nodes} total (${stats.retrieval_ms}ms)`
    );
  }
  console.log(
    `  ingestion: +${result.memory.ingestion.nodes_created} nodes, +${result.memory.ingestion.edges_created} edges, ${result.memory.ingestion.contradictions_found} contradictions`
  );

  // Final scorecard
  const finalScorecard = [...debate.turns]
    .reverse()
    .find((t) => t.speaker === "moderator" && (t as any).scorecard);
  if (finalScorecard && (finalScorecard as any).scorecard) {
    const sc = (finalScorecard as any).scorecard;
    console.log("\n--- SCORECARD ---");
    for (const [agent, pct] of Object.entries(sc.percents)) {
      console.log(`  ${agent}: ${pct}%`);
    }
    console.log(`  reasoning: ${sc.reasoning}`);
  }

  // Benchmark: run parallel no-memory debate for A/B comparison
  if (benchmark) {
    console.log("\n=== BENCHMARK: NO-MEMORY DEBATE (A/B comparison) ===\n");
    const benchStart = Date.now();
    const noMemDebate = await runLocalDebate({
      dayContext,
      newsContext,
      maxArgumentRounds: rounds,
      profile,
      // No perAgentContext — this is the control
    });
    const benchDuration = ((Date.now() - benchStart) / 1000).toFixed(1);

    console.log(`\n--- NO-MEMORY DEBATE COMPLETE · ${benchDuration}s ---`);
    console.log(`Topic: ${noMemDebate.topic.subject}`);
    console.log(`Consensus: ${noMemDebate.consensus.reached ? noMemDebate.consensus.direction : "split"}`);

    console.log("\n--- A/B COMPARISON ---");
    console.log(`  Memory debate:    topic="${debate.topic.subject}" consensus=${debate.consensus.reached ? debate.consensus.direction : "split"}`);
    console.log(`  No-memory debate: topic="${noMemDebate.topic.subject}" consensus=${noMemDebate.consensus.reached ? noMemDebate.consensus.direction : "split"}`);
    console.log(`  Memory time:    ${duration}s`);
    console.log(`  No-memory time: ${benchDuration}s`);

    // Compare agent predictions
    console.log("\n--- PREDICTION COMPARISON ---");
    const memPredictions = debate.turns
      .filter((t) => t.phase === "argument" && t.speaker !== "moderator")
      .reduce((acc, t) => {
        const a = t as any;
        if (!acc[a.speaker]) acc[a.speaker] = a;
        return acc;
      }, {} as Record<string, any>);

    const noMemPredictions = noMemDebate.turns
      .filter((t) => t.phase === "argument" && t.speaker !== "moderator")
      .reduce((acc, t) => {
        const a = t as any;
        if (!acc[a.speaker]) acc[a.speaker] = a;
        return acc;
      }, {} as Record<string, any>);

    for (const agent of ["bull", "bear", "macro", "flow", "historian"]) {
      const mem = memPredictions[agent];
      const noMem = noMemPredictions[agent];
      if (mem && noMem) {
        const changed = mem.prediction !== noMem.prediction || Math.abs(mem.confidence - noMem.confidence) > 0.1;
        console.log(
          `  ${agent}: memory=${mem.prediction}(${mem.confidence?.toFixed(2)}) vs no-memory=${noMem.prediction}(${noMem.confidence?.toFixed(2)})${changed ? " [CHANGED]" : ""}`
        );
      }
    }
  }

  // Save to memory-debates.json
  const existingRaw = await readFile(MEMORY_DEBATES_JSON, "utf-8").catch(() => '{"debates":[]}');
  const existing = JSON.parse(existingRaw) as { debates?: unknown[] };
  const debates = Array.isArray(existing.debates) ? existing.debates : [];
  debates.push({ ...debate, memory_stats: result.memory });
  const trimmed = debates.slice(-500);
  await writeFile(MEMORY_DEBATES_JSON, JSON.stringify({ debates: trimmed }, null, 2) + "\n", "utf-8");
  console.log(`\nSaved to memory-debates.json (${trimmed.length} total)`);

  closeMemoryDb();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
