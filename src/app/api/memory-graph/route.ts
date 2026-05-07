import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import { resolve } from "node:path";
import { existsSync } from "node:fs";

// GET /api/memory-graph — snapshot of the live tension graph for the paper visualization
// Returns agent stats, top tension edges, and morning briefing tensions.

export const runtime = "nodejs";
export const revalidate = 600; // 10 min cache

const DB_PATH = resolve(process.cwd(), "src/data/memory-graph.sqlite");

export type MemoryGraphSnapshot = {
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
    edge_type: string;
  }[];
  briefing: { snippet: string; confidence: number; agent: string; content_type: string }[];
};

export async function GET() {
  if (!existsSync(DB_PATH)) {
    return NextResponse.json({ error: "memory-graph.sqlite not found" }, { status: 404 });
  }

  const db = new Database(DB_PATH, { readonly: true });

  try {
    // Totals
    const totalNodes = (db.prepare("SELECT COUNT(*) as c FROM memory_nodes").get() as any).c;
    const totalEdges = (db.prepare("SELECT COUNT(*) as c FROM memory_edges").get() as any).c;
    const totalContradictions = (
      db.prepare("SELECT COUNT(*) as c FROM memory_edges WHERE edge_type='contradicts'").get() as any
    ).c;
    const totalUnresolved = (
      db
        .prepare("SELECT COUNT(*) as c FROM memory_nodes WHERE content_type='prediction' AND resolved=0")
        .get() as any
    ).c;

    // Top 5 agents by node count with breakdowns
    const agents = db
      .prepare(
        `SELECT
        agent_id as id,
        COUNT(*) as nodes,
        SUM(CASE WHEN content_type='claim' THEN 1 ELSE 0 END) as claims,
        SUM(CASE WHEN content_type='prediction' THEN 1 ELSE 0 END) as predictions,
        SUM(CASE WHEN content_type='observation' THEN 1 ELSE 0 END) as observations
       FROM memory_nodes GROUP BY agent_id ORDER BY COUNT(*) DESC LIMIT 5`,
      )
      .all() as any[];

    // Top 10 highest-tension edges with content snippets
    const tensions = db
      .prepare(
        `SELECT
        s.agent_id as src_agent,
        t.agent_id as tgt_agent,
        substr(s.content, 1, 72) as src_snippet,
        substr(t.content, 1, 72) as tgt_snippet,
        s.confidence as src_conf,
        t.confidence as tgt_conf,
        me.w_tension as tension,
        me.edge_type
       FROM memory_edges me
       JOIN memory_nodes s ON s.id = me.source_id
       JOIN memory_nodes t ON t.id = me.target_id
       WHERE me.edge_type = 'contradicts'
       ORDER BY me.w_tension DESC LIMIT 10`,
      )
      .all() as any[];

    // Morning briefing: top 5 unresolved predictions with highest confidence
    const briefing = db
      .prepare(
        `SELECT
        substr(content, 1, 90) as snippet,
        confidence,
        agent_id as agent,
        content_type
       FROM memory_nodes
       WHERE content_type = 'prediction' AND resolved = 0
       ORDER BY confidence DESC LIMIT 5`,
      )
      .all() as any[];

    const snapshot: MemoryGraphSnapshot = {
      totals: {
        nodes: totalNodes,
        edges: totalEdges,
        contradictions: totalContradictions,
        unresolved: totalUnresolved,
      },
      agents,
      tensions,
      briefing,
    };

    return NextResponse.json(snapshot);
  } finally {
    db.close();
  }
}
