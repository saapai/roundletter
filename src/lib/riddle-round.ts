// Shared helpers for the POLYMARKET riddle. The current "round" is stored
// as an abacus counter; each round maps to its own namespace so advancing
// the round effectively zeros all letter counts without needing an admin
// key for the underlying abacus instance.

const BASE = "https://abacus.jasoncameron.dev";
const ROUND_NS = "aureliex-riddle";
const ROUND_KEY = "round";

export async function getRiddleRound(): Promise<number> {
  try {
    const r = await fetch(`${BASE}/get/${ROUND_NS}/${ROUND_KEY}`, { cache: "no-store" });
    if (!r.ok) return 1;
    const j = (await r.json()) as { value?: number; error?: string };
    if (j.error === "Key not found") return 1;
    return typeof j.value === "number" && j.value > 0 ? j.value : 1;
  } catch {
    return 1;
  }
}

export async function bumpRiddleRound(): Promise<number> {
  try {
    const r = await fetch(`${BASE}/hit/${ROUND_NS}/${ROUND_KEY}`, { cache: "no-store" });
    if (!r.ok) throw new Error("upstream");
    const j = (await r.json()) as { value?: number };
    return typeof j.value === "number" ? j.value : 1;
  } catch {
    throw new Error("round bump failed");
  }
}

export function letterNamespace(round: number): string {
  return `aureliex-riddle-r${round}`;
}
