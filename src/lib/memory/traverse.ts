// Entrenched Coils — Priority-first graph traversal
//
// NOT cosine similarity. NOT BFS. NOT random walk.
// This is a max-heap traversal ordered by cumulative path tension.
// High-tension edges get traversed first — contradictions are surfaced
// before agreements because unresolved conflicts are information.

import type { AgentId } from "../agent-debate";
import type { MemoryNode, MemoryEdge, RetrievedMemory, MemoryContext } from "./types";
import {
  getNode, getOutgoingEdges, getIncomingEdges, touchNode, touchEdge,
  getNodesByTicker, getIdentityNodes, getUnresolvedPredictions,
  getHighTensionNodes, getNodeCount, getMaxTensionPair, getLatestIdentity,
} from "./db";
import { computeCurrentSalience } from "./weights";
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
  const maxMemories = opts.max_memories ?? 10;
  const maxDepth = opts.max_depth ?? 4;
  const tickers = opts.tickers ?? [];
  const reconsolidate = opts.enableReconsolidation ?? true;

  // Ensure schema has labile_until column
  if (reconsolidate) {
    try { ensureReconsolidationSchema(); } catch { /* ignore if already exists */ }
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
      heap.push({
        node: target,
        edge,
        path_tension: edge.w_tension * computeCurrentSalience(target),
        path_length: 1,
        reason: formatReason(seed, edge),
      });
    }

    // Also check incoming contradiction edges (bidirectional tension)
    for (const edge of getIncomingEdges(seed.id)) {
      if (edge.edge_type !== "contradicts") continue;
      const source = getNode(edge.source_id);
      if (!source || visited.has(source.id)) continue;
      heap.push({
        node: source,
        edge,
        path_tension: edge.w_tension * computeCurrentSalience(source),
        path_length: 1,
        reason: `CONTRADICTED BY "${seed.content.slice(0, 60)}..."`,
      });
    }
  }

  // Walk the graph: pop highest-tension items first
  while (heap.size > 0 && results.length < maxMemories) {
    const item = heap.pop()!;
    if (visited.has(item.node.id)) continue;
    if (item.path_length > maxDepth) continue;

    visited.add(item.node.id);

    // Apply reconsolidation to traversed nodes
    if (reconsolidate && item.node.content_type !== "identity") {
      applyReconsolidationOnRetrieval(item.node.id);
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
      const newTension = item.path_tension + edge.w_tension * computeCurrentSalience(target);
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
  };
}

// ── Format for prompt injection ─────────────────────────────────────────────

export function formatMemoryForPrompt(ctx: MemoryContext): string {
  if (ctx.retrieved.length === 0) return "";

  const lines: string[] = [
    `YOUR MEMORY (${ctx.total_nodes} total, ${ctx.retrieved.length} retrieved):`,
  ];

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

  return lines.join("\n");
}
