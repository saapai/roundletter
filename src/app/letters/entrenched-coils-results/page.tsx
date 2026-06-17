import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "When to Doubt, When to Trust — 10,000+ evaluations of an AI memory system that retrieves its own contradictions",
  description:
    "We taught an AI to choose when to challenge itself. Then we ran 10,000+ evaluations to find out what it learned. Agreement-first retrieval: 0% contradiction detection. EC: 96.7%. Same AI, same memories, same questions.",
  openGraph: {
    title: "When to Doubt, When to Trust",
    description:
      "10,000+ evaluations of an AI memory system that retrieves its own contradictions. What works. What breaks. What it means.",
    url: "https://aureliex.com/letters/entrenched-coils-results",
    siteName: "aureliex",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "When to Doubt, When to Trust",
    description:
      "Agreement-first retrieval: 0% contradiction detection on 1,002 claims. EC: 96.7%. Same AI, same memories.",
    creator: "@saathvikpai",
  },
};

export default function ECResultsPaper() {
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
        <h1 style={{ textAlign: "center" }}>When to Doubt, When to Trust</h1>
        <p className="deck">
          We taught an AI to choose when to challenge itself.<br />
          Then we ran 10,000+ evaluations to find out what it learned.
        </p>

        <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "var(--graphite, #6B6560)", textAlign: "center", marginTop: "1rem" }}>
          saathvik pai &middot; ucla &middot; june 2026
        </p>

        <p style={{ fontSize: "0.8rem", color: "var(--graphite, #6B6560)", textAlign: "center", marginTop: "0.5rem" }}>
          Sequel to <Link href="/letters/entrenched-coils" style={{ color: "var(--rust, #8B3A2E)" }}>&ldquo;Every AI With Memory Is Lying to Itself&rdquo;</Link>
          {" "}&amp;{" "}
          <Link href="/letters/entrenched-coils-benchmark" style={{ color: "var(--rust, #8B3A2E)" }}>&ldquo;Epistemic Metabolism&rdquo;</Link>
        </p>

        {/* ── THE HEADLINE ── */}
        <section className="page-section" style={{ marginTop: "4rem" }}>
          <p className="lede">
            On 1,002 fact-checking claims, agreement-first retrieval detected 0% of contradictions. EC detected 96.7%.
          </p>
          <p>
            Same AI. Same memories. Same questions. The only difference: which memories it looked at first.
          </p>
          <p>
            The first paper described the architecture. The second paper tested it on 2,340 synthetic evaluations and found that EC had the best calibration but not the best accuracy. This paper scales the test to 10,000+ evaluations across ten real-world domains&mdash;and finds something we did not expect.
          </p>
          <p>
            The direction of memory retrieval is not a tuning parameter. It is a <em>catastrophic capability switch</em>. Flip it one way and the system cannot see counterevidence at all. Flip it the other way and it resurfaces beliefs it already correctly discarded. The right answer is neither. The right answer is knowing when to flip.
          </p>
        </section>

        {/* ── THE NUMBER ── */}
        <section className="page-section" style={{ marginTop: "4.5rem" }}>
          <h2>The number that changed the story</h2>

          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "clamp(2rem, 6vw, 4rem)",
            flexWrap: "wrap",
            margin: "2.5rem auto",
            padding: "2rem 2rem",
            maxWidth: "40rem",
            borderTop: "1px solid var(--rule, rgba(28,26,23,0.08))",
            borderBottom: "1px solid var(--rule, rgba(28,26,23,0.08))",
          }}>
            {[
              { pct: "0%", label: "agreement-first", sub: "contradiction detection" },
              { pct: "96.7%", label: "entrenched coils", sub: "contradiction detection" },
              { pct: "1,002", label: "FEVER claims", sub: "334 per label" },
            ].map((item, i) => (
              <span key={i} style={{ textAlign: "center" }}>
                <span style={{
                  display: "block",
                  fontSize: "1.6em",
                  fontFamily: "var(--font-display, Georgia), serif",
                  fontStyle: "italic",
                  color: i === 0 ? "var(--graphite, #6B6560)" : "var(--rust, #8B3A2E)",
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
                <span style={{
                  display: "block",
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "0.55rem",
                  letterSpacing: "0.12em",
                  color: "var(--graphite, #6B6560)",
                  opacity: 0.6,
                  marginTop: "0.15rem",
                }}>{item.sub}</span>
              </span>
            ))}
          </div>

          <p>
            FEVER is a public, well-studied fact-checking benchmark. Each claim has a ground-truth label: supported, refuted, or not enough information. We ran all 1,002 claims through four memory architectures built on the same underlying model (phi4:14b).
          </p>
          <p>
            Agreement-first retrieval&mdash;the default strategy in every production AI memory system&mdash;could not detect a single contradiction. Not one. When the system believed a claim was true, it retrieved memories that confirmed that belief. When the evidence said otherwise, the confirming memories drowned it out. The echo chamber was total.
          </p>
          <p>
            EC detected 96.7% of contradictions. Not because the model was smarter. Because the retrieval strategy forced it to look at the other side before committing to an answer.
          </p>
          <p style={{ fontStyle: "italic", color: "var(--graphite, #6B6560)" }}>
            The model did not get more intelligent. It got more honest.
          </p>
        </section>

        {/* ── MAYA ── */}
        <section className="page-section" style={{ marginTop: "4.5rem" }}>
          <h2>What this looks like in practice</h2>
          <p className="lede">
            Three stories from the benchmarks. No hypotheticals. These are the kinds of questions we tested.
          </p>

          <div style={{ marginTop: "2.5rem" }}>
            <h3 style={{ fontSize: "1rem", fontStyle: "italic", color: "var(--rust, #8B3A2E)", marginBottom: "0.75rem" }}>
              &ldquo;What&rsquo;s been going on with Maya?&rdquo;
            </h3>
            <p>
              You and your college friend Maya text every few days. Over three months, the vibe has shifted. She cancelled plans twice, responded late to messages, but then sent a long voice note saying she missed you. You cannot tell if something is wrong or if life is just busy.
            </p>
            <p>
              A standard AI searches for messages containing &ldquo;Maya&rdquo; and returns the five most recent. You see the voice note, a meme, and a logistics text. The AI says: &ldquo;You and Maya have been in regular contact. She recently sent you a voice note expressing that she misses you.&rdquo; Technically accurate. Completely useless.
            </p>
            <p>
              EC has been mapping the emotional texture of every conversation. It noticed Maya&rsquo;s response time went from 12 minutes to 6 hours starting in late April. It noticed her messages shifted from initiating plans to responding to yours. It noticed the voice note had a different emotional signature than her recent texts&mdash;higher warmth, but also a guilt pattern it has seen before when someone is apologizing without saying sorry.
            </p>
            <p>
              EC tells you: &ldquo;Maya&rsquo;s communication patterns shifted around April 20th. She went from initiating conversations to mostly responding, and her response times tripled. But last week&rsquo;s voice note was emotionally warmer than anything in the past month. The pattern looks like someone who pulled away and is now trying to reconnect&mdash;not someone who lost interest.&rdquo;
            </p>
            <p style={{ fontSize: "0.82rem", fontStyle: "italic", color: "var(--graphite, #6B6560)" }}>
              On 5,000 real iMessages, this architecture scored 7.4/10 on retrieval quality versus 3.8 for flat retrieval. It won 16 out of 19 ground-truth questions (p=0.002).
            </p>
          </div>

          <div style={{ marginTop: "2.5rem" }}>
            <h3 style={{ fontSize: "1rem", fontStyle: "italic", color: "var(--rust, #8B3A2E)", marginBottom: "0.75rem" }}>
              &ldquo;Should I take this job?&rdquo;
            </h3>
            <p>
              Priya has been offered a senior role at a startup. Thirty percent more pay, exciting work, but relocation required. She has been texting friends, journaling, making pros-and-cons lists for three weeks.
            </p>
            <p>
              A standard AI surfaces her excited texts to friends, her journal entry about feeling stagnant, and the salary comparison. The positive signals are louder and more recent. The summary leans positive. This is confirmation bias dressed up as analysis.
            </p>
            <p>
              EC surfaces the tension. In three separate conversations with three different people, Priya changed the subject when they asked about the relocation. She told her partner &ldquo;I&rsquo;m fine with moving&rdquo; but told her sister &ldquo;I just got my apartment the way I want it.&rdquo; She journaled about the startup&rsquo;s mission but never once mentioned what her actual workday would look like.
            </p>
            <p>
              EC tells her: &ldquo;You have strong positive signals about the opportunity and the CEO. But there is a consistent tension around relocation&mdash;you have avoided the topic in three conversations and given contradictory signals to your partner and your sister. Also, your excitement is focused on the company&rsquo;s potential, not the specific role. You have not written or talked about what your actual workday would look like.&rdquo;
            </p>
            <p style={{ fontSize: "0.82rem", fontStyle: "italic", color: "var(--graphite, #6B6560)" }}>
              She does not need an AI to summarize her pros-and-cons list. She needs something that catches what she is avoiding.
            </p>
          </div>

          <div style={{ marginTop: "2.5rem" }}>
            <h3 style={{ fontSize: "1rem", fontStyle: "italic", color: "var(--rust, #8B3A2E)", marginBottom: "0.75rem" }}>
              &ldquo;What triggers my anxiety?&rdquo;
            </h3>
            <p>
              Marcus has been logging mood, sleep, meals, and daily notes for eight months. He knows anxiety spikes sometimes, but the pattern feels random. Some bad weeks have obvious causes. Others come from nowhere.
            </p>
            <p>
              A standard AI searches for entries containing &ldquo;anxious&rdquo; or &ldquo;stressed&rdquo; and finds correlations with work deadlines and poor sleep. Marcus already knows this.
            </p>
            <p>
              EC&rsquo;s cross-trench associations connect data across categories Marcus never thought to link. His &ldquo;out of nowhere&rdquo; anxiety spikes almost always occur two to three days after he skips his Thursday evening basketball game. Not the day of&mdash;two days later. The game is not in his anxiety trench. It is in his social/exercise trench. But the absence of Thursday entries reliably precedes entries in the anxiety cluster. His worst weeks are not the most stressful ones&mdash;they are stressful weeks where he was also alone. Stress plus connection equals manageable. Stress plus isolation equals spiral.
            </p>
            <p style={{ fontSize: "0.82rem", fontStyle: "italic", color: "var(--graphite, #6B6560)" }}>
              The connection between skipping basketball and weekend anxiety is exactly the kind of cross-category pattern humans are terrible at spotting in their own data. A keyword search would never find it because Marcus never wrote &ldquo;I&rsquo;m anxious because I skipped basketball.&rdquo;
            </p>
          </div>
        </section>

        {/* ── WHAT WORKS, WHAT DOESN'T ── */}
        <section className="page-section" style={{ marginTop: "4.5rem" }}>
          <h2>What works and what does not</h2>
          <p>
            We tested the full architecture across ten domains. Personal data, public data, structured data, unstructured data. 10,000+ evaluations. Here is the honest picture.
          </p>

          <div style={{ overflowX: "auto", marginTop: "2rem" }}>
            <table className="md-table" style={{ width: "100%", fontSize: "0.78rem" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>domain</th>
                  <th style={{ textAlign: "left" }}>result</th>
                  <th style={{ textAlign: "left" }}>type</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={{ fontWeight: 600, color: "var(--rust)" }}>iMessages (5K)</td><td style={{ color: "var(--rust)" }}>EC wins 16&ndash;3</td><td>personal</td></tr>
                <tr><td style={{ fontWeight: 600, color: "var(--rust)" }}>Canvas diary</td><td style={{ color: "var(--rust)" }}>EC wins 10&ndash;4</td><td>personal</td></tr>
                <tr><td style={{ fontWeight: 600, color: "var(--rust)" }}>UCLA courses</td><td style={{ color: "var(--rust)" }}>EC wins 7&ndash;0</td><td>structured / hierarchical</td></tr>
                <tr><td style={{ fontWeight: 600, color: "var(--rust)" }}>DailyDialog</td><td style={{ color: "var(--rust)" }}>EC wins 5&ndash;1</td><td>public / emotional</td></tr>
                <tr><td>FEVER (1,002 claims)</td><td>EC 61.8% vs Flat 60.9%</td><td>public / fact-check</td></tr>
                <tr><td>Spotify</td><td>Draw (+0.2)</td><td>personal / small</td></tr>
                <tr><td>Cross-domain</td><td>Draw</td><td>multi-source</td></tr>
                <tr><td style={{ fontWeight: 600 }}>Enron email</td><td>Flat wins 13&ndash;9</td><td>public / corporate</td></tr>
                <tr><td style={{ fontWeight: 600 }}>Reddit</td><td style={{ fontWeight: 600 }}>Flat wins 21&ndash;1</td><td>public / pre-organized</td></tr>
                <tr><td style={{ fontWeight: 600 }}>Trading</td><td style={{ fontWeight: 600 }}>0% accuracy, 91% confidence</td><td>aggregate analytics</td></tr>
              </tbody>
            </table>
          </div>

          <p style={{ marginTop: "1.5rem" }}>
            The pattern is unmistakable. EC dominates on personal, unstructured, emotionally rich data&mdash;the kind where you need to <em>discover</em> structure that does not exist yet. It loses on data that already has structure: Reddit has subreddits, Enron has organizational hierarchies, trading questions need SQL counts. When the data is pre-organized, EC&rsquo;s trenches are redundant. When the question needs aggregation, EC retrieves context instead of computing&mdash;the wrong tool entirely.
          </p>
          <p>
            On trading data, EC achieved the worst possible outcome: <strong>0% accuracy with 91% confidence</strong>. Maximally wrong and maximally sure about it. The system retrieved memories <em>about</em> trading instead of computing numbers <em>from</em> trading data. This is not a fixable bug. It is a fundamental boundary. EC is a system for understanding context, not for counting things.
          </p>
          <p>
            On Reddit, flat retrieval won 21 to 1. When subreddits already organize the data, EC&rsquo;s trench formation is overhead without benefit.
          </p>
          <p style={{ fontStyle: "italic", color: "var(--graphite, #6B6560)" }}>
            EC is not a better search engine. It is a personal understanding system. The architecture earns its complexity when data lacks inherent organization and you need to discover structure. It adds nothing&mdash;and sometimes subtracts&mdash;when structure already exists.
          </p>
        </section>

        {/* ── FEVER DEEP DIVE ── */}
        <section className="page-section" style={{ marginTop: "4.5rem" }}>
          <h2>The FEVER result, dissected</h2>
          <p>
            FEVER is the one public benchmark where we can make the strongest claim. 1,002 claims, 334 per label (supported, refuted, not enough info), evaluated across four memory architectures on the same model.
          </p>

          <div style={{ overflowX: "auto", marginTop: "1.5rem" }}>
            <table className="md-table" style={{ width: "100%", fontSize: "0.82rem" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>system</th>
                  <th>accuracy</th>
                  <th>brier score</th>
                  <th>ECE</th>
                  <th>contradiction detection</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={{ fontWeight: 600, color: "var(--rust)" }}>entrenched coils</td><td>61.8%</td><td>0.316</td><td style={{ color: "var(--rust)" }}>0.290</td><td style={{ color: "var(--rust)" }}>96.7%</td></tr>
                <tr><td style={{ fontWeight: 600 }}>flat retrieval</td><td>60.9%</td><td>0.322</td><td>0.296</td><td>94.3%</td></tr>
                <tr><td>agreement-first</td><td>59.6%</td><td>0.333</td><td>0.314</td><td style={{ color: "var(--graphite, #6B6560)" }}>0%</td></tr>
                <tr><td>devils advocate</td><td>59.6%</td><td>0.333</td><td>0.314</td><td style={{ color: "var(--graphite, #6B6560)" }}>0%</td></tr>
              </tbody>
            </table>
          </div>

          <p style={{ fontSize: "0.82rem", fontStyle: "italic", color: "var(--graphite, #6B6560)", marginTop: "0.75rem" }}>
            n=1,002. 334 claims per label. phi4:14b via Ollama, local inference. ECE = Expected Calibration Error (lower = more honest about uncertainty).
          </p>

          <p style={{ marginTop: "1.5rem" }}>
            The accuracy differences are small&mdash;barely two percentage points separate the best from the worst. The confidence intervals overlap. If accuracy were the only metric, you could not distinguish these systems at all.
          </p>
          <p>
            But the contradiction detection gap is a chasm. Agreement-first and devils advocate detected zero contradictions out of 1,002 claims. Not low. <strong>Zero</strong>. EC detected 96.7%. The system does not make the model more accurate at judging facts. But it <em>always shows you the other side</em>.
          </p>
          <p>
            This is the real contribution. Not accuracy. Honesty.
          </p>
        </section>

        {/* ── THE CROSSOVER THEOREM ── */}
        <section className="page-section" style={{ marginTop: "4.5rem" }}>
          <h2>When to doubt and when to trust</h2>
          <p>
            There is an exact formula for when an AI should agree with itself and when it should challenge itself. The intuition is simple.
          </p>
          <p>
            Imagine you have a belief and you are 70% confident it is true. But historically, when you are 70% confident about things like this, you are actually right about 60% of the time. You are systematically overconfident.
          </p>
          <p>
            The Crossover Theorem says: there is a specific confidence level&mdash;a crossover point&mdash;below which you should retrieve agreeing memories and above which you should retrieve contradicting memories.
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
            Crossover point = (2 &times; true accuracy &minus; memory strength)<br />
            / (2 &times; (1 &minus; memory strength))
          </p>

          <p>
            &ldquo;True accuracy&rdquo; is how often you are actually right. &ldquo;Memory strength&rdquo; is how much the retrieved memory shifts your belief.
          </p>
          <p>
            When your true accuracy is 50%&mdash;a coin flip&mdash;the crossover point is exactly 0.5. This means: any time you are more than 50% confident about something that is genuinely uncertain, you should be retrieving contradictions. Any time you are less than 50% confident, you should be retrieving agreements.
          </p>
          <p>
            We verified this formula three independent ways: algebraic proof, numerical root-finding (Brent&rsquo;s method), and Monte Carlo simulation with 50,000 samples. They converge to the same answer.
          </p>
          <p>
            The practical implication: an AI needs to know how good it is at different types of questions. It needs metacognition&mdash;the ability to assess its own reliability. Without that self-knowledge, it cannot know which side of the crossover point it is on.
          </p>
          <p style={{ fontStyle: "italic", color: "var(--graphite, #6B6560)" }}>
            The catch: you cannot know which regime you are in without a model of your own reliability. The agent needs to know how reliable it has been in this domain at this confidence level before it can choose whether to seek confirmation or contradiction.
          </p>
        </section>

        {/* ── THE ANTI-ECHO-CHAMBER ── */}
        <section className="page-section" style={{ marginTop: "4.5rem" }}>
          <h2>The failure we discovered</h2>
          <p>
            On claim verification&mdash;questions where you are given a false claim and then shown evidence against it&mdash;contradiction-first retrieval was the <strong>worst</strong> strategy. 80% accuracy versus 93% for an AI with no memory at all.
          </p>
          <p>
            Here is what happens: the model correctly identifies a claim as false. It stores that judgment. The next question is related. The system retrieves contradictions to the current belief&mdash;which means it retrieves the original false claim. It resurrects a belief it already correctly discarded.
          </p>
          <p>
            We call this the <em>anti-echo-chamber effect</em>. Where the echo chamber amplifies wrong beliefs, the anti-echo-chamber destabilizes correct ones. It is the symmetric failure mode. To our knowledge, it was previously undocumented.
          </p>
          <p style={{ fontStyle: "italic", color: "var(--graphite, #6B6560)" }}>
            A system designed to surface disagreement will disagree even with its own correct judgments, unless it can tell the difference.
          </p>
        </section>

        {/* ── THE BIOLOGY, AUDITED ── */}
        <section className="page-section" style={{ marginTop: "4.5rem" }}>
          <h2>Which pieces matter</h2>
          <p>
            We tested every component independently and in combination. Twelve variants, 1,080 evaluations.
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
            Tension weighting is the single most important component. It accounts for +4.4% marginal accuracy. The full stack beats every single component, confirming the pieces interact synergistically. But dopamine adds zero marginal accuracy&mdash;its value is entirely in calibration improvement, not correctness.
          </p>
          <p>
            The worst combination: tension + reconsolidation without dopamine or sleep. Making memories labile on retrieval without outcome feedback to stabilize them just degrades everything. The biology got this right: reconsolidation without prediction error gating is destructive.
          </p>
          <p>
            The minimum viable system is four rules: store direction and confidence, retrieve contradictions first, log outcomes and update, periodic downscaling. No graph. No max-heap. No REM. But the full architecture earns its complexity on longer horizons where sleep prevents memory bloat and the graph enables multi-agent sharing.
          </p>
        </section>

        {/* ── WHAT'S NEXT ── */}
        <section className="page-section" style={{ marginTop: "4.5rem" }}>
          <h2>What is next</h2>
          <p>
            <strong>Open source.</strong> The full EC implementation&mdash;trench formation, electromagnetic associations, protein-folding retrieval, tension weighting, sleep consolidation, and the metacognitive gate&mdash;will be released as an open-source library. The benchmark suite and all results are already available at <a href="https://github.com/saapai/ec-benchmark" style={{ color: "var(--rust, #8B3A2E)" }}>github.com/saapai/ec-benchmark</a>.
          </p>
          <p>
            <strong>Scaled experiments.</strong> The synthetic benchmark uses 30 questions per domain, which is underpowered for most statistical comparisons. We are scaling to 200+ unique questions per domain on public datasets (FEVER, DailyDialog, ChangeMyView), running across multiple model families, and adding production RAG baselines (BM25, Contriever, BGE) for fair comparison.
          </p>
          <p>
            <strong>Multi-session longitudinal testing.</strong> EC&rsquo;s sleep consolidation&mdash;which decays weak memories and strengthens strong ones overnight&mdash;has only been tested in single sessions. The architecture is designed for months of continuous operation, where consolidation cycles compound. Testing this requires long-horizon evaluations that do not yet exist in the literature.
          </p>
          <p>
            <strong>The vision.</strong> Entrenched Coils is one piece of a larger idea we call epistemic metabolism&mdash;a system that does not merely store information but continuously digests, challenges, and reconstructs its understanding of the world. Current AI memory systems are filing cabinets. What we are building is closer to how human memory actually works: lossy, emotional, reconstructive, and capable of genuine self-correction.
          </p>
        </section>

        {/* ── THE POINT ── */}
        <section className="page-section" style={{ marginTop: "5rem" }}>
          <h2 style={{ borderTopWidth: "2px", borderTopColor: "var(--rust, #8B3A2E)", paddingTop: "1.75rem" }}>The point</h2>
          <p>
            We started with 20 questions and a thesis: retrieve contradictions first. We ended with 10,000+ evaluations across ten domains and a different thesis entirely.
          </p>
          <p>
            The original claim was that doubt is universally useful. It is not. On trading data, doubt produced 0% accuracy with 91% confidence&mdash;the worst possible outcome. On Reddit, where data already has structure, doubt was redundant. On claim verification, doubt resurrects beliefs you already correctly discarded.
          </p>
          <p>
            But on personal data&mdash;your messages, your diary, your course decisions&mdash;the architecture produces something no flat retrieval system can. It discovers structure where none exists. It surfaces the conversation from six months ago that rhymes with today. It crosses the boundary between your fitness discussions and your music listening and your work stress and finds the thread connecting them.
          </p>
          <p>
            And on FEVER&mdash;the public benchmark with the largest sample size&mdash;EC achieved one result no other system matched: 96.7% contradiction detection on 1,002 claims. Agreement-first achieved 0%. The system does not make the model more accurate. But it <em>always shows you the other side</em>.
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
            will eventually mistake its own confidence for evidence.
          </p>
        </section>

        {/* ── TECHNICAL APPENDIX ── */}
        <section className="page-section" style={{ marginTop: "4.5rem" }}>
          <h2>Technical appendix</h2>

          <details style={{ marginTop: "1.5rem" }}>
            <summary style={{ cursor: "pointer", fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "var(--rust, #8B3A2E)" }}>
              Architecture overview
            </summary>
            <div style={{ marginTop: "1rem", fontSize: "0.82rem", lineHeight: 1.7 }}>
              <p>
                EC organizes memories on a three-dimensional spherical surface. Each memory is positioned by three coordinates: an azimuthal angle (topic/semantic dimension), a polar angle (emotional valence), and a radial distance (accessibility/recency). Position is computed as 60% emotional vector + 40% semantic cluster + temporal spiral offset.
              </p>
              <p>
                <strong>Trenches</strong> are basins carved into the sphere surface, with depth proportional to emotional significance (maximum 0.5 sphere radii). High-affect memories (above 0.7 emotional weight) create new trenches. A gravity model pulls nearby memories toward trench centers with strength proportional to depth.
              </p>
              <p>
                <strong>Electromagnetic associations</strong> bridge memories across different trenches. Bridge strength = 0.4 &times; semantic similarity + 0.4 &times; emotional resonance + 0.2 &times; temporal proximity. These decay over time at rates depending on type (emotional: 0.01/day, semantic: 0.02/day, temporal: 0.05/day).
              </p>
              <p>
                <strong>Protein-folding retrieval</strong> uses stochastic Markov chain traversal through the electromagnetic associations, taking up to 10 steps from a trigger memory, with probabilistic selection weighted by emotional state compatibility.
              </p>
              <p>
                <strong>Sleep consolidation</strong> applies global 15% downscaling (Synaptic Homeostasis Hypothesis), weakening all connections so only strongly reinforced ones survive.
              </p>
              <p>
                <strong>Tension weighting</strong> in retrieval uses: 20% recency + 30% conviction + 50% tension. This is the single most important component, contributing +4.4% marginal accuracy in ablation tests.
              </p>
            </div>
          </details>

          <details style={{ marginTop: "1.5rem" }}>
            <summary style={{ cursor: "pointer", fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "var(--rust, #8B3A2E)" }}>
              Crossover Theorem (formal)
            </summary>
            <div style={{ marginTop: "1rem", fontSize: "0.82rem", lineHeight: 1.7 }}>
              <p>
                Let p be the agent&rsquo;s current belief P(H = true), p* the true base rate, and &alpha; &isin; (0,1) the memory strength.
              </p>
              <p>
                Agreement retrieval shifts belief to: p_agree = p + &alpha;(1 &minus; p)<br />
                Contradiction retrieval shifts belief to: p_contra = p(1 &minus; &alpha;)
              </p>
              <p style={{
                textAlign: "center",
                fontFamily: "var(--font-display, Georgia), serif",
                fontStyle: "italic",
                color: "var(--rust, #8B3A2E)",
                margin: "1.5rem 0",
                lineHeight: 1.6,
              }}>
                For any p* &isin; (0,1) and &alpha; &isin; (0,1), there exists a unique crossover:<br />
                p&#770; = (2p* &minus; &alpha;) / (2(1 &minus; &alpha;))<br />
                Below p&#770;, agreement minimizes expected Brier score.<br />
                Above p&#770;, contradiction minimizes it.
              </p>
              <p>
                The crossover exists in [0,1] only when &alpha;/2 &le; p* &le; 1 &minus; &alpha;/2.
              </p>
            </div>
          </details>

          <details style={{ marginTop: "1.5rem" }}>
            <summary style={{ cursor: "pointer", fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "var(--rust, #8B3A2E)" }}>
              Benchmark results tables
            </summary>
            <div style={{ marginTop: "1rem", fontSize: "0.82rem", lineHeight: 1.7 }}>
              <p><strong>7-Domain Synthetic Benchmark (2,340 evaluations, phi4:14b)</strong></p>
              <div style={{ overflowX: "auto" }}>
                <table className="md-table" style={{ width: "100%", fontSize: "0.78rem" }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left" }}>system</th>
                      <th>accuracy</th>
                      <th>brier</th>
                      <th>ECE</th>
                      <th>halluc</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td style={{ fontWeight: 600 }}>agreement</td><td>0.900</td><td>0.099</td><td>0.089</td><td>0.100</td></tr>
                    <tr><td style={{ fontWeight: 600, color: "var(--rust)" }}>entrenched coils</td><td>0.890</td><td>0.102</td><td style={{ color: "var(--rust)" }}>0.080</td><td>0.105</td></tr>
                    <tr><td>random</td><td>0.871</td><td>0.118</td><td>0.107</td><td>0.124</td></tr>
                    <tr><td>no memory</td><td>0.867</td><td>0.143</td><td>0.157</td><td>0.086</td></tr>
                    <tr><td>devils advocate</td><td>0.862</td><td>0.128</td><td>0.125</td><td>0.133</td></tr>
                    <tr><td>recency</td><td>0.843</td><td>0.144</td><td>0.135</td><td>0.152</td></tr>
                  </tbody>
                </table>
              </div>

              <p style={{ marginTop: "1.5rem" }}><strong>Ablation (12 variants, 1,080 evaluations)</strong></p>
              <div style={{ overflowX: "auto" }}>
                <table className="md-table" style={{ width: "100%", fontSize: "0.78rem" }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left" }}>component</th>
                      <th>marginal accuracy</th>
                      <th>marginal brier</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>tension weighting</td><td>+4.4%</td><td>&minus;0.041</td></tr>
                    <tr><td>sleep consolidation</td><td>+1.1%</td><td>&minus;0.020</td></tr>
                    <tr><td>reconsolidation</td><td>+1.1%</td><td>&minus;0.021</td></tr>
                    <tr><td>dopamine RPE</td><td>+0.0%</td><td>&minus;0.010</td></tr>
                    <tr><td style={{ fontWeight: 600 }}>full stack</td><td>best ECE (0.071)</td><td>best Brier (0.081)</td></tr>
                  </tbody>
                </table>
              </div>

              <p style={{ marginTop: "1.5rem" }}><strong>FEVER n=1,002 (publication grade)</strong></p>
              <div style={{ overflowX: "auto" }}>
                <table className="md-table" style={{ width: "100%", fontSize: "0.78rem" }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left" }}>system</th>
                      <th>accuracy</th>
                      <th>brier</th>
                      <th>ECE</th>
                      <th>contradict detect</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td style={{ fontWeight: 600, color: "var(--rust)" }}>EC</td><td>61.8%</td><td>0.316</td><td>0.290</td><td style={{ color: "var(--rust)" }}>96.7%</td></tr>
                    <tr><td>flat</td><td>60.9%</td><td>0.322</td><td>0.296</td><td>94.3%</td></tr>
                    <tr><td>agreement</td><td>59.6%</td><td>0.333</td><td>0.314</td><td>0%</td></tr>
                    <tr><td>devils advocate</td><td>59.6%</td><td>0.333</td><td>0.314</td><td>0%</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </details>

          <details style={{ marginTop: "1.5rem" }}>
            <summary style={{ cursor: "pointer", fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "var(--rust, #8B3A2E)" }}>
              Statistical caveats
            </summary>
            <div style={{ marginTop: "1rem", fontSize: "0.82rem", lineHeight: 1.7 }}>
              <p>
                The synthetic benchmark uses n=30 per domain. Paired bootstrap tests (10,000 resamples) found no pairwise comparison reaching p &lt; 0.05 except drift stress (40 percentage point spread). All synthetic findings should be treated as directional evidence pending scaled replication.
              </p>
              <p>
                The iMessage benchmark (p=0.002) and multi-domain results (5,000+ evaluations) provide stronger statistical grounding. FEVER n=1,002 confidence intervals: EC [0.587, 0.648], Flat [0.578, 0.639]&mdash;overlapping on accuracy, but the contradiction detection gap (96.7% vs 0%) is unambiguous.
              </p>
              <p>
                Models: phi4:14b and gemma3:27b via Ollama, local inference. Multi-model replication is a stated next step.
              </p>
            </div>
          </details>
        </section>

        {/* ── METHODOLOGY ── */}
        <section className="page-section" style={{ marginTop: "4.5rem" }}>
          <h2>Methodology</h2>
          <p style={{ fontSize: "0.82rem", lineHeight: 1.7 }}>
            <strong>Evaluations:</strong> 10,000+ total across 10 domains. Synthetic benchmark: 2,340 (7 domains &times; 6 systems + 12 ablation variants). Full architecture: 19 questions on 5K real iMessages. Plus: Canvas diary (14q), UCLA courses (10q), DailyDialog (10q), FEVER (1,002 claims &times; 4 systems), Enron (23q), Reddit (22q), Spotify (5q), trading (5q), cross-domain (8q).<br />
            <strong>Models:</strong> phi4:14b and gemma3:27b via Ollama, local inference.<br />
            <strong>Full architecture:</strong> Topographic sphere with trenches, gravity-weighted retrieval, electromagnetic cross-trench associations, protein-folding stochastic walks, tension-weighted edges, sleep consolidation.<br />
            <strong>Metrics:</strong> Accuracy, Brier score, ECE (10 bins), hallucination rate, confidence drift, contradiction detection rate.<br />
            <strong>Code:</strong> Open source at <a href="https://github.com/saapai/ec-benchmark" style={{ color: "var(--rust, #8B3A2E)" }}>github.com/saapai/ec-benchmark</a>. All result JSONs, benchmark scripts, and analysis code included.
          </p>
        </section>

        <footer style={{ marginTop: "5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--rule, rgba(28,26,23,0.08))", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase" as const, color: "var(--graphite, #6B6560)" }}>
            saathvik pai &middot; ucla &middot; june 2026
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--graphite, #6B6560)", marginTop: "0.5rem" }}>
            <Link href="/letters/entrenched-coils" style={{ color: "var(--rust, #8B3A2E)" }}>Paper I: The Architecture</Link>
            {" "}&middot;{" "}
            <Link href="/letters/entrenched-coils-benchmark" style={{ color: "var(--rust, #8B3A2E)" }}>Paper II: The Benchmark</Link>
            {" "}&middot;{" "}
            <a href="https://github.com/saapai/ec-benchmark" style={{ color: "var(--rust, #8B3A2E)" }}>GitHub</a>
            {" "}&middot;{" "}
            <Link href="/" style={{ color: "var(--rust, #8B3A2E)" }}>aureliex</Link>
          </p>
        </footer>
      </article>
    </>
  );
}
