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
      "If your agent only retrieves what it already believes, it isn't thinking. It's rehearsing.",
    url: "https://aureliex.com/letters/entrenched-coils",
    siteName: "aureliex",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Entrenched Coils",
    description:
      "If your agent only retrieves what it already believes, it isn't thinking. It's rehearsing.",
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
        <h1 style={{ textAlign: "center" }}>Entrenched Coils</h1>
        <p className="deck">
          If your agent only retrieves what it already believes,<br />
          it isn&rsquo;t thinking. It&rsquo;s rehearsing.
        </p>

        {/* ── THE SCENE ── */}
        <section className="page-section" style={{ marginTop: "4rem" }}>
          <p className="lede">
            An AI has been managing a small portfolio for six months. Early on, it flagged a quantum-computing stock as risky&mdash;high volatility, unproven revenue, dilution risk. It said so clearly: &ldquo;I am 55% confident this goes up, but the downside is real.&rdquo;
          </p>
          <p>
            Six months later, the same AI recommends doubling the position. Not because anything changed in the company. Because over those months the system retrieved its own prior analyses hundreds of times, and each retrieval nudged its confidence a fraction higher. The doubt is gone. Not resolved&mdash;erased.
          </p>
          <p>
            When Musk built Grok with a memory layer pulling from X, the result was not an AI that understood the world better. It was one that understood Musk&rsquo;s corner of it and presented that as the whole picture. When Google&rsquo;s AI Overviews launched, they told people to put glue on pizza&mdash;retrieving the system&rsquo;s own artifacts as if they were facts.
          </p>
          <p>
            These are what happens, by default, when you give an AI a memory and let it search by similarity. Similarity is highest between things that agree. So the system agrees with itself, a little more each day, until the doubt is gone.
          </p>
        </section>

        {/* ── THE DRIFT ── */}
        <section className="page-section" style={{ marginTop: "4.5rem" }}>
          <h2>The drift</h2>
          <p>
            We measured how fast this goes wrong. Across 100 trials, we logged each agent&rsquo;s stated confidence after every retrieval cycle and measured the change.
          </p>

          <p className="pull-quote" style={{ maxWidth: "24ch" }}>
            Confidence drifts upward<br />
            by 2.4% per cycle.<br />
            <span style={{ fontSize: "0.55em", letterSpacing: "0.08em", fontStyle: "normal", fontFamily: "var(--font-mono, monospace)", color: "var(--graphite, #6B6560)" }}>p &lt; 0.0001</span>
          </p>

          <p>
            It is like photocopying your notes, then photocopying the photocopy. Each generation a little sharper around the words that were already dark, a little more invisible where the pencil was faint. The handwriting does not get more accurate. It just looks more certain.
          </p>
          <p>
            Start at 55% confident. Forty cycles later: near-total certainty. Not smarter. Just louder. And everything downstream&mdash;every trade, every recommendation, every decision made on your behalf&mdash;is built on confidence that was manufactured, not earned.
          </p>
        </section>

        {/* ── WHAT YOUR BRAIN ALREADY KNOWS ── */}
        <section className="page-section" style={{ marginTop: "4.5rem" }}>
          <h2>What your brain already knows</h2>
          <p>
            Your brain does not search memories by finding the closest match. It searches like a detective files clues&mdash;not by what fits the theory, but by what doesn&rsquo;t.
          </p>
          <p>
            In 2000, Karim Nader injected a protein-synthesis blocker into rats&rsquo; brains at the exact moment they recalled a fear memory&mdash;not when it was formed, but when it was <em>remembered</em>. The memory vanished. Fifty years of neuroscience had assumed memories, once stored, were permanent. Nader showed they reopen every time you access them. Every time you remember something, you are performing it again live, with the band you have now&mdash;not the band you had then.
          </p>

          <p className="pull-quote" style={{ maxWidth: "26ch" }}>
            You do not learn from being right.<br />
            You learn from being wrong in a way you did not expect.
          </p>

          <p>
            The signal that triggers the strongest recall is not familiarity. It is surprise. Your hippocampus prioritizes the gap between what you expected and what happened. The bigger the mismatch, the stronger the retrieval.
          </p>
          <p>
            No AI memory system does either of these things.
          </p>
        </section>

        {/* ── WHAT WE BUILT ── */}
        <section className="page-section" style={{ marginTop: "4.5rem" }}>
          <h2>What we built</h2>
          <p>
            Entrenched Coils stores memories as a web of connected ideas, each connection labeled: <em>contradicts</em>, <em>supports</em>, <em>corrects</em>, <em>evolves</em>. When the system needs to recall something, it acts like a debate coach who makes you read the strongest argument against your own position before every match&mdash;not to defeat you, but because you cannot win an argument you have never heard.
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
            Half the weight goes to disagreement. Two memories that are both confident but pointing in opposite directions are the most valuable thing in the system. The agent always sees the strongest case against its current position first.
          </p>
          <p>
            Every night, a sleep cycle runs. Your brain treats sleep the way a good editor treats a first draft&mdash;the goal is not to preserve everything, the goal is to find out what survives removal. Our system does the same: every connection gets turned down by 15%, mirroring biological synaptic homeostasis, while protecting the high-tension edges. Deep convictions persist for months. Yesterday&rsquo;s noise fades in days.
          </p>
          <p style={{ fontStyle: "italic", color: "var(--graphite, #6B6560)", fontSize: "0.92rem", marginTop: "1.5rem" }}>
            Built for agents that do not get a second chance&mdash;the ones managing portfolios, approving decisions, writing code that ships to production.
          </p>
        </section>

        {/* ── WHAT HAPPENED ── */}
        <section className="page-section" style={{ marginTop: "4.5rem" }}>
          <h2>What happened</h2>
          <p>
            Three conditions, side by side. Our system. The industry default. No memory at all.
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

          <p className="pull-quote" style={{ maxWidth: "30ch", color: "var(--rust, #8B3A2E)" }}>
            Agreement memory: more confident<br />and less accurate than no memory at all.
          </p>

          <p>
            The version that remembered its own doubts knew what it did not know. The version that remembered its own agreements had forgotten it could be wrong. Replicated on stock predictions, weather forecasting, and tennis matches. The mechanism does not care about the domain.
          </p>
        </section>

        {/* ── WHAT WE GOT WRONG ── */}
        <section className="page-section" style={{ marginTop: "4.5rem" }}>
          <h2>What we got wrong</h2>
          <p>
            Nine research agents and four validation agents&mdash;thirteen AI systems designed to stress-test the architecture&mdash;ran every audit we could think of.
          </p>
          <p>
            A backtest we claimed returned +63.8% actually returned +32.8% raw, +19% after costs. Almost all of it came from one or two lucky weeks. A five-agent debate system that was supposed to drive decisions produced zero trades that were executed. 60% of the memory nodes were never read back. A dopamine-feedback mechanism was built and never turned on.
          </p>
          <p>
            The core idea&mdash;retrieve contradictions first&mdash;held up everywhere we tested it. Everything built on top of it is still a bet.
          </p>
          <p style={{ marginTop: "2rem", paddingTop: "1.25rem", borderTop: "1px solid var(--rule, rgba(28,26,23,0.08))", fontStyle: "italic", color: "var(--graphite, #6B6560)" }}>
            We publish this because the interesting thing is not what you got right. It is what you were honest about getting wrong.
          </p>
        </section>

        {/* ── THE POINT ── */}
        <section className="page-section" style={{ marginTop: "5rem" }}>
          <h2 style={{ borderTopWidth: "2px", borderTopColor: "var(--rust, #8B3A2E)", paddingTop: "1.75rem" }}>The point</h2>
          <p>
            We checked eight production AI memory platforms&mdash;the systems being deployed right now inside financial agents, coding assistants, scheduling tools, customer-facing copilots. All of them retrieve by similarity. All of them resolve contradictions when they find them. None of them preserve the disagreement as something worth surfacing.
          </p>
          <p>
            In a memory architecture, the disagreement <em>is</em> the information. An unresolved contradiction is not an error to fix. It is the system admitting it does not know&mdash;and that admission is the only thing standing between a useful tool and an echo chamber running on autopilot.
          </p>
          <p style={{
            fontFamily: "var(--font-display, Georgia), serif",
            fontStyle: "italic",
            fontSize: "clamp(1.15rem, 1rem + 0.7vw, 1.42rem)",
            textAlign: "center",
            margin: "2.5rem auto",
            maxWidth: "28ch",
            lineHeight: 1.5,
            color: "var(--ink, #1C1A17)",
          }}>
            The fix is 400 lines of code.
          </p>
          <p style={{
            marginTop: "2.5rem",
            paddingTop: "1.75rem",
            borderTop: "1px solid var(--rule, rgba(28,26,23,0.08))",
            lineHeight: 1.85,
          }}>
            A memory system that cannot hold a doubt will eventually mistake its own confidence for evidence. That is what we found in the retrieval layer. That is what the brain solved with reconsolidation and prediction error and sleep. And that is what every AI memory system shipping today has skipped. The fix was not to make the system smarter. It was to make it less comfortable.
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
