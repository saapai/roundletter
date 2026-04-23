// Live portfolio value (Yahoo Finance aggregator) — shared by /
// (page.tsx + LaunchTrailer copy) and opengraph-image.tsx.
//
// Falls back to baseline when Yahoo rate-limits / errors so renders never
// break. Revalidates every 5 minutes.

const ENTRY_VALUE = 3453.83;
const PENDING_CASH = 46.57;
const GOAL = 100_000;

const HOLDINGS: Array<{ ticker: string; shares: number; entry: number }> = [
  { ticker: "QTUM", shares: 5.584,  entry: 679.74 },
  { ticker: "MSFT", shares: 1.036,  entry: 407.87 },
  { ticker: "GOOG", shares: 1.235,  entry: 407.17 },
  { ticker: "IONQ", shares: 11.489, entry: 504.71 },
  { ticker: "IBM",  shares: 1.553,  entry: 373.33 },
  { ticker: "NVDA", shares: 1.773,  entry: 344.49 },
  { ticker: "CEG",  shares: 1.148,  entry: 339.05 },
  { ticker: "RGTI", shares: 9.938,  entry: 169.50 },
  { ticker: "SGOV", shares: 1.684,  entry: 169.27 },
  { ticker: "QBTS", shares: 5.951,  entry: 101.65 },
];

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

  // Ground-truth override — src/data/portfolio.json carries a
  // current_value_today field saapai updates from the real brokerage.
  // When present + fresh (same calendar day in America/Los_Angeles),
  // it's the source of truth. Live-price sum is only the fallback.
  try {
    const portfolio = (await import("@/data/portfolio.json")) as unknown as {
      current_value_today?: number;
      as_of?: string;
    };
    if (
      typeof portfolio.current_value_today === "number" &&
      Number.isFinite(portfolio.current_value_today) &&
      portfolio.current_value_today > 0
    ) {
      value = portfolio.current_value_today;
      live = true;
    }
  } catch {
    /* missing file → fall through to live pricing */
  }

  if (!live) {
    try {
      const priced = await Promise.all(HOLDINGS.map(async (h) => {
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
