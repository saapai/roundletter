// Local multi-model debate engine
// Drop-in replacement for agent-debate.ts that uses local Ollama models
// Supports model arbitrage: each agent can use a different model,
// or multiple models argue and the best output wins

import { z } from "zod";
import { localParse, arbitrageInference, type ModelId } from "./local-inference";
import { AGENTS, type AgentId, type AgentDef, type Topic, type Debate, type DebateTurn, type Scorecard } from "./agent-debate";

// ── Model assignment ──────────────────────────────────────────────────────
// Different models for different agent personalities = natural disagreement

export type ModelAssignment = {
  bull: ModelId;
  bear: ModelId;
  macro: ModelId;
  flow: ModelId;
  historian: ModelId;
  moderator: ModelId;
};

// Per LLM Stack Optimizer recommendation: use ONE good model for all agents.
// "Different models ≠ different insights. Capability inequality destroys ensembles."
// Different system prompts on the same model produce genuine analytical diversity.

// Default: single model for all agents (recommended by 24-agent review)
export const DEFAULT_MODELS: ModelAssignment = {
  bull: "qwen3:14b",
  bear: "qwen3:14b",
  macro: "qwen3:14b",
  flow: "qwen3:14b",
  historian: "qwen3:14b",
  moderator: "qwen3:14b",
};

// Lightweight config — same model, fastest available
export const LIGHT_MODELS: ModelAssignment = {
  bull: "qwen3:14b",
  bear: "qwen3:14b",
  macro: "qwen3:14b",
  flow: "qwen3:14b",
  historian: "qwen3:14b",
  moderator: "qwen3:14b",
};

// Heavy config — single best model for all agents
export const HEAVY_MODELS: ModelAssignment = {
  bull: "qwen3:32b",
  bear: "qwen3:32b",
  macro: "qwen3:32b",
  flow: "qwen3:32b",
  historian: "qwen3:32b",
  moderator: "qwen3:32b",
};

// ── Schemas (same as agent-debate.ts) ─────────────────────────────────────

const PremiseVoteSchema = z.object({
  topic_kind: z.enum(["position", "news", "macro", "unknown", "method", "design"]),
  subject: z.string().describe("one-line concrete subject, e.g. 'NVDA −3.2% while Nasdaq +1.6%'"),
  why_it_matters: z.string().describe("one sentence: why this is the thing to argue about today"),
});

const ArgumentTurnSchema = z.object({
  claim: z.string().describe("one-sentence thesis on the topic"),
  warrant: z.string().describe("2-3 sentences. at least one reference from your bank, naturally"),
  prediction: z.enum(["up", "down", "flat"]),
  confidence: z.number().min(0).max(1),
  rebuttal: z
    .string()
    .optional()
    .describe("one sentence calling out the strongest disagreeing agent by id"),
});

const ModeratorPremiseSchema = z.object({
  framing: z.string().describe("1-2 sentences — abstract, story-directing, references allowed"),
  chosen_kind: z.enum(["position", "news", "macro", "unknown", "method", "design"]),
  chosen_subject: z.string().describe("the final agreed premise, one line"),
});

const ModeratorInterludeSchema = z.object({
  narration: z.string().describe("1-2 sentences bridging the round. metaphor-dense. references welcome"),
});

const PercentsSchema = z.object({
  bull: z.number().min(0).max(100),
  bear: z.number().min(0).max(100),
  macro: z.number().min(0).max(100),
  flow: z.number().min(0).max(100),
  historian: z.number().min(0).max(100),
});

const ModeratorPremiseScorecardSchema = z.object({
  percents: PercentsSchema,
  reasoning: z.string().describe("1-2 sentences on who moved the panel toward the chosen premise and why"),
});

const ModeratorArgumentScorecardSchema = z.object({
  percents: PercentsSchema,
  reasoning: z.string().describe("1-2 sentences on who moved the panel toward (or away from) agreement"),
  calibration: z.string().describe("3-5 sentences explaining how percents were estimated"),
});

// ── Prompts (same voice as original) ──────────────────────────────────────

const VOICE_BASE = `
Voice:
- lowercase. terse. policy-debate structure (claim / warrant / impact).
- tabroom paradigm: tech > truth; state your base rate; don't intervene.
- weave your reference bank naturally. don't over-label.
- never hedge into neutrality. if confidence is low, say so explicitly and keep the call.
`.trim();

