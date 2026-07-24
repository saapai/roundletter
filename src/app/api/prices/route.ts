import { NextResponse } from "next/server";
import portfolio from "@/data/portfolio.json";

// GET /api/prices — fetches Yahoo Finance chart data for each portfolio ticker
// in parallel. Returns { data: { TICKER: { timestamps: number[], closes: number[] } }, fetchedAt }.
// 30-minute bars over 5 days — enough granularity for 1D / 2D / All filters.
// Node runtime so we can set a user-agent (Yahoo blocks unknown clients).
// Revalidates every 15 min so the chart isn't fetching on every request.

export const runtime = "nodejs";
// force-dynamic: the route itself is never ISR-cached (Vercel persists the
// ISR cache across deployments, which kept serving a stale ticker list after
// the SHAZ exclusion shipped). The per-ticker Yahoo fetches below still use
// the 15-min data cache, so this stays cheap.
export const dynamic = "force-dynamic";

// Tickers come from portfolio.json so the price feed can never drift from
// the live book again (the project-0 list was hardcoded here and went stale).
// Holdings flagged no_live_quote are excluded — Yahoo resolves their symbol
// to a different instrument (SHAZ), so they're carried at the last synced
// mark; every consumer falls back to entry_value when a series is missing.
const TICKERS = (
  (portfolio as { holdings?: Array<{ ticker: string; no_live_quote?: boolean }> }).holdings ?? []
)
  .filter((h) => !h.no_live_quote)
  .map((h) => h.ticker);

type Series = { timestamps: number[]; closes: number[] };

async function fetchYahoo(ticker: string): Promise<Series | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=30m&range=5d&includePrePost=false`;
    const r = await fetch(url, {
      cache: "no-store",
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; aureliex/1.0)",
        accept: "application/json",
      },
      // Allow longer than Vercel's edge default
      next: { revalidate: 900 },
    });
    if (!r.ok) return null;
    const j = (await r.json()) as {
      chart?: { result?: Array<{ timestamp?: number[]; indicators?: { quote?: Array<{ close?: Array<number | null> }> } }> };
    };
    const result = j?.chart?.result?.[0];
    if (!result) return null;
    const timestamps = result.timestamp ?? [];
    const closes = result.indicators?.quote?.[0]?.close ?? [];
    // Align and drop nulls
    const outT: number[] = [];
    const outC: number[] = [];
    timestamps.forEach((t, i) => {
      const c = closes[i];
      if (typeof c === "number" && Number.isFinite(c)) {
        outT.push(t);
        outC.push(c);
      }
    });
    return { timestamps: outT, closes: outC };
  } catch {
    return null;
  }
}

export async function GET() {
  const entries = await Promise.all(
    TICKERS.map(async (t) => [t, await fetchYahoo(t)] as const),
  );
  const data: Record<string, Series | null> = {};
  for (const [t, s] of entries) data[t] = s;
  const anyData = Object.values(data).some((s) => s && s.closes.length > 0);
  return NextResponse.json({
    tickers: TICKERS,
    data,
    fetchedAt: Date.now(),
    hasData: anyData,
  });
}
