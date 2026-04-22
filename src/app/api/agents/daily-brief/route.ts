import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import portfolio from "@/data/portfolio.json";

// Daily agent brief endpoint.
//
// Called twice per trading day by Vercel Cron (see vercel.json) — once
// just before market open (13:30 UTC / 9:30 ET) and once just after
// market close (20:00 UTC / 4:00 ET), Mon-Fri. Each call asks each of
// the five agents for a one-paragraph read of the current book.
//
// We intentionally do not persist anything server-side — the endpoint is
// pure and deterministic over (date, bell, current portfolio). Response
// is cached at the edge for 30 minutes via `s-maxage` so normal visitors
// don't burn through tokens; cron calls force-refresh through the query
// string to guarantee a new brief on each trading bell.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type BriefAgent = {
  agent: "bull" | "bear" | "macro" | "flow" | "historian";
  mandate: string;
  line: string;
};
type BriefOut = {
  source: "claude" | "stub";
  generated_at: string;
  bell: "open" | "close" | "adhoc";
  model: string;
  portfolio_snapshot: {
    baseline: number;
    current_or_baseline: number;
    goal: number;
    days_to_goal: number | null;
    holdings: Array<{ ticker: string; shares: number; entry_value: number }>;
  };
  consensus: string;
  agents: BriefAgent[];
};

const AGENT_CARDS: Array<{
  id: BriefAgent["agent"];
  name: string;
  mandate: string;
}> = [
  { id: "bull",      name: "the Bull",   mandate: "steelman the 10-year thesis; live with the drawdowns; own the pureplays." },
  { id: "bear",      name: "the Bear",   mandate: "survive drawdowns; favor trillion-dollar balance sheets + dry powder; name the dilution." },
  { id: "macro",     name: "Macro",      mandate: "position for the backdrop not the theme; power, liquidity, rates; find the binding constraint." },
  { id: "flow",      name: "Flow",       mandate: "read the tape before the thesis; avoid retail-crowded names with active ATMs." },
  { id: "historian", name: "Historian",  mandate: "look at the prior cycle first; cite precedent; speak to survivorship." },
];

function daysUntil(iso: string): number | null {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return null;
  return Math.ceil((ms - Date.now()) / (1000 * 60 * 60 * 24));
}

function stubBrief(bell: "open" | "close" | "adhoc"): BriefOut {
  const lines: Record<BriefAgent["agent"], string> = {
    bull: "upside intact · conviction on QTUM / IONQ / NVDA holds; drawdown tolerated because the 21 june goal is priced to a 28× sprint. reread the thesis, not the tape.",
    bear: "survive the tape; SGOV dry-powder on reserve; if IONQ ships an ATM, size it out; balance-sheet names (MSFT / GOOG / IBM) are still the only place to be defensive.",
    macro: "power-for-compute (CEG) binds here — if the grid story slips, the whole bigtech quantum book compresses. watch rates and ai-data-center supply; the backdrop is the trade.",
    flow: "retail crowded but not-yet-extended in QTUM; RGTI / QBTS looked bid into last close, gamma positioned for continuation. don't catch falls; let the tape tell you.",
    historian: "every prior quantum cycle died on hype fatigue before fundamentals; this one has survived the first panic. precedent says the second drawdown is bigger but faster — position accordingly.",
  };
  return {
    source: "stub",
    generated_at: new Date().toISOString(),
    bell,
    model: "stub",
    portfolio_snapshot: snapshot(),
    consensus:
      "cautious long — keep the pureplays, size the dry powder, trust the tape. brief regenerates live when the agent endpoint is configured with an Anthropic API key.",
    agents: AGENT_CARDS.map((a) => ({ agent: a.id, mandate: a.mandate, line: lines[a.id] })),
  };
}

function snapshot(): BriefOut["portfolio_snapshot"] {
  const baseline = portfolio.account_value_at_entry ?? 3453.83;
  return {
    baseline,
    current_or_baseline: baseline,
    goal: 100000,
    days_to_goal: daysUntil("2026-06-21T23:59:59-07:00"),
    holdings: portfolio.holdings.map((h) => ({
      ticker: h.ticker,
      shares: h.shares,
      entry_value: h.entry_value,
    })),
  };
}

async function liveBrief(bell: "open" | "close" | "adhoc"): Promise<BriefOut | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;

  const client = new Anthropic({ apiKey: key });
  const snap = snapshot();
  const bellLabel =
    bell === "open" ? "US market open (9:30 ET)" :
    bell === "close" ? "US market close (4:00 ET)" :
    "ad-hoc read";

  const systemPrompt = `You write the daily brief for aureliex — a public round-letter portfolio (baseline $${snap.baseline.toFixed(2)}, goal $100,000 by 21 june 2026). Five agents speak: Bull, Bear, Macro, Flow, Historian. Each agent has a distinct mandate. Output JSON only.

Register: literary, confident, lowercase, no emojis, no em-dashes-as-pauses. One short paragraph per agent — 2-3 sentences, 40-70 words. Each paragraph must cite at least one ticker or concrete variable (price, percentage, rate, event). After the agents, write a one-sentence consensus line in saapai's voice ("${"cautious long"} — …" or "${"flat"} — …" or similar).`;

  const userPrompt = `
Bell: ${bellLabel}
Date: ${new Date().toISOString()}
Holdings (ticker · shares · entry value):
${snap.holdings.map((h) => `  ${h.ticker} · ${h.shares} · $${h.entry_value.toFixed(2)}`).join("\n")}

Return JSON shaped exactly:
{
  "consensus": "…",
  "agents": [
    { "agent": "bull",      "line": "…" },
    { "agent": "bear",      "line": "…" },
    { "agent": "macro",     "line": "…" },
    { "agent": "flow",      "line": "…" },
    { "agent": "historian", "line": "…" }
  ]
}
`;

  try {
    const res = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1200,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });
    const block = res.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") return null;
    const match = block.text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]) as {
      consensus?: string;
      agents?: Array<{ agent: BriefAgent["agent"]; line: string }>;
    };
    if (!parsed.agents || !Array.isArray(parsed.agents)) return null;
    const byId = new Map(parsed.agents.map((a) => [a.agent, a.line]));
    return {
      source: "claude",
      generated_at: new Date().toISOString(),
      bell,
      model: "claude-haiku-4-5",
      portfolio_snapshot: snap,
      consensus: parsed.consensus ?? "",
      agents: AGENT_CARDS.map((a) => ({
        agent: a.id,
        mandate: a.mandate,
        line: byId.get(a.id) ?? "",
      })),
    };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const bellParam = url.searchParams.get("bell");
  const bell: "open" | "close" | "adhoc" =
    bellParam === "open" || bellParam === "close" ? bellParam : "adhoc";

  // Vercel cron hits with an auth header of its own — we don't gate the
  // endpoint behind it because humans on /argument also load the brief.
  const live = await liveBrief(bell);
  const brief = live ?? stubBrief(bell);

  return NextResponse.json(brief, {
    headers: {
      "Cache-Control":
        // 30-minute edge cache, 60-second browser cache. cron's query
        // string (source=cron) keeps distinct cache entries per bell.
        "s-maxage=1800, stale-while-revalidate=3600, max-age=60",
    },
  });
}
