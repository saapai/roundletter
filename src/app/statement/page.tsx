import type { Metadata } from "next";
import { HUNT_PHONE_DISPLAY, HUNT_PHONE_SMS } from "@/lib/hunt";
import { fmtMoneyCents } from "@/lib/portfolio-live";
import { getPortfolioData } from "@/lib/portfolio-aggregate";
import s from "./statement.module.css";

// saathvikpai.com serves this page at its root (see src/middleware.ts).
// It's the clean, minimal identity surface — a compact statement + the
// links into aureliex.com where the real document lives. The longer
// "panel convened on myself" piece is preserved at /statement/panel.

// Live link-preview: every share shows the current $ total per
// memory/feedback_live_link_metadata.md.
export async function generateMetadata(): Promise<Metadata> {
  const data = await getPortfolioData();
  const liveTotal = `$${Math.round(data.total).toLocaleString("en-US")}`;
  const pct = (data.total / data.goal) * 100;
  const desc = `${liveTotal} → $100,000 by 21 jun. ${pct.toFixed(2)}% of goal. one account, real money, on the page before each trade clears.`;
  return {
    title: `saathvik pai · ${liveTotal} → $100,000`,
    description: desc,
    openGraph: {
      title: `saathvik pai · ${liveTotal}`,
      description: desc,
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `saathvik pai · ${liveTotal}`,
      description: desc,
      creator: "@saapai",
    },
  };
}

const GOAL = 100_000;

