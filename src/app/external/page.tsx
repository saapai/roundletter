import BankNav from "@/components/BankNav";
import type { Metadata } from "next";
import Link from "next/link";
import PortfolioGrowthChart from "@/components/PortfolioGrowthChart";
import { getPortfolioData, getExternalEntries } from "@/lib/portfolio-aggregate";

// /external — third-party capital injected into the book.
// Each entry carries its own "book_at_entry" snapshot so we can compute
// vintage P&L per injection: (amount / (book_at_entry + amount)) of today's
// personal book is that entry's current portion. Subtract amount → P&L.

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getPortfolioData();
  const v = `$${Math.round(data.categories.external.current_value).toLocaleString("en-US")}`;
  const desc = `${v} in external capital · third-party injections recorded by date so the curve can't lie about itself.`;
  return {
    title: `aureliex · external · ${v}`,
    description: desc,
    openGraph: { title: `external · ${v}`, description: desc, type: "article" },
    twitter: { card: "summary_large_image", title: `external · ${v}`, description: desc, creator: "@saapai" },
  };
}

function fmtMoney(n: number): string {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtMoneySigned(n: number): string {
  const sign = n >= 0 ? "+" : "−";
  return `${sign}$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtPctSigned(n: number): string {
  const sign = n >= 0 ? "+" : "−";
  return `${sign}${Math.abs(n).toFixed(2)}%`;
}

export default async function ExternalPage() {
  const data = await getPortfolioData();
  const cat = data.categories.external;
  const personalNow = data.categories.personal.current_value;
  const entriesAsc = [...getExternalEntries()].sort((a, b) => a.date.localeCompare(b.date));
  const entries = [...entriesAsc].reverse();

  const totalExternal = cat.current_value;

  // Vintage P&L per entry: each $X injected when book was $B owns
  // X / (B + X) of the current personal book. Subtract X for P&L.
  type Vintage = {
    id: string;
    date: string;
    label?: string;
    status?: string;
    amount: number;
    bookAtEntry: number | null;
    portionToday: number | null;
    pnl: number | null;
    pnlPct: number | null;
  };

  const vintages: Vintage[] = entriesAsc.map((e, i) => {
    const amount = Number(e.amount) || 0;
    const book = typeof e.book_at_entry === "number" ? e.book_at_entry : null;
    let portion: number | null = null;
    let pnl: number | null = null;
    let pnlPct: number | null = null;
    if (book != null && book > 0 && personalNow > 0 && amount > 0) {
      const denom = book + amount;
      portion = (amount / denom) * personalNow;
      pnl = portion - amount;
      pnlPct = (pnl / amount) * 100;
    }
    return {
      id: e.id ?? `${e.date}-${i}`,
      date: e.date,
      label: e.label,
      status: e.status,
      amount,
      bookAtEntry: book,
      portionToday: portion,
      pnl,
      pnlPct,
    };
  });

  const totalPnl = vintages.reduce((acc, v) => acc + (v.pnl ?? 0), 0);
  const anyPnl = vintages.some((v) => v.pnl != null);
  const totalPnlPct = totalExternal > 0 ? (totalPnl / totalExternal) * 100 : 0;

  return (
    <article className="article page bank-page bank-page--external">
      <div className="eyebrow">
        <Link href="/portfolio" className="pathlink">portfolio</Link> · external
      </div>

      <header className="external-hero">
        <div className="external-hero-eyebrow">external investments</div>
        <h1 className="external-hero-title">external</h1>
        <p className="external-hero-deck">
          third-party capital injected into the book — recorded by date so the curve can&rsquo;t lie about itself.
        </p>

        <div className="external-bignum">
          <div className="external-bignum-label">total injected</div>
          <div className="external-bignum-value">{fmtMoney(totalExternal)}</div>
          {anyPnl && (
            <div className="external-bignum-pnl">
              <span className="external-bignum-pnl-label">net p&amp;l since entry</span>
              <span className={`external-bignum-pnl-value ${totalPnl >= 0 ? "is-up" : "is-down"}`}>
                {fmtMoneySigned(totalPnl)}{" "}
                <span className="external-bignum-pnl-pct">({fmtPctSigned(totalPnlPct)})</span>
              </span>
            </div>
          )}
          <div className="external-bignum-meta">
            {entries.length} {entries.length === 1 ? "entry" : "entries"} · book today {fmtMoney(personalNow)}
          </div>
        </div>
      </header>

      <PortfolioGrowthChart
        category="external"
        series={cat.history}
        label="running total of external capital injected into the book — one step per entry date."
        emptyMessage="add a second entry to draw a step series."
      />

      <section className="page-section">
        <div className="page-section-head">
          <h2>entries log</h2>
          <span className="page-section-meta">{entries.length} total</span>
        </div>

        <div className="external-table-wrap">
          <table className="external-table" aria-label="external entries log">
            <thead>
              <tr>
                <th scope="col" className="external-th external-th--date">date</th>
                <th scope="col" className="external-th">label</th>
                <th scope="col" className="external-th external-th--num">amount</th>
                <th scope="col" className="external-th external-th--num">portion today</th>
                <th scope="col" className="external-th external-th--num">net p&amp;l</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((v) => {
                const vint = vintages.find((x) => x.id === v.id || x.date === v.date && x.amount === Number(v.amount));
                return (
                  <tr key={v.id ?? `${v.date}-${v.amount}`}>
                    <td className="external-td external-td--date">{v.date}</td>
                    <td className="external-td">{v.label || "—"}</td>
                    <td className="external-td num">{fmtMoney(Number(v.amount) || 0)}</td>
                    <td className="external-td num">
                      {vint?.portionToday != null ? fmtMoney(vint.portionToday) : "—"}
                    </td>
                    <td className={`external-td num ${vint?.pnl == null ? "" : vint.pnl >= 0 ? "is-up" : "is-down"}`}>
                      {vint?.pnl != null
                        ? `${fmtMoneySigned(vint.pnl)} (${fmtPctSigned(vint.pnlPct ?? 0)})`
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="external-vintage-cards">
          {vintages.slice().reverse().map((v) => (
            <article key={v.id} className="external-vintage">
              <header className="external-vintage-head">
                <span className="external-vintage-date">{v.date}</span>
                <span className="external-vintage-amount num">{fmtMoney(v.amount)}</span>
              </header>
              {v.label && <div className="external-vintage-label">{v.label}</div>}
              {v.portionToday != null && v.pnl != null ? (
                <p className="external-vintage-line">
                  <span className="num">{fmtMoney(v.amount)}</span> invested
                  <span className="external-vintage-arrow"> → </span>
                  today&rsquo;s portion of book{" "}
                  <span className="num">{fmtMoney(v.portionToday)}</span>
                  <span className="external-vintage-arrow"> → </span>
                  p&amp;l{" "}
                  <span className={`num ${v.pnl >= 0 ? "is-up" : "is-down"}`}>
                    {fmtMoneySigned(v.pnl)} ({fmtPctSigned(v.pnlPct ?? 0)})
                  </span>
                </p>
              ) : (
                <p className="external-vintage-line external-vintage-line--muted">
                  <span className="num">{fmtMoney(v.amount)}</span> injected — vintage p&amp;l will appear once book-at-entry is recorded.
                </p>
              )}
              {v.status && <p className="external-vintage-status">{v.status}</p>}
            </article>
          ))}
        </div>

        <p className="external-foot">
          vintage p&amp;l = (amount / (book at entry + amount)) of today&rsquo;s personal book − amount.
          one entry inherits its share of every up-day and every drawdown since it landed.
        </p>
      </section>

      <BankNav />
    </article>
  );
}
