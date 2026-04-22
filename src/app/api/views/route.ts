import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const NAMESPACE = "aureliex-prod";
const BASE = "https://abacus.jasoncameron.dev";

// Any normalised path slug is acceptable — namespace scoping confines
// abuse to our abacus key.
const SLUG_RE = /^[a-z0-9][a-z0-9-/]{0,63}$/;

// Curated list summed into the site-wide total. Anything outside this
// list still increments its own abacus key but doesn't contribute to
// the footer headline.
const TRACKED_SLUGS = [
  "home",
  "let-down",
  "arc",
  "positions",
  "argument",
  "market",
  "trades",
  "canvas",
  "archives",
  "green-credit",
  "pitch",
  "statement",
  "6969",
  "round-0",
  "paradigm",
  "math",
  "v1",
];

function normaliseSlug(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const s = raw.trim().toLowerCase().replace(/^\/+/, "").replace(/\/+$/, "");
  if (!s) return null;
  if (!SLUG_RE.test(s)) return null;
  return s.replace(/\/+/g, "-");
}

async function sha256Short(s: string): Promise<string> {
  const enc = new TextEncoder().encode(s);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .slice(0, 8)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hit(slug: string): Promise<number | null> {
  try {
    const r = await fetch(`${BASE}/hit/${NAMESPACE}/${encodeURIComponent(slug)}`, { cache: "no-store" });
    if (!r.ok) return null;
    const j = (await r.json()) as { value?: number };
    return typeof j.value === "number" ? j.value : null;
  } catch {
    return null;
  }
}

async function read(slug: string): Promise<number> {
  try {
    const r = await fetch(`${BASE}/get/${NAMESPACE}/${encodeURIComponent(slug)}`, { cache: "no-store" });
    if (!r.ok) return 0;
    const j = (await r.json()) as { value?: number };
    return typeof j.value === "number" ? j.value : 0;
  } catch {
    return 0;
  }
}

function extractIp(req: NextRequest): string {
  // accept forwarded headers in preference order; fall back to 'unknown'
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  const xr = req.headers.get("x-real-ip");
  if (xr) return xr.trim();
  return "unknown";
}

// Count one visit per (slug × IP × hour bucket). The dedup key includes
// floor(now / 1h) so the same IP hitting the same page never re-counts
// WITHIN an hour, but comes back to life on the next hour. prevents
// refresh spam while still growing visibly from normal traffic (open a
// new tab an hour later → +1). tradeoff: stale dedup keys accumulate
// on abacus with no GC; fine at this scale.  a proper Upstash Redis
// SET NX EX 3600 can replace this if UPSTASH_REDIS_REST_URL gets set.
const DEDUP_WINDOW_MS = 60 * 60 * 1000;

async function uniqueHit(slug: string, ip: string): Promise<number> {
  const ipHash = await sha256Short(`aureliex-salt-2026:${ip}`);
  const bucket = Math.floor(Date.now() / DEDUP_WINDOW_MS);
  const dedupKey = `u-${slug}-${ipHash}-${bucket}`;
  try {
    const r = await fetch(`${BASE}/hit/${NAMESPACE}/${encodeURIComponent(dedupKey)}`, { cache: "no-store" });
    if (!r.ok) return (await read(slug));
    const j = (await r.json()) as { value?: number };
    const dedupCount = typeof j.value === "number" ? j.value : 0;
    if (dedupCount === 1) {
      // first hit from this IP on this slug in the current hour bucket
      const n = await hit(slug);
      return n ?? 0;
    }
    return await read(slug);
  } catch {
    return await read(slug);
  }
}

export async function POST(req: NextRequest) {
  let body: { slug?: string } = {};
  try {
    body = await req.json();
  } catch {
    /* empty */
  }
  const slug = normaliseSlug(body.slug);
  if (!slug) {
    return NextResponse.json({ ok: false, error: "bad slug" }, { status: 400 });
  }
  const ip = extractIp(req);
  const count = await uniqueHit(slug, ip);
  return NextResponse.json({ ok: true, slug, count });
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const askedSlug = url.searchParams.get("slug");
  if (askedSlug) {
    const slug = normaliseSlug(askedSlug);
    if (!slug) {
      return NextResponse.json({ ok: false, error: "bad slug" }, { status: 400 });
    }
    const count = await read(slug);
    return NextResponse.json({ counts: { [slug]: count }, total: count });
  }
  const entries = await Promise.all(
    TRACKED_SLUGS.map(async (s) => [s, await read(s)] as const),
  );
  const counts: Record<string, number> = {};
  let total = 0;
  for (const [s, n] of entries) {
    counts[s] = n;
    total += n;
  }
  // raw total only — no estimate floor. numbers reflect actual
  // unique-IP-per-slug hits from the tracker. grows as people visit.
  return NextResponse.json({
    counts,
    total,
    rawTotal: total,
    tracked: TRACKED_SLUGS,
  });
}
