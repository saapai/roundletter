#!/usr/bin/env tsx
// Mass debate runner — runs 20 debates sequentially on different topics,
// building up the memory graph after each one.
//
// Usage:
//   npx tsx scripts/run-mass-debates.ts
//   npx tsx scripts/run-mass-debates.ts --profile light
//   npx tsx scripts/run-mass-debates.ts --profile heavy
//   npx tsx scripts/run-mass-debates.ts --start 5          # resume from debate #5
//   npx tsx scripts/run-mass-debates.ts --only 3,7,12      # run specific debates only

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { runLocalDebate } from "../src/lib/local-debate";
import { extractAndStore } from "../src/lib/memory/update";
import { getGraphStats, getMaxTensionPair, getNode, closeMemoryDb } from "../src/lib/memory/db";
import type { AgentId, Debate } from "../src/lib/agent-debate";

const ROOT = process.cwd();
const PORTFOLIO_JSON = resolve(ROOT, "src/data/portfolio.json");
const MASS_DEBATES_JSON = resolve(ROOT, "src/data/mass-debates.json");

type Portfolio = {
  baseline_date?: string;
  holdings: Array<{ ticker: string; target_pct?: number; name?: string }>;
};

// ── 20 debate topics across 7 categories ─────────────────────────────────────

