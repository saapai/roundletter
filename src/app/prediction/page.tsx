import BankNav from "@/components/BankNav";
import type { Metadata } from "next";
import CountUp from "@/components/CountUp";
import EventCard, { humanizeKalshiTicker } from "@/components/EventCard";
import PortfolioGrowthChart from "@/components/PortfolioGrowthChart";
import PredictionMarquee, { type MarqueeItem } from "@/components/PredictionMarquee";
import { getPortfolioData } from "@/lib/portfolio-aggregate";
import { getLatestKalshiSnapshot, type KalshiFill } from "@/lib/snapshots";
import predictionRaw from "@/data/prediction.json";

// /prediction — "The Ticker" design (per SO2). Masthead is the
// total $ in mono with count-up; below that, one card per Kalshi event with
// price chips for open positions; a single line for Polymarket float; and
// an ESPN-style marquee of the latest line moves at the bottom.

export const dynamic = "force-dynamic";

const POLYMARKET_BANKROLL = (predictionRaw as { polymarket_bankroll?: number })
  .polymarket_bankroll ?? 158;

export async function generateMetadata(): Promise<Metadata> {
  const data = await getPortfolioData();
  const v = `$${Math.round(data.categories.prediction.current_value).toLocaleString("en-US")}`;
  const desc = `the book · ${v} · kalshi sports + polymarket bot · NBA Championship 2026, NBA East 2026, UCL 2026, Trillionaire by 2030.`;
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
  // Effective per-share price in cents. Kalshi quotes 0..1 USD.
  const priceStr = f.side === "yes" ? f.yes_price_dollars : f.no_price_dollars;
  const cents = priceStr ? Math.round(parseFloat(priceStr) * 100) : 0;
  const positive = f.action === "buy"; // a buy = adding length, treat as +
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

export default async function PredictionPage() {
  const data = await getPortfolioData();
  const cat = data.categories.prediction;
  const k = getLatestKalshiSnapshot();

  const total = Math.round(cat.current_value);
  const events = k?.event_positions ?? [];
  const markets = k?.market_positions ?? [];
  const openMarkets = markets.filter((m) => parseFloat(m.market_exposure_dollars) > 0);

  // Meta line totals — traded notional and vig (fees) summed across all
  // market positions, regardless of whether they're still open.
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
  // Weeks live — measured against the first historical snapshot date.
  const weeksLive = (() => {
    if (!cat.history.length) return 5;
    const first = (cat.history[0].ts || 0) * 1000;
    const last = Date.now();
    const w = Math.max(1, Math.round((last - first) / (7 * 24 * 3600 * 1000)));
    return w;
  })();

  const nowMs = Date.now();
  const marqueeItems: MarqueeItem[] = (k?.fills ?? [])
    .slice(0, 8)
    .map((f) => fillToMarquee(f, nowMs));

  const lastTickIso = k?.fills?.[0]?.created_time ?? k?.pulled_at ?? null;

  return (
    <article className="ticker-page bank-page bank-page--prediction" data-page="ticker">
      <header className="ticker-masthead">
        <div className="ticker-eyebrow">the book</div>
        <div className="ticker-total" aria-label={`total ${fmtMoney(total)}`}>
          <CountUp to={total} prefix="$" />
        </div>
        <div className="ticker-meta">
          {eventsCount} events · {linesCount} lines · {fillsCount} fills · {fmtMoney(Math.round(tradedTotal))} traded · {fmtMoney(Math.round(vigTotal))} vig · {weeksLive} wks
        </div>
      </header>

      <section className="ticker-history" aria-label="kalshi book history">
        <PortfolioGrowthChart
          category="kalshi · book history"
          series={cat.kalshi_history}
          label="cash + open exposure, walked from fills"
          emptyMessage="not enough fills yet to draw a curve."
        />
        <p className="ticker-history-note">
          polymarket curve coming once daily snapshots accrue — for now ${Math.round(POLYMARKET_BANKROLL)} constant baseline.
        </p>
      </section>

      <section className="ticker-events" aria-label="event book">
        {events.map((e, i) => (
          <EventCard key={e.event_ticker} event={e} positions={openMarkets} index={i} />
        ))}
      </section>

      <section className="ticker-poly" aria-label="polymarket float">
        <div className="ticker-poly-row">
          <span className="ticker-poly-tilde" aria-hidden>~</span>
          <span className="ticker-poly-name">polymarket bot float</span>
          <span className="ticker-poly-amount">{fmtMoney(Math.round(POLYMARKET_BANKROLL))}</span>
        </div>
        <div className="ticker-poly-meta">
          autonomous · last tick {fmtUtc(lastTickIso)}
        </div>
      </section>

      <PredictionMarquee items={marqueeItems} />

      <BankNav />
    </article>
  );
}
