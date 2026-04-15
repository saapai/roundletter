import { getPortfolio } from "@/lib/data";

const AGENT_COLOR: Record<string, string> = {
  bull: "var(--anno-bull)",
  bear: "var(--anno-bear)",
  macro: "var(--anno-macro)",
  flow: "var(--anno-flow)",
  historian: "var(--anno-historian)",
};

export default function Positions() {
  const p = getPortfolio();
  const byBucket: Record<string, any[]> = {};
  p.holdings.forEach((h: any) => { (byBucket[h.bucket] ||= []).push(h); });

  return (
    <article className="article page">
      <div className="eyebrow">Positions · Round {p.round} · {p.baseline_date}</div>
      <h1 style={{ textAlign: "center" }}>Positions</h1>
      <p className="deck">Target weights are panel-consensus; actuals drift until rebalance.</p>

      {Object.entries(p.buckets).map(([bucket_id, bucket]: any) => (
        <section key={bucket_id} className="page-section">
          <div className="page-section-head">
            <h2>{bucket.label}</h2>
            <span className="page-section-meta">target {bucket.target_pct}%</span>
          </div>
          <div className="page-cards">
            {(byBucket[bucket_id] || []).map((h: any) => (
              <div key={h.ticker} className="page-card" style={{ ["--row-color" as any]: AGENT_COLOR[h.owner_agent] ?? "var(--rule)" }}>
                <div className="card-head">
                  <div className="card-ticker">{h.ticker}</div>
                  <div className="card-agent">agent · <em>{h.owner_agent}</em></div>
                </div>
                <div className="card-name">{h.name}</div>
                <div className="card-grid">
                  <div><div className="k">shares</div><div className="v">{h.shares}</div></div>
                  <div><div className="k">entry</div><div className="v">${h.entry_price}</div></div>
                  <div><div className="k">value</div><div className="v">${h.entry_value}</div></div>
                  <div><div className="k">target %</div><div className="v">{h.target_pct}%</div></div>
                  <div><div className="k">tier</div><div className="v">{h.tier}</div></div>
                </div>
                {h.note && <p className="card-note">{h.note}</p>}
              </div>
            ))}
          </div>
        </section>
      ))}
    </article>
  );
}
