import type { Metadata } from "next";
import portfolio from "@/data/portfolio.json";
import RecordHome from "@/components/RecordHome";

// / — THE RECORD, second edition.
// project 0 ($3,453.83 → $100,000 by june 21) is closed: failed.
// project 1 is open through december 31, 2026. no goal posts. yet.
// The previous homepage (v9, "the rocks") is preserved at /v9.

const HOLDINGS = (portfolio as {
  holdings: Array<{ ticker: string; shares: number; entry_value: number; no_live_quote?: boolean }>;
}).holdings.map((h) => ({
  ticker: h.ticker, shares: h.shares, entry_value: h.entry_value,
  noLiveQuote: !!h.no_live_quote,
}));
const PENDING_CASH = (portfolio as { pending_cash: number }).pending_cash;
const OPENING_VALUE =
  (portfolio as { project_1?: { opening_value?: number } }).project_1?.opening_value ?? 4265.39;
const P1_CLOSE_ISO = "2026-12-31T23:59:59-07:00";

function daysFromNowTo(iso: string): number {
  return Math.max(0, Math.ceil((Date.parse(iso) - Date.now()) / 86_400_000));
}

export const metadata: Metadata = {
  title: "aureliex · project 0 failed. this is project 1.",
  description:
    "$3,453.83 → $100,000 was the wager. the monte carlo said 0.000000%. the record of the attempt, the painting that sold for $44, and project 1 — no goal posts yet, open through december 31, 2026.",
  openGraph: {
    title: "aureliex · project 0 failed. this is project 1.",
    description:
      "$3,453.83 → $100,000 was the wager. the monte carlo said 0.000000%. the record of the attempt, the painting that sold for $44, and project 1 — open through december 31, 2026.",
    url: "https://aureliex.com",
    siteName: "aureliex",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "aureliex · project 0 failed. this is project 1.",
    description:
      "$3,453.83 → $100,000 was the wager. the monte carlo said 0.000000%. the record, the painting that sold for $44, and project 1 — open through december 31, 2026.",
    creator: "@saapai",
  },
};

export default function HomePage() {
  return (
    <RecordHome
      totalNow={OPENING_VALUE}
      holdings={HOLDINGS}
      pendingCash={PENDING_CASH}
      daysToClose={daysFromNowTo(P1_CLOSE_ISO)}
    />
  );
}
