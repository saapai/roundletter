import type { Metadata } from "next";
import Link from "next/link";
import PortfolioGrowthChart from "@/components/PortfolioGrowthChart";
import { getPortfolioData, getPersonalHoldings } from "@/lib/portfolio-aggregate";

// /portfolio/personal — drill-down for the Personal tile (live brokerage
// holdings: stocks/ETFs aggregated through src/lib/portfolio-live.ts).
// PR2 keeps the history minimal (single live point); the chart still
// renders its empty-state copy when len < 2 — a real per-bar accrual
// is future work.

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "aureliex · portfolio · personal",
  description: "personal brokerage holdings — live total + holdings list.",
};

function fmtMoney(n: number): string {
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export default async function PersonalPage() {
  const data = await getPortfolioData();
  const cat = data.categories.personal;
  const holdings = getPersonalHoldings();

  return (
    <article className="article page bank-page">
      <div className="eyebrow">
        <Link href="/portfolio" className="pathlink">portfolio</Link> · personal
      </div>
      <h1>personal</h1>
      <p className="deck">
        live brokerage book · current value <strong>{fmtMoney(cat.current_value)}</strong>
        {data.live ? " · live" : " · baseline fallback"}
      </p>

      <PortfolioGrowthChart
        category="personal"
        series={cat.history}
        label="live brokerage value (sum of shares × close + pending cash)."
        emptyMessage="real per-bar history accrues in a future pass — for now this is a single live point."
      />

      <section className="page-section">
        <div className="page-section-head">
          <h2>holdings</h2>
          <span className="page-section-meta">{holdings.length} positions</span>
        </div>
        <div className="page-cards">
          {holdings.map((h) => (
            <div key={h.ticker} className="page-card">
              <div className="card-head">
                <div className="card-ticker">{h.ticker}</div>
                {h.entry_price != null && (
                  <div className="card-agent">entry · ${h.entry_price}</div>
                )}
              </div>
              {h.name && <div className="card-name">{h.name}</div>}
              <div className="card-grid">
                <div><div className="k">shares</div><div className="v">{h.shares}</div></div>
                <div><div className="k">entry value</div><div className="v">${h.entry_value}</div></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}
