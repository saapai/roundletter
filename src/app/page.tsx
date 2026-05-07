import Link from "next/link";
import type { Metadata } from "next";
import LiveStrip from "@/components/LiveStrip";
import { fmtMoney } from "@/lib/portfolio-live";
import { getPortfolioData } from "@/lib/portfolio-aggregate";
import portfolio from "@/data/portfolio.json";
import sealed from "@/data/sealed/impossible.json";
import stakeLedger from "@/data/stake-ledger.json";

const HOLDINGS = (portfolio as {
  holdings: Array<{ ticker: string; shares: number; entry_value: number }>;
}).holdings.map((h) => ({ ticker: h.ticker, shares: h.shares, entry_value: h.entry_value }));

const PENDING_CASH = (portfolio as { pending_cash: number }).pending_cash;

const BIRTHDAY_ISO = "2026-06-21T00:00:00-07:00";
const ROUND_START_ISO = "2026-04-12T00:00:00-04:00";

function daysBetween(a: string, b: string): number {
  return Math.max(0, Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000));
}
function daysFromNowTo(iso: string): number {
  return Math.max(0, Math.ceil((Date.parse(iso) - Date.now()) / 86_400_000));
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getPortfolioData();
  const total = data.total;
  const baseline = data.baseline;
  const dRaw = total - baseline;
  const pRaw = baseline > 0 ? (dRaw / baseline) * 100 : 0;
  const live = fmtMoney(total);
  const delta = dRaw >= 0
    ? `+${fmtMoney(Math.abs(dRaw))} (+${Math.abs(pRaw).toFixed(1)}%)`
    : `−${fmtMoney(Math.abs(dRaw))} (−${Math.abs(pRaw).toFixed(1)}%)`;
  return {
    title: `aureliex · ${live} → $100,000 by 21 jun`,
    description: `a publicly-owned studio. green credit, redeemable in 60s. ${live} now (${delta}).`,
    openGraph: {
      title: `aureliex · now at ${live}.`,
      description: `a publicly-owned studio. green credit, redeemable in 60 seconds via Venmo or Zelle. personally guaranteed by saapai.`,
      url: "https://aureliex.com",
      siteName: "aureliex",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `aureliex · now at ${live}.`,
      description: `green credit, redeemable in 60s. ${live} now (${delta}).`,
      creator: "@saapai",
    },
  };
}