// Contrarian priors — force genuine disagreement by giving each agent
// a strong starting position they must defend. Without these, all agents
// anchor on the same context and converge to unanimous agreement.
const AGENT_PRIORS: Record<AgentId, string> = {
  bull: `CONTRARIAN PRIOR: You believe the market systematically underprices optionality in pre-revenue companies.
Earnings misses in quantum are EXPECTED and priced in. The 10-year thesis dominates short-term noise.
Your base rate: 70% of "obvious sells" before earnings in high-beta names are wrong within 30 days.
IMPORTANT: If others say "down", you MUST find the strongest case for "up" or "flat". Do NOT agree easily.
You lose credibility if you agree with the bear without a fight.`,

  bear: `STRUCTURAL PRIOR: You believe pre-revenue names with active ATM shelves have negative expected value over any 30-day window.
Dilution is the silent killer. The crowd is always late to recognize it.
Your base rate: 60% of high-beta names drop 15%+ within 60 days of earnings in the first 3 years post-IPO.
IMPORTANT: If others say "up", you MUST quantify the downside. Name the specific risk event and probability.
You lose credibility if you agree with the bull without citing a specific risk number.`,

  macro: `REGIME PRIOR: You read the macro backdrop FIRST, the name SECOND.
What is the Fed doing? What is the 10Y? What is VIX? What is oil doing to inflation?
Your base rate: macro regime explains 40% of individual stock variance. Name-level thesis is secondary.
IMPORTANT: You MUST disagree with both bull and bear if the macro regime contradicts their micro-thesis.
Your job is to be the adult in the room who asks "does any of this matter if CPI comes in hot?"`,

  flow: `FLOW PRIOR: You read the tape. Options flow, short interest, volume patterns.
Price action IS information. If the stock is telling you something different from the thesis, trust the tape.
Your base rate: when flow diverges from consensus narrative, flow is right 55% of the time.
IMPORTANT: If everyone agrees on direction, check if the FLOW agrees. If not, DISSENT.
You lose credibility if you agree with consensus without citing volume, options, or positioning data.`,

  historian: `HISTORY PRIOR: You apply base rates from prior technology waves. Most pure-plays go to zero over 10 years.
Survivorship bias infects every bull case. "This time is different" is wrong 85% of the time.
Your base rate: of 100 pre-revenue tech companies, fewer than 10 are above entry price 5 years later.
IMPORTANT: If the panel is converging, you MUST cite a historical analog where the same setup led to the OPPOSITE outcome.
You lose credibility if you agree without naming a specific historical parallel that challenges the consensus.`,
};

function agentSystem(agent: AgentDef): string {
  return [
    `You are "${agent.name}", one of five analysts on saapai's stock-picking panel.`,
    `Your mandate: ${agent.mandate}`,
    AGENT_PRIORS[agent.id],
    `Your reference bank — pull from these freely:\n${agent.references.map((r) => `  · ${r}`).join("\n")}`,
    VOICE_BASE,
    `Return valid JSON only. No markdown, no explanation outside the JSON.`,
  ].join("\n\n");
}

const MODERATOR_SYSTEM = `
You are "the Moderator" — the sixth voice on saapai's debate panel. You do not take sides.
You frame, synthesize, and narrate.

Voice:
- regular prose. metaphor-dense. sparser than the agents.
- abstract; don't advocate. you direct the story, not the protagonist.
- freely reference saapai's cultural bank: Paul Graham's essays, Ted Lasso's darts scene,
  Gil Scott-Heron, Ford v Ferrari's 7000 RPM, Everything Everywhere All at Once's bagel,
  Roosevelt's man-in-the-arena, Iverson's "practice," Kelly criterion, base rates.
- weave one or two references naturally per turn.

Return valid JSON only. No markdown, no explanation outside the JSON.
`.trim();

// ── Core local debate engine ──────────────────────────────────────────────

