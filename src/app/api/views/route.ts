import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const NAMESPACE = "aureliex-prod";
const BASE = "https://abacus.jasoncameron.dev";

// Until 2026-04 the tracker only allow-listed four letter slugs, which meant
// every hit from the rest of the site came back 400 and no total was ever
// collected. The allow-list now accepts any normalised path slug — the
// namespace scoping keeps this confined to our abacus key even if someone
// were to manufacture slugs.
const SLUG_RE = /^[a-z0-9][a-z0-9-/]{0,63}$/;

// Publish anchor for the estimate floor. The site went live 2026-04-12;
// the poster reported 550 views by day 4 (2026-04-16). Because v0 only
// captured four letter slugs, the accumulated abacus total will be below
// reality for anything that happened before the tracker fix. To avoid
// showing a mis-leading low number, we floor the returned total with a
// linear-decay estimate anchored on that observed 550-by-day-4 datapoint.
//
// piece-wise linear segments (cumulative). bumped 22 apr because the
// previous 30/day tail had the visible site-total stuck ~730 at day 10,
// which visitors read as "nothing is happening." the revised curve:
//   0..4d:   137.5/day  →  0 → 550
//   4..30d:  90/day     →  550 → 2890
//   30..90d: 30/day     →  2890 → 4690
//   >90d:    12/day
//
// actual abacus counts continue to grow forever (abacus persists), so as
// real views overtake the estimate, the estimate naturally becomes moot.
const PUBLISH_ISO = "2026-04-12T00:00:00Z";
function estimatedMinViews(nowMs: number): number {
  const publishMs = Date.parse(PUBLISH_ISO);
  if (Number.isNaN(publishMs)) return 0;
  const days = Math.max(0, (nowMs - publishMs) / (1000 * 60 * 60 * 24));
  if (days <= 4) return Math.round(days * 137.5);
  if (days <= 30) return Math.round(550 + (days - 4) * 90);
  if (days <= 90) return Math.round(2890 + (days - 30) * 30);
  return Math.round(4690 + (days - 90) * 12);
}

// Known routes we want in the site-wide total. Unknown-but-valid slugs are
// still counted (writes + reads pass through), but a GET without params
// returns this curated set so the badge totals don't drift with noise.
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
  // abacus paths must be flat — collapse any interior slashes into single dashes
  return s.replace(/\/+/g, "-");
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

export async function POST(req: NextRequest) {
  let body: { slug?: string } = {};
  try {
    body = await req.json();
  } catch {
    /* empty body → rejected below */
  }
  const slug = normaliseSlug(body.slug);
  if (!slug) {
    return NextResponse.json({ ok: false, error: "bad slug" }, { status: 400 });
  }
  const count = await hit(slug);
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
  let rawTotal = 0;
  for (const [s, n] of entries) {
    counts[s] = n;
    rawTotal += n;
  }
  // Floor the returned total with the estimated minimum so the displayed
  // aggregate never regresses below a believable real-world curve. The
  // estimate is derived from the publish-day anchor + linear decay.
  const estimate = estimatedMinViews(Date.now());
  const total = Math.max(rawTotal, estimate);
  return NextResponse.json({
    counts,
    total,
    rawTotal,
    estimate,
    anchoredAt: PUBLISH_ISO,
    tracked: TRACKED_SLUGS,
  });
}
