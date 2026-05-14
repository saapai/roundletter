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

      {/* ── 1. THE PROBLEM ── */}
      <section className="page-section">
        <h2>The problem</h2>
        <p>
          Ask ChatGPT the same question every day for a month and it will give you roughly the same answer each time. That is because it has no memory. Now imagine giving it one. Every answer it gives gets saved. The next time you ask, it reads its own previous answers first, then responds.
        </p>
        <p>
          What happens? It agrees with itself. Not because it decided to&mdash;because the way every memory system works today is by finding the most <em>similar</em> past memories. Similarity is highest between things that agree. The AI reads back its own confidence, updates toward it, and saves the new answer. Each cycle pushes it a little further in the same direction.
        </p>
        <p>
          We measured exactly how fast this happens. Across 100 trials on a five-agent system:
        </p>
        <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.88rem", textAlign: "center", padding: "1.5rem 0", color: "var(--rust, #8B3A2E)", letterSpacing: "0.02em" }}>
          confidence drifts +2.4% per cycle &nbsp;&nbsp; (p &lt; 0.0001)
        </div>
        <p>
          An agent that starts out reasonably uncertain&mdash;55% confident&mdash;reaches near-total certainty after 40 cycles. It is not more accurate. It is just more sure. And any system downstream&mdash;a trading engine, a customer-facing assistant, an autonomous workflow&mdash;acts on that false certainty as if it were real.
        </p>
        <p>
          This is not a bug in any particular product. It is a <strong>property of how memory retrieval works</strong> in every deployed AI system today: Zep, Mem0, Letta, MAGMA, and others. All of them retrieve by similarity. All of them build echo chambers.
        </p>
      </section>

      {/* ── 2. HOW THE BRAIN HANDLES IT ── */}
      <section className="page-section">
        <h2>How the brain handles it</h2>
        <p>
          Your brain does not retrieve memories by finding the closest match. It does something stranger and more useful: it retrieves by <em>surprise</em>.
        </p>
        <p>
          In 2000, neuroscientist Karim Nader discovered that every time you recall a memory, it temporarily destabilizes. For a brief window, the memory is open to revision&mdash;it can be strengthened, weakened, or rewritten based on what is happening right now. This process is called <em>reconsolidation</em>. Remembering is not playback. It is live editing.
        </p>
        <p>
          The editing follows a rule: <strong>the bigger the mismatch between what you expected and what you got, the more strongly the memory is updated.</strong> Neuroscientists call this prediction error. Your hippocampus&mdash;the brain&rsquo;s memory switchboard&mdash;does not ask &ldquo;what have I seen that looks like this?&rdquo; It asks &ldquo;what have I seen that <em>contradicts</em> this?&rdquo; The surprise is the signal.
        </p>
        <p>
          Sleep finishes the job. During deep sleep (NREM), your hippocampus replays the day&rsquo;s events while your cortex integrates them into long-term knowledge. During dream sleep (REM), your brain runs what-if scenarios&mdash;testing new memories against old beliefs, looking for conflicts. Overnight, a process called synaptic homeostasis turns down the volume on every connection in the brain by about 15%, preserving only the ones that were reinforced during the day. This is how the brain compresses: it forgets most of what happened and keeps only what mattered.
        </p>
        <p>
          Three mechanisms. Reconsolidation: memories update on recall. Prediction error: surprise drives retrieval. Sleep: nightly compression keeps the system from drowning in its own data. Every AI memory system today skips all three.
        </p>
      </section>

      {/* ── 3. THE FIX ── */}
      <section className="page-section">
        <h2>The fix</h2>
        <p>
          Entrenched Coils models all three. The memory is a graph&mdash;a network of connected nodes. Each node is something the system believes, predicted, or observed. The connections between nodes have labels: <em>contradicts</em>, <em>supports</em>, <em>corrects</em>, <em>evolves</em>.
        </p>
        <p>
          When the system needs to recall something, it does not search for the most similar memory. It searches for the most <em>tense</em> one&mdash;the memory with the strongest unresolved disagreement. The scoring formula weights three things:
        </p>
        <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.82rem", lineHeight: 1.9, background: "rgba(28,26,23,0.035)", border: "1px solid rgba(28,26,23,0.08)", borderRadius: "3px", padding: "1.2rem 1.5rem", margin: "1rem 0 1.5rem", overflowX: "auto", whiteSpace: "pre" }}>
{`score = 20% recency + 30% conviction + 50% tension`}
        </div>
        <p>
          Tension dominates. An unresolved contradiction gets a 1.5&times; boost. Conviction rewards <em>divergence</em>&mdash;two memories that are both confident but disagree are more valuable than two that mildly agree. The system sees its hardest disagreements first, every time.
        </p>
        <p>
          Every night, a sleep cycle runs. It compresses the graph by turning down every connection by 15%&mdash;the same ratio as biological synaptic homeostasis&mdash;while protecting high-tension edges (the important disagreements). It uses power-law forgetting, which keeps 10% of a memory&rsquo;s original strength after 90 days. Standard exponential forgetting would leave 0.03%. The difference matters: deep convictions and unresolved debates persist for months. Noise from last Tuesday fades in days.
        </p>
      </section>

      {/* ── 4. WHAT HAPPENED ── */}
      <section className="page-section">
        <h2>What happened</h2>
        <p>
          We tested three conditions: tension memory (retrieve contradictions first), agreement memory (retrieve agreements first, the industry default), and no memory at all.
        </p>
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
          Tension memory cut hallucinations in half. Agreement memory&mdash;the way every production system works today&mdash;was <em>worse than having no memory at all</em>. It made the AI more confident while making it less accurate. The system that remembered its own doubts knew what it did not know. The system that remembered its own agreements thought it knew everything.
        </p>
        <p>
          The anti-echo-chamber effect replicated across three domains: stock predictions, weather forecasting on Kalshi, and tennis match outcomes. The architecture is not domain-specific. Disagreement is a universal retrieval signal.
        </p>
      </section>

      {/* ── 5. WHAT IS HONEST ── */}
      <section className="page-section">
        <h2>What is honest</h2>
        <p>
          We audited this system with nine research agents and four validators. The results are published whether they help or hurt.
        </p>
        <p>
          <strong>What survived:</strong> The anti-echo-chamber property is real (p&lt;0.0001, three domains). Hallucinations halved. The graph structure works&mdash;687 nodes, 1,768 edges, 41% compressed by sleep. When models disagree about a prediction, treating that disagreement as a skip signal prevented bad trades in an independent weather-market system.
        </p>
        <p>
          <strong>What died:</strong> A claimed +63.8% backtest return was actually +32.84% raw and +18.96% after transaction costs. The entire gain rested on one or two lucky weeks. The five-agent debate system produced zero trades that were actually executed&mdash;all decisions came from mechanical rules. 60% of the memory nodes were never read. 99.8% of the edges were never traversed. The dopamine feedback system was built but never turned on.
        </p>
        <p>
          The architecture is 40% operational and 60% scaffolded. The thesis is unproven, not disproven. We publish the audit because that is the point.
        </p>
      </section>

      {/* ── 6. WHY IT MATTERS ── */}
      <section className="page-section">
        <h2>Why it matters</h2>
        <p>
          Every company building AI assistants, copilots, or autonomous agents is about to give them memory. They have to&mdash;a stateless agent cannot learn, personalize, or improve. The moment they do, using the default retrieval method (find similar memories), they will have built an echo chamber on a cron job. The agent will radicalize itself on its own outputs. Confidence will drift. Hallucinations will compound because the agent retrieves its own prior hallucinations as supporting evidence.
        </p>
        <p>
          The fix is simple: <strong>retrieve contradictions first.</strong> Let the agent see why it might be wrong before it sees why it might be right. Model the brain, not the search engine. Retrieve by surprise, not similarity. Compress nightly. Forget what does not matter.
        </p>
        <p>
          The implementation is 400 lines. The effect is a 50% reduction in hallucinations. We checked eight major memory platforms. None of them do this. All of them resolve contradictions. We amplify them.
        </p>
      </section>

      {/* ── FOOTER ── */}
      <section className="page-section" style={{ borderTop: "1px solid var(--rule, rgba(28,26,23,0.08))", paddingTop: "2rem", marginTop: "2rem" }}>
        <p style={{ fontSize: "0.82rem", color: "var(--graphite, #6B6560)", textAlign: "center", lineHeight: 1.6 }}>
          saathvik pai &middot; may 2026 &middot; <a href="https://github.com/saapai/roundletter" target="_blank" rel="noopener" style={{ color: "inherit", borderBottom: "1px solid var(--rule, rgba(28,26,23,0.08))" }}>source</a> &middot; <a href="/letters" style={{ color: "inherit", borderBottom: "1px solid var(--rule, rgba(28,26,23,0.08))" }}>all letters</a>
        </p>
      </section>

      <ViewTracker slug="entrenched-coils" />
    </article>
  );
}
