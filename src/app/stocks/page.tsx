import BankNav from "@/components/BankNav";
import Constellation from "@/components/Constellation";
import type { Metadata } from "next";
import Link from "next/link";
import PortfolioGrowthChart from "@/components/PortfolioGrowthChart";
import { getPortfolioData, getPersonalLive } from "@/lib/portfolio-aggregate";

// /stocks — "The Constellation" (per SO1 design agent).
// Each holding is a star: x=entry order, y=since-entry %, brightness∝today |Δ%|.
// Tap a star → glyph card. Sticky bottom: SunGlyph + total + today pill.

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

function fmt$(n: number): string {
  return `$${Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export default async function PersonalPage() {
  const [data, live] = await Promise.all([getPortfolioData(), getPersonalLive()]);
  const cat = data.categories.personal;
  const positions = live?.positions ?? [];

  return (
    <article className="article page bank-page bank-page--investments bank-page--constellation">
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

      <section className="page-section page-section--constellation">
        <div className="page-section-head">
          <h2>constellation</h2>
          <span className="page-section-meta">{positions.length || "—"}</span>
        </div>
        {positions.length === 0 || !live ? (
          <p className="deck">no live quotes — try again shortly.</p>
        ) : (
          <Constellation
            positions={positions}
            totals={{
              total_current: live.total_current,
              total_delta_today_pct: live.total_delta_today_pct,
              total_delta_today_dollars: live.total_delta_today_dollars,
              total_delta_entry_pct: live.total_delta_entry_pct,
              total_delta_entry_dollars: live.total_delta_entry_dollars,
            }}
          />
        )}
      </section>

      <BankNav />
    </article>
  );
}
