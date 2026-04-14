import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LOG_DIR = path.join(process.cwd(), "data");
const LOG_FILE = path.join(LOG_DIR, "views.json");

type ViewEntry = { ts: string; slug: string; ip: string | null; ua: string | null; referrer: string | null };
type ViewStore = { counts: Record<string, number>; events: ViewEntry[] };

function read(): ViewStore {
  try {
    if (!fs.existsSync(LOG_FILE)) return { counts: {}, events: [] };
    return JSON.parse(fs.readFileSync(LOG_FILE, "utf8"));
  } catch {
    return { counts: {}, events: [] };
  }
}

function write(store: ViewStore) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  fs.writeFileSync(LOG_FILE, JSON.stringify(store, null, 2));
}

export async function POST(req: NextRequest) {
  let body: { slug?: string; referrer?: string | null } = {};
  try { body = await req.json(); } catch {}
  const slug = typeof body.slug === "string" ? body.slug : null;
  if (!slug) return NextResponse.json({ ok: false, error: "slug required" }, { status: 400 });

  const entry: ViewEntry = {
    ts: new Date().toISOString(),
    slug,
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
    ua: req.headers.get("user-agent"),
    referrer: body.referrer ?? null,
  };

  try {
    const store = read();
    store.counts[slug] = (store.counts[slug] || 0) + 1;
    store.events.push(entry);
    write(store);
    return NextResponse.json({ ok: true, count: store.counts[slug] });
  } catch (e) {
    console.log("[views]", JSON.stringify(entry));
    return NextResponse.json({ ok: true, count: null, logged: "stderr" });
  }
}

export async function GET() {
  const store = read();
  return NextResponse.json(store);
}
