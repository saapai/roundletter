// Entrenched Coils — Database layer
// SQLite graph storage for memory nodes and edges
// Follows the same pattern as market-data/db.ts

import Database from "better-sqlite3";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { AgentId } from "../agent-debate";
import type { MemoryNode, MemoryEdge, InsertNodeInput, InsertEdgeInput, AgentIdentitySnapshot } from "./types";
import { computeEdgeWeights, computeCurrentSalience, DECAY_RATES } from "./weights";

const DB_PATH = resolve(process.cwd(), "src/data/memory-graph.sqlite");
const SCHEMA_PATH = resolve(process.cwd(), "src/lib/memory/schema.sql");

let _db: Database.Database | null = null;

export function getMemoryDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    const schema = readFileSync(SCHEMA_PATH, "utf-8");
    _db.exec(schema);
  }
  return _db;
}

export function closeMemoryDb(): void {
  if (_db) { _db.close(); _db = null; }
}

// ── Node operations ─────────────────────────────────────────────────────────

export function insertNode(input: InsertNodeInput): string {
  const db = getMemoryDb();
  const id = `mn_${input.agent_id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO memory_nodes (id, agent_id, created_at, last_accessed, content, content_type,
      debate_id, ticker, direction, confidence, salience, decay_rate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, input.agent_id, now, now, input.content, input.content_type,
    input.debate_id ?? null, input.ticker ?? null, input.direction ?? null,
    input.confidence ?? null,
    input.salience ?? 1.0,
    input.decay_rate ?? DECAY_RATES[input.content_type] ?? 0.05,
  );

  return id;
}

export function getNode(id: string): MemoryNode | null {
  const db = getMemoryDb();
  const row = db.prepare("SELECT * FROM memory_nodes WHERE id = ?").get(id) as any;
  if (!row) return null;
  return {
    ...row,
    is_compressed: !!row.is_compressed,
    resolved: !!row.resolved,
    outcome_correct: row.outcome_correct === null ? null : !!row.outcome_correct,
    compressed_from: row.compressed_from ? JSON.parse(row.compressed_from) : null,
  };
}

export function touchNode(id: string): void {
  const db = getMemoryDb();
  db.prepare(`
    UPDATE memory_nodes SET last_accessed = ?, access_count = access_count + 1 WHERE id = ?
  `).run(new Date().toISOString(), id);
}

export function getAgentNodes(agentId: AgentId, limit = 100): MemoryNode[] {
  const db = getMemoryDb();
  const rows = db.prepare(`
    SELECT * FROM memory_nodes WHERE agent_id = ? ORDER BY created_at DESC LIMIT ?
  `).all(agentId, limit) as any[];
  return rows.map(parseNode);
}

export function getNodesByTicker(agentId: AgentId, ticker: string, limit = 20): MemoryNode[] {
  const db = getMemoryDb();
  const rows = db.prepare(`
    SELECT * FROM memory_nodes WHERE agent_id = ? AND ticker = ?
    ORDER BY salience DESC LIMIT ?
  `).all(agentId, ticker, limit) as any[];
  return rows.map(parseNode);
}

export function getUnresolvedPredictions(agentId: AgentId, limit = 10): MemoryNode[] {
  const db = getMemoryDb();
  const rows = db.prepare(`
    SELECT * FROM memory_nodes
    WHERE agent_id = ? AND content_type = 'prediction' AND resolved = 0
    ORDER BY confidence DESC LIMIT ?
  `).all(agentId, limit) as any[];
  return rows.map(parseNode);
}

export function getIdentityNodes(agentId: AgentId): MemoryNode[] {
  const db = getMemoryDb();
  const rows = db.prepare(`
    SELECT * FROM memory_nodes WHERE agent_id = ? AND content_type = 'identity'
    ORDER BY salience DESC
  `).all(agentId) as any[];
  return rows.map(parseNode);
}

export function getHighTensionNodes(agentId: AgentId, limit = 5): MemoryNode[] {
  const db = getMemoryDb();
  const rows = db.prepare(`
    SELECT mn.* FROM memory_nodes mn
    JOIN memory_edges me ON (mn.id = me.source_id OR mn.id = me.target_id)
    WHERE me.agent_id = ? AND me.edge_type = 'contradicts'
    GROUP BY mn.id
    ORDER BY MAX(me.w_tension) DESC LIMIT ?
  `).all(agentId, limit) as any[];
  return rows.map(parseNode);
}

export function getNodeCount(agentId: AgentId): number {
  const db = getMemoryDb();
  const row = db.prepare("SELECT COUNT(*) as cnt FROM memory_nodes WHERE agent_id = ?").get(agentId) as any;
  return row.cnt;
}

export function resolveNode(id: string, correct: boolean, opts?: { applyDopamine?: boolean; actual?: "up" | "down" | "flat" }): void {
  const db = getMemoryDb();
  const node = getNode(id);
  if (!node || !node.confidence) return;
  const outcome = correct ? 1 : 0;
  const brier = (node.confidence - outcome) ** 2;
  db.prepare(`
    UPDATE memory_nodes SET resolved = 1, outcome_correct = ?, brier_component = ? WHERE id = ?
  `).run(correct ? 1 : 0, brier, id);

  // Apply dopamine RPE if enabled and we have direction info
  if (opts?.applyDopamine && node.direction && opts.actual) {
    // Lazy import to avoid circular dependency
    const { applyDopamineUpdate } = require("./dopamine");
    applyDopamineUpdate({
      nodeId: id,
      predicted: node.direction,
      predictedConfidence: node.confidence,
      actual: opts.actual,
    });
  }
}

// ── Edge operations ─────────────────────────────────────────────────────────

export function insertEdge(input: InsertEdgeInput): number {
  const db = getMemoryDb();
  const now = new Date().toISOString();

  const source = getNode(input.source_id);
  const target = getNode(input.target_id);
  if (!source || !target) throw new Error(`Node not found: ${input.source_id} or ${input.target_id}`);

  const weights = computeEdgeWeights(input.edge_type, now, source, target);

  const result = db.prepare(`
    INSERT OR REPLACE INTO memory_edges
      (source_id, target_id, agent_id, edge_type, w_temporal, w_conviction, w_tension, weight, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    input.source_id, input.target_id, input.agent_id, input.edge_type,
    weights.w_temporal, input.w_conviction ?? weights.w_conviction,
    weights.w_tension, weights.weight, now,
  );

  return result.lastInsertRowid as number;
}

