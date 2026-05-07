// Entrenched Coils — Dopamine Reward Prediction Error (RPE)
//
// Schultz (1997): Dopamine neurons fire proportional to prediction error.
// RPE = actual_reward - expected_reward
//
// When predictions resolve:
//   - Overconfident + WRONG: large negative RPE -> dramatically REDUCE salience
//     The agent was sure and was wrong. This memory is dangerous/misleading.
//   - Underconfident + RIGHT: large positive RPE -> BOOST salience
//     The agent was unsure but correct. This memory contains unrecognized signal.
//   - Calibrated + RIGHT: small positive RPE -> slight boost
//   - Calibrated + WRONG: small negative RPE -> slight reduction
//
// Edge weight propagation:
//   - Positive RPE on a node: STRENGTHEN "supports" edges, WEAKEN "contradicts" edges
//   - Negative RPE on a node: WEAKEN "supports" edges, STRENGTHEN "contradicts" edges
//   This creates a natural pressure for the graph to surface correct predictions
//   and suppress confidently-wrong ones.
//
// This is the FEEDBACK LOOP the system was missing. Without it, all memories
// are treated equally regardless of whether they led to correct predictions.

import type { MemoryNode, MemoryEdge } from "./types";
import { getMemoryDb, getNode, getOutgoingEdges, getIncomingEdges } from "./db";

// ── Constants ───────────────────────────────────────────────────────────────

// How much RPE affects salience (higher = more dramatic updates)
const SALIENCE_LEARNING_RATE = 0.3;

// Maximum salience change from a single RPE event
const MAX_SALIENCE_DELTA = 0.5;

// How much RPE affects connected edge weights
const EDGE_LEARNING_RATE = 0.2;

// Bounds for salience after RPE update
const MIN_SALIENCE = 0.05;
const MAX_SALIENCE = 2.5;

// Bounds for edge weight after RPE update
const MIN_EDGE_WEIGHT = 0.01;
const MAX_EDGE_WEIGHT = 5.0;

// ── Schema migration ────────────────────────────────────────────────────────

