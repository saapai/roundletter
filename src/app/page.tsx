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
   / — aureliex cover, v2 · cercato / midnight-dreamer revamp.
   one compositional spine (the live ledger, the dense monolith)
   anchored against a wager poster + a three-line manifesto (the
   sky). below that: method rule, art contact sheet, single archive
   door, footer. everything else moved to /archive.
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

export default async function HomePage() {
  const lp = await getLivePortfolio();

  // allocation rule widths (same model as the old AllocationBar: 80% owned,
  // external scaled to its share of the book, 10% art, 10% prediction).
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

      {/* the film — arrival, unchanged. audio stays off by default. */}
      <LaunchTrailer liveValue={lp.value} baseline={lp.baseline} />

      {/* ── the spine + the wager — the centerpiece ─────────────── */}
      <section className="h2-spine-wager" id="after-hero" aria-label="the wager">
        <LedgerColumn holdings={HOLDINGS} pendingCash={PENDING_CASH} baseline={lp.baseline} />

        <div className="h2-wager">
          <div className="h2-wager-eye">// the wager · round 0 · live</div>
          <p className="h2-wager-line">
            $3,453<span className="h2-wager-arrow">→</span><em>$100,000</em>
          </p>
          <div className="h2-wager-date">21 june 2026 · my birthday</div>
          <div className="h2-manifesto">
            <p>the counter culture is here.</p>
            <p>you can&rsquo;t stop it if you tried.</p>
            <p>the best you can do is watch.</p>
          </div>
        </div>
      </section>

      {/* ── the method — allocation rule + invest chips + rights ─── */}
      <section className="h2-method" aria-label="the method">
        <div className="h2-method-eye">// how the stake is split · four ways in</div>

        <div className="h2-alloc-labels">
          <span><b>owned</b><span>{pct(owned).toFixed(0)}%</span></span>
          <span><b>external</b><span>{pct(externalNow).toFixed(1)}%</span></span>
          <span><b>art</b><span>{pct(art).toFixed(0)}%</span></span>
          <span><b>prediction</b><span>{pct(pred).toFixed(0)}%</span></span>
        </div>
        <div className="h2-alloc-rule" aria-hidden="true">
          <span className="h2-alloc-seg h2-alloc-seg-owned" style={{ width: `${pct(owned)}%` }} />
          <span className="h2-alloc-seg h2-alloc-seg-ext"   style={{ width: `${pct(externalNow)}%` }} />
          <span className="h2-alloc-seg h2-alloc-seg-art"   style={{ width: `${pct(art)}%` }} />
          <span className="h2-alloc-seg h2-alloc-seg-pred"  style={{ width: `${pct(pred)}%` }} />
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

      {/* ── the art · contact sheet · six of fourteen ───────────── */}
      <ArtContactSheet />

      {/* ── the archive · single door to everything below the cover ─ */}
      <section className="h2-archive" aria-label="the archive">
        <Link href="/archive" className="h2-archive-link">the rest of the magazine ↗</Link>
        <span className="h2-archive-sub">coda · bookends · tyler · apparatus · bets · pink reprise</span>
      </section>

      {/* ── footer · soundtrack, contact, hairline ──────────────── */}
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
