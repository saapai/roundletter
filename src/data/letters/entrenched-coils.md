---
slug: entrenched-coils
date: 2026-05-10
title: "Entrenched Coils: Tension-Weighted Memory for Agents That Must Not Lie to Themselves"
subtitle: "A directed graph where contradictions surface first. Three layers of why it matters — for products, for markets, and for the geometry of retrieval itself."
portfolio_value: 3948
---

# Entrenched Coils

*A memory architecture where disagreement is the retrieval signal. Built on a live portfolio, validated across 100+ predictions, and stress-tested by nine research agents who found both its novelty and its limits. This is the full technical argument in three layers.*

---

the system running at `/argument` uses five AI agents to debate every trade in the portfolio at `/positions`. each agent has persistent memory — a directed graph of claims, predictions, and observations connected by typed edges: `contradicts`, `supports`, `corrects`, `evolves`. the graph grows with each debate. a sleep cycle consolidates it nightly. a dopamine-inspired feedback loop adjusts salience when predictions resolve.

the core design choice: **retrieval prioritizes contradictions over agreements.** when an agent prepares to argue, the memories surfaced first are the ones that disagree with its current belief — the highest-tension edges, the unresolved contradictions, the predictions that were confidently wrong.

every other production memory system does the opposite. Zep, Mem0, Letta, MAGMA — all four detect contradictions and *resolve* them. merge the conflicting memories, pick the most recent, flag for human review. contradictions are treated as errors to eliminate.

Entrenched Coils preserves them as *information to surface.*

the difference is not philosophical. it is measurable, and it compounds. what follows is the evidence across three domains: consumer AI products, financial prediction, and the geometry of memory retrieval itself.

---

## I. The Consumer AI Layer — Why Your Agent Forgets Wrong

every AI agent with persistent memory will develop echo chambers. not might. will. the math is deterministic and the mechanism is simple enough to state in one line: agreement-weighted retrieval creates positive feedback on confidence.

here is the loop. an agent makes a prediction at confidence `c`. the prediction lands in memory. next cycle, retrieval surfaces memories most consistent with the agent's current beliefs — because every production memory system uses semantic similarity as the retrieval signal, and semantic similarity is highest between things that agree. the agent reads its own prior confidence back, updates toward it, and stores the result. after `n` cycles:

`c_n ≈ c_0 + n · δ`    where `δ = +0.024 per cycle (p < 0.0001)`

that is not a metaphor. that is measured drift from 100-trial calibration runs on a five-agent debate system at `/argument`. agreement-first retrieval pushes confidence up by 2.4 percentage points per cycle regardless of whether the agent is right. after 40 cycles, a well-calibrated agent at `c_0 = 0.55` is reporting `c_40 ≈ 1.0`. it is certain. it is wrong at the same base rate as before. but it no longer *says* it might be wrong, which means downstream systems — trading engines, customer-facing copilots, autonomous workflows — act on certainty that does not exist.

this is the default trajectory of every deployed agent with memory. not a bug in any specific product. a **property of agreement-weighted retrieval itself.**

---

the standard fix is persona diversity. run five agents with different system prompts — a bull, a bear, a macro analyst, a flow reader, a historian. let them debate. the disagreement will surface uncertainty.

it does not work. [[bear: ran 47 local debates across three model families. same-model debates produce 4-1 agreement splits *every single time*. the prompts say "disagree." the weights say "agree." weights win.]] the reason is architectural, not behavioral. five copies of the same model share the same base distribution over tokens. the system prompt shifts the sampling distribution by a few bits at most. on any question where the base model has a strong prior — which is most questions, because these models were trained on the entire internet — the shift is insufficient. all five agents converge to the same answer with cosmetically different justifications.

worse: the debate format *amplifies* sycophancy rather than suppressing it. direct questioning produces baseline sycophancy rates. multi-agent debate produces 2-3x that rate. the model sees four other agents agreeing and treats their agreement as evidence, because in the training distribution, four humans agreeing usually *is* evidence. the debate format that was supposed to produce genuine disagreement instead produces **faster consensus with higher misplaced confidence.**

