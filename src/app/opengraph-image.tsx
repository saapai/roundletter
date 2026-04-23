import { ImageResponse } from "next/og";

export const runtime = "edge";
export const revalidate = 300;
export const alt = "aureliex — live portfolio snapshot toward $100,000 by my birthday";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ENTRY_VALUE = 3453.83;
const PENDING_CASH = 46.57;
const GOAL = 100_000;
const ROUND_START_ISO = "2026-04-12T00:00:00-04:00";
const BIRTHDAY_ISO = "2026-06-21T00:00:00-04:00";

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
    const j: any = await r.json();
    const closes: Array<number | null> = j?.chart?.result?.[0]?.indicators?.quote?.[0]?.close ?? [];
    for (let i = closes.length - 1; i >= 0; i--) {
      const c = closes[i];
      if (c != null && Number.isFinite(c)) return c as number;
    }
    return null;
  } catch {
    return null;
  }
}

async function livePortfolioValue(): Promise<number | null> {
  try {
    const priced = await Promise.all(HOLDINGS.map(async (h) => {
      const c = await lastClose(h.ticker);
      return c == null ? h.entry : h.shares * c;
    }));
    const total = priced.reduce((acc, v) => acc + v, 0) + PENDING_CASH;
    return Number.isFinite(total) && total > 0 ? total : null;
  } catch {
    return null;
  }
}

function fmtMoney(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

export default async function Image() {
  const now = new Date();
  const roundStart = new Date(ROUND_START_ISO);
  const birthday = new Date(BIRTHDAY_ISO);

  const live = await livePortfolioValue();
  const value = live ?? ENTRY_VALUE;
  const delta = value - ENTRY_VALUE;
  const pct = (delta / ENTRY_VALUE) * 100;
  const up = delta >= 0;
  const sign = up ? "+" : "−";
  const dayNumber = Math.max(1, Math.ceil((now.getTime() - roundStart.getTime()) / 86_400_000));
  const daysToBirthday = Math.max(0, Math.ceil((birthday.getTime() - now.getTime()) / 86_400_000));
  const multiple = (GOAL / value).toFixed(1);
  const deltaColor = up ? "#3B7A4A" : "#8B3A2E";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#F4EFE6",
          color: "#1C1A17",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* eyebrow */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 22,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#6B6560",
          }}
        >
          <span>aureliex · round 0 · day {dayNumber} · live</span>
          <span>{daysToBirthday}d to 21 jun</span>
        </div>

        {/* middle: live value + delta + target */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 28,
            }}
          >
            <span
              style={{
                fontSize: 150,
                lineHeight: 1,
                fontStyle: "italic",
                letterSpacing: -3,
                color: "#1C1A17",
              }}
            >
              {fmtMoney(value)}
            </span>
            <span
              style={{
                fontSize: 44,
                lineHeight: 1,
                color: deltaColor,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <span>
                {sign}
                {fmtMoney(Math.abs(delta)).replace("$", "$")}
              </span>
              <span style={{ fontSize: 30 }}>
                {sign}
                {Math.abs(pct).toFixed(1)}%
              </span>
            </span>
          </div>
          <div style={{ fontSize: 34, lineHeight: 1.2, color: "#1C1A17", maxWidth: 1060 }}>
            → $100,000 by my birthday. {multiple}× to go. {daysToBirthday} days left. live.
          </div>
        </div>

        {/* bottom */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 20,
            color: "#6B6560",
          }}
        >
          <span>five AI agents · no job · the pre-mortem, published before I fail</span>
          <span>aureliex.com</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
