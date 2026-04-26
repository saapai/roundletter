import BankNav from "@/components/BankNav";
import type { Metadata } from "next";
import CountUp from "@/components/CountUp";
import EventCard, { humanizeKalshiTicker } from "@/components/EventCard";
import PredictionMarquee, { type MarqueeItem } from "@/components/PredictionMarquee";
import LedgerDrawer from "@/components/LedgerDrawer";
import { getPortfolioData, type SeriesPoint } from "@/lib/portfolio-aggregate";
import {
  getLatestKalshiSnapshot,
  getLatestPolymarketSnapshot,
  type KalshiFill,
  type PolymarketPosition,
} from "@/lib/snapshots";
import predictionRaw from "@/data/prediction.json";

// /prediction — live-first. Two distinct books (Kalshi + Polymarket)
// rendered as the entire viewport content. The historical chart and
// the closed-lines log live behind a `the ledger ↗` chip in the
// masthead, opening a slide-up drawer (LedgerDrawer.tsx).
//
// Visual distinction is done with discrete glyphs, not a hue blend:
//   ●  solid bone  → kalshi (the live book)
//   ○  ring        → polymarket (the bot)
// Allocation hairline below the masthead total uses the same ink at
// two opacities — same paint, two values — to read as one book in
// two rooms instead of two unrelated dashboards.
//
// Page revalidates every 60s so fresh snapshot files surface without
// a redeploy.

export const dynamic = "force-dynamic";
export const revalidate = 60;

const POLYMARKET_BANKROLL_FALLBACK = (predictionRaw as { polymarket_bankroll?: number })
  .polymarket_bankroll ?? 0;

export async function generateMetadata(): Promise<Metadata> {
  const data = await getPortfolioData();
  const v = `$${Math.round(data.categories.prediction.current_value).toLocaleString("en-US")}`;
  const desc = `the book · ${v} · kalshi sports + polymarket bot · live positions, one ledger.`;
  return {
    title: `aureliex · the book · ${v}`,
    description: desc,
    openGraph: { title: `the book · ${v}`, description: desc, type: "article" },
    twitter: { card: "summary_large_image", title: `the book · ${v}`, description: desc, creator: "@saapai" },
  };
}

function fmtMoney(n: number, decimals = 0): string {
  return `$${n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

function fmtMoney2(n: number): string {
  return fmtMoney(n, 2);
}

function relativeAgo(iso: string, nowMs = Date.now()): string {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "";
  const sec = Math.max(1, Math.round((nowMs - t) / 1000));
  if (sec < 60) return `${sec}s ago`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 48) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  return `${day}d ago`;
}

function fillToMarquee(f: KalshiFill, nowMs: number): MarqueeItem {
  const team = humanizeKalshiTicker(f.market_ticker || f.ticker);
  const priceStr = f.side === "yes" ? f.yes_price_dollars : f.no_price_dollars;
  const cents = priceStr ? Math.round(parseFloat(priceStr) * 100) : 0;
  const positive = f.action === "buy";
  const sign = positive ? "+" : "−";
  return {
    team,
    delta: `${sign}${cents}c`,
    positive,
    ago: relativeAgo(f.created_time, nowMs),
  };
}

function fmtUtc(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")} UTC`;
}

// Polymarket position rendering helpers ──────────────────────────────
function pmExposure(p: PolymarketPosition): number {
  if (typeof p.exposure_dollars === "number") return p.exposure_dollars;
  const sz = typeof p.size === "number" ? p.size : 0;
  const px = typeof p.current_price === "number" ? p.current_price : (p.avg_price ?? 0);
  return sz * px;
}

function pmCostBasis(p: PolymarketPosition): number {
  const sz = typeof p.size === "number" ? p.size : 0;
  const avg = typeof p.avg_price === "number" ? p.avg_price : 0;
  return sz * avg;
}

