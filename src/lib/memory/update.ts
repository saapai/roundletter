// Entrenched Coils — Graph update rules
//
// After each debate, extract memory nodes from agent turns and create edges:
// - Same agent, same ticker, opposite direction → 'contradicts' (tension++)
// - Same agent, same ticker, same direction → 'supports' (compress if similar)
// - Temporal sequence → 'follows'
// - Direction change between debates → 'corrects' (self-correction)
// - Cross-agent contradictions → both agents learn about disagreement

import type { AgentId, Debate, DebateTurn } from "../agent-debate";
import type { InsertNodeInput, InsertEdgeInput, MemoryNode } from "./types";
import { insertNode, insertEdge, getNodesByTicker, getNode, getMemoryDb } from "./db";
import { DECAY_RATES } from "./weights";

// ── Extract nodes from a completed debate ───────────────────────────────────

type ExtractedClaim = {
  agent_id: AgentId;
  content: string;
  direction: "up" | "down" | "flat";
  confidence: number;
  ticker: string | null;
};

function extractClaims(debate: Debate): ExtractedClaim[] {
  const claims: ExtractedClaim[] = [];

  // Extract ticker from debate topic
  const ticker = extractTicker(debate.topic.subject);

  for (const turn of debate.turns) {
    if (turn.speaker === "moderator") continue;
    if (turn.phase !== "argument") continue;

    const agentTurn = turn as Extract<DebateTurn, { phase: "argument"; speaker: AgentId }>;
    claims.push({
      agent_id: agentTurn.speaker,
      content: agentTurn.claim + (agentTurn.warrant ? ` — ${agentTurn.warrant}` : ""),
      direction: agentTurn.prediction,
      confidence: agentTurn.confidence,
      ticker,
    });
  }

  return claims;
}

function extractTicker(subject: string): string | null {
  // Match common ticker patterns in debate subjects
  const match = subject.match(/\b([A-Z]{2,5})\b/);
  if (!match) return null;
  const candidate = match[1];
  const knownTickers = ["IONQ", "GOOG", "MSFT", "CEG", "QTUM", "IBM", "NVDA", "HON", "RGTI", "QBTS", "SGOV", "NVDA"];
  return knownTickers.includes(candidate) ? candidate : null;
}

// ── Store debate results into the graph ─────────────────────────────────────

