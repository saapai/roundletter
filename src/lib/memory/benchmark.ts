// Entrenched Coils — Benchmark: tension_graph vs flat vs no_memory
//
// Runs the same debate context through three retrieval modes and logs
// all predictions to the benchmark_runs table for later resolution.

import type { AgentId, Debate } from "../agent-debate";
import { AGENTS } from "../agent-debate";
import { runLocalDebate, type ModelAssignment } from "../local-debate";
import { retrieve, formatMemoryForPrompt } from "./traverse";
import { getMemoryDb, getGraphStats, closeMemoryDb, getNodesByTicker } from "./db";
import { computeCurrentSalience } from "./weights";
import type { MemoryContext, MemoryNode, RetrievedMemory } from "./types";

// ── Types ────────────────────────────────────────────────────────────────────

type BenchmarkMethod = "tension_graph" | "flat" | "no_memory";

type BenchmarkRunResult = {
  method: BenchmarkMethod;
  debate: Debate & { models_used: ModelAssignment; source: "local" };
  per_agent: Record<AgentId, {
    memories_retrieved: number;
    avg_tension: number;
    max_tension: number;
    retrieval_ms: number;
  }>;
};

type BenchmarkComparison = {
  tension_graph: BenchmarkRunResult;
  flat: BenchmarkRunResult;
  no_memory: BenchmarkRunResult;
  summary: {
    consensus_agreement: boolean;
    methods_agreeing: BenchmarkMethod[];
    total_duration_s: number;
  };
};

// ── Flat retrieval (recency-only, no tension traversal) ──────────────────────

function retrieveFlat(agentId: AgentId, tickers: string[], maxMemories = 10): MemoryContext {
  const startTime = Date.now();
  const results: RetrievedMemory[] = [];

  // Just get the most recent nodes by ticker, sorted by recency (no tension walk)
  for (const ticker of tickers) {
    const nodes = getNodesByTicker(agentId, ticker, maxMemories);
    for (const node of nodes) {
      if (results.length >= maxMemories) break;
      results.push({
        node,
        path_tension: computeCurrentSalience(node), // salience only, no graph walk
        path_length: 0,
        retrieval_reason: "flat_recency",
        edge_from: null,
      });
    }
  }

  // Sort by recency (most recent first)
  results.sort((a, b) =>
    new Date(b.node.created_at).getTime() - new Date(a.node.created_at).getTime()
  );

  const db = getMemoryDb();
  const nodeCount = (db.prepare(
    "SELECT COUNT(*) as c FROM memory_nodes WHERE agent_id = ?"
  ).get(agentId) as any).c;

  return {
    agent_id: agentId,
    retrieved: results.slice(0, maxMemories),
    total_nodes: nodeCount,
    max_tension_pair: null, // flat mode doesn't track tension
    identity_summary: "flat retrieval — no identity context",
    retrieval_ms: Date.now() - startTime,
  };
}

function formatFlatMemory(ctx: MemoryContext): string {
  if (ctx.retrieved.length === 0) return "";
  const lines: string[] = [
    `YOUR RECENT HISTORY (${ctx.total_nodes} total, ${ctx.retrieved.length} shown):`,
    "",
  ];
  for (const mem of ctx.retrieved) {
    const age = Math.floor((Date.now() - new Date(mem.node.created_at).getTime()) / 86_400_000);
    lines.push(
      `  [${mem.node.content_type}] ${mem.node.content} (conf: ${mem.node.confidence?.toFixed(2) ?? "?"}, age: ${age}d)`
    );
  }
  return lines.join("\n");
}

// ── Run a single benchmark method ────────────────────────────────────────────

async function runWithMethod(
  method: BenchmarkMethod,
  opts: {
    dayContext: string;
    newsContext?: string;
    maxArgumentRounds?: number;
    profile?: "light" | "default" | "heavy";
    tickers: string[];
  },
): Promise<BenchmarkRunResult> {
  const perAgentContext: Partial<Record<AgentId, string>> = {};
  const perAgentStats: Record<AgentId, {
    memories_retrieved: number;
    avg_tension: number;
    max_tension: number;
    retrieval_ms: number;
  }> = {} as any;

  if (method !== "no_memory") {
    for (const agent of AGENTS) {
      let ctx: MemoryContext;
      let formatted: string;

      if (method === "tension_graph") {
        ctx = retrieve(agent.id, { tickers: opts.tickers, max_memories: 10 });
        formatted = formatMemoryForPrompt(ctx);
      } else {
        // flat — recency only
        ctx = retrieveFlat(agent.id, opts.tickers);
        formatted = formatFlatMemory(ctx);
      }

      if (formatted) {
        perAgentContext[agent.id] = formatted;
      }

      const tensions = ctx.retrieved.map((r) => r.path_tension);
      perAgentStats[agent.id] = {
        memories_retrieved: ctx.retrieved.length,
        avg_tension: tensions.length > 0 ? tensions.reduce((a, b) => a + b, 0) / tensions.length : 0,
        max_tension: tensions.length > 0 ? Math.max(...tensions) : 0,
        retrieval_ms: ctx.retrieval_ms,
      };
    }
  } else {
    // no_memory — zero context for all agents
    for (const agent of AGENTS) {
      perAgentStats[agent.id] = {
        memories_retrieved: 0,
        avg_tension: 0,
        max_tension: 0,
        retrieval_ms: 0,
      };
    }
  }

  const debate = await runLocalDebate({
    dayContext: opts.dayContext,
    newsContext: opts.newsContext,
    maxArgumentRounds: opts.maxArgumentRounds,
    profile: opts.profile,
    perAgentContext: method !== "no_memory" ? perAgentContext : undefined,
  });

  return { method, debate, per_agent: perAgentStats };
}

