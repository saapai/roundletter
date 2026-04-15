import { getPortfolio } from "@/lib/data";

// Stock analysis graph — per-position sparkline showing price movement
// since we bought, with % delta and a colored tail. Live prices aren't
// wired in yet; this renders a styled skeleton + a note. When Yahoo
// Finance is wired server-side, replace the skeleton with real data —
// everything downstream (layout, colors, labels) stays the same.

type Holding = {
  ticker: string;
  name: string;
  entry_price: number;
  entry_value: number;
  target_pct: number;
};

export default async function StockAnalysisGraph() {
  const p = getPortfolio();
  const holdings: Holding[] = p.holdings;

  return (
    <section className="stock-graph">
      <div className="stock-graph-head">
        <span className="stock-graph-eyebrow">// price motion · entry → now</span>
        <p className="stock-graph-sub">
          <em>
            skeleton view. live quotes ship in the next cut. the shape of the visual is locked —
            each row is one holding, one sparkline, one delta. green is up, rust is down, dashed is
            missing.
          </em>
        </p>
      </div>

      <div className="stock-graph-rows">
        {holdings.map((h) => (
          <div key={h.ticker} className="stock-graph-row">
            <div className="sg-ticker">
              <span className="sg-symbol">{h.ticker}</span>
              <span className="sg-name">{h.name}</span>
            </div>
            <div className="sg-chart" aria-hidden="true">
              <svg width="100%" height="38" viewBox="0 0 100 38" preserveAspectRatio="none">
                <path
                  d="M 0 19 C 15 19, 30 19, 45 19 S 75 19, 100 19"
                  stroke="rgba(28, 26, 23, 0.18)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  fill="none"
                />
              </svg>
            </div>
            <div className="sg-entry">
              <span className="sg-k">entry</span>
              <span className="sg-v">${h.entry_price.toFixed(2)}</span>
            </div>
            <div className="sg-now">
              <span className="sg-k">now</span>
              <span className="sg-v sg-pending">—</span>
            </div>
            <div className="sg-delta sg-delta-pending">
              <span className="sg-k">Δ</span>
              <span className="sg-v">pending</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
