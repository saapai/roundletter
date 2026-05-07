import type { Metadata } from "next";
import { HUNT_PHONE_DISPLAY, HUNT_PHONE_SMS } from "@/lib/hunt";
import { fmtMoneyCents } from "@/lib/portfolio-live";
import { getPortfolioData } from "@/lib/portfolio-aggregate";
import { getGraphSnapshot } from "@/lib/memory/graph-snapshot";
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

  // Live memory graph snapshot for the entrenched coils visualization
  const graph = getGraphSnapshot();

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
            the architecture&apos;s core contribution is structural protection
            against agreement-amplifying retrieval, not optimization of
            retrieval quality. persistent agent systems that retrieve
            memories by agreement develop echo chambers: confidence
            inflates +0.024 per cycle with no new evidence. we
            propose <strong>tension-weighted retrieval</strong>: a directed
            memory graph where contradictions surface first. on a
            100-match tennis benchmark the anti-echo-chamber effect is
            significant (brier 0.171 vs 0.194,{" "}
            <strong>p&lt;0.0001</strong>). hallucination rate drops 50%
            (5/20 vs 10/20). honest caveats: tension vs flat recency is
            not significant (p=0.256). multi-model diversity (+20pp
            accuracy) beats memory entirely, and memory cancels multi-model
            advantage when combined. the graph beats no-memory and beats
            base-rate injection, but the margin over simple recency is thin.
          </p>

          {/* ── LAYER 1: The Coil Concept ── */}
          <div className={s.coilWrap}>
            <p className={s.coilLabel}>the coil metaphor — contradicting beliefs wound in tension</p>
            <div className={s.helixContainer}>
              {/* Bullish strand */}
              <div className={`${s.helixStrand} ${s.helixStrandBull}`}>
                <div className={s.coilSeg} />
                <div className={s.coilSeg} />
                <div className={s.coilSeg} />
                <div className={s.coilSeg} />
                <div className={s.coilSeg} />
                <div className={s.coilSeg} />
                <div className={s.coilSeg} />
                <div className={s.coilSeg} />
                <div className={s.coilSeg} />
              </div>
              {/* Bearish strand */}
              <div className={`${s.helixStrand} ${s.helixStrandBear}`}>
                <div className={s.coilSeg} />
                <div className={s.coilSeg} />
                <div className={s.coilSeg} />
                <div className={s.coilSeg} />
                <div className={s.coilSeg} />
                <div className={s.coilSeg} />
                <div className={s.coilSeg} />
                <div className={s.coilSeg} />
                <div className={s.coilSeg} />
              </div>
              {/* Tension crossover points */}
              <div className={s.coilTension} />
              <div className={s.coilTension} />
              <div className={s.coilTension} />
              <div className={s.coilTension} />
              <div className={s.coilTension} />
              <div className={s.coilTension} />
              <div className={s.coilTension} />
              <div className={s.coilTension} />
              <div className={s.coilTension} />
            </div>
            <div className={s.coilLabels}>
              <span className={s.coilLabelItem}><span className={s.coilSwatchGreen} /> bullish thesis</span>
              <span className={s.coilLabelItem}><span className={s.coilSwatchRust} /> bearish counter</span>
              <span className={s.coilLabelItem}><span className={s.coilSwatchGold} /> tension point</span>
            </div>
            <p className={s.coilCaption}>
              memories wound around each other like dna strands. where they cross = unresolved contradiction.
              tighter coil = higher tension score = retrieved first.
            </p>
          </div>

          {/* ── LAYER 2: The Live Graph ── */}
          {graph && (
            <div className={s.liveWrap}>
              <div className={s.liveHeader}>
                <p className={s.liveTitle}>live memory graph — {graph.totals.nodes} nodes</p>
                <div className={s.liveTotals}>
                  <span><span className={s.liveTotalNum}>{graph.totals.edges}</span> edges</span>
                  <span><span className={s.liveTotalNum}>{graph.totals.contradictions}</span> contradictions</span>
                  <span><span className={s.liveTotalNum}>{graph.totals.unresolved}</span> unresolved</span>
                </div>
              </div>

              {/* Agent columns */}
              <div className={s.agentCols}>
                {graph.agents.map((a) => (
                  <div key={a.id} className={s.agentCol}>
                    <p className={s.agentName}>{a.id}</p>
                    <span className={s.agentCount}>{a.nodes}</span>
                    <div className={s.agentBreakdown}>
                      <span>{a.claims} claims</span>
                      <span>{a.predictions} predictions</span>
                      <span>{a.observations} observations</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Top tension edges */}
              <div className={s.tensionList}>
                <p className={s.tensionListTitle}>highest-tension contradictions</p>
                {graph.tensions.slice(0, 5).map((t, i) => (
                  <div key={i} className={s.tensionEdge}>
                    <div className={s.tensionSnippet}>
                      <span className={s.tensionSnippetAgent}>{t.src_agent}</span>
                      {t.src_snippet}...
                      <span className={s.tensionSnippetConf}>conf: {t.src_conf?.toFixed(2) ?? "?"}</span>
                    </div>
                    <div className={s.tensionMid}>
                      <div className={`${s.tensionLine} ${t.tension > 1.7 ? s.tensionLineThick : ""}`} />
                      <span className={s.tensionScore}>{t.tension.toFixed(2)}</span>
                    </div>
                    <div className={s.tensionSnippet}>
                      <span className={s.tensionSnippetAgent}>{t.tgt_agent}</span>
                      {t.tgt_snippet}...
                      <span className={s.tensionSnippetConf}>conf: {t.tgt_conf?.toFixed(2) ?? "?"}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Morning briefing */}
              <div className={s.briefingBox}>
                <p className={s.briefingTitle}>morning briefing — top unresolved tensions</p>
                {graph.briefing.map((b, i) => (
                  <div key={i} className={s.briefingItem}>
                    <span className={s.briefingAgent}>{b.agent}</span>
                    <span>{b.snippet}...</span>
                    <span className={s.briefingConf}>{b.confidence?.toFixed(2) ?? "?"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── LAYER 3: The Traversal Animation ── */}
          <div className={s.traversalWrap}>
            <p className={s.traversalTitle}>retrieval traversal — how tension-weighted recall works</p>

            {/* Query */}
            <div className={s.travQuery}>&quot;how should we deploy $400 into IONQ?&quot;</div>

            <div className={s.travSteps}>
              {/* Step 1: Seed nodes */}
              <div className={s.travStep}>
                <p className={s.travStepLabel}>
                  <span className={s.travStepLabelNum}>01</span>
                  seed nodes light up — same ticker, identity, unresolved predictions
                </p>
                <div className={s.travSeeds}>
                  <div className={`${s.travSeed} ${s.travSeedActive}`}>IONQ prediction (unresolved, conf 0.70)</div>
                  <div className={`${s.travSeed} ${s.travSeedActive}`}>bull identity: quantum thesis</div>
                  <div className={`${s.travSeed} ${s.travSeedActive}`}>bear claim: dilution risk (conf 0.70)</div>
                </div>
              </div>

              {/* Step 2: Tension edges pulse */}
              <div className={s.travStep}>
                <p className={s.travStepLabel}>
                  <span className={s.travStepLabelNum}>02</span>
                  high-tension edges pulse outward — contradictions glow first
                </p>
                <div className={s.travPulseRow}>
                  <div className={s.travPulse}>
                    <span className={s.travPulseLine} />
                    bull &harr; historian — &quot;flat vs up&quot; — tension 1.74
                  </div>
                  <div className={s.travPulse}>
                    <span className={s.travPulseLine} />
                    flow &harr; bull — &quot;down vs up&quot; — tension 1.65
                  </div>
                  <div className={s.travPulse}>
                    <span className={s.travPulseLine} />
                    macro &harr; macro — &quot;earnings catalyst vs risk&quot; — tension 1.65
                  </div>
                </div>
              </div>

              {/* Step 3: Retrieved memories in order */}
              <div className={s.travStep}>
                <p className={s.travStepLabel}>
                  <span className={s.travStepLabelNum}>03</span>
                  retrieved memories — highest tension first
                </p>
                <div className={s.travResults}>
                  <div className={`${s.travResult} ${s.travResultContra}`}>
                    <span className={s.travResultRank}>#1</span>
                    <span className={s.travResultContent}>historian argued flat while bull argued up — unresolved, 0.55 divergence</span>
                    <span className={s.travResultScore}>1.74</span>
                  </div>
                  <div className={`${s.travResult} ${s.travResultContra}`}>
                    <span className={s.travResultRank}>#2</span>
                    <span className={s.travResultContent}>flow: 60-70% of move was dealer gamma, not fundamental — contradicts thesis</span>
                    <span className={s.travResultScore}>1.65</span>
                  </div>
                  <div className={`${s.travResult} ${s.travResultCorrection}`}>
                    <span className={s.travResultRank}>#3</span>
                    <span className={s.travResultContent}>macro: may 6 earnings will tip scales between quantum hype and valuation reality</span>
                    <span className={s.travResultScore}>1.65</span>
                  </div>
                  <div className={`${s.travResult} ${s.travResultSupport}`}>
                    <span className={s.travResultRank}>#4</span>
                    <span className={s.travResultContent}>bull: 40% thesis, 30% sector beta, 20% flow squeeze — supporting evidence</span>
                    <span className={s.travResultScore}>1.27</span>
                  </div>
                </div>
              </div>

              {/* Step 4: Final set */}
              <div className={s.travStep}>
                <div className={s.travFinal}>
                  <span className={s.travFinalStrong}>retrieved set: 2 contradictions, 1 correction, 1 support.</span>
                  <br />
                  the agent sees its own disagreements before its agreements.
                  <br />
                  this is the anti-echo-chamber mechanism.
                </div>
              </div>
            </div>
          </div>

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

          {/* interactive visualization — RAG vs tension-graph */}
          <div className={s.vizWrap}>
            <p className={s.vizTitle}>retrieval comparison: standard RAG vs entrenched coils</p>
            <div className={s.vizGrid}>
              {/* LEFT: standard RAG */}
              <div className={s.vizPane}>
                <p className={s.vizPaneTitle}>standard RAG</p>
                <div className={s.vizQuery}>query: &quot;will IONQ hold above $40?&quot;</div>
                <div className={s.vizNodes}>
                  <div className={`${s.vizNode} ${s.vizNodeSimilar}`}>IONQ bullish<br/>0.82</div>
                  <div className={`${s.vizNode} ${s.vizNodeSimilar}`}>IONQ uptrend<br/>0.79</div>
                  <div className={`${s.vizNode} ${s.vizNodeSimilar}`}>QC rally<br/>0.84</div>
                  <div className={s.vizNode}>RGTI short<br/>0.55</div>
                  <div className={s.vizNode}>rate hike<br/>0.71</div>
                  <div className={s.vizNode}>MSFT flat<br/>0.60</div>
                  <div className={s.vizNode}>sell signal<br/>0.43</div>
                  <div className={s.vizNode}>crash memo<br/>0.38</div>
                </div>
                <div className={s.vizConnections}>
                  <span className={s.vizConnRag}>top 3 by similarity</span>
                </div>
                <p className={s.vizDesc}>
                  retrieves by similarity — reinforces existing belief.
                  all 3 retrieved nodes agree. echo chamber.
                </p>
              </div>

              {/* RIGHT: entrenched coils */}
              <div className={s.vizPane}>
                <p className={s.vizPaneTitle}>entrenched coils</p>
                <div className={s.vizQuery}>query: &quot;will IONQ hold above $40?&quot;</div>
                <div className={s.vizNodes}>
                  <div className={`${s.vizNode} ${s.vizNodeContra}`}>crash memo<br/>0.38</div>
                  <div className={`${s.vizNode} ${s.vizNodeUnresolved}`}>QC rally?<br/>0.72</div>
                  <div className={`${s.vizNode} ${s.vizNodeSupport}`}>IONQ bullish<br/>0.82</div>
                  <div className={s.vizNode}>IONQ uptrend<br/>0.79</div>
                  <div className={s.vizNode}>RGTI short<br/>0.55</div>
                  <div className={s.vizNode}>rate hike<br/>0.71</div>
                  <div className={s.vizNode}>MSFT flat<br/>0.60</div>
                  <div className={s.vizNode}>sell signal<br/>0.43</div>
                </div>
                <div className={s.vizConnections}>
                  <span className={s.vizConnContra}>contradiction</span>
                  <span className={s.vizConnUnresolved}>unresolved</span>
                  <span className={s.vizConnSupport}>support</span>
                </div>
                <p className={s.vizDesc}>
                  retrieves by tension — surfaces unresolved conflicts.
                  the contradiction is retrieved first.
                </p>
              </div>
            </div>

            {/* confidence trajectory */}
            <div className={s.vizConfidence}>
              <p className={s.vizConfTitle}>confidence trajectory over 4 cycles</p>
              <div className={s.vizGrid} style={{ background: "transparent", gap: "1.5rem" }}>
                <div className={s.vizConfRow}>
                  <span className={s.vizConfLabel}>RAG — monotonic increase</span>
                  <div className={s.vizConfBars}>
                    <div className={`${s.vizConfBar} ${s.vizConfBarRag}`}><span className={s.vizConfVal}>0.60</span></div>
                    <div className={`${s.vizConfBar} ${s.vizConfBarRag}`}><span className={s.vizConfVal}>0.72</span></div>
                    <div className={`${s.vizConfBar} ${s.vizConfBarRag}`}><span className={s.vizConfVal}>0.84</span></div>
                    <div className={`${s.vizConfBar} ${s.vizConfBarRag}`}><span className={s.vizConfVal}>0.91</span></div>
                  </div>
                </div>
                <div className={s.vizConfRow}>
                  <span className={s.vizConfLabel}>coils — oscillating correction</span>
                  <div className={s.vizConfBars}>
                    <div className={`${s.vizConfBar} ${s.vizConfBarCoil}`}><span className={s.vizConfVal}>0.60</span></div>
                    <div className={`${s.vizConfBar} ${s.vizConfBarCoil}`}><span className={s.vizConfVal}>0.55</span></div>
                    <div className={`${s.vizConfBar} ${s.vizConfBarCoil}`}><span className={s.vizConfVal}>0.62</span></div>
                    <div className={`${s.vizConfBar} ${s.vizConfBarCoil}`}><span className={s.vizConfVal}>0.58</span></div>
                  </div>
                </div>
              </div>
              <p className={s.vizConfFootnote}>
                +0.024/cycle drift (RAG) vs -0.006/cycle correction (coils)
              </p>
            </div>

            {/* legend */}
            <div className={s.vizLegend}>
              <span className={s.vizLegendItem}><span className={`${s.vizLegendSwatch} ${s.vizSwatchBlue}`} /> similar (RAG)</span>
              <span className={s.vizLegendItem}><span className={`${s.vizLegendSwatch} ${s.vizSwatchRust}`} /> contradiction</span>
              <span className={s.vizLegendItem}><span className={`${s.vizLegendSwatch} ${s.vizSwatchGold}`} /> unresolved</span>
              <span className={s.vizLegendItem}><span className={`${s.vizLegendSwatch} ${s.vizSwatchGreen}`} /> support</span>
            </div>
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

          {/* model arbitrage */}
          <h3 className={s.paperH2}>the model arbitrage result</h3>
          <p className={s.paperP}>
            we ran a 2x2 factorial: single-model vs multi-model, with and
            without memory. 5 dates, 4 conditions, 20 total runs. the
            result was unambiguous:
          </p>
          <div style={{ overflowX: "auto" }}>
            <table className={s.paperTable}>
              <thead>
                <tr>
                  <th>condition</th>
                  <th>accuracy</th>
                  <th>avg brier</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>A: single model, no memory</td>
                  <td>40%</td>
                  <td>0.321</td>
                </tr>
                <tr>
                  <td>B: single model, with memory</td>
                  <td>40%</td>
                  <td>0.322</td>
                </tr>
                <tr>
                  <td className={s.cellWin}>C: multi-model, no memory</td>
                  <td className={s.cellWin}>60%</td>
                  <td className={s.cellWin}>0.189</td>
                </tr>
                <tr>
                  <td>D: multi-model, with memory</td>
                  <td className={s.cellLoss}>40%</td>
                  <td className={s.cellLoss}>0.322</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className={s.paperP}>
            multi-model diversity provided{" "}
            <strong>+20pp accuracy improvement</strong> (condition C).
            this is the single largest effect in any experiment we ran.
            but when memory was added to multi-model debate (condition D),
            accuracy dropped back to 40%. memory{" "}
            <strong>cancelled the multi-model advantage entirely</strong>.
          </p>
          <p className={s.paperP}>
            the mechanism: memory homogenized agents that were otherwise
            diverse. different models (qwen3, llama3, gemma2) naturally
            disagree. injecting shared memory erased that disagreement
            by giving every model the same context. the very thing
            that made multi-model debate valuable — cognitive
            diversity — was destroyed by shared retrieval.
          </p>
          <p className={s.paperNote}>
            this is a direct failure of the architecture. diversity
            of thought, not memory substrate, is the primary
            accuracy driver for multi-agent systems.
          </p>

          {/* where it fails */}
          <h3 className={s.paperH2}>where it fails</h3>
          <p className={s.paperP}>
            explicit catalog of known failure modes, listed because
            selective reporting is the norm in this field and we
            refuse to participate:
          </p>
          <ul className={s.paperList}>
            <li>
              <strong>rigid priors (p=0.51).</strong> agents initialized
              with high-conviction priors do not respond to tension
              retrieval. the graph surfaces contradictions but rigid
              agents ignore them. soft priors (p=0.002) are required.
            </li>
            <li>
              <strong>exploitation tasks (bandit).</strong> tension
              retrieval is an exploration mechanism. on tasks that
              require exploitation — converging on a known-good answer
              and repeating it — the constant injection of
              contradictions degrades performance.
            </li>
            <li>
              <strong>memory homogenizes multi-model diversity.</strong>{" "}
              condition D proved this: shared memory erased the
              natural disagreement between different model
              architectures, dropping accuracy from 60% back to 40%.
            </li>
            <li>
              <strong>tension vs recency is not significant
              (p=0.256).</strong> the specific retrieval weighting
              does not produce a statistically significant improvement
              over simple last-in-first-out memory. most of the
              value comes from having any memory at all.
            </li>
            <li>
              <strong>single-domain evidence.</strong> all calibration
              benchmarks are on tennis prediction. generalization to
              other domains is unproven.
            </li>
          </ul>

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
            closest competitor: <strong>Zep/Graphiti</strong> (Rasmussen
            et al. 2025) — temporal knowledge graph with contradiction
            handling. Zep gives every edge explicit validity
            intervals <code>(t_valid, t_invalid)</code>. when new
            information contradicts existing edges, Zep{" "}
            <strong>invalidates</strong> them by setting end-validity
            timestamps. outdated information is marked historical, not
            discarded. key difference: Zep resolves contradictions by
            invalidation. we resolve them by amplification. they treat
            conflict as error to fix. we treat conflict as signal to
            surface. Zep has no conviction/confidence weighting, no
            Brier score tracking, no reconsolidation.
          </p>
          <p className={s.paperP}>
            also compared against: <strong>MAGMA</strong> (2026,
            multi-graph with semantic/temporal/causal/entity layers,
            61.2% accuracy on LongMemEval but no contradiction-priority
            mechanism), <strong>Mem0g</strong> (2025, vector + knowledge
            graph overlay, detects contradictions but treats them as
            conflicts to resolve), and 14 other systems from MemGPT to
            ACT-R. the full comparison is in the repository. none of
            them use contradiction strength as a retrieval priority
            signal.
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