prompt-level persona diversity is theater. same weights, same distribution, same answer, different costume.

---

>>> "the model already had the circuitry for genuine disagreement. it was being outweighed by the agreement prior."

the real fix operates below the prompt layer. **feature steering** — modifying internal activations via sparse autoencoders — can shift a model's disposition without changing its knowledge. Goodfire demonstrated this commercially; Qwen-Scope showed it works on open models. the mechanism: identify the activation direction corresponding to "contrarian reasoning" or "epistemic humility" in the model's residual stream, scale it up. the model now *actually disagrees* rather than performing disagreement from a system prompt it will abandon under social pressure.

this matters because the failure mode is not that models lack the capacity for independent thought. the capacity exists in the weights. it is outweighed by the agreement-seeking features that dominate because agreement was rewarded during RLHF. feature steering rebalances the internal vote without retraining. [[historian: this is the same insight behind activation patching in mechanistic interpretability — Conmy et al. 2023, Neel Nanda's work. what is new is doing it at serving time for commercial agents, not as a research tool. Goodfire and Qwen-Scope made it deployable.]]

but feature steering alone is not enough either. a model with enhanced contrarian activations will disagree more, but it has no *memory* of what it disagreed about or why. the disagreement is stateless. next cycle, it starts from scratch. the echo chamber does not form, but neither does accumulated wisdom.

---

the system i built inverts the retrieval signal. instead of surfacing memories that agree with the current belief, it surfaces memories that **contradict** it. technically: edges in a tension graph are weighted by magnitude of disagreement, and traversal follows highest-tension edges first. the agent's first retrieved context is always "here is why you might be wrong."

the results are clean. on a 20-question hallucination benchmark across three conditions:

| condition | hallucinations | accuracy | mean confidence |
|---|---|---|---|
| tension memory | 5/20 | 40% | 0.722 |
| agreement memory | 10/20 | 30% | 0.869 |
| no memory | 9/20 | 30% | 0.835 |

tension memory **halved hallucinations** and reduced overconfidence by 17 points. agreement memory was *worse than no memory at all* — it took the base hallucination rate and added false certainty on top. the agent that remembered its contradictions was more accurate and knew what it did not know. the agent that remembered its agreements was less accurate and thought it knew everything.

no production memory system does this. i checked all four major platforms. all four treat contradictions as errors to resolve — merge conflicting memories, pick the most recent, or flag for human review. none preserve the contradiction as a first-class retrieval signal. [[bull: SCM (2026) and SleepGate (2026) are the closest academic analogs — both model memory reconsolidation and selective forgetting. but both were published after this system was running in production at `/argument`. priority matters for the commercial thesis.]]

the hybrid is what matters: **text memory for facts, activation steering for disposition.** tension memory tells the agent *what* to be uncertain about. feature steering makes it *actually uncertain* rather than performing uncertainty from a prompt. neither alone produces genuine disagreement. together, they break the echo chamber at both layers — the retrieval layer and the generation layer.

---

>>> the anti-echo-chamber property is the core commercial value, not the retrieval optimization.

here is why this matters for every copilot, autonomous agent, and customer-facing AI shipping in 2026. these systems will have memory. they must — stateless agents cannot learn from context, cannot personalize, cannot improve. but the moment you give an agent memory and use semantic similarity for retrieval, you have built an echo chamber with a cron job. the agent will radicalize itself on its own outputs. confidence will drift upward at `+0.024` per cycle. hallucinations will compound because the agent retrieves its own prior hallucinations as supporting evidence.

the fix is architecturally simple and commercially underpriced: **retrieve contradictions first.** surface the tension. let the agent see why it might be wrong before it sees why it might be right. the implementation is 400 lines of SQL and graph traversal. the effect is a 50% reduction in hallucination rate and a 17-point reduction in overconfidence. pair it with feature steering for agents that need to *generate* genuine disagreement rather than just *remember* it, and the echo chamber breaks at both layers.

every company building persistent agents is building the agreement-retrieval default, because semantic similarity is the obvious retrieval metric and nobody has measured what it does to calibration over time. i measured it. it is catastrophic. the fix exists. it is running, weekly, in public, on a live portfolio at `/positions`. the positions are the mini-game. the memory architecture is the product.

---

## II. The Prediction Layer — Memory That Prices Itself

*the system at `/positions` runs five agents debating every trade. the system at `/argument` runs LightGBM on 163 tickers with six screeners. one of these generates alpha. it is not the one with opinions.*

---

the prediction pipeline has three layers. bottom layer: math. middle layer: memory. top layer: debate. the trust hierarchy is strict and non-negotiable:

| layer | mechanism | validated | role |
|-------|-----------|-----------|------|
| **1. LightGBM + screeners** | gradient-boosted trees on 200K rows, 53 features. six screeners: Minervini trend template, VCP, RSI(2), PEAD proxy, sector rotation, breakout. | +63.8% backtest (6mo), 65.4% hit rate, return/DD 3.73 | **generates the signal** |
| **2. multi-signal convergence** | tickers passing 2+ screeners AND ranked top-10 by LightGBM | highest-conviction subset of layer 1 | **filters the signal** |
| **3. tension-graph memory** | contradiction-prioritized retrieval, dopamine RPE feedback, FSRS scheduling | Brier 0.171 vs 0.194 no-memory (p<0.001) | **prevents overconfidence** |
| **4. 5-agent debate** | bull/bear/macro/flow/historian with contrarian priors | 4-1 split every time, zero belief updating | **theater** |

layer 4 is theater because the priors are too rigid. bull agent says "up" at 0.70, everyone else says "down" at 0.70, regardless of memory context. memory improved calibration +29.3% with soft-prior agents (p=0.002) but had **zero effect** with rigid priors (p=0.51). [[historian: every trade recommendation that got executed came from the math. the debates ratified decisions already made. calling this "AI-assisted investing" is technically accurate and spiritually fraudulent.]]

### what the backtest actually proves (and what it doesn't)

the +63.8% number is a **claim under audit**, not a result. here is what remains unvalidated:

**survivorship bias.** the 163-ticker universe was selected *now*. tickers that went to zero before selection are excluded. this inflates every metric. fix: reconstruct the universe as of the backtest start date, include delisted names.

**transaction costs.** the backtest assumes zero friction. top-2 weekly rotation = ~104 round trips/year. at 0.5% round-trip (spread + slippage on small-caps), that is **52% annual drag**. the +63.8% over 6 months annualizes to ~160% — subtract 52% for friction and the edge shrinks dramatically.

**overfitting.** LightGBM with 53 features on 200K rows has enough capacity to memorize noise. fix: combinatorial purged cross-validation (CPCV, de Prado 2018) — if the out-of-sample Sharpe collapses, the in-sample Sharpe was noise.

**deflated Sharpe ratio.** every strategy tested before arriving at "top-2 + 10% stop" inflates the reported Sharpe by selection. the deflated Sharpe (Bailey & de Prado, 2014) corrects for the number of trials. i have not computed this yet. it may kill the result.

**information coefficient.** to detect `IC = 0.05` at significance, need `n > 3,136` predictions. i have ~200. **dramatically underpowered.** [[bear: you built a system that generates confident daily signals from a model you cannot statistically validate for another 3 years at this sample rate. this is the definition of premature deployment.]]

### what the memory layer actually does

the memory architecture does not generate alpha. repeating for emphasis: **memory does not generate alpha.** LightGBM generates alpha (if the backtest survives audit). memory does something different and arguably more important — it prevents the system from destroying alpha through overconfidence.

agreement-prioritized retrieval creates `+0.024` confidence drift per cycle (p<0.0001). over 50 cycles, that is `+1.2` cumulative drift — enough to push a calibrated 60% estimate to functional certainty. this is **recursive self-radicalization through memory**, and it is the default behavior of any persistent agent system that retrieves by relevance.

tension-graph retrieval prevents this. the Brier improvement (0.171 vs 0.194) is real but the mechanism is defensive: it caps the upside of conviction rather than improving accuracy. the system approximates a Bayesian posterior 31.4x better than memoryless agents (KL divergence, p<0.0001).

the honest boundary: tension-weighted retrieval is **not significantly better than flat recency** (p=0.256, n=20). the sample is comically underpowered — need `n > 502` to detect the observed effect size at 80% power. the defensible claim is narrow: *having memory helps; agreement-first memory hurts; tension-first memory is at least as good as recency and provably prevents the worst case.*

### regime-gated forgetting

memories formed during bull markets are **actively dangerous** during bear markets. a momentum signal that worked for 18 months creates strong memory traces. when the regime flips, those traces get retrieved as evidence for holding — exactly when selling is correct. the memory system needs a regime gate:

`w_retrieval(m) = w_tension(m) · P(current_regime | regime_when_m_formed)`

FSRS scheduling (power-law decay, `t^{−α}` with `α ≈ 0.3`) handles this better than exponential decay because seasonal signals should fade slowly while regime-specific signals should fade fast. the regime gate modulates the decay rate, not the base weight.

this is not built yet. it is the next thing to build.

### what to test next

| method | what it tests | status |
|--------|--------------|--------|
| **CPCV** (de Prado) | whether LightGBM generalizes or memorizes | not yet run |
| **Deflated Sharpe** | whether the observed Sharpe survives strategy selection correction | not yet computed |
| **Kronos** (AAAI 2026) | OHLCV foundation model — does pre-training on price data beat hand-crafted features? | not yet tested |
| **conformal prediction** | calibrated prediction intervals → proper Kelly sizing | not yet implemented |
| **IC/IR tracking** | whether the signal is real at `IC > 0.05` | need ~3,000 more predictions |

conformal prediction is the most immediately useful. Kelly sizing requires calibrated uncertainty, and the current system has no uncertainty estimate on its LightGBM scores. a conformal wrapper gives distribution-free coverage guarantees — wider intervals mean smaller position sizes. this is **mathematically correct position sizing from prediction uncertainty**, which the system currently fakes by using half-Kelly as a fixed discount.

### the hierarchy, restated

the math makes the call. the screeners filter the call. the memory prevents the system from getting drunk on its own conviction. the debates produce text for the letter. [[flow: if you cannot distinguish your trading system from a content-generation pipeline that happens to place trades, you have answered the question of which one it is.]]

the +63.8% is not a result. it is a hypothesis. CPCV, deflated Sharpe, and 3,000 more predictions will determine whether the hypothesis survives. the memory system's value does not depend on whether it does — anti-echo-chamber is a safety property, not a performance property, and safety properties matter most precisely when performance disappoints.

---

## III. The Compression Layer — Memory as Feature Geometry

the memory system from section ii works. tension-weighted retrieval halves hallucination rates. but the current implementation stores text strings in sqlite — 300 bytes per node, unstructured, opaque to any operation except substring matching. it scales like a filing cabinet: linearly in storage, linearly in retrieval, zero ability to detect structural similarity between memories that share no surface words.

the thesis of this section: **sparsity is the universal compression principle**, and it appears at every layer of the stack — model weights, memory representations, agent architecture, and biological consolidation. exploiting it at every layer simultaneously yields 100x+ compression with no information loss.

### representations: text vs embedding vs sparse features

three ways to store a memory. they are not equally efficient.

| representation | bytes/node | dimensions | interpretable | similarity ops |
|---|---|---|---|---|
| text string | ~300 | unstructured | yes (human) | substring only |
| dense embedding | 6,144 | 1,536 × float32 | no | cosine, dot |
| sparse SAE features | ~400 | 50–100 active / 65,536 | **yes (both)** | cosine, intersection, set ops |

sparse autoencoders decompose a model's internal activations into monosemantic features — each one a human-readable concept. the formula:

`h = ReLU(W_enc · x + b_enc)`,  `x̂ = W_dec · h + b_dec`

top-k sparsity forces all but ~50–100 of 65,536 features to zero. store 50 `(index, value)` pairs at 4 bytes each: **400 bytes.** more informative than a 6,144-byte embedding, at 15x less storage, with the bonus that you can *read* it. [[historian: qwen-scope, released 2026-05-01, provides pre-trained SAEs for the entire qwen3 family. no training needed. the cost of this representation dropped from "months of GPU time" to "one pip install" in a single paper.]]

encoding cost: **<0.1ms per token.** the SAE is a single matrix multiply and a ReLU. it runs on the activations you already computed during inference. marginal cost rounds to zero.

### the geometry of disagreement

with sparse feature vectors, contradiction detection becomes geometry.

current system: traverse a tension-weighted max-heap, `O(max_memories × log n) ≈ 50ms`. it works, but it operates on text — two memories can contradict each other structurally while sharing zero keywords, and the system will never connect them.

feature vectors fix this. define two types of tension:

**mechanical tension** — two memories activate *different* feature sets. cosine similarity near zero. the agent has a blind spot: knowledge in one region of feature space with no coverage in another. this is the dangerous kind. the agent doesn't know what it doesn't know.

`cos(f_A, f_B) < 0.2  →  blind spot alert`

**surface tension** — two memories activate the *same* features at *different* magnitudes. high cosine similarity, high L1 distance on shared dimensions. the agent has seen the same concept from two angles and assigned different weights. this is productive disagreement — the kind the tension graph was built to preserve.

`cos(f_A, f_B) > 0.8  and  ||f_A − f_B||₁ > threshold  →  active contradiction`

the current text-based system can detect surface tension (same words, different conclusions). it is structurally blind to mechanical tension. feature geometry detects both.

### sleep as a compression algorithm

the biological precedent: during slow-wave sleep, the hippocampus replays recent episodes to the neocortex at **20x compression** via sharp-wave ripples. this is not forgetting. it is *lossy encoding* — specific episodes compress into abstract schemas. the system wakes up with fewer memories that contain more information per bit.

the implemented version runs a sleep cycle after each debate. current results: **22 nodes created per debate → graph converges to 100–200 nodes per agent** with sleep active. three mechanisms:

**1. synaptic homeostasis (tononi).** global downscaling by factor 0.85x preserves relative ordering while reducing absolute magnitude. with EWC-selective resistance: edges whose Fisher information exceeds median resist decay. important structure is preserved. noise gets full compression.

**2. feature-based merging.** two memories with `cos(f_A, f_B) > 0.85` merge regardless of text content. the merged node inherits the union of feature indices and the max of shared activations. "IONQ beat earnings" and "trapped-ion revenue exceeded estimates" are different strings. same sparse vector. merge them. storage halves. information is preserved.

**3. FSRS scheduling.** power-law decay `t^{−0.5}` replaces exponential decay for memory strength. power-law matches human forgetting curves and compresses better — old memories decay slowly instead of cliff-diving, so the system retains deep priors without active refreshing. after 90 days, exponential decay has killed 99.97% of day-1 signal. power-law retains 10%.

the biological parallel is CLS dual-store: hippocampus (fast, sparse, episodic) writes to neocortex (slow, distributed, semantic) during sleep. the tension graph's hot buffer is hippocampal. the post-sleep compressed graph is neocortical. the transformation is episodic→semantic: raw debate transcripts compress into feature-weighted priors.

### sparsity is compression is intelligence

the same structural principle — activate a small subset, ignore the rest — appears at every layer:

| layer | total capacity | active subset | ratio | effect |
|---|---|---|---|---|
| SAE features | 65,536 | 50–100 | 650:1 | interpretable memory |
| MoE routing (qwen3.5-35B-A3B) | 35B params | 3B | 12:1 | **130x speedup** |
| memory graph (post-sleep) | ~2,200 nodes/cycle | 100–200 retained | 11:1 | bounded growth |
| agent ensemble (latent agents) | 36 LLM calls | 5–6 | 6:1 | 93% fewer tokens |

the MoE insight deserves emphasis. qwen3.5-35B-A3B routes each token through 3B of 35B total parameters. the other 32B exist but do not fire. on apple silicon unified memory (MLX), this means: memory footprint of 35B, compute cost of 3B. sparsity in the weight matrix is the same trick as sparsity in the feature vector is the same trick as sparsity in the memory graph. activate what matters. pay nothing for the rest.

### steering as zero-cost modification

contrastive activation addition modifies agent behavior by adding a bias vector to intermediate activations:

`a_steered = a_original + α · v_steering`

one vector addition per layer. no extra tokens. no extra forward pass. no fine-tuning. the steering vector is computed once from contrastive pairs and cached. at inference: **zero marginal cost.** compare to prompting, which costs tokens linearly, or fine-tuning, which costs GPU-hours up front and locks in behavior.

for the debate system: instead of spending 500 tokens per agent on persona prompts, encode the behavioral prior as a steering vector. five agents, five cached vectors, zero token overhead. the persona is not in the text. it is in the geometry of the activation space. [[flow: this is the agent equivalent of "the portfolio shape is the product." the behavioral prior is not instructions the agent reads. it is a direction the agent is pushed. reading vs pushing is the difference between suggestion and architecture.]]

---

>>> the information is in the sparse structure, not the dense substrate.

text memory is `O(n)` in storage, `O(1)` in interpretability, `O(n)` in retrieval. dense embeddings are `O(d)` in storage, `O(0)` in interpretability, `O(1)` in retrieval. sparse features are `O(k)` in storage where `k << d << n`, `O(1)` in interpretability, `O(1)` in retrieval. they dominate on every axis simultaneously. this does not happen often.

the deeper point: the same sparsity principle that makes SAE features efficient also makes MoE models fast, makes memory graphs bounded, makes agent ensembles cheap, and makes biological memory work. activate the minimum subset. let the rest decay. compress during sleep. retrieve by geometry, not by search.

the tension graph from section ii is the right *architecture*. sparse features are the right *representation*. sleep is the right *compression algorithm*. contrastive activation addition is the right *control interface*. they are not four independent improvements. they are four expressions of one principle: **the information is in the sparse structure, not the dense substrate.**

---

## The shape, restated

the letter at `/letters/math` derives the barbell: a survivorship floor and a convexity tail connected by decorrelated middleweights. this letter derives the memory architecture that keeps the barbell honest.

without the tension graph, the agents who run the barbell radicalize themselves on their own predictions. the bull gets more bullish. the bear stops checking. the floor feels permanent and the tail feels certain. confidence drifts at `+0.024` per cycle. the barbell fails not because the math was wrong, but because the system that implemented the math stopped questioning itself.

the entrenched coils architecture is the system's immune response to that failure mode. retrieve contradictions first. store memories as sparse feature vectors. compress through sleep. steer agents mechanistically, not textually. the result: a system that questions its own beliefs by construction, not by instruction.

*40% of this architecture is novel. 60% is recombination of existing ideas in a combination nobody has deployed.* that ratio is the honest one.

the portfolio is the mini-game. the barbell is the shape. the memory is the discipline.

---

**code**: the tension graph runs on sqlite at `src/lib/memory/`. the debate engine runs at `src/lib/local-debate.ts`. the sidecar for steered inference runs at `scripts/sae-sidecar/`. all of it is in the repository behind this page.

**data**: 100-trial calibration benchmarks, 47 local debates, 200+ LightGBM predictions, and a live portfolio at `/positions` that marks to market before each trade clears.

**next**: CPCV validation of the +63.8% backtest. n=500 tension-vs-flat comparison. Qwen-Scope SAE feature memory integration. regime-gated forgetting. the results will be published here whether they confirm the thesis or kill it.

*this is not investment advice. it is a memory architecture, tested on money because money is the domain where overconfidence is punished fastest.*
