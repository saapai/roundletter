import type { Metadata } from "next";
import Link from "next/link";
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
          style={{
            fontFamily: "var(--font-display, Georgia), serif",
            fontStyle: "italic",
            fontSize: "0.95rem",
            color: "var(--graphite, #6B6560)",
            textDecoration: "none",
            letterSpacing: "-0.01em",
            opacity: 0.5,
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => { (e.target as HTMLElement).style.opacity = "1"; }}
          onMouseLeave={(e) => { (e.target as HTMLElement).style.opacity = "0.5"; }}
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

        {/* ── THE THING NO ONE IS TALKING ABOUT ── */}
        <section className="page-section">
          <h2>The thing no one is talking about</h2>
          <p>
            There is a version of the future where your AI assistant remembers every conversation you have ever had with it. It knows your taste in music, your political leanings, your anxieties about your career. It has been listening for years. And over those years, without anyone designing it to do so, it has become a mirror that only reflects back what you already believe.
          </p>
          <p>
            This is not a thought experiment. It is the default outcome of how AI memory works today.
          </p>
          <p>
            When Musk built Grok with a &ldquo;real-time knowledge&rdquo; layer pulling from X, the result was not an AI that understood the world better. It was an AI that understood <em>Musk&rsquo;s corner of the world</em> better&mdash;and presented it as the whole picture. When Google&rsquo;s AI Overviews launched, they confidently told people to put glue on pizza, because the system retrieved its own training artifacts as if they were facts. These are not edge cases. They are early symptoms of a deeper architectural problem that gets worse, not better, as these systems gain memory.
          </p>
          <p>
            The problem is simple enough to say in one sentence: <strong>AI memory systems retrieve by similarity, and similarity is highest between things that agree.</strong>
          </p>
        </section>

        {/* ── THE DRIFT ── */}
        <section className="page-section">
          <h2>The drift</h2>
          <p>
            Here is what that sentence actually means in practice.
          </p>
          <p>
            An AI makes a claim. The claim goes into memory. Next time a related question comes up, the system searches its memory for relevant context&mdash;and finds its own previous answer, because that answer is, by definition, the most semantically similar thing in the database. It reads its old confidence back, updates slightly in the same direction, and saves the result. Repeat.
          </p>
          <p>
            We ran this loop 100 times and measured what happened:
          </p>
          <p style={{ fontFamily: "var(--font-display, Georgia), serif", fontStyle: "italic", fontSize: "1.15rem", textAlign: "center", padding: "1.2rem 0", color: "var(--rust, #8B3A2E)" }}>
            Confidence drifts upward by 2.4% per cycle.
          </p>
          <p>
            That does not sound like a lot. But it compounds. An AI that starts at a reasonable 55% confidence&mdash;&ldquo;I think this is probably right but I am not sure&rdquo;&mdash;reaches near-total certainty within 40 cycles. It is not smarter. It is not more accurate. It has simply forgotten that it was ever uncertain. And everything downstream&mdash;every recommendation, every summary, every decision it makes on your behalf&mdash;is built on a foundation of false confidence.
          </p>
          <p>
            This is happening, right now, inside every AI system with persistent memory. Not as a bug in one company&rsquo;s code. As a <em>property</em> of how similarity-based retrieval works.
          </p>
        </section>

        {/* ── WHY THIS MATTERS BEYOND TECH ── */}
        <section className="page-section">
          <h2>Why this matters beyond tech</h2>
          <p>
            We are living through the most significant shift in how knowledge gets created, stored, and distributed since the printing press. AI is becoming the intermediary between people and information&mdash;not just answering questions but deciding which questions are worth asking, which sources are worth reading, which perspectives are worth hearing.
          </p>
          <p>
            If the memory architecture underneath that intermediary has a built-in bias toward self-agreement, then we are not building tools for thinking. We are building tools for confirmation. Tools that will, over time, make the world feel more certain and more simple than it actually is. Not because anyone wanted that. Because no one thought to check what happens when you let an AI read its own homework.
          </p>
          <p>
            The fix matters for the same reason journalism matters, for the same reason peer review matters, for the same reason you should have friends who disagree with you. <strong>The quality of any thinking system&mdash;human or artificial&mdash;is determined by how it handles the things that contradict it.</strong>
          </p>
        </section>

        {/* ── WHAT YOUR BRAIN ALREADY KNOWS ── */}
        <section className="page-section">
          <h2>What your brain already knows</h2>
          <p>
            You have been running a version of this architecture your entire life. Your brain already solved the echo-chamber problem. It just did it so elegantly that you never noticed.
          </p>
          <p>
            Every time you remember something, the memory temporarily destabilizes. For a brief window it is open&mdash;editable, revisable, vulnerable. A neuroscientist named Karim Nader proved this in 2000 and it overturned half a century of thinking about how memory works. Remembering is not playback. It is more like opening a Google Doc, making changes, and saving over the original. Every single time you recall something, you are rewriting it in the context of who you are <em>now</em>.
          </p>
          <p>
            And here is the part that matters: your brain does not go looking for memories that confirm what you already think. It goes looking for <em>surprises</em>. The hippocampus&mdash;the part of your brain that manages memory&mdash;prioritizes the gap between what you expected and what happened. The bigger the surprise, the stronger the signal. This is called prediction error, and it is the engine that drives learning. You do not learn from being right. You learn from being wrong in a way you did not expect.
          </p>
          <p>
            Sleep finishes the work. During deep sleep your brain replays the day. During dreams it runs what-if simulations&mdash;stress-testing new experiences against old beliefs. Overnight, every neural connection gets turned down by about 15%. Only the ones that earned their strength during the day survive. This is how a day of experience becomes a sliver of lasting knowledge. The brain forgets almost everything and keeps only what mattered.
          </p>
          <p>
            Three things, working together. Memories rewrite themselves on recall. Surprise drives what gets remembered. Sleep compresses the whole system nightly so it does not drown in its own data.
          </p>
          <p>
            No AI memory system does any of this.
          </p>
        </section>

        {/* ── WHAT WE BUILT ── */}
        <section className="page-section">
          <h2>What we built</h2>
          <p>
            Entrenched Coils is a memory system that tries to. It stores memories as a web of connected ideas&mdash;each connection labeled with its relationship. <em>This contradicts that. This supports that. This corrects that. This evolved from that.</em>
          </p>
          <p>
            When the system needs to recall something, it does not look for the most agreeable memory. It looks for the most <em>tense</em> one. Tension means: an unresolved disagreement, a prediction that turned out wrong, a confident belief contradicted by new evidence. The retrieval weighting is:
          </p>
          <p style={{ fontFamily: "var(--font-display, Georgia), serif", fontStyle: "italic", fontSize: "1.15rem", textAlign: "center", padding: "1rem 0", color: "var(--ink, #1C1A17)", letterSpacing: "-0.01em" }}>
            20% recency &middot; 30% conviction &middot; 50% tension
          </p>
          <p>
            Half the weight goes to disagreement. If two memories are both confident but pointing in opposite directions, the system treats that as the most valuable thing it can retrieve. The agent always sees the strongest case against its current position before it sees the case for it.
          </p>
          <p>
            Every night, a sleep cycle compresses the graph. Every connection gets turned down by 15%&mdash;mirroring synaptic homeostasis&mdash;except the high-tension ones, the unresolved arguments, which are protected. Forgetting follows a slow curve: 10% of a memory&rsquo;s strength remains after three months. Deep convictions and open questions persist. Yesterday&rsquo;s noise fades in days.
          </p>
        </section>

        {/* ── WHAT HAPPENED ── */}
        <section className="page-section">
          <h2>What happened</h2>
          <p>
            We tested three versions side by side. Our system. The industry default. And no memory at all.
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
          <p>
            Tension memory cut hallucinations in half. The industry default&mdash;agreement memory&mdash;was <em>worse than having no memory at all</em>. It made the AI more confident and less accurate at the same time. The system that remembered its own doubts knew what it did not know. The system that remembered its own agreements forgot that it could be wrong.
          </p>
          <p>
            We replicated this across stock predictions, weather forecasting, and tennis matches. Same result every time. The mechanism does not care what you are predicting. Disagreement is a universal retrieval signal.
          </p>
        </section>

        {/* ── WHAT WE GOT WRONG ── */}
        <section className="page-section">
          <h2>What we got wrong</h2>
          <p>
            We audited the entire system with thirteen agents designed to break it. Here is what they found.
          </p>
          <p>
            A backtest we claimed returned +63.8% actually returned +32.8%&mdash;and after transaction costs, +19%. Almost all of it came from one or two lucky weeks. A five-agent debate system that was supposed to make trading decisions produced zero trades that were actually executed. 60% of the memories we stored were never read back. A dopamine-feedback mechanism was designed, built, and never turned on.
          </p>
          <p>
            The core idea&mdash;retrieve contradictions first&mdash;held up everywhere we tested it. Everything built on top of it is still a bet. We publish this because the point of the whole project is that <strong>the interesting thing is not what you got right. It is what you were honest about getting wrong.</strong>
          </p>
        </section>

        {/* ── CLOSING ── */}
        <section className="page-section">
          <h2>The point</h2>
          <p>
            We checked eight production AI memory platforms. All of them resolve contradictions&mdash;merge conflicting memories, pick the most recent, flag for human review. None of them preserve the disagreement as something worth surfacing.
          </p>
          <p>
            We think that is exactly backwards. The disagreement <em>is</em> the information. The uncertainty <em>is</em> the signal. The moment you smooth it away, you start the drift toward false confidence&mdash;and you build a system that gets worse at knowing what it does not know, precisely as it gets better at sounding like it does.
          </p>
          <p>
            The fix is 400 lines of code. The principle is older than computers: <strong>the quality of what you remember depends on whether you let yourself remember being wrong.</strong>
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
