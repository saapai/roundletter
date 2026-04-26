import type { Metadata } from "next";
import Link from "next/link";
import PortfolioGrowthChart from "@/components/PortfolioGrowthChart";
import { getPortfolioData } from "@/lib/portfolio-aggregate";
import { getLatestKalshiSnapshot } from "@/lib/snapshots";

// /portfolio/prediction — Kalshi (vendored snapshot) + Polymarket
// (manual prediction.json bankroll). Breakdown is the "$X cash + $Y
// portfolio + $Z bankroll = $T" surface; the Kalshi event positions
// table sits below.

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "aureliex · portfolio · prediction",
  description: "prediction-market book — kalshi cash + portfolio + polymarket bankroll.",
};

function fmtMoney(n: number): string {
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

export default async function PredictionPage() {
  const data = await getPortfolioData();
  const cat = data.categories.prediction;
  const k = getLatestKalshiSnapshot();

  return (
    <article className="article page bank-page">
      <div className="eyebrow">
        <Link href="/portfolio" className="pathlink">portfolio</Link> · prediction
      </div>
      <h1>prediction</h1>
      <p className="deck">
        kalshi + polymarket · current value <strong>{fmtMoney(cat.current_value)}</strong>
      </p>

      <PortfolioGrowthChart
        category="prediction"
        series={cat.history}
        label="kalshi cash + open exposure + polymarket bankroll. snapshot-based; per-bar history accrues in a future pass."
        emptyMessage="snapshot-driven history accrues as more daily exports land."
      />

      <section className="page-section">
        <div className="page-section-head">
          <h2>breakdown</h2>
          <span className="page-section-meta">
            {k?.date ? `kalshi snapshot · ${k.date}` : "no kalshi snapshot"}
          </span>
        </div>
        <div className="page-cards">
          <div className="page-card">
            <div className="card-head">
              <div className="card-ticker">kalshi · cash</div>
              <div className="card-agent">{fmtMoney(cat.breakdown.kalshi.cash)}</div>
            </div>
            <p className="card-note">withdrawable balance per the latest export.</p>
          </div>
          <div className="page-card">
            <div className="card-head">
              <div className="card-ticker">kalshi · portfolio</div>
              <div className="card-agent">{fmtMoney(cat.breakdown.kalshi.portfolio_value)}</div>
            </div>
            <p className="card-note">open contract exposure across event positions.</p>
          </div>
          <div className="page-card">
            <div className="card-head">
              <div className="card-ticker">polymarket · bankroll</div>
              <div className="card-agent">{fmtMoney(cat.breakdown.polymarket.bankroll)}</div>
            </div>
            <p className="card-note">
              manual entry · src/data/prediction.json. cron-fed update is future work.
            </p>
          </div>
        </div>
      </section>

      {k && k.event_positions.length > 0 && (
        <section className="page-section">
          <div className="page-section-head">
            <h2>kalshi event positions</h2>
            <span className="page-section-meta">{k.fills_count} fills · {k.event_positions.length} events</span>
          </div>
          <div className="page-cards">
            {k.event_positions.map((ep) => (
              <div key={ep.event_ticker} className="page-card">
                <div className="card-head">
                  <div className="card-ticker">{ep.event_ticker}</div>
                  <div className="card-agent">
                    exposure ${parseFloat(ep.event_exposure_dollars).toFixed(2)}
                  </div>
                </div>
                <div className="card-grid">
                  <div>
                    <div className="k">total cost</div>
                    <div className="v">${parseFloat(ep.total_cost_dollars).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="k">fees</div>
                    <div className="v">${parseFloat(ep.fees_paid_dollars).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="k">realized pnl</div>
                    <div className="v">${parseFloat(ep.realized_pnl_dollars).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="k">shares</div>
                    <div className="v">{ep.total_cost_shares_fp}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
