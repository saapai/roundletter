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

      <section className="art-gallery-section">
        <div className="page-section-head">
          <h2>pieces</h2>
          <span className="page-section-meta">{pieces.length} total · scroll</span>
        </div>

        {/*
          Native CSS scroll-snap gallery (per design-bank/etds-com.md).
          Mobile: vertical scroll-snap, each piece centered with breathing
          room. Desktop: 2-up grid. Zero JS.
        */}
        <div className="art-gallery">
          {pieces.map((p) => {
            const bid =
              typeof p.current_bid === "number" ? p.current_bid : (p.start_bid ?? 0);
            const hasImage = !!p.image;
            return (
              <figure key={p.id} className={`art-piece${hasImage ? "" : " is-locked"}`}>
                {hasImage ? (
                  <img
                    src={p.image}
                    alt={p.title || p.id}
                    loading="lazy"
                    className="art-piece-img"
                  />
                ) : (
                  <div className="art-piece-locked">
                    <span className="art-piece-locked-mark">[locked preview]</span>
                  </div>
                )}
                <figcaption className="art-piece-meta">
                  <span className="art-piece-bid">{fmtMoney(bid)}</span>
                  <span className="art-piece-bid-label">
                    {p.current_bid != null ? "current bid" : "starting bid"}
                  </span>
                  {p.title && <span className="art-piece-title">{p.title}</span>}
                  {p.medium && <span className="art-piece-medium">{p.medium}</span>}
                  {p.date && <span className="art-piece-date">{p.date}</span>}
                </figcaption>
              </figure>
            );
          })}
        </div>
      </section>
    </article>
  );
}
