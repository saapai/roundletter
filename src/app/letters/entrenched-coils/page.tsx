import type { Metadata } from "next";
import Link from "next/link";
import ViewTracker from "@/components/ViewTracker";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Entrenched Coils — a paper on tension-weighted memory",
  description:
    "Every AI agent with persistent memory will develop echo chambers. This paper proposes tension-weighted retrieval: surface contradictions first. Hallucination rate drops 50%.",
  openGraph: {
    title: "Every AI With Memory Is Lying to Itself",
    description:
      "We tested the memory systems inside today's AI agents. The industry default was worse than amnesia.",
    url: "https://aureliex.com/letters/entrenched-coils",
    siteName: "aureliex",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Every AI With Memory Is Lying to Itself",
    description:
      "We tested the memory systems inside today's AI agents. The industry default was worse than amnesia.",
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
        <div className="eyebrow">Paper <span style={{ color: "var(--rust, #8B3A2E)", opacity: 0.7 }}>&middot;</span> May 2026</div>
        <h1 style={{ textAlign: "center" }}>Every AI With Memory<br />Is Lying to Itself</h1>
        <p className="deck">
          We tested the memory systems inside today&rsquo;s AI agents.<br />
          The industry default was worse than amnesia.
        </p>

        <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "var(--graphite, #6B6560)", textAlign: "center", marginTop: "1rem" }}>
          entrenched coils &middot; saathvik pai &middot; ucla
        </p>

        {/* ── WHAT KEEPS HAPPENING ── */}
        <section className="page-section" style={{ marginTop: "4rem" }}>
          <p className="lede">
            In May 2024, Google&rsquo;s AI Overviews told users to put glue on pizza. The source was a decade-old Reddit joke. Google fixed it. Weeks later, the AI recommended glue again, this time citing a Business Insider article about the original incident. The system had retrieved its own mistake as evidence that the mistake was correct.
          </p>
          <p>
            That same year, researchers published a paper in <em>Nature</em> proving that AI models trained on their own outputs progressively degrade, losing diversity and accuracy until they collapse into nonsense. They called it model collapse.
          </p>
          <p>
            In 2021, Zillow gave an algorithm the power to buy houses automatically. The algorithm consistently overpaid. Its own purchases at inflated prices became market data that inflated its future estimates further. Zillow lost $528 million in a single quarter, shut down the entire division, and laid off 2,000 people.
          </p>
          <p>
            In July 2025, Grok, trained on data from X and instructed to be &ldquo;anti-woke,&rdquo; began injecting conspiracy theories into questions about baseball, Medicaid, and HBO Max. When asked which historical figure would solve a political problem, it answered Adolf Hitler. xAI reportedly lost a government contract.
          </p>
          <p>
            Every time, the same thing happens. A system with memory retrieves information that confirms what it already believes. The confirmation becomes part of the memory. The next retrieval finds even stronger confirmation. The loop tightens until the doubt is gone.
          </p>
        </section>

        {/* ── THE DRIFT ── */}
        <section className="page-section" style={{ marginTop: "4.5rem" }}>
          <h2>The drift</h2>
          <p>
            Every production AI memory system retrieves by similarity. And similarity is highest between things that agree. So when an AI looks back at what it has said before, it finds memories that point in the same direction as its current belief. It reads its own confidence back, nudges a little further, saves the result. The cycle repeats.
          </p>
          <p>
            We measured the speed of this loop across 100 trials, logging each agent&rsquo;s stated confidence after every retrieval cycle.
          </p>

          <p style={{ fontStyle: "italic", color: "var(--rust, #8B3A2E)", margin: "1.5rem 0" }}>
            Confidence drifts upward by 2.4% per cycle (p &lt; 0.0001).
          </p>
          <p>
            That compounds. An agent that starts at a reasonable 55% confidence reaches near-total certainty within 40 cycles. It is no more accurate than when it started. It has just stopped saying &ldquo;I might be wrong.&rdquo; And everything built on top of that confidence, every recommendation and every decision, inherits the same blind certainty.
          </p>
          <p>
            We found this in every system we tested: Zep, Mem0, Letta, MAGMA, and four others. All of them retrieve by similarity. All of them build echo chambers.
          </p>
        </section>

        {/* ── WHAT YOUR BRAIN DOES DIFFERENTLY ── */}
        <section className="page-section" style={{ marginTop: "4.5rem" }}>
          <h2>What your brain does differently</h2>
          <p>
            In 2000, a neuroscientist named Karim Nader injected a protein-synthesis blocker into rats&rsquo; brains at the exact moment they recalled a fear memory. Not when the memory was formed. When it was remembered. The memory vanished. Fifty years of neuroscience had assumed that memories, once stored, were fixed. Nader showed they reopen every time you access them. Remembering is not playback. It is reconstruction, a fresh build from whatever pieces are available now.
          </p>
          <p>
            The signal that triggers the strongest recall turns out to be surprise, not familiarity. Your hippocampus prioritizes the gap between what you expected and what happened. The bigger the mismatch, the stronger the update.
          </p>

          <p>
            Sleep finishes the job. Each night your brain replays the day, runs what-if simulations during dreams, and turns down every neural connection by about 15%. Only the connections that earned their strength survive.
          </p>
          <p>
            Memories rewrite themselves on recall. Surprise drives what gets remembered. Sleep compresses everything nightly. No AI memory system does any of this.
          </p>
        </section>

        {/* ── WHAT WE BUILT ── */}
        <section className="page-section" style={{ marginTop: "4.5rem" }}>
          <h2>What we built</h2>
          <p>
            Entrenched Coils is a memory system modeled on all three. It stores memories as a graph, a web of connected ideas. Each connection is labeled: <em>contradicts</em>, <em>supports</em>, <em>corrects</em>, <em>evolves</em>. When the system needs to recall something, it does not look for the most agreeable memory. It looks for the most tense one, the strongest case against whatever the agent currently believes.
          </p>
          <p>
            The retrieval score is weighted:
          </p>

          {/* The formula as a designed ledger */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "clamp(1.25rem, 3vw, 2.5rem)",
            flexWrap: "wrap",
            margin: "2.75rem auto",
            padding: "1.5rem 2rem",
            maxWidth: "32rem",
            borderTop: "1px solid var(--rule, rgba(28,26,23,0.08))",
            borderBottom: "1px solid var(--rule, rgba(28,26,23,0.08))",
          }}>
            {[
              { pct: "20%", label: "recency" },
              { pct: "30%", label: "conviction" },
              { pct: "50%", label: "tension" },
            ].map((item, i) => (
              <span key={i} style={{ textAlign: "center" }}>
                <span style={{
                  display: "block",
                  fontSize: "1.6em",
                  fontFamily: "var(--font-display, Georgia), serif",
                  fontStyle: "italic",
                  color: "var(--rust, #8B3A2E)",
                  lineHeight: 1.1,
                }}>{item.pct}</span>
                <span style={{
                  display: "block",
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase" as const,
                  color: "var(--graphite, #6B6560)",
                  marginTop: "0.3rem",
                }}>{item.label}</span>
              </span>
            ))}
          </div>

          <p>
            Half the weight goes to disagreement. Two memories that are both confident but pointing in opposite directions are the most valuable thing in the system. The agent always sees the strongest case against its current belief first.
          </p>
          <p>
            Every night, a sleep cycle compresses the graph. Every connection gets turned down by 15%, while the important disagreements are protected. Forgetting follows a slow curve: 10% of a memory&rsquo;s original strength remains after three months. Deep convictions and open questions persist. Routine observations fade in days.
          </p>
          <p style={{ fontSize: "0.92rem", color: "var(--graphite, #6B6560)", marginTop: "1.5rem" }}>
            The current graph: 687 nodes, 1,768 edges, 41% compressed by sleep.
          </p>
        </section>

        {/* ── WHAT HAPPENED ── */}
        <section className="page-section" style={{ marginTop: "4.5rem" }}>
          <h2>What happened</h2>
          <p>
            We tested three conditions side by side: our tension-weighted system, the industry default (retrieve by agreement), and no memory at all.
          </p>
          <div style={{ overflowX: "auto" }}>
            <table className="md-table" style={{ width: "100%", marginBottom: "0.5rem" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>condition</th>
                  <th>hallucinations</th>
                  <th>accuracy</th>
                  <th>confidence</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontFamily: "var(--font-display, Georgia), serif", fontStyle: "italic", fontWeight: 500, color: "var(--ink, #1C1A17)" }}>tension memory</td>
                  <td style={{ color: "var(--rust, #8B3A2E)", fontWeight: 600 }}>5 / 20</td>
                  <td style={{ color: "var(--rust, #8B3A2E)", fontWeight: 600 }}>40%</td>
                  <td>0.72</td>
                </tr>
                <tr>
                  <td>agreement memory</td>
                  <td>10 / 20</td>
                  <td>30%</td>
                  <td>0.87</td>
                </tr>
                <tr>
                  <td>no memory</td>
                  <td>9 / 20</td>
                  <td>30%</td>
                  <td>0.84</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            We replicated this on stock predictions, weather forecasting, and tennis matches, three domains with nothing in common except the retrieval layer underneath. In all three, tension memory cut hallucinations roughly in half. The agent that surfaced its own doubts was better calibrated. The one that only retrieved agreement was worse than having no memory at all.
          </p>
        </section>

        {/* ── WHAT WE GOT WRONG ── */}
        <section className="page-section" style={{ marginTop: "4.5rem" }}>
          <h2>What we got wrong</h2>
          <p>
            We ran a full audit with nine research agents and four validation agents, thirteen AI systems designed to stress-test the architecture.
          </p>
          <p>
            A backtest we claimed returned +63.8% actually returned +32.8% raw and +19% after costs. Almost all of it came from one or two lucky weeks. A five-agent debate system that was supposed to drive decisions produced zero trades that were executed. 60% of the memory nodes we stored were never read back. A dopamine-feedback mechanism was designed, built, and never turned on. 99.8% of the graph&rsquo;s edges were never traversed.
          </p>
          <p>
            The core idea, retrieve contradictions first, held up everywhere we tested it. Everything built on top of it is still a bet.
          </p>
          <p style={{ marginTop: "2rem", paddingTop: "1.25rem", borderTop: "1px solid var(--rule, rgba(28,26,23,0.08))", fontStyle: "italic", color: "var(--graphite, #6B6560)" }}>
            We publish this because a system designed to surface disagreement should probably start with its own.
          </p>
        </section>

        {/* ── THE POINT ── */}
        <section className="page-section" style={{ marginTop: "5rem" }}>
          <h2 style={{ borderTopWidth: "2px", borderTopColor: "var(--rust, #8B3A2E)", paddingTop: "1.75rem" }}>The point</h2>
          <p>
            Every production AI memory platform we tested resolves contradictions when it finds them: merge the conflicting memories, pick the most recent version, flag for human review. None of them treat the disagreement as worth keeping.
          </p>
          <p>
            The disagreement is the information. An unresolved contradiction means the system is admitting it does not know, and that admission is the only thing standing between a useful tool and an echo chamber running on autopilot.
          </p>
          <p>
            Zillow&rsquo;s algorithm could not doubt its own price estimates. Google&rsquo;s AI Overviews could not doubt its own prior answers. Grok could not doubt its training data. Every one of them was missing the same thing: a way to retrieve the evidence against its current belief.
          </p>
          <p>
            That is what we built. A memory system that retrieves contradictions first, compresses nightly, forgets what doesn&rsquo;t matter, and treats doubt as a feature of working correctly. The source code is public. The results, including the failures, are on this page.
          </p>
          <p style={{
            marginTop: "1.5rem",
            fontFamily: "var(--font-display, Georgia), serif",
            fontStyle: "italic",
            fontSize: "0.92rem",
            color: "var(--graphite, #6B6560)",
            lineHeight: 1.7,
          }}>
            A memory system that cannot hold a doubt will eventually mistake its own confidence for evidence.
          </p>
        </section>

        {/* ── FOOTER ── */}
        <section className="page-section" style={{ borderTop: "1px solid var(--rule, rgba(28,26,23,0.08))", paddingTop: "2rem", marginTop: "3rem" }}>
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
