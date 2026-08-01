// Entrenched Coils — Type definitions for the tension-graph memory system

import type { AgentId as DebateAgentId } from "../agent-debate";

// Extended agent IDs: debate agents + synthetic pipeline agents
export type MemoryAgentId = DebateAgentId | "signal-engine" | "portfolio-manager";

// Re-export for backwards compat — memory system accepts both debate and synthetic agents
export type { DebateAgentId };

// ── Node types ────────────────────────────────────────────────────

export type ContentType = "claim" | "prediction" | "observation" | "correction" | "identity" | "trade";

export type MemoryNode = {
  id: string;
  agent_id: MemoryAgentId;
  created_at: string;
  last_accessed: string;
  access_count: number;
  content: string;
  content_type: ContentType;
  debate_id: string | null;
  ticker: string | null;
  direction: "up" | "down" | "flat" | null;
  confidence: number | null;
  salience: number;
  decay_rate: number;
  is_compressed: boolean;
  compressed_from: string[] | null;
  resolved: boolean;
  outcome_correct: boolean | null;
  brier_component: number | null;
};

// ── Edge types ────────────────────────────────────────────────────

export type EdgeType = "contradicts" | "supports" | "follows" | "corrects" | "evolves";

export type MemoryEdge = {
  id: number;
  source_id: string;
  target_id: string;
  agent_id: MemoryAgentId;
  edge_type: EdgeType;
  w_temporal: number;
  w_conviction: number;
  w_tension: number;
  weight: number;
  created_at: string;
  last_traversed: string | null;
  traversal_count: number;
};

// ── Graph operations ──────────────────────────────────────────────

export type RetrievedMemory = {
  node: MemoryNode;
  path_tension: number;
  path_length: number;
  retrieval_reason: string;
  edge_from: MemoryEdge | null;
};

export type NeuromodState = {
  ach: number;  // acetylcholine: 0=exploitation, 1=learning mode
  ne: number;   // norepinephrine: 0=calm, 1=alert (consecutive wrong)
  mode: "learning" | "exploiting" | "alert";
};

export type MemoryContext = {
  agent_id: MemoryAgentId;
  retrieved: RetrievedMemory[];
  total_nodes: number;
  max_tension_pair: [string, string] | null;
  identity_summary: string;
  retrieval_ms: number;
  neuromod_state?: NeuromodState;
};

export type InsertNodeInput = {
  agent_id: MemoryAgentId;
  content: string;
  content_type: ContentType;
  debate_id?: string;
  ticker?: string;
  direction?: "up" | "down" | "flat";
  confidence?: number;
  salience?: number;
  decay_rate?: number;
};

export type InsertEdgeInput = {
  source_id: string;
  target_id: string;
  agent_id: MemoryAgentId;
  edge_type: EdgeType;
  w_conviction?: number;
};

// ── Identity ──────────────────────────────────────────────────────

export type AgentIdentitySnapshot = {
  agent_id: MemoryAgentId;
  version: number;
  updated_at: string;
  identity_text: string;
  core_beliefs: string[];
  prediction_bias: string | null;
  avg_confidence: number | null;
  calibration: number | null;
  total_predictions: number;
  correct_predictions: number;
};
