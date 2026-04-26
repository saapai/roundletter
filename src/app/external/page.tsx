import BankNav from "@/components/BankNav";
import type { Metadata } from "next";
import Link from "next/link";
import PortfolioGrowthChart from "@/components/PortfolioGrowthChart";
import { getPortfolioData, getExternalEntries } from "@/lib/portfolio-aggregate";

// /external — external capital injected into the book.
// History is a monotone-step series of entry dates. PR2 has 1 entry
// (22 apr · $50); the chart renders its empty-state copy when len < 2.

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getPortfolioData();
  const v = `$${Math.round(data.categories.external.current_value).toLocaleString("en-US")}`;
  const desc = `${v} in external capital · injections recorded by date so the curve isn't flattering me.`;
  return {
    title: `aureliex · external · ${v}`,
    description: desc,
    openGraph: { title: `external · ${v}`, description: desc, type: "article" },
    twitter: { card: "summary_large_image", title: `external · ${v}`, description: desc, creator: "@saapai" },
  };
}

function fmtMoney(n: number): string {
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

export default async function ExternalPage() {
  const data = await getPortfolioData();
  const cat = data.categories.external;
  const entries = [...getExternalEntries()].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <article className="article page bank-page bank-page--external">
      <div className="eyebrow">
        <Link href="/portfolio" className="pathlink">portfolio</Link> · external
      </div>
      <h1>external</h1>
      <p className="deck">
        external entries · running total <strong>{fmtMoney(cat.current_value)}</strong>
      </p>

      <PortfolioGrowthChart
        category="external"
        series={cat.history}
        label="running total of external capital injected into the book — one step per entry date."
        emptyMessage="add a second entry to draw a step series."
      />

      <section className="page-section">
        <div className="page-section-head">
          <h2>entries</h2>
          <span className="page-section-meta">{entries.length} total</span>
        </div>
        <div className="page-cards">
          {entries.map((e) => (
            <div key={e.id ?? `${e.date}-${e.amount}`} className="page-card">
              <div className="card-head">
                <div className="card-ticker">{fmtMoney(Number(e.amount) || 0)}</div>
                <div className="card-agent">{e.date}</div>
              </div>
              {e.label && <div className="card-name">{e.label}</div>}
              {e.status && <p className="card-note">{e.status}</p>}
            </div>
          ))}
        </div>
      </section>
    <BankNav />
    </article>
  );
}