export default async function HomePage() {
  const data = await getPortfolioData();
  const totalNow = data.total;
  const daysToBirthday = daysFromNowTo(BIRTHDAY_ISO);
  const hashShort = sealed.commitment_sha256.slice(0, 8);
  const stakesOutstanding = (stakeLedger.total_outstanding_cents / 100).toFixed(0);
  const eggEquity = (stakeLedger.egg_equity_cents / 100).toFixed(0);

  return (
    <main className="home-v3">

      {/* ═══════════════════════════════════════════════════════════
          § 1 · THE COVER
          ═══════════════════════════════════════════════════════════ */}
      <section className="cov" aria-label="the cover">
        <div className="cov-img">
          <img
            src="/hero/cover.jpg"
            alt="yoshida hiroshi · kagurazaka street after a night rain · 1929"
          />
          <span className="cov-mark" aria-hidden="true">aureliex</span>
        </div>

        <div className="cov-head">
          <p className="cov-wager">
            $3,453<span className="cov-arrow">→</span>$100,000
          </p>
          <p className="cov-progress">
            <span className="cov-progress-now">{fmtMoney(totalNow)} now</span>
            <span className="cov-progress-meta">T−{daysToBirthday} days</span>
          </p>
          {/* sealed badge */}
          <p className="cov-seal-badge">
            sealed · reveal 21 jun · {hashShort}···
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          § 2 · THE STUDIO LINE
          ═══════════════════════════════════════════════════════════ */}
      <section className="studio-line" aria-label="the studio">
        <div className="studio-line-inner">
          <p className="studio-line-thesis">
            aureliex is a publicly-owned studio.
          </p>
          <p className="studio-line-product">
            the product is green credit —<br />
            redeemable on demand.
          </p>
          <p className="studio-line-guarantee">
            personally guaranteed by saapai.<br />
            sixty seconds. Venmo or Zelle.
          </p>
          <div className="studio-line-ctas">
            <Link href="/buy" className="studio-cta studio-cta-primary">
              $10 to start →
            </Link>
            <Link href="/green-credit" className="studio-cta studio-cta-secondary">
              how it works · /green-credit
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          § 3 · THE FIVE ROOMS
          ═══════════════════════════════════════════════════════════ */}
      <nav className="rooms" aria-label="rooms">
        <Link href="/art" className="room room--art">
          <span className="room-name">art</span>
          <span className="room-meta">one piece to auction · floor $100</span>
        </Link>
        <Link href="/prediction" className="room room--prediction">
          <span className="room-name">prediction</span>
          <span className="room-meta">kalshi + polymarket · live</span>
        </Link>
        <Link href="/stocks" className="room room--investments">
          <span className="room-name">investments</span>
          <span className="room-meta">10 positions · daily marks</span>
        </Link>
        <Link href="/panel" className="room room--panel">
          <span className="room-name">the panel</span>
          <span className="room-meta">five-agent AI debate · public</span>
        </Link>
        <Link href="/letters/round-1" className="room room--letter">
          <span className="room-name">the letter</span>
          <span className="room-meta">round 1 · the announcement</span>
        </Link>
      </nav>

      {/* ═══════════════════════════════════════════════════════════
          § 4 · THE CAP TABLE STRIP
          ═══════════════════════════════════════════════════════════ */}
      <section className="cap-strip" aria-label="the cap table">
        <div className="cap-strip-row">
          <div className="cap-strip-item">
            <span className="cap-strip-label">apparatus</span>
            <span className="cap-strip-value">{fmtMoney(totalNow)}</span>
          </div>
          <span className="cap-strip-pipe" aria-hidden="true">|</span>
          <div className="cap-strip-item">
            <span className="cap-strip-label">stakes</span>
            <span className="cap-strip-value">${stakesOutstanding}</span>
          </div>
          <span className="cap-strip-pipe" aria-hidden="true">|</span>
          <div className="cap-strip-item cap-strip-eggs">
            <span className="cap-strip-label">hunt eggs paid</span>
            <span className="cap-strip-value">${eggEquity}</span>
          </div>
          <span className="cap-strip-pipe" aria-hidden="true">|</span>
          <div className="cap-strip-item">
            <span className="cap-strip-label">T−</span>
            <span className="cap-strip-value">{daysToBirthday}d</span>
          </div>
        </div>
        <div className="cap-strip-links">
          <Link href="/buy">the door is open · /buy</Link>
          <Link href="/studio">the ledger is public · /studio</Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          § 5 · THE LIVE TICKER
          ═══════════════════════════════════════════════════════════ */}
      <LiveStrip holdings={HOLDINGS} pendingCash={PENDING_CASH} baseline={data.baseline} />

      {/* ═══════════════════════════════════════════════════════════
          § 6 · THE SEAL · THE PARTY · THE LETTER
          ═══════════════════════════════════════════════════════════ */}
      <section className="seal-section" aria-label="the seal">
        <p className="seal-title">sealed · 5 claims · revealing 21 jun 18:00 PT</p>
        <p className="seal-hash">
          commitment {sealed.commitment_sha256.slice(0, 12)}············
        </p>
        <div className="seal-links">
          <Link href="/letters/round-1" className="seal-link">read the letter</Link>
          <Link href="/party" className="seal-link">the party</Link>
          <Link href="/sealed/impossible" className="seal-link">verify the seal</Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FOOTER · TOC
          ═══════════════════════════════════════════════════════════ */}
      <footer className="home-v3-footer">
        <nav className="home-v3-nav" aria-label="table of contents">
          <Link href="/art">art</Link>
          <Link href="/prediction">prediction</Link>
          <Link href="/stocks">investments</Link>
          <Link href="/panel">panel</Link>
          <Link href="/studio">studio</Link>
          <Link href="/eggs">archives</Link>
        </nav>
        <p className="home-v3-credit">
          cover · yoshida hiroshi · <em>kagurazaka street after a night rain</em> · 1929 · cleveland museum of art · cc0
        </p>
      </footer>
    </main>
  );
}
