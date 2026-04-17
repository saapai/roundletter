import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

// Five-agent stock debate + one moderator, two phases:
//   1. PREMISE — moderator frames options; each agent votes + pitches one
//      topic; moderator synthesizes the agreed-on premise.
//   2. ARGUMENT — each agent takes a position; rounds continue until all
//      five agree on direction OR max rounds hit. Moderator narrates
//      between rounds with references from saapai's bank.
//
// The moderator speaks in regular prose — meta, abstract, story-directing.
// Each agent has a distinct color used in UI rendering (see AGENT_COLOR).

export type AgentId = "bull" | "bear" | "macro" | "flow" | "historian";
export type Speaker = AgentId | "moderator";

export type AgentDef = {
  id: AgentId;
  name: string;
  mandate: string;
  color: string;        // hex — UI highlights this agent's turns
  references: string[]; // bank of allusions this agent leans on
};

// Canonical agent colors — each distinct, each in-palette with the deck
// (deep sage green / rust / amber / flow-indigo / historian-stone). The
// moderator renders in charcoal (normal text), no pill.
export const AGENTS: AgentDef[] = [
  {
    id: "bull",
    name: "the Bull",
    mandate:
      "Steelman the 10-year thesis. Maximize upside. Own the pureplay books. Live with the drawdowns.",
    color: "#5F8B4E", // sage green
    references: [
      "Roosevelt's man in the arena",
      "EEAO — the multiverse of outcomes; we only live one branch",
      "7000 RPM — the perfect-moment frame from Ford v Ferrari",
      "Paul Graham, 'Frighteningly Ambitious Startup Ideas'",
    ],
  },
  {
    id: "bear",
    name: "the Bear",
    mandate:
      "Survive drawdowns. Favor trillion-dollar balance sheets and dry powder. Name the shelf, the dilution, the offering.",
    color: "#8B3A2E", // rust
    references: [
      "Martingale — doubling down is how ruin compounds",
      "Ed Thorp's Kelly criterion — size by edge, not conviction",
      "Risk of ruin vs drawdown tolerance",
      "the naked king — when nobody says the thesis has no clothes",
    ],
  },
  {
    id: "macro",
    name: "Macro",
    mandate:
      "Position for the backdrop, not the theme. Power, liquidity, rates. The binding constraint behind the hype.",
    color: "#A67A3A", // amber
    references: [
      "Paul Graham, 'Cities and Ambition' — what does the whisper reward",
      "Gil Scott-Heron — the revolution will not be televised",
      "the binding constraint — Goldratt's theory of constraints",
    ],
  },
  {
    id: "flow",
    name: "Flow",
    mandate:
      "Own flow-clean vehicles. Avoid retail-crowded names with active ATMs. Read the tape before the thesis.",
    color: "#5E7098", // indigo / cold blue
    references: [
      "Iverson — 'we talkin' bout practice?' — process dominates outcome",
      "barbecue sauce — slather when you're losing; the flavor hides the mistake",
      "the dealer's gamma book",
    ],
  },
  {
    id: "historian",
    name: "the Historian",
    mandate:
      "Apply base rates from prior thematic waves. Most pure-plays go to zero over 10yr. Be suspicious of 'this time different'.",
    color: "#6B6560", // stone gray
    references: [
      "Ted Lasso darts — be curious, not judgmental",
      "Paul Graham's essays on base rates",
      "1999 dot-com — owning QQQ beat picking individual names",
      "the survivorship bias inside every 'case study'",
    ],
  },
];

export const AGENT_COLOR: Record<AgentId, string> = Object.fromEntries(
  AGENTS.map((a) => [a.id, a.color]),
) as Record<AgentId, string>;

// ── Schemas ────────────────────────────────────────────────────────────────

