import type { Metadata } from "next";
import PortfolioChart from "@/components/PortfolioChart";
import CategoryCard from "@/components/CategoryCard";
import { fmtMoney } from "@/lib/portfolio-live";
import { getPortfolioData } from "@/lib/portfolio-aggregate";
import portfolio from "@/data/portfolio.json";

/* ────────────────────────────────────────────────────────────
   /portfolio — top-line whole-portfolio chart + 4 category tiles
   wired to /api/portfolio (PR2). Each tile links to its
   subroute (/portfolio/{personal,external,art,prediction}).
   ──────────────────────────────────────────────────────────── */

export const dynamic = "force-dynamic";

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

const BASELINE_TS = new Date(`${BASELINE_DATE}T14:00:00Z`).getTime();

export const metadata: Metadata = {
  title: "aureliex · portfolio",
  description:
    "the whole portfolio at a glance — live total plus four category tiles (personal, external, art, prediction).",
};

export default async function PortfolioPage() {
  const data = await getPortfolioData();
  const cats = data.categories;

  // Category card config — { key, label, value, series, href } pulled
  // straight from the aggregator. PR1 placeholders are gone.
  const categoryCards: Array<{
    key: keyof typeof cats;
    label: string;
    href: string;
  }> = [
    { key: "personal",   label: "Personal",   href: "/portfolio/personal" },
    { key: "external",   label: "External",   href: "/portfolio/external" },
    { key: "art",        label: "Art",        href: "/portfolio/art" },
    { key: "prediction", label: "Prediction", href: "/portfolio/prediction" },
  ];

  return (
    <article className="article page">
      <div className="eyebrow">Portfolio</div>
      <h1>portfolio</h1>
      <p className="deck">
        live total: <strong>{fmtMoney(data.total)}</strong>
        {data.live ? " · live" : " · baseline fallback"}
      </p>

      <PortfolioChart
        holdings={HOLDINGS}
        baselineTs={BASELINE_TS}
        accountValueAtEntry={ACCOUNT_VALUE_AT_ENTRY}
      />

      <section className="cat-card-grid" aria-label="categories">
        {categoryCards.map((c) => {
          const block = cats[c.key];
          // pctChange: first vs last point. Single-point series returns null.
          const pct =
            block.history.length >= 2
              ? ((block.history[block.history.length - 1].value - block.history[0].value) /
                  (block.history[0].value || 1)) *
                100
              : null;
          return (
            <CategoryCard
              key={c.key}
              label={c.label}
              value={block.current_value}
              pctChange={pct}
              series={block.history}
              href={c.href}
            />
          );
        })}
      </section>

      <p className="deck cat-card-footnote">
        per-category history accrues over time — single-point categories show their live total.
      </p>
    </article>
  );
}
