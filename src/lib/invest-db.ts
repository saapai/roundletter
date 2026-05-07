import Stripe from "stripe";
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

export function computeFees(amountCents: number): {
  stripeFee: number;
  aureliexFee: number;
  totalCharge: number;
} {
  // Stripe: 2.9% + $0.30, aureliex: 1%
  // customer_pays = (amount + 30) / (1 - 0.029 - 0.01)
  const totalCharge = Math.ceil((amountCents + 30) / (1 - 0.039));
  const stripeFee = Math.ceil(totalCharge * 0.029) + 30;
  const aureliexFee = Math.ceil(totalCharge * 0.01);
  return { stripeFee, aureliexFee, totalCharge };
}

export type Investment = {
  name: string;
  amountCents: number;
  feeCents: number;
  method: "stripe" | "venmo" | "direct";
  investedAt: string;
  daysBeforeParty: number;
  weight: number;
  stripeSessionId?: string;
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

// Get pool state from Stripe completed sessions + manual investments
export async function getPoolState(): Promise<PoolState> {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const manualInvestments = getManualInvestments();

  let stripeInvestments: Investment[] = [];

  if (stripeKey) {
    try {
      const stripe = new Stripe(stripeKey);
      const sessions = await stripe.checkout.sessions.list({
        limit: 100,
        status: "complete",
      });

      stripeInvestments = sessions.data
        .filter((s) => s.metadata?.base_amount_cents)
        .map((s) => ({
          name: s.metadata!.investor_name || "anonymous",
          amountCents: parseInt(s.metadata!.base_amount_cents, 10),
          feeCents: parseInt(s.metadata!.fee_cents || "0", 10),
          method: "stripe" as const,
          investedAt: new Date(s.created * 1000).toISOString(),
          daysBeforeParty: parseInt(s.metadata!.days_before_party || "0", 10),
          weight: parseInt(s.metadata!.weight || "0", 10),
          stripeSessionId: s.id,
        }));
    } catch (err) {
      console.error("Failed to fetch Stripe sessions:", err);
    }
  }

  const all = [...stripeInvestments, ...manualInvestments];
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