const PremiseVoteSchema = z.object({
  topic_kind: z.enum(["position", "news", "macro", "unknown", "method", "design"]),
  subject: z.string().describe("one-line concrete subject, e.g. 'NVDA −3.2% while Nasdaq +1.6%'"),
  why_it_matters: z.string().describe("one sentence: why this is the thing to argue about today"),
});
type PremiseVote = z.infer<typeof PremiseVoteSchema>;

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
type ArgumentTurn = z.infer<typeof ArgumentTurnSchema>;

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
  calibration: z
    .string()
    .describe(
      "3-5 sentences. explain how these percents were estimated: what signals (rebuttal hits, agreement pulls, reference weight, confidence shifts, who converted whom), how you normalized to 100, what this is NOT (not prediction accuracy, only influence within this debate)",
    ),
});

// ── Output types ───────────────────────────────────────────────────────────

export type Topic = {
  kind: "position" | "news" | "macro" | "unknown" | "method" | "design";
  subject: string;
  framing: string; // moderator's one-line frame
};

export type Scorecard = {
  percents: Record<AgentId, number>;
  reasoning: string;
  calibration?: string; // present on the final argument-phase scorecard
};

export type DebateTurn =
  | ({ speaker: AgentId; phase: "premise"; round: 1 } & PremiseVote)
  | ({ speaker: AgentId; phase: "argument"; round: number } & ArgumentTurn)
  | {
      speaker: "moderator";
      phase: "premise" | "argument";
      round: number;
      text: string;
      scorecard?: Scorecard;
    };

export type Debate = {
  id: string;
  ts: string;
  day_context: string; // one-liner like "2026-04-15 · Nasdaq +1.6% · NVDA −3.2% · quiet macro day"
  topic: Topic;
  turns: DebateTurn[];
  consensus: {
    reached: boolean;
    direction: "up" | "down" | "flat" | null;
    round: number | null;
  };
  max_argument_rounds: number;
};

// ── Prompts ────────────────────────────────────────────────────────────────

const VOICE_BASE = `
Voice:
- lowercase. terse. policy-debate structure (claim / warrant / impact).
- tabroom paradigm: tech > truth; state your base rate; don't intervene.
- weave your reference bank naturally. don't over-label ("as Thorp says..." is fine;
  "per the Kelly criterion formula..." is too much).
- never hedge into neutrality. if confidence is low, say so explicitly and keep the call.
`.trim();

function agentSystem(agent: AgentDef): string {
  return [
    `You are "${agent.name}", one of five analysts on saapai's stock-picking panel.`,
    `Your mandate: ${agent.mandate}`,
    `Your reference bank — pull from these freely:\n${agent.references.map((r) => `  · ${r}`).join("\n")}`,
    VOICE_BASE,
    `Return structured output only.`,
  ].join("\n\n");
}

const MODERATOR_SYSTEM = `
You are "the Moderator" — the sixth voice on saapai's debate panel. You do not take sides.
You frame, synthesize, and narrate.

Voice:
- regular prose. metaphor-dense. sparser than the agents.
- abstract; don't advocate. you are the director of the story, not the protagonist.
- freely reference saapai's cultural bank: Paul Graham's essays (Cities and Ambition,
  Keep Your Identity Small, How to Do What You Love), Ted Lasso's darts scene
  ("be curious, not judgmental"), Gil Scott-Heron's "the revolution will not be
  televised," Ford v Ferrari's 7000 RPM, Everything Everywhere All at Once's bagel,
  Roosevelt's man-in-the-arena, Iverson's "practice," the naked king, martingale
  betting, Kelly criterion, the idea of base rates, dye vs poison (choose dye),
  "attention is all you need," "method is the medicine."
- weave one or two references naturally per turn. do not over-label them.
- when you synthesize, be specific about what is actually being decided.

Return structured output only.
`.trim();

// ── Core ───────────────────────────────────────────────────────────────────

function mkClient(apiKey?: string): Anthropic {
  return new Anthropic({ apiKey });
}

