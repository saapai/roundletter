// Entrenched Coils — Priority-first graph traversal
//
// NOT cosine similarity. NOT BFS. NOT random walk.
// This is a max-heap traversal ordered by cumulative path tension.
// High-tension edges get traversed first — contradictions are surfaced
// before agreements because unresolved conflicts are information.

import type { AgentId } from "../agent-debate";
import type { MemoryNode, MemoryEdge, RetrievedMemory, MemoryContext, NeuromodState } from "./types";
import {
  getNode, getOutgoingEdges, getIncomingEdges, touchNode, touchEdge,
  getNodesByTicker, getIdentityNodes, getUnresolvedPredictions,
  getHighTensionNodes, getNodeCount, getMaxTensionPair, getLatestIdentity,
  getMemoryDb,
} from "./db";
import { computeCurrentSalience, computeExplorationBonus } from "./weights";
import { applyReconsolidationOnRetrieval, ensureReconsolidationSchema } from "./reconsolidation";

// ── Max-heap for priority traversal ─────────────────────────────────────────

type HeapItem = {
  node: MemoryNode;
  edge: MemoryEdge | null;
  path_tension: number;
  path_length: number;
  reason: string;
};

class MaxHeap {
  private items: HeapItem[] = [];

  push(item: HeapItem): void {
    this.items.push(item);
    this._bubbleUp(this.items.length - 1);
  }

  pop(): HeapItem | undefined {
    if (this.items.length === 0) return undefined;
    const top = this.items[0];
    const last = this.items.pop()!;
    if (this.items.length > 0) {
      this.items[0] = last;
      this._sinkDown(0);
    }
    return top;
  }

  get size(): number { return this.items.length; }

  private _bubbleUp(i: number): void {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.items[i].path_tension <= this.items[parent].path_tension) break;
      [this.items[i], this.items[parent]] = [this.items[parent], this.items[i]];
      i = parent;
    }
  }

  private _sinkDown(i: number): void {
    const n = this.items.length;
    while (true) {
      let largest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n && this.items[left].path_tension > this.items[largest].path_tension) largest = left;
      if (right < n && this.items[right].path_tension > this.items[largest].path_tension) largest = right;
      if (largest === i) break;
      [this.items[i], this.items[largest]] = [this.items[largest], this.items[i]];
      i = largest;
    }
  }
}

// ── Neuromodulatory state detection ─────────────────────────────────────────
// Schultz + Aston-Jones: detect whether the agent is in learning mode
// (high RPE variance, many errors → explore) or exploitation mode
// (low RPE variance, mostly correct → exploit high-confidence paths).
//
// ACh (acetylcholine) = learning/uncertainty signal: sigmoid(variance * 3 - 1.5)
// NE (norepinephrine) = alert/streak signal: min(1.0, consecutive_wrong * 0.25)

const NEUTRAL_STATE: NeuromodState = { ach: 0.5, ne: 0, mode: "learning" };

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export function computeNeuromodState(agentId: AgentId): NeuromodState {
  try {
    const db = getMemoryDb();

    // Check if rpe_events table exists
    const tableCheck = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='rpe_events'"
    ).get() as any;
    if (!tableCheck) return NEUTRAL_STATE;

    // Query last 30 RPE events for this agent
    const events = db.prepare(
      "SELECT rpe, predicted, actual FROM rpe_events WHERE agent_id = ? ORDER BY ts DESC LIMIT 30"
    ).all(agentId) as { rpe: number; predicted: string; actual: string }[];

    if (events.length === 0) return NEUTRAL_STATE;

    // Compute RPE variance
    const rpes = events.map(e => e.rpe);
    const mean = rpes.reduce((s, v) => s + v, 0) / rpes.length;
    const rpe_variance = rpes.reduce((s, v) => s + (v - mean) ** 2, 0) / rpes.length;

    // Compute accuracy rate (not directly used for ACh/NE but useful context)
    const correct_count = events.filter(e => e.predicted === e.actual).length;
    const accuracy_rate = correct_count / events.length;

    // ACh level: high variance → high ACh → learning mode
    const ach = sigmoid(rpe_variance * 3 - 1.5);

    // NE level: consecutive wrong predictions from most recent
    let consecutive_wrong = 0;
    for (const e of events) {
      if (e.predicted !== e.actual) {
        consecutive_wrong++;
      } else {
        break;
      }
    }
    const ne = Math.min(1.0, consecutive_wrong * 0.25);

    // Determine mode
    let mode: NeuromodState["mode"];
    if (ne > 0.5) {
      mode = "alert";
    } else if (ach > 0.6) {
      mode = "learning";
    } else if (ach < 0.3 && ne < 0.3) {
      mode = "exploiting";
    } else {
      // Transitional: default to learning (safer)
      mode = "learning";
    }

    return { ach, ne, mode };
  } catch {
    // Graceful fallback: if anything goes wrong (table missing, etc.), neutral state
    return NEUTRAL_STATE;
  }
}

