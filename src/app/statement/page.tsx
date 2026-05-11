import type { Metadata } from "next";
import { HUNT_PHONE_DISPLAY, HUNT_PHONE_SMS } from "@/lib/hunt";
import { fmtMoneyCents } from "@/lib/portfolio-live";
import { getPortfolioData } from "@/lib/portfolio-aggregate";
import { getGraphSnapshot } from "@/lib/memory/graph-snapshot";
import CoilVisualization from "@/components/CoilVisualizationLoader";
import TopographicMap from "@/components/TopographicMapLoader";
import CrossSection from "@/components/CrossSectionLoader";
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
            entrenched coils: tension-weighted memory for agents that must not lie to themselves
          </h2>
          <p className={s.paperSub}>saathvik pai · may 2026 · roundletter · three layers</p>

          {/* abstract */}
          <h3 className={s.paperH2}>abstract</h3>
          <p className={s.paperP}>
            every AI agent with persistent memory will develop echo chambers.
            agreement-weighted retrieval creates <strong>+0.024 confidence drift
            per cycle</strong> with no new evidence (p&lt;0.0001). we propose{" "}
            <strong>tension-weighted retrieval</strong>: a directed graph where
            contradictions surface first. hallucination rate drops 50% (5/20 vs 10/20).
            prompt-level persona diversity is theater — same model produces identical
            4-1 splits every time. the real fix: <strong>feature steering via sparse
            autoencoders</strong> modifies internal activations, not prompts, creating
            genuine disagreement at zero inference cost. three layers of why this matters:
            for AI products (anti-echo-chamber), for markets (memory prevents overconfidence,
            not generates alpha), and for engineering (sparsity is the universal compression
            principle — SAE features, MoE routing, sleep consolidation, and memory graphs
            all exploit the same structure).
          </p>

          {/* ── LAYER 1: Interactive 3D Coil Visualization ── */}
          <CoilVisualization />

          {/* ── LAYER 1b: Topographic Tension Map + Cross-Section ── */}
          <TopographicMap />
          <CrossSection />

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

          {/* ── SECTION I: CONSUMER AI ── */}
          <h3 className={s.paperH2}>i. the consumer ai layer — why your agent forgets wrong</h3>
          <p className={s.paperP}>
            every production memory system (Zep, Mem0, Letta, MAGMA) retrieves by
            semantic similarity. similarity is highest between things that agree.
            the agent reads its own prior confidence back, updates toward it,
            stores the result. after <em>n</em> cycles: <code>c_n ≈ c_0 + n × 0.024</code>.
            after 40 cycles, a calibrated agent at 0.55 reports 1.0. it is certain.
            it is wrong at the same base rate as before.
          </p>
          <p className={s.paperP}>
            the standard fix — persona diversity — does not work.
            five copies of the same model share the same base distribution.
            system prompts shift by a few bits. on 47 local debates, same-model
            agents produced <strong>4-1 splits every single time</strong>.
            worse: debate triggers <strong>2-3x more sycophancy</strong> than
            direct questioning. the format designed to produce disagreement
            produces faster consensus with higher misplaced confidence.
          </p>
          <p className={s.paperP}>
            the real fix operates below the prompt layer. <strong>feature steering</strong>{" "}
            via sparse autoencoders modifies internal activations — the model{" "}
            <em>actually disagrees</em> rather than performing disagreement.
            Goodfire demonstrated this commercially. Qwen-Scope (may 2026) made
            it deployable on open models. the capacity for independent thought
            exists in the weights. it is outweighed by agreement-seeking features
            from RLHF. feature steering rebalances the internal vote without retraining.
          </p>
          <p className={s.paperP}>
            but steering alone is stateless — no memory of what it disagreed about.
            the hybrid: <strong>text memory for facts, activation steering for
            disposition</strong>. tension memory tells the agent <em>what</em> to
            be uncertain about. feature steering makes it <em>actually uncertain</em>.
            neither alone breaks the echo chamber. together, they break it at both layers.
          </p>

          {/* the mechanism — kept from original */}
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

          {/* diagram — kept from original */}
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

          {/* results — kept from original */}
          <h3 className={s.paperH2}>results</h3>
          <div style={{ overflowX: "auto" }}>
            <table className={s.paperTable}>
              <thead>
                <tr><th>condition</th><th>hallucinations</th><th>accuracy</th><th>confidence</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>tension memory</td>
                  <td className={s.cellWin}>5/20</td>
                  <td className={s.cellWin}>40%</td>
                  <td className={s.cellWin}>0.722</td>
                </tr>
                <tr>
                  <td>agreement memory</td>
                  <td className={s.cellLoss}>10/20</td>
                  <td>30%</td>
                  <td className={s.cellLoss}>0.869</td>
                </tr>
                <tr>
                  <td>no memory</td>
                  <td>9/20</td>
                  <td>30%</td>
                  <td>0.835</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className={s.paperTable}>
              <thead>
                <tr><th>comparison</th><th>brier</th><th>delta</th><th>p</th><th>sig</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>tension vs no-memory</td>
                  <td className={s.cellWin}>0.171 vs 0.205</td>
                  <td className={s.cellWin}>-0.034</td>
                  <td className={s.cellSig}>&lt;0.0001</td>
                  <td className={s.cellSig}>yes</td>
                </tr>
                <tr>
                  <td>tension vs flat recency</td>
                  <td>0.171 vs 0.174</td>
                  <td>-0.003</td>
                  <td className={s.cellNs}>0.256</td>
                  <td className={s.cellNs}>no (n=20, need n=502)</td>
                </tr>
                <tr>
                  <td>tension vs baserate inject</td>
                  <td className={s.cellWin}>0.171 vs 0.189</td>
                  <td className={s.cellWin}>-0.018</td>
                  <td className={s.cellSig}>0.015</td>
                  <td className={s.cellSig}>yes</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className={s.paperNote}>
            honest boundary: tension vs flat recency is not significant (p=0.256, n=20).
            need n&gt;502 for 80% power. most value comes from having <em>any</em> memory.
            the anti-echo-chamber effect (vs agreement) is the validated finding.
          </p>

          {/* ── SECTION II: PREDICTION LAYER ── */}
          <h3 className={s.paperH2}>ii. the prediction layer — memory that prices itself</h3>
          <p className={s.paperP}>
            the prediction pipeline has a strict trust hierarchy.
            LightGBM + 6 screeners generate the signal. multi-signal
            convergence filters it. tension-graph memory prevents
            overconfidence. the 5-agent debate produces text for the letter.
          </p>
          <div style={{ overflowX: "auto" }}>
            <table className={s.paperTable}>
              <thead>
                <tr><th>layer</th><th>mechanism</th><th>role</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td className={s.cellWin}>1. LightGBM + screeners</td>
                  <td>200K rows, 53 features, 6 screeners</td>
                  <td><strong>generates signal</strong></td>
                </tr>
                <tr>
                  <td>2. multi-signal convergence</td>
                  <td>2+ screeners AND LightGBM top-10</td>
                  <td>filters signal</td>
                </tr>
                <tr>
                  <td>3. tension-graph memory</td>
                  <td>contradiction retrieval, dopamine RPE</td>
                  <td>prevents overconfidence</td>
                </tr>
                <tr>
                  <td className={s.cellNs}>4. agent debate</td>
                  <td>5 agents, contrarian priors</td>
                  <td className={s.cellNs}>theater (4-1 split every time)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className={s.paperP}>
            <strong>memory does not generate alpha.</strong> LightGBM generates
            alpha (if the +63.8% backtest survives audit). memory prevents the
            system from destroying alpha through recursive self-radicalization.
            the Brier improvement is defensive — it caps conviction, not improves accuracy.
          </p>
          <p className={s.paperP}>
            the +63.8% is a <strong>claim under audit</strong>, not a result.
            survivorship bias (163 tickers selected now), transaction costs
            (52% annual drag at 0.5% round-trip), overfitting (CPCV not yet run),
            and deflated Sharpe (strategy selection correction) all remain unvalidated.
            the backtest will be published when audited, not when it looks good.
          </p>
          <p className={s.paperP}>
            what matters next: <strong>regime-gated forgetting</strong> — memories
            from bull markets are actively dangerous during bear markets.
            FSRS power-law decay (<code>t^&#123;-0.5&#125;</code>) retains 10%
            of day-1 signal after 90 days vs 0.03% for exponential.
            conformal prediction wraps LightGBM scores in calibrated intervals
            for proper Kelly sizing.
          </p>
          <p className={s.paperNote}>
            the math makes the call. the screeners filter the call.
            the memory prevents the system from getting drunk on its own conviction.
            the portfolio is live at{" "}
            <a className={s.link} href="https://aureliex.com/portfolio">aureliex.com/portfolio</a>.
          </p>

          {/* ── SECTION III: COMPRESSION LAYER ── */}
          <h3 className={s.paperH2}>iii. the compression layer — memory as feature geometry</h3>
          <p className={s.paperP}>
            <strong>sparsity is the universal compression principle.</strong>{" "}
            it appears at every layer: model weights (MoE), memory nodes (SAE features),
            agent ensemble (latent agents), and biological consolidation (sleep).
            exploiting it everywhere simultaneously yields 100x+ compression.
          </p>
          <div style={{ overflowX: "auto" }}>
            <table className={s.paperTable}>
              <thead>
                <tr><th>representation</th><th>bytes</th><th>interpretable</th><th>similarity ops</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>text string</td>
                  <td>~300</td>
                  <td>yes (human)</td>
                  <td>substring only</td>
                </tr>
                <tr>
                  <td>dense embedding</td>
                  <td>6,144</td>
                  <td className={s.cellLoss}>no</td>
                  <td>cosine</td>
                </tr>
                <tr>
                  <td className={s.cellWin}>sparse SAE features</td>
                  <td className={s.cellWin}>~400</td>
                  <td className={s.cellWin}>yes (both)</td>
                  <td className={s.cellWin}>cosine, intersection, set ops</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className={s.paperP}>
            sparse autoencoders decompose activations into monosemantic features:{" "}
            <code>h = ReLU(W_enc · x + b_enc)</code>. top-k sparsity keeps 50 of
            65,536 features active. 400 bytes per node — 15x cheaper than embeddings,
            more informative, and you can read them. Qwen-Scope (may 2026) provides
            pre-trained SAEs for the entire Qwen3 family. encoding cost: &lt;0.1ms per token.
          </p>
          <p className={s.paperP}>
            feature vectors enable <strong>geometric contradiction detection</strong>.
            mechanical tension: different feature sets active (blind spot).
            surface tension: same features, different magnitudes (productive disagreement).
            the current text system catches surface tension. feature geometry catches both.
          </p>
          <div style={{ overflowX: "auto" }}>
            <table className={s.paperTable}>
              <thead>
                <tr><th>layer</th><th>total</th><th>active</th><th>ratio</th><th>effect</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>SAE features</td>
                  <td>65,536</td>
                  <td>50–100</td>
                  <td>650:1</td>
                  <td>interpretable memory</td>
                </tr>
                <tr>
                  <td>MoE routing</td>
                  <td>35B params</td>
                  <td>3B</td>
                  <td>12:1</td>
                  <td className={s.cellWin}>130x speedup</td>
                </tr>
                <tr>
                  <td>memory graph</td>
                  <td>~2,200 nodes</td>
                  <td>100–200</td>
                  <td>11:1</td>
                  <td>bounded growth</td>
                </tr>
                <tr>
                  <td>agent ensemble</td>
                  <td>36 LLM calls</td>
                  <td>5–6</td>
                  <td>6:1</td>
                  <td>93% fewer tokens</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className={s.paperP}>
            <strong>sleep is a compression algorithm.</strong> 22 nodes/debate
            → 100-200 per agent with sleep. synaptic homeostasis (0.85x global
            downscaling with EWC-selective resistance for important edges).
            feature-based merging (cosine &gt; 0.85 = merge regardless of text).
            power-law decay retains deep priors exponential would kill.
          </p>
          <p className={s.paperP}>
            contrastive activation addition steers agents at <strong>zero
            inference cost</strong>: <code>a&apos; = a + α · v_steering</code>.
            one bias addition per layer. no extra tokens. no fine-tuning.
            five agents, five cached vectors, zero token overhead.
            the persona is in the geometry, not the prompt.
          </p>
          <p className={s.paperNote}>
            the information is in the sparse structure, not the dense substrate.
            tension graph is the architecture. sparse features are the representation.
            sleep is the compression. steering is the control interface.
            four expressions of one principle.
          </p>

          {/* where it fails — updated and condensed */}
          <h3 className={s.paperH2}>where it fails</h3>
          <ul className={s.paperList}>
            <li><strong>rigid priors (p=0.51).</strong> agents with locked-in beliefs ignore contradictions. soft priors required (p=0.002).</li>
            <li><strong>same-model debate.</strong> 47 debates, 4-1 split every time. sycophancy triggers 2-3x more in debate than direct questioning.</li>
            <li><strong>shared memory kills diversity.</strong> multi-model accuracy (60%) dropped to 40% when agents shared memory. diversity of thought &gt; memory substrate.</li>
            <li><strong>tension vs recency (p=0.256).</strong> underpowered at n=20. need n=502. most value comes from having any memory.</li>
            <li><strong>backtest unaudited.</strong> +63.8% has not survived CPCV, transaction costs, or deflated Sharpe correction.</li>
            <li><strong>single domain.</strong> calibration benchmarks are on tennis. generalization unproven.</li>
          </ul>

          {/* novelty — condensed */}
          <h3 className={s.paperH2}>novelty</h3>
          <p className={s.paperP}>
            <strong>40% novel, 60% recombination.</strong> new: tension-weighted
            max-heap traversal, conviction divergence weighting, reconsolidation
            in LLM memory (Nader 2000), feature steering for agent diversity (Goodfire/Qwen-Scope),
            sleep as information compression. borrowed: graph memory (Zep, MAGMA),
            temporal decay (ACT-R), multi-agent debate (AutoGen, CAMEL).
            no production system uses contradiction strength as a retrieval signal.
            checked: Zep, Mem0, Letta, MAGMA, CrewAI, A-MEM, MemRL, SCM — all resolve
            contradictions. we amplify them.
          </p>

          {/* code */}
          <h3 className={s.paperH2}>code</h3>
          <div className={s.paperCode}>
            <a href="https://github.com/saapai/roundletter" target="_blank" rel="noopener noreferrer">
              github.com/saapai/roundletter
            </a>
            {" → src/lib/memory/ · scripts/sae-sidecar/ · "}
            <a href="https://aureliex.com/letters/entrenched-coils" target="_blank" rel="noopener noreferrer">
              full paper
            </a>
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
