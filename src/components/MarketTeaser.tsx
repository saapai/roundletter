// Compact "top 3 apples" teaser for the home page. Links to /market for the full stub.
// Matches the /market style so people see the same object in two places at two sizes.
import Link from "next/link";

type Apple = { id: string; title: string; oddsPct: number; resolves: string };

const TEASER: Apple[] = [
  { id: "t1", title: "portfolio > $5,000 by 21 jun",  oddsPct: 65, resolves: "2026-06-21" },
  { id: "t2", title: "portfolio > $10,000 by 21 jun", oddsPct: 24, resolves: "2026-06-21" },
  { id: "t4", title: "IONQ closes above $60 by 21 jun", oddsPct: 32, resolves: "2026-06-21" },
];

export default function MarketTeaser() {
  return (
    <section className="v3-market-teaser" aria-label="the market — top apples">
      <div className="v3-eyebrow">// the market · top apples · <span className="v3-mt-locked">preview</span></div>
      <div className="v3-mt-intro">
        <h2 className="v3-mt-title">The green apple, the rotten apple.</h2>
        <p className="v3-mt-sub">
          You bet on the green apple. The AI hedges the rotten side with my own cash.
          If we win, you get paid at true odds. If we lose, the pool funds giveaways — not my retirement.
          <strong> Only I can lose.</strong>
        </p>
      </div>
      <ol className="v3-mt-list">
        {TEASER.map((a) => (
          <li key={a.id} className="v3-mt-row">
            <div className="v3-mt-row-main">
              <span className="v3-mt-emoji" aria-hidden="true">🍎</span>
              <span className="v3-mt-thesis">{a.title}</span>
            </div>
            <div className="v3-mt-odds">
              <span className="v3-mt-pct">{a.oddsPct}%</span>
              <span className="v3-mt-mult">$1 → ${(1 / (a.oddsPct / 100)).toFixed(2)}</span>
            </div>
          </li>
        ))}
      </ol>
      <p className="v3-mt-cta">
        <Link href="/market">▶ see the full market →</Link>
        <span className="v3-mt-note">market opens on green-credit.com launch · no bets accepted yet</span>
      </p>
    </section>
  );
}
