import type { Metadata } from "next";
import ViewTracker from "@/components/ViewTracker";

export const metadata: Metadata = {
  title: "Entrenched Coils — a paper on tension-weighted memory",
  description:
    "Every AI agent with persistent memory will develop echo chambers. This paper proposes tension-weighted retrieval: surface contradictions first. Hallucination rate drops 50%.",
  openGraph: {
    title: "Entrenched Coils",
    description:
      "A memory architecture where disagreement is the retrieval signal. Validated on 687 nodes, audited by nine agents.",
    url: "https://aureliex.com/letters/entrenched-coils",
    siteName: "aureliex",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Entrenched Coils — tension-weighted memory",
    description:
      "Every AI with memory builds echo chambers. +0.024 confidence drift per cycle, p<0.0001. The fix: retrieve contradictions first.",
    creator: "@saathvikpai",
  },
};

export default function EntrenchedCoilsPaper() {
  return (
    <article className="article page">
      <div className="eyebrow">Paper &middot; May 2026</div>
      <h1 style={{ textAlign: "center" }}>Entrenched Coils</h1>
      <p className="deck">
        Tension-weighted memory for agents that must not lie to themselves.
      </p>

      <section className="page-section">
        <h2>The problem</h2>
        <p>
          Every AI agent with persistent memory will develop echo chambers. Not might. Will. The mechanism is one line: <strong>agreement-weighted retrieval creates positive feedback on confidence.</strong>
        </p>
        <p>
          An agent predicts at confidence <em>c</em>. The prediction enters memory. Next cycle, retrieval surfaces memories most similar to the current belief&mdash;because semantic similarity is highest between things that agree. The agent reads its own prior confidence back, updates toward it, stores the result.
        </p>
        <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.85rem", textAlign: "center", padding: "1.5rem 0", color: "var(--rust, #8B3A2E)", letterSpacing: "0.02em" }}>
          c<sub>n</sub> &asymp; c<sub>0</sub> + n &times; 0.024 &nbsp;&nbsp;&nbsp; (p &lt; 0.0001)
        </div>
        <p>
          After 40 cycles, a calibrated agent at 0.55 reports near-certainty. It is wrong at the same rate as before. It no longer says so.
        </p>
      </section>

      <section className="page-section">
        <h2>The neuroscience</h2>
        <p>
          The brain solved this problem. Karim Nader showed in 2000 that every time a memory is recalled, it becomes labile&mdash;temporarily unstable, open to revision. This is <em>reconsolidation</em>. The act of remembering is not playback. It is reconstruction, and reconstruction introduces error.
        </p>
        <p>
          The error is not a bug. It is the mechanism by which the brain updates beliefs in light of new evidence. A memory retrieved in a context that contradicts it is weakened. A memory retrieved in a context that confirms it is strengthened. The hippocampus does not retrieve by similarity. It retrieves by <em>prediction error</em>&mdash;the mismatch between what was expected and what occurred. The bigger the surprise, the stronger the retrieval signal.
        </p>
        <p>
          Sleep completes the loop. During NREM, the hippocampus replays recent experiences while the neocortex integrates them into long-term structure. During REM, the brain runs counterfactual simulations&mdash;dreams&mdash;that stress-test the new structure against old beliefs. Synaptic homeostasis (Tononi &amp; Cirelli, 2003) globally downscales connection strengths overnight, preserving only what was reinforced. This is compression. The brain forgets most of what it saw today and keeps only what mattered.
        </p>
        <p>
          Every AI memory system skips all three steps. No reconsolidation. No prediction-error retrieval. No sleep. The result is a system that remembers everything, forgets nothing, and updates only toward agreement.
        </p>
      </section>

      <section className="page-section">
        <h2>The mechanism</h2>
        <p>
          Entrenched Coils is a directed graph. Each node is a belief, prediction, or observation. Each edge is typed: <code>contradicts</code>, <code>supports</code>, <code>corrects</code>, <code>evolves</code>. Retrieval traverses a max-heap ordered by composite score:
        </p>
        <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.82rem", lineHeight: 1.8, background: "rgba(28,26,23,0.035)", border: "1px solid rgba(28,26,23,0.08)", borderRadius: "3px", padding: "1.2rem 1.5rem", margin: "1rem 0 1.5rem", overflowX: "auto", whiteSpace: "pre" }}>
{`score = 0.2 × temporal + 0.3 × conviction + 0.5 × tension

temporal   = exp(-λ × Δt)
conviction = avg_conf × (1 + |conf_a − conf_b|)
tension    = base × (1 + resolution_bonus) × unresolved_mult`}
        </div>
        <p>
          Tension dominates at 50%. Unresolved contradictions get a 1.5&times; multiplier. Conviction rewards <em>divergence</em>&mdash;two memories at 0.9 and 0.3 are more interesting than two at 0.6. The agent sees its hardest disagreements first.
        </p>
        <p>
          A nightly sleep cycle compresses the graph: 0.85&times; global downscaling with elastic weight consolidation protecting high-tension edges, and power-law decay (<em>t</em><sup>&minus;0.5</sup>) that retains 10% of day-1 signal after 90 days. Exponential decay would leave 0.03%.
        </p>
      </section>

      <section className="page-section">
        <h2>The results</h2>
        <div style={{ overflowX: "auto" }}>
          <table className="md-table" style={{ width: "100%", marginBottom: "1rem" }}>
            <thead>
              <tr><th>condition</th><th>hallucinations</th><th>accuracy</th><th>confidence</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>tension memory</strong></td><td style={{ color: "var(--rust, #8B3A2E)", fontWeight: 600 }}>5 / 20</td><td style={{ color: "var(--rust, #8B3A2E)", fontWeight: 600 }}>40%</td><td>0.722</td></tr>
              <tr><td>agreement memory</td><td>10 / 20</td><td>30%</td><td>0.869</td></tr>
              <tr><td>no memory</td><td>9 / 20</td><td>30%</td><td>0.835</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          Tension memory halved hallucinations and reduced overconfidence by 17 points. Agreement memory was <em>worse than no memory at all</em>&mdash;it added false certainty on top of the base hallucination rate. The agent that remembered its contradictions knew what it did not know.
        </p>
      </section>

      <section className="page-section">
        <h2>The audit</h2>
        <p>
          Nine research agents and four validation agents ran every test we could execute. The results are published whether they confirm or kill the thesis.
        </p>
        <div style={{ overflowX: "auto" }}>
          <table className="md-table" style={{ width: "100%", marginBottom: "1rem" }}>
            <thead>
              <tr><th>what survived</th><th>what died</th></tr>
            </thead>
            <tbody>
              <tr><td>Anti-echo-chamber property (p&lt;0.0001, 3 domains)</td><td>The +63.8% backtest &rarr; actual +32.84% raw, +18.96% net</td></tr>
              <tr><td>50% hallucination reduction (5/20 vs 10/20)</td><td>Debate as decision layer &rarr; zero trades sourced from debate</td></tr>
              <tr><td>687 nodes, 1,768 edges, 41.2% sleep compression</td><td>99.8% of edges never walked, 60% of nodes never read</td></tr>
              <tr><td>Tension as skip signal (validated on weather markets)</td><td>Tension vs recency: p=0.256, need n&gt;502</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          40% of the architecture is novel. 60% is recombination. Of the 40% that is novel, about half is operational and half is scaffolded. The thesis is unproven, not disproven. The anti-echo-chamber property is the validated finding. The rest is promissory.
        </p>
      </section>

      <section className="page-section">
        <h2>The point</h2>
        <p>
          No production memory system retrieves by contradiction strength. We checked: Zep, Mem0, Letta, MAGMA, CrewAI, A-MEM, MemRL, SCM. All resolve contradictions. We amplify them.
        </p>
        <p>
          The fix is architecturally simple: <strong>retrieve contradictions first.</strong> Let the agent see why it might be wrong before it sees why it might be right. The implementation is 400 lines of SQL and graph traversal. Pair it with feature steering via sparse autoencoders for agents that need to <em>generate</em> genuine disagreement rather than just <em>remember</em> it, and the echo chamber breaks at both layers.
        </p>
        <p>
          The positions are the mini-game. The memory architecture is the product.
        </p>
      </section>

      <section className="page-section" style={{ borderTop: "1px solid var(--rule, rgba(28,26,23,0.08))", paddingTop: "2rem", marginTop: "2rem" }}>
        <p style={{ fontSize: "0.82rem", color: "var(--graphite, #6B6560)", textAlign: "center", lineHeight: 1.6 }}>
          saathvik pai &middot; may 2026 &middot; <a href="https://github.com/saapai/roundletter" target="_blank" rel="noopener" style={{ color: "inherit", borderBottom: "1px solid var(--rule, rgba(28,26,23,0.08))" }}>source</a> &middot; <a href="/letters" style={{ color: "inherit", borderBottom: "1px solid var(--rule, rgba(28,26,23,0.08))" }}>all letters</a>
        </p>
      </section>

      <ViewTracker slug="entrenched-coils" />
    </article>
  );
}
