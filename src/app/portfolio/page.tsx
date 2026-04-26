import type { Metadata } from "next";
import PortfolioChart from "@/components/PortfolioChart";
import CategoryCard from "@/components/CategoryCard";
import { getLivePortfolio, fmtMoney } from "@/lib/portfolio-live";
import portfolio from "@/data/portfolio.json";

/* ────────────────────────────────────────────────────────────
   /portfolio — PR1 of the site simplification.

   Top-line whole-portfolio chart (same data feed as / and
   /positions: the live Yahoo-quote pipeline behind PortfolioChart),
   followed by four placeholder CategoryCard tiles for Personal,
   External, Art, and Prediction. Real per-category data + the
   /portfolio/{slug} subroutes land in PR2.
   ──────────────────────────────────────────────────────────── */

const HOLDINGS = (portfolio as {
  holdings: Array<{ ticker: string; shares: number; entry_value: number }>;
}).holdings.map((h) => ({
  ticker: h.ticker,
  shares: h.shares,
  entry_value: h.entry_value,
}));

const BASELINE_DATE = (portfolio as { baseline_date: string }).baseline_date;
const ACCOUNT_VALUE_AT_ENTRY =
  (portfolio as { account_value_at_entry?: number }).account_value_at_entry ?? 3453.83;

// Match the baselineTs convention used on /positions (anchor at 14:00 UTC of
// the baseline calendar date) so the chart's "All" window starts at the
// account_value_at_entry print, not at the first Yahoo bar of the day.
const BASELINE_TS = new Date(`${BASELINE_DATE}T14:00:00Z`).getTime();

export const metadata: Metadata = {
  title: "aureliex · portfolio",
  description:
    "the whole portfolio at a glance — live total plus four category tiles (personal, external, art, prediction).",
};

export default async function PortfolioPage() {
  const lp = await getLivePortfolio();

  const categories: Array<{ key: string; label: string }> = [
    { key: "personal", label: "Personal" },
    { key: "external", label: "External" },
    { key: "art", label: "Art" },
    { key: "prediction", label: "Prediction" },
  ];

  return (
    <article className="article page">
      <div className="eyebrow">Portfolio</div>
      <h1>portfolio</h1>
      <p className="deck">
        live total: <strong>{fmtMoney(lp.value)}</strong>
        {lp.live ? " · live" : " · baseline fallback"}
      </p>

      <PortfolioChart
        holdings={HOLDINGS}
        baselineTs={BASELINE_TS}
        accountValueAtEntry={ACCOUNT_VALUE_AT_ENTRY}
      />

      <section className="cat-card-grid" aria-label="categories">
        {categories.map((c) => (
          <CategoryCard
            key={c.key}
            label={c.label}
            value={null}
            pctChange={null}
            series={[]}
          />
        ))}
      </section>

      <p className="deck cat-card-footnote">
        per-category breakdowns and dedicated pages land in the next pass.
      </p>
    </article>
  );
}
