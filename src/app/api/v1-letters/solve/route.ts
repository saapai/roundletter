import { NextRequest, NextResponse } from "next/server";
import { getRiddleRound, letterNamespace } from "@/lib/riddle-round";

// POST /api/v1-letters/solve — body: { slug: "polymath" | ... }
// Increments the current-round letter counter in abacus.

export const runtime = "edge";
export const dynamic = "force-dynamic";

const BASE = "https://abacus.jasoncameron.dev";

const SLUGS = new Set([
  "polymath", "opus", "love", "year", "method",
  "attention", "revolution", "keys", "empathy", "toolmaking",
]);

export async function POST(req: NextRequest) {
  let body: { slug?: string } = {};
  try {
    body = await req.json();
  } catch {}
  const slug = typeof body.slug === "string" ? body.slug : null;
  if (!slug || !SLUGS.has(slug)) {
    return NextResponse.json({ ok: false, error: "unknown slug" }, { status: 400 });
  }
  try {
    const round = await getRiddleRound();
    const ns = letterNamespace(round);
    const r = await fetch(`${BASE}/hit/${ns}/${encodeURIComponent(slug)}`, { cache: "no-store" });
    if (!r.ok) {
      return NextResponse.json({ ok: false, error: "upstream" }, { status: 502 });
    }
    const j = (await r.json()) as { value?: number };
    return NextResponse.json({
      ok: true,
      slug,
      round,
      count: typeof j.value === "number" ? j.value : 0,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "network" }, { status: 502 });
  }
}