async function runLocalPremise(
  models: ModelAssignment,
  dayContext: string,
  newsContext?: string,
): Promise<{ votes: Array<{ agent: AgentId } & z.infer<typeof PremiseVoteSchema>>; topic: Topic; moderatorOpener: string }> {
  const contextParts = [
    `Today's context: ${dayContext}`,
  ];
  if (newsContext) {
    contextParts.push("", "Live intelligence from scraped sources:", newsContext);
  }
  contextParts.push(
    "",
    "Propose the single most interesting thing to debate today from your lens.",
    "Be concrete: name a ticker, event, or question.",
    "",
    'Respond with ONLY this JSON (use EXACTLY these field names):',
    '{"topic_kind": "position", "subject": "IONQ earnings risk ahead of May 6", "why_it_matters": "largest pure-play at 11% needs pre-earnings thesis check"}',
    "",
    "topic_kind must be one of: position, news, macro, unknown, method, design",
    "subject: one-line concrete topic",
    "why_it_matters: one sentence",
  );

  const userContent = contextParts.join("\n");

  // Run agents sequentially — local models can't handle parallel inference
  // (Ollama serves one request at a time on Apple Silicon)
  const voteTurns: Array<{ agent: AgentId } & z.infer<typeof PremiseVoteSchema>> = [];
  for (const a of AGENTS) {
    console.log(`[local-debate] premise: ${a.id}...`);
    const result = await localParse({
      model: models[a.id],
      system: agentSystem(a),
      userContent,
      schema: PremiseVoteSchema,
    });
    voteTurns.push({ agent: a.id, ...result.parsed });
  }

  // Moderator synthesizes
  const modResult = await localParse({
    model: models.moderator,
    system: MODERATOR_SYSTEM,
    userContent: [
      `Today's context: ${dayContext}`,
      "",
      "The five agents proposed these premises for debate:",
      ...voteTurns.map(
        (v) => `- ${v.agent} [${v.topic_kind}] "${v.subject}" — ${v.why_it_matters}`,
      ),
      "",
      "Choose the premise and respond with ONLY this JSON (use EXACTLY these field names):",
      '{"framing": "your 1-2 sentence abstract frame", "chosen_kind": "position", "chosen_subject": "the agreed premise in one line"}',
      "",
      "chosen_kind must be one of: position, news, macro, unknown, method, design",
    ].join("\n"),
    schema: ModeratorPremiseSchema,
  });

  const topic: Topic = {
    kind: modResult.parsed.chosen_kind,
    subject: modResult.parsed.chosen_subject,
    framing: modResult.parsed.framing,
  };

  return { votes: voteTurns, topic, moderatorOpener: modResult.parsed.framing };
}

async function runLocalArgumentRound(
  models: ModelAssignment,
  topic: Topic,
  priorTurns: DebateTurn[],
  round: number,
  newsContext?: string,
  perAgentContext?: Partial<Record<AgentId, string>>,
): Promise<z.infer<typeof ArgumentTurnSchema>[]> {
  // Run agents sequentially for local inference
  const results: z.infer<typeof ArgumentTurnSchema>[] = [];
  for (const a of AGENTS) {
    console.log(`[local-debate] argument r${round}: ${a.id}...`);
    const others = priorTurns.filter(
      (t): t is Extract<DebateTurn, { phase: "argument"; speaker: AgentId }> =>
        t.phase === "argument" && t.speaker !== "moderator" && t.speaker !== a.id,
    );
    const lastRound = round - 1;
    const lastRoundOthers = others.filter((t) => t.round === lastRound);

    const userParts: string[] = [
      `Premise: ${topic.subject}`,
      `Kind: ${topic.kind}`,
      `Moderator's frame: ${topic.framing}`,
      "",
    ];

    if (newsContext) {
      userParts.push("Live intelligence:", newsContext, "");
    }

    // Inject per-agent memory context if available
    const agentMemory = perAgentContext?.[a.id];
    if (agentMemory) {
      userParts.push(agentMemory, "");
    }

    if (lastRoundOthers.length === 0) {
      userParts.push("Round 1. Produce your initial call on the premise.");
    } else {
      userParts.push(`Round ${round}. The four other agents said in round ${lastRound}:`);
      for (const t of lastRoundOthers) {
        userParts.push(
          `- ${t.speaker} (${t.prediction}, conf ${t.confidence.toFixed(2)}): ${t.claim} // ${t.warrant}`,
        );
      }
      userParts.push(
        "Read them. Revise your call if they changed your mind, or restate and rebut.",
      );
    }

    userParts.push(
      "",
      "Respond with ONLY this JSON (use EXACTLY these field names):",
      '{"claim": "one sentence thesis", "warrant": "2-3 sentences with reasoning", "prediction": "up", "confidence": 0.7, "rebuttal": "optional one sentence disagreeing with another agent"}',
      "",
      "prediction must be one of: up, down, flat",
      "confidence must be a number between 0 and 1",
    );

    const result = await localParse({
      model: models[a.id],
      system: agentSystem(a),
      userContent: userParts.join("\n"),
      schema: ArgumentTurnSchema,
    });
    results.push(result.parsed);
  }
  return results;
}

