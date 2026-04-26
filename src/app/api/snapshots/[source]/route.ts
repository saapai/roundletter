import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";

// /api/snapshots/<source> — ingestion + read endpoint for live position
// snapshots from polytrader (or any other authorised pusher).
//
// POST  : write the latest snapshot for `source`. Bearer-auth via
//         SNAPSHOT_PUSH_TOKEN env var. Body is the full JSON dump.
//         Stores under `snapshot:<source>:latest` and a per-day key
//         `snapshot:<source>:<YYYY-MM-DD>` (90-day retention) so we
//         keep a coarse history for the ledger drawer without growing
//         unbounded.
// GET   : public read of the latest snapshot. No auth (the entire
//         portfolio is published in the open per project intent).
//
// Sources allowed: kalshi, polymarket. Anything else is rejected
// before touching KV so a typo in the cron URL doesn't pollute keys.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_SOURCES = ["kalshi", "polymarket"] as const;
type Source = (typeof VALID_SOURCES)[number];

function isValidSource(s: string): s is Source {
  return (VALID_SOURCES as readonly string[]).includes(s);
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { source: string } },
) {
  const { source } = params;
  if (!isValidSource(source)) {
    return NextResponse.json(
      { error: `invalid source '${source}'; expected one of ${VALID_SOURCES.join(", ")}` },
      { status: 400 },
    );
  }

  const auth = req.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  const expected = (process.env.SNAPSHOT_PUSH_TOKEN || "").trim();
  if (!expected) {
    return NextResponse.json(
      { error: "snapshot ingestion not configured (SNAPSHOT_PUSH_TOKEN unset)" },
      { status: 503 },
    );
  }
  if (!token || token !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "body must be a json object" }, { status: 400 });
  }

  const pushedAt = new Date().toISOString();
  const snapshot = { ...(body as Record<string, unknown>), pushed_at: pushedAt };

  try {
    await Promise.all([
      kv.set(`snapshot:${source}:latest`, snapshot),
      kv.set(`snapshot:${source}:${todayUtc()}`, snapshot, { ex: 60 * 60 * 24 * 90 }),
    ]);
  } catch (e) {
    return NextResponse.json(
      { error: "kv write failed", detail: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, source, pushed_at: pushedAt });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { source: string } },
) {
  const { source } = params;
  if (!isValidSource(source)) {
    return NextResponse.json({ error: "invalid source" }, { status: 400 });
  }
  try {
    const data = await kv.get(`snapshot:${source}:latest`);
    return NextResponse.json({ source, snapshot: data ?? null });
  } catch (e) {
    return NextResponse.json(
      { error: "kv read failed", detail: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