// ── Log predictions to benchmark_runs ────────────────────────────────────────

function logBenchmarkRun(result: BenchmarkRunResult): void {
  const db = getMemoryDb();
  const now = new Date().toISOString();

  const insert = db.prepare(`
    INSERT INTO benchmark_runs
      (debate_id, ts, method, agent_id, memories_retrieved, avg_tension, max_tension,
       retrieval_ms, prediction, confidence)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((entries: any[]) => {
    for (const e of entries) {
      insert.run(e.debate_id, e.ts, e.method, e.agent_id, e.memories_retrieved,
        e.avg_tension, e.max_tension, e.retrieval_ms, e.prediction, e.confidence);
    }
  });

  const entries: any[] = [];
  for (const turn of result.debate.turns) {
    if (turn.phase !== "argument" || turn.speaker === "moderator") continue;
    const t = turn as any;
    const agentId = t.speaker as AgentId;
    const stats = result.per_agent[agentId];

    entries.push({
      debate_id: result.debate.id,
      ts: now,
      method: result.method,
      agent_id: agentId,
      memories_retrieved: stats?.memories_retrieved ?? 0,
      avg_tension: stats?.avg_tension ?? 0,
      max_tension: stats?.max_tension ?? 0,
      retrieval_ms: stats?.retrieval_ms ?? 0,
      prediction: t.prediction,
      confidence: t.confidence,
    });
  }

  // Deduplicate to last round per agent
  const byAgent = new Map<string, any>();
  for (const e of entries) {
    byAgent.set(e.agent_id, e); // last round wins
  }
  insertMany(Array.from(byAgent.values()));
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function runBenchmarkComparison(opts: {
  dayContext: string;
  newsContext?: string;
  maxArgumentRounds?: number;
  profile?: "light" | "default" | "heavy";
  tickers: string[];
}): Promise<BenchmarkComparison> {
  const startTime = Date.now();

  console.log("\n[benchmark] === Running tension_graph mode ===");
  const tensionResult = await runWithMethod("tension_graph", opts);
  logBenchmarkRun(tensionResult);

  console.log("\n[benchmark] === Running flat (recency-only) mode ===");
  const flatResult = await runWithMethod("flat", opts);
  logBenchmarkRun(flatResult);

  console.log("\n[benchmark] === Running no_memory mode ===");
  const noMemResult = await runWithMethod("no_memory", opts);
  logBenchmarkRun(noMemResult);

  const totalDuration = (Date.now() - startTime) / 1000;

  // Check consensus agreement across methods
  const getConsensus = (r: BenchmarkRunResult) =>
    r.debate.consensus.reached ? r.debate.consensus.direction : null;

  const consensusT = getConsensus(tensionResult);
  const consensusF = getConsensus(flatResult);
  const consensusN = getConsensus(noMemResult);

  const agreeing: BenchmarkMethod[] = [];
  const reference = consensusT ?? consensusF ?? consensusN;
  if (reference) {
    if (consensusT === reference) agreeing.push("tension_graph");
    if (consensusF === reference) agreeing.push("flat");
    if (consensusN === reference) agreeing.push("no_memory");
  }

  return {
    tension_graph: tensionResult,
    flat: flatResult,
    no_memory: noMemResult,
    summary: {
      consensus_agreement: consensusT === consensusF && consensusF === consensusN,
      methods_agreeing: agreeing,
      total_duration_s: totalDuration,
    },
  };
}

export function resolveBenchmarks(debateId: string, actualDirection: "up" | "down" | "flat"): {
  resolved: number;
  brier_by_method: Record<BenchmarkMethod, number>;
} {
  const db = getMemoryDb();

  const rows = db.prepare(`
    SELECT id, method, prediction, confidence FROM benchmark_runs
    WHERE debate_id = ? AND outcome_correct IS NULL
  `).all(debateId) as any[];

  const update = db.prepare(`
    UPDATE benchmark_runs SET outcome_correct = ?, brier_score = ? WHERE id = ?
  `);

  const brierSums: Record<BenchmarkMethod, number> = { tension_graph: 0, flat: 0, no_memory: 0 };
  const brierCounts: Record<BenchmarkMethod, number> = { tension_graph: 0, flat: 0, no_memory: 0 };

  const updateAll = db.transaction(() => {
    for (const row of rows) {
      const correct = row.prediction === actualDirection;
      const outcome = correct ? 1 : 0;
      const brier = (row.confidence - outcome) ** 2;

      update.run(correct ? 1 : 0, brier, row.id);

      const method = row.method as BenchmarkMethod;
      brierSums[method] += brier;
      brierCounts[method]++;
    }
  });

  updateAll();

  const brierByMethod: Record<BenchmarkMethod, number> = {
    tension_graph: brierCounts.tension_graph > 0 ? brierSums.tension_graph / brierCounts.tension_graph : 0,
    flat: brierCounts.flat > 0 ? brierSums.flat / brierCounts.flat : 0,
    no_memory: brierCounts.no_memory > 0 ? brierSums.no_memory / brierCounts.no_memory : 0,
  };

  return { resolved: rows.length, brier_by_method: brierByMethod };
}

export function printBenchmarkReport(): void {
  const db = getMemoryDb();

  const methods: BenchmarkMethod[] = ["tension_graph", "flat", "no_memory"];

  console.log("\n=== BENCHMARK REPORT ===\n");

  for (const method of methods) {
    const total = (db.prepare(
      "SELECT COUNT(*) as c FROM benchmark_runs WHERE method = ?"
    ).get(method) as any).c;

    const resolved = (db.prepare(
      "SELECT COUNT(*) as c FROM benchmark_runs WHERE method = ? AND outcome_correct IS NOT NULL"
    ).get(method) as any).c;

    const correct = (db.prepare(
      "SELECT COUNT(*) as c FROM benchmark_runs WHERE method = ? AND outcome_correct = 1"
    ).get(method) as any).c;

    const avgBrier = (db.prepare(
      "SELECT AVG(brier_score) as b FROM benchmark_runs WHERE method = ? AND brier_score IS NOT NULL"
    ).get(method) as any).b;

    const avgConf = (db.prepare(
      "SELECT AVG(confidence) as c FROM benchmark_runs WHERE method = ?"
    ).get(method) as any).c;

    const avgMemories = (db.prepare(
      "SELECT AVG(memories_retrieved) as m FROM benchmark_runs WHERE method = ?"
    ).get(method) as any).m;

    const avgTension = (db.prepare(
      "SELECT AVG(avg_tension) as t FROM benchmark_runs WHERE method = ?"
    ).get(method) as any).t;

    console.log(`  ${method}:`);
    console.log(`    predictions: ${total} (${resolved} resolved, ${correct} correct)`);
    console.log(`    accuracy:    ${resolved > 0 ? ((correct / resolved) * 100).toFixed(1) : "n/a"}%`);
    console.log(`    avg brier:   ${avgBrier !== null ? avgBrier.toFixed(4) : "n/a"} (lower is better)`);
    console.log(`    avg conf:    ${avgConf?.toFixed(3) ?? "n/a"}`);
    console.log(`    avg memories: ${avgMemories?.toFixed(1) ?? "0"}`);
    console.log(`    avg tension: ${avgTension?.toFixed(3) ?? "0"}`);
    console.log();
  }

  // Head-to-head comparison
  const tgBrier = (db.prepare(
    "SELECT AVG(brier_score) as b FROM benchmark_runs WHERE method = 'tension_graph' AND brier_score IS NOT NULL"
  ).get() as any).b;
  const flatBrier = (db.prepare(
    "SELECT AVG(brier_score) as b FROM benchmark_runs WHERE method = 'flat' AND brier_score IS NOT NULL"
  ).get() as any).b;
  const noMemBrier = (db.prepare(
    "SELECT AVG(brier_score) as b FROM benchmark_runs WHERE method = 'no_memory' AND brier_score IS NOT NULL"
  ).get() as any).b;

  if (tgBrier !== null && flatBrier !== null && noMemBrier !== null) {
    console.log("  HEAD-TO-HEAD (Brier score, lower = better):");
    const sorted = [
      { method: "tension_graph", brier: tgBrier },
      { method: "flat", brier: flatBrier },
      { method: "no_memory", brier: noMemBrier },
    ].sort((a, b) => a.brier - b.brier);

    for (let i = 0; i < sorted.length; i++) {
      console.log(`    #${i + 1} ${sorted[i].method}: ${sorted[i].brier.toFixed(4)}`);
    }

    if (tgBrier < flatBrier) {
      const improvement = ((1 - tgBrier / flatBrier) * 100).toFixed(1);
      console.log(`\n  Tension graph beats flat by ${improvement}% on Brier score.`);
    } else if (flatBrier < tgBrier) {
      const worse = ((tgBrier / flatBrier - 1) * 100).toFixed(1);
      console.log(`\n  Tension graph is ${worse}% worse than flat on Brier score.`);
    }
  } else {
    console.log("  No resolved predictions yet. Run resolveBenchmarks() with actual outcomes.");
  }
}
