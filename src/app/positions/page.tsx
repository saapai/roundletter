import { getPortfolio } from "@/lib/data";
import SolvedLetters from "@/components/SolvedLetters";
import StockAnalysisGraph from "@/components/StockAnalysisGraph";
import PortfolioChart from "@/components/PortfolioChart";
import SavingsHero from "@/components/SavingsHero";
import TodayDebate from "@/components/TodayDebate";
import ArgumentsPanel from "@/components/ArgumentsPanel";
import TedLassoTrailer from "@/components/TedLassoTrailer";

// Revalidate every 30s so the crowd-ever-10 flag is picked up quickly
// once it flips, without re-rendering on every hit.
export const revalidate = 30;

// Server-side fetch of the permanent crowd-ever-10 flag. Once this
// returns true, the Ted Lasso trailer ships as STATIC HTML in the
// first byte of the /positions response — no client wait, no incognito
// flash.
async function fetchCrowdEverAll10(): Promise<boolean> {
  try {
    const r = await fetch(
      "https://abacus.jasoncameron.dev/get/aureliex-riddle/crowd-ever-10",
      { next: { revalidate: 30 } },
    );
    if (!r.ok) return false;
    const j = (await r.json()) as { value?: number; error?: string };
    if (j.error === "Key not found") return false;
    return typeof j.value === "number" && j.value > 0;
  } catch {
    return false;
  }
}

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

export default async function Positions() {
  const [p, crowdEverAll10] = await Promise.all([
    Promise.resolve(getPortfolio()),
    fetchCrowdEverAll10(),
  ]);
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
      <div className="eyebrow">Stocks · Round {p.round}</div>

      <SavingsHero
        holdings={p.holdings.map((h: any) => ({
          ticker: h.ticker,
          shares: h.shares,
          entry_value: h.entry_value,
        }))}
        startedValue={started}
        peakValue={peak}
        peakDate={p.peak_date ?? p.history?.peak_date ?? "2026-01-31"}
        baselineValue={current}
        goal={goal}
        baselineDate={p.baseline_date ?? "2026-04-14"}
        birthdate={p.birthdate ?? "June 21"}
      />

      <PortfolioChart
        holdings={p.holdings.map((h: any) => ({
          ticker: h.ticker,
          shares: h.shares,
          entry_value: h.entry_value,
        }))}
        baselineTs={new Date(p.baseline_date + "T14:00:00Z").getTime()}
        accountValueAtEntry={p.account_value_at_entry ?? 3453.83}
      />

      <StockAnalysisGraph
        holdings={p.holdings.map((h: any) => ({
          ticker: h.ticker,
          name: h.name,
          shares: h.shares,
          entry_price: h.entry_price,
        }))}
      />

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

      <h1 className="stocks-title-footer">Stocks</h1>

      <TodayDebate />

      <ArgumentsPanel />

      {crowdEverAll10 ? (
        // Static server-rendered trailer: once the crowd-ever-10 flag is
        // true, the trailer is public global state, delivered with the
        // first byte of the page — no client wait, works in incognito.
        <section className="solved-letters" aria-hidden="true">
          <TedLassoTrailer />
        </section>
      ) : (
        <SolvedLetters />
      )}
    </article>
  );
}
