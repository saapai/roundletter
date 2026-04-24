import Link from "next/link";
import type { Metadata } from "next";
import LiveStrip from "@/components/LiveStrip";
import { getLivePortfolio, fmtMoney } from "@/lib/portfolio-live";
import portfolio from "@/data/portfolio.json";

/* ────────────────────────────────────────────────────────────
   / — aureliex cover · editorial magazine-cover direction.
   one full-bleed image + one confident headline + a bit of
   metadata in the corners.  no chrome around it.  the trailer
   moves to /archive; the live-ticker lives one scroll below.

   to replace the cover image: drop a file at
     public/hero/cover.jpg      (preferred · ≥1600×1000, 16:10)
   or
     public/hero/cover.webp
   and the homepage uses it automatically.  an SVG procedural
   placeholder at public/hero/cover.svg renders until a real
   file lands.
   ──────────────────────────────────────────────────────────── */

const HOLDINGS = (portfolio as {
  holdings: Array<{ ticker: string; shares: number; entry_value: number }>;
}).holdings.map((h) => ({ ticker: h.ticker, shares: h.shares, entry_value: h.entry_value }));

const PENDING_CASH = (portfolio as { pending_cash: number }).pending_cash;

const BIRTHDAY_ISO = "2026-06-21T00:00:00-07:00";
const ROUND_START_ISO = "2026-04-12T00:00:00-04:00";

function daysBetween(aIso: string, bIso: string): number {
  const a = Date.parse(aIso);
  const b = Date.parse(bIso);
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

function daysFromNowTo(iso: string): number {
  const target = Date.parse(iso);
  return Math.max(0, Math.ceil((target - Date.now()) / 86_400_000));
}

export async function generateMetadata(): Promise<Metadata> {
  const lp = await getLivePortfolio();
  const live = fmtMoney(lp.value);
  const delta = lp.up
    ? `+${fmtMoney(Math.abs(lp.delta))} (+${Math.abs(lp.pct).toFixed(1)}%)`
    : `−${fmtMoney(Math.abs(lp.delta))} (−${Math.abs(lp.pct).toFixed(1)}%)`;
  const title = `aureliex · ${live} → $100,000 by 21 jun`;
  const description =
    `a public portfolio from $3,453 to $100,000 by 21 june 2026. ${live} now (${delta} vs baseline).`;
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

  const roundStart = ROUND_START_ISO;
  const today = new Date().toISOString();
  const dayOfRound = daysBetween(roundStart, today);
  const daysToBirthday = daysFromNowTo(BIRTHDAY_ISO);
  const totalDays = daysBetween(roundStart, BIRTHDAY_ISO);

  return (
    <main className="home-v3">
      {/* ── THE COVER — full-bleed image, magazine-cover typography ── */}
      <section className="cov" aria-label="the cover">
        <div className="cov-img">
          <img src="/hero/cover.jpg" alt="yoshida hiroshi · kagurazaka street after a night rain · 1929" />
        </div>

        {/* readability shades — kept minimal so the image leads */}
        <div className="cov-shade-top" aria-hidden="true" />
        <div className="cov-shade-bot" aria-hidden="true" />

        {/* top-left: masthead · top-right: archive link */}
        <header className="cov-mast">
          <div className="cov-mast-l">
            <span className="cov-wordmark">AURELIEX</span>
            <span className="cov-issue">
              · issue 03 · day {dayOfRound}/{totalDays} · T−{daysToBirthday}
            </span>
          </div>
          <nav className="cov-mast-r">
            <Link href="/archive" className="cov-mast-link">archive ↗</Link>
          </nav>
        </header>

        {/* bottom-left: the headline — the wager itself */}
        <div className="cov-head">
          <p className="cov-wager">
            $3,453<span className="cov-arrow">→</span>$100,000
          </p>
          <p className="cov-dek">
            five agents · one sealed book · every trade public until 21 june.
          </p>
        </div>

        {/* bottom-right: the caption */}
        <p className="cov-caption"><em>the best you can do is watch.</em></p>
      </section>

      {/* ── LIVE STRIP — one narrow row of numbers below the cover ── */}
      <LiveStrip holdings={HOLDINGS} pendingCash={PENDING_CASH} baseline={lp.baseline} />

      {/* ── FOOTER — one line, hairline, trailer link as opt-in ── */}
      <footer className="home-v3-footer">
        <span>aureliex · issue 03 · round 0</span>
        <span className="home-v3-sep" aria-hidden="true" />
        <Link href="/archive#trailer" className="home-v3-trailer">▶ the trailer</Link>
        <Link href="/positions">positions</Link>
        <Link href="/argument">argument</Link>
        <Link href="/green-credit">green credit</Link>
        <Link href="/archive">archive</Link>
      </footer>
      <div className="home-v3-credit">
        cover · yoshida hiroshi · <em>twelve scenes of tokyo: kagurazaka street after a night rain</em>, after 1929 · cleveland museum of art · bequest of john bonebrake · CC0
      </div>
    </main>
  );
}
