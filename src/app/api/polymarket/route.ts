import { NextResponse } from "next/server";

// GET global POLYMARKET-solved state.
// Uses the same abacus counter service as /api/views.

export const runtime = "edge";
export const dynamic = "force-dynamic";

const NAMESPACE = "aureliex-prod";
const KEY = "polymarket-solved";
const BASE = "https://abacus.jasoncameron.dev";

export async function GET() {
  try {
    const r = await fetch(`${BASE}/get/${NAMESPACE}/${encodeURIComponent(KEY)}`, {
      cache: "no-store",
    });
    if (!r.ok) return NextResponse.json({ solved: false, count: 0 });
    const j = (await r.json()) as { value?: number };
    const count = typeof j.value === "number" ? j.value : 0;
    return NextResponse.json({ solved: count > 0, count });
  } catch {
    return NextResponse.json({ solved: false, count: 0 });
  }
}
