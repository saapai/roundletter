import { NextRequest, NextResponse } from "next/server";
import { getRiddleRound } from "@/lib/riddle-round";

// POST /api/polymarket/solve — validates the password server-side,
// increments the round-scoped abacus counter, returns wasFirst=(count===1).

export const runtime = "edge";
export const dynamic = "force-dynamic";

const BASE = "https://abacus.jasoncameron.dev";
const KEY = "polymarket-solved";
const PASSWORD = "POLYMARKET";

function ns(round: number) {
  return `aureliex-riddle-r${round}`;
}

export async function POST(req: NextRequest) {
  let body: { password?: string } = {};
  try {
    body = await req.json();
  } catch {}
  if ((body.password ?? "").toUpperCase() !== PASSWORD) {
    return NextResponse.json({ ok: false, error: "wrong" }, { status: 400 });
  }
  try {
    const round = await getRiddleRound();
    const r = await fetch(`${BASE}/hit/${ns(round)}/${encodeURIComponent(KEY)}`, { cache: "no-store" });
    if (!r.ok) {
      return NextResponse.json({ ok: false, error: "upstream" }, { status: 502 });
    }
    const j = (await r.json()) as { value?: number };
    const count = typeof j.value === "number" ? j.value : 0;
    return NextResponse.json({
      ok: true,
      solved: true,
      count,
      round,
      wasFirst: count === 1,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "network" }, { status: 502 });
  }
}
