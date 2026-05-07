// Entrenched Coils — Reconsolidation
//
// Nader (2000): Memories become LABILE when retrieved. During this window,
// new contradictory evidence can update or weaken them. After the window
// closes without update, the memory restabilizes (potentially stronger).
//
// Implementation:
//   1. On retrieval, mark node as labile (reduce salience by LABILITY_FACTOR)
//   2. During lability window, new contradictory evidence can overwrite/reduce
//   3. After window expires, if no update: restore salience with small bonus
//   4. If updated during window: keep the new (lower) salience
//
// This prevents old memories from being permanent anchors. Rigid agents
// (Bear always down, Historian always base-rate) will have their confident
// wrong memories weakened over time as they keep being retrieved and contradicted.

import type { MemoryNode, MemoryEdge } from "./types";
import { getMemoryDb, getNode, getOutgoingEdges, getIncomingEdges } from "./db";

// ── Constants ───────────────────────────────────────────────────────────────

// How much to reduce salience on retrieval (20% reduction = 0.80 multiplier)
const LABILITY_FACTOR = 0.80;

// How long the lability window stays open (in milliseconds)
// 1 hour — within a single debate session
const LABILITY_WINDOW_MS = 60 * 60 * 1000;

// Bonus for surviving the lability window without being contradicted
// Small positive: memories that survive retrieval get slightly stronger
const RESTABILIZATION_BONUS = 1.05;

// Maximum reduction from repeated reconsolidation (floor)
const MIN_SALIENCE_AFTER_RECONSOLIDATION = 0.1;

// ── Schema migration ────────────────────────────────────────────────────────
// Adds labile_until column if not exists

export function ensureReconsolidationSchema(): void {
  const db = getMemoryDb();
  // Check if column exists
  const cols = db.prepare("PRAGMA table_info(memory_nodes)").all() as any[];
  const hasLabile = cols.some((c: any) => c.name === "labile_until");
  if (!hasLabile) {
    db.exec("ALTER TABLE memory_nodes ADD COLUMN labile_until TEXT");
    db.exec("CREATE INDEX IF NOT EXISTS idx_mn_labile ON memory_nodes(labile_until)");
  }
}

// ── Core reconsolidation logic ──────────────────────────────────────────────

/**
 * Mark a node as labile after retrieval.
 * Reduces salience temporarily. Returns the adjusted salience.
 */
export function makeNodeLabile(nodeId: string): number {
  const db = getMemoryDb();
  const node = getNode(nodeId);
  if (!node) return 0;

  // Don't make identity nodes labile — they're protected
  if (node.content_type === "identity") return node.salience;

  // Already labile? Don't reduce again (prevents repeated hits in same session)
  if (isNodeLabile(nodeId)) return node.salience;

  const labileUntil = new Date(Date.now() + LABILITY_WINDOW_MS).toISOString();
  const newSalience = Math.max(
    MIN_SALIENCE_AFTER_RECONSOLIDATION,
    node.salience * LABILITY_FACTOR
  );

  db.prepare(`
    UPDATE memory_nodes SET salience = ?, labile_until = ? WHERE id = ?
  `).run(newSalience, labileUntil, nodeId);

  return newSalience;
}

/**
 * Check if a node is currently in its lability window.
 */
export function isNodeLabile(nodeId: string): boolean {
  const db = getMemoryDb();
  const row = db.prepare(
    "SELECT labile_until FROM memory_nodes WHERE id = ?"
  ).get(nodeId) as any;
  if (!row?.labile_until) return false;
  return new Date(row.labile_until).getTime() > Date.now();
}

/**
 * Update a labile node with new contradictory evidence.
 * Called when a new edge of type 'contradicts' is added to a labile node.
 * Reduces salience further — the contradiction "overwrites" the old memory.
 */
export function updateLabilNode(
  nodeId: string,
  contradictionStrength: number
): { newSalience: number; wasLabile: boolean } {
  if (!isNodeLabile(nodeId)) {
    return { newSalience: 0, wasLabile: false };
  }

  const db = getMemoryDb();
  const node = getNode(nodeId);
  if (!node) return { newSalience: 0, wasLabile: false };

  // Stronger contradictions cause larger salience reduction
  // contradictionStrength is typically the w_tension of the new edge (0-3 range)
  const reductionFactor = Math.max(0.5, 1.0 - contradictionStrength * 0.15);
  const newSalience = Math.max(
    MIN_SALIENCE_AFTER_RECONSOLIDATION,
    node.salience * reductionFactor
  );

  // Mark as updated — don't restore salience later
  db.prepare(`
    UPDATE memory_nodes SET salience = ?, labile_until = NULL WHERE id = ?
  `).run(newSalience, nodeId);

  return { newSalience, wasLabile: true };
}

/**
 * Restabilize nodes whose lability window has expired without update.
 * Call this periodically (e.g., at the end of a debate session).
 * Nodes that survived retrieval without contradiction get a small bonus.
 */
export function restabilizeExpiredNodes(): number {
  const db = getMemoryDb();
  const now = new Date().toISOString();

  // Find nodes whose lability window has expired
  const expired = db.prepare(`
    SELECT id, salience FROM memory_nodes
    WHERE labile_until IS NOT NULL AND labile_until < ?
  `).all(now) as any[];

  if (expired.length === 0) return 0;

  const update = db.prepare(`
    UPDATE memory_nodes SET salience = ?, labile_until = NULL WHERE id = ?
  `);

  const batchUpdate = db.transaction(() => {
    for (const row of expired) {
      // Small bonus for surviving without contradiction
      const restoredSalience = Math.min(2.0, row.salience * RESTABILIZATION_BONUS);
      update.run(restoredSalience, row.id);
    }
  });
  batchUpdate();

  return expired.length;
}

/**
 * Apply reconsolidation during retrieval.
 * Called by the traverse module when nodes are retrieved for a debate.
 * Returns the effective salience to use for ranking.
 */
export function applyReconsolidationOnRetrieval(nodeId: string): number {
  ensureReconsolidationSchema();
  return makeNodeLabile(nodeId);
}

/**
 * Get stats about reconsolidation state.
 */
export function getReconsolidationStats(): {
  currently_labile: number;
  restabilized_last_hour: number;
} {
  const db = getMemoryDb();
  const now = new Date().toISOString();
  const oneHourAgo = new Date(Date.now() - LABILITY_WINDOW_MS).toISOString();

  const labile = (db.prepare(
    "SELECT COUNT(*) as c FROM memory_nodes WHERE labile_until IS NOT NULL AND labile_until > ?"
  ).get(now) as any).c;

  // Nodes that were recently restabilized (labile_until is NULL but was set recently)
  // Approximation: count nodes accessed in the last hour
  const recentlyAccessed = (db.prepare(
    "SELECT COUNT(*) as c FROM memory_nodes WHERE last_accessed > ? AND labile_until IS NULL"
  ).get(oneHourAgo) as any).c;

  return {
    currently_labile: labile,
    restabilized_last_hour: recentlyAccessed,
  };
}
