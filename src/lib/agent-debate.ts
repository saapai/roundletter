import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

// Five-agent stock debate runner. Each round every agent emits a structured
// turn; we loop until all 5 agree on a direction OR max rounds hit. All via
// one Anthropic client using claude-opus-4-6 + Zod-validated structured output.

export type AgentDef = {
  id: "bull" | "bear" | "macro" | "flow" | "historian";
  name: string;
  mandate: string;
};

const TurnSchema = z.object({
  claim: z.string().describe("one-sentence thesis on the ticker"),
  warrant: z.string().describe("2-3 sentences of concrete reasoning"),
  prediction: z.enum(["up", "down", "flat"]),
  confidence: z.number().min(0).max(1),
  rebuttal: z
    .string()
    .optional()
    .describe("one sentence addressing the strongest opposing agent, when relevant"),
});
export type Turn = z.infer<typeof TurnSchema>;

export type AgentTurn = Turn & { agent: AgentDef["id"]; round: number };

export type Debate = {
  id: string;
  ts: string;
  ticker: string;
  horizon_days: number;
  rounds: AgentTurn[];
  consensus: {
    reached: boolean;
    prediction: "up" | "down" | "flat" | null;
    round: number | null;
  };
  max_rounds: number;
};

const AGENT_VOICE = `
Voice constraints:
- lowercase. terse. claim/warrant/impact structure from policy debate.
- tabroom paradigm: tech > truth; state your base rate; don't intervene beyond your mandate.
- steelman your lens. if another agent would disagree, name it in your warrant.
- never hedge into neutrality. if confidence is low, say so explicitly and keep the call.
`.trim();

function buildSystem(agent: AgentDef): string {
  return [
    `You are "${agent.name}", one of five analysts on saapai's stock-picking panel.`,
    `Your mandate: ${agent.mandate}`,
    AGENT_VOICE,
    `Return structured output only.`,
  ].join("\n\n");
}

function buildUser(
  ticker: string,
  horizonDays: number,
  agentId: string,
  priorRounds: AgentTurn[],
): string {
  const parts: string[] = [];
  parts.push(`Ticker: ${ticker}`);
  parts.push(`Horizon: ${horizonDays} days`);

  if (priorRounds.length === 0) {
    parts.push("This is round 1. Produce your initial call.");
  } else {
    const lastRound = Math.max(...priorRounds.map((r) => r.round));
    const others = priorRounds.filter((r) => r.round === lastRound && r.agent !== agentId);
    parts.push(`This is round ${lastRound + 1}.`);
    parts.push(`The other four agents said (round ${lastRound}):`);
    for (const t of others) {
      parts.push(
        `- ${t.agent} (${t.prediction}, conf ${t.confidence.toFixed(2)}): ${t.claim} // ${t.warrant}`,
      );
    }
    parts.push(
      "Read what they said. Revise your call if they changed your mind — or state your call again and name which agent's warrant you most disagree with and why (rebuttal).",
    );
  }
  return parts.join("\n");
}

async function runOne(
  client: Anthropic,
  agent: AgentDef,
  ticker: string,
  horizonDays: number,
  priorRounds: AgentTurn[],
  round: number,
): Promise<AgentTurn> {
  const msg = await client.messages.parse({
    model: "claude-opus-4-6",
    max_tokens: 2048,
    system: buildSystem(agent),
    messages: [{ role: "user", content: buildUser(ticker, horizonDays, agent.id, priorRounds) }],
    output_config: { format: zodOutputFormat(TurnSchema) },
  });
  const parsed = msg.parsed_output;
  if (!parsed) {
    throw new Error(`agent ${agent.id} returned unparseable output`);
  }
  return { ...parsed, agent: agent.id, round };
}

function checkConsensus(
  rounds: AgentTurn[],
  round: number,
): { reached: boolean; prediction: "up" | "down" | "flat" | null } {
  const turns = rounds.filter((r) => r.round === round);
  if (turns.length === 0) return { reached: false, prediction: null };
  const set = new Set(turns.map((t) => t.prediction));
  if (set.size === 1) {
    return { reached: true, prediction: turns[0].prediction };
  }
  return { reached: false, prediction: null };
}

export async function runDebate(opts: {
  ticker: string;
  agents: AgentDef[];
  horizonDays?: number;
  maxRounds?: number;
  apiKey?: string;
}): Promise<Debate> {
  const { ticker, agents } = opts;
  const horizonDays = opts.horizonDays ?? 30;
  const maxRounds = opts.maxRounds ?? 4;
  const client = new Anthropic({ apiKey: opts.apiKey });

  const rounds: AgentTurn[] = [];
  let consensusRound: number | null = null;
  let consensusPrediction: "up" | "down" | "flat" | null = null;

  for (let round = 1; round <= maxRounds; round++) {
    const turns = await Promise.all(
      agents.map((a) => runOne(client, a, ticker, horizonDays, rounds, round)),
    );
    rounds.push(...turns);

    const c = checkConsensus(rounds, round);
    if (c.reached) {
      consensusRound = round;
      consensusPrediction = c.prediction;
      break;
    }
  }

  return {
    id: `dbt_${Date.now()}`,
    ts: new Date().toISOString(),
    ticker,
    horizon_days: horizonDays,
    rounds,
    consensus: {
      reached: consensusRound !== null,
      prediction: consensusPrediction,
      round: consensusRound,
    },
    max_rounds: maxRounds,
  };
}
