import Link from "next/link";
import type { Metadata } from "next";
import LaunchTrailer from "@/components/LaunchTrailer";
import Masthead from "@/components/Masthead";
import LedgerColumn from "@/components/LedgerColumn";
import { HUNT_PHONE_TEL } from "@/lib/hunt";
import { getLivePortfolio, fmtMoney } from "@/lib/portfolio-live";
import portfolio from "@/data/portfolio.json";

/* ────────────────────────────────────────────────────────────
   / — aureliex cover · one painting.
   the architecture of micro-worlds — a tower of illuminated
   windows at sunset — is the entire artistic choice.  the rest
   of the page holds back and lets the world speak.  method /
   art / bets / apparatus all live at /archive.
   ──────────────────────────────────────────────────────────── */

const HOLDINGS = (portfolio as {
  holdings: Array<{ ticker: string; shares: number; entry_value: number }>;
}).holdings.map((h) => ({ ticker: h.ticker, shares: h.shares, entry_value: h.entry_value }));

const PENDING_CASH = (portfolio as { pending_cash: number }).pending_cash;

function smsInvest(): string {
  const body = "invest · aureliex · amount $[how much] · name [your name]";
  const num = HUNT_PHONE_TEL.replace(/^tel:/, "");
  return `sms:${num}?&body=${encodeURIComponent(body)}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const lp = await getLivePortfolio();
  const live = fmtMoney(lp.value);
  const delta = lp.up
    ? `+${fmtMoney(Math.abs(lp.delta))} (+${Math.abs(lp.pct).toFixed(1)}%)`
    : `−${fmtMoney(Math.abs(lp.delta))} (−${Math.abs(lp.pct).toFixed(1)}%)`;
  const title = `aureliex · ${live} → $100,000 by 21 jun`;
  const description =
    `a tower of micro-worlds at sunset. $3,453 → $100,000 by my birthday. live ledger kept in public. ${live} now (${delta} vs baseline).`;
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

/* the sunset · quieter now.  backdrop for the architecture, not
   the subject.  three-stop sky, a heavy sun, a single mountain
   ridge, a short reflection in the water.  done. */
function SunsetBackdrop() {
  return (
    <svg
      className="h2-sky-svg"
      viewBox="0 0 400 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="h2-sky-grad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%"   stopColor="#050814" />
          <stop offset="42%"  stopColor="#1C1230" />
          <stop offset="68%"  stopColor="#6B1D32" />
          <stop offset="84%"  stopColor="#D2491C" />
          <stop offset="100%" stopColor="#F5B740" />
        </linearGradient>
        <radialGradient id="h2-sun-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="#FFE4A6" stopOpacity="0.9" />
          <stop offset="55%" stopColor="#F5B740" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#F5B740" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="h2-water" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%"  stopColor="#0A1120" />
          <stop offset="100%" stopColor="#020410" />
        </linearGradient>
      </defs>

      <rect width="400" height="800" fill="url(#h2-sky-grad)" />

      {/* single cloud band warmed by the horizon */}
      <ellipse cx="180" cy="540" rx="280" ry="5" fill="#8A2A30" opacity="0.5" />

      {/* sun + halo */}
      <circle cx="300" cy="560" r="150" fill="url(#h2-sun-halo)" />
      <circle cx="300" cy="560" r="40"  fill="#FFD27A" />

      {/* one mountain ridge */}
      <path d="M0 630 L60 608 L140 625 L220 595 L300 615 L400 600 L400 700 L0 700 Z" fill="#04060F" />

      {/* water + short reflection */}
      <rect x="0" y="700" width="400" height="100" fill="url(#h2-water)" />
      <path d="M282 700 L318 700 L312 800 L288 800 Z" fill="#F5B740" opacity="0.3" />
      <path d="M294 700 L306 700 L303 800 L297 800 Z" fill="#FFE4A6" opacity="0.6" />
    </svg>
  );
}

export default async function HomePage() {
  const lp = await getLivePortfolio();

  return (
    <main className="home-v2">
      <Masthead />

      <LaunchTrailer liveValue={lp.value} baseline={lp.baseline} />

      {/* ── THE PAINTING — the only artistic choice on the page.
             the architecture of micro-worlds sits against a quiet sunset.
             everything else lives at /archive. */}
      <section className="h2-painting" id="after-hero" aria-label="the cover · one painting">
        <SunsetBackdrop />

        {/* wager · sits in the sky, dominant */}
        <div className="h2-wager-block">
          <p className="h2-wager-line">
            $3,453<span className="h2-wager-arrow">→</span><em>$100,000</em>
          </p>
          <div className="h2-wager-date">21 june 2026 · my birthday</div>
        </div>

        {/* the city · full width at the base · tap a building to zoom in */}
        <div className="h2-city">
          <LedgerColumn holdings={HOLDINGS} pendingCash={PENDING_CASH} baseline={lp.baseline} />
        </div>

        {/* one-line caption · the closing sentence from the trailer */}
        <p className="h2-caption"><em>the best you can do is watch.</em></p>
      </section>

      <footer className="h2-footer">
        <span>aureliex · issue #001 · round 0</span>
        <span className="h2-footer-sep" aria-hidden="true" />
        <Link href="/positions">positions</Link>
        <Link href="/argument">argument</Link>
        <Link href="/green-credit">green credit</Link>
      </footer>
    </main>
  );
}
