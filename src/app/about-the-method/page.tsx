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
          The computer was the thesis. The dot-com bubble was the reasoning about the thesis — a generation asking <em>what does this mean</em> and getting the magnitude right but the timing wrong. AI is the reasoning about the reasoning: machines that don&rsquo;t just compute but evaluate whether the computation was worth doing. Each inflection point in the history of technology is a higher-order derivative of the same underlying function.
        </p>
        <p>
          The pattern is older than computers. The printing press was n=0 — raw distribution of knowledge. The Enlightenment was n=1 — reasoning about what the knowledge means. The scientific method was n=2 — reasoning about the reasoning, a system for correcting its own errors. Each layer adds clarity the way a term in a Maclaurin series adds precision to an approximation. The first term gets you in the neighborhood. The second corrects the slope. The third adjusts the curvature. But perfect clarity, like the function itself, is never reached by a finite number of terms.
        </p>
        <ClarityEquation />
        <p>
          And here is the part that matters: each term is self-correcting. The n=1 term doesn&rsquo;t just add precision — it feeds back into n=0 and reshapes it. The dot-com crash didn&rsquo;t just refine the thesis about the internet; it <em>changed what the internet became</em>. AI doesn&rsquo;t just reason about prior reasoning; it alters what counts as reasoning. The series is recursive. Each derivative adjusts its neighbors based on its own error bars, its own variance, its own encounter with luck. The unifying thread isn&rsquo;t convergence toward a known answer. It&rsquo;s something closer to <em>luckmaxxing</em> — positioning yourself so that the variance works for you instead of against you, the way Kelly positions a bet so that geometric growth is maximized even though each individual outcome is uncertain. It&rsquo;s inexplicable the way <em>e</em> or <em>&pi;</em> are inexplicable — a fundamental constant that shows up everywhere you look, once you know to look — and then know how to look, and then know how to teach how to look, each derivative of seeing slightly more precise than the last, never reaching the thing itself.
        </p>
      </section>

      <section className="page-section">
        <h2>The field</h2>
        <p>
          Einstein showed that mass distorts spacetime. A star doesn&rsquo;t <em>pull</em> objects toward it — it bends the geometry of the space around it, and objects follow the curvature. The deeper the well, the stronger the distortion.
        </p>
        <p>
          Meaning works the same way. A memory, a concept, a conviction — these are not stored statically in the brain. They create gravitational wells. The more a pattern is referenced, the deeper the trench. The deeper the trench, the more it pulls in related meaning. You don&rsquo;t retrieve a memory. You disturb a field and observe what stabilizes. This is what I call <em>entrenched coils</em>: a dynamic system where the connections between ideas stretch, tighten, weaken, snap, and reconfigure — not like edges in a graph, but like springs under tension, continuously reshaped by time, emotion, and context.
        </p>
        <p>
          The portfolio is a field in exactly this sense. Each position creates a gravity well proportional to its conviction and its capital. The five agents are local distortions — each one bends the field differently, and the moderator observes what stabilizes when a new data point drops into the system. The kill-switches below are not rules. They are the topology of the field, pre-committed — the shape of spacetime decided before any mass enters it.
        </p>
      </section>

      <section className="page-section">
        <h2>The frontier</h2>
        <p>
          Paul Graham wrote that the way to do great work is to get to the frontier of a field and then look for gaps. But the deepest gaps are not <em>within</em> a field — they are <em>between</em> fields. To see what&rsquo;s missing at the intersection of writing and entrepreneurship, you need Bourdain and Jobs as much as you need Graham and Naval. You need to reach the frontier of each domain individually before you can see the white space where they overlap.
        </p>
        <p>
          This is polymathy reframed as portfolio construction. Good artists borrow. Great artists steal. But the easiest place to steal from is a domain so distant that nobody in your field has ever looked there. Kelly&rsquo;s original paper was about signal transmission over a noisy channel — not gambling. Thorp imported it to blackjack. Markowitz&rsquo;s decorrelation is the mathematics of <em>have a second bet in a different domain</em>. The partial derivative of insight with respect to a foreign-domain observation is larger than with respect to a native one, precisely because the foreign domain&rsquo;s ideas haven&rsquo;t been arbitraged away in your field. The butterfly effect: a small insight transported across a domain boundary produces outsized results because it lands in a system that has never seen it before.
        </p>
        <p>
          One of the mini-projects behind this site: understand consciousness to understand education; understand education to understand the inflection point of humans; understand the inflection point of humans to understand the inflection point of consciousness; understand the inflection point of consciousness to understand consciousness better. Each term in the series is its own recursive loop — each derivative corrects the one before it. The phases of understanding are themselves derivatives. The recursion is the formula.
        </p>
      </section>

      <section className="page-section">
        <h2>Why five agents</h2>
        <p>
          Fifty copies of one agent converge to the same wrong answer. Five structurally different roles — bull, bear, macro, microstructure/flow, base-rate historian — see different inputs, write independently, then face an arbitrator. The research on multi-agent debate (Du et al. 2023; TradingAgents from Columbia/NYU) is unambiguous: gains come from role variance, not from count. Each agent is a different domain imported into the same field. The value is the decorrelation.
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
          Not a signal service. Not a newsletter. Not a community. Not investment advice. The portfolio is too small to copy and the method is faster than you would be if you copied it.
        </p>
        <p>
          This is one person computing partial sums of reasoning in public — with real money, on a 10-year horizon — so that a future version of himself has a legible record of the <em>reasoning</em>, not just the P&L. The positions are the first derivative. The daily agent debates are the second. The calibration scores are the third. None of them reach clarity. But the sum gets closer each day, and the record of getting closer is the product.
        </p>
      </section>

      <section className="page-section">
        <h2>The new house</h2>
        <p>
          Attention is the new capital. Not money — attention. In 2026 the scarce resource is not dollars or compute or even data. It is the willingness of a human being to hold one thing in mind long enough to reason about it. Every platform, every feed, every notification is competing for that resource. The house always wins because the house is the platform, and the platform is optimized to extract attention, not to reward it.
        </p>
        <p>
          Games are the way to the frontier of attention. A game earns focus by making the player <em>want</em> to think — not by hijacking a reflex. The ten-letter cipher on the home page, the recursive 6969 error, the hidden letters in the pitch deck — these are not decorations. They are the thesis in miniature: that attention given voluntarily to a problem you care about compounds differently than attention extracted by a feed you scroll.
        </p>
        <p>
          But here is the question the method cannot answer with math: if the house always wins, how do the players win? New players enter and the house takes from them too. The game is zero-sum as long as the house is the house. So maybe the answer is not better players or better strategy. Maybe the answer is a new house — one where the incentives of the structure and the incentives of the people inside it point in the same direction. Where attention invested in reasoning is rewarded with better reasoning, not with more ads.
        </p>
        <p>
          This site is a sketch of what that house might look like. Small, public, one person, real money, no feed, no engagement metrics, no algorithm deciding what you see. Just the reasoning, the reasoning about the reasoning, and a record of whether any of it was right.
        </p>
      </section>
    </article>
  );
}
