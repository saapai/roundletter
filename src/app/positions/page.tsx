import { getPortfolio } from "@/lib/data";

const AGENT_COLOR: Record<string, string> = {
  bull: "var(--anno-bull)",
  bear: "var(--anno-bear)",
  macro: "var(--anno-macro)",
  flow: "var(--anno-flow)",
  historian: "var(--anno-historian)",
};

function fmt$(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export default function Positions() {
  const p = getPortfolio();
  const byBucket: Record<string, any[]> = {};
  p.holdings.forEach((h: any) => { (byBucket[h.bucket] ||= []).push(h); });

  // Savings story — where the account has been, where it is, where it's going
  const started = p.history?.account_value_jan_2025_start ?? 1296.08;
  const peak = p.peak_value ?? p.history?.account_value_peak_2026 ?? 4825.03;
  const current = p.account_value_at_entry ?? 3453.83;
  const goal = 100000;
  const gainFromStart = current - started;
  const gainPctFromStart = (gainFromStart / started) * 100;
  const peakGain = peak - started;
  const peakGainPct = (peakGain / started) * 100;
  const drawFromPeak = current - peak;
  const drawPctFromPeak = (drawFromPeak / peak) * 100;
  const toGoal = goal - current;
  const multipleToGoal = goal / current;

  // Position on the log-scale journey bar (started → peak → goal)
  const logMin = Math.log(started);
  const logMax = Math.log(goal);
  const posPct = ((Math.log(current) - logMin) / (logMax - logMin)) * 100;
  const peakPct = ((Math.log(peak) - logMin) / (logMax - logMin)) * 100;

  return (
    <article className="article page">
      <div className="eyebrow">Positions · Round {p.round} · {p.baseline_date}</div>
      <h1 style={{ textAlign: "center" }}>Positions</h1>

      <section className="savings-hero">
        <div className="savings-eyebrow">// the savings story</div>

        <div className="savings-grid">
          <div className="savings-cell savings-cell-main">
            <div className="savings-cell-label">current account</div>
            <div className="savings-cell-value">${fmt$(current)}</div>
            <div className="savings-cell-note">
              <span className="savings-up">+${fmt$(gainFromStart)}</span>
              {" "}({gainPctFromStart.toFixed(0)}%) since jan 2025
            </div>
          </div>

          <div className="savings-cell">
            <div className="savings-cell-label">peak</div>
            <div className="savings-cell-value savings-peak">${fmt$(peak)}</div>
            <div className="savings-cell-note">
              +${fmt$(peakGain)} ({peakGainPct.toFixed(0)}%) · {p.peak_date ?? p.history?.peak_date ?? "2026-01-31"}
            </div>
          </div>

          <div className="savings-cell">
            <div className="savings-cell-label">vs peak</div>
            <div className="savings-cell-value savings-draw">{drawPctFromPeak.toFixed(1)}%</div>
            <div className="savings-cell-note">${fmt$(drawFromPeak)} (gave back)</div>
          </div>

          <div className="savings-cell">
            <div className="savings-cell-label">to $100k</div>
            <div className="savings-cell-value savings-goal">{multipleToGoal.toFixed(1)}x</div>
            <div className="savings-cell-note">${fmt$(toGoal)} to go</div>
          </div>
        </div>

        <div className="savings-bar-wrap" aria-hidden="true">
          <div className="savings-bar-track">
            <div className="savings-bar-fill" style={{ width: `${posPct}%` }} />
            <div className="savings-bar-peak-mark" style={{ left: `${peakPct}%` }} title={`peak $${fmt$(peak)}`} />
            <div className="savings-bar-now-mark" style={{ left: `${posPct}%` }} title={`now $${fmt$(current)}`} />
          </div>
          <div className="savings-bar-labels">
            <span>${fmt$(started)}<br/><em>jan 2025</em></span>
            <span className="savings-bar-label-goal">${fmt$(goal)}<br/><em>june 21</em></span>
          </div>
        </div>

        <p className="savings-caveat">
          <em>live prices aren&rsquo;t wired in yet; these are the last reconciled numbers. the real savings story is the one held through the drawdown — not the one at peak.</em>
        </p>
      </section>

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
