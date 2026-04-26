import BankNav from "@/components/BankNav";
import type { Metadata } from "next";
import Link from "next/link";
import PortfolioGrowthChart from "@/components/PortfolioGrowthChart";
import { getPortfolioData, getArtPieces } from "@/lib/portfolio-aggregate";

// Only show pieces that actually have an image. Locked previews are
// hidden until the user delivers a scan.

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
  const pieces = getArtPieces().filter((p) => !!p.image);

  return (
    <article className="article page bank-page bank-page--art">
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

      {/*
        Gallery v3 — actual e-t-d-s scroll-snap. html:has(.bank-page--art)
        sets scroll-snap-type: y mandatory on the page so each piece snaps
        to viewport. Pure CSS, zero JS.
      */}
      <section className="art-gallery-section" aria-label="gallery">
        <div className="art-gallery art-gallery--snap">
          {pieces.map((p, i) => {
            const bid =
              typeof p.current_bid === "number" ? p.current_bid : (p.start_bid ?? 0);
            return (
              <figure key={p.id} id={`piece-${i + 1}`} className="art-piece">
                <div className="art-piece-frame">
                  <img
                    src={p.image as string}
                    alt={p.title || p.id}
                    loading={i < 2 ? "eager" : "lazy"}
                    className="art-piece-img"
                  />
                </div>
                <figcaption className="art-piece-tag">
                  <span className="art-piece-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="art-piece-title">{p.title || p.id}</span>
                  {p.medium && <span className="art-piece-medium">{p.medium}</span>}
                  <span className="art-piece-row">
                    {p.date && <span className="art-piece-date">{p.date}</span>}
                    <span className="art-piece-bid">
                      {fmtMoney(bid)}{" "}
                      <em>{p.current_bid != null ? "bid" : "start"}</em>
                    </span>
                  </span>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </section>

      {/* Vertical jump-rail — one dot per piece, fixed right edge */}
      <nav className="art-rail" aria-label="jump to piece">
        {pieces.map((p, i) => (
          <a key={p.id} href={`#piece-${i + 1}`} aria-label={`piece ${i + 1}`} />
        ))}
      </nav>
    <BankNav />
    </article>
  );
}
