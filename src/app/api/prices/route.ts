import { NextResponse } from "next/server";

// GET /api/prices — fetches Yahoo Finance chart data for each portfolio ticker
// in parallel. Returns { data: { TICKER: { timestamps: number[], closes: number[] } }, fetchedAt }.
// 30-minute bars over 5 days — enough granularity for 1D / 2D / All filters.
// Node runtime so we can set a user-agent (Yahoo blocks unknown clients).
// Revalidates every 15 min so the chart isn't fetching on every request.

export const runtime = "nodejs";
export const revalidate = 900;

const TICKERS = [
  "QTUM",
  "MSFT",
  "GOOG",
  "IONQ",
  "IBM",
  "NVDA",
  "CEG",
  "RGTI",
  "SGOV",
  "QBTS",
];

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
    data,
    fetchedAt: Date.now(),
    hasData: anyData,
  });
}
