// Entrenched Coils — Edge weight computation
//
// Three independent channels combined into a composite traversal weight.
// Key insight: contradictions INCREASE weight — tension is information.
//
// composite = alpha * w_temporal + beta * w_conviction + gamma * w_tension
// where gamma > alpha, beta (tension dominates)

import type { MemoryNode, MemoryEdge, EdgeType } from "./types";

// ── Constants ───────────────────────────────────────────────────────────────

// Composite weight coefficients — tuned 2026-05-20 after audit.
// Conviction was dead weight (all agents predict at 0.70 flat).
// Shifted to tension (the only discriminative channel) and exploration
// (99.8% of edges were never traversed due to IONQ concentration).
const ALPHA = 0.15; // temporal proximity (was 0.20)
const BETA  = 0.10; // conviction strength (was 0.25 — dead channel with flat confidence)
const GAMMA = 0.55; // contradiction tension (was 0.45 — primary signal)
const DELTA = 0.20; // traversal exploration bonus (was 0.10 — forces breadth)

// Temporal decay: half-life ~23 days (lambda = ln(2)/23 ≈ 0.03)
const LAMBDA_TEMPORAL = 0.03;

// Salience decay rates by content type
export const DECAY_RATES: Record<string, number> = {
  identity:    0.001,  // effectively permanent
  trade:       0.015,  // ~46 day half-life (trades matter longer than claims)
  prediction:  0.02,   // ~35 day half-life
  correction:  0.03,   // ~23 day half-life
  claim:       0.05,   // ~14 day half-life (default)
  observation: 0.07,   // ~10 day half-life
};

// ── Temporal Weight ─────────────────────────────────────────────────────────
// How recently the edge was created. Decays exponentially.
// w_temporal(e) = exp(-lambda * delta_days)

export function computeTemporalWeight(edgeCreatedAt: string, now?: Date): number {
  const t = now ?? new Date();
  const deltaDays = (t.getTime() - new Date(edgeCreatedAt).getTime()) / 86_400_000;
  return Math.exp(-LAMBDA_TEMPORAL * Math.max(0, deltaDays));
}

// ── Conviction Weight ───────────────────────────────────────────────────────
// How strongly the agent believed both endpoints.
// Rewards confidence DIVERGENCE — if one memory was 0.9 and the other 0.3,
// the edge is MORE interesting than two memories both at 0.6.
//
// w_conviction(e) = avg_conf * (1 + |conf_a - conf_b|)

export function computeConvictionWeight(
  sourceConfidence: number | null,
  targetConfidence: number | null,
): number {
  const confA = sourceConfidence ?? 0.5;
  const confB = targetConfidence ?? 0.5;
  const avg = (confA + confB) / 2;
  const divergence = Math.abs(confA - confB);
  return avg * (1 + divergence);
}

// ── Tension Weight ──────────────────────────────────────────────────────────
// The core of Entrenched Coils. Contradictions amplify tension.
// Unresolved contradictions have MORE tension than resolved ones.
// Being proven WRONG creates high tension (important learning signal).
//
// For 'contradicts':
//   base = 1.0 + |conf_source - conf_target|
//   resolution_bonus = 0 if unresolved, 0.5 if one correct, 1.0 if one wrong
//   unresolved_mult = 1.5 if both unresolved, 1.0 if one resolved, 0.3 if both resolved
//
// For 'supports': 0 (no tension in agreement)
// For 'corrects': 0.5 * base (self-corrections carry moderate tension)
// For 'follows': 0 (pure temporal sequence)
// For 'evolves': 0.3 * base (identity evolution carries light tension)

export function computeTensionWeight(
  edgeType: EdgeType,
  sourceNode: Pick<MemoryNode, "confidence" | "resolved" | "outcome_correct">,
  targetNode: Pick<MemoryNode, "confidence" | "resolved" | "outcome_correct">,
): number {
  const confA = sourceNode.confidence ?? 0.5;
  const confB = targetNode.confidence ?? 0.5;
  const baseTension = 1.0 + Math.abs(confA - confB);

  switch (edgeType) {
    case "contradicts": {
      // Resolution bonus: being proven wrong = high tension (learning signal)
      let resolutionBonus = 0;
      if (sourceNode.resolved && sourceNode.outcome_correct === false) resolutionBonus = 1.0;
      else if (targetNode.resolved && targetNode.outcome_correct === false) resolutionBonus = 1.0;
      else if (sourceNode.resolved && sourceNode.outcome_correct === true) resolutionBonus = 0.5;
      else if (targetNode.resolved && targetNode.outcome_correct === true) resolutionBonus = 0.5;

      // Unresolved multiplier: active contradictions are most interesting
      let unresolvedMult = 1.0;
      if (!sourceNode.resolved && !targetNode.resolved) unresolvedMult = 1.5;  // both active
      else if (sourceNode.resolved && targetNode.resolved) unresolvedMult = 0.3;  // historical

      const rawTension = baseTension * (1 + resolutionBonus) * unresolvedMult;
      // Weber-Fechner: log-compress extreme tensions so moderate contradictions
      // still compete for retrieval. Without this, one 5.0 tension edge drowns
      // out ten 1.5 edges. log2(1+x) maps: 1→1, 2→1.58, 3→2, 5→2.58
      return Math.log2(1 + rawTension);
    }
    case "corrects":
      return 0.5 * baseTension;
    case "evolves":
      return 0.3 * baseTension;
    case "supports":
    case "follows":
    default:
      return 0;
  }
}

