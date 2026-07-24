// Live portfolio value (Yahoo Finance aggregator) — shared by /
// (page.tsx + LaunchTrailer copy) and opengraph-image.tsx.
//
// Reads holdings from portfolio.json so there's a single source of truth.
// Falls back to entry values when Yahoo rate-limits / errors so renders
// never break. Revalidates every 5 minutes.

import portfolio from "@/data/portfolio.json";

const ENTRY_VALUE =
  (portfolio as { account_value_at_entry?: number }).account_value_at_entry ?? 3453.83;
const PENDING_CASH = (portfolio as { pending_cash?: number }).pending_cash ?? 0;
const GOAL = 100_000;

const HOLDINGS: Array<{ ticker: string; shares: number; entry: number; noLiveQuote: boolean }> =
  ((portfolio as { holdings?: Array<{ ticker: string; shares: number; entry_value: number; no_live_quote?: boolean }> }).holdings ?? [])
    .map((h) => ({ ticker: h.ticker, shares: h.shares, entry: h.entry_value, noLiveQuote: !!h.no_live_quote }));

export type LivePortfolio = {
  baseline: number;
  value: number;
  delta: number;
  pct: number;
  up: boolean;
  goal: number;
  multiple: number;
  live: boolean;
};

async function lastClose(ticker: string): Promise<number | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=30m&range=1d&includePrePost=false`;
    const r = await fetch(url, {
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; aureliex/1.0)",
        accept: "application/json",
      },
      next: { revalidate: 300 },
    });
    if (!r.ok) return null;
    const j: unknown = await r.json();
    const closes = (j as { chart?: { result?: Array<{ indicators?: { quote?: Array<{ close?: Array<number | null> }> } }> } })
      ?.chart?.result?.[0]?.indicators?.quote?.[0]?.close ?? [];
    for (let i = closes.length - 1; i >= 0; i--) {
      const c = closes[i];
      if (c != null && Number.isFinite(c)) return c as number;
    }
    return null;
  } catch {
    return null;
  }
}

export async function getLivePortfolio(): Promise<LivePortfolio> {
  let value = ENTRY_VALUE;
  let live = false;

  try {
    const priced = await Promise.all(HOLDINGS.map(async (h) => {
      if (h.noLiveQuote) return h.entry;
      const c = await lastClose(h.ticker);
      return c == null ? h.entry : h.shares * c;
    }));
    const total = priced.reduce((acc, v) => acc + v, 0) + PENDING_CASH;
    if (Number.isFinite(total) && total > 0) {
      value = total;
      live = true;
    }
  } catch {
    // swallow — fall back to baseline
  }
  const delta = value - ENTRY_VALUE;
  const pct = (delta / ENTRY_VALUE) * 100;
  const multiple = Number((GOAL / value).toFixed(1));
  return {
    baseline: ENTRY_VALUE,
    value,
    delta,
    pct,
    up: delta >= 0,
    goal: GOAL,
    multiple,
    live,
  };
}

export function fmtMoney(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

export function fmtMoneyCents(n: number): string {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
