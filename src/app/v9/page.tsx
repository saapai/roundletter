import type { Metadata } from "next";
import { getEquityBasis, getPortfolioData, getShareholders } from "@/lib/portfolio-aggregate";
import portfolio from "@/data/portfolio.json";
import V9Client from "./client";

// /v9 — the project-0 homepage, preserved as found (june 2026).
// The layout and copy are the artifact; the numbers are kept honest:
// the equity basis is the account (live holdings + pending), same as
// every other equity surface. The old kalshi/polymarket/+$150 formula
// was retired with project 0.

const HOLDINGS = (portfolio as {
  holdings: Array<{ ticker: string; shares: number; entry_value: number; no_live_quote?: boolean }>;
}).holdings.map((h) => ({
  ticker: h.ticker, shares: h.shares, entry_value: h.entry_value,
  noLiveQuote: !!h.no_live_quote,
}));
const PENDING_CASH = (portfolio as { pending_cash: number }).pending_cash;
const ENTRY_VALUE = (portfolio as { account_value_at_entry: number }).account_value_at_entry;
const BIRTHDAY_ISO = "2026-06-21T00:00:00-07:00";

function daysFromNowTo(iso: string): number {
  return Math.max(0, Math.ceil((Date.parse(iso) - Date.now()) / 86_400_000));
}

export const metadata: Metadata = {
  title: "aureliex · the project-0 homepage, preserved as found",
  description:
    "the rocks. the letter. the party ticket. the painting. the homepage as it stood when project 0 closed on june 21, 2026 — preserved as found.",
  openGraph: {
    title: "aureliex · the project-0 homepage, preserved as found",
    description:
      "the homepage as it stood when project 0 closed on june 21, 2026 — preserved as found.",
    url: "https://aureliex.com/v9",
    siteName: "aureliex",
    images: [{ url: "/hero/rocks.webp", width: 1400, height: 788 }],
    type: "article",
  },
};

export default async function V9Page() {
  const data = await getPortfolioData();
  const pv = getEquityBasis(data);
  const shareholders = getShareholders(pv).map((s) => ({
    name: s.name, slug: s.slug, total_current_value: s.total_current_value,
  }));
  return (
    <V9Client
      totalNow={pv}
      daysToBirthday={daysFromNowTo(BIRTHDAY_ISO)}
      holdings={HOLDINGS}
      pendingCash={PENDING_CASH}
      entryValue={ENTRY_VALUE}
      nonStockValue={0}
      shareholders={shareholders}
    />
  );
}
