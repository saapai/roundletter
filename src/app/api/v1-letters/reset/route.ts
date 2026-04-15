import { NextRequest, NextResponse } from "next/server";
import { bumpRiddleRound } from "@/lib/riddle-round";

// POST /api/v1-letters/reset — bumps the riddle round counter, which moves
// every read/write to a fresh abacus namespace. Effectively zeroes all letter
// counters without touching other abacus counters (views, etc).
//
// Gated by RIDDLE_RESET_TOKEN env var. Accept token via either:
//   ?token=...                    (query param)
//   x-reset-token: ...            (header)
//   { "token": "..." }            (body)
//
// Usage:
//   curl -X POST "https://aureliex.com/api/v1-letters/reset?token=YOUR_TOKEN"

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const expected = process.env.RIDDLE_RESET_TOKEN;
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "RIDDLE_RESET_TOKEN not configured" },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(req.url);
  let token = searchParams.get("token") ?? req.headers.get("x-reset-token");
  if (!token) {
    try {
      const body = (await req.json()) as { token?: string };
      token = body.token ?? null;
    } catch {}
  }

  if (token !== expected) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const newRound = await bumpRiddleRound();
    return NextResponse.json({ ok: true, round: newRound });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "bump failed" }, { status: 502 });
  }
}