// ── Traversal Exploration Bonus ──────────────────────────────────────────────
// Edges that have NEVER been traversed get a small exploration bonus.
// Edges traversed many times without leading to correct predictions get penalized.
// This ensures traversal_count and last_traversed actually influence retrieval.
//
// exploration_bonus = 1.0 + 0.1 / (1.0 + traversal_count)
//   → never-traversed edges: 1.10 (10% boost to discover unused paths)
//   → traversed once: 1.05
//   → traversed 9 times: 1.01 (bonus nearly gone)
//
// If traversed edges connect to nodes that were resolved WRONG, apply a penalty:
//   → penalty = -0.15 * (wrong_outcomes / traversal_count)
//   → frequently-traversed edges leading to bad predictions get deprioritized

export function computeExplorationBonus(
  traversalCount: number,
  wrongOutcomes: number = 0,
): number {
  // Base exploration: unused edges get a boost that decays with use
  const exploration = 1.0 + 0.1 / (1.0 + traversalCount);

  // Penalty: edges that have been traversed but led to wrong predictions
  const penalty = traversalCount > 0
    ? 0.15 * (wrongOutcomes / traversalCount)
    : 0;

  return Math.max(0.5, exploration - penalty);  // floor at 0.5 — never fully kill an edge
}

// ── Composite Weight ────────────────────────────────────────────────────────
// Combined traversal priority. Used by the priority-queue in traverse.ts.

export function computeCompositeWeight(
  wTemporal: number,
  wConviction: number,
  wTension: number,
  wExploration: number = 1.0,
): number {
  return ALPHA * wTemporal + BETA * wConviction + GAMMA * wTension + DELTA * wExploration;
}

// ── Full edge weight computation ────────────────────────────────────────────

export function computeEdgeWeights(
  edgeType: EdgeType,
  edgeCreatedAt: string,
  sourceNode: Pick<MemoryNode, "confidence" | "resolved" | "outcome_correct">,
  targetNode: Pick<MemoryNode, "confidence" | "resolved" | "outcome_correct">,
  traversalCount: number = 0,
): { w_temporal: number; w_conviction: number; w_tension: number; w_exploration: number; weight: number } {
  const w_temporal = computeTemporalWeight(edgeCreatedAt);
  const w_conviction = computeConvictionWeight(sourceNode.confidence, targetNode.confidence);
  const w_tension = computeTensionWeight(edgeType, sourceNode, targetNode);

  // Count how many endpoint nodes were resolved wrong — edges leading to bad predictions get penalized
  let wrongOutcomes = 0;
  if (sourceNode.resolved && sourceNode.outcome_correct === false) wrongOutcomes++;
  if (targetNode.resolved && targetNode.outcome_correct === false) wrongOutcomes++;

  const w_exploration = computeExplorationBonus(traversalCount, wrongOutcomes);
  const weight = computeCompositeWeight(w_temporal, w_conviction, w_tension, w_exploration);
  return { w_temporal, w_conviction, w_tension, w_exploration, weight };
}

// ── Node salience decay ─────────────────────────────────────────────────────
// salience(t) = salience_0 * exp(-decay * days) + access_boost
// Nodes that keep getting retrieved maintain salience. Never-retrieved nodes fade.

export function computeCurrentSalience(node: Pick<MemoryNode, "salience" | "decay_rate" | "created_at" | "access_count" | "last_accessed">): number {
  const now = Date.now();
  const daysSinceCreation = (now - new Date(node.created_at).getTime()) / 86_400_000;
  const daysSinceAccess = (now - new Date(node.last_accessed).getTime()) / 86_400_000;

  const decayed = node.salience * Math.exp(-node.decay_rate * daysSinceCreation);
  // Weber-Fechner: log-compress access count to prevent highly-accessed nodes
  // from dominating. access_count 50 → 0.39 instead of 5.0.
  const accessBoost = 0.1 * Math.log(1 + node.access_count) * Math.exp(-0.1 * daysSinceAccess);

  return Math.max(0.01, decayed + accessBoost);  // floor at 0.01
}