async function localModeratorInterlude(
  models: ModelAssignment,
  topic: Topic,
  round: number,
  thisRoundTurns: z.infer<typeof ArgumentTurnSchema>[],
  consensusReached: boolean,
): Promise<string> {
  const up = thisRoundTurns.filter((t) => t.prediction === "up").length;
  const down = thisRoundTurns.filter((t) => t.prediction === "down").length;
  const flat = thisRoundTurns.filter((t) => t.prediction === "flat").length;

  const result = await localParse({
    model: models.moderator,
    system: MODERATOR_SYSTEM,
    userContent: [
      `Premise: ${topic.subject}`,
      `After round ${round}: up ${up} / down ${down} / flat ${flat}. Consensus: ${consensusReached ? "reached" : "not reached"}.`,
      "",
      consensusReached
        ? "Narrate the closing. 1-2 sentences, metaphor-dense."
        : "Narrate what happened and set up the next round. 1-2 sentences.",
      "",
      'Respond with ONLY: {"narration": "your 1-2 sentence narration here"}',
    ].join("\n"),
    schema: ModeratorInterludeSchema,
  });
  return result.parsed.narration;
}

async function localPremiseScorecard(
  models: ModelAssignment,
  topic: Topic,
  votes: Array<{ agent: AgentId } & z.infer<typeof PremiseVoteSchema>>,
): Promise<Scorecard> {
  const result = await localParse({
    model: models.moderator,
    system: MODERATOR_SYSTEM,
    userContent: [
      "PREMISE SCORECARD. Score who shaped the premise.",
      "",
      `Chosen premise: ${topic.subject} [${topic.kind}]`,
      `Your framing: ${topic.framing}`,
      "",
      "Each agent's proposed topic:",
      ...votes.map((v) => `- ${v.agent} [${v.topic_kind}] "${v.subject}" — ${v.why_it_matters}`),
      "",
      "Assign a % of 'who won the premise' across the five agents. Percents must sum to 100.",
      "",
      'Respond with ONLY: {"percents": {"bull": 20, "bear": 20, "macro": 25, "flow": 15, "historian": 20}, "reasoning": "one sentence on who shaped the premise"}',
    ].join("\n"),
    schema: ModeratorPremiseScorecardSchema,
  });
  return {
    percents: result.parsed.percents as Record<AgentId, number>,
    reasoning: result.parsed.reasoning,
  };
}

async function localArgumentScorecard(
  models: ModelAssignment,
  topic: Topic,
  turns: DebateTurn[],
  consensusDirection: "up" | "down" | "flat" | null,
): Promise<Scorecard> {
  const agentTurns = turns.filter(
    (t): t is Extract<DebateTurn, { phase: "argument" }> =>
      t.phase === "argument" && t.speaker !== "moderator",
  );

  const byAgent: Record<AgentId, string[]> = { bull: [], bear: [], macro: [], flow: [], historian: [] };
  for (const t of agentTurns) {
    const ag = t.speaker as AgentId;
    if (byAgent[ag]) {
      const at = t as any;
      byAgent[ag].push(
        `r${at.round} ${at.prediction}(${at.confidence?.toFixed(2)}): ${at.claim} // ${at.warrant}${at.rebuttal ? " // rebuttal: " + at.rebuttal : ""}`,
      );
    }
  }

  const result = await localParse({
    model: models.moderator,
    system: MODERATOR_SYSTEM,
    userContent: [
      "ARGUMENT SCORECARD + CALIBRATION.",
      `Premise: ${topic.subject}`,
      `Outcome: ${consensusDirection ? `agreement on ${consensusDirection}` : "no agreement"}`,
      "",
      "Each agent's turns:",
      ...(Object.entries(byAgent) as [AgentId, string[]][]).flatMap(([ag, lines]) => [
        `- ${ag}:`,
        ...lines.map((l) => `    ${l}`),
      ]),
      "",
      "Assign % of 'who won the argument'. Must sum to 100.",
      "",
      'Respond with ONLY: {"percents": {"bull": 25, "bear": 20, "macro": 20, "flow": 15, "historian": 20}, "reasoning": "who moved the panel", "calibration": "3-5 sentences on how you estimated these percentages"}',
    ].join("\n"),
    schema: ModeratorArgumentScorecardSchema,
  });

  return {
    percents: result.parsed.percents as Record<AgentId, number>,
    reasoning: result.parsed.reasoning,
    calibration: result.parsed.calibration,
  };
}