// ── Seed finding ────────────────────────────────────────────────────────────
// Seeds are the starting points for graph traversal.
// We use SQL queries, not embeddings — avoiding the need for an embedding model.

function findSeeds(agentId: AgentId, tickers: string[]): MemoryNode[] {
  const seeds = new Map<string, MemoryNode>();

  // 1. Same ticker, high salience
  for (const ticker of tickers) {
    for (const node of getNodesByTicker(agentId, ticker, 3)) {
      seeds.set(node.id, node);
    }
  }

  // 2. Identity nodes (always seeded — the agent's core beliefs)
  for (const node of getIdentityNodes(agentId)) {
    seeds.set(node.id, node);
  }

  // 3. Unresolved predictions (active bets are always relevant)
  for (const node of getUnresolvedPredictions(agentId, 3)) {
    seeds.set(node.id, node);
  }

  // 4. Highest tension nodes (the "hottest" contradictions)
  for (const node of getHighTensionNodes(agentId, 3)) {
    seeds.set(node.id, node);
  }

  return Array.from(seeds.values());
}

function formatReason(fromNode: MemoryNode, edge: MemoryEdge): string {
  const typeLabel = edge.edge_type === "contradicts" ? "CONTRADICTS"
    : edge.edge_type === "corrects" ? "CORRECTS"
    : edge.edge_type === "supports" ? "supports"
    : edge.edge_type === "evolves" ? "evolves from"
    : "follows";
  return `${typeLabel} "${fromNode.content.slice(0, 60)}..." (tension: ${edge.w_tension.toFixed(2)})`;
}

// ── Main traversal ──────────────────────────────────────────────────────────

