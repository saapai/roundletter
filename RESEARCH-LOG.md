# Research Log — Entrenched Coils & Aureliex Portfolio
## Running backlog of all research, analysis, techniques, and their origins

---

## Session: 2026-05-08

### Phase 1: 6-Agent Deep Research (Memory + Compute + Models + Neuro + Benchmarks + Disagreement)

**Trigger:** User requested comprehensive research on architectures to drive down compute, increase efficiency/quality, with objective benchmarking and experimentation with alternatives to LightGBM+Minervini+memory.

**Method:** 6 parallel research agents, each with distinct domain focus, performing web searches and codebase analysis simultaneously. Full synthesis written to `RESEARCH-SYNTHESIS.md`.

---

#### Agent 1: SOTA Memory Architectures
**Scope:** MemGPT/Letta, Zep/Graphiti, MAGMA, Mem0, LangGraph, CrewAI, A-MEM, MemRL, GAM, SCM, SleepGate, Cognee, OMEGA, Supermemory
**Key finding:** EC's contradiction-as-retrieval is genuinely novel. No production system amplifies contradictions at retrieval time. All others resolve them at write time.
**Techniques to implement:**
- Vector embeddings for seed finding (SQLite-VSS or Chroma) — from gap analysis vs Zep/Mem0
- Learned edge weights via MemRL Q-values — replaces hand-tuned 0.2/0.3/0.5
- Temporal validity tracking (valid_from, invalid_at) — from Zep's bitemporal model
- Intent-aware query routing — from MAGMA's 4-graph approach
- Episodic/semantic memory separation — from CLS theory + MAGMA
**Papers:**
- Zep: arXiv:2501.13956
- MAGMA: arXiv:2601.03236
- MemRL: arXiv:2601.03192
- SCM: arXiv:2604.20943
- A-MEM: arXiv:2502.12110
- GAM: arXiv:2604.12285
- SleepGate: arXiv:2603.14517
- Memory survey: arXiv:2512.13564
- Graph-based memory taxonomy: arXiv:2602.05665

#### Agent 2: Neuroscience Memory Theories
**Scope:** CLS, systems consolidation, spaced repetition, RIF, sharp-wave ripples, sleep spindles, threat simulation, TMR, ACT-R, SOAR, GWT, predictive coding, Bayesian forgetting, EWC, context-dependent forgetting
**Key finding:** 15 implementable mechanisms. Top 4 are low effort + high impact.
**Techniques to implement:**
1. **Retrieval-Induced Forgetting** (Anderson 1994): After retrieval, suppress competing same-ticker same-direction nodes by 0.93^k per similar retrieved node. Preserves contradictions, reduces redundancy.
2. **EWC-Selective Downscaling** (Kirkpatrick 2017): Replace uniform 0.85x with importance-weighted. Important edges (high traversal × accuracy) resist decay via sigmoid protection.
3. **FSRS Scheduling** (Wozniak DSR): Track stability/retrievability/difficulty per node. Power-law decay (ACT-R t^{-0.5}) replaces exponential. Memories near forgetting threshold get priority retrieval.
4. **Regime-Gated Forgetting** (Tulving 1973): Tag nodes with market_regime. Suppress opposite-regime memories during retrieval. Double decay rates on regime change.
5. **Compressed Sequence Replay** (Wilson & McNaughton 1994): Replay debate sequences during SWS, not just individual nodes. Boundary enhancement effect on first/last nodes.
6. **Active Memory Suppression** (Anderson & Green 2001): Auto-suppress confidently wrong predictions with access_count > 5. De-suppress if new supporting evidence appears.
7. **REM Threat Simulation** (Revonsuo 2000): Find high-confidence bullish predictions with bearish contradictions. Generate "dream" nodes as RISK ALERTs.
8. **CLS Dual-Store** (McClelland 1995): hippocampal_buffer (fast, sparse) + neocortical_schemas (slow, abstract). Sleep replays episodes to train schemas. Enables transfer to unseen tickers.
9. **Episodic→Semantic Transformation** (Trace Transformation): Promote patterns from specific episodes to sector-level schemas after 3+ sleep cycles without contradiction.
10. **Global Workspace Broadcast** (Baars 1988): Top-5 memories across all agents broadcast to all. Competitive selection based on salience × tension.
**Papers:**
- CLS: Kumaran, Hassabis, McClelland 2016 (Cell Trends Cog Sci)
- EWC: Kirkpatrick et al. PNAS 2017
- RIF: Wimber et al. Nature Neuroscience 2015
- FSRS: github.com/open-spaced-repetition/free-spaced-repetition-scheduler
- ACT-R: Anderson tutorial units 4-5
- Threat simulation: Revonsuo 2000 (Behavioral & Brain Sciences)
- GWT: Baars 1988, Franklin LIDA
- Free Energy: Friston 2009 (Phil Trans Royal Soc B)