export function ensureDopamineSchema(): void {
  const db = getMemoryDb();
  // Create RPE events log table if not exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS rpe_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      node_id TEXT NOT NULL,
      agent_id TEXT NOT NULL,
      ts TEXT NOT NULL,
      predicted TEXT,
      actual TEXT,
      predicted_confidence REAL,
      rpe REAL NOT NULL,
      old_salience REAL NOT NULL,
      new_salience REAL NOT NULL,
      edges_updated INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_rpe_agent ON rpe_events(agent_id, ts DESC);
    CREATE INDEX IF NOT EXISTS idx_rpe_node ON rpe_events(node_id);
  `);
}

// ── Core RPE computation ────────────────────────────────────────────────────

export type PredictionOutcome = {
  nodeId: string;
  predicted: "up" | "down" | "flat";
  predictedConfidence: number;
  actual: "up" | "down" | "flat";
  actualMagnitude?: number; // e.g., +3.2% actual move (optional)
};

/**
 * Compute Reward Prediction Error.
 *
 * RPE = actual_reward - expected_reward
 * Where:
 *   actual_reward = +1 if correct, -1 if wrong
 *   expected_reward = confidence (what the agent expected to happen)
 *
 * Range: [-1.9, +0.7] approximately
 *   -1.9 = wrong + was 0.9 confident (worst case: overconfident + wrong)
 *   +0.7 = right + was 0.3 confident (best case: underconfident + right)
 *   0.0  = calibrated (confidence matched actual outcome probability)
 */
export function computeRPE(outcome: PredictionOutcome): number {
  const correct = outcome.predicted === outcome.actual;
  const actualReward = correct ? 1.0 : -1.0;
  const expectedReward = outcome.predictedConfidence;
  return actualReward - expectedReward;
}

/**
 * Alternative RPE that uses magnitude of move.
 * Larger moves produce stronger RPE signals.
 */
export function computeMagnitudeRPE(outcome: PredictionOutcome): number {
  if (outcome.actualMagnitude === undefined) return computeRPE(outcome);

  const correct = outcome.predicted === outcome.actual;
  const magnitude = Math.min(Math.abs(outcome.actualMagnitude) * 10, 2.0); // scale: 10% move = 1.0
  const actualReward = correct ? magnitude : -magnitude;
  const expectedReward = outcome.predictedConfidence;
  return actualReward - expectedReward;
}

// ── Apply RPE to node and edges ─────────────────────────────────────────────

export type DopamineUpdateResult = {
  nodeId: string;
  rpe: number;
  oldSalience: number;
  newSalience: number;
  edgesUpdated: number;
  supportEdgesAdjusted: number;
  contradictEdgesAdjusted: number;
};

/**
 * Apply dopamine update to a prediction node and its connected edges.
 * This is the core feedback loop.
 */
export function applyDopamineUpdate(outcome: PredictionOutcome): DopamineUpdateResult {
  ensureDopamineSchema();
  const db = getMemoryDb();
  const node = getNode(outcome.nodeId);
  if (!node) {
    return {
      nodeId: outcome.nodeId,
      rpe: 0,
      oldSalience: 0,
      newSalience: 0,
      edgesUpdated: 0,
      supportEdgesAdjusted: 0,
      contradictEdgesAdjusted: 0,
    };
  }

  const rpe = computeRPE(outcome);
  const oldSalience = node.salience;

  // Update salience based on RPE
  const salienceDelta = Math.sign(rpe) * Math.min(Math.abs(rpe) * SALIENCE_LEARNING_RATE, MAX_SALIENCE_DELTA);
  const newSalience = clamp(node.salience + salienceDelta, MIN_SALIENCE, MAX_SALIENCE);

  db.prepare(`
    UPDATE memory_nodes SET salience = ? WHERE id = ?
  `).run(newSalience, outcome.nodeId);

  // Update connected edge weights
  let edgesUpdated = 0;
  let supportEdgesAdjusted = 0;
  let contradictEdgesAdjusted = 0;

  const outgoing = getOutgoingEdges(outcome.nodeId);
  const incoming = getIncomingEdges(outcome.nodeId);
  const allEdges = [...outgoing, ...incoming];

  for (const edge of allEdges) {
    let weightMultiplier = 1.0;

    if (edge.edge_type === "supports") {
      // Positive RPE = prediction was right -> strengthen supporting evidence
      // Negative RPE = prediction was wrong -> weaken supporting evidence
      weightMultiplier = 1 + rpe * EDGE_LEARNING_RATE;
      supportEdgesAdjusted++;
    } else if (edge.edge_type === "contradicts") {
      // Positive RPE = prediction was right -> weaken contradicting evidence
      // Negative RPE = prediction was wrong -> strengthen the contradiction (it was right!)
      weightMultiplier = 1 - rpe * EDGE_LEARNING_RATE;
      contradictEdgesAdjusted++;
    } else if (edge.edge_type === "corrects") {
      // Corrections: if the correction led to a correct prediction, strengthen
      weightMultiplier = 1 + rpe * EDGE_LEARNING_RATE * 0.5;
    } else {
      continue; // Don't adjust 'follows' or 'evolves' edges
    }

    const newWeight = clamp(edge.weight * weightMultiplier, MIN_EDGE_WEIGHT, MAX_EDGE_WEIGHT);
    db.prepare(`UPDATE memory_edges SET weight = ? WHERE id = ?`).run(newWeight, edge.id);
    edgesUpdated++;
  }

  // Log the RPE event
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO rpe_events (node_id, agent_id, ts, predicted, actual, predicted_confidence, rpe, old_salience, new_salience, edges_updated)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    outcome.nodeId, node.agent_id, now,
    outcome.predicted, outcome.actual, outcome.predictedConfidence,
    rpe, oldSalience, newSalience, edgesUpdated
  );

  return {
    nodeId: outcome.nodeId,
    rpe,
    oldSalience,
    newSalience,
    edgesUpdated,
    supportEdgesAdjusted,
    contradictEdgesAdjusted,
  };
}

// ── Batch resolution ────────────────────────────────────────────────────────

/**
 * Resolve all unresolved predictions for a ticker with the actual outcome.
 * This is the integration point: call after market close with actual results.
 */
export function resolvePredictionsWithDopamine(
  ticker: string,
  actual: "up" | "down" | "flat",
  actualMagnitude?: number
): {
  resolved: number;
  avgRPE: number;
  results: DopamineUpdateResult[];
} {
  const db = getMemoryDb();

  // Find all unresolved prediction nodes for this ticker
  const nodes = db.prepare(`
    SELECT * FROM memory_nodes
    WHERE ticker = ? AND content_type = 'prediction' AND resolved = 0
  `).all(ticker) as any[];

  const results: DopamineUpdateResult[] = [];
  let totalRPE = 0;

  for (const row of nodes) {
    const node = parseNodeRow(row);
    if (!node.direction || !node.confidence) continue;

    // Mark as resolved in the DB
    const correct = node.direction === actual;
    const outcome = correct ? 1 : 0;
    const brier = (node.confidence - outcome) ** 2;
    db.prepare(`
      UPDATE memory_nodes SET resolved = 1, outcome_correct = ?, brier_component = ? WHERE id = ?
    `).run(correct ? 1 : 0, brier, node.id);

    // Apply dopamine update
    const result = applyDopamineUpdate({
      nodeId: node.id,
      predicted: node.direction,
      predictedConfidence: node.confidence,
      actual,
      actualMagnitude,
    });
    results.push(result);
    totalRPE += result.rpe;
  }

  return {
    resolved: results.length,
    avgRPE: results.length > 0 ? totalRPE / results.length : 0,
    results,
  };
}

// ── Statistics ──────────────────────────────────────────────────────────────

export function getDopamineStats(agentId?: string): {
  totalEvents: number;
  avgRPE: number;
  posRPECount: number;
  negRPECount: number;
  avgSalienceChange: number;
  recentEvents: Array<{ ts: string; rpe: number; predicted: string; actual: string }>;
} {
  const db = getMemoryDb();
  ensureDopamineSchema();

  const whereClause = agentId ? "WHERE agent_id = ?" : "";
  const params = agentId ? [agentId] : [];

  const total = (db.prepare(
    `SELECT COUNT(*) as c FROM rpe_events ${whereClause}`
  ).get(...params) as any).c;

  const avgRPE = (db.prepare(
    `SELECT AVG(rpe) as a FROM rpe_events ${whereClause}`
  ).get(...params) as any).a ?? 0;

  const posCount = (db.prepare(
    `SELECT COUNT(*) as c FROM rpe_events ${whereClause ? whereClause + " AND" : "WHERE"} rpe > 0`
  ).get(...params) as any).c;

  const negCount = (db.prepare(
    `SELECT COUNT(*) as c FROM rpe_events ${whereClause ? whereClause + " AND" : "WHERE"} rpe < 0`
  ).get(...params) as any).c;

  const avgChange = (db.prepare(
    `SELECT AVG(new_salience - old_salience) as a FROM rpe_events ${whereClause}`
  ).get(...params) as any).a ?? 0;

  const recent = db.prepare(
    `SELECT ts, rpe, predicted, actual FROM rpe_events ${whereClause} ORDER BY ts DESC LIMIT 10`
  ).all(...params) as any[];

  return {
    totalEvents: total,
    avgRPE,
    posRPECount: posCount,
    negRPECount: negCount,
    avgSalienceChange: avgChange,
    recentEvents: recent,
  };
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function parseNodeRow(row: any): MemoryNode {
  return {
    ...row,
    is_compressed: !!row.is_compressed,
    resolved: !!row.resolved,
    outcome_correct: row.outcome_correct === null ? null : !!row.outcome_correct,
    compressed_from: row.compressed_from ? JSON.parse(row.compressed_from) : null,
  };
}
