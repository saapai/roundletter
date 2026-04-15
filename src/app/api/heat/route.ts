import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const BASE = "https://abacus.jasoncameron.dev";
const NAMESPACE = "aureliex-heat-v1";
const SLOTS = 40;

function cleanPath(p: string): string {
  return String(p).replace(/[^a-z0-9\-_]/gi, "").slice(0, 80) || "root";
}

export async function POST(req: NextRequest) {
  let body: { path?: string; slots?: unknown } = {};
  try { body = await req.json(); } catch {}
  if (!body?.path) return NextResponse.json({ ok: false }, { status: 400 });
  const path = cleanPath(body.path);
  const slots: number[] = Array.isArray(body.slots)
    ? (body.slots as unknown[])
        .filter(n => typeof n === "number" && Number.isFinite(n as number) && (n as number) >= 0 && (n as number) < SLOTS)
        .map(n => Math.floor(n as number))
    : [];
  if (slots.length === 0) return NextResponse.json({ ok: true, count: 0 });
  await Promise.all(slots.slice(0, 40).map(s =>
    fetch(`${BASE}/hit/${NAMESPACE}/${path}-${s}`, { cache: "no-store" }).catch(() => null)
  ));
  return NextResponse.json({ ok: true, count: slots.length });
}

export async function GET(req: NextRequest) {
  const pathParam = new URL(req.url).searchParams.get("path") || "root";
  const path = cleanPath(pathParam);
  const reads = await Promise.all(
    Array.from({ length: SLOTS }, (_, i) =>
      fetch(`${BASE}/get/${NAMESPACE}/${path}-${i}`, { cache: "no-store" })
        .then(r => r.ok ? r.json() : { value: 0 })
        .then((j: any) => (typeof j?.value === "number" ? j.value : 0))
        .catch(() => 0)
    )
  );
  return NextResponse.json({ path, slots: reads, total: SLOTS });
}
