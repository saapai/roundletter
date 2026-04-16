import { getAgents } from "@/lib/data";
import ClarityEquation from "@/components/ClarityEquation";

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
        <h2>The thesis</h2>
        <p>
          Every investment decision is a stack of reasoning. At the bottom: raw data — a price, a filing, a macro print. One layer up: a thesis about what the data means. Above that: reasoning about whether the thesis holds. Above <em>that</em>: reasoning about the reasoning — the meta-cognition that asks whether you&rsquo;re even asking the right question.
        </p>
        <p>
          Each layer adds clarity the way a term in a Taylor series adds precision to an approximation. The first term gets you in the neighborhood. The second corrects the slope. The third adjusts the curvature. But perfect clarity, like the function itself, is never reached by a finite number of terms. It&rsquo;s only approached.
        </p>
        <ClarityEquation />
        <p>
          This site is an attempt to compute as many terms as one person reasonably can — in public, with real money, on a 10-year horizon. The five agents are the mechanism. Each one computes a different derivative. The moderator synthesizes. The question is always: <em>how much reasoning is enough?</em>
        </p>
      </section>

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
        <p className="kill-preamble">
          Rules written in advance, executed without discretion. The point of a kill-switch is that you don&rsquo;t get to reason about it when it triggers — the reasoning happened once, before any position was open, and the switch is the residue of that reasoning. If you have to think about whether to honor it, it isn&rsquo;t a switch.
        </p>
        <ul className="kill-list">
          <li>
            <strong>Concentration cap.</strong> Any position over 15% of the book (12% for pure-plays) — trim on breach.
            <span className="kill-why">Pure-plays are structurally more volatile; a smaller cap compensates for the fatter tails. 15% is already aggressive — most institutional mandates cap at 5%. This is a deliberate choice: concentrated enough to matter, capped enough to survive being wrong.</span>
          </li>
          <li>
            <strong>QTUM hedge trigger.</strong> QTUM −30% from entry — deploy SGOV into QTUM, one-time.
            <span className="kill-why">QTUM is the broadest quantum-computing ETF in the book — if it drops 30%, the thesis is either broken or the entire sector is in a drawdown worth averaging into. SGOV (short-term treasuries) is the dry powder for exactly this moment. One-time means one-time: no martingale.</span>
          </li>
          <li>
            <strong>Dilution event.</strong> Any pure-play files an S-3 / ATM / 424B5 — cut that position 50% same day.
            <span className="kill-why">An at-the-market offering is a company selling its own stock into the open market. For sub-$5B names, it reprices the float overnight. The filing itself is the signal — not the price reaction, not the conference call explanation. Cut first, re-evaluate later.</span>
          </li>
          <li>
            <strong>10× exit.</strong> Any name 10× from entry — sell 50%, let the rest ride.
            <span className="kill-why">At 10× the position has earned the right to be house money. Selling half locks in a 5× realized gain and lets the remainder compound without the psychological weight of &ldquo;giving it back.&rdquo; The alternative — holding 100% through a 10× — is how retail turns winners into round trips.</span>
          </li>
          <li>
            <strong>Monitoring circuit-breaker.</strong> More than 2 cron-triggered trades in any 12-month window — shut down the weekly cron.
            <span className="kill-why">Barber &amp; Odean (2000) showed that the more retail investors trade, the worse they perform. The cron exists to catch structural events (dilution filings, concentration breaches) — not to trade actively. If the cron fires more than twice a year, either the rules are too sensitive or the portfolio is too volatile for passive monitoring. Either way, the correct response is to stop watching.</span>
          </li>
        </ul>
      </section>

      <section className="page-section">
        <h2>What this site is not</h2>
        <p>
          Not a signal service. Not a newsletter. Not a community. Not investment advice. The portfolio is too small to copy and the method is too slow to trade.
        </p>
        <p>
          This is one person computing partial sums of reasoning in public — with real money, on a 10-year horizon — so that a future version of himself has a legible record of the <em>reasoning</em>, not just the P&L. The positions are the first derivative. The daily agent debates are the second. The calibration scores are the third. None of them reach clarity. But the sum gets closer each day, and the record of getting closer is the product.
        </p>
      </section>
    </article>
  );
}
