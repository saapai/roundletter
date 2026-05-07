#!/usr/bin/env tsx
// Run side-by-side deployment debates: with memory vs without
// Compares how the tension graph affects agent arguments

import { runLocalDebate } from "../src/lib/local-debate";
import { retrieve, formatMemoryForPrompt, extractAndStore, getGraphStats } from "../src/lib/memory";
import type { AgentId } from "../src/lib/agent-debate";

const AGENTS: AgentId[] = ["bull", "bear", "macro", "flow", "historian"];

const dayContext = `2026-05-06 · Portfolio $4,008 (+10.75%) · Cash $404 to deploy
IONQ $604 (15.07%) +14.08% — ABOVE 15% SINGLE-NAME TRIM TRIGGER
GOOG $488 (12.18%) +19.85% · MSFT $429 (10.70%) +5.14%
QTUM $371 (9.26%) +17.88% · CEG $371 (9.25%) +9.29%
NVDA $368 (9.19%) +6.96% · IBM $351 (8.75%) -6.10%
HON $217 (5.41%) +3.73% · RGTI $200 (4.98%) +17.79%
QBTS $142 (3.54%) +39.51% · SGOV $64 (1.59%)
Pure-play quantum cluster: 23.6% (IONQ+RGTI+QBTS) correlated 0.78-0.85
Question: How should we deploy $404 cash? Should we trim IONQ (above 15% trigger)?
Today: quantum names rallying hard, QBTS +10.63%, RGTI +9.96%, IONQ +9.52%`;

const mode = process.argv.includes("--memory") ? "memory" : process.argv.includes("--no-memory") ? "no-memory" : "both";

function printResults(label: string, debate: any) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  ${label}`);
  console.log("=".repeat(60));
  console.log(`Topic: ${debate.topic.subject}`);
  console.log(`Consensus: ${debate.consensus.reached ? debate.consensus.direction + " (round " + debate.consensus.round + ")" : "SPLIT"}`);
  console.log("\nFinal positions:");
  const lastRound = Math.max(...debate.turns.filter((t: any) => t.phase === "argument" && t.speaker !== "moderator").map((t: any) => t.round));
  for (const t of debate.turns) {
    if (t.phase === "argument" && t.speaker !== "moderator" && t.round === lastRound) {
      console.log(`  ${t.speaker.padEnd(10)} ${t.prediction.padEnd(5)} conf=${t.confidence.toFixed(2)}  ${t.claim}`);
      if (t.rebuttal) console.log(`${"".padEnd(24)}rebuttal: ${t.rebuttal}`);
    }
  }
}

async function main() {
  if (mode === "no-memory" || mode === "both") {
    console.log("\n>>> Running NO-MEMORY debate...");
    const noMem = await runLocalDebate({ dayContext, maxArgumentRounds: 3, profile: "light" });
    printResults("NO-MEMORY DEBATE", noMem);
  }

  if (mode === "memory" || mode === "both") {
    // Retrieve memories
    const perAgentContext: Partial<Record<AgentId, string>> = {};
    for (const a of AGENTS) {
      const ctx = retrieve(a, { tickers: ["IONQ", "QBTS", "RGTI", "NVDA", "GOOG"], max_memories: 10 });
      perAgentContext[a] = formatMemoryForPrompt(ctx);
      console.log(`[memory] ${a}: ${ctx.retrieved.length} memories retrieved, ${ctx.total_nodes} total nodes`);
    }

    console.log("\n>>> Running MEMORY-ENHANCED debate...");
    const withMem = await runLocalDebate({ dayContext, maxArgumentRounds: 3, profile: "light", perAgentContext });
    printResults("MEMORY-ENHANCED DEBATE", withMem);

    // Store new memories
    const stored = await extractAndStore(withMem, ["IONQ", "QBTS", "RGTI", "NVDA", "GOOG"]);
    console.log(`\n[memory] Stored: ${stored.nodes_created} nodes, ${stored.edges_created} edges, ${stored.contradictions_found} contradictions`);

    console.log("\nGraph stats:");
    for (const a of AGENTS) {
      const s = getGraphStats(a);
      console.log(`  ${a.padEnd(10)} nodes:${String(s.nodes).padStart(4)} edges:${String(s.edges).padStart(5)} contradictions:${String(s.contradictions).padStart(4)}`);
    }
  }
}

main().catch(e => { console.error("Fatal:", e); process.exit(1); });