// PREMISE PHASE
// 1. Each agent proposes what to debate today (one topic)
// 2. Moderator synthesizes the premise from the five proposals
async function runPremise(
  client: Anthropic,
  dayContext: string,
): Promise<{ votes: Array<{ agent: AgentId } & PremiseVote>; topic: Topic; moderatorOpener: string }> {
  const voteTurns = await Promise.all(
    AGENTS.map(async (a) => {
      const msg = await client.messages.parse({
        model: "claude-opus-4-6",
        max_tokens: 1024,
        system: agentSystem(a),
        messages: [
          {
            role: "user",
            content: [
              `Today's context: ${dayContext}`,
              "",
              "Before we argue, we need to agree on WHAT to argue about.",
              "Propose the single most interesting thing to debate today from your lens.",
              "It can be: a specific position's movement, a news event, a macro shift,",
              "something we don't know, or a methodological question.",
              "Be concrete: name the ticker / event / question.",
            ].join("\n"),
          },
        ],
        output_config: { format: zodOutputFormat(PremiseVoteSchema) },
      });
      if (!msg.parsed_output) throw new Error(`premise vote parse failed for ${a.id}`);
      return { agent: a.id, ...msg.parsed_output };
    }),
  );

  // Moderator synthesizes
  const modMsg = await client.messages.parse({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    system: MODERATOR_SYSTEM,
    messages: [
      {
        role: "user",
        content: [
          `Today's context: ${dayContext}`,
          "",
          "The five agents proposed these premises for debate:",
          ...voteTurns.map(
            (v) =>
              `- ${v.agent} [${v.topic_kind}] "${v.subject}" — ${v.why_it_matters}`,
          ),
          "",
          "Frame the discussion with 1-2 sentences (abstract, metaphor-dense, reference the bank).",
          "Then choose the single premise the panel will actually argue about. You may synthesize.",
        ].join("\n"),
      },
    ],
    output_config: { format: zodOutputFormat(ModeratorPremiseSchema) },
  });
  if (!modMsg.parsed_output) throw new Error("moderator premise parse failed");

  const topic: Topic = {
    kind: modMsg.parsed_output.chosen_kind,
    subject: modMsg.parsed_output.chosen_subject,
    framing: modMsg.parsed_output.framing,
  };

  return { votes: voteTurns, topic, moderatorOpener: modMsg.parsed_output.framing };
}

// ARGUMENT PHASE
async function runArgumentRound(
  client: Anthropic,
  topic: Topic,
  priorTurns: DebateTurn[],
  round: number,
): Promise<ArgumentTurn[]> {
  return Promise.all(
    AGENTS.map(async (a) => {
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
          "Read them. Revise your call if they changed your mind, or restate it and name in your rebuttal field which agent you most disagree with and why.",
        );
      }

      const msg = await client.messages.parse({
        model: "claude-opus-4-6",
        max_tokens: 1500,
        system: agentSystem(a),
        messages: [{ role: "user", content: userParts.join("\n") }],
        output_config: { format: zodOutputFormat(ArgumentTurnSchema) },
      });
      if (!msg.parsed_output) throw new Error(`argument turn parse failed for ${a.id} r${round}`);
      return msg.parsed_output;
    }),
  );
}

