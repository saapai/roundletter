import type { Metadata } from "next";
import { fmtMoney } from "@/lib/portfolio-live";
import { getPortfolioData } from "@/lib/portfolio-aggregate";
import portfolio from "@/data/portfolio.json";
import V9Client from "./client";

const HOLDINGS = (portfolio as {
  holdings: Array<{ ticker: string; shares: number; entry_value: number }>;
}).holdings.map((h) => ({ ticker: h.ticker, shares: h.shares, entry_value: h.entry_value }));
const PENDING_CASH = (portfolio as { pending_cash: number }).pending_cash;
const ENTRY_VALUE = (portfolio as { account_value_at_entry: number }).account_value_at_entry;
const BIRTHDAY_ISO = "2026-06-21T00:00:00-07:00";

function daysFromNowTo(iso: string): number {
  return Math.max(0, Math.ceil((Date.parse(iso) - Date.now()) / 86_400_000));
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getPortfolioData();
  const realTotal = data.categories.personal.current_value + data.categories.prediction.breakdown.kalshi.total + data.categories.prediction.breakdown.polymarket.bankroll + 150;
  const live = fmtMoney(realTotal);
  return {
    title: `aureliex · ${live} now → $100,000 by june 21`,
    description: `real money. live positions. $3,453 → $100,000 by my 20th birthday.`,
    openGraph: {
      title: `aureliex · ${live} now → $100,000 by june 21`,
      description: `real money. live positions. $3,453 → $100,000 by my 20th birthday.`,
      url: "https://aureliex.com",
      siteName: "aureliex",
      images: [{ url: "/hero/rocks.webp", width: 1400, height: 788 }],
      type: "article",
    },
  };
}

export default async function V9Page() {
  const data = await getPortfolioData();
  return (
    <V9Client
      totalNow={data.categories.personal.current_value + data.categories.prediction.breakdown.kalshi.total + data.categories.prediction.breakdown.polymarket.bankroll + 150}
      daysToBirthday={daysFromNowTo(BIRTHDAY_ISO)}
      holdings={HOLDINGS}
      pendingCash={PENDING_CASH}
      entryValue={ENTRY_VALUE}
      nonStockValue={data.categories.prediction.breakdown.kalshi.total + data.categories.prediction.breakdown.polymarket.bankroll + 150}
    />
  );
}
