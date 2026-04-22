import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// /api/agents/favorite-number
//
// Hourly AI argument: the panel debates which number this document is
// about, re-scores the eight candidates, and returns fresh probabilities.
// Called every hour by Vercel Cron. Edge-cached 45 min so regular
// visitors aren't regenerating on every load.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Candidate = {
  n: string;
  label: string;
  pct: number;
  reason: string;
};
type Out = {
  source: "claude" | "stub";
  generated_at: string;
  last_argued_at: string;
  candidates: Candidate[];
  moderator: string;
};

const BASE_CANDIDATES: Candidate[] = [
  { n: "69",      label: "sixty-nine",                  pct: 34, reason: "the credits page is /6969. the hunt ledger is /6969#hunt. 'channel 69' is already the egg that fires when the tv knobs land. the document points here six times before it points anywhere else." },
  { n: "420",     label: "four-twenty",                 pct: 19, reason: "the counter-culture route. a sunflower sunset variant of the cmiygl homage. a number the audience already reads as belonging to them before the site gets a word in." },
  { n: "21",      label: "twenty-one",                  pct: 14, reason: "the birthday. 21 june. the day the book closes and the ceremony runs. if the document is built around one date, it is this one." },
  { n: "10",      label: "ten",                         pct: 11, reason: "the sidecars (10% art, 10% prediction). the holdings count. the S&P does 10x in 25 years — the gap we're trying to close in two months." },
  { n: "1997",    label: "nineteen ninety-seven",       pct: 8,  reason: "radiohead · let down · ok computer. the pre-mortem. the frame the whole site is a derivative of." },
  { n: "2018",    label: "twenty-eighteen",             pct: 7,  reason: "kanye · ghost town · ye. 21 savage · a lot. two of the three launch-trailer songs come from this year; the bottom bookend is here." },
  { n: "27.1",    label: "twenty-seven-point-one",      pct: 4,  reason: "the multiplier on the chapter 02 vital: $3,453.83 × 27.1 = $100,000. a number that exists only because the goal does." },
  { n: "3453.83", label: "thirty-four fifty-three",     pct: 3,  reason: "the baseline. the day the round got sealed. the number everything on the positions page is measured against." },
];

function stub(): Out {
  return {
    source: "stub",
    generated_at: new Date().toISOString(),
    last_argued_at: new Date().toISOString(),
    moderator: "the panel stub — live refresh drops in when ANTHROPIC_API_KEY lands on the deploy.",
    candidates: BASE_CANDIDATES,
  };
}

async function live(): Promise<Out | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  const client = new Anthropic({ apiKey: key });

  const hour = new Date().toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    hour: "numeric",
    hour12: true,
  });

  const systemPrompt = `You are the panel of aureliex — five agents + a moderator — arguing about which single number this document is about, in the sense of Wesley Wang's film "Nothing, Except Everything."

You do NOT invent new numbers. You re-score the same eight candidates each run. Move each candidate's probability a few points up or down based on (a) what happened on the site in the last hour, (b) the vibe of the current hour of day (${hour} Pacific), (c) which lens in the panel (Bull, Bear, Macro, Flow, Historian) is loudest right now. Probabilities must sum to 100. Keep movements modest — 1-5 points per candidate — so the ranking moves but doesn't flip wildly.

Return JSON only:
{
  "moderator": "1-2 sentence meta commentary on the current argument",
  "candidates": [
    { "n": "69",      "pct": <int>, "reason": "<<=140 chars, can lightly update>" },
    { "n": "420",     "pct": <int>, "reason": "..." },
    { "n": "21",      "pct": <int>, "reason": "..." },
    { "n": "10",      "pct": <int>, "reason": "..." },
    { "n": "1997",    "pct": <int>, "reason": "..." },
    { "n": "2018",    "pct": <int>, "reason": "..." },
    { "n": "27.1",    "pct": <int>, "reason": "..." },
    { "n": "3453.83", "pct": <int>, "reason": "..." }
  ]
}`;

  const userPrompt = `Current candidates (from last hour):
${BASE_CANDIDATES.map((c) => `  ${c.n} · ${c.pct}% · "${c.reason}"`).join("\n")}

Re-score. Keep 69 as the leader unless you have a real reason. Return JSON only.`;

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
      moderator?: string;
      candidates?: Array<{ n: string; pct: number; reason?: string }>;
    };
    if (!parsed.candidates || !Array.isArray(parsed.candidates)) return null;
    const byN = new Map(parsed.candidates.map((c) => [c.n, c]));
    const merged: Candidate[] = BASE_CANDIDATES.map((base) => {
      const fresh = byN.get(base.n);
      if (!fresh) return base;
      return {
        ...base,
        pct: typeof fresh.pct === "number" ? Math.max(0, Math.min(100, Math.round(fresh.pct))) : base.pct,
        reason: typeof fresh.reason === "string" && fresh.reason.length > 0 ? fresh.reason : base.reason,
      };
    });
    // Sort by pct desc so the leader is always first.
    merged.sort((a, b) => b.pct - a.pct);
    return {
      source: "claude",
      generated_at: new Date().toISOString(),
      last_argued_at: new Date().toISOString(),
      moderator: parsed.moderator ?? "",
      candidates: merged,
    };
  } catch {
    return null;
  }
}

export async function GET(_req: NextRequest) {
  const out = (await live()) ?? stub();
  return NextResponse.json(out, {
    headers: {
      // 45-minute edge cache so the hourly cron tick lands in a fresh one
      "Cache-Control":
        "s-maxage=2700, stale-while-revalidate=7200, max-age=60",
    },
  });
}
