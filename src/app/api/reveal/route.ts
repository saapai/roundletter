import { NextResponse } from "next/server";
import predictions from "@/data/sealed-predictions.json";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// This route controls the sealed-prediction reveal. Before the horizon closes
// it returns { status: "sealed", seconds_until_reveal }. After horizon close
// it reads SEALED_PREDICTION_PLAINTEXT_RAW from env, verifies the SHA-256
// matches the committed seal, and returns the plaintext + computed result.
//
// Env var shape (set in Vercel dashboard, NOT in the repo):
//   SEALED_PREDICTION_PLAINTEXT_RAW = <exact bytes that were hashed>
// The raw string can be anything (JSON, plain text, whatever was committed)
// as long as sha256(raw) === predictions[0].sha256. If the plaintext is JSON
// and contains a `threshold` number, this route will compute the hit/miss
// by comparing current view total (delta from baseline) against it.

async function sha256Hex(s: string): Promise<string> {
  const buf = new TextEncoder().encode(s);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const VIEWS_NAMESPACE = "aureliex-prod";
const VIEWS_SLUGS = ["round-0", "paradigm", "math", "v1"];
const VIEWS_BASE = "https://abacus.jasoncameron.dev";

async function currentTotal(): Promise<number> {
  const results = await Promise.all(
    VIEWS_SLUGS.map(async (s) => {
      try {
        const r = await fetch(
          `${VIEWS_BASE}/get/${VIEWS_NAMESPACE}/${encodeURIComponent(s)}`,
          { cache: "no-store" },
        );
        if (!r.ok) return 0;
        const j = (await r.json()) as { value?: number };
        return typeof j.value === "number" ? j.value : 0;
      } catch {
        return 0;
      }
    }),
  );
  return results.reduce((a, b) => a + b, 0);
}

export async function GET() {
  const p = predictions.predictions[0];
  if (!p) {
    return NextResponse.json({ status: "error", error: "no prediction" }, { status: 500 });
  }

  // Honest-failure path: if the prediction is marked forfeited in the data file,
  // we never attempt a reveal — the plaintext can't be verified and pretending
  // to reveal would undermine the whole commitment mechanism.
  if (p.status === "forfeited") {
    return NextResponse.json({
      status: "forfeited",
      sha256: p.sha256,
      forfeit: (p as { forfeit?: unknown }).forfeit ?? null,
      horizon_end: p.horizon.end,
    });
  }

  const now = Date.now();
  const revealTs = Date.parse(p.horizon.end);

  if (now < revealTs) {
    return NextResponse.json({
      status: "sealed",
      seconds_until_reveal: Math.max(0, Math.floor((revealTs - now) / 1000)),
      sha256: p.sha256,
      horizon_end: p.horizon.end,
    });
  }

  const raw = process.env.SEALED_PREDICTION_PLAINTEXT_RAW;
  if (!raw) {
    return NextResponse.json({
      status: "reveal_pending",
      reason: "plaintext env var not configured yet",
      sha256: p.sha256,
    });
  }

  const computed = await sha256Hex(raw);
  if (computed !== p.sha256) {
    return NextResponse.json({
      status: "reveal_pending",
      reason: "plaintext does not match the sealed hash",
      expected_sha256: p.sha256,
      computed_sha256: computed,
    });
  }

  let plaintext: unknown = null;
  try {
    plaintext = JSON.parse(raw);
  } catch {
    plaintext = null;
  }
  const threshold =
    plaintext && typeof plaintext === "object" && plaintext !== null &&
    "threshold" in plaintext && typeof (plaintext as { threshold?: unknown }).threshold === "number"
      ? (plaintext as { threshold: number }).threshold
      : null;

  const total = await currentTotal();
  const baseline = p.baseline.cumulative_reads;
  const delta = total - baseline;
  const hit = threshold != null ? delta >= threshold : null;

  return NextResponse.json({
    status: "revealed",
    sha256: p.sha256,
    plaintext_raw: raw,
    plaintext_parsed: plaintext,
    threshold,
    baseline,
    current_total: total,
    delta_from_baseline: delta,
    hit,
    revealed_at: new Date().toISOString(),
  });
}
