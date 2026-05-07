import type { Metadata } from "next";
import { fmtMoney } from "@/lib/portfolio-live";
import { getPortfolioData } from "@/lib/portfolio-aggregate";
import portfolio from "@/data/portfolio.json";
import sealed from "@/data/sealed/impossible.json";
import stakeLedger from "@/data/stake-ledger.json";
import BootSequence from "@/components/BootSequence";
import HomeContent from "@/components/HomeContent";

const HOLDINGS = (portfolio as {
  holdings: Array<{ ticker: string; shares: number; entry_value: number }>;
}).holdings.map((h) => ({ ticker: h.ticker, shares: h.shares, entry_value: h.entry_value }));
const PENDING_CASH = (portfolio as { pending_cash: number }).pending_cash;
const BIRTHDAY_ISO = "2026-06-21T00:00:00-07:00";

function daysFromNowTo(iso: string): number {
  return Math.max(0, Math.ceil((Date.parse(iso) - Date.now()) / 86_400_000));
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getPortfolioData();
  const live = fmtMoney(data.total);
  return {
    title: `aureliex · ${live} → $100,000 by 21 jun`,
    description: `a publicly-owned studio. green credit, redeemable in 60s. ${live} now.`,
    openGraph: {
      title: `aureliex · now at ${live}.`,
      description: `green credit, redeemable in 60 seconds via Venmo or Zelle.`,
      url: "https://aureliex.com",
      siteName: "aureliex",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `aureliex · now at ${live}.`,
      description: `a publicly-owned studio. green credit, redeemable in 60s.`,
      creator: "@saapai",
    },
  };
}

export default async function HomePage() {
  const data = await getPortfolioData();

  return (
    <BootSequence>
      <HomeContent
        totalNow={data.total}
        baseline={data.baseline}
        daysToBirthday={daysFromNowTo(BIRTHDAY_ISO)}
        hashShort={sealed.commitment_sha256.slice(0, 8)}
        stakesOutstanding={(stakeLedger.total_outstanding_cents / 100).toFixed(0)}
        eggEquity={(stakeLedger.egg_equity_cents / 100).toFixed(0)}
        holdings={HOLDINGS}
        pendingCash={PENDING_CASH}
      />
    </BootSequence>
  );
}
