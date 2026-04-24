import Link from "next/link";
import type { Metadata } from "next";
import LaunchTrailer from "@/components/LaunchTrailer";
import Masthead from "@/components/Masthead";
import LedgerColumn from "@/components/LedgerColumn";
import ArtContactSheet from "@/components/ArtContactSheet";
import { HUNT_PHONE_TEL, HUNT_PHONE_DISPLAY } from "@/lib/hunt";
import { getLivePortfolio, fmtMoney } from "@/lib/portfolio-live";
import { SONGS, youtubeSearchLink } from "@/lib/song-links";
import portfolio from "@/data/portfolio.json";

/* ────────────────────────────────────────────────────────────
   / — aureliex cover, v2 · cercato / midnight-dreamer.
   the cover is one painting: dark night, a tower of illuminated
   windows (the live ledger), a warm sunset on the horizon with a
   sun, a silhouette of mountains, the wager written into the sky.
   below: method, art contact sheet, single archive door, footer.
   everything else moved to /archive.
   ──────────────────────────────────────────────────────────── */

const EXTERNAL_TOTAL = 50;
const EXTERNAL_BOOK_AT_ENTRY = 3690.67;

const HOLDINGS = (portfolio as {
  holdings: Array<{ ticker: string; shares: number; entry_value: number }>;
}).holdings.map((h) => ({ ticker: h.ticker, shares: h.shares, entry_value: h.entry_value }));

const PENDING_CASH = (portfolio as { pending_cash: number }).pending_cash;

