import { NextResponse } from "next/server";
import { getPortfolioData, getShareholders } from "@/lib/portfolio-aggregate";

export const runtime = "nodejs";
export const revalidate = 1800; // 30 min

export async function GET() {
  const data = await getPortfolioData();
  const portfolioValue = data.categories.personal.current_value
    + data.categories.prediction.breakdown.kalshi.total
    + data.categories.prediction.breakdown.polymarket.bankroll
    + 150;
  const shareholders = getShareholders(portfolioValue);
  return NextResponse.json({
    portfolio_value: portfolioValue,
    generated_at: Date.now(),
    shareholders,
  });
}