function pmShortMarket(market: string | undefined): string {
  if (!market) return "—";
  const clean = market.replace(/^.*\//, "").replace(/-/g, " ");
  return clean.length > 56 ? clean.slice(0, 53) + "…" : clean;
}

function fmtPriceCents(p: number | undefined): string {
  if (typeof p !== "number" || !Number.isFinite(p)) return "—";
  const cents = Math.round(p * 100);
  return `${cents}c`;
}

function pct(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.max(0, Math.min(100, (part / whole) * 100));
}

export default async function PredictionPage() {
  const [data, k, pm] = await Promise.all([
    getPortfolioData(),
    Promise.resolve(getLatestKalshiSnapshot()),
    Promise.resolve(getLatestPolymarketSnapshot()),
  ]);
  const cat = data.categories.prediction;

  // ── Kalshi numbers ─────────────────────────────────────────────────
  const kCash = k?.cash ?? 0;
  const kExposure = k?.portfolio_value ?? 0;
  const kTotal = k?.total ?? 0;
  const events = k?.event_positions ?? [];
  const markets = k?.market_positions ?? [];
  const openMarkets = markets.filter((m) => parseFloat(m.market_exposure_dollars) > 0);
  const tradedTotal = markets.reduce(
    (acc, m) => acc + parseFloat(m.total_traded_dollars || "0"),
    0,
  );
  const vigTotal = markets.reduce(
    (acc, m) => acc + parseFloat(m.fees_paid_dollars || "0"),
    0,
  );
  const fillsCount = k?.fills_count ?? 0;
  const linesCount = markets.length;
  const eventsCount = events.length;

  // Open vs closed events for live view + drawer
  const openEvents = events.filter((e) => parseFloat(e.event_exposure_dollars) > 0);

  // Realized P&L for the ledger drawer
  const realizedKalshi = events.reduce(
    (acc, e) => acc + parseFloat(e.realized_pnl_dollars || "0"),
    0,
  );
  const closedKalshi = markets
    .filter((m) => parseFloat(m.market_exposure_dollars) <= 0 && parseFloat(m.total_traded_dollars) > 0)
    .map((m) => ({
      ticker: humanizeKalshiTicker(m.ticker),
      realized: parseFloat(m.realized_pnl_dollars || "0"),
      traded: parseFloat(m.total_traded_dollars || "0"),
      fees: parseFloat(m.fees_paid_dollars || "0"),
    }))
    .sort((a, b) => a.realized - b.realized); // worst first — honesty

  // ── Polymarket numbers ────────────────────────────────────────────
  const pmPositions = pm?.positions ?? [];
  const pmOpen = pmPositions.filter((p) => Math.abs(p.size ?? 0) > 0);
  const pmExposureTotal = pmOpen.reduce((acc, p) => acc + pmExposure(p), 0);
  const pmCostTotal = pmOpen.reduce((acc, p) => acc + pmCostBasis(p), 0);
  const pmUnrealized = pmExposureTotal - pmCostTotal;
  void pmUnrealized;
  const pmBankroll = pm?.bankroll ?? POLYMARKET_BANKROLL_FALLBACK;
  const pmCash = Math.max(0, pmBankroll - pmExposureTotal);
  const pmHasLive = pm !== null;

  // Kalshi history series for the drawer chart (already sampled in
  // portfolio-aggregate.ts). Polymarket history empty until snapshots accrue.
  const kalshiSeries: SeriesPoint[] = cat.kalshi_history;
  const polymarketSeries: SeriesPoint[] = []; // future: cat.polymarket_history

  const total = Math.round(cat.current_value);
  const nowMs = Date.now();
  const marqueeItems: MarqueeItem[] = (k?.fills ?? [])
    .slice(0, 8)
    .map((f) => fillToMarquee(f, nowMs));

  const lastKalshiTickIso = k?.fills?.[0]?.created_time ?? k?.pulled_at ?? null;

  return (
    <article className="ticker-page bank-page bank-page--prediction" data-page="ticker">
      <header className="ticker-masthead">
        <div className="ticker-masthead-row">
          <div className="ticker-eyebrow">the book · live</div>
          <LedgerDrawer
            realized={realizedKalshi}
            closedKalshi={closedKalshi}
            closedPolymarket={[]}
            kalshiSeries={kalshiSeries}
            polymarketSeries={polymarketSeries}
          />
        </div>
        <div className="ticker-total" aria-label={`total ${fmtMoney(total)}`}>
          <CountUp to={total} prefix="$" />
        </div>
        <div className="ticker-meta">
          {eventsCount} events · {linesCount} lines · {fillsCount} fills · {fmtMoney(Math.round(tradedTotal))} traded · {fmtMoney(Math.round(vigTotal))} vig
        </div>

        {/* Allocation — hard-stop bar, same ink at two opacities. ●/○ legend */}
        <div className="ticker-alloc" aria-label="venue split">
          <div className="ticker-alloc-bar" role="img" aria-label="kalshi/polymarket split">
            <span
              className="ticker-alloc-seg ticker-alloc-seg--kalshi"
              style={{ width: `${pct(kTotal, kTotal + pmBankroll)}%` }}
            />
            <span
              className="ticker-alloc-seg ticker-alloc-seg--polymarket"
              style={{ width: `${pct(pmBankroll, kTotal + pmBankroll)}%` }}
            />
          </div>
          <div className="ticker-alloc-legend">
            <span className="ticker-alloc-leg-row">
              <span className="ticker-glyph ticker-glyph--solid" aria-hidden /> kalshi
              <span className="ticker-alloc-leg-amt">{fmtMoney(Math.round(kTotal))}</span>
            </span>
            <span className="ticker-alloc-leg-row">
              <span className="ticker-glyph ticker-glyph--ring" aria-hidden /> polymarket
              <span className="ticker-alloc-leg-amt">{fmtMoney(Math.round(pmBankroll))}</span>
            </span>
          </div>
        </div>
      </header>

      {/* ── KALSHI BOOK · live positions only ───────────────────────── */}
      <section className="ticker-book ticker-book--kalshi" aria-label="kalshi book">
        <header className="ticker-book-head">
          <div className="ticker-book-tag">
            <span className="ticker-glyph ticker-glyph--solid" aria-hidden /> kalshi · sports book
          </div>
          <div className="ticker-book-stat">
            <span className="ticker-book-stat-num">{fmtMoney2(kTotal)}</span>
            <span className="ticker-book-stat-sub">
              {fmtMoney2(kCash)} cash · {fmtMoney2(kExposure)} exposure · last fill {fmtUtc(lastKalshiTickIso)}
            </span>
          </div>
        </header>

        <div className="ticker-events">
          {openEvents.length > 0 ? (
            openEvents.map((e, i) => (
              <EventCard key={e.event_ticker} event={e} positions={openMarkets} index={i} />
            ))
          ) : (
            <p className="ticker-empty">
              no open kalshi positions right now — see <em>the ledger</em> for closed lines.
            </p>
          )}
        </div>
      </section>

      {/* ── POLYMARKET BOOK · live positions only ───────────────────── */}
      <section className="ticker-book ticker-book--polymarket" aria-label="polymarket book">
        <header className="ticker-book-head">
          <div className="ticker-book-tag">
            <span className="ticker-glyph ticker-glyph--ring" aria-hidden /> polymarket · bot
          </div>
          <div className="ticker-book-stat">
            <span className="ticker-book-stat-num">{fmtMoney2(pmBankroll)}</span>
            <span className="ticker-book-stat-sub">
              {fmtMoney2(pmCash)} usdc · {fmtMoney2(pmExposureTotal)} exposure
              {pmHasLive ? ` · last tick ${fmtUtc(pm?.pulled_at)}` : " · awaiting first snapshot"}
            </span>
          </div>
        </header>

        {pmOpen.length > 0 ? (
          <ul className="ticker-pm-list">
            {pmOpen.map((p, i) => {
              const exp = pmExposure(p);
              const cost = pmCostBasis(p);
              const pnl = exp - cost;
              const pnlSign = pnl > 0 ? "+" : pnl < 0 ? "−" : "·";
              const pnlCls =
                pnl > 0
                  ? "ticker-pm-pnl ticker-pm-pnl--up"
                  : pnl < 0
                  ? "ticker-pm-pnl ticker-pm-pnl--down"
                  : "ticker-pm-pnl ticker-pm-pnl--flat";
              const side = (p.outcome ?? "").toLowerCase() || "—";
              return (
                <li key={`${p.market}-${p.outcome}-${i}`} className="ticker-pm-row">
                  <div className="ticker-pm-meta">
                    <span className={`ticker-pm-side ticker-pm-side--${side}`}>{side}</span>
                    <span className="ticker-pm-market">{pmShortMarket(p.market)}</span>
                  </div>
                  <div className="ticker-pm-num">
                    <span className="ticker-pm-size">{(p.size ?? 0).toLocaleString("en-US")} sh</span>
                    <span className="ticker-pm-px">@ {fmtPriceCents(p.avg_price)}</span>
                  </div>
                  <div className="ticker-pm-val">
                    <span className="ticker-pm-exp">{fmtMoney2(exp)}</span>
                    <span className={pnlCls}>
                      {pnlSign}{fmtMoney2(Math.abs(pnl)).replace(/^[+−]/, "")}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : pmHasLive ? (
          <p className="ticker-empty">no open polymarket positions right now.</p>
        ) : (
          <p className="ticker-empty">
            polymarket live source not configured yet — bot float reads <strong>{fmtMoney2(pmBankroll)}</strong> from the static fallback.
            Closed lines will appear in <em>the ledger</em>; open positions land here once snapshots flow.
          </p>
        )}
      </section>

      <PredictionMarquee items={marqueeItems} />

      <BankNav />
    </article>
  );
}