export async function extractAndStore(debate: Debate, tickers: string[]): Promise<{
  nodes_created: number;
  edges_created: number;
  contradictions_found: number;
}> {
  const claims = extractClaims(debate);
  let nodesCreated = 0;
  let edgesCreated = 0;
  let contradictionsFound = 0;

  const newNodeIds: Map<string, string> = new Map(); // agent_id → node_id

  for (const claim of claims) {
    // Only keep the LAST claim per agent (final round position)
    const existingForAgent = newNodeIds.get(claim.agent_id);
    if (existingForAgent) continue; // skip earlier rounds, keep first (which is latest due to reverse order)

    // Create the claim node
    const nodeId = insertNode({
      agent_id: claim.agent_id,
      content: claim.content,
      content_type: "claim",
      debate_id: debate.id,
      ticker: claim.ticker ?? tickers[0] ?? null,
      direction: claim.direction,
      confidence: claim.confidence,
      salience: 1.0 + claim.confidence, // higher confidence → higher initial salience
    });
    newNodeIds.set(claim.agent_id, nodeId);
    nodesCreated++;

    // Also create a prediction node if directional
    if (claim.direction !== "flat") {
      const predId = insertNode({
        agent_id: claim.agent_id,
        content: `${claim.direction} on ${claim.ticker ?? "market"} at ${claim.confidence.toFixed(2)} confidence`,
        content_type: "prediction",
        debate_id: debate.id,
        ticker: claim.ticker ?? tickers[0] ?? null,
        direction: claim.direction,
        confidence: claim.confidence,
        decay_rate: DECAY_RATES.prediction,
      });
      nodesCreated++;

      // Link prediction to claim
      insertEdge({
        source_id: predId,
        target_id: nodeId,
        agent_id: claim.agent_id,
        edge_type: "supports",
      });
      edgesCreated++;
    }

    // Find existing nodes for same agent + ticker → create edges
    const ticker = claim.ticker ?? tickers[0];
    if (ticker) {
      const priorNodes = getNodesByTicker(claim.agent_id, ticker, 10);
      for (const prior of priorNodes) {
        if (prior.id === nodeId) continue;

        // Determine edge type based on directional agreement
        if (prior.direction && claim.direction) {
          if (prior.direction !== claim.direction) {
            // CONTRADICTION: same agent changed direction on same ticker
            insertEdge({
              source_id: nodeId,
              target_id: prior.id,
              agent_id: claim.agent_id,
              edge_type: "contradicts",
            });
            edgesCreated++;
            contradictionsFound++;

            // If this is a direction reversal, also create a correction node
            if (prior.content_type === "prediction" && !prior.resolved) {
              const corrId = insertNode({
                agent_id: claim.agent_id,
                content: `Changed from ${prior.direction} to ${claim.direction} on ${ticker}. Was ${prior.confidence?.toFixed(2)} confident, now ${claim.confidence.toFixed(2)}.`,
                content_type: "correction",
                debate_id: debate.id,
                ticker,
                direction: claim.direction,
                confidence: claim.confidence,
              });
              insertEdge({
                source_id: corrId,
                target_id: prior.id,
                agent_id: claim.agent_id,
                edge_type: "corrects",
              });
              nodesCreated++;
              edgesCreated++;
            }
          } else {
            // AGREEMENT: same direction → supports edge
            insertEdge({
              source_id: nodeId,
              target_id: prior.id,
              agent_id: claim.agent_id,
              edge_type: "supports",
            });
            edgesCreated++;
          }
        }

        // TEMPORAL: always create a follows edge to the most recent prior
        if (prior.id === priorNodes[0]?.id) {
          insertEdge({
            source_id: nodeId,
            target_id: prior.id,
            agent_id: claim.agent_id,
            edge_type: "follows",
          });
          edgesCreated++;
        }
      }
    }
  }

  // Cross-agent contradiction detection
  // When agent A says "up" and agent B says "down" in the same debate,
  // create contradiction edges in BOTH agents' graphs
  const agentClaims = Array.from(newNodeIds.entries());
  for (let i = 0; i < agentClaims.length; i++) {
    for (let j = i + 1; j < agentClaims.length; j++) {
      const [agentA, nodeA] = agentClaims[i];
      const [agentB, nodeB] = agentClaims[j];
      const claimA = claims.find(c => c.agent_id === agentA);
      const claimB = claims.find(c => c.agent_id === agentB);

      if (claimA && claimB && claimA.direction !== claimB.direction) {
        // Create an observation in agent A's graph about agent B's disagreement
        const obsA = insertNode({
          agent_id: agentA as AgentId,
          content: `${agentB} argued ${claimB.direction} (conf ${claimB.confidence.toFixed(2)}) while I argued ${claimA.direction}`,
          content_type: "observation",
          debate_id: debate.id,
          ticker: claimA.ticker ?? undefined,
          direction: claimB.direction,
          confidence: claimB.confidence,
          salience: 0.7,
        });
        insertEdge({
          source_id: obsA,
          target_id: nodeA,
          agent_id: agentA as AgentId,
          edge_type: "contradicts",
        });
        nodesCreated++;
        edgesCreated++;

        // Mirror for agent B
        const obsB = insertNode({
          agent_id: agentB as AgentId,
          content: `${agentA} argued ${claimA.direction} (conf ${claimA.confidence.toFixed(2)}) while I argued ${claimB.direction}`,
          content_type: "observation",
          debate_id: debate.id,
          ticker: claimB.ticker ?? undefined,
          direction: claimA.direction,
          confidence: claimA.confidence,
          salience: 0.7,
        });
        insertEdge({
          source_id: obsB,
          target_id: nodeB,
          agent_id: agentB as AgentId,
          edge_type: "contradicts",
        });
        nodesCreated++;
        edgesCreated++;
        contradictionsFound++;
      }
    }
  }

  console.log(`[memory] Stored: ${nodesCreated} nodes, ${edgesCreated} edges, ${contradictionsFound} contradictions`);
  return { nodes_created: nodesCreated, edges_created: edgesCreated, contradictions_found: contradictionsFound };
}
