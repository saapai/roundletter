#!/usr/bin/env tsx
// Run the sleep cycle for all 5 agents
// Intended as a nightly cron job (e.g., midnight)
//
// Usage:
//   npx tsx scripts/run-sleep-cycle.ts
//   npx tsx scripts/run-sleep-cycle.ts --agent bull
//   npx tsx scripts/run-sleep-cycle.ts --creativity 0.3 --consolidation 0.9

import { runSleepCycle, formatMorningBriefing, DEFAULT_SLEEP_PARAMS } from "../src/lib/memory/sleep";
import { getGraphStats, closeMemoryDb } from "../src/lib/memory";
import type { AgentId } from "../src/lib/agent-debate";
import type { SleepParams, SleepCycleResult } from "../src/lib/memory/sleep";

const ALL_AGENTS: AgentId[] = ["bull", "bear", "macro", "flow", "historian"];

// ── Parse CLI args ──────────────────────────────────────────────────────────

function parseArgs(): { agents: AgentId[]; params: SleepParams } {
  const args = process.argv.slice(2);
  const params: SleepParams = { ...DEFAULT_SLEEP_PARAMS };
  let agents: AgentId[] = ALL_AGENTS;

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--agent":
        agents = [args[++i] as AgentId];
        break;
      case "--consolidation":
        params.consolidation_strength = parseFloat(args[++i]);
        break;
      case "--emotional-boost":
        params.emotional_boost = parseFloat(args[++i]);
        break;
      case "--creativity":
        params.creativity = parseFloat(args[++i]);
        break;
      case "--pruning-threshold":
        params.pruning_threshold = parseFloat(args[++i]);
        break;
    }
  }

  return { agents, params };
}

// ── Main ────────────────────────────────────────────────────────────────────

function main() {
  const { agents, params } = parseArgs();
  const startTime = Date.now();

  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║           ENTRENCHED COILS — SLEEP CYCLE                    ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");
  console.log();
  console.log(`Agents:  ${agents.join(", ")}`);
  console.log(`Params:  consolidation=${params.consolidation_strength}, emotional_boost=${params.emotional_boost}, creativity=${params.creativity}, pruning=${params.pruning_threshold}`);
  console.log(`Time:    ${new Date().toISOString()}`);
  console.log();

  // Collect global before stats
  let totalNodesBefore = 0;
  let totalNodesAfter = 0;
  let totalEdgesBefore = 0;
  let totalEdgesAfter = 0;

  const results: SleepCycleResult[] = [];

  for (const agentId of agents) {
    console.log(`── ${agentId.toUpperCase()} ${"─".repeat(55 - agentId.length)}`);

    const result = runSleepCycle(agentId, params);
    results.push(result);

    totalNodesBefore += result.before.nodes;
    totalNodesAfter += result.after.nodes;
    totalEdgesBefore += result.before.edges;
    totalEdgesAfter += result.after.edges;

    // Phase 1: Slow-Wave
    console.log(`  SLOW-WAVE SLEEP:`);
    console.log(`    Merged: ${result.slow_wave.merged_count} groups (${result.slow_wave.merged_pairs.reduce((s, p) => s + p.absorbed.length, 0)} nodes absorbed)`);
    console.log(`    Downscaled: ${result.slow_wave.downscaled_nodes} nodes, ${result.slow_wave.downscaled_edges} edges (×${params.consolidation_strength})`);
    console.log(`    Pruned: ${result.slow_wave.pruned_nodes} nodes below ${params.pruning_threshold} salience`);

    if (result.slow_wave.merged_pairs.length > 0) {
      for (const pair of result.slow_wave.merged_pairs.slice(0, 3)) {
        console.log(`      → ${pair.kept} absorbed ${pair.absorbed.length} nodes`);
      }
      if (result.slow_wave.merged_pairs.length > 3) {
        console.log(`      ... and ${result.slow_wave.merged_pairs.length - 3} more merges`);
      }
    }

    // Phase 2: REM
    console.log(`  REM SLEEP:`);
    console.log(`    Contradictions amplified: ${result.rem.contradictions_boosted} (×${1 + params.emotional_boost})`);
    console.log(`    Dream associations: ${result.rem.new_associations.length}`);
    for (const assoc of result.rem.new_associations) {
      console.log(`      → ${assoc.reason}`);
    }
    console.log(`    Patterns separated: ${result.rem.patterns_separated}`);

    // Phase 3: Wake Prep
    console.log(`  WAKE PREPARATION:`);
    console.log(`    Edges recomputed: ${result.wake_prep.edges_recomputed}`);
    console.log(`    Access counts reset: ${result.wake_prep.access_counts_reset}`);

    if (result.wake_prep.morning_briefing.length > 0) {
      console.log(`    Morning briefing (top tensions):`);
      for (const item of result.wake_prep.morning_briefing) {
        console.log(`      [${item.tension.toFixed(2)}] "${item.source_content.slice(0, 60)}..." vs "${item.target_content.slice(0, 60)}..."`);
      }
    }

    // Summary line
    const compression = result.before.nodes > 0
      ? ((1 - result.after.nodes / result.before.nodes) * 100).toFixed(1)
      : "0";
    console.log(`  SUMMARY: ${result.before.nodes} → ${result.after.nodes} nodes (${compression}% compression), ${result.before.max_tension.toFixed(2)} → ${result.after.max_tension.toFixed(2)} max tension, ${result.duration_ms}ms`);
    console.log();
  }

  // Global summary
  const totalCompression = totalNodesBefore > 0
    ? ((1 - totalNodesAfter / totalNodesBefore) * 100).toFixed(1)
    : "0";

  console.log("══════════════════════════════════════════════════════════════");
  console.log("GLOBAL SUMMARY:");
  console.log(`  Nodes: ${totalNodesBefore} → ${totalNodesAfter} (${totalCompression}% compression)`);
  console.log(`  Edges: ${totalEdgesBefore} → ${totalEdgesAfter}`);
  console.log(`  Total time: ${Date.now() - startTime}ms`);
  console.log();

  // Print full morning briefing for each agent
  console.log("── MORNING BRIEFINGS ──────────────────────────────────────────");
  for (const result of results) {
    console.log();
    console.log(`[${result.agent_id.toUpperCase()}]`);
    console.log(formatMorningBriefing(result));
  }

  closeMemoryDb();
}

main();
