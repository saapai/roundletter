import type { Metadata } from "next";
import { fmtMoney } from "@/lib/portfolio-live";
import { getPortfolioData } from "@/lib/portfolio-aggregate";
import portfolio from "@/data/portfolio.json";
import HomeCover from "@/components/HomeCover";

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
  const live = fmtMoney(data.total);
  return {
    title: `aureliex · ${live} now → $100,000 by june 21`,
    description: `real money. live positions. $3,453 → $100,000 by my 21st birthday. tap to watch the number move.`,
    openGraph: {
      title: `aureliex · ${live} now → $100,000 by june 21`,
      description: `real money. live positions. $3,453 → $100,000 by my 21st birthday. tap to watch the number move.`,
      url: "https://aureliex.com",
      siteName: "aureliex",
      images: [{ url: "/hero/cityscape.png", width: 1376, height: 768 }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `aureliex · ${live} now → $100,000 by june 21`,
      description: `real money. live positions. $3,453 → $100,000 by my 21st birthday. tap to watch the number move.`,
      creator: "@saapai",
      images: ["/hero/cityscape.png"],
    },
  };
}

export default async function HomePage() {
  const data = await getPortfolioData();
  return (
    <HomeCover
      totalNow={data.total}
      daysToBirthday={daysFromNowTo(BIRTHDAY_ISO)}
      holdings={HOLDINGS}
      pendingCash={PENDING_CASH}
      entryValue={ENTRY_VALUE}
    />
  );
}