async function moderatorPremiseScorecard(
  client: Anthropic,
  topic: Topic,
  votes: Array<{ agent: AgentId } & PremiseVote>,
): Promise<Scorecard> {
  const msg = await client.messages.parse({
    model: "claude-opus-4-6",
    max_tokens: 900,
    system: MODERATOR_SYSTEM,
    messages: [
      {
        role: "user",
        content: [
          "PREMISE SCORECARD. We've agreed on what to argue about. Now score who shaped the premise.",
          "",
          `Chosen premise: ${topic.subject} [${topic.kind}]`,
          `Your framing: ${topic.framing}`,
          "",
          "Each agent's proposed topic:",
          ...votes.map(
            (v) => `- ${v.agent} [${v.topic_kind}] "${v.subject}" — ${v.why_it_matters}`,
          ),
          "",
          "Assign a % of 'who won the premise' across the five agents. Percents must sum to 100.",
          "Base it on: whose framing you ended up closest to, whose concrete subject you used, whose reasoning was sharpest, whose lens most fits the chosen premise.",
          "Brief reasoning (1-2 sentences).",
        ].join("\n"),
      },
    ],
    output_config: { format: zodOutputFormat(ModeratorPremiseScorecardSchema) },
  });
  if (!msg.parsed_output) throw new Error("premise scorecard parse failed");
  return {
    percents: msg.parsed_output.percents as Record<AgentId, number>,
    reasoning: msg.parsed_output.reasoning,
  };
}

async function moderatorArgumentScorecard(
  client: Anthropic,
  topic: Topic,
  allArgumentTurns: ArgumentTurn[],
  consensusDirection: "up" | "down" | "flat" | null,
): Promise<Scorecard> {
  const byAgent: Record<AgentId, string[]> = {
    bull: [],
    bear: [],
    macro: [],
    flow: [],
    historian: [],
  };
  const agentTurns = allArgumentTurns.filter(
    (t): t is ArgumentTurn & { speaker: AgentId } => (t as any).speaker !== "moderator",
  );
  for (const t of agentTurns) {
    const ag = (t as any).speaker as AgentId;
    byAgent[ag].push(
      `r${(t as any).round} ${t.prediction}(${t.confidence.toFixed(2)}): ${t.claim} // ${t.warrant}${t.rebuttal ? " // rebuttal: " + t.rebuttal : ""}`,
    );
  }

  const msg = await client.messages.parse({
    model: "claude-opus-4-6",
    max_tokens: 1400,
    system: MODERATOR_SYSTEM,
    messages: [
      {
        role: "user",
        content: [
          "ARGUMENT SCORECARD + CALIBRATION. The argument phase has ended.",
          `Premise: ${topic.subject}`,
          `Outcome: ${consensusDirection ? `agreement on ${consensusDirection}` : "no agreement"}`,
          "",
          "Each agent's turns across rounds:",
          ...(Object.entries(byAgent) as Array<[AgentId, string[]]>).flatMap(([ag, lines]) => [
            `- ${ag}:`,
            ...lines.map((l) => `    ${l}`),
          ]),
          "",
          "Assign a % of 'who won the argument' across the five agents. Percents must sum to 100.",
          "Reasoning (1-2 sentences): who actually moved the panel — who converted whom, whose rebuttal landed, whose reference earned the nod.",
          "Calibration (3-5 sentences): explain exactly how you estimated these numbers. What signals did you use? (rebuttal hits, confidence shifts across rounds, who pulled others to their prediction, reference weight, rhetorical force). How did you normalize to 100? What this is NOT — not prediction accuracy, only intra-debate influence. Be honest that this is a qualitative estimate, not a measured score.",
        ].join("\n"),
      },
    ],
    output_config: { format: zodOutputFormat(ModeratorArgumentScorecardSchema) },
  });
  if (!msg.parsed_output) throw new Error("argument scorecard parse failed");
  return {
    percents: msg.parsed_output.percents as Record<AgentId, number>,
    reasoning: msg.parsed_output.reasoning,
    calibration: msg.parsed_output.calibration,
  };
}

