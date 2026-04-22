import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import portfolio from "@/data/portfolio.json";

// /api/agents/stock-debate
//
// Generates a day's stock debate — the five-agent panel (Bull, Bear,
// Macro, Flow, Historian) + the moderator — with the current portfolio
// snapshot as the topic. Called by Vercel Cron at market close so a
// fresh debate lands each trading day.
//
// Output shape mirrors entries in src/data/debates.json so the
// /argument page + the Today's Brief card can consume it identically.
// Edge-cached 4h; cron warms the cache.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Turn = {
  speaker: "moderator" | "bull" | "bear" | "macro" | "flow" | "historian";
  phase: "premise" | "argument";
  round: number;
  text?: string;
  claim?: string;
  warrant?: string;
  prediction?: "up" | "down" | "flat";
  confidence?: number;
};
type DebateOut = {
  id: string;
  ts: string;
  source: "claude" | "stub";
  day_context: string;
  topic: { kind: string; subject: string; framing: string };
  turns: Turn[];
  consensus: { reached: boolean; direction: "up" | "down" | "flat" | null; round: number | null };
  max_argument_rounds: number;
};

function fmt$(n: number): string {
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function baselineSnapshot() {
  const baseline = portfolio.account_value_at_entry ?? 3453.83;
  const cash = portfolio.pending_cash ?? 0;
  return {
    baseline,
    pendingCash: cash,
    holdings: portfolio.holdings.map((h) => ({
      ticker: h.ticker,
      shares: h.shares,
      entry: h.entry_value,
    })),
  };
}

function stub(bell: "open" | "close" | "adhoc"): DebateOut {
  const today = new Date().toISOString().slice(0, 10);
  const snap = baselineSnapshot();
  return {
    id: `dbt_stub_${today.replace(/-/g, "")}_${bell}`,
    ts: new Date().toISOString(),
    source: "stub",
    day_context: `stub brief · baseline ${fmt$(snap.baseline)} · cash ${fmt$(snap.pendingCash)} · 10-position book. live refresh lands when ANTHROPIC_API_KEY is configured on the deploy.`,
    topic: {
      kind: "position",
      subject: "decompose today's move — thesis, tape, or luck?",
      framing: "the panel is designed for exactly this. separate what's explainable by thesis, what by positioning, what by noise.",
    },
    turns: [
      { speaker: "moderator", phase: "premise", round: 1, text: "live brief deferred to the next trading bell — ANTHROPIC_API_KEY missing on the edge." },
      { speaker: "bull", phase: "argument", round: 1, claim: "hold the pureplays; survive drawdowns on thesis conviction.", warrant: "10-year case intact; IONQ + QBTS + RGTI remain the asymmetric book.", prediction: "flat", confidence: 0.6 },
      { speaker: "bear", phase: "argument", round: 1, claim: "size SGOV reserve; name the shelf on any ATM print.", warrant: "trillion-dollar balance sheets + dry powder survive regime breaks.", prediction: "flat", confidence: 0.62 },
      { speaker: "macro", phase: "argument", round: 1, claim: "power-for-compute (CEG) is the binding constraint; watch rates.", warrant: "ai-data-center supply + liquidity dominate theme-specific news.", prediction: "flat", confidence: 0.6 },
      { speaker: "flow", phase: "argument", round: 1, claim: "retail-crowded but not yet extended; tape > thesis this week.", warrant: "no extreme positioning read; let the print decide the next leg.", prediction: "flat", confidence: 0.58 },
      { speaker: "historian", phase: "argument", round: 1, claim: "prior quantum cycles died on fatigue before fundamentals; this one's alive.", warrant: "second drawdown is bigger but faster — position accordingly.", prediction: "flat", confidence: 0.65 },
    ],
    consensus: { reached: true, direction: "flat", round: 1 },
    max_argument_rounds: 3,
  };
}

async function liveDebate(bell: "open" | "close" | "adhoc"): Promise<DebateOut | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;

  const client = new Anthropic({ apiKey: key });
  const snap = baselineSnapshot();
  const today = new Date().toISOString().slice(0, 10);

  const systemPrompt = `You generate the daily stock-debate JSON for aureliex. Five agents + one moderator debate the current state of the 10-position book. Output JSON only — no prose wrapper. Register: literary, confident, lowercase, no emojis, no em-dashes as pauses. Each claim cites at least one concrete variable (ticker, price, rate, event). Each warrant is 1-2 sentences. Moderator speaks in paragraphs that frame the debate.

Agents:
· bull — steelman 10-year thesis, live with drawdowns, own pureplays.
· bear — survive drawdowns, favor balance sheets + dry powder, name the shelf + dilution.
· macro — position for backdrop not theme (power, liquidity, rates).
· flow — read the tape before the thesis; avoid crowded ATMs.
· historian — look at prior cycles, cite precedent, speak to survivorship.`;

  const userPrompt = `Date: ${today}
Bell: ${bell === "open" ? "market open (9:30 ET)" : bell === "close" ? "market close (4:00 ET)" : "ad-hoc"}
Baseline: ${fmt$(snap.baseline)} · Pending cash: ${fmt$(snap.pendingCash)}
Holdings (ticker · shares · entry value):
${snap.holdings.map((h) => `  ${h.ticker} · ${h.shares} · ${fmt$(h.entry)}`).join("\n")}

Return JSON exactly shaped:
{
  "day_context": "one line summary of the day",
  "topic": { "kind": "position|macro|method", "subject": "the question the panel is arguing", "framing": "paragraph-long moderator intro" },
  "turns": [
    { "speaker": "moderator", "phase": "premise", "round": 1, "text": "..." },
    { "speaker": "bull", "phase": "premise", "round": 1, "topic_kind": "position", "subject": "...", "why_it_matters": "..." },
    ...all 5 agents premise round 1...,
    { "speaker": "moderator", "phase": "argument", "round": 1, "text": "..." },
    ...all 5 agents argument round 1 with claim/warrant/prediction/confidence...,
    { "speaker": "moderator", "phase": "argument", "round": 2, "text": "..." },
    ...round 2 agents...
  ],
  "consensus": { "reached": true, "direction": "up|down|flat", "round": 2 }
}
`;

  try {
    const res = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });
    const block = res.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") return null;
    const match = block.text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]) as Partial<DebateOut>;
    return {
      id: `dbt_live_${today.replace(/-/g, "")}_${bell}`,
      ts: new Date().toISOString(),
      source: "claude",
      day_context: parsed.day_context ?? "",
      topic: parsed.topic ?? { kind: "position", subject: "", framing: "" },
      turns: Array.isArray(parsed.turns) ? (parsed.turns as Turn[]) : [],
      consensus: parsed.consensus ?? { reached: false, direction: null, round: null },
      max_argument_rounds: 3,
    };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const bell =
    (new URL(req.url).searchParams.get("bell") as "open" | "close" | "adhoc" | null) ?? "adhoc";
  const live = await liveDebate(bell);
  const out = live ?? stub(bell);
  return NextResponse.json(out, {
    headers: {
      "Cache-Control":
        // 4h edge cache; cron query string keeps bell-specific entries
        "s-maxage=14400, stale-while-revalidate=28800, max-age=60",
    },
  });
}
