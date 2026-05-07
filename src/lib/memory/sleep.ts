// Entrenched Coils — Sleep Cycle
//
// Three-phase memory consolidation inspired by neuroscience:
//   Phase 1: Slow-Wave Sleep  — consolidation, compression, synaptic homeostasis
//   Phase 2: REM Sleep        — emotional processing, random association, pattern separation
//   Phase 3: Wake Preparation — priority refresh, morning briefing
//
// Run nightly to prevent unbounded graph growth while preserving signal.
// Without sleep, the graph grows ~22 nodes/debate. With sleep, it converges.

import type { AgentId } from "../agent-debate";
import type { MemoryNode, MemoryEdge } from "./types";
import { getMemoryDb, insertNode, insertEdge, getNode, getGraphStats } from "./db";
import { computeEdgeWeights, computeCurrentSalience } from "./weights";

// ── Sleep parameters (neurotransmitter analogs) ─────────────────────────────

export type SleepParams = {
  consolidation_strength: number;  // 0-1, default 0.85 (global downscale factor, like GABA)
  emotional_boost: number;         // 0-1, default 0.10 (contradiction amplification, like norepinephrine)
  creativity: number;              // 0-1, default 0.15 (probability of random associations, like serotonin 2A)
  pruning_threshold: number;       // default 0.05 (salience below which nodes die)
};

export const DEFAULT_SLEEP_PARAMS: SleepParams = {
  consolidation_strength: 0.85,
  emotional_boost: 0.10,
  creativity: 0.15,
  pruning_threshold: 0.05,
};

// ── Sleep results (for logging and diagnostics) ─────────────────────────────

export type SlowWaveResult = {
  merged_count: number;
  merged_pairs: Array<{ kept: string; absorbed: string[] }>;
  downscaled_nodes: number;
  downscaled_edges: number;
  pruned_nodes: number;
  pruned_node_ids: string[];
};

export type RemResult = {
  contradictions_boosted: number;
  new_associations: Array<{ source: string; target: string; reason: string }>;
  patterns_separated: number;
};

export type WakePrepResult = {
  edges_recomputed: number;
  morning_briefing: Array<{
    source_id: string;
    target_id: string;
    tension: number;
    source_content: string;
    target_content: string;
  }>;
  access_counts_reset: number;
};

export type SleepCycleResult = {
  agent_id: AgentId;
  slow_wave: SlowWaveResult;
  rem: RemResult;
  wake_prep: WakePrepResult;
  before: ReturnType<typeof getGraphStats>;
  after: ReturnType<typeof getGraphStats>;
  duration_ms: number;
};

// ── PHASE 1: SLOW-WAVE SLEEP ────────────────────────────────────────────────
// Hippocampal-cortical replay + synaptic homeostasis hypothesis (Tononi & Cirelli)
//
// 1. Replay high-salience nodes from last 24h
// 2. Merge similar nodes (gist extraction)
// 3. Global downscaling (prevents weight saturation)
// 4. Prune faded nodes (salience < threshold)