export function retrieve(
  agentId: AgentId,
  opts: {
    tickers?: string[];
    max_memories?: number;
    max_depth?: number;
    enableReconsolidation?: boolean;
  } = {},
): MemoryContext {
  const startTime = Date.now();
  let maxMemories = opts.max_memories ?? 10;
  const maxDepth = opts.max_depth ?? 4;
  const tickers = opts.tickers ?? [];
  const reconsolidate = opts.enableReconsolidation ?? true;

  // Ensure schema has labile_until column
  if (reconsolidate) {
    try { ensureReconsolidationSchema(); } catch { /* ignore if already exists */ }
  }

  // ── Neuromodulatory state switching ──────────────────────────────────
  // Detect learning vs exploitation vs alert mode from RPE history.
  // Adjusts exploration/tension weights and memory budget dynamically.
  const neuroState = computeNeuromodState(agentId);

  // Weight multipliers — default to neutral (no effect)
  let explorationMult = 1.0;
  let tensionMult = 1.0;
  let temporalMult = 1.0;
  let reconsolidationLabilityMult = 1.0; // multiplied into LABILITY_FACTOR effect

  if (neuroState.ach > 0.6) {
    // High ACh → learning mode: explore more, trust tension less
    explorationMult = 1 + neuroState.ach;        // 1.6–2.0x exploration
    tensionMult = 1 - 0.3 * neuroState.ach;      // 0.70–0.82x tension
    maxMemories += 3;                              // wider net
  } else if (neuroState.ach < 0.3 && neuroState.ne < 0.3) {
    // Low ACh + Low NE → exploitation mode: narrow focus on high-confidence paths
    explorationMult = 0.5;                         // halve exploration
    tensionMult = 1.2;                             // boost tension (trust the graph)
    maxMemories = Math.max(3, maxMemories - 2);    // tighter retrieval
  }

  if (neuroState.ne > 0.5) {
    // High NE → alert mode: recent memories matter more, reconsolidate harder
    temporalMult = 2.0;                            // double temporal weight
    reconsolidationLabilityMult = 0.7;             // more aggressive lability
  }

  const seeds = findSeeds(agentId, tickers);
  const visited = new Set<string>();
  const heap = new MaxHeap();
  const results: RetrievedMemory[] = [];

  // Seed the heap: add seed nodes directly + their outgoing edges
  for (const seed of seeds) {
    if (visited.has(seed.id)) continue;
    visited.add(seed.id);

    let salience = computeCurrentSalience(seed);
    // Apply reconsolidation: retrieved nodes become labile (salience reduced)
    if (reconsolidate && seed.content_type !== "identity") {
      salience = applyReconsolidationOnRetrieval(seed.id);
      // Alert mode: more aggressive reconsolidation (LABILITY_FACTOR * 0.7 effect)
      if (reconsolidationLabilityMult < 1.0) {
        salience *= reconsolidationLabilityMult;
      }
    }
    results.push({
      node: seed,
      path_tension: salience,
      path_length: 0,
      retrieval_reason: "seed",
      edge_from: null,
    });
    touchNode(seed.id);

    // Add outgoing edges to the heap
    for (const edge of getOutgoingEdges(seed.id)) {
      const target = getNode(edge.target_id);
      if (!target || visited.has(target.id)) continue;
      const exploration = computeExplorationBonus(edge.traversal_count ?? 0) * explorationMult;
      const tension = edge.w_tension * tensionMult;
      const temporal = computeCurrentSalience(target) * temporalMult;
      heap.push({
        node: target,
        edge,
        path_tension: tension * temporal * exploration,
        path_length: 1,
        reason: formatReason(seed, edge),
      });
    }

    // Also check incoming contradiction edges (bidirectional tension)
    for (const edge of getIncomingEdges(seed.id)) {
      if (edge.edge_type !== "contradicts") continue;
      const source = getNode(edge.source_id);
      if (!source || visited.has(source.id)) continue;
      const exploration = computeExplorationBonus(edge.traversal_count ?? 0) * explorationMult;
      const tension = edge.w_tension * tensionMult;
      const temporal = computeCurrentSalience(source) * temporalMult;
      heap.push({
        node: source,
        edge,
        path_tension: tension * temporal * exploration,
        path_length: 1,
        reason: `CONTRADICTED BY "${seed.content.slice(0, 60)}..."`,
      });
    }
  }

  // Walk the graph: pop highest-tension items first.
  // Ticker coverage penalty: penalize nodes from over-represented tickers
  // so retrieval surfaces diverse holdings, not just IONQ 10 times.
  // penalty = 1 / (1 + 0.3 * same_ticker_count_in_results)
  //   1st of a ticker: 1.00, 2nd: 0.77, 3rd: 0.63, 5th: 0.40
  const tickerCounts = new Map<string, number>();

  while (heap.size > 0 && results.length < maxMemories) {
    const item = heap.pop()!;
    if (visited.has(item.node.id)) continue;
    if (item.path_length > maxDepth) continue;

    // Apply ticker coverage penalty — suppress over-represented tickers
    const ticker = item.node.ticker ?? "";
    if (ticker) {
      const count = tickerCounts.get(ticker) ?? 0;
      const coveragePenalty = 1.0 / (1.0 + 0.3 * count);
      item.path_tension *= coveragePenalty;
      // If penalized tension is now lower than what's left in the heap,
      // re-push and let a different ticker surface instead
      if (heap.size > 0 && count >= 3) {
        // After 3 nodes of the same ticker, skip unless tension is very high
        if (item.path_tension < 1.0) continue;
      }
    }

    visited.add(item.node.id);
    if (ticker) tickerCounts.set(ticker, (tickerCounts.get(ticker) ?? 0) + 1);

    // Apply reconsolidation to traversed nodes
    if (reconsolidate && item.node.content_type !== "identity") {
      const reconSalience = applyReconsolidationOnRetrieval(item.node.id);
      // Alert mode: more aggressive reconsolidation
      if (reconsolidationLabilityMult < 1.0) {
        const db = getMemoryDb();
        db.prepare("UPDATE memory_nodes SET salience = ? WHERE id = ?")
          .run(reconSalience * reconsolidationLabilityMult, item.node.id);
      }
    }

    results.push({
      node: item.node,
      path_tension: item.path_tension,
      path_length: item.path_length,
      retrieval_reason: item.reason,
      edge_from: item.edge,
    });

    touchNode(item.node.id);
    if (item.edge) touchEdge(item.edge.id);

    // Expand: add this node's outgoing edges to the heap
    for (const edge of getOutgoingEdges(item.node.id)) {
      const target = getNode(edge.target_id);
      if (!target || visited.has(target.id)) continue;
      const exploration = computeExplorationBonus(edge.traversal_count ?? 0) * explorationMult;
      const tension = edge.w_tension * tensionMult;
      const temporal = computeCurrentSalience(target) * temporalMult;
      const newTension = item.path_tension + tension * temporal * exploration;
      heap.push({
        node: target,
        edge,
        path_tension: newTension,
        path_length: item.path_length + 1,
        reason: formatReason(item.node, edge),
      });
    }
  }

  // Sort by path tension (highest first)
  results.sort((a, b) => b.path_tension - a.path_tension);

  // Build identity summary
  const identity = getLatestIdentity(agentId);
  const identitySummary = identity?.identity_text ?? "no identity snapshot yet";

  return {
    agent_id: agentId,
    retrieved: results,
    total_nodes: getNodeCount(agentId),
    max_tension_pair: getMaxTensionPair(agentId),
    identity_summary: identitySummary,
    retrieval_ms: Date.now() - startTime,
    neuromod_state: neuroState,
  };
}

