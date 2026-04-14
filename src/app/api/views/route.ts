import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const NAMESPACE = "aureliex-prod";
const SLUGS = ["round-0", "paradigm", "math"];
const BASE = "https://abacus.jasoncameron.dev";

async function hit(slug: string): Promise<number | null> {
  try {
    const r = await fetch(`${BASE}/hit/${NAMESPACE}/${encodeURIComponent(slug)}`, { cache: "no-store" });
    if (!r.ok) return null;
    const j = (await r.json()) as { value?: number };
    return typeof j.value === "number" ? j.value : null;
  } catch { return null; }
}

async function read(slug: string): Promise<number> {
  try {
    const r = await fetch(`${BASE}/get/${NAMESPACE}/${encodeURIComponent(slug)}`, { cache: "no-store" });
    if (!r.ok) return 0;
    const j = (await r.json()) as { value?: number };
    return typeof j.value === "number" ? j.value : 0;
  } catch { return 0; }
}

export async function POST(req: NextRequest) {
  let body: { slug?: string } = {};
  try { body = await req.json(); } catch {}
  const slug = typeof body.slug === "string" && SLUGS.includes(body.slug) ? body.slug : null;
  if (!slug) return NextResponse.json({ ok: false, error: "unknown slug" }, { status: 400 });
  const count = await hit(slug);
  return NextResponse.json({ ok: true, slug, count });
}

export async function GET() {
  const entries = await Promise.all(SLUGS.map(async s => [s, await read(s)] as const));
  const counts: Record<string, number> = {};
  for (const [s, n] of entries) counts[s] = n;
  return NextResponse.json({ counts });
}
