import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import seed from "@/data/bet-lines.json";

// /api/bets/lines
//
// GET — returns the current set of open-bets panel probabilities. When
// ANTHROPIC_API_KEY is set, the endpoint asks Claude to cross-reference
// live kalshi / polymarket / sharp-book prices (via Anthropic's web
// search tool) and return refreshed numbers. When no key is configured
// the committed stub in src/data/bet-lines.json is returned verbatim.
//
// Edge-cached for 6h (s-maxage=21600) so visitors don't burn tokens.
// The vercel.json cron calls GET with ?source=cron to warm the cache
// at market open + close.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Bet = {
  id: string;
  label: string;
  yesPct: number;
  noPct: number | null;
  note?: string;
};
type Meta = {
  last_reviewed: string;
  reviewed_by: string;
  next_auto_refresh: string;
  note: string;
};
type LinesOut = {
  source: "claude" | "stub";
  generated_at: string;
  _meta: Meta;
  bets: Bet[];
};

function stub(): LinesOut {
  const data = seed as unknown as { _meta: Meta; bets: Bet[] };
  return {
    source: "stub",
    generated_at: new Date().toISOString(),
    _meta: data._meta,
    bets: data.bets,
  };
}

async function liveRefresh(): Promise<LinesOut | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;

  const data = seed as unknown as { _meta: Meta; bets: Bet[] };
  const client = new Anthropic({ apiKey: key });

  const linesToPrice = data.bets
    .map((b) => `- ${b.id} · ${b.label}`)
    .join("\n");

  const systemPrompt = `You review open-bets panel probabilities for a public-facing prediction-market page. You check against current live Kalshi, Polymarket, FanDuel, DraftKings, ESPN BET, and Covers prices, and return the panel's implied percentage per bet.

Skew rules (disclose in the notes if you apply them):
· auction-attendance + auction-gross (anything the public can influence) skew YES DOWN ~5-15pp under sharp — the public's incentive to drive the outcome is the mechanic.
· lakers-ladder (LA-biased audience) skew YES UP ~2-4pp over sharp — the fan premium absorbs LA bias without being arb-able.
· everything else (portfolio milestones, earnings beats, cavs chip, finals-7) sits at the sharp consensus.

Return JSON only, matching the input list's ids exactly. Whole-percentage integers only.`;

  const userPrompt = `Review these bets:

${linesToPrice}

Return:
{
  "bets": [
    { "id": "portfolio-100k", "yesPct": 3, "noPct": null, "note": "..." },
    { "id": "nba-lakers-round-one", "yesPct": 85, "noPct": 15, "note": "..." }
  ]
}

Include a note only when the line moved materially (>5pp) from the prior review or when the skew mechanic should be disclosed.`;

  try {
    const res = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });
    const block = res.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") return null;
    const match = block.text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]) as { bets?: Array<Partial<Bet>> };
    if (!parsed.bets || !Array.isArray(parsed.bets)) return null;

    const byId = new Map(
      parsed.bets.filter((b) => typeof b.id === "string").map((b) => [b.id as string, b]),
    );
    const merged: Bet[] = data.bets.map((b) => {
      const fresh = byId.get(b.id);
      if (!fresh) return b;
      return {
        ...b,
        yesPct: typeof fresh.yesPct === "number" ? fresh.yesPct : b.yesPct,
        noPct:
          fresh.noPct === null || typeof fresh.noPct === "number"
            ? (fresh.noPct ?? b.noPct)
            : b.noPct,
        note: typeof fresh.note === "string" ? fresh.note : b.note,
      };
    });

    return {
      source: "claude",
      generated_at: new Date().toISOString(),
      _meta: {
        ...data._meta,
        last_reviewed: new Date().toISOString().slice(0, 10),
        reviewed_by: "claude-haiku-4-5 · daily refresh · cross-ref kalshi / polymarket / sharp books",
      },
      bets: merged,
    };
  } catch {
    return null;
  }
}

export async function GET(_req: NextRequest) {
  const live = await liveRefresh();
  const payload = live ?? stub();
  return NextResponse.json(payload, {
    headers: {
      "Cache-Control":
        // 6h edge cache · 30s browser · stale-while-revalidate 12h
        "s-maxage=21600, stale-while-revalidate=43200, max-age=30",
    },
  });
}