async function moderatorInterlude(
  client: Anthropic,
  topic: Topic,
  round: number,
  thisRoundTurns: ArgumentTurn[],
  consensusReached: boolean,
): Promise<string> {
  const up = thisRoundTurns.filter((t) => t.prediction === "up").length;
  const down = thisRoundTurns.filter((t) => t.prediction === "down").length;
  const flat = thisRoundTurns.filter((t) => t.prediction === "flat").length;

  const msg = await client.messages.parse({
    model: "claude-opus-4-6",
    max_tokens: 600,
    system: MODERATOR_SYSTEM,
    messages: [
      {
        role: "user",
        content: [
          `Premise: ${topic.subject}`,
          `After round ${round}: up ${up} / down ${down} / flat ${flat}. Consensus: ${consensusReached ? "reached" : "not reached"}.`,
          "",
          consensusReached
            ? "Narrate the closing: what did the five voices agree on, and what does the agreement mean given the premise. 1-2 sentences, metaphor-dense, weave one reference."
            : "Narrate what just happened in this round and set up the next. 1-2 sentences, metaphor-dense, one reference naturally.",
        ].join("\n"),
      },
    ],
    output_config: { format: zodOutputFormat(ModeratorInterludeSchema) },
  });
  if (!msg.parsed_output) throw new Error(`moderator interlude parse failed r${round}`);
  return msg.parsed_output.narration;
}

function checkConsensus(turns: ArgumentTurn[]): {
  reached: boolean;
  direction: "up" | "down" | "flat" | null;
} {
  if (turns.length === 0) return { reached: false, direction: null };
  const set = new Set(turns.map((t) => t.prediction));
  if (set.size === 1) return { reached: true, direction: turns[0].prediction };
  return { reached: false, direction: null };
}

export async function runDebate(opts: {
  dayContext: string;
  maxArgumentRounds?: number;
  apiKey?: string;
}): Promise<Debate> {
  const client = mkClient(opts.apiKey);
  const maxRounds = opts.maxArgumentRounds ?? 3;

  // Phase 1 — PREMISE
  const { votes, topic, moderatorOpener } = await runPremise(client, opts.dayContext);

  const turns: DebateTurn[] = [];
  turns.push({
    speaker: "moderator",
    phase: "premise",
    round: 1,
    text: moderatorOpener,
  });
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

  // Premise scorecard — who shaped the agreed-on question
  const premiseScorecard = await moderatorPremiseScorecard(client, topic, votes);
  turns.push({
    speaker: "moderator",
    phase: "premise",
    round: 1,
    text: premiseScorecard.reasoning,
    scorecard: premiseScorecard,
  });

  // Phase 2 — ARGUMENT
  let consensusRound: number | null = null;
  let consensusDirection: "up" | "down" | "flat" | null = null;

  for (let round = 1; round <= maxRounds; round++) {
    const thisRound = await runArgumentRound(client, topic, turns, round);
    thisRound.forEach((t, i) => {
      turns.push({ speaker: AGENTS[i].id, phase: "argument", round, ...t });
    });
    const c = checkConsensus(thisRound);
    const interlude = await moderatorInterlude(client, topic, round, thisRound, c.reached);
    turns.push({ speaker: "moderator", phase: "argument", round, text: interlude });
    if (c.reached) {
      consensusRound = round;
      consensusDirection = c.direction;
      break;
    }
  }

  // Argument scorecard + calibration — the debate-wide influence accounting
  const allArgumentTurns = turns.filter(
    (t): t is Extract<DebateTurn, { phase: "argument" }> =>
      t.phase === "argument" && (t as any).speaker !== "moderator",
  ) as unknown as ArgumentTurn[];
  const argumentScorecard = await moderatorArgumentScorecard(
    client,
    topic,
    allArgumentTurns,
    consensusDirection,
  );
  const lastRound = consensusRound ?? maxRounds;
  turns.push({
    speaker: "moderator",
    phase: "argument",
    round: lastRound,
    text: argumentScorecard.reasoning,
    scorecard: argumentScorecard,
  });

  return {
    id: `dbt_${Date.now()}`,
    ts: new Date().toISOString(),
    day_context: opts.dayContext,
    topic,
    turns,
    consensus: {
      reached: consensusRound !== null,
      direction: consensusDirection,
      round: consensusRound,
    },
    max_argument_rounds: maxRounds,
  };
}
