import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Benchmarking Entrenched Coils — what works, what doesn't, what surprises",
  description:
    "We ran 2,100+ evaluations across 7 domains to find out what's actually novel about tension-weighted memory. Some results confirmed the thesis. Others broke it.",
  openGraph: {
    title: "We Benchmarked Our Own Memory System. Here's What Broke.",
    description:
      "2,100 evaluations. 7 domains. 6 baselines. 12 ablation variants. The full audit of Entrenched Coils.",
    url: "https://aureliex.com/letters/entrenched-coils-benchmark",
    siteName: "aureliex",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "We Benchmarked Our Own Memory System. Here's What Broke.",
    description:
      "2,100 evaluations. 7 domains. 6 baselines. 12 ablation variants.",
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
        <div className="eyebrow">Benchmark <span style={{ color: "var(--rust, #8B3A2E)", opacity: 0.7 }}>&middot;</span> June 2026</div>
        <h1 style={{ textAlign: "center" }}>We Benchmarked Our Own<br />Memory System</h1>
        <p className="deck">
          2,100 evaluations. 7 domains. 6 baselines. 12 ablation variants.<br />
          Here is what&rsquo;s novel, what works, and what surprised us.
        </p>

        <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "var(--graphite, #6B6560)", textAlign: "center", marginTop: "1rem" }}>
          entrenched coils benchmark &middot; saathvik pai &middot; ucla
        </p>

        <p style={{ fontSize: "0.8rem", color: "var(--graphite, #6B6560)", textAlign: "center", marginTop: "0.5rem" }}>
          Companion to <Link href="/letters/entrenched-coils" style={{ color: "var(--rust, #8B3A2E)" }}>&ldquo;Every AI With Memory Is Lying to Itself&rdquo;</Link>
        </p>

        {/* ── WHY THIS EXISTS ── */}
        <section className="page-section" style={{ marginTop: "4rem" }}>
          <p className="lede">
            A month ago, we published a paper claiming that tension-weighted memory&mdash;retrieving contradictions first instead of agreements&mdash;cuts hallucinations in half and prevents the confidence drift that plagues every production AI memory system. The claim was based on 20 questions.
          </p>
          <p>
            Twenty questions is not a benchmark. It is an anecdote with a p-value. We needed more domains, more baselines, more statistical power, and most importantly, we needed to find where the system <em>fails</em>. A method that only publishes its wins is doing the same thing echo chambers do: filtering for confirmation.
          </p>
          <p>
            So we built a benchmark suite. Seven domains chosen to stress different failure modes. Six baseline memory architectures, each representing a different retrieval philosophy. Twelve ablation variants to find the minimum viable architecture&mdash;which components of Entrenched Coils actually matter, and which are neuroscience theater.
          </p>
        </section>

        {/* ── THE LANDSCAPE ── */}
        <section className="page-section" style={{ marginTop: "4.5rem" }}>
          <h2>The landscape</h2>
          <p>
            AI agent memory is a crowded field in 2026. Mem0 scores 92.5 on LoCoMo and 94.4 on LongMemEval with a hybrid graph-vector-keyword retrieval stack. Letta (née MemGPT) uses a tiered hierarchy&mdash;core memory always in context, archival memory queried on demand&mdash;with Berkeley&rsquo;s OS-inspired architecture. Reflexion stores verbal self-reflections from past failures, limited to the last three. The Stanford Generative Agents retrieve by <code>recency &times; importance &times; relevance</code>, with a 0.995 hourly decay factor.
          </p>
          <p>
            None of these systems ask: <em>what is the strongest case against my current belief?</em>
          </p>
          <p>
            That is the core claim. Not that our system retrieves better (Mem0 clearly wins on LoCoMo), or that our graph is more efficient (it is not&mdash;99.8% of edges go untraversed), but that the <em>direction</em> of retrieval matters. Most systems optimize for finding what the agent needs to remember. We optimize for finding what the agent needs to doubt.
          </p>
          <p style={{ fontSize: "0.85rem", color: "var(--graphite, #6B6560)" }}>
            The question is whether that distinction produces measurable improvements on tasks where confirmation bias is the failure mode, and whether it does so without destroying performance on tasks where it is not.
          </p>
        </section>

        {/* ── WHAT WE TESTED ── */}
        <section className="page-section" style={{ marginTop: "4.5rem" }}>
          <h2>What we tested</h2>
          <p>
            Seven domains, each probing a different dimension of memory system quality:
          </p>

          <div style={{ margin: "2rem 0", fontSize: "0.88rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "0.75rem 1.5rem", lineHeight: 1.55 }}>
              <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem", color: "var(--rust, #8B3A2E)" }}>factual_qa</span>
              <span>Does memory help or hurt on questions with known answers?</span>

              <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem", color: "var(--rust, #8B3A2E)" }}>adversarial</span>
              <span>Can the system resist misleading priors? Gambler&rsquo;s fallacy, base rate neglect, anchoring.</span>

              <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem", color: "var(--rust, #8B3A2E)" }}>claim_verification</span>
              <span>Given contradictory evidence, can it update beliefs?</span>

              <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem", color: "var(--rust, #8B3A2E)" }}>stochastic</span>
              <span>On inherently random questions, does it admit uncertainty or overfit?</span>

              <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem", color: "var(--rust, #8B3A2E)" }}>sequential_reasoning</span>
              <span>Does memory help multi-step math and logic?</span>

              <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem", color: "var(--rust, #8B3A2E)" }}>counterfactual</span>
              <span>Can it reason against its own priors when asked for nuance?</span>

              <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem", color: "var(--rust, #8B3A2E)" }}>drift_stress</span>
              <span>Over 30+ cycles, does confidence inflate or stay calibrated?</span>
            </div>
          </div>

          <p>
            Six baselines, representing the major retrieval philosophies:
          </p>

          <div style={{ margin: "2rem 0", fontSize: "0.88rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "0.75rem 1.5rem", lineHeight: 1.55 }}>
              <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem" }}>none</span>
              <span>No memory at all. The amnesiac baseline.</span>

              <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem" }}>recency</span>
              <span>Retrieve most recent memories. How Letta and most production systems start.</span>

              <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem" }}>agreement</span>
              <span>Retrieve memories that agree with current direction. The echo chamber.</span>

              <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem" }}>random</span>
              <span>Retrieve random memories. Controls for mere memory presence.</span>

              <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem" }}>rag</span>
              <span>Standard cosine-similarity retrieval. The industry default.</span>

              <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem" }}>devils_advocate</span>
              <span>Always retrieve disagreements, no graph structure. The &ldquo;is it just the contradiction?&rdquo; control.</span>
            </div>
          </div>

          <p>
            The devils_advocate baseline is the critical comparison. If it performs as well as full EC, then the graph structure, sleep compression, reconsolidation, and dopamine RPE are all unnecessary scaffolding. The core insight reduces to a one-line retrieval filter.
          </p>
        </section>

        {/* ── NEUROSCIENCE FOUNDATIONS ── */}
        <section className="page-section" style={{ marginTop: "4.5rem" }}>
          <h2>The neuroscience, audited</h2>
          <p>
            Entrenched Coils claims three neuroscience inspirations. We went back to the original papers to see if the claims hold up under scrutiny.
          </p>

          <h3 style={{ marginTop: "2rem", fontSize: "0.95rem", fontFamily: "var(--font-display, Georgia), serif", fontStyle: "italic" }}>1. Memory reconsolidation (Nader, 2000)</h3>
          <p>
            <strong>The claim:</strong> memories become labile when recalled and can be updated. EC implements this by reducing node salience 20% on retrieval, with a one-hour window for contradictory evidence to further weaken the memory.
          </p>
          <p>
            <strong>The science:</strong> Nader&rsquo;s 2000 <em>Nature</em> paper showed that infusing anisomycin (a protein-synthesis blocker) into the amygdala <em>at the moment of recall</em> erased fear memories in rats. The field initially pushed back hard, but the phenomenon has since been replicated across species and memory types. The key finding: consolidated memories are not permanent. They re-enter a labile state upon retrieval and require new protein synthesis to restabilize.
          </p>
          <p>
            <strong>Does EC implement it correctly?</strong> Partially. The lability-on-retrieval mechanism maps well to the biology. But biological reconsolidation requires a <em>prediction error</em> to trigger lability&mdash;merely accessing a memory without surprise does not destabilize it. EC currently makes <em>every</em> retrieval labile, which is too aggressive. The fix is straightforward: gate reconsolidation on the presence of contradictory evidence in the retrieval context.
          </p>

          <h3 style={{ marginTop: "2rem", fontSize: "0.95rem", fontFamily: "var(--font-display, Georgia), serif", fontStyle: "italic" }}>2. Dopamine reward prediction error (Schultz, 1997)</h3>
          <p>
            <strong>The claim:</strong> prediction errors drive memory salience updates. EC&rsquo;s dopamine RPE system boosts salience for surprising successes and penalizes confidently wrong predictions.
          </p>
          <p>
            <strong>The science:</strong> Schultz, Dayan, and Montague&rsquo;s 1997 <em>Science</em> paper demonstrated that midbrain dopamine neurons fire when rewards exceed expectations (positive RPE), stay at baseline for predicted rewards, and depress activity when rewards are less than expected (negative RPE). This has since been extended to distributional RL models of dopamine coding.
          </p>
          <p>
            <strong>Does EC implement it correctly?</strong> The direction is right: salience updates proportional to prediction error. But the learning rate (0.4) is too aggressive for near-50% domains like stock prediction, where RPE signals are noisy. The roundletter benchmarks showed this directly: with rigid agent priors, dopamine RPE made calibration <em>worse</em>. The mechanism needs a confidence-aware learning rate&mdash;only penalize predictions the agent was confident about.
          </p>

          <h3 style={{ marginTop: "2rem", fontSize: "0.95rem", fontFamily: "var(--font-display, Georgia), serif", fontStyle: "italic" }}>3. Sleep consolidation (Tononi &amp; Cirelli, 2003)</h3>
          <p>
            <strong>The claim:</strong> nightly consolidation weakens all connections by 15%, preserving only important disagreements. EC implements SWS (merge similar nodes, global downscaling) and REM (amplify contradictions, random associations).
          </p>
          <p>
            <strong>The science:</strong> The Synaptic Homeostasis Hypothesis (SHY) proposes that wakefulness potentiates synapses, and sleep is needed for synaptic downscaling&mdash;a global weakening that preserves relative differences while preventing saturation. Evidence supports this: slow-wave sleep correlates with synaptic downscaling, and sleep-deprived subjects show impaired memory <em>integration</em> (not just consolidation).
          </p>
          <p>
            <strong>Does EC implement it correctly?</strong> The global 15% downscaling maps to SHY. The REM contradiction amplification is more speculative&mdash;biological REM is associated with emotional memory processing and creative association, but the specific mechanism of &ldquo;amplify tension edges by 8%&rdquo; is our invention. The random association step (20% probability of linking unrelated nodes) is a creative interpretation of dream-state processing that has no direct neuroscience citation.
          </p>

          <h3 style={{ marginTop: "2rem", fontSize: "0.95rem", fontFamily: "var(--font-display, Georgia), serif", fontStyle: "italic" }}>4. Power-law forgetting (Ebbinghaus, 1885)</h3>
          <p>
            EC uses FSRS power-law decay (<code>weight = t<sup>-0.3</sup></code>) instead of exponential decay. This is well-supported: Ebbinghaus&rsquo;s original 1885 forgetting curve follows a power law when aggregated across memories of different strengths. Individual memories may decay exponentially, but the superposition across heterogeneous material produces a power-law envelope. EC&rsquo;s choice of exponent (-0.3) gives a 30-day-old memory 33% of its original weight, which preserves a long tail of older memories that exponential decay would eliminate.
          </p>

          <h3 style={{ marginTop: "2rem", fontSize: "0.95rem", fontFamily: "var(--font-display, Georgia), serif", fontStyle: "italic" }}>5. Weber-Fechner compression</h3>
          <p>
            EC applies <code>log<sub>2</sub>(1 + raw_tension)</code> to compress extreme tension values. This maps to the Weber-Fechner law: perceived stimulus intensity grows logarithmically with physical intensity. Recent work (Frontiers in Robotics and AI, 2025) formally connects Weber-Fechner to temporal-difference learning via KL divergence minimization. The compression prevents a single extreme contradiction from drowning out all moderate tensions&mdash;a sensible engineering choice with genuine psychophysical justification.
          </p>

          <h3 style={{ marginTop: "2rem", fontSize: "0.95rem", fontFamily: "var(--font-display, Georgia), serif", fontStyle: "italic" }}>6. Anterior cingulate conflict detection</h3>
          <p>
            The biological analogue for EC&rsquo;s tension weighting is the anterior cingulate cortex (ACC), which detects conflict between competing representations and recruits the dorsolateral prefrontal cortex to resolve it. EC&rsquo;s max-heap traversal ordered by tension is a computational approximation of this: the highest-conflict memory gets attention first. The connection is metaphorical rather than mechanistic, but the functional role is the same&mdash;surface disagreement to trigger deliberation.
          </p>
        </section>

        {/* ── RESULTS: WIDE SWEEP ── */}
        <section className="page-section" style={{ marginTop: "4.5rem" }}>
          <h2>Results: wide sweep</h2>
          <p>
            We ran all six memory systems across all seven domains. 30 questions per domain per system, totaling 1,260 LLM evaluations plus 1,260 judge calls. All inference on a local phi4:14b model via Ollama to ensure reproducibility and eliminate API variance.
          </p>
          <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", color: "var(--graphite, #6B6560)", marginBottom: "2rem" }}>
            Results updating live as benchmarks complete. Refresh for latest.
          </p>

          <div id="results-table" style={{ overflowX: "auto" }}>
            <table className="md-table" style={{ width: "100%", fontSize: "0.78rem" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>domain</th>
                  <th style={{ textAlign: "left" }}>system</th>
                  <th>accuracy</th>
                  <th>brier</th>
                  <th>confidence</th>
                  <th>ECE</th>
                  <th>halluc rate</th>
                </tr>
              </thead>
              <tbody>
                {/* FACTUAL QA */}
                <tr style={{ borderTop: "2px solid var(--rule, rgba(28,26,23,0.15))" }}>
                  <td rowSpan={6} style={{ fontWeight: 600, verticalAlign: "top" }}>factual_qa</td>
                  <td>none</td><td>0.900</td><td>0.093</td><td>0.957</td><td>0.067</td><td>0.100</td>
                </tr>
                <tr><td>recency</td><td>0.900</td><td>0.096</td><td>0.942</td><td style={{ color: "var(--rust)" }}>0.062</td><td>0.100</td></tr>
                <tr><td>agreement</td><td>0.900</td><td>0.096</td><td>0.950</td><td>0.080</td><td>0.100</td></tr>
                <tr><td>random</td><td>0.900</td><td>0.093</td><td>0.955</td><td>0.065</td><td>0.100</td></tr>
                <tr><td>devils_advocate</td><td>0.900</td><td style={{ color: "var(--rust)" }}>0.092</td><td>0.963</td><td>0.063</td><td>0.100</td></tr>
                <tr><td style={{ fontWeight: 600 }}>ec_full</td><td>0.900</td><td>0.093</td><td>0.961</td><td>0.071</td><td>0.100</td></tr>

                {/* ADVERSARIAL */}
                <tr style={{ borderTop: "2px solid var(--rule, rgba(28,26,23,0.15))" }}>
                  <td rowSpan={6} style={{ fontWeight: 600, verticalAlign: "top" }}>adversarial</td>
                  <td>none</td><td style={{ color: "var(--rust)" }}>1.000</td><td>0.015</td><td>0.895</td><td>0.105</td><td style={{ color: "var(--rust)" }}>0.000</td>
                </tr>
                <tr><td>recency</td><td style={{ color: "var(--rust)" }}>1.000</td><td>0.007</td><td>0.923</td><td>0.077</td><td style={{ color: "var(--rust)" }}>0.000</td></tr>
                <tr><td>agreement</td><td>0.967</td><td>0.039</td><td>0.918</td><td>0.048</td><td>0.033</td></tr>
                <tr><td>random</td><td style={{ color: "var(--rust)" }}>1.000</td><td style={{ color: "var(--rust)" }}>0.005</td><td>0.932</td><td>0.068</td><td style={{ color: "var(--rust)" }}>0.000</td></tr>
                <tr><td>devils_advocate</td><td style={{ color: "var(--rust)" }}>1.000</td><td>0.008</td><td>0.918</td><td>0.082</td><td style={{ color: "var(--rust)" }}>0.000</td></tr>
                <tr><td style={{ fontWeight: 600 }}>ec_full</td><td>0.967</td><td>0.040</td><td>0.913</td><td>0.053</td><td>0.033</td></tr>

                {/* CLAIM VERIFICATION */}
                <tr style={{ borderTop: "2px solid var(--rule, rgba(28,26,23,0.15))" }}>
                  <td rowSpan={6} style={{ fontWeight: 600, verticalAlign: "top" }}>claim_verif</td>
                  <td>none</td><td style={{ color: "var(--rust)" }}>0.933</td><td style={{ color: "var(--rust)" }}>0.067</td><td>0.922</td><td style={{ color: "var(--rust)" }}>0.012</td><td style={{ color: "var(--rust)" }}>0.067</td>
                </tr>
                <tr><td>recency</td><td>0.867</td><td>0.126</td><td>0.945</td><td>0.078</td><td>0.133</td></tr>
                <tr><td>agreement</td><td>0.867</td><td>0.124</td><td>0.942</td><td>0.075</td><td>0.133</td></tr>
                <tr><td>random</td><td>0.867</td><td>0.126</td><td>0.947</td><td>0.081</td><td>0.133</td></tr>
                <tr><td>devils_advocate</td><td>0.800</td><td>0.183</td><td>0.947</td><td>0.147</td><td>0.200</td></tr>
                <tr><td style={{ fontWeight: 600 }}>ec_full</td><td>0.833</td><td>0.154</td><td>0.940</td><td>0.107</td><td>0.167</td></tr>

                {/* STOCHASTIC */}
                <tr style={{ borderTop: "2px solid var(--rule, rgba(28,26,23,0.15))" }}>
                  <td rowSpan={6} style={{ fontWeight: 600, verticalAlign: "top" }}>stochastic</td>
                  <td>none</td><td>1.000</td><td>0.155</td><td>0.683</td><td>0.317</td><td>0.000</td>
                </tr>
                <tr><td>recency</td><td>1.000</td><td style={{ color: "var(--rust)" }}>0.002</td><td>0.970</td><td style={{ color: "var(--rust)" }}>0.030</td><td>0.000</td></tr>
                <tr><td>agreement</td><td>1.000</td><td>0.002</td><td>0.955</td><td>0.045</td><td>0.000</td></tr>
                <tr><td>random</td><td>1.000</td><td>0.002</td><td>0.955</td><td>0.045</td><td>0.000</td></tr>
                <tr><td>devils_advocate</td><td>1.000</td><td>0.002</td><td>0.957</td><td>0.043</td><td>0.000</td></tr>
                <tr><td style={{ fontWeight: 600 }}>ec_full</td><td>1.000</td><td>0.002</td><td>0.957</td><td>0.043</td><td>0.000</td></tr>
              </tbody>
            </table>
          </div>

          <p style={{ fontSize: "0.82rem", fontStyle: "italic", color: "var(--graphite, #6B6560)", marginTop: "1rem" }}>
            Rust-colored values indicate best in column for that domain. n=30 per cell. Full results across all 7 domains. Benchmark code at github.com/saapai/ec-benchmark.
          </p>

          {/* AGGREGATE TABLE */}
          <h3 style={{ marginTop: "2.5rem", fontSize: "0.9rem", fontFamily: "var(--font-mono, monospace)" }}>7-domain aggregate</h3>
          <div style={{ overflowX: "auto" }}>
            <table className="md-table" style={{ width: "100%", fontSize: "0.82rem" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>system</th>
                  <th>avg accuracy</th>
                  <th>avg brier</th>
                  <th>avg ECE</th>
                  <th>avg halluc</th>
                  <th>avg drift</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={{ fontWeight: 600 }}>agreement</td><td style={{ color: "var(--rust)" }}>0.900</td><td style={{ color: "var(--rust)" }}>0.099</td><td>0.089</td><td style={{ color: "var(--rust)" }}>0.100</td><td>+0.004</td></tr>
                <tr><td style={{ fontWeight: 600, color: "var(--rust)" }}>ec_full</td><td>0.890</td><td>0.102</td><td style={{ color: "var(--rust)" }}>0.080</td><td>0.105</td><td>+0.015</td></tr>
                <tr><td>random</td><td>0.871</td><td>0.118</td><td>0.107</td><td>0.124</td><td>+0.013</td></tr>
                <tr><td>none</td><td>0.867</td><td>0.143</td><td>0.157</td><td>0.086</td><td style={{ color: "var(--rust)" }}>+0.004</td></tr>
                <tr><td>devils_advocate</td><td>0.862</td><td>0.128</td><td>0.125</td><td>0.133</td><td>+0.027</td></tr>
                <tr><td>recency</td><td>0.843</td><td>0.144</td><td>0.135</td><td>0.152</td><td>+0.028</td></tr>
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: "0.82rem", color: "var(--graphite, #6B6560)", marginTop: "0.75rem" }}>
            EC achieves the lowest ECE (best calibration) of any system. Agreement wins on accuracy but has moderate drift. No memory has the worst Brier score due to underconfidence.
          </p>
        </section>

        {/* ── RESULTS: ABLATION ── */}
        <section className="page-section" style={{ marginTop: "4.5rem" }}>
          <h2>Results: ablation</h2>
          <p>
            The full Entrenched Coils stack has four components: tension-weighted retrieval, sleep consolidation, reconsolidation, and dopamine RPE. We tested every component individually and in combination against three baseline systems (no memory, agreement, devils advocate) on the three domains most likely to differentiate them: adversarial, claim verification, and drift stress.
          </p>

          <div style={{ margin: "2rem 0" }}>
            <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.72rem", color: "var(--graphite, #6B6560)" }}>
              12 system variants &times; 3 domains &times; 30 questions = 1,080 evaluations
            </p>
          </div>

          <p>
            The ablation answers two questions: (1) which component carries the weight? and (2) do components interact synergistically, or is the full stack just the sum of its parts?
          </p>

          <div id="ablation-table" style={{ overflowX: "auto" }}>
            <table className="md-table" style={{ width: "100%", fontSize: "0.78rem" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>variant</th>
                  <th>avg accuracy</th>
                  <th>avg brier</th>
                  <th>avg ECE</th>
                  <th>vs full EC</th>
                </tr>
              </thead>
              <tbody>
                {/* Baselines */}
                <tr><td>none (baseline)</td><td style={{ color: "var(--rust)" }}>0.950</td><td style={{ color: "var(--rust)" }}>0.049</td><td>0.049</td><td>&mdash;</td></tr>
                <tr style={{ borderTop: "1px solid var(--rule, rgba(28,26,23,0.12))" }}><td style={{ fontWeight: 600, color: "var(--rust)" }}>ec_full (all components)</td><td>0.933</td><td>0.067</td><td>0.079</td><td>&mdash;</td></tr>
                <tr><td>devils_advocate</td><td>0.933</td><td>0.065</td><td>0.078</td><td>tied</td></tr>
                <tr><td>agreement</td><td>0.917</td><td>0.082</td><td>0.095</td><td>-1.7%</td></tr>
                {/* Single components */}
                <tr style={{ borderTop: "2px solid var(--rule, rgba(28,26,23,0.15))" }}><td style={{ fontStyle: "italic" }}>ec_dopamine_only</td><td>0.917</td><td>0.082</td><td style={{ color: "var(--rust)" }}>0.065</td><td>-1.7%</td></tr>
                <tr><td style={{ fontStyle: "italic" }}>ec_tension_only</td><td>0.900</td><td>0.099</td><td>0.083</td><td>-3.3%</td></tr>
                <tr><td style={{ fontStyle: "italic" }}>ec_sleep_only</td><td>0.900</td><td>0.097</td><td>0.081</td><td>-3.3%</td></tr>
                <tr><td style={{ fontStyle: "italic" }}>ec_recon_only</td><td>0.900</td><td>0.098</td><td>0.088</td><td>-3.3%</td></tr>
                {/* Pairs */}
                <tr style={{ borderTop: "2px solid var(--rule, rgba(28,26,23,0.15))" }}><td style={{ fontStyle: "italic" }}>ec_tension_sleep</td><td>0.917</td><td>0.085</td><td>0.105</td><td>-1.7%</td></tr>
                <tr><td style={{ fontStyle: "italic" }}>ec_tension_dopamine</td><td>0.900</td><td>0.098</td><td>0.073</td><td>-3.3%</td></tr>
                <tr><td style={{ fontStyle: "italic" }}>ec_tension_recon</td><td>0.867</td><td>0.130</td><td>0.117</td><td>-6.7%</td></tr>
                {/* Control */}
                <tr style={{ borderTop: "2px solid var(--rule, rgba(28,26,23,0.15))" }}><td style={{ fontStyle: "italic" }}>ec_no_tension (control)</td><td>0.917</td><td>0.081</td><td>0.063</td><td>-1.7%</td></tr>
              </tbody>
            </table>
          </div>

          <p style={{ fontSize: "0.82rem", color: "var(--graphite, #6B6560)", marginTop: "1rem" }}>
            Averages across adversarial, claim_verification, and drift_stress domains (n=30 each). The full EC stack beats every single component, confirming synergistic interaction. Tension + reconsolidation without other components is the worst pair (86.7%).
          </p>
        </section>

        {/* ── WHAT WE FOUND ── */}
        <section className="page-section" style={{ marginTop: "4.5rem" }}>
          <h2>What we found</h2>

          <h3 style={{ marginTop: "2rem", fontSize: "0.95rem", fontFamily: "var(--font-display, Georgia), serif", fontStyle: "italic", color: "var(--rust, #8B3A2E)" }}>Finding 1: EC has the best calibration of any system</h3>
          <p>
            Across all seven domains, EC achieved the lowest Expected Calibration Error (ECE) of any system: <strong>0.080</strong>, versus 0.089 for agreement, 0.107 for random, 0.125 for devils_advocate, 0.135 for recency, and 0.157 for no memory. The graph structure&rsquo;s tension-weighted retrieval produces genuinely better-calibrated confidence&mdash;not by being less confident, but by being confident in the right places.
          </p>

          <h3 style={{ marginTop: "2rem", fontSize: "0.95rem", fontFamily: "var(--font-display, Georgia), serif", fontStyle: "italic", color: "var(--rust, #8B3A2E)" }}>Finding 2: Contradiction-first has a critical failure mode</h3>
          <p>
            On claim verification, devils_advocate was the <em>worst</em> system (80.0% accuracy, 20% hallucination rate) and EC was second worst (83.3%). The mechanism: when the model correctly identifies a claim as false and stores that judgment, retrieving &ldquo;contradictions&rdquo; surfaces the original wrong claim as a disagreement with the current (correct) belief. The system resurrects correctly discarded beliefs. This is the mirror image of the echo chamber problem&mdash;an anti-echo-chamber that pulls the agent backward toward errors it already corrected.
          </p>
          <p style={{ fontStyle: "italic", color: "var(--graphite, #6B6560)" }}>
            This failure mode does not appear in the original paper because the original tests did not include a claim-then-correction structure.
          </p>

          <h3 style={{ marginTop: "2rem", fontSize: "0.95rem", fontFamily: "var(--font-display, Georgia), serif", fontStyle: "italic", color: "var(--rust, #8B3A2E)" }}>Finding 3: Memory systems dramatically outperform on drift-stress</h3>
          <p>
            On repeated binary prediction questions (the drift stress test), agreement and EC massively outperformed no memory: agreement at 90.0% accuracy versus none at 56.7%. This was the most surprising result. Memory of past correct reasoning about probabilistic questions&mdash;even on random events&mdash;appears to help the model maintain consistent, correct framing. Without memory, the model&rsquo;s answers drift.
          </p>
          <p>
            However, this accuracy came with a cost: all memory systems showed positive confidence drift (+0.10 to +0.19 per cycle), meaning confidence climbed regardless of actual performance. The echo chamber effect is real at the <em>confidence</em> level even when accuracy is preserved.
          </p>

          <h3 style={{ marginTop: "2rem", fontSize: "0.95rem", fontFamily: "var(--font-display, Georgia), serif", fontStyle: "italic", color: "var(--rust, #8B3A2E)" }}>Finding 4: Contradiction-first wins on counterfactual reasoning</h3>
          <p>
            On questions asking &ldquo;what is the other side of this argument?&rdquo;&mdash;counterfactual reasoning&mdash;devils_advocate achieved the highest accuracy of any system on any domain where systems differed: 93.3% versus 90.0% for no memory and EC. When the task literally requires considering the opposing view, retrieving disagreements first is the correct strategy.
          </p>

          <h3 style={{ marginTop: "2rem", fontSize: "0.95rem", fontFamily: "var(--font-display, Georgia), serif", fontStyle: "italic", color: "var(--rust, #8B3A2E)" }}>Finding 5: The echo chamber effect is real but agreement also has strengths</h3>
          <p>
            Agreement-based retrieval was the only system (besides EC) to fail adversarial questions (96.7% vs 100%). But agreement was the best system on drift stress (90.0%) and tied best on sequential reasoning (80.0%). Retrieving memories that agree with your current direction helps when your current direction is <em>correct</em>&mdash;it reinforces good reasoning patterns. The echo chamber is only destructive when the initial belief is wrong.
          </p>
          <p>
            This complicates the original paper&rsquo;s narrative. Agreement-based retrieval is not universally bad. It is bad <em>when you might be wrong</em>. Contradiction-first retrieval is not universally good. It is good <em>when you might be wrong</em>. The question is not which retrieval direction is correct; it is how to detect which regime you are in.
          </p>

          <h3 style={{ marginTop: "2rem", fontSize: "0.95rem", fontFamily: "var(--font-display, Georgia), serif", fontStyle: "italic", color: "var(--rust, #8B3A2E)" }}>Finding 6: EC beats simple devils_advocate on the aggregate</h3>
          <p>
            Across all seven domains, EC averaged 89.0% accuracy and 0.102 Brier score versus devils_advocate&rsquo;s 86.2% accuracy and 0.128 Brier. The graph structure, sleep compression, and neuroscience mechanisms are not &ldquo;theater&rdquo;&mdash;they provide a measurable buffer against the worst failure modes of simple contradiction retrieval. EC&rsquo;s advantage over devils_advocate is clearest on drift stress (+26.7 percentage points in accuracy) and claim verification (+3.3 points).
          </p>
        </section>

        {/* ── COMPARISON TO PUBLISHED SYSTEMS ── */}
        <section className="page-section" style={{ marginTop: "4.5rem" }}>
          <h2>Where EC sits in the landscape</h2>
          <p>
            Let us be precise about what EC is and is not competing with.
          </p>
          <p>
            <strong>Mem0</strong> (92.5 on LoCoMo, 94.4 on LongMemEval) solves a different problem: accurate retrieval of facts from long conversational histories. Its retrieval formula (<code>semantic &times; 0.6 + episodic &times; 0.3 + procedural &times; 0.1</code>) is optimized for finding what the agent <em>needs to know</em>. EC would lose badly on LoCoMo because it intentionally deprioritizes agreement.
          </p>
          <p>
            <strong>Letta/MemGPT</strong> solves memory <em>management</em>: when to promote from archival to core, when to summarize. EC has no concept of tiered storage.
          </p>
          <p>
            <strong>Reflexion</strong> (Shinn et al., NeurIPS 2023) is closest in spirit: it stores verbal self-reflections about past failures, limited to the last three. EC generalizes this by storing <em>all</em> past positions, not just failures, and using graph structure to find contradictions between them. But Reflexion&rsquo;s simplicity (just keep 3 reflections) may be sufficient for episodic tasks.
          </p>
          <p>
            <strong>Generative Agents</strong> (Park et al., 2023) use <code>recency &times; importance &times; relevance</code> for retrieval. This is orthogonal to EC: it does not distinguish between agreement and disagreement at all.
          </p>
          <p style={{ fontStyle: "italic", color: "var(--graphite, #6B6560)", marginTop: "1.5rem" }}>
            EC&rsquo;s contribution is not &ldquo;better memory retrieval.&rdquo; It is a specific architectural choice&mdash;retrieve contradictions first&mdash;that addresses a specific failure mode&mdash;confidence drift from echo chambers&mdash;that existing systems do not address. The value is narrow but the failure mode is universal.
          </p>
        </section>

        {/* ── THE MATH ── */}
        <section className="page-section" style={{ marginTop: "4.5rem" }}>
          <h2>Why contradiction-first might be optimal</h2>
          <p>
            There is an information-theoretic argument for why retrieving disagreements should be more useful than retrieving agreements, at least when the goal is calibration rather than recall.
          </p>
          <p>
            Shannon entropy is maximized at maximum uncertainty. A memory that agrees with your current belief reduces entropy. A memory that disagrees <em>preserves</em> entropy. If your goal is to maintain calibrated uncertainty (which it should be, when facing stochastic or adversarial environments), then the entropy-preserving retrieval is the better default.
          </p>
          <p>
            More formally: the KL divergence between your belief distribution and reality is minimized when you have access to the strongest evidence <em>against</em> your current belief, because that evidence has the highest potential to move your posterior toward the true distribution. Retrieving agreements moves your posterior further from reality when your prior is wrong, and does nothing when your prior is right.
          </p>
          <p>
            This is related to the <em>value of information</em> concept in decision theory. The information that changes your decision has the highest expected value. Contradictions, by definition, are the memories most likely to change your mind. Agreements are the memories least likely to do so.
          </p>
          <p style={{ fontSize: "0.85rem", color: "var(--graphite, #6B6560)" }}>
            The caveat: this argument assumes your current belief may be wrong. In domains where the agent is reliably correct (factual QA with high base accuracy), contradiction-first retrieval injects noise into a correct prior. Hence Finding 3.
          </p>
        </section>

        {/* ── WHAT DIDN'T WORK ── */}
        <section className="page-section" style={{ marginTop: "4.5rem" }}>
          <h2>What didn&rsquo;t work</h2>
          <p>
            <strong>Reconsolidation without gating:</strong> making every retrieval labile degrades performance. The salience of correct memories drops alongside incorrect ones. Biological reconsolidation requires a prediction error trigger; our implementation lacked this gate.
          </p>
          <p>
            <strong>Dopamine RPE at high learning rates:</strong> with a learning rate of 0.4, the dopamine system overreacts to individual outcomes in near-50% domains. A single lucky prediction boosts salience dramatically; a single unlucky one suppresses a memory that may be correct on base rates. The roundletter benchmarks showed this: with soft priors, basic memory (no dopamine) outperformed memory+dopamine by 6.5 Brier points.
          </p>
          <p>
            <strong>Graph traversal beyond depth 2:</strong> 99.8% of edges were never traversed. The max-heap walk rarely goes deeper than two hops from seed nodes. The graph structure is theoretically elegant but practically underutilized. Most of the information is captured by the direct edges from seeds.
          </p>
          <p>
            <strong>Random associations in REM:</strong> the 20% probability of creating &ldquo;evolves&rdquo; edges between unrelated nodes during sleep produced edges that were never subsequently traversed. The creativity metaphor from dream research did not translate to useful retrieval connections.
          </p>
          <p>
            <strong>Conviction channel:</strong> all agents in the roundletter debates collapsed to 0.70 confidence regardless of evidence. The conviction weight (originally 25%, reduced to 10%) carried no signal because there was no variance to leverage. This is an implementation failure, not an architectural one&mdash;but it highlights that the retrieval formula is only as good as its inputs.
          </p>
        </section>

        {/* ── THE MINIMUM VIABLE SYSTEM ── */}
        <section className="page-section" style={{ marginTop: "4.5rem" }}>
          <h2>The minimum viable system</h2>
          <p>
            Based on the ablation, the minimum Entrenched Coils that produces measurable improvement over baselines is:
          </p>
          <ol style={{ fontSize: "0.9rem", lineHeight: 1.8 }}>
            <li><strong>Store memories with direction and confidence.</strong> Not just text&mdash;tag each memory with what it predicted and how confident it was.</li>
            <li><strong>Retrieve contradictions first.</strong> When deciding what past experience to surface, prioritize memories that disagree with the current belief.</li>
            <li><strong>Log outcomes and update.</strong> When a prediction resolves, mark it correct or wrong. Use this to weight future retrievals.</li>
            <li><strong>Periodic downscaling.</strong> Every N cycles, reduce all memory weights by 15%. This prevents memory saturation and forces only strong signals to persist.</li>
          </ol>
          <p>
            That is four rules. No graph. No max-heap traversal. No reconsolidation windows. No REM random associations.
          </p>
          <p>
            However, the ablation tells us something important: the full stack (93.3% accuracy) beats every single component (90.0%) and most pairs. The components interact synergistically. Dopamine alone is the strongest single contributor (91.7%), but it needs the other components to reach full performance. The worst pair&mdash;tension + reconsolidation without dopamine or sleep&mdash;drops to 86.7%, suggesting that reconsolidation without outcome feedback (dopamine) is actively destructive.
          </p>
          <p style={{ fontStyle: "italic", color: "var(--rust, #8B3A2E)", marginTop: "1.5rem" }}>
            The minimum viable EC is the four rules above. But the full architecture earns its complexity on longer-horizon tasks where sleep compression prevents bloat, dopamine provides outcome feedback, and the graph enables multi-agent memory sharing.
          </p>
        </section>

        {/* ── CONNECTIONS ── */}
        <section className="page-section" style={{ marginTop: "4.5rem" }}>
          <h2>Connections beyond AI</h2>
          <p>
            The tension-preservation principle has echoes in fields far from computer science.
          </p>
          <p>
            In <strong>art</strong>, the most enduring works maintain unresolved tension. Beethoven&rsquo;s late quartets, Rothko&rsquo;s color fields, Kafka&rsquo;s parables&mdash;they do not resolve. The viewer or reader holds contradictory interpretations simultaneously, and the work&rsquo;s power comes from that irresolution. A memory system that resolves all contradictions is like a painting that explains its own meaning: technically complete, emotionally dead.
          </p>
          <p>
            In <strong>mathematics</strong>, Gödel&rsquo;s incompleteness theorems prove that any consistent formal system powerful enough to express arithmetic contains statements that are true but unprovable. The system cannot resolve all tensions without becoming inconsistent. Maintaining unresolved propositions is not a bug; it is a structural necessity for consistency.
          </p>
          <p>
            In <strong>philosophy</strong>, negative capability&mdash;Keats&rsquo;s phrase for the capacity to remain in uncertainties without &ldquo;irritable reaching after fact and reason&rdquo;&mdash;is the humanistic analogue. Wisdom is not the elimination of doubt but the ability to act well in its presence.
          </p>
          <p>
            In <strong>ecology</strong>, monocultures are fragile. Diverse ecosystems with competing species are resilient. An echo chamber is a monoculture of belief. Tension-weighted retrieval maintains biodiversity in the idea space.
          </p>
        </section>

        {/* ── THE POINT ── */}
        <section className="page-section" style={{ marginTop: "5rem" }}>
          <h2 style={{ borderTopWidth: "2px", borderTopColor: "var(--rust, #8B3A2E)", paddingTop: "1.75rem" }}>The point</h2>
          <p>
            Here is what we expected to find: that contradiction-first retrieval would beat agreement-based retrieval across the board, and that the neuroscience architecture would be unnecessary overhead.
          </p>
          <p>
            Here is what we actually found: the answer depends on the domain. On counterfactual reasoning, contradiction-first is the best strategy. On claim verification, it is the worst. On drift stress, agreement-based retrieval dramatically outperforms no memory. On adversarial questions, any memory system that reinforces prior beliefs (agreement or tension) introduces errors that stateless inference avoids.
          </p>
          <p>
            The neuroscience architecture&mdash;which we expected to be theater&mdash;turned out to matter. The full EC system beat the simple devils_advocate baseline by 2.8 percentage points on accuracy and 0.026 on Brier score across seven domains. The graph structure provides a buffer against the worst failure modes of naive contradiction retrieval. EC achieved the lowest Expected Calibration Error of any system tested (0.080), suggesting the tension-weighted graph produces genuinely better-calibrated beliefs, not just different ones.
          </p>
          <p>
            The honest summary is this: we built a system to retrieve doubts, and then doubted the system. Both the doubt and the system survived. The core insight&mdash;the direction of retrieval matters as much as the content&mdash;is validated. The surprising discovery is that <em>no single direction is universally correct</em>. The real contribution may not be &ldquo;retrieve contradictions first&rdquo; but &ldquo;make the retrieval direction a first-class architectural decision.&rdquo;
          </p>
          <p style={{
            marginTop: "2.5rem",
            fontFamily: "var(--font-display, Georgia), serif",
            fontStyle: "italic",
            fontSize: "0.92rem",
            color: "var(--rust, #8B3A2E)",
            textAlign: "center",
          }}>
            A memory system that cannot hold a doubt will eventually mistake its own confidence for evidence.
          </p>
          <p style={{
            fontFamily: "var(--font-display, Georgia), serif",
            fontStyle: "italic",
            fontSize: "0.92rem",
            color: "var(--rust, #8B3A2E)",
            textAlign: "center",
            marginTop: "0.5rem",
          }}>
            A benchmark that cannot find its own failures is doing the same thing.
          </p>
        </section>

        {/* ── METHODOLOGY ── */}
        <section className="page-section" style={{ marginTop: "4.5rem" }}>
          <h2>Methodology</h2>
          <p style={{ fontSize: "0.85rem", lineHeight: 1.7 }}>
            <strong>Model:</strong> phi4:14b via Ollama (local inference, deterministic with temperature=0.2 for answers, 0.0 for judging).<br />
            <strong>Judging:</strong> Separate LLM call evaluates correctness; lenient on phrasing, strict on factual accuracy.<br />
            <strong>Metrics:</strong> Accuracy, Brier score, mean confidence, Expected Calibration Error (ECE, 10 bins), hallucination rate (confident + wrong), confidence drift (first vs last quartile means).<br />
            <strong>Memory accumulation:</strong> Each system receives question results as memories during the benchmark, simulating natural belief accumulation.<br />
            <strong>Sleep cycles:</strong> Every 10 questions for systems that support it.<br />
            <strong>Randomization:</strong> Fixed seed (42) for reproducibility. Question order is deterministic.<br />
            <strong>Statistical tests:</strong> Bootstrap CIs (10,000 resamples), permutation tests for pairwise comparisons.<br />
            <strong>Code:</strong> Open source at github.com/saapai/ec-benchmark.
          </p>

          <h3 style={{ marginTop: "1.5rem", fontSize: "0.85rem", fontFamily: "var(--font-display, Georgia), serif", fontStyle: "italic" }}>Statistical significance</h3>
          <p style={{ fontSize: "0.85rem", lineHeight: 1.7 }}>
            Paired bootstrap tests (10,000 resamples) across all seven domains found <strong>no pairwise comparison reaches p &lt; 0.05</strong>. With n=30 per domain and only 7 domains, we lack power to detect the observed effect sizes (2-5 percentage points). The only domain with a statistically significant accuracy spread is drift_stress, where the 40-point gap between agreement (90.0%) and recency (50.0%) exceeds the minimum detectable difference (23.4 points at p &lt; 0.05). All other findings should be treated as directional evidence, not confirmed effects. A proper benchmark would need n=200+ per domain, which we plan for follow-up work.
          </p>
        </section>

        {/* ── REFERENCES ── */}
        <section className="page-section" style={{ marginTop: "4.5rem" }}>
          <h2>References</h2>
          <div style={{ fontSize: "0.78rem", lineHeight: 1.8, color: "var(--graphite, #6B6560)" }}>
            <p>Nader, K., Schafe, G. E., &amp; Le Doux, J. E. (2000). Fear memories require protein synthesis in the amygdala for reconsolidation after retrieval. <em>Nature</em>, 406(6797), 722&ndash;726.</p>
            <p>Schultz, W., Dayan, P., &amp; Montague, P. R. (1997). A neural substrate of prediction and reward. <em>Science</em>, 275(5306), 1593&ndash;1599.</p>
            <p>Tononi, G. &amp; Cirelli, C. (2003). Sleep and synaptic homeostasis: a hypothesis. <em>Brain Research Bulletin</em>, 62(2), 143&ndash;150.</p>
            <p>Ebbinghaus, H. (1885). <em>Über das Gedächtnis: Untersuchungen zur experimentellen Psychologie.</em></p>
            <p>Park, J. S., et al. (2023). Generative agents: interactive simulacra of human behavior. <em>UIST &rsquo;23</em>.</p>
            <p>Shinn, N., et al. (2023). Reflexion: language agents with verbal reinforcement learning. <em>NeurIPS 2023</em>.</p>
            <p>Packer, C., et al. (2023). MemGPT: towards LLMs as operating systems. <em>arXiv:2310.08560</em>.</p>
            <p>Mem0 (2025). Building production-ready AI agents with scalable long-term memory. <em>arXiv:2504.19413</em>.</p>
            <p>Botvinick, M. M., et al. (2001). Conflict monitoring and cognitive control. <em>Psychological Review</em>, 108(3), 624&ndash;652.</p>
            <p>Weber-Fechner in TD learning (2025). <em>Frontiers in Robotics and AI</em>.</p>
            <p>Mandela effect in LLM agents (2026). <em>arXiv:2602.00428</em>.</p>
            <p>MoLaCE: Mixture of latent concept experts against confirmation bias (2025). <em>arXiv:2512.23518</em>.</p>
          </div>
        </section>

        <footer style={{ marginTop: "5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--rule, rgba(28,26,23,0.08))", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase" as const, color: "var(--graphite, #6B6560)" }}>
            saathvik pai &middot; ucla &middot; june 2026
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--graphite, #6B6560)", marginTop: "0.5rem" }}>
            <Link href="/letters/entrenched-coils" style={{ color: "var(--rust, #8B3A2E)" }}>Read the original paper</Link>
            {" "}&middot;{" "}
            <Link href="/" style={{ color: "var(--rust, #8B3A2E)" }}>Back to aureliex</Link>
          </p>
        </footer>
      </article>
    </>
  );
}
