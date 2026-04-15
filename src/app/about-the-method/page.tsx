import { getAgents } from "@/lib/data";

const AGENT_COLOR: Record<string, string> = {
  bull: "var(--anno-bull)",
  bear: "var(--anno-bear)",
  macro: "var(--anno-macro)",
  flow: "var(--anno-flow)",
  historian: "var(--anno-historian)",
};

export default function Method() {
  const agents = getAgents();

  return (
    <article className="article page">
      <div className="eyebrow">Method · the panel, the scoring, the kill-switches</div>
      <h1 style={{ textAlign: "center" }}>The Method</h1>
      <p className="deck">Five agents, one judge, a written pre-mortem per round.</p>

      <section className="page-section">
        <h2>Why five agents</h2>
        <p>
          Fifty copies of one agent converge to the same wrong answer. Five structurally different roles — bull, bear, macro, microstructure/flow, base-rate historian — see different inputs, write independently, then face an arbitrator. The research on multi-agent debate (Du et al. 2023; TradingAgents from Columbia/NYU) is unambiguous: gains come from role variance, not from count.
        </p>
      </section>

      <section className="page-section">
        <h2>The panel</h2>
        <div className="panel-grid">
          {agents.map((a) => (
            <div key={a.id} className="panel-card" style={{ ["--row-color" as any]: AGENT_COLOR[a.id] ?? "var(--rule)" }}>
              <div className="panel-id">{a.id}</div>
              <div className="panel-name">{a.name}</div>
              <p className="panel-mandate">{a.mandate}</p>
              <p className="panel-owns">Owns · {a.owns_buckets.join(", ")}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="page-section">
        <h2>Scoring</h2>
        <p>
          Each agent writes probabilistic direction calls at T+30, T+90, T+365 for every holding. Thesis text is SHA-hashed at prediction time to prevent post-hoc rewriting. When the horizon passes, a Brier score is computed from realized direction. Weights are frozen at equal (0.2) until each agent has ≥20 resolved predictions, at which point exponential decay on cumulative Brier kicks in. Scoring rewards calibration, not P&L — variance swamps skill over fewer than ~50 rounds.
        </p>
      </section>

      <section className="page-section">
        <h2>Kill-switches</h2>
        <ul className="kill-list">
          <li>Any position over 15% of the book (12% for pure-plays) — trim on breach.</li>
          <li>QTUM −30% from entry — deploy SGOV into QTUM, one-time.</li>
          <li>Any pure-play files an S-3 / ATM / 424B5 — cut that position 50% same day.</li>
          <li>Any name 10× from entry — sell 50%, let the rest ride.</li>
          <li>More than 2 cron-triggered trades in any 12-month window — shut down the weekly cron. Barber-Odean says monitoring is net-negative for retail; when the evidence shows up in this book, we stop.</li>
        </ul>
      </section>

      <section className="page-section">
        <h2>What this site is not</h2>
        <p>
          Not a signal service. Not a newsletter. Not a community. Not investment advice. The portfolio is too small to copy and the method is too slow to trade. This is one person thinking in public with real money on a 10-year horizon, so that a future version of himself has a legible record of the reasoning — not just the P&L.
        </p>
      </section>
    </article>
  );
}
