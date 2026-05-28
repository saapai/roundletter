import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

// Party date — the birthday
export const PARTY_DATE = "2026-06-21";

const MANUAL_PATH = resolve(process.cwd(), "src/data/investments.json");

export function daysUntilParty(): number {
  const now = new Date();
  const party = new Date(PARTY_DATE + "T23:59:59");
  return Math.max(0, Math.ceil((party.getTime() - now.getTime()) / 86_400_000));
}

export type Investment = {
  name: string;
  amountCents: number;
  feeCents: number;
  method: "venmo" | "direct";
  investedAt: string;
  daysBeforeParty: number;
  weight: number;
};

export type PoolState = {
  totalInvested: number;
  totalWeight: number;
  investorCount: number;
  investments: Array<{
    name: string;
    amountCents: number;
    weight: number;
    daysBeforeParty: number;
    investedAt: string;
    sharePct: number;
  }>;
};

// Manual investments (Venmo/direct) stored in a JSON file
function getManualInvestments(): Investment[] {
  try {
    if (existsSync(MANUAL_PATH)) {
      const raw = readFileSync(MANUAL_PATH, "utf-8");
      const data = JSON.parse(raw);
      return data.investments ?? [];
    }
  } catch {}
  return [];
}

export function recordManualInvestment(inv: Omit<Investment, "weight" | "daysBeforeParty">) {
  const investments = getManualInvestments();
  const days = daysUntilParty();
  investments.push({
    ...inv,
    daysBeforeParty: days,
    weight: inv.amountCents * days,
  });
  try {
    writeFileSync(MANUAL_PATH, JSON.stringify({ investments }, null, 2));
  } catch (err) {
    console.error("Failed to write manual investment:", err);
  }
}

// Get pool state from manual investments only
export async function getPoolState(): Promise<PoolState> {
  const all = getManualInvestments();
  const totalWeight = all.reduce((s, r) => s + r.weight, 0);
  const totalInvested = all.reduce((s, r) => s + r.amountCents, 0);

  return {
    totalInvested,
    totalWeight,
    investorCount: all.length,
    investments: all
      .sort((a, b) => b.weight - a.weight)
      .map((r) => ({
        name: r.name,
        amountCents: r.amountCents,
        weight: r.weight,
        daysBeforeParty: r.daysBeforeParty,
        investedAt: r.investedAt,
        sharePct: totalWeight > 0 ? (r.weight / totalWeight) * 100 : 0,
      })),
  };
}