export function slowWaveSleep(agentId: AgentId, params: SleepParams = DEFAULT_SLEEP_PARAMS): SlowWaveResult {
  const db = getMemoryDb();
  const result: SlowWaveResult = {
    merged_count: 0,
    merged_pairs: [],
    downscaled_nodes: 0,
    downscaled_edges: 0,
    pruned_nodes: 0,
    pruned_node_ids: [],
  };

  // ── Step 1: REPLAY — get recent high-salience nodes ──────────────────────
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const recentNodes = db.prepare(`
    SELECT * FROM memory_nodes
    WHERE agent_id = ? AND created_at >= ? AND is_compressed = 0
    ORDER BY salience DESC
    LIMIT 50
  `).all(agentId, cutoff) as MemoryNode[];

  // ── Step 2: MERGE — gist extraction for top-20 ───────────────────────────
  // Merge candidates: same agent + same ticker + same direction + within 7 days
  const top20 = recentNodes.slice(0, 20);
  const merged = new Set<string>();

  for (const primary of top20) {
    if (merged.has(primary.id)) continue;

    // Find merge candidates: same ticker, same direction, within 7 days, not already merged
    const sevenDaysAgo = new Date(new Date(primary.created_at).getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const candidates = db.prepare(`
      SELECT * FROM memory_nodes
      WHERE agent_id = ? AND ticker = ? AND direction = ?
        AND id != ? AND is_compressed = 0
        AND created_at >= ?
        AND content_type NOT IN ('identity')
      ORDER BY salience DESC
    `).all(
      agentId,
      primary.ticker,
      primary.direction,
      primary.id,
      sevenDaysAgo,
    ) as MemoryNode[];

    const toAbsorb = candidates.filter(c => !merged.has(c.id));
    if (toAbsorb.length === 0) continue;

    // Create compressed node: keep highest salience, average confidence, concatenate content
    const allNodes = [primary, ...toAbsorb];
    const maxSalience = Math.max(...allNodes.map(n => n.salience));
    const avgConfidence = allNodes.reduce((s, n) => s + (n.confidence ?? 0.5), 0) / allNodes.length;
    const contentParts = allNodes.map(n => n.content).join(" | ");
    const compressedContent = `COMPRESSED: ${contentParts}`;

    // Truncate if too long (keep under 2000 chars)
    const finalContent = compressedContent.length > 2000
      ? compressedContent.slice(0, 1997) + "..."
      : compressedContent;

    // Create the compressed node
    const compressedId = insertNode({
      agent_id: agentId,
      content: finalContent,
      content_type: primary.content_type as any,
      debate_id: primary.debate_id ?? undefined,
      ticker: primary.ticker ?? undefined,
      direction: (primary.direction as "up" | "down" | "flat") ?? undefined,
      confidence: avgConfidence,
      salience: maxSalience,
      decay_rate: primary.decay_rate,
    });

    // Mark compressed node with source references
    const absorbedIds = allNodes.map(n => n.id);
    db.prepare(`
      UPDATE memory_nodes
      SET compressed_from = ?
      WHERE id = ?
    `).run(JSON.stringify(absorbedIds), compressedId);

    // Mark originals as compressed
    for (const node of allNodes) {
      db.prepare(`
        UPDATE memory_nodes SET is_compressed = 1 WHERE id = ?
      `).run(node.id);
      merged.add(node.id);
    }

    // Rewire edges: point edges from/to originals to the compressed node
    for (const node of allNodes) {
      db.prepare(`
        UPDATE OR IGNORE memory_edges SET source_id = ? WHERE source_id = ?
      `).run(compressedId, node.id);
      db.prepare(`
        UPDATE OR IGNORE memory_edges SET target_id = ? WHERE target_id = ?
      `).run(compressedId, node.id);
    }

    // Clean up any self-referencing edges that may have been created
    db.prepare(`
      DELETE FROM memory_edges WHERE source_id = target_id
    `).run();

    result.merged_count++;
    result.merged_pairs.push({
      kept: compressedId,
      absorbed: absorbedIds,
    });
  }

  // ── Step 3: GLOBAL DOWNSCALING (synaptic homeostasis) ────────────────────
  // Multiply all edge weights by consolidation_strength
  // Multiply all node salience by 0.9
  // This prevents weight saturation — preserves relative ordering

  const edgeDownscale = db.prepare(`
    UPDATE memory_edges
    SET w_temporal = w_temporal * ?,
        w_conviction = w_conviction * ?,
        w_tension = w_tension * ?,
        weight = weight * ?
    WHERE agent_id = ?
  `).run(
    params.consolidation_strength,
    params.consolidation_strength,
    params.consolidation_strength,
    params.consolidation_strength,
    agentId,
  );
  result.downscaled_edges = edgeDownscale.changes;

  const nodeDownscale = db.prepare(`
    UPDATE memory_nodes
    SET salience = salience * 0.9
    WHERE agent_id = ? AND is_compressed = 0
  `).run(agentId);
  result.downscaled_nodes = nodeDownscale.changes;

  // ── Step 4: PRUNE — delete nodes below salience threshold ────────────────
  // Never prune identity nodes or unresolved predictions

  const toPrune = db.prepare(`
    SELECT id FROM memory_nodes
    WHERE agent_id = ? AND salience < ?
      AND content_type NOT IN ('identity')
      AND NOT (content_type = 'prediction' AND resolved = 0)
      AND is_compressed = 0
  `).all(agentId, params.pruning_threshold) as Array<{ id: string }>;

  for (const { id } of toPrune) {
    // Delete edges referencing this node first
    db.prepare("DELETE FROM memory_edges WHERE source_id = ? OR target_id = ?").run(id, id);
    db.prepare("DELETE FROM memory_nodes WHERE id = ?").run(id);
    result.pruned_node_ids.push(id);
  }
  result.pruned_nodes = toPrune.length;

  return result;
}

// ── PHASE 2: REM SLEEP ──────────────────────────────────────────────────────
// Emotional processing (contradiction amplification) + dream-state random association
//
// REM is when the brain processes emotional content and creates novel associations.
// Here, "emotional" = high-tension contradictions.

export function remSleep(agentId: AgentId, params: SleepParams = DEFAULT_SLEEP_PARAMS): RemResult {
  const db = getMemoryDb();
  const result: RemResult = {
    contradictions_boosted: 0,
    new_associations: [],
    patterns_separated: 0,
  };

  // ── Step 1: CONTRADICTION AMPLIFICATION ──────────────────────────────────
  // Boost w_tension on all contradiction edges by emotional_boost (10%)
  // Unresolved contradictions are the "emotional" content that REM processes
  // After sleep, contradictions are MORE salient — they've been "dreamt about"

  const boostResult = db.prepare(`
    UPDATE memory_edges
    SET w_tension = w_tension * (1.0 + ?),
        weight = weight * (1.0 + ? * 0.5)
    WHERE agent_id = ? AND edge_type = 'contradicts'
  `).run(params.emotional_boost, params.emotional_boost, agentId);
  result.contradictions_boosted = boostResult.changes;

  // ── Step 2: RANDOM ASSOCIATION (the "dream" phase) ───────────────────────
  // Pick random pairs of nodes with no existing edge.
  // If they share a ticker or content_type, create a weak 'evolves' edge.
  // This is creative pattern-finding — the psychedelic discovery phase.

  const allNodes = db.prepare(`
    SELECT id, ticker, content_type, content FROM memory_nodes
    WHERE agent_id = ? AND is_compressed = 0
    ORDER BY RANDOM()
    LIMIT 30
  `).all(agentId) as Array<{ id: string; ticker: string | null; content_type: string; content: string }>;

  let associationsCreated = 0;
  const maxAssociations = 3;

  for (let i = 0; i < allNodes.length && associationsCreated < maxAssociations; i++) {
    for (let j = i + 1; j < allNodes.length && associationsCreated < maxAssociations; j++) {
      // Roll the dice — creativity parameter controls probability
      if (Math.random() > params.creativity) continue;

      const a = allNodes[i];
      const b = allNodes[j];

      // Check if they share ticker or content_type
      const sharedTicker = a.ticker && b.ticker && a.ticker === b.ticker;
      const sharedType = a.content_type === b.content_type;
      if (!sharedTicker && !sharedType) continue;

      // Check no existing edge
      const existingEdge = db.prepare(`
        SELECT id FROM memory_edges
        WHERE (source_id = ? AND target_id = ?) OR (source_id = ? AND target_id = ?)
        LIMIT 1
      `).get(a.id, b.id, b.id, a.id);

      if (existingEdge) continue;

      // Create weak evolves edge — a dream-connection
      const reason = sharedTicker ? `dream: shared ticker ${a.ticker}` : `dream: shared type ${a.content_type}`;

      try {
        db.prepare(`
          INSERT INTO memory_edges
            (source_id, target_id, agent_id, edge_type, w_temporal, w_conviction, w_tension, weight, created_at)
          VALUES (?, ?, ?, 'evolves', 0.5, 0.1, 0.0, 0.1, ?)
        `).run(a.id, b.id, agentId, new Date().toISOString());

        result.new_associations.push({
          source: a.id,
          target: b.id,
          reason,
        });
        associationsCreated++;
      } catch {
        // UNIQUE constraint — edge already exists with different type, skip
      }
    }
  }

  // ── Step 3: PATTERN SEPARATION ───────────────────────────────────────────
  // For nodes with same ticker but DIFFERENT directions, increase tension
  // between them. This prevents similar-but-contradictory memories from
  // blurring together — the hippocampal pattern separation function.

  const contradictingPairs = db.prepare(`
    SELECT me.id, me.w_tension
    FROM memory_edges me
    JOIN memory_nodes src ON me.source_id = src.id
    JOIN memory_nodes tgt ON me.target_id = tgt.id
    WHERE me.agent_id = ?
      AND me.edge_type = 'contradicts'
      AND src.ticker = tgt.ticker
      AND src.ticker IS NOT NULL
      AND src.direction != tgt.direction
  `).all(agentId) as Array<{ id: number; w_tension: number }>;

  for (const pair of contradictingPairs) {
    // Sharpen separation: bump tension by 5% for same-ticker contradictions
    db.prepare(`
      UPDATE memory_edges SET w_tension = w_tension * 1.05 WHERE id = ?
    `).run(pair.id);
    result.patterns_separated++;
  }

  return result;
}

// ── PHASE 3: WAKE PREPARATION ───────────────────────────────────────────────
// Morning cortisol spike + acetylcholine reset
//
// Recompute all composite weights (temporal decay shifted overnight),
// identify top unresolved tensions, prepare the "morning briefing".

export function wakePrep(agentId: AgentId): WakePrepResult {
  const db = getMemoryDb();
  const result: WakePrepResult = {
    edges_recomputed: 0,
    morning_briefing: [],
    access_counts_reset: 0,
  };

  // ── Step 1: RECOMPUTE all composite edge weights ─────────────────────────
  // Temporal decay has changed overnight — recalculate everything

  const allEdges = db.prepare(`
    SELECT me.id, me.source_id, me.target_id, me.edge_type, me.created_at
    FROM memory_edges me
    WHERE me.agent_id = ?
  `).all(agentId) as Array<{
    id: number;
    source_id: string;
    target_id: string;
    edge_type: string;
    created_at: string;
  }>;

  const updateEdgeStmt = db.prepare(`
    UPDATE memory_edges
    SET w_temporal = ?, w_conviction = ?, w_tension = ?, weight = ?
    WHERE id = ?
  `);

  const recomputeTransaction = db.transaction(() => {
    for (const edge of allEdges) {
      const source = getNode(edge.source_id);
      const target = getNode(edge.target_id);
      if (!source || !target) continue;

      const weights = computeEdgeWeights(
        edge.edge_type as any,
        edge.created_at,
        source,
        target,
      );

      updateEdgeStmt.run(
        weights.w_temporal,
        weights.w_conviction,
        weights.w_tension,
        weights.weight,
        edge.id,
      );
      result.edges_recomputed++;
    }
  });
  recomputeTransaction();

  // ── Step 2: MORNING BRIEFING — top-5 unresolved tensions ─────────────────
  // These are the contradictions the agent should think about today

  const topTensions = db.prepare(`
    SELECT me.source_id, me.target_id, me.w_tension,
           src.content AS source_content, tgt.content AS target_content
    FROM memory_edges me
    JOIN memory_nodes src ON me.source_id = src.id
    JOIN memory_nodes tgt ON me.target_id = tgt.id
    WHERE me.agent_id = ? AND me.edge_type = 'contradicts'
      AND src.resolved = 0 AND tgt.resolved = 0
    ORDER BY me.w_tension DESC
    LIMIT 5
  `).all(agentId) as Array<{
    source_id: string;
    target_id: string;
    w_tension: number;
    source_content: string;
    target_content: string;
  }>;

  result.morning_briefing = topTensions.map(t => ({
    source_id: t.source_id,
    target_id: t.target_id,
    tension: t.w_tension,
    source_content: t.source_content.slice(0, 120),
    target_content: t.target_content.slice(0, 120),
  }));

  // ── Step 3: ACCESS COUNT RESET — prevent popularity bias ─────────────────
  // Nodes retrieved more than 10 times get reset to 0.
  // Forces rediscovery — prevents the "rich get richer" problem in retrieval.

  const resetResult = db.prepare(`
    UPDATE memory_nodes
    SET access_count = 0
    WHERE agent_id = ? AND access_count > 10
  `).run(agentId);
  result.access_counts_reset = resetResult.changes;

  return result;
}

// ── FULL SLEEP CYCLE ────────────────────────────────────────────────────────
// Runs all three phases in order: SWS → REM → Wake Prep

export function runSleepCycle(
  agentId: AgentId,
  params: SleepParams = DEFAULT_SLEEP_PARAMS,
): SleepCycleResult {
  const startTime = Date.now();

  const before = getGraphStats(agentId);

  // Phase 1: Slow-Wave Sleep (consolidation + compression + pruning)
  const slowWaveResult = slowWaveSleep(agentId, params);

  // Phase 2: REM Sleep (emotional processing + random association)
  const remResult = remSleep(agentId, params);

  // Phase 3: Wake Preparation (priority refresh + morning briefing)
  const wakePrepResult = wakePrep(agentId);

  const after = getGraphStats(agentId);

  return {
    agent_id: agentId,
    slow_wave: slowWaveResult,
    rem: remResult,
    wake_prep: wakePrepResult,
    before,
    after,
    duration_ms: Date.now() - startTime,
  };
}

// ── Format morning briefing for prompt injection ────────────────────────────

export function formatMorningBriefing(result: SleepCycleResult): string {
  const lines: string[] = [
    `SLEEP CYCLE COMPLETE (${result.duration_ms}ms):`,
    `  Consolidated: ${result.slow_wave.merged_count} merges, ${result.slow_wave.pruned_nodes} pruned`,
    `  Dreams: ${result.rem.new_associations.length} new associations, ${result.rem.contradictions_boosted} contradictions amplified`,
    `  Graph: ${result.before.nodes} → ${result.after.nodes} nodes, ${result.before.edges} → ${result.after.edges} edges`,
    "",
    "TODAY'S UNRESOLVED TENSIONS:",
  ];

  for (const item of result.wake_prep.morning_briefing) {
    lines.push(`  [tension: ${item.tension.toFixed(2)}] "${item.source_content}" vs "${item.target_content}"`);
  }

  if (result.wake_prep.morning_briefing.length === 0) {
    lines.push("  (no unresolved contradictions)");
  }

  return lines.join("\n");
}
