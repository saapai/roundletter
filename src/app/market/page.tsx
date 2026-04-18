// /market — the green apple vs rotten apple preview.
// Stubbed UI. No payments wired. This is the shape, not the product.

import Link from "next/link";

type Thesis = {
  id: string;
  title: string;
  resolves: string;
  oddsPct: number;      // public market-implied
  poolPublic: number;   // $ bet by public on green
  poolFounder: number;  // $ posted by founder on rotten (liquidity)
  status: "open" | "locked" | "resolved";
};

const THESES: Thesis[] = [
  { id: "t1", title: "portfolio > $5,000 by 21 jun",              resolves: "2026-06-21", oddsPct: 65, poolPublic: 0, poolFounder: 2500, status: "locked" },
  { id: "t2", title: "portfolio > $10,000 by 21 jun",             resolves: "2026-06-21", oddsPct: 24, poolPublic: 0, poolFounder: 2500, status: "locked" },
  { id: "t3", title: "portfolio > $100,000 by 21 jun",            resolves: "2026-06-21", oddsPct: 1,  poolPublic: 0, poolFounder: 500,  status: "locked" },
  { id: "t4", title: "IONQ closes above $60 by 21 jun",           resolves: "2026-06-21", oddsPct: 32, poolPublic: 0, poolFounder: 1000, status: "locked" },
  { id: "t5", title: "NVDA beats on 20 may earnings",             resolves: "2026-05-20", oddsPct: 68, poolPublic: 0, poolFounder: 1500, status: "locked" },
  { id: "t6", title: "any kill-switch fires in next 90 days",     resolves: "2026-07-17", oddsPct: 55, poolPublic: 0, poolFounder: 1000, status: "locked" },
];

function fmt$(n: number): string {
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export default function MarketPage() {
  return (
    <article className="article page market-page">
      <div className="eyebrow">green credit · the market · round 0</div>
      <h1 style={{ textAlign: "center" }}>The Green Apple, the Rotten Apple</h1>
      <p className="deck">
        Every thesis is an apple. Every apple has two sides.
        You bet on the green apple. The AI hedges the rotten side with my own cash.
        If we win, you get paid at true odds. If we lose, the pool funds giveaways — not my retirement.
      </p>

      <section className="market-explain">
        <div className="market-explain-col">
          <div className="market-col-eyebrow">🍎 green apple</div>
          <ul className="market-col-list">
            <li><strong>public bettable.</strong> small money only — money you are willing to lose.</li>
            <li><strong>true odds.</strong> no spread, no vig, no house cut.</li>
            <li><strong>cashout any time.</strong> at current panel-implied odds.</li>
            <li><strong>settlement on resolve date.</strong> paid out in green credit.</li>
          </ul>
        </div>
        <div className="market-explain-col market-explain-col-rotten">
          <div className="market-col-eyebrow">🍏 rotten apple</div>
          <ul className="market-col-list">
            <li><strong>not bettable.</strong> the public cannot take this side.</li>
            <li><strong>founder liquidity.</strong> cash posted to make green-apple cashout work.</li>
            <li><strong>founder is the only counterparty who can lose.</strong> by design.</li>
            <li><strong>anti-billionaire cap applies.</strong> no founder walks away with the pool.</li>
          </ul>
        </div>
      </section>

      <div className="market-rule" aria-hidden="true" />

      <section className="market-theses" aria-label="open theses">
        <div className="market-theses-eyebrow">// the apples · round 0</div>
        <ol className="market-apple-list">
          {THESES.map((t) => (
            <li key={t.id} className="market-apple-row">
              <div className="market-apple-top">
                <div className="market-apple-thesis">
                  <span className="market-apple-emoji">🍎</span>
                  <span className="market-apple-text">{t.title}</span>
                </div>
                <div className="market-apple-odds">
                  <span className="market-apple-pct">{t.oddsPct}%</span>
                  <span className="market-apple-multiplier">
                    $1 → ${(1 / (t.oddsPct / 100)).toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="market-apple-meta">
                <span>resolves · {t.resolves}</span>
                <span className="market-apple-sep">·</span>
                <span>founder liquidity · {fmt$(t.poolFounder)}</span>
                <span className="market-apple-sep">·</span>
                <span>public pool · {fmt$(t.poolPublic)}</span>
                <span className="market-apple-sep">·</span>
                <span className={`market-apple-status market-apple-status-${t.status}`}>
                  {t.status === "locked" ? "market opens on green-credit.com launch" : t.status}
                </span>
              </div>
              <div className="market-apple-actions">
                <button className="market-btn market-btn-bet" disabled>
                  ▶ bet on green · {t.oddsPct}%
                </button>
                <button className="market-btn market-btn-cashout" disabled>
                  ⏯ cashout at true odds
                </button>
                <span className="market-btn-note">not yet live</span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="market-rule" aria-hidden="true" />

      <section className="market-coda">
        <h2>The ultimate crowdsourced GoFundMe.</h2>
        <p>
          GoFundMe asks you to donate with no upside. Polymarket asks you to bet with full downside.
          Neither asks you to <em>participate in a thesis you believe in while keeping true-odds upside and absolute liquidity</em>.
        </p>
        <p>
          Green Credit is what sits after that sentence. Small money only. True odds.
          Cashout any time. If the thesis wins, you get paid. If it loses, the pool funds giveaways
          to the people who kept showing up.
        </p>
        <p className="market-coda-guarantee">
          <strong>In no scenario does the founder walk away with the pool.</strong> That rule is structural,
          not a promise. See <Link href="/archives">the archives</Link> for the full mechanic and the caps.
        </p>
      </section>

      <section className="market-what-now">
        <div className="market-what-now-eyebrow">// what&apos;s next</div>
        <ul className="market-what-now-list">
          <li><strong>the video is the funnel.</strong> the film at the top of the home explains it.</li>
          <li><strong>the mechanic is documented.</strong> <code>green-credit.md</code> in the repo.</li>
          <li><strong>the market is locked.</strong> opens when payment rails + jurisdiction are cleared.</li>
          <li><strong>the calibration is live.</strong> the AI panel is already pricing these odds daily.</li>
        </ul>
      </section>
    </article>
  );
}