#### Agent 3: Compute Efficiency
**Scope:** Speculative decoding, KV cache, quantization, prompt caching, batching, flash attention, MLX vs llama.cpp, model selection, MoE, pipeline orchestration
**Key finding:** 130x speedup achievable. Three env vars + model change + architecture refactor.
**Techniques to implement:**
- `OLLAMA_USE_MLX=1` — 57-93% faster on Apple Silicon
- `OLLAMA_KEEP_ALIVE=-1` — prevent model eviction between calls
- `OLLAMA_FLASH_ATTENTION=1` — memory + speed for long contexts
- `OLLAMA_KV_CACHE_TYPE=q8_0` — cut KV cache memory 50%
- Switch to Qwen3.5-35B-A3B MoE (3B active, 70-80 tok/s on MLX)
- Multi-perspective prompting: 5 agents → 1 call (Latent Agents paper)
- Early termination: 4/5 supermajority check
- Eliminate moderator interludes (generate post-hoc)
- Merge scorecards into single post-debate call
- Pipeline: debate + sleep in parallel (no resource contention)
- Move debate to post-market-close (16:06) for fresh signals
**Papers:**
- Latent Agents: arXiv:2604.24881
- S2-MAD: NAACL 2025 (aclanthology.org/2025.naacl-long.475)
- Single vs multi-agent: arXiv:2604.02460
- Adaptive stability detection: NeurIPS 2025 (openreview.net/forum?id=Vusd1Hw2D9)
- Apple MLX M5 research: machinelearning.apple.com/research/exploring-llms-mlx-m5
- MoE on Apple Silicon NPUs: arXiv:2604.18788

#### Agent 4: Alternative ML Models
**Scope:** XGBoost/CatBoost, TabNet/TabPFN, TFT, N-BEATS, TimesFM/Chronos/Kronos/FinCast, LSTM/GRU, Mamba, screeners, factor zoo, LLM-as-analyst, stacking, online learning, conformal prediction, regime-switching, HMM, RL
**Key finding:** Validate +63.8% first (CPCV, transaction costs, survivorship). Kronos and TFT are top alternatives.
**Techniques to implement:**
- CPCV validation: skfolio.model_selection.CombinatorialPurgedCV
- Transaction costs: 0.25% slippage each way, 1% for ADV < $5M
- Survivorship bias: verify point-in-time universe membership
- FF5+momentum regression: Ken French data library
- Deflated Sharpe Ratio: Bailey & Lopez de Prado formula
- Elastic net feature selection on 50 features
- Conformal prediction: calibrated uncertainty → Kelly sizing
- SUE/earnings momentum feature (from Yahoo data)
- Wire in short squeeze score (already in advanced-factors.ts)
- Stack LightGBM + XGBoost + CatBoost (10-15% improvement)
- HMM 3-state regime detection (replace rule-based)
- Kronos zero-shot test (AAAI 2026, 12B K-lines from 45 exchanges)
- TFT multi-horizon (PyTorch Forecasting)
- LLM-generated alpha formulas
- FinBERT on EDGAR filings
**Papers:**
- Kronos: arXiv:2508.02739
- FinCast: arXiv:2508.19609
- Conformal prediction: PMLR 2025 (proceedings.mlr.press/v266/kaya25a)
- Factor zoo: Feng, Giglio, Xiu (dachxiu.chicagobooth.edu/download/ZOO.pdf)
- PBO: Bailey (davidhbailey.com/dhbpapers/backtest-prob.pdf)
- LLM alpha: arXiv:2508.04975
- MambaStock: arXiv:2402.18959

