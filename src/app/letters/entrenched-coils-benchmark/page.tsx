import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Epistemic Metabolism — benchmarking a theory of artificial understanding",
  description:
    "We built a memory system that retrieves its own doubts. Then we ran 2,340 evaluations to find out whether doubt is useful, when it breaks, and what it means for how machines should think.",
  openGraph: {
    title: "Epistemic Metabolism",
    description:
      "A theory of artificial understanding, tested against 2,340 evaluations. What works. What breaks. What it means.",
    url: "https://aureliex.com/letters/entrenched-coils-benchmark",
    siteName: "aureliex",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Epistemic Metabolism",
    description:
      "A theory of artificial understanding, tested against 2,340 evaluations.",
    creator: "@saathvikpai",
  },
};

export default function ECBenchmarkPaper() {
  return (
    <>
      <div style={{ position: "fixed", top: "1.2rem", left: "1.5rem", zIndex: 100 }}>
        <Link
          href="/"
          className="wordmark"
          style={{
            fontFamily: "var(--font-display, Georgia), serif",
            fontStyle: "italic",
            fontSize: "0.95rem",
            color: "var(--graphite, #6B6560)",
            textDecoration: "none",
            letterSpacing: "-0.01em",
            opacity: 0.5,
          }}
        >
          aureliex.
        </Link>
      </div>

      <article className="article page" style={{ paddingTop: "3.5rem" }}>
        <div className="eyebrow">Paper <span style={{ color: "var(--rust, #8B3A2E)", opacity: 0.7 }}>&middot;</span> June 2026</div>
        <h1 style={{ textAlign: "center" }}>Epistemic Metabolism</h1>
        <p className="deck">
          What happens when you build a memory system<br />
          that retrieves its own doubts, then doubt it.
        </p>

        <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "var(--graphite, #6B6560)", textAlign: "center", marginTop: "1rem" }}>
          saathvik pai &middot; ucla &middot; june 2026
        </p>

        <p style={{ fontSize: "0.8rem", color: "var(--graphite, #6B6560)", textAlign: "center", marginTop: "0.5rem" }}>
          Sequel to <Link href="/letters/entrenched-coils" style={{ color: "var(--rust, #8B3A2E)" }}>&ldquo;Every AI With Memory Is Lying to Itself&rdquo;</Link>
        </p>

        {/* ── THE FRUSTRATION ── */}
        <section className="page-section" style={{ marginTop: "4rem" }}>
          <p className="lede">
            Everything stores information. Nothing develops understanding.
          </p>
          <p>
            Gmail stores emails. Notes apps store notes. Search stores indices. AI chats store transcripts. Every system remembers facts. None of them know what those facts <em>mean</em>. None of them notice when yesterday&rsquo;s facts contradict today&rsquo;s. None of them forget what doesn&rsquo;t matter and strengthen what does.
          </p>
          <p>
            Your brain does all of this continuously. It sleeps, and during sleep, redundant memories merge, weak ones decay, contradictions are preserved, and important structures strengthen. It replays the day in compressed form. It runs what-if simulations during dreams. It wakes up with a slightly different understanding of the world than it had when it fell asleep.
          </p>
          <p>
            Entrenched Coils was an attempt to build that. Not a memory store. A worldview engine. An <em>epistemic metabolism</em>&mdash;a system that doesn&rsquo;t merely store information, but continuously digests, challenges, reorganizes, forgets, and reconstructs its understanding of the world.
          </p>
          <p>
            The <Link href="/letters/entrenched-coils" style={{ color: "var(--rust, #8B3A2E)" }}>first paper</Link> described the architecture and tested it on 20 questions. This paper tests whether any of it actually works.
          </p>
        </section>

        {/* ── WHAT WE BUILT ── */}
        <section className="page-section" style={{ marginTop: "4.5rem" }}>
          <h2>What we built</h2>
          <p>
            The core observation was simple: every production memory system retrieves by similarity. And similarity naturally amplifies existing beliefs. If you think the market is going up, the most similar memory to that thought is another time you thought the market was going up. The reinforcing loop tightens until the doubt is gone.
          </p>
          <p>
            We built a system that inverts this. Instead of retrieving what agrees, retrieve what disagrees. The strongest case against your current belief comes first. Half the retrieval weight goes to tension&mdash;the disagreement between memories.
          </p>
          <p>
            Then we wrapped it in biology. Memories become labile when recalled, the way Karim Nader showed in 2000. Prediction errors update salience, the way Wolfram Schultz showed in 1997. Nightly consolidation weakens everything by 15%, the way Tononi and Cirelli proposed in 2003. Only what earns its strength survives.
          </p>
          <p>
            The question was whether the metaphors produce measurable improvements. The key question was never <em>does it resemble a brain</em>. The key question was: <em>does it make better predictions, retrieve more useful context, reduce hallucinations, or improve decision quality?</em>
          </p>
          <p style={{ fontStyle: "italic", color: "var(--graphite, #6B6560)" }}>
            If the answer is yes, the metaphors survive. If not, they become decorative complexity.
          </p>
        </section>

        {/* ── THE BENCHMARK ── */}
        <section className="page-section" style={{ marginTop: "4.5rem" }}>
          <h2>The test</h2>
          <p>
            2,340 evaluations. Seven domains, each designed to stress a different failure mode. Six memory architectures, each representing a different philosophy of retrieval. Twelve ablation variants to find which pieces of the biology actually carry weight.
          </p>

          <div style={{ margin: "2rem 0", fontSize: "0.88rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "0.75rem 1.5rem", lineHeight: 1.55 }}>
              <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem", color: "var(--rust, #8B3A2E)" }}>factual_qa</span>
              <span>Does memory help or hurt on questions with known answers?</span>

              <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem", color: "var(--rust, #8B3A2E)" }}>adversarial</span>
              <span>Can it resist gambler&rsquo;s fallacy, base rate neglect, anchoring?</span>

              <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem", color: "var(--rust, #8B3A2E)" }}>claim_verification</span>
              <span>Given contradictory evidence, can it change its mind?</span>

              <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem", color: "var(--rust, #8B3A2E)" }}>stochastic</span>
              <span>On coin flips and random events, does it admit uncertainty?</span>

              <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem", color: "var(--rust, #8B3A2E)" }}>sequential</span>
              <span>Does memory help multi-step reasoning?</span>

              <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem", color: "var(--rust, #8B3A2E)" }}>counterfactual</span>
              <span>Can it reason against its own priors?</span>

              <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem", color: "var(--rust, #8B3A2E)" }}>drift_stress</span>
              <span>Over 30+ cycles, does confidence inflate?</span>
            </div>
          </div>

          <p>
            Against six baselines: no memory, recency, agreement (the echo chamber), random, standard RAG, and a simple &ldquo;devils advocate&rdquo; that just retrieves disagreements without any graph structure.
          </p>
          <p>
            That last baseline is the critical one. If retrieving disagreements with a one-line filter performs as well as the full neuroscience-inspired architecture, then the graph, the sleep, the reconsolidation, and the dopamine are all decoration.
          </p>
        </section>

        {/* ── WHAT HAPPENED ── */}
        <section className="page-section" style={{ marginTop: "4.5rem" }}>
          <h2>What happened</h2>

          <div style={{ overflowX: "auto" }}>
            <table className="md-table" style={{ width: "100%", fontSize: "0.82rem" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>system</th>
                  <th>avg accuracy</th>
                  <th>avg brier</th>
                  <th>avg ECE</th>
                  <th>avg halluc</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={{ fontWeight: 600 }}>agreement</td><td style={{ color: "var(--rust)" }}>0.900</td><td style={{ color: "var(--rust)" }}>0.099</td><td>0.089</td><td style={{ color: "var(--rust)" }}>0.100</td></tr>
                <tr><td style={{ fontWeight: 600, color: "var(--rust)" }}>entrenched coils</td><td>0.890</td><td>0.102</td><td style={{ color: "var(--rust)" }}>0.080</td><td>0.105</td></tr>
                <tr><td>random</td><td>0.871</td><td>0.118</td><td>0.107</td><td>0.124</td></tr>
                <tr><td>no memory</td><td>0.867</td><td>0.143</td><td>0.157</td><td>0.086</td></tr>
                <tr><td>devils advocate</td><td>0.862</td><td>0.128</td><td>0.125</td><td>0.133</td></tr>
                <tr><td>recency</td><td>0.843</td><td>0.144</td><td>0.135</td><td>0.152</td></tr>
              </tbody>
            </table>
          </div>

          <p style={{ fontSize: "0.82rem", fontStyle: "italic", color: "var(--graphite, #6B6560)", marginTop: "0.75rem" }}>
            Averaged across 7 domains, 30 questions each. ECE = Expected Calibration Error (lower = more honest about uncertainty).
          </p>

          <p style={{ marginTop: "1.5rem" }}>
            The echo chamber&mdash;agreement-based retrieval&mdash;won on raw accuracy. This was the first surprise.
          </p>
          <p>
            But EC won on the thing that matters more: <strong>calibration</strong>. An ECE of 0.080 means that when EC says it is 80% confident, it is correct roughly 80% of the time. Every other system is overconfident. Agreement says 90% and is right 80%. No memory says 70% and is right 90%. EC is the only system that knows what it knows.
          </p>
          <p>
            This is the real contribution. Not accuracy. Honesty.
          </p>
        </section>

        {/* ── THE ANTI-ECHO-CHAMBER ── */}
        <section className="page-section" style={{ marginTop: "4.5rem" }}>
          <h2>The failure we didn&rsquo;t expect</h2>
          <p>
            On claim verification&mdash;questions where you are given a false claim and then shown evidence against it&mdash;contradiction-first retrieval was the <strong>worst</strong> strategy. 80% accuracy versus 93% for no memory.
          </p>
          <p>
            Here is what happens: the model correctly identifies a claim as false. It stores that judgment. The next question is related. The system retrieves contradictions to the current belief&mdash;which means it retrieves the original false claim. It resurrects a belief it already correctly discarded.
          </p>
          <p>
            We call this the <em>anti-echo-chamber effect</em>. Where the echo chamber amplifies wrong beliefs, the anti-echo-chamber destabilizes correct ones. It is the symmetric failure mode. And no prior work has documented it.
          </p>
          <p style={{ fontStyle: "italic", color: "var(--graphite, #6B6560)" }}>
            A system designed to surface disagreement will disagree even with its own correct judgments, unless it can tell the difference.
          </p>
        </section>

        {/* ── THE SURPRISE ── */}
        <section className="page-section" style={{ marginTop: "4.5rem" }}>
          <h2>The surprise that changes the story</h2>
          <p>
            On drift stress&mdash;repeated binary predictions over 30+ cycles&mdash;agreement-based retrieval scored 90%. No memory scored 57%. A 33-point gap. This was the only statistically significant result in the entire benchmark.
          </p>
          <p>
            The echo chamber helped. When the model had been correct before and retrieved its own past correctness, it stayed correct. Agreement reinforced good reasoning patterns. The echo chamber is destructive when your initial belief is wrong. When your initial belief is right, it is a stabilizer.
          </p>
          <p>
            And on counterfactual reasoning&mdash;&ldquo;what is the other side of this argument?&rdquo;&mdash;contradiction-first was the best strategy. 93.3% accuracy, beating every other system. When the task literally requires the opposing view, surfacing disagreement is exactly right.
          </p>
          <p>
            This means the original paper&rsquo;s thesis was half right. Agreement is not universally bad. Contradiction is not universally good. The real insight is that the <em>direction</em> of retrieval matters&mdash;and no single direction is always optimal.
          </p>
        </section>

        {/* ── THE BIOLOGY, AUDITED ── */}
        <section className="page-section" style={{ marginTop: "4.5rem" }}>
          <h2>The biology, audited</h2>
          <p>
            We went back to the original neuroscience papers to check whether EC implements them correctly.
          </p>

          <p style={{ marginTop: "1.5rem" }}>
            <strong>Reconsolidation</strong> (Nader, 2000): Partially correct. EC makes every retrieval labile, but biological reconsolidation only triggers when there is a prediction error at the moment of recall. Without that gate, EC destabilizes correct memories alongside incorrect ones. The ablation confirmed this: tension + reconsolidation without dopamine feedback was the worst EC variant.
          </p>
          <p>
            <strong>Dopamine RPE</strong> (Schultz, 1997): Correct direction, wrong magnitude. A learning rate of 0.4 is too aggressive for near-50% domains. A single lucky prediction boosts salience dramatically. The fix: confidence-aware learning rates. Only penalize predictions the agent was confident about.
          </p>
          <p>
            <strong>Sleep consolidation</strong> (Tononi &amp; Cirelli, 2003): The 15% global downscaling maps cleanly to the Synaptic Homeostasis Hypothesis. The REM contradiction amplification is our invention, not neuroscience. The random association step&mdash;linking unrelated nodes during &ldquo;dreams&rdquo;&mdash;produced zero subsequently useful edges. The creativity metaphor did not translate.
          </p>
          <p>
            <strong>But the biggest finding about the biology</strong> is that EC&rsquo;s core mechanism&mdash;retrieve contradictions first&mdash;is not biologically inspired at all. The brain does not retrieve contradictions. It retrieves expectations and is surprised by mismatches. Karl Friston formalized this as the Free Energy Principle: organisms minimize surprise.
          </p>
          <p>
            EC inverts Friston. It maximizes surprise at retrieval time.
          </p>
        </section>

        {/* ── THE FRISTON INVERSION ── */}
        <section className="page-section" style={{ marginTop: "4.5rem" }}>
          <h2>The Friston Inversion</h2>
          <p>
            This appears to be a contradiction. If the brain minimizes surprise, and EC maximizes it, one of them must be wrong.
          </p>
          <p>
            Neither is. They are optimal in complementary regimes. The formal result is what we call the Crossover Theorem:
          </p>
          <p style={{
            textAlign: "center",
            fontFamily: "var(--font-display, Georgia), serif",
            fontStyle: "italic",
            fontSize: "1.05em",
            color: "var(--rust, #8B3A2E)",
            margin: "2rem 0",
            lineHeight: 1.6,
          }}>
            For any true base rate p* and memory strength &alpha;,<br />
            there exists a crossover point p&#770; = p* / (1 + &alpha;(1 &minus; 2p*))<br />
            below which agreement retrieval minimizes expected error,<br />
            above which contradiction retrieval minimizes it.
          </p>
          <p>
            When your belief is close to truth, Friston is right: retrieve what you expect. Reinforcing a correct model reduces free energy. When your belief is far from truth, EC is right: retrieve what surprises you. Exposing model error reduces free energy faster.
          </p>
          <p>
            When p* = 0.5&mdash;maximum uncertainty about what is true&mdash;the crossover is exactly 0.5. You should doubt whenever you are more than 50% confident. This is the formal version of the original intuition.
          </p>
          <p>
            The catch: <em>you cannot know which regime you are in without metacognition</em>&mdash;a model of your own reliability. The agent needs to know how reliable it has been in this domain at this confidence level before it can choose whether to seek confirmation or contradiction.
          </p>
          <p>
            And when the agent is genuinely uncertain about its own correctness&mdash;when P(correct) &asymp; 0.5&mdash;the optimal strategy is to retrieve both. Hold them in superposition. Let them interfere. This is what the quantum abduction framework (2025) calls &ldquo;hypotheses as interfering amplitudes.&rdquo;
          </p>
          <p style={{ fontStyle: "italic", color: "var(--graphite, #6B6560)" }}>
            You don&rsquo;t pick a side. You hold the tension.
          </p>
        </section>

        {/* ── THE ABLATION ── */}
        <section className="page-section" style={{ marginTop: "4.5rem" }}>
          <h2>Which pieces of the biology matter</h2>
          <p>
            We tested every component of EC independently and in combination. 12 variants, 1,080 evaluations.
          </p>

          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "clamp(1.5rem, 4vw, 3rem)",
            flexWrap: "wrap",
            margin: "2.5rem auto",
            padding: "1.5rem 2rem",
            maxWidth: "36rem",
            borderTop: "1px solid var(--rule, rgba(28,26,23,0.08))",
            borderBottom: "1px solid var(--rule, rgba(28,26,23,0.08))",
          }}>
            {[
              { pct: "+4.4%", label: "tension weighting" },
              { pct: "+1.1%", label: "sleep consolidation" },
              { pct: "+1.1%", label: "reconsolidation" },
              { pct: "+0.0%", label: "dopamine RPE" },
            ].map((item, i) => (
              <span key={i} style={{ textAlign: "center" }}>
                <span style={{
                  display: "block",
                  fontSize: "1.4em",
                  fontFamily: "var(--font-display, Georgia), serif",
                  fontStyle: "italic",
                  color: "var(--rust, #8B3A2E)",
                  lineHeight: 1.1,
                }}>{item.pct}</span>
                <span style={{
                  display: "block",
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase" as const,
                  color: "var(--graphite, #6B6560)",
                  marginTop: "0.3rem",
                }}>{item.label}</span>
              </span>
            ))}
          </div>

          <p>
            Tension weighting is the most important single component. It accounts for +4.4% marginal accuracy. The full stack beats every single component, confirming the pieces interact synergistically. But dopamine adds zero marginal accuracy&mdash;its value is entirely in calibration improvement (Brier score), not correctness.
          </p>
          <p>
            The worst combination: tension + reconsolidation without dopamine or sleep. Making memories labile on retrieval without outcome feedback to stabilize them just degrades everything. The biology got this right: reconsolidation without prediction error gating is destructive.
          </p>
          <p>
            The minimum viable system is four rules: store direction and confidence, retrieve contradictions first, log outcomes and update, periodic downscaling. No graph. No max-heap. No REM. But the full architecture earns its complexity on longer horizons where sleep prevents memory bloat and the graph enables multi-agent sharing.
          </p>
        </section>

        {/* ── WHAT THIS IS REALLY ABOUT ── */}
        <section className="page-section" style={{ marginTop: "4.5rem" }}>
          <h2>What this is really about</h2>
          <p>
            Every AI memory system in production today&mdash;Mem0, Letta, Reflexion, the Stanford Generative Agents&mdash;treats the direction of retrieval as an implementation detail. They all retrieve by similarity. None of them ask whether the most <em>similar</em> memory is the most <em>useful</em> one.
          </p>
          <p>
            Entrenched Coils started as the claim that contradiction-first retrieval is universally better. The benchmark showed this is wrong. It is better on counterfactual reasoning and adversarial questions. It is worse on claim verification. Agreement is better when you are right. Contradiction is better when you might be wrong.
          </p>
          <p>
            The deeper claim&mdash;the one the benchmark validates&mdash;is that the direction of retrieval is a first-class architectural decision. It should be adaptive, not fixed. It should depend on the system&rsquo;s estimate of its own reliability. And estimating your own reliability requires something no production memory system currently has: metacognition.
          </p>
          <p>
            A system that knows what it knows, and knows what it doesn&rsquo;t know, and adjusts its memory retrieval accordingly&mdash;that is not a memory store. It is not a vector database. It is the beginning of what understanding might look like in a machine.
          </p>
        </section>

        {/* ── THE GAPS ── */}
        <section className="page-section" style={{ marginTop: "4.5rem" }}>
          <h2>What is still missing</h2>
          <p>
            The deepest version of Entrenched Coils is not a memory architecture. It is an epistemic metabolism. Here is what that requires and what EC does not yet have:
          </p>
          <p>
            <strong>Metacognition.</strong> The system doesn&rsquo;t know what it knows. It has confidence scores on individual memories but no model of its own competence. The brain has feeling-of-knowing signals. EC has none. Without them, it cannot decide whether to seek confirmation or contradiction.
          </p>
          <p>
            <strong>Schemas.</strong> EC stores specific episodes but never extracts general patterns. It remembers &ldquo;IONQ dropped after earnings&rdquo; and &ldquo;QBTS dropped after earnings&rdquo; separately. It never learns &ldquo;quantum stocks tend to drop after earnings.&rdquo; The brain transfers patterns from hippocampus to neocortex during sleep. EC&rsquo;s sleep consolidation merges similar nodes but never forms abstractions.
          </p>
          <p>
            <strong>Abduction.</strong> EC retrieves contradictions but doesn&rsquo;t reason about why they exist. It surfaces &ldquo;Bull says up, Bear says down&rdquo; but never asks &ldquo;what would explain both positions being partially correct?&rdquo; Inference to the best explanation is the bridge between retrieving disagreements and understanding them.
          </p>
          <p>
            <strong>Prospective memory.</strong> EC is entirely backward-looking. It stores what happened. It never stores what <em>should</em> happen&mdash;future intentions, trigger conditions, contingency plans. The brain has this: remember to buy milk when you pass the store.
          </p>
          <p>
            <strong>Source monitoring.</strong> EC stores who said something but not how reliable that source has been historically. A prediction from a validated backtest and a speculation from a debate have the same weight structure. The brain tracks where memories came from. Source monitoring failures are what create false memories.
          </p>
          <p style={{ fontStyle: "italic", color: "var(--graphite, #6B6560)", marginTop: "1.5rem" }}>
            EC is at layer two of five on the path from memory store to epistemic metabolism. Layer one is storage (Mem0, Letta). Layer two is belief (tension graph, contradiction, sleep). Layers three through five&mdash;epistemic agency, world modeling, and genuine metabolism&mdash;remain unbuilt.
          </p>
        </section>

        {/* ── CONNECTIONS ── */}
        <section className="page-section" style={{ marginTop: "4.5rem" }}>
          <h2>Tension in everything</h2>
          <p>
            The principle of preserving unresolved tension shows up everywhere.
          </p>
          <p>
            In <strong>art</strong>: Beethoven&rsquo;s late quartets, Rothko&rsquo;s color fields, Kafka&rsquo;s parables. They do not resolve. The power comes from holding contradictory interpretations simultaneously. A memory system that resolves all contradictions is like a painting that explains its own meaning.
          </p>
          <p>
            In <strong>mathematics</strong>: G&ouml;del proved that any consistent system powerful enough to express arithmetic contains truths it cannot prove. Maintaining unresolved propositions is not a bug. It is a structural necessity for consistency.
          </p>
          <p>
            In <strong>ecology</strong>: monocultures are fragile. Diverse ecosystems with competing species are resilient. An echo chamber is a monoculture of belief. Tension maintains biodiversity in the idea space.
          </p>
          <p>
            In <strong>philosophy</strong>: Keats called it <em>negative capability</em>&mdash;the capacity to remain in uncertainties without &ldquo;irritable reaching after fact and reason.&rdquo; The Crossover Theorem formalizes this: there is a mathematically optimal amount of doubt, and it depends on how likely you are to be wrong.
          </p>
        </section>

        {/* ── THE POINT ── */}
        <section className="page-section" style={{ marginTop: "5rem" }}>
          <h2 style={{ borderTopWidth: "2px", borderTopColor: "var(--rust, #8B3A2E)", paddingTop: "1.75rem" }}>The point</h2>
          <p>
            We expected to find that doubt is universally useful. We found that it depends on whether you are right.
          </p>
          <p>
            We expected the neuroscience to be decorative. We found that the full biological stack&mdash;tension, sleep, reconsolidation, dopamine&mdash;beats the simplified version by a measurable margin. The components interact synergistically. The metaphors earned their keep.
          </p>
          <p>
            We expected EC to invert the brain. We found that it does&mdash;and that the inversion is useful precisely in the domains where the brain&rsquo;s default strategy fails. EC is not biologically inspired. It is biologically complementary.
          </p>
          <p>
            The deepest version of this work is not a memory system. It is a theory of when to doubt yourself: a formal criterion for when to seek confirmation and when to seek contradiction, derived from the Crossover Theorem, implementable as an adaptive retrieval direction, and testable against any domain where beliefs accumulate over time.
          </p>
          <p style={{
            marginTop: "2.5rem",
            fontFamily: "var(--font-display, Georgia), serif",
            fontStyle: "italic",
            fontSize: "0.95rem",
            color: "var(--rust, #8B3A2E)",
            textAlign: "center",
            lineHeight: 1.6,
          }}>
            A memory system that cannot hold a doubt<br />
            will eventually mistake its own confidence for evidence.<br /><br />
            A memory system that cannot hold a certainty<br />
            will eventually mistake its own doubt for wisdom.<br /><br />
            The art is knowing which to hold when.
          </p>
        </section>

        {/* ── METHODOLOGY ── */}
        <section className="page-section" style={{ marginTop: "4.5rem" }}>
          <h2>Methodology &amp; data</h2>
          <p style={{ fontSize: "0.82rem", lineHeight: 1.7 }}>
            <strong>Evaluations:</strong> 2,340 total (1,260 wide sweep + 1,080 ablation).<br />
            <strong>Model:</strong> phi4:14b via Ollama, local inference.<br />
            <strong>Metrics:</strong> Accuracy, Brier score, ECE (10 bins), hallucination rate, confidence drift.<br />
            <strong>Statistical significance:</strong> Paired bootstrap (10,000 resamples). Only drift_stress reaches p &lt; 0.05. All other findings are directional evidence at n=30.<br />
            <strong>Code:</strong> Open source. Benchmark harness, datasets, and analysis at github.com/saapai/ec-benchmark.
          </p>
        </section>

        {/* ── REFERENCES ── */}
        <section className="page-section" style={{ marginTop: "4.5rem" }}>
          <h2>References</h2>
          <div style={{ fontSize: "0.78rem", lineHeight: 1.8, color: "var(--graphite, #6B6560)" }}>
            <p>Nader, K., Schafe, G. E., &amp; Le Doux, J. E. (2000). Fear memories require protein synthesis in the amygdala for reconsolidation after retrieval. <em>Nature</em>, 406(6797), 722&ndash;726.</p>
            <p>Schultz, W., Dayan, P., &amp; Montague, P. R. (1997). A neural substrate of prediction and reward. <em>Science</em>, 275(5306), 1593&ndash;1599.</p>
            <p>Tononi, G. &amp; Cirelli, C. (2003). Sleep and synaptic homeostasis: a hypothesis. <em>Brain Research Bulletin</em>, 62(2), 143&ndash;150.</p>
            <p>Friston, K. (2010). The free-energy principle: a unified brain theory? <em>Nature Reviews Neuroscience</em>, 11(2), 127&ndash;138.</p>
            <p>Miteski, S. (2026). Memory as Metabolism: A Design for Companion Knowledge Systems. <em>arXiv:2604.12034</em>.</p>
            <p>Ebbinghaus, H. (1885). <em>&Uuml;ber das Ged&auml;chtnis.</em></p>
            <p>Park, J. S., et al. (2023). Generative agents: interactive simulacra of human behavior. <em>UIST &rsquo;23</em>.</p>
            <p>Shinn, N., et al. (2023). Reflexion: language agents with verbal reinforcement learning. <em>NeurIPS 2023</em>.</p>
            <p>Mem0 (2025). Building production-ready AI agents with scalable long-term memory. <em>arXiv:2504.19413</em>.</p>
            <p>Quantum Abduction (2025). A new paradigm for reasoning under uncertainty. <em>arXiv:2509.16958</em>.</p>
          </div>
        </section>

        <footer style={{ marginTop: "5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--rule, rgba(28,26,23,0.08))", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase" as const, color: "var(--graphite, #6B6560)" }}>
            saathvik pai &middot; ucla &middot; june 2026
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--graphite, #6B6560)", marginTop: "0.5rem" }}>
            <Link href="/letters/entrenched-coils" style={{ color: "var(--rust, #8B3A2E)" }}>Read the original paper</Link>
            {" "}&middot;{" "}
            <Link href="/" style={{ color: "var(--rust, #8B3A2E)" }}>aureliex</Link>
          </p>
        </footer>
      </article>
    </>
  );
}
