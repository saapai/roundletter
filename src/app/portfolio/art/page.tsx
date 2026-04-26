import type { Metadata } from "next";
import Link from "next/link";
import PortfolioGrowthChart from "@/components/PortfolioGrowthChart";
import { getPortfolioData, getArtPieces } from "@/lib/portfolio-aggregate";

// /portfolio/art — art portfolio drill-down. Pre-launch the value is
// the sum of starting bids; once the round-1 auction unlocks the
// aggregator switches to max(current_bid, start_bid) automatically.

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "aureliex · portfolio · art",
  description: "art portfolio pieces — starting bids + (post-launch) live bids.",
};

function fmtMoney(n: number): string {
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

export default async function ArtPage() {
  const data = await getPortfolioData();
  const cat = data.categories.art;
  const pieces = getArtPieces();

  return (
    <article className="article page bank-page">
      <div className="eyebrow">
        <Link href="/portfolio" className="pathlink">portfolio</Link> · art
      </div>
      <h1>art</h1>
      <p className="deck">
        sum of starting bids · current value <strong>{fmtMoney(cat.current_value)}</strong>
      </p>

      <PortfolioGrowthChart
        category="art"
        series={cat.history}
        label="sum of starting bids today. the auction series begins when round 1 unlocks."
        emptyMessage="auction-driven history begins at round 1 unlock."
      />

      <section className="page-section">
        <div className="page-section-head">
          <h2>pieces</h2>
          <span className="page-section-meta">{pieces.length} total</span>
        </div>
        <div className="page-cards">
          {pieces.map((p) => {
            const bid =
              typeof p.current_bid === "number" ? p.current_bid : (p.start_bid ?? 0);
            return (
              <div key={p.id} className="page-card">
                <div className="card-head">
                  <div className="card-ticker">{fmtMoney(bid)}</div>
                  <div className="card-agent">
                    {p.current_bid != null ? "current bid" : "starting bid"}
                  </div>
                </div>
                {p.title && <div className="card-name">{p.title}</div>}
                {p.medium && <p className="card-note">{p.medium}</p>}
              </div>
            );
          })}
        </div>
      </section>
    </article>
  );
}