#### Agent 5: Benchmarking Framework
**Scope:** Memory A/B testing, disagreement metrics, compute efficiency benchmarks, trading signal quality, memory health, external benchmarks, statistical rigor
**Key finding:** Tension-vs-flat comparison underpowered (n=20, need n=502). Designed comprehensive protocol.
**Techniques to implement:**
- Expand to 5 retrieval conditions: tension, cosine, recency, random, no-memory
- n=200+ per experiment minimum
- Metrics: Brier, log loss, ECE, sharpness, resolution, AUC-ROC
- Reliability diagrams (calibration curves)
- Disagreement: JSD, belief update magnitude, Simpson's D, Krippendorff's alpha, unique claim ratio
- Sycophancy detection: stance reversal test, permutation test, contrarian injection
- Trading: IC (Spearman rank correlation), IR, hit rate by signal strength
- Memory health: graph density, contradiction resolution rate, RPE distribution, information gain per sleep
- Bootstrap CI (10,000 resamples), Benjamini-Hochberg FDR, Cohen's d, pre-registration
- External: MemoryAgentBench (ICLR 2026), LongMemEval (ICLR 2025), FinBen (NeurIPS 2024), ForecastBench
**Papers:**
- MemoryAgentBench: github.com/HUST-AI-HYZ/MemoryAgentBench
- LongMemEval: arXiv:2410.10813
- FinBen: arXiv:2402.12659
- CONSENSAGENT: ACL 2025 (aclanthology.org/2025.findings-acl.1141)
- ECE: ICLR 2025 blog (iclr-blogposts.github.io/2025/blog/calibration)
- DSR: davidhbailey.com/dhbpapers/deflated-sharpe.pdf

#### Agent 6: Multi-Agent Disagreement
**Scope:** Same-model failure, sycophancy, DoT, information asymmetry, structured argumentation, diversity mechanisms, case studies
**Key finding:** Information asymmetry is the only reliable fix. Sycophancy is the core failure mode.
**Techniques to implement:**
- Information asymmetry: each agent sees different data slices (Bull=analyst/upgrade, Bear=SEC/dilution, etc.)
- Blind first round (agents produce positions before seeing others)
- Abolish consensus: output disagreement distribution, not binary
- Soft Bayesian priors: "P(up)=0.60, update if evidence warrants"
- Per-agent temperature: Bull 0.9, Bear 0.3, Macro 0.5, Flow 0.4, Historian 0.7
- Devil's advocate rotation (random agent steelmans opposite)
- Prediction market scoring (track records weight influence)
- Model diversity: mix qwen3+gemma3+phi4 across agents
- Structured argumentation: Dung-style attack/support graph with grounded extension
- DCI deliberation: typed epistemic acts (PROPOSE, CHALLENGE, SUPPORT, QUALIFY, CONCEDE, REFRAME)
- Memory isolation per agent
**Papers:**
- Sycophancy kills debate: arXiv:2509.23055 (Yao et al. 2025)
- Debate triggers sycophancy: arXiv:2604.21564 (Nogueira et al. 2025)
- DoT: arXiv:2305.19118 (Liang et al. 2023)
- MoA: arXiv:2406.04692 (Wang et al. 2024)
- Irving debate: arXiv:1805.00899 (Irving et al. 2018)
- DCI: arXiv:2603.11781 (Prakash 2025)
- MACI: arXiv:2510.04488 (Chang & Chang 2025)

---

### Phase 2: Portfolio Analysis & Trade Execution

**Trigger:** User asked for concrete trades to maximize by June 21 (44 days).