export default async function Statement() {
  // Whole-bank total (personal + external + art + prediction), not just stocks.
  const data = await getPortfolioData();
  const total = data.total;
  const pct = (total / GOAL) * 100;

  // Days remaining to 21 june goal
  const daysToGoal = Math.max(
    0,
    Math.ceil(
      (Date.parse("2026-06-21T00:00:00-07:00") - Date.now()) / 86_400_000,
    ),
  );

  return (
    <main className={s.root}>
      <article className={s.wrap}>
        <header className={s.masthead}>
          <div className={s.handle}>saathvik pai · saapai · nineteen · salt lake</div>
        </header>

        {/* Pre-mortem line is the cover. Display size, not body. */}
        <p className={s.lede}>
          <em>
            everyone comes here looking for a résumé.
          </em>
          <br />
          <em>
            i publish a pre&#8209;mortem instead.
          </em>
        </p>

        {/* One number, not three boxed cards. */}
        <section className={s.bigNum} aria-label="the wager">
          <div className={s.bigNumFig}>
            {fmtMoneyCents(total)}
            <span className={s.bigNumArrow}> → </span>
            <span className={s.bigNumGoal}>$100,000</span>
          </div>
          <div className={s.bigNumMeta}>
            <span>{pct.toFixed(2)}% of goal</span>
            <span className={s.bigNumSep}>·</span>
            <span>T−{daysToGoal} days</span>
            <span className={s.bigNumSep}>·</span>
            <span>21 june · birthday</span>
          </div>
        </section>

        <p className={s.proseLede}>
          <a className={s.link} href="https://aureliex.com">aureliex.com</a>
          {" "}— one account, real money, on the page before each trade clears. five ai agents debate every decision and file it as a sealed prediction.
        </p>

        {/* Big chunky room links — visually inviting, no // code-comment headers. */}
        <nav className={s.rooms} aria-label="enter">
          <a href="https://aureliex.com/portfolio" className={s.room}>
            <span className={s.roomEy}>01</span>
            <span className={s.roomName}>the bank</span>
            <span className={s.roomMeta}>live · daily marks</span>
          </a>
          <a href="https://aureliex.com/art" className={s.room}>
            <span className={s.roomEy}>02</span>
            <span className={s.roomName}>the art</span>
            <span className={s.roomMeta}>15 pieces · auction</span>
          </a>
          <a href="https://aureliex.com/letters/round-0" className={s.room}>
            <span className={s.roomEy}>03</span>
            <span className={s.roomName}>round 0</span>
            <span className={s.roomMeta}>the article</span>
          </a>
          <a href="https://aureliex.com/archives" className={s.room}>
            <span className={s.roomEy}>04</span>
            <span className={s.roomName}>archives</span>
            <span className={s.roomMeta}>eggs included</span>
          </a>
        </nav>

        {/* ── entrenched coils research paper ── */}
        <section id="paper" className={s.paper}>
          <h2 className={s.paperTitle}>
            entrenched coils: contradiction-prioritized retrieval for persistent agent systems
          </h2>
          <p className={s.paperSub}>saathvik pai · may 2026 · roundletter</p>

          {/* abstract */}
          <h3 className={s.paperH2}>abstract</h3>
          <p className={s.paperP}>
            persistent agent systems that retrieve memories by agreement
            develop echo chambers. confidence inflates +0.024 per cycle
            with no new evidence. we propose <strong>tension-weighted
            retrieval</strong>: a directed memory graph where contradictions
            surface first. on a 100-match tennis benchmark the
            anti-echo-chamber effect is significant (brier 0.171 vs 0.194,{" "}
            <strong>p&lt;0.0001</strong>). hallucination rate drops 50%
            (5/20 vs 10/20) under tension-first memory. honest caveat:
            tension vs flat recency is not significant (p=0.256). the graph
            beats no-memory and beats base-rate injection, but the margin
            over simple recency is thin.
          </p>

          {/* the problem */}
          <h3 className={s.paperH2}>the problem</h3>
          <p className={s.paperP}>
            every memory system in production optimizes for coherence.
            RAG retrieves by similarity. MemGPT pages by relevance.
            Zep invalidates contradictions. Generative Agents score by{" "}
            <code>recency + importance + relevance</code>. none of them
            have a tension dimension.
          </p>
          <p className={s.paperP}>
            coherence reinforcement creates epistemic runaway.
            agreement-first retrieval produces <strong>+0.024 confidence
            drift per cycle</strong> — agents get more certain about wrong
            things. over 100 cycles that is +2.4% cumulative drift with
            zero new information. the coil tightens.
          </p>

          {/* the mechanism */}
          <h3 className={s.paperH2}>the mechanism</h3>
          <p className={s.paperP}>
            the memory substrate is a directed graph. each node is a
            belief, prediction, or observation. edges are typed:{" "}
            <code>contradicts</code>, <code>supports</code>,{" "}
            <code>corrects</code>, <code>evolves</code>. retrieval
            traverses a max-heap ordered by composite score:
          </p>

          <div className={s.paperFormula}>
{`score = 0.2 × temporal + 0.3 × conviction + 0.5 × tension

temporal  = exp(-λ × Δt)        // recency decay
conviction = avg_conf × (1 + |conf_a − conf_b|)
tension   = base × (1 + resolution_bonus) × unresolved_mult`}
          </div>

          <p className={s.paperP}>
            tension dominates at 50%. unresolved contradictions get 1.5x
            multiplier. conviction rewards confidence <em>divergence</em>{" "}
            — two memories at 0.9 and 0.3 are more interesting than two
            at 0.6. retrieval pulls the hardest disagreements first.
          </p>

          {/* diagram */}
          <div className={s.diagram}>
            <div className={s.diagramLabel}>tension graph traversal</div>
            <div className={s.diagramGrid}>
              <div className={s.diagramNode}>belief A<br/>conf: 0.85</div>
              <div className={s.diagramEdge}>
                <span className={s.diagramEdgeLine} />
                contradicts
                <span className={s.diagramEdgeLine} />
              </div>
              <div className={s.diagramNode}>belief B<br/>conf: 0.30</div>

              <div className={s.diagramNode}>prediction C<br/>conf: 0.72</div>
              <div className={s.diagramEdge}>
                <span className={s.diagramEdgeLine} />
                supports
                <span className={s.diagramEdgeLine} />
              </div>
              <div className={s.diagramNode}>belief A<br/>conf: 0.85</div>

              <div className={s.diagramNode}>observation D<br/>conf: 0.91</div>
              <div className={s.diagramEdge}>
                <span className={s.diagramEdgeLine} />
                corrects
                <span className={s.diagramEdgeLine} />
              </div>
              <div className={s.diagramNode}>belief B<br/>conf: 0.30</div>
            </div>
            <p className={s.paperNote}>
              retrieval order: A↔B (tension=0.50, divergence=0.55) first.
              support edges retrieved last.
            </p>
          </div>

          {/* results */}
          <h3 className={s.paperH2}>results</h3>
          <div style={{ overflowX: "auto" }}>
            <table className={s.paperTable}>
              <thead>
                <tr>
                  <th>comparison</th>
                  <th>brier A</th>
                  <th>brier B</th>
                  <th>delta</th>
                  <th>p</th>
                  <th>sig</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>tension vs no-memory</td>
                  <td className={s.cellWin}>0.171</td>
                  <td>0.205</td>
                  <td className={s.cellWin}>-0.034</td>
                  <td className={s.cellSig}>&lt;0.0001</td>
                  <td className={s.cellSig}>yes</td>
                </tr>
                <tr>
                  <td>tension vs flat recency</td>
                  <td>0.171</td>
                  <td>0.174</td>
                  <td>-0.003</td>
                  <td className={s.cellNs}>0.256</td>
                  <td className={s.cellNs}>no</td>
                </tr>
                <tr>
                  <td>tension vs baserate inject</td>
                  <td className={s.cellWin}>0.171</td>
                  <td>0.189</td>
                  <td className={s.cellWin}>-0.018</td>
                  <td className={s.cellSig}>0.015</td>
                  <td className={s.cellSig}>yes</td>
                </tr>
                <tr>
                  <td>tension vs baserate+error</td>
                  <td>0.171</td>
                  <td>0.184</td>
                  <td>-0.013</td>
                  <td className={s.cellNs}>0.052</td>
                  <td className={s.cellNs}>no</td>
                </tr>
                <tr>
                  <td>baserate inject vs no-memory</td>
                  <td className={s.cellWin}>0.189</td>
                  <td>0.205</td>
                  <td className={s.cellWin}>-0.016</td>
                  <td className={s.cellSig}>0.016</td>
                  <td className={s.cellSig}>yes</td>
                </tr>
                <tr>
                  <td>baserate+error vs no-memory</td>
                  <td className={s.cellWin}>0.184</td>
                  <td>0.205</td>
                  <td className={s.cellWin}>-0.020</td>
                  <td className={s.cellSig}>0.001</td>
                  <td className={s.cellSig}>yes</td>
                </tr>
                <tr>
                  <td>baserate+error vs baserate</td>
                  <td className={s.cellWin}>0.184</td>
                  <td>0.189</td>
                  <td className={s.cellWin}>-0.005</td>
                  <td className={s.cellSig}>&lt;0.0001</td>
                  <td className={s.cellSig}>yes</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className={s.paperTable}>
              <thead>
                <tr>
                  <th>hallucination test</th>
                  <th>tension</th>
                  <th>agreement</th>
                  <th>no-memory</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>hallucinations (n=20)</td>
                  <td className={s.cellWin}>5</td>
                  <td className={s.cellLoss}>10</td>
                  <td>9</td>
                </tr>
                <tr>
                  <td>accuracy</td>
                  <td className={s.cellWin}>8/20</td>
                  <td>6/20</td>
                  <td>6/20</td>
                </tr>
                <tr>
                  <td>avg confidence</td>
                  <td className={s.cellWin}>0.722</td>
                  <td className={s.cellLoss}>0.869</td>
                  <td>0.835</td>
                </tr>
                <tr>
                  <td>avg hedging</td>
                  <td className={s.cellWin}>0.65</td>
                  <td className={s.cellLoss}>0.45</td>
                  <td>0.50</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className={s.paperNote}>
            n=100 matches (tennis calibration), n=20 questions (hallucination).
            all tests use qwen3:14b on local inference.
          </p>

          {/* the kill test */}
          <h3 className={s.paperH2}>the kill test</h3>
          <p className={s.paperP}>
            the honest question: does the full tension graph actually beat
            trivial baselines? we injected two-sentence base-rate reminders
            as a control. results:
          </p>
          <p className={s.paperP}>
            tension graph beats base-rate injection (<strong>p=0.015</strong>).
            the architecture survives. but tension vs flat recency is
            marginal (<strong>p=0.256</strong>). two sentences of base-rate
            context plus last-error gets you to p=0.052 against the full
            graph. the graph is better, but the gap is thin. most of the
            value comes from having <em>any</em> memory, not from the
            specific retrieval order.
          </p>
          <p className={s.paperNote}>
            verdict from the data: &quot;PARTIAL KILL — minimal memory is
            sufficient. full graph unnecessary.&quot; we publish this
            because it is true.
          </p>

          {/* novelty */}
          <h3 className={s.paperH2}>novelty</h3>
          <p className={s.paperP}>
            <strong>40% novel, 60% recombination.</strong> the recombination
            is of ideas that have never been combined this way. what is new:
          </p>
          <p className={s.paperP}>
            tension-weighted max-heap traversal (no precedent). conviction
            divergence weighting (no precedent). reconsolidation applied to
            LLM agent memory (from Nader 2000 neuroscience, never
            implemented in AI). calibration tracking integrated into the
            memory graph (no precedent).
          </p>
          <p className={s.paperP}>
            what is borrowed: graph-based memory (Zep, MAGMA, Mem0g).
            contradiction detection (Zep invalidates them, we prioritize
            them). temporal decay (ACT-R, Park et al.). self-correction
            from failure (Reflexion). multi-agent debate (TradingAgents,
            CAMEL, AutoGen).
          </p>
          <p className={s.paperP}>
            closest competitor: <strong>Zep/Graphiti</strong> — temporal
            knowledge graph with contradiction handling. key difference:
            Zep resolves contradictions by invalidation. we resolve them
            by amplification. they treat conflict as error. we treat
            conflict as signal.
          </p>

          {/* what it means */}
          <h3 className={s.paperH2}>what it means</h3>
          <p className={s.paperP}>
            memory systems should maximize epistemic diversity pressure,
            not similarity coherence. this is an alignment contribution,
            not an ML performance contribution. the practical gain is
            small (0.023 brier). the structural claim is large: agents
            that never encounter their own contradictions will always
            drift toward overconfidence.
          </p>
          <p className={s.paperP}>
            the red team found 2 fatal critiques (single-domain evidence,
            unexplained stock failure) and 5 serious ones (effect size,
            regression to mean, prior art, no LLM agents, anecdotal live
            evidence). the thesis is <strong>unproven, not disproven</strong>.
            we publish the criticisms next to the claims because that is
            the point.
          </p>

          {/* code */}
          <h3 className={s.paperH2}>code</h3>
          <div className={s.paperCode}>
            <a href="https://github.com/saapai/roundletter" target="_blank" rel="noopener noreferrer">
              github.com/saapai/roundletter
            </a>
            {" → src/lib/memory/"}
          </div>
        </section>

        <p className={s.reach}>
          <a className={s.link} href={HUNT_PHONE_SMS}>text {HUNT_PHONE_DISPLAY}</a>
          {" "}— stakes, offers, submissions, bets.
        </p>

        <footer className={s.foot}>
          <p className={s.sig}>— saapai</p>
        </footer>
      </article>
    </main>
  );
}
