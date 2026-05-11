// Entrenched Coils — Memory-augmented debate wrapper
//
// Retrieves per-agent memories before the debate, injects them into prompts,
// and stores new memories after the debate completes.

import type { AgentId, Debate } from "../agent-debate";
import { AGENTS } from "../agent-debate";
import { runLocalDebate, type ModelAssignment } from "../local-debate";
import { retrieve, formatMemoryForPrompt } from "./traverse";
import { extractAndStore } from "./update";
import { getGraphStats, closeMemoryDb, getMemoryDb } from "./db";
import { resolvePredictionsWithDopamine, ensureDopamineSchema } from "./dopamine";
import { restabilizeExpiredNodes } from "./reconsolidation";
import { getPortfolioPrices } from "../data-scraper";
import type { MemoryContext } from "./types";

// ── Types ────────────────────────────────────────────────────────────────────

export type MemoryDebateResult = {
  debate: Debate & { models_used: ModelAssignment; source: "local" };
  memory: {
    per_agent: Record<AgentId, {
      memories_retrieved: number;
      total_nodes: number;
      retrieval_ms: number;
      max_tension: number | null;
    }>;
    ingestion: {
      nodes_created: number;
      edges_created: number;
      contradictions_found: number;
    };
  };
};

// ── Main entry point ─────────────────────────────────────────────────────────

export async function runMemoryDebate(opts: {
  dayContext: string;
  newsContext?: string;
  maxArgumentRounds?: number;
  models?: Partial<ModelAssignment>;
  profile?: "light" | "default" | "heavy";
  tickers?: string[];
}): Promise<MemoryDebateResult> {
  const tickers = opts.tickers ?? [];

  // Phase 1: Retrieve memories for each agent
  console.log("[memory-debate] retrieving per-agent memories...");
  const perAgentContext: Partial<Record<AgentId, string>> = {};
  const perAgentStats: Record<AgentId, {
    memories_retrieved: number;
    total_nodes: number;
    retrieval_ms: number;
    max_tension: number | null;
  }> = {} as any;

  for (const agent of AGENTS) {
    const ctx: MemoryContext = retrieve(agent.id, { tickers, max_memories: 10 });
    const formatted = formatMemoryForPrompt(ctx);

    if (formatted) {
      perAgentContext[agent.id] = formatted;
    }

    const maxTensionEdge = ctx.max_tension_pair;
    perAgentStats[agent.id] = {
      memories_retrieved: ctx.retrieved.length,
      total_nodes: ctx.total_nodes,
      retrieval_ms: ctx.retrieval_ms,
      max_tension: maxTensionEdge ? ctx.retrieved[0]?.path_tension ?? null : null,
    };

    console.log(
      `[memory-debate] ${agent.id}: ${ctx.retrieved.length} memories (${ctx.total_nodes} total, ${ctx.retrieval_ms}ms)`
    );
  }

  // Phase 2: Run the debate with memory context
  console.log("[memory-debate] running debate with memory context...");
  const debate = await runLocalDebate({
    dayContext: opts.dayContext,
    newsContext: opts.newsContext,
    maxArgumentRounds: opts.maxArgumentRounds,
    models: opts.models,
    profile: opts.profile,
    perAgentContext,
  });

  // Phase 3: Extract and store new memories from debate results
  console.log("[memory-debate] ingesting debate results into memory graph...");
  const ingestion = await extractAndStore(debate, tickers);

  // Print memory graph stats after ingestion
  for (const agent of AGENTS) {
    const stats = getGraphStats(agent.id);
    console.log(
      `[memory-debate] ${agent.id} graph: ${stats.nodes} nodes, ${stats.edges} edges, ${stats.contradictions} contradictions`
    );
  }

  // Phase 4: Restabilize nodes whose lability windows expired during this debate.
  // Nodes retrieved in Phase 1 were made labile (salience reduced 20%).
  // If no contradiction arrived during the debate, they survive and get a 5% bonus.
  // Without this call, labile_until stays set forever and nodes never restabilize.
  const restabilized = restabilizeExpiredNodes();
  if (restabilized > 0) {
    console.log(`[memory-debate] restabilized ${restabilized} nodes (lability window expired without contradiction)`);
  }

  // Phase 5: Resolve expired predictions from PREVIOUS debates via dopamine RPE.
  // Predictions older than 5 days should be scored against actual prices.
  // This ensures the RPE feedback loop runs even if overnight-batch missed them.
  await resolveExpiredPredictions(tickers);

  return {
    debate,
    memory: {
      per_agent: perAgentStats,
      ingestion,
    },
  };
}

// ── Resolve expired predictions ─────────────────────────────────────────────
//
// After each debate, check the memory graph for prediction nodes that are:
//   1. Still unresolved (resolved = 0)
//   2. Created more than PREDICTION_MATURITY_DAYS ago
// Fetch actual prices for their tickers and apply dopamine RPE updates.

const PREDICTION_MATURITY_DAYS = 5;

async function resolveExpiredPredictions(currentTickers: string[]): Promise<void> {
  const db = getMemoryDb();
  ensureDopamineSchema();

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - PREDICTION_MATURITY_DAYS);
  const cutoffISO = cutoffDate.toISOString();

  // Find distinct tickers with unresolved predictions older than the maturity window
  const expiredRows = db.prepare(`
    SELECT DISTINCT ticker FROM memory_nodes
    WHERE content_type = 'prediction' AND resolved = 0
      AND created_at < ? AND ticker IS NOT NULL
  `).all(cutoffISO) as { ticker: string }[];

  if (expiredRows.length === 0) return;

  const expiredTickers = expiredRows.map((r) => r.ticker);
  console.log(
    `[memory-debate] found expired predictions for ${expiredTickers.length} tickers: ${expiredTickers.join(", ")}`
  );

  // Fetch current prices to determine actual direction
  let prices: Record<string, { price: number; changePct: number }>;
  try {
    prices = await getPortfolioPrices(expiredTickers);
  } catch (err) {
    console.warn("[memory-debate] failed to fetch prices for expired prediction resolution:", err);
    return;
  }

  let totalResolved = 0;
  for (const ticker of expiredTickers) {
    const priceData = prices[ticker];
    if (!priceData) continue;

    const FLAT_THRESHOLD = 0.5;
    const changePct = priceData.changePct;
    const actual: "up" | "down" | "flat" =
      changePct > FLAT_THRESHOLD ? "up" :
      changePct < -FLAT_THRESHOLD ? "down" : "flat";

    const result = resolvePredictionsWithDopamine(ticker, actual, changePct / 100);
    if (result.resolved > 0) {
      console.log(
        `[memory-debate] resolved ${result.resolved} expired predictions for ${ticker}: ` +
        `actual=${actual} (${changePct > 0 ? "+" : ""}${changePct.toFixed(2)}%), ` +
        `avg RPE=${result.avgRPE.toFixed(3)}`
      );
      totalResolved += result.resolved;
    }
  }

  if (totalResolved > 0) {
    console.log(`[memory-debate] total expired predictions resolved via RPE: ${totalResolved}`);
  }
}
