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
      {/* ── THE COVER · stripped to four elements
             · the painting (with cursive signature in the corner = wordmark)
             · the wager headline
             · the live progress sub-line
             everything else moved off the cover.                           */}
      <section className="cov" aria-label="the cover">
        <div className="cov-img">
          <img src="/hero/cover.jpg" alt="yoshida hiroshi · kagurazaka street after a night rain · 1929" />
          <span className="cov-mark" aria-hidden="true">aureliex</span>
        </div>

        <div className="cov-head">
          <p className="cov-wager">
            $3,453<span className="cov-arrow">→</span>$100,000
          </p>
          <p className="cov-progress">
            <span className="cov-progress-now">{fmtMoney(lp.value)} now</span>
            <span className="cov-progress-meta">T−{daysToBirthday} days</span>
          </p>
        </div>
      </section>

      {/* ── LIVE STRIP — one narrow row of numbers below the cover ── */}
      <LiveStrip holdings={HOLDINGS} pendingCash={PENDING_CASH} baseline={lp.baseline} />

      {/* ── BIG ROOMS — chunky entry tiles into each room of the bank.
            each subroute will carry its own visual register (dark / parchment
            / warm / electric).  desktop: 5-up; mobile: 2-up snap-grid.       */}
      {/*
        Rooms — reordered per CR3 critique: lead with ART (the most
        distinctive, event-driven room), then PREDICTION (live, real
        money), INVESTMENTS (baseline), ARTICLE (the why). Eyebrow
        numbers dropped (CR3). Archives demoted to footer text link.
      */}
      <nav className="rooms" aria-label="rooms">
        <Link href="/portfolio/art" className="room room--art">
          <span className="room-name">art</span>
          <span className="room-meta">12 pieces · auction · round 1</span>
        </Link>
        <Link href="/portfolio/prediction" className="room room--prediction">
          <span className="room-name">prediction</span>
          <span className="room-meta">kalshi + poly · live</span>
        </Link>
        <Link href="/portfolio/personal" className="room room--investments">
          <span className="room-name">investments</span>
          <span className="room-meta">10 positions · daily marks</span>
        </Link>
        <Link href="/letters/round-0" className="room room--articles">
          <span className="room-name">round 0</span>
          <span className="room-meta">the article</span>
        </Link>
      </nav>

      <p className="rooms-foot">
        <Link href="/portfolio">/ portfolio overview</Link>
        {" · "}
        <Link href="/archives">archives ↗</Link>
      </p>
    </main>
  );
}
