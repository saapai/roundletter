import { NextResponse } from "next/server";

// GET global state of POLYMARKET letter discovery. Returns the list of
// letter chars that have been solved by ANY visitor, in letter order
// (P, O, L, Y, M, A, R, K, E, T). Uses the abacus counter service.

export const runtime = "edge";
export const dynamic = "force-dynamic";

const NAMESPACE = "aureliex-prod";
const BASE = "https://abacus.jasoncameron.dev";

// Must stay aligned with V1_THEMES in src/lib/v1data.ts
const LETTERS: Array<{ slug: string; letter: string }> = [
  { slug: "polymath", letter: "P" },
  { slug: "opus", letter: "O" },
  { slug: "love", letter: "L" },
  { slug: "year", letter: "Y" },
  { slug: "method", letter: "M" },
  { slug: "attention", letter: "A" },
  { slug: "revolution", letter: "R" },
  { slug: "keys", letter: "K" },
  { slug: "empathy", letter: "E" },
  { slug: "toolmaking", letter: "T" },
];

async function read(slug: string): Promise<number> {
  try {
    const r = await fetch(
      `${BASE}/get/${NAMESPACE}/${encodeURIComponent(`v1-letter-${slug}`)}`,
      { cache: "no-store" },
    );
    if (!r.ok) return 0;
    const j = (await r.json()) as { value?: number };
    return typeof j.value === "number" ? j.value : 0;
  } catch {
    return 0;
  }
}

export async function GET() {
  const counts = await Promise.all(LETTERS.map((l) => read(l.slug)));
  const solved: Array<{ slug: string; letter: string; count: number }> = [];
  LETTERS.forEach((l, i) => {
    if (counts[i] > 0) solved.push({ slug: l.slug, letter: l.letter, count: counts[i] });
  });
  return NextResponse.json({ solved });
}