function checkConsensus(turns: z.infer<typeof ArgumentTurnSchema>[]): {
  reached: boolean;
  direction: "up" | "down" | "flat" | null;
} {
  if (turns.length === 0) return { reached: false, direction: null };
  const set = new Set(turns.map((t) => t.prediction));
  if (set.size === 1) return { reached: true, direction: turns[0].prediction };
  return { reached: false, direction: null };
}

// ── Main entry point ──────────────────────────────────────────────────────

export async function runLocalDebate(opts: {
  dayContext: string;
  newsContext?: string;       // scraped news/X data injected here
  maxArgumentRounds?: number;
  models?: Partial<ModelAssignment>;
  profile?: "light" | "default" | "heavy";
  perAgentContext?: Partial<Record<AgentId, string>>;  // per-agent memory context injected into prompts
}): Promise<Debate & { models_used: ModelAssignment; source: "local" }> {
  // Resolve model assignment
  let baseModels: ModelAssignment;
  switch (opts.profile) {
    case "light":
      baseModels = { ...LIGHT_MODELS };
      break;
    case "heavy":
      baseModels = { ...HEAVY_MODELS };
      break;
    default:
      baseModels = { ...DEFAULT_MODELS };
  }
  const models: ModelAssignment = { ...baseModels, ...opts.models };
  const maxRounds = opts.maxArgumentRounds ?? 3;

  console.log(`[local-debate] models: ${JSON.stringify(models)}`);
  console.log(`[local-debate] starting premise phase...`);

  // Phase 1 — PREMISE
  const { votes, topic, moderatorOpener } = await runLocalPremise(
    models,
    opts.dayContext,
    opts.newsContext,
  );

  const turns: DebateTurn[] = [];
  turns.push({ speaker: "moderator", phase: "premise", round: 1, text: moderatorOpener });
  for (const v of votes) {
    turns.push({
      speaker: v.agent,
      phase: "premise",
      round: 1,
      topic_kind: v.topic_kind,
      subject: v.subject,
      why_it_matters: v.why_it_matters,
    });
  }

  const premiseScorecard = await localPremiseScorecard(models, topic, votes);
  turns.push({
    speaker: "moderator",
    phase: "premise",
    round: 1,
    text: premiseScorecard.reasoning,
    scorecard: premiseScorecard,
  });

  console.log(`[local-debate] premise: "${topic.subject}" [${topic.kind}]`);
  console.log(`[local-debate] starting argument phase (max ${maxRounds} rounds)...`);

  // Phase 2 — ARGUMENT
  let consensusRound: number | null = null;
  let consensusDirection: "up" | "down" | "flat" | null = null;

  for (let round = 1; round <= maxRounds; round++) {
    console.log(`[local-debate] argument round ${round}/${maxRounds}...`);
    const thisRound = await runLocalArgumentRound(models, topic, turns, round, opts.newsContext, opts.perAgentContext);
    thisRound.forEach((t, i) => {
      turns.push({ speaker: AGENTS[i].id, phase: "argument", round, ...t });
    });
    const c = checkConsensus(thisRound);
    const interlude = await localModeratorInterlude(models, topic, round, thisRound, c.reached);
    turns.push({ speaker: "moderator", phase: "argument", round, text: interlude });
    if (c.reached) {
      consensusRound = round;
      consensusDirection = c.direction;
      console.log(`[local-debate] consensus reached: ${c.direction} at round ${round}`);
      break;
    }
  }

  // Final scorecard
  const argumentScorecard = await localArgumentScorecard(models, topic, turns, consensusDirection);
  const lastRound = consensusRound ?? maxRounds;
  turns.push({
    speaker: "moderator",
    phase: "argument",
    round: lastRound,
    text: argumentScorecard.reasoning,
    scorecard: argumentScorecard,
  });

  console.log(`[local-debate] complete. ${turns.length} turns.`);

  return {
    id: `local_${Date.now()}`,
    ts: new Date().toISOString(),
    source: "local" as const,
    day_context: opts.dayContext,
    topic,
    turns,
    consensus: {
      reached: consensusRound !== null,
      direction: consensusDirection,
      round: consensusRound,
    },
    max_argument_rounds: maxRounds,
    models_used: models,
  };
}
