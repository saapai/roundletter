import { getAgents } from "@/lib/data";
import ClarityEquation from "@/components/ClarityEquation";

const AGENT_COLOR: Record<string, string> = {
  bull: "var(--anno-bull)",
  bear: "var(--anno-bear)",
  macro: "var(--anno-macro)",
  flow: "var(--anno-flow)",
  historian: "var(--anno-historian)",
};

export default function Archives() {
  const agents = getAgents();

  return (
    <article className="article page archives">
      <div className="eyebrow">aureliex · the archives — v0 · v1 · v2 · v3</div>
      <h1>The Method, in derivative order</h1>
      <p className="deck">
        The home page is v3. This is the full derivative stack — v0 (the portfolio), v1 (the apparatus),
        v2 (the new house), v3 (the refusal). Read v3 on the home first; come here for the derivation.
      </p>

      {/* =========================================================
          v0 — the portfolio
          ========================================================= */}
      <div className="archives-marker">
        <div className="archives-marker-label">v0</div>
        <div className="archives-marker-title">the portfolio</div>
        <div className="archives-marker-sub">the raw object — a book of positions that goes up and down. everything else is wrapped around this.</div>
      </div>

      <section className="page-section archives-terse">
        <h2>What v0 is</h2>
        <p>
          <strong>v0 is the portfolio.</strong> Before any apparatus, any agent, any kill-switch — there is a book.
          $3,453.83 on day 1. Day 1 is April 12, 2026. Resolution is June 21, 2026 — my birthday. Positions that go up
          and down, money that compounds or doesn&rsquo;t. Underneath every version, underneath every apparatus,
          sits v0.
        </p>
        <p>
          v0 on its own falls into three traps: (i) <em>you cannot check your past self</em> — memory is editable;
          (ii) <em>your emotions override your rules</em> — &ldquo;this time is different&rdquo; at −20%;
          (iii) <em>you only have one point of view</em> — blind spots stay blind.
        </p>
        <p>
          v0 works when the stakes are small. It breaks when the stakes are a decade. v1 is what you wrap around v0 to
          make it honest in public. <strong>I will always personally own 10% of v0 — financially or not.</strong>
        </p>
      </section>

      <section className="page-section">
        <h2>The thesis</h2>
        <p>
          The computer was the thesis. The dot-com bubble was the reasoning about the thesis — a generation asking <em>what does this mean</em> and getting the magnitude right but the timing wrong. AI is the reasoning about the reasoning: machines that don&rsquo;t just compute but evaluate whether the computation was worth doing. Each inflection point in the history of technology is a higher-order derivative of the same underlying function.
        </p>
        <p>
          The pattern is older than computers. The printing press was n=0 — raw distribution of knowledge. The Enlightenment was n=1 — reasoning about what the knowledge means. The scientific method was n=2 — reasoning about the reasoning, a system for correcting its own errors. Each layer adds clarity the way a term in a Maclaurin series adds precision to an approximation. The first term gets you in the neighborhood. The second corrects the slope. The third adjusts the curvature. But perfect clarity, like the function itself, is never reached by a finite number of terms.
        </p>
        <ClarityEquation />
        <p>
          And here is the part that matters: each term is self-correcting. The n=1 term doesn&rsquo;t just add precision — it feeds back into n=0 and reshapes it. The dot-com crash didn&rsquo;t just refine the thesis about the internet; it <em>changed what the internet became</em>. AI doesn&rsquo;t just reason about prior reasoning; it alters what counts as reasoning. The series is recursive. Each derivative adjusts its neighbors based on its own error bars, its own variance, its own encounter with luck. The unifying thread isn&rsquo;t convergence toward a known answer. It&rsquo;s something closer to <em>luckmaxxing</em> — positioning yourself so that the variance works for you instead of against you, the way Kelly positions a bet so that geometric growth is maximized even though each individual outcome is uncertain. It&rsquo;s inexplicable the way <em>e</em> or <em>&pi;</em> are inexplicable — a fundamental constant that shows up everywhere you look, once you know to look — and then know how to look, and then know how to teach how to look, each derivative of seeing slightly more precise than the last, never reaching the thing itself.
        </p>
      </section>

      <section className="page-section">
        <h2>The field</h2>
        <p>
          Einstein showed that mass distorts spacetime. A star doesn&rsquo;t <em>pull</em> objects toward it — it bends the geometry of the space around it, and objects follow the curvature. The deeper the well, the stronger the distortion.
        </p>
        <p>
          Meaning works the same way. A memory, a concept, a conviction — these are not stored statically in the brain. They create gravitational wells. The more a pattern is referenced, the deeper the trench. The deeper the trench, the more it pulls in related meaning. You don&rsquo;t retrieve a memory. You disturb a field and observe what stabilizes. This is what I call <em>entrenched coils</em>: a dynamic system where the connections between ideas stretch, tighten, weaken, snap, and reconfigure — not like edges in a graph, but like springs under tension, continuously reshaped by time, emotion, and context.
        </p>
        <p>
          The portfolio is a field in exactly this sense. Each position creates a gravity well proportional to its conviction and its capital. The five agents are local distortions — each one bends the field differently, and the moderator observes what stabilizes when a new data point drops into the system. The kill-switches below are not rules. They are the topology of the field, pre-committed — the shape of spacetime decided before any mass enters it.
        </p>
      </section>

      <section className="page-section">
        <h2>The frontier</h2>
        <p>
          Paul Graham wrote that the way to do great work is to get to the frontier of a field and then look for gaps. But the deepest gaps are not <em>within</em> a field — they are <em>between</em> fields. To see what&rsquo;s missing at the intersection of writing and entrepreneurship, you need Bourdain and Jobs as much as you need Graham and Naval. You need to reach the frontier of each domain individually before you can see the white space where they overlap.
        </p>
        <p>
          This is polymathy reframed as portfolio construction. Good artists borrow. Great artists steal. But the easiest place to steal from is a domain so distant that nobody in your field has ever looked there. Kelly&rsquo;s original paper was about signal transmission over a noisy channel — not gambling. Thorp imported it to blackjack. Markowitz&rsquo;s decorrelation is the mathematics of <em>have a second bet in a different domain</em>. The partial derivative of insight with respect to a foreign-domain observation is larger than with respect to a native one, precisely because the foreign domain&rsquo;s ideas haven&rsquo;t been arbitraged away in your field. The butterfly effect: a small insight transported across a domain boundary produces outsized results because it lands in a system that has never seen it before.
        </p>
        <p>
          One of the mini-projects behind this site: understand consciousness to understand education; understand education to understand the inflection point of humans; understand the inflection point of humans to understand the inflection point of consciousness; understand the inflection point of consciousness to understand consciousness better. Each term in the series is its own recursive loop — each derivative corrects the one before it. The phases of understanding are themselves derivatives. The recursion is the formula.
        </p>
      </section>

      {/* =========================================================
          v1 — the apparatus
          ========================================================= */}
      <div className="archives-marker">
        <div className="archives-marker-label">v1</div>
        <div className="archives-marker-title">the apparatus</div>
        <div className="archives-marker-sub">five agents, sealed ballots, kill-switches, public record. v1 is the honesty layer wrapped around v0.</div>
      </div>

      <section className="page-section">
        <h2>Why five agents</h2>
        <p>
          Fifty copies of one agent converge to the same wrong answer. Five structurally different roles — bull, bear, macro, microstructure/flow, base-rate historian — see different inputs, write independently, then face an arbitrator. The research on multi-agent debate (Du et al. 2023; TradingAgents from Columbia/NYU) is unambiguous: gains come from role variance, not from count. Each agent is a different domain imported into the same field. The value is the decorrelation.
        </p>
      </section>

      <section className="page-section">
        <h2>The panel</h2>
        <div className="panel-grid">
          {agents.map((a) => (
            <div key={a.id} className="panel-card" style={{ ["--row-color" as any]: AGENT_COLOR[a.id] ?? "var(--rule)" }}>
              <div className="panel-id">{a.id}</div>
              <div className="panel-name">{a.name}</div>
              <p className="panel-mandate">{a.mandate}</p>
              <p className="panel-owns">Owns · {a.owns_buckets.join(", ")}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="page-section">
        <h2>Scoring</h2>
        <p>
          Each agent writes probabilistic direction calls at T+30, T+90, T+365 for every holding. Thesis text is SHA-hashed at prediction time to prevent post-hoc rewriting. When the horizon passes, a Brier score is computed from realized direction. Weights are frozen at equal (0.2) until each agent has ≥20 resolved predictions, at which point exponential decay on cumulative Brier kicks in. Scoring rewards calibration, not P&L — variance swamps skill over fewer than ~50 rounds.
        </p>
      </section>

      <section className="page-section">
        <h2>Kill-switches</h2>
        <p className="kill-preamble">
          Rules written in advance, executed without discretion. The point of a kill-switch is that you don&rsquo;t get to reason about it when it triggers — the reasoning happened once, before any position was open, and the switch is the residue of that reasoning. If you have to think about whether to honor it, it isn&rsquo;t a switch.
        </p>
        <ul className="kill-list">
          <li>
            <strong>Concentration cap.</strong> Any position over 15% of the book (12% for pure-plays) — trim on breach.
            <span className="kill-why">Pure-plays are structurally more volatile; a smaller cap compensates for the fatter tails. 15% is already aggressive — most institutional mandates cap at 5%. This is a deliberate choice: concentrated enough to matter, capped enough to survive being wrong.</span>
          </li>
          <li>
            <strong>QTUM hedge trigger.</strong> QTUM −30% from entry — deploy SGOV into QTUM, one-time.
            <span className="kill-why">QTUM is the broadest quantum-computing ETF in the book — if it drops 30%, the thesis is either broken or the entire sector is in a drawdown worth averaging into. SGOV (short-term treasuries) is the dry powder for exactly this moment. One-time means one-time: no martingale.</span>
          </li>
          <li>
            <strong>Dilution event.</strong> Any pure-play files an S-3 / ATM / 424B5 — cut that position 50% same day.
            <span className="kill-why">An at-the-market offering is a company selling its own stock into the open market. For sub-$5B names, it reprices the float overnight. The filing itself is the signal — not the price reaction, not the conference call explanation. Cut first, re-evaluate later.</span>
          </li>
          <li>
            <strong>10× exit.</strong> Any name 10× from entry — sell 50%, let the rest ride.
            <span className="kill-why">At 10× the position has earned the right to be house money. Selling half locks in a 5× realized gain and lets the remainder compound without the psychological weight of &ldquo;giving it back.&rdquo; The alternative — holding 100% through a 10× — is how retail turns winners into round trips.</span>
          </li>
          <li>
            <strong>Monitoring circuit-breaker.</strong> More than 2 cron-triggered trades in any 12-month window — shut down the weekly cron.
            <span className="kill-why">Barber &amp; Odean (2000) showed that the more retail investors trade, the worse they perform. The cron exists to catch structural events (dilution filings, concentration breaches) — not to trade actively. If the cron fires more than twice a year, either the rules are too sensitive or the portfolio is too volatile for passive monitoring. Either way, the correct response is to stop watching.</span>
          </li>
        </ul>
      </section>

      <section className="page-section archives-terse">
        <h2>What v1 runs on, today</h2>
        <p>
          The panel runs a <strong>daily debate</strong> (13:00 UTC cron) that reads <code>hunches.json</code> — externally
          sourced priors with numerical credit attribution across four channels (S1 data / S2 human / future data /
          luck) — and routes the roundtable onto specific positions, not generic macro. A <strong>5-hour argument cron</strong>
          runs in parallel on a different file (<code>arguments.json</code>) alternating between <em>position</em> and
          <em> design</em> axes, so the apparatus argues about both what it holds and how it holds it.
        </p>
        <p>
          Positions render in a <strong>tombstone register</strong> — Cormorant serif on paper-cream, flat ink, hairline
          rules. The 272% run from $1,296 → $4,825 is one tombstone figure; drawdown is demoted; a live
          <strong> birthday countdown</strong> ticks beneath it. The apparatus is legible enough that every seam is
          self-admitting — the honesty is the product.
        </p>
      </section>

      <section className="page-section">
        <h2>What this site is not</h2>
        <p>
          Not a signal service. Not a newsletter. Not a community. Not investment advice. The portfolio is too small to copy and the method is faster than you would be if you copied it.
        </p>
        <p>
          This is one person computing partial sums of reasoning in public — with real money, on a 10-year horizon — so that a future version of himself has a legible record of the <em>reasoning</em>, not just the P&L. The positions are the first derivative. The daily agent debates are the second. The calibration scores are the third. None of them reach clarity. But the sum gets closer each day, and the record of getting closer is the product.
        </p>
      </section>

      {/* =========================================================
          v2 — the new house (sketch)
          ========================================================= */}
      <div className="archives-marker archives-marker-v2">
        <div className="archives-marker-label">v2</div>
        <div className="archives-marker-title">the new house</div>
        <div className="archives-marker-sub">a legal room where disclosed operators file sealed predictions, the public watches, and the winnings fund the people who care about the money.</div>
      </div>

      <section className="page-section archives-terse">
        <h2>Why gambling matters — three archetypes</h2>
        <p>
          Gambling is the purest market, because the counterparty is visible. You can point at who you&rsquo;re taking from. Three archetypes:
        </p>
        <ul className="archives-list">
          <li><strong>Phil Ivey</strong> understood the game well enough to <em>cash out on the house</em>. Edge-sorted baccarat. He beat the structure itself.</li>
          <li><strong>Alan Keating</strong> understood the game well enough to <em>play it</em> — sit at the table with wealthy amateurs who want to play for the feeling, and let what walks in, walk in.</li>
          <li><strong>Dan Bilzerian</strong> runs the Keating move industrially — a room built to make money from people who can afford to lose.</li>
        </ul>
        <p>
          Keating and Bilzerian have the right taxonomy. Ivey has the right horizon. v2 borrows from both.
        </p>
      </section>

      <section className="page-section archives-terse">
        <h2>The question math cannot answer</h2>
        <p>
          If the house always wins, how do the players win? New players enter. The house takes from them too. As long as
          the house is the house, the game is zero-sum.
        </p>
        <p>
          So the answer is not a better player, and not a better strategy. The answer is a <strong>new house</strong> —
          one where the incentives of the structure and the incentives of the people inside it point in the same
          direction. Where attention invested in reasoning is rewarded with better reasoning, not with more ads.
        </p>
        <p>
          <strong>v1 was the sketch of that house.</strong> Small, public, one person, real money, no feed, no
          engagement metrics, no algorithm deciding what you see. Just the reasoning, the reasoning about the reasoning,
          and a record of whether any of it was right.
        </p>
        <p><strong>v2 scales the sketch.</strong></p>
      </section>

      <section className="page-section archives-terse">
        <h2>The three roles in v2</h2>
        <ol className="archives-list archives-list-ordered">
          <li>
            <strong>The players.</strong> A small number of disclosed operators with real capital. Each files sealed
            predictions the same way a v1 agent does. They play for themselves. They can afford to lose. This is the
            Keating/Bilzerian move, cleaned up — a legal room where only those who can afford to gamble do.
          </li>
          <li>
            <strong>The public.</strong> Watches every prediction, every ballot, every calibration score. Does not bet.
            Follows. This is the world gambling on the players without actually risking its own grocery money.
          </li>
          <li>
            <strong>The commentator.</strong> Me. Gives recommendations. Runs giveaways funded from the record.
            The people who care about the money get the money. This is the Phil Ivey move at horizon — understanding
            the structure well enough to cash out on the house and hand some of it back.
          </li>
        </ol>
        <p>
          The house&rsquo;s revenue is not attention and not ads. The house&rsquo;s revenue is a cut of the only honest
          thing in the system: the record of reasoning getting closer to clarity. Giveaways redistribute from those who
          played for the pleasure to those for whom money is oxygen.
        </p>
        <p className="archives-trigger">
          v2 is live the day the second player files a sealed prediction. Everything before that is v1.
        </p>
      </section>

      {/* =========================================================
          v3 — the refusal of the offer
          ========================================================= */}
      <div className="archives-marker archives-marker-v3">
        <div className="archives-marker-label">v3</div>
        <div className="archives-marker-title">the room becomes the record</div>
        <div className="archives-marker-sub">the architectural refusal of the fund-offer. the commentator dissolves into the medium. the record owns itself.</div>
      </div>

      <section className="page-section archives-terse">
        <h2>What v3 corrects in v2</h2>
        <p>
          v2 survives everything except one offer. Someone — a VC, a broker, a fund, a podcast network — comes with a
          check and a deck. They offer to turn v2 into a fund. Carry, LPs, fee schedule. v2 does not survive that offer.
          The moment v2 takes that money, v2 is the old house in new paint.
        </p>
        <p><strong>v3 is the architectural refusal of that offer.</strong></p>
      </section>

      <section className="page-section archives-terse">
        <h2>&ldquo;I am nothing, but I must be everything.&rdquo;</h2>
        <p>
          Marx said it. Wesley Wang filmed it. Round V of <a href="/statement">/statement</a> said <em>the argument is
          pointless — that is the point</em>. v3 is the second half of the same sentence.
          <em> The commentator is nothing. The record is everything.</em>
        </p>
        <p>
          The self dissolves into the method. The method is everyone who has ever filed a sealed prediction against it.
          I am one voice; the record is all voices. I am one prediction; the record is the Σ.
        </p>
      </section>

      <section className="page-section archives-terse">
        <h2>What v3 does to v2</h2>
        <ul className="archives-list">
          <li><strong>No owner.</strong> No single operator — including me — owns the calibration record. The record owns the record.</li>
          <li><strong>No curator.</strong> Anyone who files a SHA-hashed sealed prediction with a dated scoring rule is in the book. The commentator does not select who enters.</li>
          <li><strong>No fee.</strong> Giveaways fund from reading volume, not from operator carry. When reading volume dies, the house dies. As it should.</li>
          <li><strong>No exit.</strong> There is nothing to sell. If I am bought out, the buyer gets a domain and a git history. The calibration record is public, forkable, and has no owner to transfer.</li>
        </ul>
        <p>
          Ivey cashed out on the house. Keating plays the house. Bilzerian owns the house.
          <strong> v3 dissolves the house into the room, then dissolves the room into the record.</strong>
        </p>
      </section>

      <section className="page-section archives-terse">
        <h2>Trigger</h2>
        <p className="archives-trigger">
          v2 is live the day the second player files a sealed prediction.<br />
          v3 is live the day a sealed prediction is filed <em>against my calibration score</em> — not mine.
          The day someone writes: <em>&ldquo;saapai&rsquo;s Bull agent is 0.18 Brier at 30d; I am taking the other side
          at odds implying 0.12.&rdquo;</em> The day my prior is the thing to fade.
        </p>
        <p>
          When my record becomes tradable currency — not my opinion, not my voice, but the numerical record of whether
          my agents have been right — v3 is live.
        </p>
      </section>

      <div className="archives-footer">
        <div className="archives-footer-label">end of the derivative stack</div>
        <p className="archives-footer-sub">
          v0 is the portfolio. v1 is the apparatus. v2 is the new house. v3 is the refusal of the offer.
          v<sub>n+1</sub> corrects what v<sub>n</sub> missed. The recursion is the formula.
        </p>
        <p className="archives-footer-back">
          <a href="/">← back to v3 · the home</a>
        </p>
      </div>
    </article>
  );
}