const DEBATE_TOPICS: Array<{ id: number; category: string; topic: string; dayContext: string }> = [
  // --- Individual ticker deep dives ---
  {
    id: 1,
    category: "ticker-deep-dive",
    topic: "IONQ trapped-ion thesis check",
    dayContext:
      "Focus: IONQ thesis validation. IonQ is the largest pure-play quantum holding at 12% target. " +
      "Trapped-ion approach has theoretical advantages (connectivity, gate fidelity) but slower clock speeds. " +
      "Revenue is pre-meaningful. Is the current valuation defensible on a 5-year horizon? " +
      "What would invalidate the thesis? Pin arguments to specific milestones or price levels.",
  },
  {
    id: 2,
    category: "ticker-deep-dive",
    topic: "NVDA valuation at current multiples",
    dayContext:
      "Focus: NVDA valuation. NVIDIA trades at extreme forward multiples but dominates AI/ML accelerator market. " +
      "Quantum relevance: GPU-accelerated quantum simulation, hybrid classical-quantum workflows. " +
      "At 10% of portfolio, is NVDA appropriately sized? What P/E contraction scenario would trigger a trim? " +
      "Compare to historical semiconductor cycle peaks.",
  },
  {
    id: 3,
    category: "ticker-deep-dive",
    topic: "QBTS dilution risk from ATM shelf",
    dayContext:
      "Focus: QBTS dilution risk. D-Wave has an active ATM offering shelf. At 3% target weight (lottery tier), " +
      "the position is small but dilution could destroy shareholder value. D-Wave's annealing approach is niche — " +
      "optimization-only. Is the risk/reward still positive? What's the probability of a secondary offering in the next 6 months? " +
      "Portfolio trigger says kill_position_on_ATM_offering = true.",
  },
  {
    id: 4,
    category: "ticker-deep-dive",
    topic: "RGTI superconducting vs IONQ trapped-ion",
    dayContext:
      "Focus: RGTI vs IONQ head-to-head. Both are pure-play quantum at 5% and 12% target respectively. " +
      "Rigetti uses superconducting qubits (faster clock, harder to scale) vs IonQ's trapped ions (slower, better fidelity). " +
      "Should the portfolio favor one approach? Is 17% combined pure-play exposure too high? " +
      "Which has better odds of being above entry price in 3 years?",
  },

  // --- Strategy questions ---
  {
    id: 5,
    category: "strategy",
    topic: "Concentrate into top 3 vs maintain diversification",
    dayContext:
      "Strategy debate: The portfolio holds 10 positions across 5 buckets. Would concentrating into the top 3 highest-conviction " +
      "names (QTUM, MSFT, GOOG) improve risk-adjusted returns? Or does the barbell of big-tech + pure-play provide " +
      "necessary optionality? Half-Kelly sizing suggests smaller positions in high-uncertainty names. " +
      "Account size is ~$3,450 — does diversification even matter at this scale?",
  },
  {
    id: 6,
    category: "strategy",
    topic: "Momentum vs value: when to chase runners",
    dayContext:
      "Strategy debate: Kullamagi momentum rules say buy strength, cut weakness. Value says buy cheap, sell dear. " +
      "In the current quantum sector, which framework applies? Pure-plays have been volatile — IONQ swung from $41 to $35. " +
      "Should the portfolio add to winners (QTUM up steadily) or average down on losers (IONQ below entry)? " +
      "What's the base rate for momentum vs mean-reversion in pre-revenue tech?",
  },
  {
    id: 7,
    category: "strategy",
    topic: "When to trim: rules-based vs discretionary",
    dayContext:
      "Strategy debate: Portfolio triggers include trim_single_name_above_pct=15% and trim_pureplay_above_pct=12%. " +
      "Are these thresholds optimal? Should trimming be purely mechanical or should the panel override on high-conviction calls? " +
      "The panel_kill_switch limits to 2 trades/year — is that too few? " +
      "Historical data: the portfolio peaked at $4,825 and is now at $3,454 (drawdown -28.3%). Were trims missed?",
  },

  // --- Macro questions ---
  {
    id: 8,
    category: "macro",
    topic: "Fed rate path impact on quantum names",
    dayContext:
      "Macro debate: How does the Fed rate trajectory affect quantum stocks specifically? Pre-revenue companies " +
      "are long-duration assets — their value is in distant cash flows. Higher rates = higher discount rate = lower present value. " +
      "But the portfolio also holds SGOV (T-bill ETF) as dry powder. At what fed funds rate does the calculus flip? " +
      "Is the 10Y yield a better signal than the fed funds rate for this portfolio?",
  },
  {
    id: 9,
    category: "macro",
    topic: "Recession probability and portfolio impact",
    dayContext:
      "Macro debate: What is the current recession probability and how would a recession affect this portfolio? " +
      "Big-tech (MSFT, GOOG, NVDA) historically holds up better in recessions than speculative names. " +
      "Pure-plays (IONQ, RGTI, QBTS) could see 50-70% drawdowns in a recession. " +
      "Should the portfolio preemptively rotate from C_pureplay to E_drypowder? " +
      "Current dry powder is only 5% ($167). Is that enough of a buffer?",
  },
  {
    id: 10,
    category: "macro",
    topic: "AI bubble: parallels to dotcom and implications",
    dayContext:
      "Macro debate: Is the current AI/quantum enthusiasm a bubble comparable to dotcom 1999-2000? " +
      "Key similarities: pre-revenue companies at extreme valuations, retail enthusiasm, 'new paradigm' narratives. " +
      "Key differences: actual revenue growth in AI (unlike most dotcoms), real enterprise adoption. " +
      "If this IS a bubble, when does it pop? If not, why not? What would change your mind? " +
      "The portfolio is 20% pure-play — what's the right exposure if bubble probability is >40%?",
  },

  // --- Risk questions ---
  {
    id: 11,
    category: "risk",
    topic: "Correlation risk in the quantum cluster",
    dayContext:
      "Risk debate: IONQ, RGTI, QBTS, and QTUM are all quantum-exposed. In a quantum sentiment sell-off, " +
      "they will ALL drop simultaneously. Even MSFT/GOOG/IBM have quantum divisions that create correlation. " +
      "What is the effective number of independent bets in this portfolio? " +
      "Is the portfolio actually a single bet on quantum with different wrappers? " +
      "What's the max drawdown if quantum sentiment reverses like clean energy in 2021?",
  },
  {
    id: 12,
    category: "risk",
    topic: "ATM offering probability across pure-plays",
    dayContext:
      "Risk debate: Pre-revenue quantum companies need cash. IONQ, RGTI, and QBTS all have potential ATM shelf risks. " +
      "The portfolio trigger says kill_position_on_ATM_offering=true. " +
      "What's the probability each pure-play does a secondary offering in the next 12 months? " +
      "Rank them by dilution risk. How much cash runway does each have? " +
      "Should the kill trigger be automatic or should the panel debate each instance?",
  },
  {
    id: 13,
    category: "risk",
    topic: "Maximum drawdown scenario and survival plan",
    dayContext:
      "Risk debate: The portfolio already drew down 28.3% from peak ($4,825 to $3,454). " +
      "What's the worst realistic drawdown from here? Model a scenario where quantum hype collapses AND there's a recession. " +
      "At what portfolio value does the strategy become unrecoverable? " +
      "What's the plan if account value drops below $2,000? Below $1,500? " +
      "How many years to recover from a 50% drawdown at 25% CAGR?",
  },

  // --- Deployment questions ---
  {
    id: 14,
    category: "deployment",
    topic: "How to deploy $400 of new capital",
    dayContext:
      "Deployment debate: $400 of new capital is available. Where should it go? " +
      "Current allocation gaps: check each bucket's actual vs target weight. " +
      "Options: (a) add to existing underweight positions, (b) start a new position, " +
      "(c) add to SGOV dry powder and wait for a better entry, (d) split across multiple names. " +
      "At $3,454 account size, $400 is ~12% — a significant deployment. " +
      "Name specific tickers and dollar amounts.",
  },
  {
    id: 15,
    category: "deployment",
    topic: "Best risk-adjusted position in the portfolio",
    dayContext:
      "Deployment debate: If you could only hold ONE position from the current 10, which has the best risk-adjusted return? " +
      "Consider: Sharpe ratio expectation, max drawdown, correlation to the rest of the portfolio, " +
      "probability of being above entry price in 1 year. " +
      "Force a ranking of all 10 holdings by expected risk-adjusted return. " +
      "Does the ranking change at a 3-year horizon vs 1-year?",
  },
  {
    id: 16,
    category: "deployment",
    topic: "What to trim first if forced to raise cash",
    dayContext:
      "Deployment debate: If the portfolio needed to raise $500 in cash immediately, what gets sold first? " +
      "Consider: tax lots (some positions have losses that could offset the $638 realized gain from earlier), " +
      "conviction level, position size, and replacement cost (can you re-enter cheaply?). " +
      "The approximate realized YTD is -$412 post-reset. Any tax-loss harvesting opportunities? " +
      "Rank all 10 positions from 'sell first' to 'sell last'.",
  },

  // --- Historical analogs ---
  {
    id: 17,
    category: "historical-analog",
    topic: "Quantum pure-plays vs dotcom pure-plays",
    dayContext:
      "Historical analog debate: Compare current quantum pure-plays (IONQ, RGTI, QBTS) to dotcom pure-plays circa 1999. " +
      "Pets.com, Webvan, eToys — pre-revenue, story stocks, retail favorites. " +
      "But also Amazon and eBay — pre-revenue at the time, now trillion-dollar companies. " +
      "What's the base rate of survival for pre-revenue tech companies in a new paradigm? " +
      "Which quantum name is most likely to be the 'Amazon' and which is the 'Pets.com'?",
  },
  {
    id: 18,
    category: "historical-analog",
    topic: "IONQ vs Qualcomm 1999: trapped-ion as CDMA",
    dayContext:
      "Historical analog debate: IonQ's trapped-ion approach could be compared to Qualcomm's CDMA bet in the late 1990s. " +
      "Qualcomm had a proprietary technology that many doubted. It went from ~$5 to $100 in 1999, then crashed 75%. " +
      "But long-term holders who bought at the IPO made 50x. Is IonQ's trapped-ion a similar 'standard wars' bet? " +
      "What's the probability trapped-ion becomes the dominant qubit modality? " +
      "At $35/share, is IONQ priced like Qualcomm at $5 or at $100?",
  },
  {
    id: 19,
    category: "historical-analog",
    topic: "AI hype cycle: where are we on the Gartner curve",
    dayContext:
      "Historical analog debate: Map current AI/quantum enthusiasm to the Gartner hype cycle. " +
      "Are we at Peak of Inflated Expectations? Trough of Disillusionment? Slope of Enlightenment? " +
      "AI might be at different stages than quantum — AI has real revenue (NVDA), quantum doesn't. " +
      "If quantum is 2-3 years behind AI on the hype curve, does that mean buy now or wait for the trough? " +
      "What was the optimal entry point for cloud computing stocks on the hype cycle?",
  },

  // --- Cross-asset questions ---
  {
    id: 20,
    category: "cross-asset",
    topic: "CEG nuclear thesis: power for quantum compute",
    dayContext:
      "Cross-asset debate: Constellation Energy (CEG) at 10% target is the 'power-for-compute' macro bet. " +
      "Thesis: quantum computers + AI data centers need massive, reliable power. Nuclear is the only zero-carbon baseload. " +
      "But CEG trades at elevated multiples already. The nuclear renaissance narrative is crowded. " +
      "Is CEG the right vehicle? What about alternatives (VST, NRG, SMR)? " +
      "What if quantum computing turns out to need LESS power than expected (e.g., photonic qubits)?",
  },
];