**Method:** 3 parallel agents — quant signals, market research, portfolio math.

**Quant Signals (from existing pipeline):**
- LightGBM STRONG_BUY: NXPI (#1, ensemble 0.720, +4.93%), MU (#2, 0.717, +10.48%), QBTS (#3, 0.694, +5.02%)
- Multi-signal convergence: NXPI (LightGBM+PEAD), MU (LightGBM+Minervini), GOOG (Minervini 9.1+PEAD+Technical BUY)
- Sector rotation: Tech +19.44% (dominating 5x second place)
- Dead weight identified: HON (ensemble 0.326, pred -0.25%), MSFT (0.371, +0.07%), SGOV (0 growth)

**Market Research:**
- RGTI earnings May 11 (±17.5% expected), QBTS earnings May 12 (±13.5%), NVDA earnings May 20
- GTC Taipei Jun 1-4, FOMC Jun 16-17, D-Wave Qubits Europe Jun 18
- HON: Quantinuum IPO filed + Aerospace spin-off late June (catalyst the model doesn't capture)
- S&P at ATH (~7,337), bullish regime, Iran/Strait of Hormuz tail risk
- SOUN rallied 47% in past month, 6/6 analysts Buy, $14.63 target

**Portfolio Math:**
- $100K target unreachable (need 25.35x = +11%/day for 31 trading days)
- Concentration math: fewer positions = higher ceiling (95th pctile with 1 position = +53%, with 10 = +17%)
- Kelly fraction > 1 on backtest stats = go 100% in
- Current portfolio expected ~$4,332; concentrated expected ~$5,377 (median)
- Dead weight: MSFT+HON = 16.3% of portfolio, model predicts near-zero returns

**Trades Executed:**
- Sold: SGOV, QQQ, MSFT, CEG, HON, most of GOOG
- Bought: QBTS (to 25%), MU (new, 17.2%)
- Remaining: ~$263 deployable

**Error:** Buy table exceeded sell proceeds by $509. Caught by user. Saved feedback memory.

---

### Phase 3: Goodfire/SAE Research (In Progress)

**Trigger:** User shared Goodfire AI tweet about mechanistic interpretability / feature steering.

**Method:** 3 parallel agents researching SAE + EC integration, feature steering for beliefs, practical implementation.

**Core thesis being explored:**
1. Feature-level memory instead of text-level memory
2. Feature steering for genuine agent diversity (solving 4-1 splits)
3. Tension as feature divergence (mechanistic contradiction detection)
4. SAE-guided sleep consolidation
5. Memory as activation modification (no extra prompt tokens)
6. Hallucination detection via feature inspection

**Agents still running as of this log entry.**

---

## Methodology Notes

### Multi-Agent Research Protocol
- Launch 3-6 parallel agents with distinct, non-overlapping domains
- Each agent: web search + codebase exploration + synthesis
- Synthesize across agents into unified document
- Save to persistent memory for future conversations
- Maintain this log for provenance

### Signal Generation Pipeline (Daily)
1. `scripts/scan-outperformers.ts` — momentum ranking
2. `scripts/quant/generate_signals.py` — LightGBM ensemble scoring
3. `scripts/quant/screeners.py` — 6 screeners (Minervini, VCP, RSI2, PEAD, sector rotation, breakout)
4. Multi-signal convergence: 2+ screeners AND LightGBM top-10 = highest conviction
5. Trade engine: Kelly sizing + correlation penalty

### Trust Hierarchy (Established)
1. Multi-signal convergence (2+ screeners + LightGBM top-10) = highest conviction
2. LightGBM STRONG_BUY alone = tradeable
3. Single screener pass = watchlist only
4. LLM debate consensus = narrative color, not a trading signal
5. Skip any ticker with fraud/promotion red flags

### Architecture Files (Key)
- Memory: src/lib/memory/ (schema.sql, types.ts, weights.ts, db.ts, traverse.ts, update.ts, sleep.ts, reconsolidation.ts, dopamine.ts)
- Debate: src/lib/agent-debate.ts, src/lib/local-debate.ts, src/lib/local-inference.ts
- Quant: scripts/quant/ (extract_features.py, train_model.py, backtest.py, generate_signals.py, screeners.py)
- Trade: src/lib/trade-engine.ts, src/lib/backtester.ts
- Data: src/data/memory-graph.sqlite, src/data/market-data.sqlite, models/stock_classifier.pkl

---

### Phase 3 Results: Goodfire/SAE Research (3 Agents)

**Agent 3A: Practical SAE Implementation — COMPLETED**

**GAME-CHANGER: Qwen-Scope released May 1, 2026** — pre-trained SAEs for entire Qwen3/3.5 family. No training from scratch needed.

**Available Qwen-Scope SAE checkpoints:**
- Dense: Qwen3-1.7B, Qwen3-8B, Qwen3.5-2B, Qwen3.5-9B, Qwen3.5-27B
- MoE: Qwen3-30B-A3B, Qwen3.5-35B-A3B
- **Qwen3-14B NOT included** — use Qwen3-8B or Qwen3.5-9B instead
- 16x expansion factor, TopK sparsity (k=50 or k=100), trained on 0.5B tokens
- Weights on HuggingFace under `Qwen/` org

**Critical architecture decision: Use Qwen3-8B (not 14B) to get free pre-trained SAEs.**

**Open-source SAE tools:**
- SAELens (decoderesearch) — training + inference, large pre-trained library
- Language-Model-SAEs (OpenMOSS) — Qwen3 family explicitly supported
- nnsight — activation patching/extraction for any PyTorch model
- EleutherAI/sparsify — K-sparse SAEs + transcoders
- IBM/sae-steering — SAE-based steering examples
- EasySteer (ZJU-REAL) — 5.5-11.4x faster steering
- Goodfire SAEs — pre-trained for Llama 3.1 8B (layer 19), Llama 3.3 70B (layer 50)

**Activation extraction path:**
- Ollama: DEAD END — cannot expose activations, no hook mechanism
- llama.cpp: Possible but C++ level, not practical
- **MLX: THE PRACTICAL PATH** — pure Python, can modify forward pass, native Qwen support
- HuggingFace + PyTorch MPS: viable but 20-87% slower than MLX, 4GB tensor cap
- nnsight: best for research-grade extraction, wraps PyTorch

**Compute on M5 Max 128GB:**
- Qwen3-8B Q4 via MLX: ~5 GB model + ~1 GB SAE (1 layer) = ~6 GB, 60-90 GB headroom
- Sparse feature vector: 400 bytes/token (k=50 indices + values) — orders of magnitude cheaper than text embeddings
- SAE encode: <0.1 ms per token (single matrix multiply)
- CAA steering: ZERO inference overhead (equivalent to bias addition)
- End-to-end per debate turn: ~12-30 sec (dominated by generation, not SAE)

**4-week implementation plan:**
- Week 1: Download Qwen3-8B + Qwen-Scope SAEs, write MLX activation hooks, verify
- Week 2: Compute contrastive steering vectors per agent, test alpha ranges
- Week 3: Feature-based memory retrieval, compare vs text-embedding retrieval
- Week 4: Replace Ollama calls with MLX for SAE-enabled agents, tune steering

**Key constraint: Must use MLX, not Ollama, for any SAE work. This means a parallel inference path.**

**Sources:**
- Qwen-Scope: qwen.ai/blog?id=qwen-scope, marktechpost.com/2026/05/01/qwen-scope
- SAELens: github.com/decoderesearch/SAELens
- Language-Model-SAEs: github.com/OpenMOSS/Language-Model-SAEs
- nnsight: nnsight.net
- Goodfire SAEs: huggingface.co/Goodfire/Llama-3.1-8B-Instruct-SAE-l19
- CAA: arxiv.org/abs/2312.06681
- EasySteer: github.com/ZJU-REAL/EasySteer
- MLX: ml-explore.github.io/mlx, github.com/ml-explore/mlx-lm
- Qwen-Scope HF: huggingface.co/Qwen/SAE-Res-Qwen3.5-27B-W80K-L0_50

**Agent 3B: Feature Steering for Beliefs — COMPLETED**

**Core finding: Steering vectors WILL fix the 4-1 split.** Sentiment shift is in the "reliably steerable" category.

**Belief representation in LLMs:**
- "Geometry of Truth" (Marks & Tegmark): LLMs develop linear truth direction separating true/false
- Same model = same truth direction = explains why same-model agents always agree
- "Truth as a Trajectory" (Mar 2026): layer-wise displacements reveal valid vs spurious reasoning
- PING framework: linear probes on hidden states reduce ECE by up to 96%
- Confidence features exist and can be measured without relying on text output

**Competing circuits (Anthropic circuit tracing):**
- Models have simultaneous competing clusters (compliance vs refusal)
- "Entity recognition" features compete with "can't answer" features — hallucination = failed suppression
- Risk circuits have precautionary baseline (bearish naturally dominates = explains 4/5 agents going down)
- Medical diagnosis: alternative hypotheses activate in parallel, not sequentially

**Steering vectors — practical field guide:**
- Works on M4 Pro 48GB (confirmed), M5 Max 128GB is more than sufficient
- Layer selection: ~75% depth (layer 24 of 32 for Qwen3-8B)
- Alpha ranges: sentiment 0.5-2.0, uncertainty 0.5-1.5, refusal 1.5-4.0
- **Effects fade after 300-500 tokens** — concern for debate format (~500-1000 tokens)
- Multi-vector stacking: inject different vectors at different layers to avoid interference
- Overhead: ZERO per token (one vector addition per decoding step)
- Tools: IBM activation-steering (supports Qwen, ICLR 2025), EasySteer (5.5-11.4x faster)

**Proposed EC v2 architecture:**
1. Phase 1: Replace AGENT_PRIORS with steering vectors (1-2 weeks)
2. Phase 2: Add confidence_gap (stated vs internal) to memory nodes (2-4 weeks)
3. Phase 3: SAE-based contradiction detection (4-6 weeks) — but may underperform embedding cosine
4. Phase 4: Tuned-lens commitment detection (exploratory)

**The real win = hybrid:** Text memory for factual content (what happened) + activation steering for dispositional content (how to feel about it). Neither mechanism achieves this alone.

**Honest caveats:**
- Neel Nanda (Sep 2025): "ambitious vision of mech interp is probably dead"
- Google DeepMind: SAEs underperform simple linear probes on practical tasks
- Attribution graphs trace paths for only ~25% of prompts
- SAE reconstruction errors cause 10-40% performance degradation
- BUT: steering (not reconstruction) has much lower error requirements

**Sources:**
- Geometry of Truth: arXiv:2310.06824
- Truth as Trajectory: arXiv:2603.01326
- Representation Engineering: arXiv:2310.01405
- Anthropic circuit tracing: transformer-circuits.pub/2025/attribution-graphs/biology.html
- ActivationReasoning (ICLR 2026): arXiv:2510.18184
- Steering field guide: subhadipmitra.com/blog/2026/activation-steering-field-guide/
- LAP (predicts steering effectiveness): arXiv:2604.15557
- PING framework: medrxiv.org/content/10.1101/2025.09.17.25336018v2
- IBM activation-steering: github.com/IBM/activation-steering
- EasySteer: github.com/ZJU-REAL/EasySteer

**Agent 3C: SAE + Memory Architecture Integration — COMPLETED**

**7 integration points analyzed. 3 implementable now, 2 need upstream tooling, 2 speculative but sound.**

**1. Feature-Level Memory:**
- Store SAE feature vectors alongside text nodes (schema: feature_vector BLOB, feature_top_k TEXT, feature_layer INT)
- Top-100 sparse features = ~1.2KB/node (4x text, trivial increase)
- Contradiction detection: cosine distance + feature opposition + feature novelty
- BLOCKED on activation extraction — requires Python sidecar, not Ollama

**2. Feature Steering for Diversity (HIGHEST PRIORITY — IMPLEMENTABLE NOW):**
- CAA (Contrastive Activation Addition): no SAE training needed for v1
- Run contrastive prompts ("market going up" vs "market going down"), take activation difference = steering vector
- Apply: h' = h + alpha * steering_vector at layer ~20 of qwen3:14b
- Cost: single tensor addition = negligible overhead
- Proposed profiles: Bull (boost opportunity, suppress risk), Bear (boost risk, suppress opportunity), etc.
- Contrastive SAE persona paper (arXiv:2602.19157): SAE+Prompt > prompt-only or raw activation addition
- Feature steering > LoRA: no training, no storage, instant switching, interpretable

**3. Tension as Feature Divergence:**
- Decompose into MECHANICAL tension (different feature sets = blind spot) vs SURFACE tension (same features, different magnitudes = emphasis difference)
- Proposed weights: gamma_m=0.4 (mechanical), gamma_s=0.1 (surface)
- Prioritizes genuinely novel disagreements over rehearsed ones
- Requires feature-level memory (Section 1)

**4. SAE-Guided Sleep:**
- SWS: feature-based merging (cosine > 0.85 = merge, regardless of text)
- REM: counterfactual dreaming — perturb feature vectors (suppress 20%, boost 10% novel), generate text, create contradiction edges if it disagrees
- Echo chamber detection: if top-10 features cover >80% of nodes = echo chamber
- Requires feature-level memory

**5. Hallucination Detection:**
- Monitor grounding vs confabulation feature activation during generation
- ratio = grounding_score / confabulation_score; ratio < 1.0 = likely hallucinating
- Extend RPE with feature attribution: "wrong BECAUSE features X and Y dominated"
- Simplified version possible NOW with embedding similarity (Ollama /api/embed)

**6. Python Sidecar Architecture (THE IMPLEMENTATION PATH):**
```
[TypeScript Debate System]
    ├── Ollama (fast text generation) ← keep existing
    └── Python Sidecar (features + steering) ← add this
         ├── HuggingFace Transformers (model + hidden states)
         ├── eai-sparsify or Qwen-Scope (SAE)
         └── Feature store (same SQLite DB)
```
- Zero disruption to existing pipeline — sidecar is additive
- Each debate turn: Ollama generates text, Python extracts features in parallel
- Monitor llama.cpp PRs #14891 and #22728 for native activation access

**7. Neuroscience Mapping:**
- SAE features = neural ensembles
- Feature steering = neuromodulation (Bull=dopaminergic, Bear=noradrenergic, Macro=cholinergic, Flow=serotonergic, Historian=cortisol)
- CLS maps naturally: text nodes = hippocampal episodic traces, feature vectors = neocortical distributed representations
- Sleep consolidation: compare feature vectors to neocortical prototype, keep novel features, merge redundant

**Implementation priority:**
1. CAA steering for agent diversity (NOW — Python sidecar + contrastive pairs)
2. Feature-level memory storage (2-4 weeks — train/download SAE + sidecar)
3. Tension as feature divergence (after #2)
4. Hallucination detection (partial now with embeddings)
5. SAE-guided sleep (after #2)
6. RPE feature attribution (after #2)
7. CLS dual memory (after #2 + #5)

**Key tools:**
- eai-sparsify (EleutherAI): `pip install eai-sparsify`, any HuggingFace model
- Qwen-Scope: pre-trained SAEs for Qwen3-8B (not 14B — closest available)
- IBM activation-steering: supports Qwen, ICLR 2025, quick-start 10-60 min
- nnsight: full hook access for any PyTorch model
- CAA reference: github.com/nrimsky/CAA

**Sources:**
- Contrastive SAE personas: arXiv:2602.19157
- eai-sparsify: github.com/EleutherAI/sparsify
- Goodfire Features as Rewards: goodfire.ai/blog (Feb 2026)
- SAE Feature Steering: arXiv:2508.12535 (CorrSteer)
- SAE-TS: github.com/slavachalnev/SAE-TS
