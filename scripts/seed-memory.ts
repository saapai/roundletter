#!/usr/bin/env tsx
// Seed the memory graph from existing debates.json
// Backfills ~180 debates into the tension graph so agents start with history

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { extractAndStore, getGraphStats, closeMemoryDb } from "../src/lib/memory";
import type { Debate } from "../src/lib/agent-debate";

const ROOT = process.cwd();
const DEBATES_JSON = resolve(ROOT, "src/data/debates.json");

async function main() {
  console.log("Seeding memory graph from existing debates...\n");

  let debates: Debate[];
  try {
    const raw = await readFile(DEBATES_JSON, "utf-8");
    const parsed = JSON.parse(raw);
    debates = parsed.debates ?? (Array.isArray(parsed) ? parsed : [parsed]);
  } catch (e) {
    console.error("Failed to read debates.json:", e);
    process.exit(1);
  }

  console.log(`Found ${debates.length} debates to process\n`);

  let totalNodes = 0;
  let totalEdges = 0;
  let totalContradictions = 0;

  for (let i = 0; i < debates.length; i++) {
    const debate = debates[i];
    try {
      // Extract tickers from debate topic
      const tickers = extractTickersFromDebate(debate);
      const result = await extractAndStore(debate, tickers);
      totalNodes += result.nodes_created;
      totalEdges += result.edges_created;
      totalContradictions += result.contradictions_found;

      if ((i + 1) % 10 === 0 || i === debates.length - 1) {
        console.log(`  Processed ${i + 1}/${debates.length} debates (${totalNodes} nodes, ${totalEdges} edges, ${totalContradictions} contradictions)`);
      }
    } catch (e) {
      console.error(`  Debate ${debate.id ?? i} failed:`, e);
    }
  }

  console.log("\n=== SEED COMPLETE ===\n");
  console.log(`Total: ${totalNodes} nodes, ${totalEdges} edges, ${totalContradictions} contradictions\n`);

  // Print per-agent stats
  const agents = ["bull", "bear", "macro", "flow", "historian"] as const;
  console.log(`${"Agent".padEnd(12)} ${"Nodes".padStart(6)} ${"Edges".padStart(6)} ${"Contra".padStart(8)} ${"Unresol".padStart(8)} ${"AvgSal".padStart(8)} ${"MaxTen".padStart(8)}`);
  console.log("-".repeat(70));

  for (const agent of agents) {
    const stats = getGraphStats(agent);
    console.log(
      `${agent.padEnd(12)} ${String(stats.nodes).padStart(6)} ${String(stats.edges).padStart(6)} ${String(stats.contradictions).padStart(8)} ${String(stats.unresolved_predictions).padStart(8)} ${stats.avg_salience.toFixed(2).padStart(8)} ${stats.max_tension.toFixed(2).padStart(8)}`
    );
  }

  closeMemoryDb();
}

function extractTickersFromDebate(debate: Debate): string[] {
  const subject = debate.topic?.subject ?? "";
  const known = ["IONQ", "GOOG", "MSFT", "CEG", "QTUM", "IBM", "NVDA", "HON", "RGTI", "QBTS", "SGOV"];
  return known.filter(t => subject.includes(t));
}

main().catch(e => {
  console.error("Fatal:", e);
  process.exit(1);
});
