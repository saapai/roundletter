import BankNav from "@/components/BankNav";
import type { Metadata } from "next";
import Link from "next/link";
import PortfolioChart from "@/components/PortfolioChart";
import CategoryCard from "@/components/CategoryCard";
import { fmtMoney } from "@/lib/portfolio-live";
import { getPortfolioData, getExternalEntries } from "@/lib/portfolio-aggregate";
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

// Live link-preview: every share shows the current $ total per
// memory/feedback_live_link_metadata.md.
export async function generateMetadata(): Promise<Metadata> {
  const data = await getPortfolioData();
  const liveTotal = `$${Math.round(data.total).toLocaleString("en-US")}`;
  const pct = (data.total / data.goal) * 100;
  const desc = `${liveTotal} now · ${pct.toFixed(2)}% of $100k · live, public, every trade on the record.`;
  return {
    title: `aureliex · ${liveTotal} → $100,000`,
    description: desc,
    openGraph: {
      title: `aureliex · the bank · ${liveTotal}`,
      description: desc,
      url: "https://aureliex.com/portfolio",
      siteName: "aureliex",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `aureliex · ${liveTotal}`,
      description: desc,
      creator: "@saapai",
    },
  };
}

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
    { key: "personal",   label: "Personal",   href: "/stocks" },
    { key: "external",   label: "External",   href: "/external" },
    { key: "art",        label: "Art",        href: "/art" },
    { key: "prediction", label: "Prediction", href: "/prediction" },
  ];

  // Days remaining to 21 jun birthday goal — for hero meta
  const goalIso = "2026-06-21T00:00:00-07:00";
  const daysToGoal = Math.max(
    0,
    Math.ceil((Date.parse(goalIso) - Date.now()) / 86_400_000),
  );
  const pctOfGoal = (data.total / data.goal) * 100;

  return (
    <article className="article page bank-page">
      <header className="bank-hero">
        <div className="bank-hero-eyebrow">the book</div>
        <div className="bank-hero-num">
          {fmtMoney(data.total)}
          <span className="bank-hero-arrow"> → </span>
          <span className="bank-hero-goal">$100,000</span>
        </div>
        <div className="bank-hero-meta">
          <span>{pctOfGoal.toFixed(2)}% of goal</span>
          <span className="bank-hero-meta-sep">·</span>
          <span>T−{daysToGoal} days</span>
          <span className="bank-hero-meta-sep">·</span>
          <span>{data.live ? "live" : "baseline"}</span>
        </div>
      </header>

      <PortfolioChart
        holdings={HOLDINGS}
        baselineTs={BASELINE_TS}
        accountValueAtEntry={ACCOUNT_VALUE_AT_ENTRY}
      />

      {/* screentime-style allocation bar — single stacked row over total,
          then per-category mini-row with swatch / name / share-bar / $ / % */}
      <section className="alloc-section" aria-label="allocation">
        <div className="alloc-head">
          <div className="alloc-eyebrow">allocation</div>
          <div className="alloc-meta">{fmtMoney(data.total)} across {(["personal","external","art","prediction"] as const).filter(k => cats[k].current_value > 0).length} categories</div>
        </div>
        <div className="alloc-bar" role="img" aria-label="allocation across categories">
          {(["personal","external","art","prediction"] as const).map((key) => {
            const v = cats[key].current_value;
            const pct = (v / Math.max(data.total, 1)) * 100;
            if (v <= 0) return null;
            return (
              <span
                key={key}
                className={`alloc-seg alloc-seg--${key}`}
                style={{ width: `${pct}%` }}
                title={`${key} · ${fmtMoney(v)} · ${pct.toFixed(1)}%`}
              />
            );
          })}
        </div>
        <ol className="alloc-legend">
          {(
            [
              { key: "personal" as const,   label: "stocks",     href: "/stocks" },
              { key: "external" as const,   label: "external",   href: "/external" },
              { key: "art" as const,        label: "art",        href: "/art" },
              { key: "prediction" as const, label: "prediction", href: "/prediction" },
            ]
          ).map(({ key, label, href }) => {
            const v = cats[key].current_value;
            const pct = (v / Math.max(data.total, 1)) * 100;
            return (
              <li key={key} className={`alloc-row alloc-row--${key}`}>
                <Link href={href} className="alloc-row-link">
                  <span className="alloc-swatch" aria-hidden="true" />
                  <span className="alloc-name">{label}</span>
                  <span className="alloc-bar-mini" aria-hidden="true">
                    <span style={{ width: `${pct}%` }} />
                  </span>
                  <span className="alloc-val">{fmtMoney(v)}</span>
                  <span className="alloc-pct">{pct.toFixed(1)}%</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

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

          // External: render the standard tile, then a slim CTA strip below
          // surfacing entry count + "see entries →" so it clearly invites
          // a click into /external.
          if (c.key === "external") {
            const externalEntries = getExternalEntries();
            const entryCount = externalEntries.length;
            return (
              <div key={c.key} className="cat-card-external-wrap">
                <CategoryCard
                  label={c.label}
                  value={block.current_value}
                  pctChange={pct}
                  series={block.history}
                  href={c.href}
                />
                <Link href={c.href} className="cat-card-external-cta">
                  <span className="cat-card-external-cta-meta">
                    {fmtMoney(block.current_value)} injected · {entryCount}{" "}
                    {entryCount === 1 ? "entry" : "entries"}
                  </span>
                  <span className="cat-card-external-cta-arrow">see entries →</span>
                </Link>
              </div>
            );
          }

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
    <BankNav />
    </article>
  );
}
