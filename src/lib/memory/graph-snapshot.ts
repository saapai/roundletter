// Server-side snapshot of the memory graph for the paper visualization.
// Called directly from the statement page (server component).

import Database from "better-sqlite3";
import { resolve } from "node:path";
import { existsSync } from "node:fs";

const DB_PATH = resolve(process.cwd(), "src/data/memory-graph.sqlite");

export type GraphSnapshot = {
  totals: { nodes: number; edges: number; contradictions: number; unresolved: number };
  agents: { id: string; nodes: number; claims: number; predictions: number; observations: number }[];
  tensions: {
    src_agent: string;
    tgt_agent: string;
    src_snippet: string;
    tgt_snippet: string;
    src_conf: number;
    tgt_conf: number;
    tension: number;
  }[];
  briefing: { snippet: string; confidence: number; agent: string }[];
};

export function getGraphSnapshot(): GraphSnapshot | null {
  if (!existsSync(DB_PATH)) return null;

  const db = new Database(DB_PATH, { readonly: true });
  try {
    const totalNodes = (db.prepare("SELECT COUNT(*) as c FROM memory_nodes").get() as any).c;
    const totalEdges = (db.prepare("SELECT COUNT(*) as c FROM memory_edges").get() as any).c;
    const totalContradictions = (
      db.prepare("SELECT COUNT(*) as c FROM memory_edges WHERE edge_type='contradicts'").get() as any
    ).c;
    const totalUnresolved = (
      db.prepare("SELECT COUNT(*) as c FROM memory_nodes WHERE content_type='prediction' AND resolved=0").get() as any
    ).c;

    const agents = db.prepare(
      `SELECT agent_id as id, COUNT(*) as nodes,
        SUM(CASE WHEN content_type='claim' THEN 1 ELSE 0 END) as claims,
        SUM(CASE WHEN content_type='prediction' THEN 1 ELSE 0 END) as predictions,
        SUM(CASE WHEN content_type='observation' THEN 1 ELSE 0 END) as observations
       FROM memory_nodes GROUP BY agent_id ORDER BY COUNT(*) DESC LIMIT 5`
    ).all() as any[];

    const tensions = db.prepare(
      `SELECT
        s.agent_id as src_agent, t.agent_id as tgt_agent,
        substr(s.content, 1, 72) as src_snippet,
        substr(t.content, 1, 72) as tgt_snippet,
        s.confidence as src_conf, t.confidence as tgt_conf,
        me.w_tension as tension
       FROM memory_edges me
       JOIN memory_nodes s ON s.id = me.source_id
       JOIN memory_nodes t ON t.id = me.target_id
       WHERE me.edge_type = 'contradicts'
       ORDER BY me.w_tension DESC LIMIT 10`
    ).all() as any[];

    const briefing = db.prepare(
      `SELECT substr(content, 1, 90) as snippet, confidence, agent_id as agent
       FROM memory_nodes WHERE content_type='prediction' AND resolved=0
       ORDER BY confidence DESC LIMIT 5`
    ).all() as any[];

    return {
      totals: { nodes: totalNodes, edges: totalEdges, contradictions: totalContradictions, unresolved: totalUnresolved },
      agents,
      tensions,
      briefing,
    };
  } finally {
    db.close();
  }
}
