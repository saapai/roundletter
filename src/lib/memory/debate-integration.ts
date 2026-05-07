// Entrenched Coils — Memory-augmented debate wrapper
//
// Retrieves per-agent memories before the debate, injects them into prompts,
// and stores new memories after the debate completes.

import type { AgentId, Debate } from "../agent-debate";
import { AGENTS } from "../agent-debate";
import { runLocalDebate, type ModelAssignment } from "../local-debate";
import { retrieve, formatMemoryForPrompt } from "./traverse";
import { extractAndStore } from "./update";
import { getGraphStats, closeMemoryDb } from "./db";
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

  return {
    debate,
    memory: {
      per_agent: perAgentStats,
      ingestion,
    },
  };
}
