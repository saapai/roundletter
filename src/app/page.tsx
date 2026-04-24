import Link from "next/link";
import type { Metadata } from "next";
import LaunchTrailer from "@/components/LaunchTrailer";
import Masthead from "@/components/Masthead";
import LiveStrip from "@/components/LiveStrip";
import { getLivePortfolio, fmtMoney } from "@/lib/portfolio-live";
import portfolio from "@/data/portfolio.json";

/* ────────────────────────────────────────────────────────────
   / — aureliex cover · magazine-cover layout.
   the hero is one illustration file at /public/hero/cover.jpg
   (fallback: /public/hero/cover.svg — a procedural approximation).
   the wager is embedded on top, the live-strip runs below as a
   single narrow line.  everything else lives at /archive.

   to replace the cover image: drop a file at
     public/hero/cover.jpg  (preferred · 1600×1000 or similar 16:10)
   and the homepage uses it automatically.  the SVG fallback only
   renders if the JPG is missing.
   ──────────────────────────────────────────────────────────── */

const HOLDINGS = (portfolio as {
  holdings: Array<{ ticker: string; shares: number; entry_value: number }>;
}).holdings.map((h) => ({ ticker: h.ticker, shares: h.shares, entry_value: h.entry_value }));

const PENDING_CASH = (portfolio as { pending_cash: number }).pending_cash;

export async function generateMetadata(): Promise<Metadata> {
  const lp = await getLivePortfolio();
  const live = fmtMoney(lp.value);
  const delta = lp.up
    ? `+${fmtMoney(Math.abs(lp.delta))} (+${Math.abs(lp.pct).toFixed(1)}%)`
    : `−${fmtMoney(Math.abs(lp.delta))} (−${Math.abs(lp.pct).toFixed(1)}%)`;
  const title = `aureliex · ${live} → $100,000 by 21 jun`;
  const description =
    `$3,453 → $100,000 by my birthday. a live wager kept in public. ${live} now (${delta} vs baseline).`;
  return {
    title,
    description,
    openGraph: {
      title: `aureliex · now at ${live}.`,
      description,
      url: "https://aureliex.com",
      siteName: "aureliex",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `aureliex · now at ${live}.`,
      description,
      creator: "@saapai",
    },
  };
}

export default async function HomePage() {
  const lp = await getLivePortfolio();

  return (
    <main className="home-v2">
      <Masthead />

      <LaunchTrailer liveValue={lp.value} baseline={lp.baseline} />

      {/* ── THE COVER — a single illustration, title embedded.
             drop public/hero/cover.jpg to override the SVG fallback. */}
      <section className="h2-cover" id="after-hero" aria-label="the cover">
        <picture className="h2-cover-image">
          {/* prefer jpg if present, fall back to the procedural svg */}
          <source srcSet="/hero/cover.jpg" type="image/jpeg" />
          <img src="/hero/cover.svg" alt="aureliex · the wall at sunset" />
        </picture>
        <div className="h2-cover-shade" aria-hidden="true" />

        <div className="h2-cover-type">
          <p className="h2-cover-line">
            $3,453<span className="h2-cover-arrow">→</span><em>$100,000</em>
          </p>
          <div className="h2-cover-date">21 june 2026 · my birthday</div>
          <p className="h2-cover-caption"><em>the best you can do is watch.</em></p>
        </div>
      </section>

      {/* live-strip · a single narrow row of numbers below the cover,
          not pretending to be architecture.  the book, honest, thin. */}
      <LiveStrip holdings={HOLDINGS} pendingCash={PENDING_CASH} baseline={lp.baseline} />

      <footer className="h2-footer">
        <span>aureliex · issue #001 · round 0</span>
        <span className="h2-footer-sep" aria-hidden="true" />
        <Link href="/positions">positions</Link>
        <Link href="/argument">argument</Link>
        <Link href="/green-credit">green credit</Link>
        <Link href="/archive">archive</Link>
      </footer>
    </main>
  );
}