// ── CLI args ─────────────────────────────────────────────────────────────────

function parseArgs(): {
  profile: "light" | "default" | "heavy";
  start: number;
  only: number[] | null;
} {
  const args = process.argv.slice(2);
  let profile: "light" | "default" | "heavy" = "default";
  let start = 0;
  let only: number[] | null = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--profile" && args[i + 1]) {
      profile = args[++i] as "light" | "default" | "heavy";
    } else if (args[i] === "--start" && args[i + 1]) {
      start = parseInt(args[++i], 10);
    } else if (args[i] === "--only" && args[i + 1]) {
      only = args[++i].split(",").map((n) => parseInt(n.trim(), 10));
    }
  }
  return { profile, start, only };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

async function readJsonOrDefault<T>(path: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(path, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

// Track agent positions across debates for consistency scoring
type AgentPositionLog = {
  debateId: number;
  topic: string;
  direction: "up" | "down" | "flat";
  confidence: number;
};

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const { profile, start, only } = parseArgs();
  const today = todayISO();

  console.log(`\n${"=".repeat(70)}`);
  console.log(`  MASS DEBATE RUNNER · ${today} · profile=${profile}`);
  console.log(`  ${DEBATE_TOPICS.length} topics queued`);
  if (start > 0) console.log(`  Resuming from debate #${start}`);
  if (only) console.log(`  Running only debates: ${only.join(", ")}`);
  console.log(`${"=".repeat(70)}\n`);

  // Load portfolio
  const portfolio = await readJsonOrDefault<Portfolio>(PORTFOLIO_JSON, { holdings: [] });
  const tickers = portfolio.holdings.map((h) => h.ticker);
  const universe = portfolio.holdings
    .map((h) => (h.target_pct ? `${h.ticker} ${h.target_pct}%` : h.ticker))
    .join(", ");

  // Load existing mass debates
  const existing = await readJsonOrDefault<{ debates: any[]; run_log: any[] }>(
    MASS_DEBATES_JSON,
    { debates: [], run_log: [] },
  );

  // Filter topics based on args
  const topicsToRun = DEBATE_TOPICS.filter((t) => {
    if (only) return only.includes(t.id);
    return t.id >= start;
  });

  console.log(`Running ${topicsToRun.length} debates...\n`);

  // Track results
  const completedDebates: any[] = [...existing.debates];
  const agentPositions: Record<AgentId, AgentPositionLog[]> = {
    bull: [],
    bear: [],
    macro: [],
    flow: [],
    historian: [],
  };
  let totalContradictions = 0;
  let totalNodes = 0;
  let totalEdges = 0;
  const failedDebates: Array<{ id: number; topic: string; error: string }> = [];

  for (const topicDef of topicsToRun) {
    const debateNum = topicsToRun.indexOf(topicDef) + 1;
    console.log(`\n${"─".repeat(70)}`);
    console.log(`  DEBATE ${debateNum}/${topicsToRun.length} · #${topicDef.id} · [${topicDef.category}]`);
    console.log(`  Topic: ${topicDef.topic}`);
    console.log(`${"─".repeat(70)}\n`);

    const dayContext = [
      `${today} — universe: ${universe}.`,
      "",
      topicDef.dayContext,
      "",
      "Moderator directive: pin the argument to specific positions, thresholds, or triggers in the book. " +
        "Each agent states the delta they would make. Do not drift into generic macro.",
    ].join("\n");

    try {
      const startTime = Date.now();

      const debate = await runLocalDebate({
        dayContext,
        maxArgumentRounds: 3,
        profile,
      });

      const duration = ((Date.now() - startTime) / 1000).toFixed(1);

      // Extract and store into memory graph
      console.log(`\n[mass-debate] Extracting memory from debate #${topicDef.id}...`);
      const memResult = await extractAndStore(debate, tickers);
      totalContradictions += memResult.contradictions_found;
      totalNodes += memResult.nodes_created;
      totalEdges += memResult.edges_created;

      // Track agent positions for consistency scoring
      for (const turn of debate.turns) {
        if (turn.phase === "argument" && turn.speaker !== "moderator") {
          const t = turn as any;
          const agentId = t.speaker as AgentId;
          if (agentPositions[agentId]) {
            agentPositions[agentId].push({
              debateId: topicDef.id,
              topic: topicDef.topic,
              direction: t.prediction,
              confidence: t.confidence ?? 0,
            });
          }
        }
      }

      // Print debate summary
      console.log(`\n  RESULT · ${duration}s · ${debate.turns.length} turns`);
      console.log(`  Topic: ${debate.topic.subject}`);
      console.log(`  Consensus: ${debate.consensus.reached ? debate.consensus.direction : "SPLIT"}`);
      console.log(`  Memory: +${memResult.nodes_created} nodes, +${memResult.edges_created} edges, ${memResult.contradictions_found} contradictions`);
      console.log("");

      // Print agent positions for this debate
      const lastRoundTurns = debate.turns.filter(
        (t) => t.phase === "argument" && t.speaker !== "moderator",
      );
      // Group by agent, take last occurrence (final round)
      const finalPositions = new Map<string, any>();
      for (const t of lastRoundTurns) {
        finalPositions.set(t.speaker, t);
      }
      for (const [speaker, t] of Array.from(finalPositions.entries())) {
        const at = t as any;
        console.log(`    ${speaker}: ${at.prediction} (${(at.confidence ?? 0).toFixed(2)}) — ${at.claim}`);
      }

      // Find scorecard
      const finalScorecard = [...debate.turns]
        .reverse()
        .find((t) => t.speaker === "moderator" && (t as any).scorecard);
      if (finalScorecard && (finalScorecard as any).scorecard) {
        const sc = (finalScorecard as any).scorecard;
        console.log(`\n    Scorecard: ${Object.entries(sc.percents).map(([a, p]) => `${a}=${p}%`).join(" ")}`);
      }

      // Store completed debate with metadata
      completedDebates.push({
        ...debate,
        mass_debate_id: topicDef.id,
        mass_debate_category: topicDef.category,
        mass_debate_topic: topicDef.topic,
        memory_result: memResult,
      });
    } catch (err: any) {
      console.error(`\n  FAILED · debate #${topicDef.id}: ${err.message}`);
      failedDebates.push({ id: topicDef.id, topic: topicDef.topic, error: err.message });
      // Continue to next debate
      continue;
    }
  }

  // Save all debates
  const trimmed = completedDebates.slice(-500);
  await writeFile(
    MASS_DEBATES_JSON,
    JSON.stringify(
      {
        debates: trimmed,
        run_log: [
          ...(existing.run_log || []),
          {
            ts: new Date().toISOString(),
            profile,
            topics_attempted: topicsToRun.length,
            topics_completed: topicsToRun.length - failedDebates.length,
            topics_failed: failedDebates.length,
            failed_ids: failedDebates.map((f) => f.id),
          },
        ],
      },
      null,
      2,
    ) + "\n",
    "utf-8",
  );
  console.log(`\nSaved to mass-debates.json (${trimmed.length} total debates)`);

  // ── Final report ─────────────────────────────────────────────────────────

  console.log(`\n${"=".repeat(70)}`);
  console.log(`  MASS DEBATE REPORT`);
  console.log(`${"=".repeat(70)}`);

  // 1. Memory graph stats per agent
  console.log(`\n--- MEMORY GRAPH STATS ---`);
  const agents: AgentId[] = ["bull", "bear", "macro", "flow", "historian"];
  for (const agentId of agents) {
    const stats = getGraphStats(agentId);
    console.log(
      `  ${agentId}: ${stats.nodes} nodes, ${stats.edges} edges, ` +
        `${stats.contradictions} contradictions, ${stats.unresolved_predictions} unresolved predictions, ` +
        `avg_salience=${stats.avg_salience.toFixed(2)}, max_tension=${stats.max_tension.toFixed(2)}`,
    );
  }

  // 2. Highest-tension contradiction pairs
  console.log(`\n--- HIGHEST-TENSION CONTRADICTIONS ---`);
  for (const agentId of agents) {
    const pair = getMaxTensionPair(agentId);
    if (pair) {
      const [srcId, tgtId] = pair;
      const src = getNode(srcId);
      const tgt = getNode(tgtId);
      if (src && tgt) {
        console.log(`  ${agentId}:`);
        console.log(`    A: ${src.content.slice(0, 100)}...`);
        console.log(`    B: ${tgt.content.slice(0, 100)}...`);
      }
    } else {
      console.log(`  ${agentId}: no contradictions`);
    }
  }

  // 3. Most frequently debated topic categories
  console.log(`\n--- TOPIC CATEGORY BREAKDOWN ---`);
  const categoryCounts: Record<string, number> = {};
  for (const t of topicsToRun) {
    categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
  }
  for (const [cat, count] of Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count} debates`);
  }

  // 4. Agent consistency scores
  console.log(`\n--- AGENT CONSISTENCY SCORES ---`);
  console.log(`  (How often each agent maintained the same directional call across debates)`);
  for (const agentId of agents) {
    const positions = agentPositions[agentId];
    if (positions.length < 2) {
      console.log(`  ${agentId}: insufficient data (${positions.length} positions)`);
      continue;
    }

    // Count direction changes between consecutive debates
    let changes = 0;
    // Group by final position per debate (take last entry per debate)
    const finalByDebate = new Map<number, AgentPositionLog>();
    for (const p of positions) {
      finalByDebate.set(p.debateId, p);
    }
    const finals = Array.from(finalByDebate.values()).sort((a, b) => a.debateId - b.debateId);

    for (let i = 1; i < finals.length; i++) {
      if (finals[i].direction !== finals[i - 1].direction) {
        changes++;
      }
    }

    const consistency = finals.length > 1 ? ((1 - changes / (finals.length - 1)) * 100).toFixed(1) : "N/A";
    const directionCounts = { up: 0, down: 0, flat: 0 };
    for (const f of finals) directionCounts[f.direction]++;
    const avgConf = (finals.reduce((s, f) => s + f.confidence, 0) / finals.length).toFixed(2);

    console.log(
      `  ${agentId}: consistency=${consistency}% · ` +
        `up=${directionCounts.up} down=${directionCounts.down} flat=${directionCounts.flat} · ` +
        `avg_conf=${avgConf} · changes=${changes}/${finals.length - 1}`,
    );
  }

  // 5. Summary totals
  console.log(`\n--- TOTALS ---`);
  console.log(`  Debates attempted: ${topicsToRun.length}`);
  console.log(`  Debates completed: ${topicsToRun.length - failedDebates.length}`);
  console.log(`  Debates failed: ${failedDebates.length}`);
  if (failedDebates.length > 0) {
    for (const f of failedDebates) {
      console.log(`    #${f.id} ${f.topic}: ${f.error}`);
    }
  }
  console.log(`  Memory nodes created: ${totalNodes}`);
  console.log(`  Memory edges created: ${totalEdges}`);
  console.log(`  Contradictions found: ${totalContradictions}`);

  // Cleanup
  closeMemoryDb();

  console.log(`\n${"=".repeat(70)}`);
  console.log(`  DONE`);
  console.log(`${"=".repeat(70)}\n`);
}

main().catch((e) => {
  console.error(e);
  closeMemoryDb();
  process.exit(1);
});
