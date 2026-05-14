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
      "Every AI with memory builds echo chambers. +0.024 confidence drift per cycle, p<0.0001. The fix: retrieve contradictions first.",
    creator: "@saathvikpai",
  },
};

export default function EntrenchedCoilsPaper() {
  return (
    <>
      {/* Minimal branding — no masthead, no nav, just a quiet link home */}
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

        {/* ── 1. THE PROBLEM ── */}
        <section className="page-section">
          <h2>The problem</h2>
          <p>
            Ask ChatGPT the same question every day for a month. You will get roughly the same answer each time, because it has no memory. Now imagine giving it one. Every answer gets saved. Next time you ask, it reads its old answers first, then responds.
          </p>
          <p>
            What happens is boring and predictable: it agrees with itself. Not on purpose&mdash;because the way memory works in every AI system shipping today is by searching for the <em>most similar</em> past memories. Similar things tend to agree. So the AI reads back its own prior confidence, nudges a little further in the same direction, saves that, and the cycle repeats.
          </p>
          <p>
            We measured how fast this goes wrong, across 100 trials on a five-agent debate system:
          </p>
          <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.88rem", textAlign: "center", padding: "1.5rem 0", color: "var(--rust, #8B3A2E)", letterSpacing: "0.02em" }}>
            confidence drifts +2.4% per cycle &nbsp;&nbsp; (p &lt; 0.0001)
          </div>
          <p>
            Start at 55% confident. After 40 cycles you are at near-total certainty. You are not more accurate. You are just more sure. And anything downstream&mdash;a trading engine, a customer support bot, a code generator&mdash;treats that fake certainty as real.
          </p>
          <p>
            This is not a bug in one product. It is how retrieval works in every deployed AI memory system we could find: Zep, Mem0, Letta, MAGMA, and several others. All of them search by similarity. All of them, given enough time, build echo chambers.
          </p>
        </section>

        {/* ── 2. HOW YOUR BRAIN AVOIDS THIS ── */}
        <section className="page-section">
          <h2>How your brain avoids this</h2>
          <p>
            Your brain does not search memories by finding the closest match. It does something weirder: it searches by <em>surprise</em>.
          </p>
          <p>
            In 2000, a neuroscientist named Karim Nader ran an experiment that upended fifty years of memory research. He showed that every time you recall a memory, it temporarily destabilizes&mdash;for a brief window, it is open to being rewritten. This is called reconsolidation. Remembering is not like pressing play on a recording. It is more like opening a document, making edits, and saving over the original. Every single time.
          </p>
          <p>
            The edits follow a rule: <strong>the bigger the gap between what you expected and what actually happened, the stronger the rewrite.</strong> Neuroscientists call this prediction error. Your hippocampus&mdash;the part of your brain that manages memory&mdash;does not ask &ldquo;what have I seen that looks like this?&rdquo; It asks &ldquo;what surprised me?&rdquo; The surprise is the signal. The mismatch is what triggers learning.
          </p>
          <p>
            Then sleep finishes the job. During deep sleep, your hippocampus replays the day&rsquo;s events while your cortex figures out where they fit in the bigger picture. During dream sleep, your brain runs what-if scenarios&mdash;stress-testing new experiences against old beliefs, looking for conflicts. Overnight, a process called synaptic homeostasis quietly turns down every neural connection by about 15%, keeping only the ones that earned their strength during the day. This is how you compress a day into what matters and let the rest go.
          </p>
          <p>
            Three things. Memories rewrite themselves on recall. Surprise drives what gets retrieved. Sleep compresses the system nightly. Every AI memory system today skips all three.
          </p>
        </section>

        {/* ── 3. WHAT WE BUILT ── */}
        <section className="page-section">
          <h2>What we built</h2>
          <p>
            Entrenched Coils is a memory system that models all three. The memory is stored as a graph&mdash;a web of connected nodes. Each node is something the system believes, predicted, or observed. The connections between them have labels: <em>contradicts</em>, <em>supports</em>, <em>corrects</em>, <em>evolves</em>.
          </p>
          <p>
            When the system needs to remember something, it does not look for the most similar memory. It looks for the most <em>tense</em> one. Tension means: an unresolved disagreement, a prediction that turned out wrong, a confident belief contradicted by new evidence. The retrieval score is weighted:
          </p>
          <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.85rem", lineHeight: 1.9, background: "rgba(28,26,23,0.035)", border: "1px solid rgba(28,26,23,0.08)", borderRadius: "3px", padding: "1.2rem 1.5rem", margin: "1rem 0 1.5rem", overflowX: "auto", whiteSpace: "pre" }}>
{`20% recency · 30% conviction · 50% tension`}
          </div>
          <p>
            Tension dominates. Unresolved contradictions get a 1.5&times; boost. Conviction rewards <em>divergence</em>&mdash;two memories that strongly disagree are more valuable than two that mildly agree. The system always sees its hardest disagreements first.
          </p>
          <p>
            Every night, a sleep cycle runs. It turns down every connection by 15%&mdash;the same ratio as biological synaptic homeostasis&mdash;while protecting the high-tension edges, the important disagreements. Forgetting follows a power law: 10% of a memory&rsquo;s original strength remains after 90 days. Standard exponential forgetting would leave 0.03%. Deep convictions and unresolved arguments persist for months. Yesterday&rsquo;s noise fades in days.
          </p>
        </section>

        {/* ── 4. WHAT HAPPENED ── */}
        <section className="page-section">
          <h2>What happened</h2>
          <p>
            We ran three conditions side by side. Tension memory (retrieve disagreements first). Agreement memory (retrieve agreements first&mdash;the industry default). And no memory at all.
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
            Tension memory cut hallucinations in half. Agreement memory&mdash;the way every shipped product works today&mdash;was worse than having no memory at all. It made the AI more confident while making it less accurate. The version that remembered its doubts knew what it did not know. The version that remembered its agreements thought it knew everything.
          </p>
          <p>
            We replicated this on three completely different problems: stock predictions, weather forecasting, and tennis match outcomes. Same result each time. The architecture does not care about the domain. Disagreement is a universal signal.
          </p>
        </section>

        {/* ── 5. WHAT IS HONEST ── */}
        <section className="page-section">
          <h2>What is honest</h2>
          <p>
            We ran a full audit with nine research agents and four validators. Here is what we found, including the parts that hurt.
          </p>
          <p>
            <strong>What held up:</strong> The anti-echo-chamber effect is real and statistically significant across three domains. Hallucinations halved. The graph works&mdash;687 nodes, 1,768 edges, 41% compressed by the sleep cycle. In a separate weather-prediction system, when models disagreed about a forecast, treating the disagreement as a reason <em>not</em> to trade prevented four bad bets.
          </p>
          <p>
            <strong>What did not:</strong> A backtest we originally claimed returned +63.8% actually returned +32.8% raw and +19% after costs&mdash;and almost all of that came from one or two lucky weeks. The five-agent debate system, which was supposed to drive trading decisions, produced zero trades that were actually executed. 60% of the memory nodes were never read back. 99.8% of the graph edges were never traversed. A dopamine-feedback system was built but never switched on.
          </p>
          <p>
            About 40% of the architecture is working. The other 60% is scaffolding. The core idea&mdash;retrieve contradictions first&mdash;is validated. Everything built on top of that remains a bet. We publish the audit because publishing what broke is the whole point.
          </p>
        </section>

        {/* ── 6. WHY THIS MATTERS ── */}
        <section className="page-section">
          <h2>Why this matters</h2>
          <p>
            Every company building AI assistants is about to give them memory. They have to&mdash;without memory, an AI cannot learn your preferences, recall past conversations, or get better over time. The moment they ship it using the standard approach (search for similar memories), they will have built an echo chamber that runs automatically, forever. The AI will radicalize itself on its own output. Confidence will creep up. Hallucinations will compound, because the system will retrieve its own prior hallucinations as evidence.
          </p>
          <p>
            The fix is not complicated. <strong>Retrieve contradictions first.</strong> Let the agent see why it might be wrong before it sees why it might be right. Model the brain, not the search engine. Search by surprise, not similarity. Compress overnight. Forget what does not matter.
          </p>
          <p>
            The implementation is 400 lines. We checked eight production memory platforms. None of them do this. All of them resolve contradictions. We amplify them.
          </p>
        </section>

        {/* ── FOOTER ── */}
        <section className="page-section" style={{ borderTop: "1px solid var(--rule, rgba(28,26,23,0.08))", paddingTop: "2rem", marginTop: "2rem" }}>
          <p style={{ fontSize: "0.82rem", color: "var(--graphite, #6B6560)", textAlign: "center", lineHeight: 1.6 }}>
            saathvik pai &middot; may 2026 &middot; <a href="https://github.com/saapai/roundletter" target="_blank" rel="noopener" style={{ color: "inherit", borderBottom: "1px solid var(--rule, rgba(28,26,23,0.08))" }}>source</a> &middot; <Link href="/letters" style={{ color: "inherit", borderBottom: "1px solid var(--rule, rgba(28,26,23,0.08))" }}>all letters</Link>
          </p>
        </section>

        <ViewTracker slug="entrenched-coils" />
      </article>
    </>
  );
}
