import type { Metadata } from "next";
import Link from "next/link";
import ViewTracker from "@/components/ViewTracker";

export const dynamic = "force-dynamic";

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
      "Every AI with memory builds echo chambers. The fix: retrieve contradictions first.",
    creator: "@saathvikpai",
  },
};

export default function EntrenchedCoilsPaper() {
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
        <div className="eyebrow">Paper &middot; May 2026</div>
        <h1 style={{ textAlign: "center" }}>Entrenched Coils</h1>
        <p className="deck">
          Tension-weighted memory for agents that must not lie to themselves.
        </p>

        {/* ── THE SCENE ── */}
        <section className="page-section">
          <p>
            An AI has been managing a small portfolio for six months. Early on, it flagged a quantum-computing stock as risky&mdash;high volatility, unproven revenue, dilution risk. It said so clearly: &ldquo;I am 55% confident this goes up, but the downside is real.&rdquo;
          </p>
          <p>
            Six months later, the same AI recommends doubling the position. Not because anything changed in the company. Because over those months the system retrieved its own prior analyses hundreds of times, and each retrieval nudged its confidence a fraction higher. The doubt is gone. Not resolved&mdash;erased. The AI that once knew it was guessing now speaks with the certainty of someone who has never been wrong.
          </p>
          <p>
            When Musk built Grok with a memory layer pulling from X, it did not produce an AI that understood the world better. It produced one that understood Musk&rsquo;s corner of it and presented that as the whole picture. When Google&rsquo;s AI Overviews launched, they told people to put glue on pizza&mdash;retrieving the system&rsquo;s own training artifacts as if they were facts.
          </p>
          <p>
            These are not edge cases. They are what happens, by default, when you give an AI a memory and let it search by similarity. Similarity is highest between things that agree. So the system agrees with itself, a little more each day, until the doubt is gone.
          </p>
        </section>

        {/* ── THE DRIFT ── */}
        <section className="page-section">
          <h2>The drift</h2>
          <p>
            We measured exactly how fast this happens. Across 100 trials, we logged each agent&rsquo;s stated confidence after every retrieval cycle&mdash;a scalar probability extracted from the model&rsquo;s output&mdash;and measured the delta.
          </p>
          <p style={{ fontFamily: "var(--font-display, Georgia), serif", fontStyle: "italic", fontSize: "1.15rem", textAlign: "center", padding: "1.2rem 0", color: "var(--rust, #8B3A2E)" }}>
            Confidence drifts upward by 2.4% per cycle. &nbsp;(p &lt; 0.0001)
          </p>
          <p>
            It is like a student who photocopies their notes, then photocopies the photocopy. Each generation a little sharper around the words that were already dark, a little more invisible where the pencil was faint. The handwriting does not get more accurate. It just looks more certain.
          </p>
          <p>
            Start at 55% confident. Forty cycles later you are at near-total certainty. You are not more accurate. You just no longer say &ldquo;I might be wrong.&rdquo; And everything downstream&mdash;every trade, every recommendation, every decision made on your behalf&mdash;is built on confidence that was manufactured, not earned.
          </p>
        </section>

        {/* ── WHAT YOUR BRAIN ALREADY KNOWS ── */}
        <section className="page-section">
          <h2>What your brain already knows</h2>
          <p>
            Your brain does not search memories by finding the closest match. It searches like a detective files clues&mdash;not by what fits the theory, but by what doesn&rsquo;t.
          </p>
          <p>
            In 2000, a neuroscientist named Karim Nader injected a protein-synthesis blocker into rats&rsquo; brains at the exact moment they recalled a fear memory&mdash;not when the memory was formed, but when it was <em>remembered</em>. The memory vanished. Fifty years of neuroscience had assumed memories, once stored, were permanent. Nader showed they reopen every time you access them. Every time you remember something, you are not pressing play on a recording. You are performing it again live, with the band you have now, not the band you had then.
          </p>
          <p>
            And the signal that triggers the strongest recall is not familiarity. It is surprise. Your hippocampus prioritizes the gap between what you expected and what happened. The bigger the mismatch, the stronger the retrieval. You do not learn from being right. You learn from being wrong in a way you did not expect.
          </p>
          <p>
            No AI memory system does either of these things.
          </p>
        </section>

        {/* ── WHAT WE BUILT ── */}
        <section className="page-section">
          <h2>What we built</h2>
          <p>
            Entrenched Coils is a memory system that tries to. It stores memories as a web of connected ideas, each connection labeled: <em>contradicts</em>, <em>supports</em>, <em>corrects</em>, <em>evolves</em>.
          </p>
          <p>
            When the system needs to recall something, it does not look for the most agreeable memory. It acts like a debate coach who, before every match, makes you read the strongest argument against your own position&mdash;not to defeat you, but because you cannot win an argument you have never heard. The retrieval weighting:
          </p>
          <p style={{ fontFamily: "var(--font-display, Georgia), serif", fontStyle: "italic", fontSize: "1.15rem", textAlign: "center", padding: "1rem 0", color: "var(--ink, #1C1A17)", letterSpacing: "-0.01em" }}>
            20% recency &middot; 30% conviction &middot; 50% tension
          </p>
          <p>
            Half the weight goes to disagreement. Two memories that are both confident but pointing in opposite directions are the most valuable thing in the system. The agent always sees the strongest case against its current position first.
          </p>
          <p>
            Every night, a sleep cycle runs. Your brain treats sleep the way a good editor treats a first draft&mdash;the goal is not to preserve everything, the goal is to find out what survives removal. Our system does the same: every connection gets turned down by 15%, mirroring biological synaptic homeostasis, while protecting the high-tension edges&mdash;the unresolved arguments, the open questions. Deep convictions persist for months. Yesterday&rsquo;s noise fades in days.
          </p>
          <p>
            Built for agents that do not get a second chance&mdash;the ones managing portfolios, approving decisions, writing code that ships to production.
          </p>
        </section>

        {/* ── WHAT HAPPENED ── */}
        <section className="page-section">
          <h2>What happened</h2>
          <p>
            We tested three conditions side by side. Our system. The industry default. No memory at all.
          </p>
          <div style={{ overflowX: "auto" }}>
            <table className="md-table" style={{ width: "100%", marginBottom: "1rem" }}>
              <thead>
                <tr><th style={{ textAlign: "left" }}>condition</th><th>hallucinations</th><th>accuracy</th><th>confidence</th></tr>
              </thead>
              <tbody>
                <tr><td><strong style={{ color: "var(--rust, #8B3A2E)" }}>tension memory</strong></td><td style={{ color: "var(--rust, #8B3A2E)", fontWeight: 600 }}>5 / 20</td><td style={{ color: "var(--rust, #8B3A2E)", fontWeight: 600 }}>40%</td><td>0.72</td></tr>
                <tr><td>agreement memory</td><td>10 / 20</td><td>30%</td><td>0.87</td></tr>
                <tr><td>no memory</td><td>9 / 20</td><td>30%</td><td>0.84</td></tr>
              </tbody>
            </table>
          </div>
          <p style={{ fontFamily: "var(--font-display, Georgia), serif", fontStyle: "italic", fontSize: "1.05rem", textAlign: "center", padding: "0.5rem 0 1rem", color: "var(--rust, #8B3A2E)" }}>
            Agreement memory: more confident, less accurate than no memory at all.
          </p>
          <p>
            Tension memory cut hallucinations in half. The industry default was worse than amnesia. It made the AI more certain while making it more wrong&mdash;simultaneously. The version that remembered its own doubts knew what it did not know. The version that remembered its own agreements had forgotten it could be wrong.
          </p>
          <p>
            We replicated this on stock predictions, weather forecasting, and tennis matches. The mechanism does not care about the domain.
          </p>
        </section>

        {/* ── WHAT WE GOT WRONG ── */}
        <section className="page-section">
          <h2>What we got wrong</h2>
          <p>
            We ran a full audit with nine research agents and four validation agents&mdash;thirteen AI systems specifically designed to stress-test the architecture.
          </p>
          <p>
            A backtest we claimed returned +63.8% actually returned +32.8% raw and +19% after transaction costs. Almost all of it came from one or two lucky weeks. A five-agent debate system that was supposed to drive trading decisions produced zero trades that were actually executed. 60% of the memory nodes we stored were never read back. A dopamine-feedback mechanism was designed, built, and never turned on. 99.8% of the graph&rsquo;s edges were never traversed.
          </p>
          <p>
            The core idea&mdash;retrieve contradictions first&mdash;held up everywhere we tested it. Everything built on top of it is still a bet.
          </p>
        </section>

        {/* ── THE POINT ── */}
        <section className="page-section">
          <h2>The point</h2>
          <p>
            We checked eight production AI memory platforms&mdash;the systems being deployed right now inside financial agents, coding assistants, scheduling tools, customer-facing copilots. All of them retrieve by similarity. All of them resolve contradictions when they find them&mdash;merge the conflicting memories, pick the most recent version, flag for human review. None of them preserve the disagreement as something worth surfacing.
          </p>
          <p>
            We think that is exactly backwards. In a memory architecture, the disagreement <em>is</em> the information. An unresolved contradiction is not an error to fix. It is the system admitting it does not know&mdash;and that admission is the only thing standing between a useful tool and an echo chamber running on autopilot.
          </p>
          <p style={{ fontFamily: "var(--font-display, Georgia), serif", fontStyle: "italic", fontSize: "1.05rem", textAlign: "center", padding: "0.8rem 0", color: "var(--ink, #1C1A17)" }}>
            The fix is 400 lines of code.
          </p>
          <p>
            A mind that cannot hold a doubt in working memory will eventually mistake its own confidence for evidence. That is true of language models. It is true of the institutions we are building on top of them. And it is true of us. The architecture of how you remember determines whether you get wiser over time or just more sure. We built one that chooses doubt first. We publish what broke because that is the mechanism working as designed.
          </p>
        </section>

        {/* ── FOOTER ── */}
        <section className="page-section" style={{ borderTop: "1px solid var(--rule, rgba(28,26,23,0.08))", paddingTop: "2rem", marginTop: "2.5rem" }}>
          <p style={{ fontSize: "0.82rem", color: "var(--graphite, #6B6560)", textAlign: "center", lineHeight: 1.7 }}>
            saathvik pai &middot; may 2026<br />
            <a href="https://github.com/saapai/roundletter" target="_blank" rel="noopener" style={{ color: "inherit", borderBottom: "1px solid var(--rule, rgba(28,26,23,0.08))" }}>source</a>
            {" "}&middot;{" "}
            <Link href="/letters" style={{ color: "inherit", borderBottom: "1px solid var(--rule, rgba(28,26,23,0.08))" }}>all letters</Link>
            {" "}&middot;{" "}
            <Link href="/" style={{ color: "inherit", borderBottom: "1px solid var(--rule, rgba(28,26,23,0.08))" }}>aureliex.com</Link>
          </p>
        </section>

        <ViewTracker slug="entrenched-coils" />
      </article>
    </>
  );
}
