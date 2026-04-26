import BankNav from "@/components/BankNav";
import type { Metadata } from "next";
import Link from "next/link";
import PortfolioGrowthChart from "@/components/PortfolioGrowthChart";
import { getPortfolioData, getPersonalLive } from "@/lib/portfolio-aggregate";

// /portfolio/personal — P&L cards per position + sticky TOTAL.
// Per agent debate (PL1+PL2+PL3 synthesis): mobile-first cards, two
// pills per position (TODAY · SINCE-ENTRY), one big number = current value.

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getPortfolioData();
  const v = `$${Math.round(data.categories.personal.current_value).toLocaleString("en-US")}`;
  const desc = `${v} live brokerage book · 10 positions · ten-year quantum-anchored thesis.`;
  return {
    title: `aureliex · investments · ${v}`,
    description: desc,
    openGraph: { title: `investments · ${v}`, description: desc, type: "article" },
    twitter: { card: "summary_large_image", title: `investments · ${v}`, description: desc, creator: "@saapai" },
  };
}

function fmt$(n: number, opts: { decimals?: number; sign?: boolean } = {}): string {
  const decimals = opts.decimals ?? 0;
  const abs = Math.abs(n);
  const s = `$${abs.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
  if (!opts.sign) return s;
  if (n > 0.005) return `+${s}`;
  if (n < -0.005) return `−${s}`;
  return s;
}
function fmtPct(n: number): string {
  if (Math.abs(n) < 0.005) return "—";
  const s = `${Math.abs(n).toFixed(2)}%`;
  return n > 0 ? `+${s}` : `−${s}`;
}
function tone(n: number): "pos" | "neg" | "flat" {
  if (n > 0.005) return "pos";
  if (n < -0.005) return "neg";
  return "flat";
}

export default async function PersonalPage() {
  const [data, live] = await Promise.all([getPortfolioData(), getPersonalLive()]);
  const cat = data.categories.personal;
  const positions = live?.positions ?? [];

  return (
    <article className="article page bank-page bank-page--investments">
      <div className="eyebrow">
        <Link href="/portfolio" className="pathlink">portfolio</Link> · investments
      </div>
      <h1>investments</h1>
      <p className="deck">
        live brokerage book · {fmt$(cat.current_value)} · {data.live ? "live" : "baseline"}
      </p>

      <PortfolioGrowthChart
        category="personal"
        series={cat.history}
        label="sum of (shares × close) across all 10 holdings."
        emptyMessage="quotes loading…"
      />

      <section className="page-section">
        <div className="page-section-head">
          <h2>positions</h2>
          <span className="page-section-meta">{positions.length || "—"}</span>
        </div>
        {positions.length === 0 ? (
          <p className="deck">no live quotes — try again shortly.</p>
        ) : (
          <ul className="pl-cards">
            {positions.map((p) => (
              <li key={p.ticker} className="pl-card">
                <div className="pl-head">
                  <div className="pl-id">
                    <span className="pl-ticker">{p.ticker}</span>
                    {p.name && <span className="pl-name">{p.name}</span>}
                  </div>
                  <div className="pl-value">
                    <span className="pl-value-num">{fmt$(p.current_value, { decimals: 2 })}</span>
                    <span className="pl-value-sub">{p.shares.toLocaleString("en-US", { maximumFractionDigits: 3 })} sh</span>
                  </div>
                </div>
                <div className="pl-pills">
                  <div className={`pl-pill pl-pill--${tone(p.delta_today_pct)}`}>
                    <span className="pl-pill-label">today</span>
                    <span className="pl-pill-pct">{fmtPct(p.delta_today_pct)}</span>
                    <span className="pl-pill-dollar">{fmt$(p.delta_today_dollars, { decimals: 2, sign: true })}</span>
                  </div>
                  <div className={`pl-pill pl-pill--${tone(p.delta_entry_pct)}`}>
                    <span className="pl-pill-label">since entry</span>
                    <span className="pl-pill-pct">{fmtPct(p.delta_entry_pct)}</span>
                    <span className="pl-pill-dollar">{fmt$(p.delta_entry_dollars, { decimals: 2, sign: true })}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {live && (
        <div className="pl-total" role="status" aria-label="portfolio total">
          <div className="pl-total-row">
            <span className="pl-total-label">total · {positions.length}</span>
            <span className="pl-total-value">{fmt$(live.total_current, { decimals: 2 })}</span>
          </div>
          <div className="pl-total-row pl-total-deltas">
            <span className={`pl-pill-pct pl-pill--${tone(live.total_delta_today_pct)}`}>
              today {fmtPct(live.total_delta_today_pct)} · {fmt$(live.total_delta_today_dollars, { decimals: 2, sign: true })}
            </span>
            <span className="pl-total-sep">·</span>
            <span className={`pl-pill-pct pl-pill--${tone(live.total_delta_entry_pct)}`}>
              entry {fmtPct(live.total_delta_entry_pct)} · {fmt$(live.total_delta_entry_dollars, { decimals: 2, sign: true })}
            </span>
          </div>
        </div>
      )}
    <BankNav />
    </article>
  );
}
