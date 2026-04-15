import { NextRequest, NextResponse } from "next/server";

// POST /api/polymarket/solve — validates the password server-side, hits the
// abacus counter, and returns wasFirst=true only when the returned count is 1.
// First-solver-experience is literally gated on "was your hit the one that
// moved the counter from 0 → 1."

export const runtime = "edge";
export const dynamic = "force-dynamic";

const NAMESPACE = "aureliex-prod";
const KEY = "polymarket-solved";
const BASE = "https://abacus.jasoncameron.dev";
const PASSWORD = "POLYMARKET";

export async function POST(req: NextRequest) {
  let body: { password?: string } = {};
  try {
    body = await req.json();
  } catch {}
  if (body.password !== PASSWORD) {
    return NextResponse.json({ ok: false, error: "wrong" }, { status: 400 });
  }
  try {
    const r = await fetch(`${BASE}/hit/${NAMESPACE}/${encodeURIComponent(KEY)}`, {
      cache: "no-store",
    });
    if (!r.ok) {
      return NextResponse.json({ ok: false, error: "upstream" }, { status: 502 });
    }
    const j = (await r.json()) as { value?: number };
    const count = typeof j.value === "number" ? j.value : 0;
    return NextResponse.json({ ok: true, solved: true, count, wasFirst: count === 1 });
  } catch {
    return NextResponse.json({ ok: false, error: "network" }, { status: 502 });
  }
}