export function getOutgoingEdges(nodeId: string): MemoryEdge[] {
  const db = getMemoryDb();
  const rows = db.prepare(`
    SELECT * FROM memory_edges WHERE source_id = ? ORDER BY weight DESC
  `).all(nodeId) as any[];
  return rows;
}

export function getIncomingEdges(nodeId: string): MemoryEdge[] {
  const db = getMemoryDb();
  const rows = db.prepare(`
    SELECT * FROM memory_edges WHERE target_id = ? ORDER BY weight DESC
  `).all(nodeId) as any[];
  return rows;
}

export function touchEdge(id: number): void {
  const db = getMemoryDb();
  db.prepare(`
    UPDATE memory_edges SET last_traversed = ?, traversal_count = traversal_count + 1 WHERE id = ?
  `).run(new Date().toISOString(), id);
}

export function getMaxTensionPair(agentId: AgentId): [string, string] | null {
  const db = getMemoryDb();
  const row = db.prepare(`
    SELECT source_id, target_id FROM memory_edges
    WHERE agent_id = ? AND edge_type = 'contradicts'
    ORDER BY w_tension DESC LIMIT 1
  `).get(agentId) as any;
  if (!row) return null;
  return [row.source_id, row.target_id];
}

// ── Identity operations ─────────────────────────────────────────────────────

export function saveIdentity(snapshot: AgentIdentitySnapshot): void {
  const db = getMemoryDb();
  db.prepare(`
    INSERT OR REPLACE INTO agent_identity
      (agent_id, version, updated_at, identity_text, core_beliefs,
       prediction_bias, avg_confidence, calibration, total_predictions, correct_predictions)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    snapshot.agent_id, snapshot.version, snapshot.updated_at,
    snapshot.identity_text, JSON.stringify(snapshot.core_beliefs),
    snapshot.prediction_bias, snapshot.avg_confidence, snapshot.calibration,
    snapshot.total_predictions, snapshot.correct_predictions,
  );
}

export function getLatestIdentity(agentId: AgentId): AgentIdentitySnapshot | null {
  const db = getMemoryDb();
  const row = db.prepare(`
    SELECT * FROM agent_identity WHERE agent_id = ? ORDER BY version DESC LIMIT 1
  `).get(agentId) as any;
  if (!row) return null;
  return { ...row, core_beliefs: JSON.parse(row.core_beliefs) };
}

// ── Stats ───────────────────────────────────────────────────────────────────

export function getGraphStats(agentId: AgentId): {
  nodes: number;
  edges: number;
  contradictions: number;
  unresolved_predictions: number;
  avg_salience: number;
  max_tension: number;
} {
  const db = getMemoryDb();
  const nodes = (db.prepare("SELECT COUNT(*) as c FROM memory_nodes WHERE agent_id = ?").get(agentId) as any).c;
  const edges = (db.prepare("SELECT COUNT(*) as c FROM memory_edges WHERE agent_id = ?").get(agentId) as any).c;
  const contradictions = (db.prepare("SELECT COUNT(*) as c FROM memory_edges WHERE agent_id = ? AND edge_type = 'contradicts'").get(agentId) as any).c;
  const unresolvedPred = (db.prepare("SELECT COUNT(*) as c FROM memory_nodes WHERE agent_id = ? AND content_type = 'prediction' AND resolved = 0").get(agentId) as any).c;
  const avgSal = (db.prepare("SELECT AVG(salience) as a FROM memory_nodes WHERE agent_id = ?").get(agentId) as any).a ?? 0;
  const maxTen = (db.prepare("SELECT MAX(w_tension) as m FROM memory_edges WHERE agent_id = ?").get(agentId) as any).m ?? 0;

  return { nodes, edges, contradictions, unresolved_predictions: unresolvedPred, avg_salience: avgSal, max_tension: maxTen };
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function parseNode(row: any): MemoryNode {
  return {
    ...row,
    is_compressed: !!row.is_compressed,
    resolved: !!row.resolved,
    outcome_correct: row.outcome_correct === null ? null : !!row.outcome_correct,
    compressed_from: row.compressed_from ? JSON.parse(row.compressed_from) : null,
  };
}
