import { notFound } from "next/navigation";
import { getPortfolioData, getShareholders } from "@/lib/portfolio-aggregate";
import ShareholderClient from "./client";

export const dynamic = "force-dynamic";

const SLUG_MAP: Record<string, string> = {
  navya: "Navya Rawal",
  franco: "Franco Cachay",
  elijah: "Elijah Bautista",
  yashas: "Yashas Shashidara",
};

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const fullName = SLUG_MAP[name.toLowerCase()];
  if (!fullName) return { title: "Not found" };
  return { title: `${fullName} · aureliex shareholder` };
}

export default async function ShareholderPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const slug = name.toLowerCase();
  const fullName = SLUG_MAP[slug];
  if (!fullName) notFound();

  const data = await getPortfolioData();
  const portfolioValue =
    data.categories.personal.current_value +
    data.categories.prediction.breakdown.kalshi.total +
    data.categories.prediction.breakdown.polymarket.bankroll +
    150;
  const shareholders = getShareholders(portfolioValue);
  const shareholder = shareholders.find((s) => s.slug === slug);
  if (!shareholder) notFound();

  return <ShareholderClient shareholder={shareholder} portfolioValue={portfolioValue} />;
}