// ── Format for prompt injection ─────────────────────────────────────────────

export function formatMemoryForPrompt(ctx: MemoryContext): string {
  if (ctx.retrieved.length === 0) return "";

  const lines: string[] = [
    `YOUR MEMORY (${ctx.total_nodes} total, ${ctx.retrieved.length} retrieved):`,
  ];

  // Neuromod state indicator
  if (ctx.neuromod_state) {
    const ns = ctx.neuromod_state;
    const modeLabel = ns.mode === "learning" ? "LEARNING (exploring)"
      : ns.mode === "alert" ? "ALERT (recent errors)"
      : "EXPLOITING (focused)";
    lines.push(`NEUROMOD STATE: ${modeLabel} (ACh: ${ns.ach.toFixed(2)}, NE: ${ns.ne.toFixed(2)})`);
  }

  if (ctx.max_tension_pair) {
    const [a, b] = ctx.max_tension_pair;
    const nodeA = getNode(a);
    const nodeB = getNode(b);
    if (nodeA && nodeB) {
      lines.push(`ACTIVE TENSION: "${nodeA.content.slice(0, 80)}" vs "${nodeB.content.slice(0, 80)}"`);
    }
  }

  lines.push(`IDENTITY: ${ctx.identity_summary}`, "");

  for (const mem of ctx.retrieved) {
    const tensionTag = mem.path_tension > 1.5 ? " [HIGH TENSION]"
      : mem.path_tension > 0.5 ? " [tension]" : "";
    const resolvedTag = mem.node.resolved
      ? (mem.node.outcome_correct ? " [CORRECT]" : " [WRONG]") : "";
    const age = Math.floor((Date.now() - new Date(mem.node.created_at).getTime()) / 86_400_000);

    lines.push(
      `  [${mem.node.content_type}${tensionTag}${resolvedTag}] ${mem.node.content}` +
      ` (conf: ${mem.node.confidence?.toFixed(2) ?? "?"}, age: ${age}d)`
    );
    if (mem.retrieval_reason !== "seed") {
      lines.push(`    via: ${mem.retrieval_reason}`);
    }
  }

  // Flat confidence calibration warning
  // If the agent's last 20 predictions all have confidence between 0.65-0.75,
  // they're not varying confidence based on evidence strength.
  const predictionNodes = ctx.retrieved
    .filter(m => m.node.content_type === "prediction" && m.node.confidence !== null)
    .slice(0, 20);
  if (predictionNodes.length >= 20) {
    const allFlat = predictionNodes.every(
      m => m.node.confidence! >= 0.65 && m.node.confidence! <= 0.75
    );
    if (allFlat) {
      lines.push("");
      lines.push(
        "WARNING: Your last 20 predictions were all near 0.70 confidence. " +
        "Consider varying your confidence based on evidence strength."
      );
    }
  }

  return lines.join("\n");
}
