import { NextRequest, NextResponse } from "next/server";

// POST /api/v1-letters/solve — body: { slug: "polymath" | ... }
// Increments the global counter for that letter. Validates the slug
// against the known list so we don't accept arbitrary writes.

export const runtime = "edge";
export const dynamic = "force-dynamic";

const NAMESPACE = "aureliex-prod";
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
    const r = await fetch(
      `${BASE}/hit/${NAMESPACE}/${encodeURIComponent(`v1-letter-${slug}`)}`,
      { cache: "no-store" },
    );
    if (!r.ok) {
      return NextResponse.json({ ok: false, error: "upstream" }, { status: 502 });
    }
    const j = (await r.json()) as { value?: number };
    return NextResponse.json({ ok: true, slug, count: typeof j.value === "number" ? j.value : 0 });
  } catch {
    return NextResponse.json({ ok: false, error: "network" }, { status: 502 });
  }
}