function smsInvest(book: "stock" | "art" | "prediction"): string {
  const label =
    book === "stock" ? "stock book (main)" :
    book === "art"   ? "art portfolio (10% sidecar)" :
                       "prediction-market book (10% sidecar)";
  const body = [
    `invest · ${label}`,
    `amount · $[how much]`,
    `name on ledger · [your name]`,
    "",
    "— via aureliex.com",
  ].join("\n");
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
    `$3,453 → $100,000 by my birthday. live ledger + one wager, kept in public. ${live} now (${delta} vs baseline).`;
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

/* painted sunset sky — mirrors Cercato's warm horizon against a
   deep-navy night.  simple SVG so it renders instantly and scales
   cleanly.  rendered behind the wager text with pointer-events off. */
function SunsetSky() {
  return (
    <svg
      className="h2-sky-svg"
      viewBox="0 0 400 600"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="h2-sky-grad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%"  stopColor="#0A0F1A" />
          <stop offset="38%" stopColor="#1A1230" />
          <stop offset="62%" stopColor="#3A2640" />
          <stop offset="82%" stopColor="#C44325" />
          <stop offset="100%" stopColor="#F5B740" />
        </linearGradient>
        <radialGradient id="h2-sun-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="#FFD27A" stopOpacity="1" />
          <stop offset="55%" stopColor="#F5B740" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#F5B740" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="h2-water" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%"  stopColor="#0A0F1A" />
          <stop offset="100%" stopColor="#050810" />
        </linearGradient>
      </defs>

      {/* the sky */}
      <rect width="400" height="600" fill="url(#h2-sky-grad)" />

      {/* sun halo + disc */}
      <circle cx="300" cy="400" r="120" fill="url(#h2-sun-glow)" />
      <circle cx="300" cy="400" r="34" fill="#FFD27A" />
      <circle cx="300" cy="400" r="34" fill="#F5B740" opacity="0.55" />

      {/* the moon — tiny, upper-left */}
      <circle cx="70" cy="70" r="4" fill="#EDE4D1" opacity="0.85" />

      {/* stars */}
      <circle cx="40"  cy="110" r="0.9" fill="#EDE4D1" opacity="0.7" />
      <circle cx="130" cy="40"  r="0.7" fill="#EDE4D1" opacity="0.55" />
      <circle cx="180" cy="90"  r="0.8" fill="#EDE4D1" opacity="0.5" />
      <circle cx="230" cy="30"  r="0.7" fill="#EDE4D1" opacity="0.6" />
      <circle cx="340" cy="60"  r="0.9" fill="#EDE4D1" opacity="0.65" />
      <circle cx="90"  cy="180" r="0.6" fill="#EDE4D1" opacity="0.45" />

      {/* mountain silhouette — a dark diagonal ridge along the horizon */}
      <path
        d="M0 430 L45 395 L95 418 L150 380 L210 410 L270 384 L330 415 L400 395 L400 600 L0 600 Z"
        fill="#0A0F1A"
      />
      {/* foreground ridge — slightly warmer, overlapping */}
      <path
        d="M0 470 L60 450 L130 468 L200 445 L280 465 L360 448 L400 460 L400 600 L0 600 Z"
        fill="#050810"
      />

      {/* water + sun reflection shimmer */}
      <rect x="0" y="470" width="400" height="130" fill="url(#h2-water)" />
      <path
        d="M290 480 L310 480 L305 600 L295 600 Z"
        fill="#F5B740"
        opacity="0.35"
      />
      <path
        d="M296 495 L304 495 L301 600 L299 600 Z"
        fill="#FFD27A"
        opacity="0.55"
      />
    </svg>
  );
}

export default async function HomePage() {
  const lp = await getLivePortfolio();

  // allocation rule widths — 80% owned / external scaled / 10% art / 10% pred
  const current = lp.value;
  const owned = current * 0.8;
  const externalNow = EXTERNAL_TOTAL * (current / EXTERNAL_BOOK_AT_ENTRY);
  const art = current * 0.1;
  const pred = current * 0.1;
  const allocTotal = owned + externalNow + art + pred;
  const pct = (n: number) => (allocTotal > 0 ? (n / allocTotal) * 100 : 0);

  return (
    <main className="home-v2">
      <Masthead />

      <LaunchTrailer liveValue={lp.value} baseline={lp.baseline} />

      {/* ── THE PANEL — the tower + the sunset + the wager ────── */}
      <section className="h2-panel" id="after-hero" aria-label="the cover · one painting">
        <div className="h2-panel-inner">
          <LedgerColumn holdings={HOLDINGS} pendingCash={PENDING_CASH} baseline={lp.baseline} />

          <div className="h2-sky">
            <SunsetSky />
            <div className="h2-sky-content">
              <div className="h2-sky-eye">// the wager · round 0 · live</div>
              <div>
                <p className="h2-wager-line">
                  $3,453<span className="h2-wager-arrow">→</span><em>$100,000</em>
                </p>
                <div className="h2-wager-date">21 june 2026 · my birthday</div>
              </div>
              <div className="h2-manifesto">
                <p>the counter culture is here.</p>
                <p>you can&rsquo;t stop it if you tried.</p>
                <p>the best you can do is watch.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── METHOD ── */}
      <section className="h2-method" aria-label="the method">
        <div className="h2-method-eye">// how the stake is split · four ways in</div>

        <div className="h2-alloc-labels">
          <span><b>owned</b><span>{pct(owned).toFixed(0)}%</span></span>
          <span><b>external</b><span>{pct(externalNow).toFixed(1)}%</span></span>
          <span><b>art</b><span>{pct(art).toFixed(0)}%</span></span>
          <span><b>prediction</b><span>{pct(pred).toFixed(0)}%</span></span>
        </div>
        <div className="h2-alloc-rule" aria-hidden="true">
          <span className="h2-alloc-seg-owned" style={{ width: `${pct(owned)}%` }} />
          <span className="h2-alloc-seg-ext"   style={{ width: `${pct(externalNow)}%` }} />
          <span className="h2-alloc-seg-art"   style={{ width: `${pct(art)}%` }} />
          <span className="h2-alloc-seg-pred"  style={{ width: `${pct(pred)}%` }} />
        </div>
        <div className="h2-alloc-total">
          <span>total stake</span>
          <span><b>{fmtMoney(allocTotal)}</b></span>
        </div>

        <div className="h2-invest" role="group" aria-label="invest · four ways">
          <a className="h2-invest-chip" href={smsInvest("stock")} aria-label={`invest in the stock book via text to ${HUNT_PHONE_DISPLAY}`}>
            <span className="h2-invest-chip-k">stock book</span>
            <span className="h2-invest-chip-v">invest · text</span>
          </a>
          <a className="h2-invest-chip" href={smsInvest("art")}>
            <span className="h2-invest-chip-k">art portfolio</span>
            <span className="h2-invest-chip-v">invest · text</span>
          </a>
          <a className="h2-invest-chip" href={smsInvest("prediction")}>
            <span className="h2-invest-chip-k">prediction book</span>
            <span className="h2-invest-chip-v">invest · text</span>
          </a>
          <Link href="/6969#hunt" className="h2-invest-chip h2-invest-chip-hunt">
            <span className="h2-invest-chip-k">the hunt</span>
            <span className="h2-invest-chip-v">mine · free</span>
          </Link>
        </div>

        <div className="h2-rights" aria-label="what a stake carries">
          <div className="h2-rights-item">
            <span className="h2-rights-k">birthday party</span>
            <span className="h2-rights-v">invite · stake-holders + 1 · free</span>
          </div>
          <div className="h2-rights-item">
            <span className="h2-rights-k">round 1 vote</span>
            <span className="h2-rights-v">theme · panel · sidecar splits</span>
          </div>
          <div className="h2-rights-item">
            <span className="h2-rights-k">reimbursable</span>
            <span className="h2-rights-v">research · tools · travel · by text</span>
          </div>
        </div>
      </section>

      {/* ── ART · CONTACT SHEET ── */}
      <ArtContactSheet />

      {/* ── ARCHIVE — single door ── */}
      <section className="h2-archive" aria-label="the archive">
        <Link href="/archive" className="h2-archive-link">the rest of the magazine ↗</Link>
        <span className="h2-archive-sub">coda · bookends · tyler · apparatus · bets · pink reprise</span>
      </section>

      {/* ── FOOTER ── */}
      <footer className="h2-footer">
        <span>soundtrack</span>
        <a href={youtubeSearchLink(SONGS.a_lot)} target="_blank" rel="noopener noreferrer">a lot</a>
        <a href={youtubeSearchLink(SONGS.just_like_me)} target="_blank" rel="noopener noreferrer">just like me</a>
        <a href={youtubeSearchLink(SONGS.ibiza)} target="_blank" rel="noopener noreferrer">ibiza</a>
        <span className="h2-footer-sep" aria-hidden="true" />
        <Link href="/argument">argument</Link>
        <Link href="/positions">positions</Link>
        <Link href="/green-credit">green credit</Link>
        <Link href="/6969">6969</Link>
        <span className="h2-footer-sep" aria-hidden="true" />
        <span>aureliex · issue #001 · round 0</span>
      </footer>
    </main>
  );
}
