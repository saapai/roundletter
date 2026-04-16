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

const ALL_SLUGS = Array.from(SLUGS);
const EVER_NS = "aureliex-riddle";
const EVER_KEY = "crowd-ever-10";

async function abacusGet(ns: string, key: string): Promise<number> {
  try {
    const r = await fetch(`${BASE}/get/${ns}/${encodeURIComponent(key)}`, { cache: "no-store" });
    if (!r.ok) return 0;
    const j = (await r.json()) as { value?: number; error?: string };
    if (j.error === "Key not found") return 0;
    return typeof j.value === "number" ? j.value : 0;
  } catch {
    return 0;
  }
}
async function abacusHit(ns: string, key: string): Promise<void> {
  try {
    await fetch(`${BASE}/hit/${ns}/${encodeURIComponent(key)}`, { cache: "no-store" });
  } catch {}
}

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

    // After the letter hit, check if all 10 letters in this round are now
    // solved. If so, hit the PERMANENT crowd-ever-10 flag (no round
    // scoping) so the trailer shows globally forever — even after round
    // resets, even in incognito, for every visitor on every device.
    const counts = await Promise.all(ALL_SLUGS.map((s) => abacusGet(ns, s)));
    const all10 = counts.every((c) => c > 0);
    if (all10) {
      await abacusHit(EVER_NS, EVER_KEY);
    }

    return NextResponse.json({
      ok: true,
      slug,
      round,
      count: typeof j.value === "number" ? j.value : 0,
      everAll10: all10,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "network" }, { status: 502 });
  }
}
