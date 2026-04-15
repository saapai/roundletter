import { NextResponse } from "next/server";
import { getRiddleRound } from "@/lib/riddle-round";

// GET global POLYMARKET-solved state. Uses the same round counter as the
// letter counters so resetting the riddle (/api/v1-letters/reset) also
// resets the homepage solve flag.

export const runtime = "edge";
export const dynamic = "force-dynamic";

const BASE = "https://abacus.jasoncameron.dev";
const KEY = "polymarket-solved";

function ns(round: number) {
  return `aureliex-riddle-r${round}`;
}

export async function GET() {
  try {
    const round = await getRiddleRound();
    const r = await fetch(`${BASE}/get/${ns(round)}/${encodeURIComponent(KEY)}`, { cache: "no-store" });
    if (!r.ok) return NextResponse.json({ solved: false, count: 0, round });
    const j = (await r.json()) as { value?: number; error?: string };
    if (j.error === "Key not found") return NextResponse.json({ solved: false, count: 0, round });
    const count = typeof j.value === "number" ? j.value : 0;
    return NextResponse.json({ solved: count > 0, count, round });
  } catch {
    return NextResponse.json({ solved: false, count: 0, round: 1 });
  }
}
