import { NextResponse } from "next/server";
import { getRiddleRound, letterNamespace } from "@/lib/riddle-round";

// GET global state of POLYMARKET letter discovery. Returns the list of
// letter chars solved by ANY visitor in the CURRENT round. Round is stored
// in its own abacus counter; resetting = bumping the round.

export const runtime = "edge";
export const dynamic = "force-dynamic";

const BASE = "https://abacus.jasoncameron.dev";

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

async function read(ns: string, key: string): Promise<number> {
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

export async function GET() {
  const round = await getRiddleRound();
  const ns = letterNamespace(round);
  const counts = await Promise.all(LETTERS.map((l) => read(ns, l.slug)));
  const solved: Array<{ slug: string; letter: string; count: number }> = [];
  LETTERS.forEach((l, i) => {
    if (counts[i] > 0) solved.push({ slug: l.slug, letter: l.letter, count: counts[i] });
  });
  return NextResponse.json({ round, solved });
}
