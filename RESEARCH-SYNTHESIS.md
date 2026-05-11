# Research Synthesis: Memory Architectures, Compute Efficiency, and Alternative Models
## 6-Agent Deep Research — 2026-05-08

---

## Executive Summary

Six parallel research agents investigated how to improve the Entrenched Coils system across memory architectures, compute efficiency, alternative ML models, neuroscience-inspired mechanisms, benchmarking frameworks, and multi-agent disagreement. Key findings:

1. **Entrenched Coils' contradiction-as-retrieval is genuinely novel** — no production system (Zep, Mem0, Letta, MAGMA, CrewAI) uses disagreement as a primary retrieval signal. Others detect contradictions to *resolve* them; EC *preserves* them.

2. **The +63.8% backtest may be overfit** — must validate with CPCV, transaction costs, survivorship bias check, and FF5+momentum regression before trusting.

3. **130x compute speedup is achievable** — Qwen3.5-35B-A3B MoE + MLX backend + multi-perspective prompting reduces debate from ~2 hours to ~36 seconds.

4. **Information asymmetry is the only reliable fix for debate theater** — same-model debates produce identical 4-1 splits because agents share base distributions. Give each agent different data.

5. **The tension-vs-flat comparison is dramatically underpowered** — n=20 cannot detect the observed effect size (d=0.29). Need n=500+ for significance.

6. **Neuroscience offers 15 implementable mechanisms** — top picks: retrieval-induced forgetting, EWC-selective downscaling, FSRS scheduling, regime-gated memory, CLS dual-store.

---

## Part 1: What to Fix First (Validation)

### CRITICAL: Validate the +63.8% Before Anything Else

The backtest result is the foundation of the entire system. If it's overfit, nothing else matters.

| Validation Step | Why | How | Expected Finding |
|----------------|-----|-----|-----------------|
| **CPCV** | Walk-forward can overfit; CPCV generates hundreds of train-test paths | `skfolio.model_selection.CombinatorialPurgedCV` or `mlfinlab` | If PBO > 0.5, strategy is more likely overfit than real |
| **Transaction costs** | Top-2 weekly rotation = ~100 trades/6mo. At 0.5% round-trip = 50% drag on $4K | Add 0.25% slippage each way, 1% for ADV < $5M | Returns likely drop 15-30% |
| **Survivorship bias** | 163 tickers selected from current market = lookahead | Verify universe uses point-in-time membership | Inflates returns by ~5% annually |
| **FF5+momentum** | Is there genuine alpha or just factor exposure? | Regress portfolio returns against Ken French factors | If alpha (intercept) not significant, it's levered beta |
| **Deflated Sharpe** | Tested 20+ parameter combos = multiple comparison problem | Bailey & Lopez de Prado DSR formula | Effective Sharpe likely 40-60% lower |

### Power Up the Benchmarks

The tension-vs-flat comparison (p=0.256, n=20) is **dramatically underpowered**:

| Comparison | Observed delta | Required n (80% power) |
|------------|---------------|----------------------|
| Tension vs No-Memory | 0.023 | 54 |
| **Tension vs Flat** | **0.010** | **502** |
| Tension vs Random | ~0.030 est. | 43 |
| Tension vs Cosine | unknown | Need pilot |

**Action:** Expand stock prediction rounds from 20 to 200+ minimum. Add cosine-similarity and random baselines.

---

## Part 2: Compute Efficiency (130x Speedup)

### Immediate Wins (30 minutes of work)

```bash
# Enable MLX backend (57-93% faster on Apple Silicon)
echo 'export OLLAMA_USE_MLX=1' >> ~/.zshrc

# Prevent model eviction between calls
echo 'export OLLAMA_KEEP_ALIVE=-1' >> ~/.zshrc

# Enable flash attention for long contexts
echo 'export OLLAMA_FLASH_ATTENTION=1' >> ~/.zshrc

# Cut KV cache memory by 50%
echo 'export OLLAMA_KV_CACHE_TYPE=q8_0' >> ~/.zshrc

source ~/.zshrc

# Pull the MoE model (3B active params, 35B total, 70-80 tok/s on MLX)
ollama pull qwen3.5:35b-a3b
```

### Model Selection: The MoE Game-Changer

| Model | Active Params | Speed (MLX, M5 Max) | Quality |
|-------|--------------|---------------------|---------|
| qwen3:32b Q4_K_M | 32B | ~40 tok/s | Baseline |
| **Qwen3.5-35B-A3B** | **3B active** | **70-80 tok/s** | **Comparable or better** |
| qwen3:14b Q4_K_M | 14B | ~60 tok/s | 85-90% of 32b |

MoE routing overhead is nearly free on Apple Silicon unified memory — no PCIe transfer for expert selection.

### Architecture: 36 Calls → 5-6 Calls

| Change | Savings |
|--------|---------|
| **Multi-perspective prompting** (5 agents → 1 call per round) | 4x fewer calls |
| **Early termination** (4/5 supermajority = stop) | Skip 1-2 rounds |
| **Eliminate moderator interludes** (generate post-hoc) | 3 fewer calls |
| **Merge scorecards** into single post-debate call | 1 fewer call |

**Combined: 26 calls × 3-5 min → 5-6 calls × ~6 sec = ~36 seconds**

Research backing:
- **Latent Agents (arXiv:2604.24881):** Single model internalizing multi-agent perspectives matches explicit multi-agent using 93% fewer tokens
- **S2-MAD (NAACL 2025):** 94.5% token reduction with <2% quality loss
- **ICLR 2025:** "Single-agent systems match or outperform multi-agent systems on multi-hop reasoning" when computation is normalized

### Pipeline Optimization

```
16:01  Market close → close snapshot (CPU, 1 min)
16:02  After-hours scan (CPU, 5 min)
16:02  Sleep cycle (CPU, 2 min)          ← PARALLEL, no GPU contention
16:02  Evening debate (GPU, <1 min)      ← PARALLEL with sleep
16:03  Overnight batch (CPU, 5 min)
16:08  Done. GPU idle for 24 hours.
```

---

## Part 3: Fix Multi-Agent Disagreement

### Why Same-Model Debates Fail

The 4-1 split is deterministic theater. Root causes identified by research:

1. **Shared prior problem** — same model = same base distribution. Prompts shift the mean, not the shape. (Du et al. 2023)
2. **Sycophancy amplifies collapse** — "debate triggers sycophancy 2-3x more than direct questioning" (Nogueira et al. 2025). Sycophancy-afflicted debates yield *lower accuracy than single-agent baselines* (Yao et al. 2025)
3. **Degeneration-of-Thought** — once an LLM commits, it cannot generate novel thoughts through reflection (Liang et al. 2023)
4. **Rigid priors block updating** — "MUST find the strongest case for up" literally tells agents to ignore evidence
5. **No information asymmetry** — violates all 4 conditions for wisdom-of-crowds (independence, diversity, decentralization, aggregation)

### Protocols Ranked by Impact

| Priority | Protocol | Compute Cost | Expected Impact |
|----------|----------|-------------|-----------------|
| **1** | **Information asymmetry** — each agent sees different data slices | Zero | HIGH |
| **2** | **Abolish consensus** — output disagreement distribution, not binary | Zero | HIGH |
| **3** | **Soft Bayesian priors** — "P(up)=0.60, update if evidence warrants" | Zero | HIGH |
| **4** | **Per-agent temperature** — Bull 0.9, Bear 0.3, Macro 0.5, Flow 0.4, Historian 0.7 | Zero | MEDIUM |
| **5** | **Devil's advocate rotation** — random agent steelmans opposite position | Zero | MEDIUM |
| **6** | **Prediction market scoring** — track records weight future influence | Zero | MEDIUM |
| **7** | **Model diversity** — mix qwen3+gemma3+phi4 across agents | 2x time (model swaps) | HIGH |
| **8** | **Structured argumentation** — Dung-style attack/support graph with grounded extension | Low | MEDIUM |

### Information Asymmetry Implementation

```typescript
const AGENT_DATA_SLICES: Record<AgentId, string[]> = {
  bull: ["analyst", "upgrade", "revenue", "growth", "beat"],
  bear: ["SEC", "dilution", "ATM", "short", "offering", "risk"],
  macro: ["Fed", "CPI", "yield", "VIX", "oil", "rate"],
  flow: ["volume", "options", "put/call", "dark pool", "gamma"],
  historian: ["historical", "2000", "2008", "analog", "prior"],
};
// Round 1 MUST be blind — agents produce positions without seeing others
```

### Disagreement Quality Metrics

| Metric | Current Value | Target |
|--------|--------------|--------|
| Jensen-Shannon Divergence | ~0.02 (near-identical) | >0.10 |
| Confidence spread | 0.00 (all at 0.70) | >0.25 |
| Belief revision rate | 0.00 | >0.30 |
| Simpson's Diversity Index | 0.40 (4-1 split) | >0.60 (3-2 splits) |

---

## Part 4: Memory Architecture Upgrades

### Where Entrenched Coils Stands in the Landscape

| System | Contradiction Handling | Retrieval | Unique Strength |
|--------|----------------------|-----------|-----------------|
| **Entrenched Coils** | **Amplifies at retrieval (gamma=0.5)** | Max-heap tension traversal | Anti-echo-chamber |
| Zep/Graphiti | Resolves at write time | Cosine + BM25 + graph | Bitemporal validity |
| MAGMA | Causal graph can represent | Policy-guided 4-graph traversal | Intent-aware query routing |
| Mem0/Mem0g | Resolves at write time | Cosine + optional graph | Production maturity |
| Letta/MemGPT | Agent-directed | Agent tool calls | Self-editing memory |
| A-MEM | None | Keyword + tag + link | Sub-10μs retrieval at 1M notes |
| MemRL | None | Semantic + learned Q-values | RL-optimized retrieval weights |
| SCM (Apr 2026) | None | Sleep-consolidated | Closest to EC's sleep cycles |

**Genuinely novel aspects of EC:**
1. Contradiction as primary retrieval signal — no one else does this
2. Neuroscience-grounded sleep with 3 phases — SCM is closest but EC was first
3. Dopamine RPE feedback loop — similar to MemRL's Q-values but neuroscience-grounded
4. Reconsolidation with lability windows — unique in the landscape

### Top 5 Upgrades (Ranked)

#### 1. Add Vector Embeddings for Seed Finding
**Gap:** Current seed finding uses SQL heuristics (ticker match, identity nodes, unresolved predictions). Cannot find semantically related memories without exact ticker match.

**Fix:** Embed each node at insert time (e.g., `nomic-embed-text` via Ollama, or SQLite-VSS). Use ANN search to find semantic seeds, then feed into existing max-heap tension traversal.

**Result:** Semantic breadth (vector) + structural depth (graph) + contradiction priority (tension).

#### 2. Replace Fixed Coefficients with Learned Weights
**Gap:** The 0.2/0.3/0.5 (temporal/conviction/tension) are hand-tuned.

**Fix:** Use the existing dopamine RPE system as training signal. Track which edge weights led to correct predictions. UCB1 bandit over coefficient space. MemRL's Q-value approach is the academic reference.

#### 3. Add Temporal Validity (from Zep)
**Gap:** No `valid_from`/`invalid_at` on nodes. Old predictions that were superseded still float around.

**Fix:** Schema change: `valid_from TEXT, invalid_at TEXT`. When a correction node is created, set `invalid_at` on the corrected node.

#### 4. Retrieval-Induced Forgetting (from neuroscience)
**Gap:** Non-retrieved memories sharing the same cue are unaffected, leading to redundancy.

**Fix:** After retrieval, suppress competing same-ticker same-direction nodes by `0.93^k` per similar retrieved node. Preserves contradictions (different direction = no suppression), reduces redundancy.

#### 5. EWC-Selective Downscaling (replace uniform 0.85x)
**Gap:** Important edges are downscaled just as much as noise.

**Fix:** Compute importance per edge (traversal count × weight × accuracy bonus). Important edges resist downscaling via sigmoid protection function. Result: proven signal is near-immune to sleep decay, noise gets full 0.85x.

---

## Part 5: Neuroscience-Inspired Mechanisms

### Priority-Ordered Implementation

| # | Mechanism | Effort | Impact | Source |
|---|-----------|--------|--------|--------|
| 1 | **Retrieval-Induced Forgetting** | Low | High — reduces noise 30%+ | Anderson et al. 1994 |
| 2 | **EWC-Selective Downscaling** | Low | Medium — preserves signal | Kirkpatrick et al. 2017 |
| 3 | **FSRS Scheduling** | Medium | High — optimal retrieval intervals | Wozniak DSR model |
| 4 | **Regime-Gated Forgetting** | Medium | High — faster regime adaptation | Tulving & Thomson 1973 |
| 5 | **Compressed Sequence Replay** | Medium | Medium — preserves reasoning chains | Wilson & McNaughton 1994 |
| 6 | **Active Memory Suppression** | Low | Medium — eliminates toxic memories | Anderson & Green 2001 |
| 7 | **REM Threat Simulation** | Medium | Medium — earlier risk detection | Revonsuo 2000 |
| 8 | **CLS Dual-Store** | High | High — enables generalization | McClelland et al. 1995 |
| 9 | **Episodic→Semantic Transformation** | High | High — creates reusable knowledge | Trace Transformation Theory |
| 10 | **Global Workspace Broadcast** | Medium | Medium — inter-agent learning | Baars 1988 |
| 11 | **ACT-R Power-Law Decay** | Medium | Medium — better than exponential | Anderson |
| 12 | **Free Energy Hybrid Metric** | High | Uncertain | Friston 2009 |
| 13 | **Targeted Memory Reactivation** | Low | Low-Medium | Rasch et al. 2007 |

### Key Mechanisms Explained

**CLS Dual-Store:** Separate hippocampal buffer (fast, sparse, specific episodes) from neocortical schemas (slow, distributed, abstract patterns). Sleep replays episodes to gradually train schemas. Enables transfer: "quantum stocks respond to earnings beats" applies to unseen quantum tickers.

**FSRS Scheduling:** Replace fixed decay with stability/retrievability/difficulty tracking per node. Memories near forgetting threshold (R=0.5-0.85) get priority retrieval. Spaced retrievals grow stability exponentially. Power-law decay (ACT-R) empirically better than current exponential.

**Regime-Gated Forgetting:** Tag memories with market regime at encoding time. Memories from opposite regimes get 0.85x suppression (not deletion). Context shift doubles decay rates for old-regime memories. Enables faster adaptation when bull→bear transitions.

**Threat Simulation (REM):** During REM phase, find high-confidence bullish predictions with existing bearish contradictions. Generate "dream" nodes: "THREAT: IONQ position reversal if dilution materializes." Include in morning briefing as RISK ALERT.

---

## Part 6: Alternative ML Models

### What to Test (Prioritized)

#### Tier 1: Do Immediately (validates existing results)
1. **CPCV validation** — verify +63.8% isn't overfit
2. **Transaction cost modeling** — add realistic slippage
3. **Survivorship bias check** — verify no lookahead in ticker universe
4. **FF5+momentum regression** — genuine alpha or factor exposure?
5. **Elastic net feature selection** — which of 50 features are noise?

#### Tier 2: High Expected Improvement
6. **Conformal prediction** — calibrated uncertainty intervals for position sizing. "90% CI: IONQ +2% to +15%" → narrow CI = larger Kelly fraction
7. **Integrate SUE/earnings momentum** — new LightGBM feature from Yahoo data
8. **Wire in short squeeze score** — already coded in `advanced-factors.ts`, just not used
9. **Stack LightGBM + XGBoost + CatBoost** — 10-15% accuracy improvement per literature
10. **HMM regime detection** — replace rule-based with 3-state Gaussian HMM

#### Tier 3: Promising, Higher Effort
11. **Kronos** (AAAI 2026) — foundation model pre-trained on 12B K-line records from 45 exchanges. Purpose-built for OHLCV. Test zero-shot vs LightGBM.
12. **Temporal Fusion Transformer** — simultaneous 1d/5d/20d with interpretability. PyTorch Forecasting library.
13. **LLM-generated alpha formulas** — convert debate engine from qualitative noise to quantitative feature engineering: `rank(close/sma_20) * rank(volume_ratio)`
14. **FinBERT on SEC filings** — sentiment feature from existing EDGAR scraper
15. **MambaStock** — linear-scaling sequence model, handles 163 tickers efficiently

#### Tier 4: Long-Term
16. **RL portfolio allocation (PPO)** — replace top-2 rotation with learned policy
17. **N-BEATS feature extraction** — temporal features feeding LightGBM
18. **Mamba as memory replacement** — learned vs explicit tension graph

### Models NOT Worth Switching To
- **XGBoost/CatBoost** — marginal gains over LightGBM, not worth the migration
- **TabNet** — "wide distributions with negative medians," unstable
- **TimesFM** — univariate only, can't model cross-feature dependencies
- **Standalone LSTM/GRU** — surpassed by TFT and Mamba architectures

---

## Part 7: Benchmarking Framework

### Memory A/B Testing Protocol

**5 conditions, same model, same prompts, only retrieval varies:**

| Condition | Description |
|-----------|-------------|
| tension_graph | Current max-heap traversal (gamma=0.5) |
| cosine_similarity | Embed with nomic-embed-text, top-k by cosine |
| recency_only | Most recent N nodes |
| random | `ORDER BY RANDOM() LIMIT N` |
| no_memory | No context injected |

**Metrics per condition:**

| Metric | Formula | Interpretation |
|--------|---------|----------------|
| Brier Score | (confidence - outcome)^2 | Overall calibration |
| Log Loss | -[y×log(p) + (1-y)×log(1-p)] | Penalizes confident wrong |
| ECE | avg |bin_accuracy - bin_confidence| | Calibration quality |
| Sharpness | variance of predicted probabilities | Decisiveness |
| AUC-ROC | Area under ROC curve | Discrimination |

### Trading Signal Quality

| Metric | What It Tells You |
|--------|-------------------|
| **Information Coefficient (IC)** | Spearman rank correlation: signals vs actual returns. IC=0.05 is good. |
| **Information Ratio (IR)** | IC / std(IC). Consistency of signal. |
| **Hit rate by signal strength** | STRONG_BUY should be >65%, HOLD ~50% |
| **Deflated Sharpe Ratio** | Adjusts for multiple testing. DSR = (SR - SR_bench) / sigma_SR × PSR_correction |
| **Memory value-add** | IC_combined vs IC_lightgbm_alone. If IC_combined <= IC_lgbm, debate adds noise. |

### Disagreement Quality Metrics

```
JSD = Jensen-Shannon Divergence across 5 agent distributions (0 = identical, >0.1 = meaningful)
Belief Update = |confidence_round_N - confidence_round_N-1| (currently 0.00)
Simpson's D = 1 - sum(n_i(n_i-1)) / (N(N-1)) (0.4 for 4-1, 0.6 for 3-2)
Unique Claim Ratio = |semantically_distinct_claims| / |total_claims|
```

### Statistical Rigor Requirements

- **Bootstrap CI** for all metrics (10,000 resamples)
- **Benjamini-Hochberg FDR** for multiple comparisons (10 pairwise tests = BH, not Bonferroni)
- **Cohen's d** alongside p-values (current tension-vs-flat: d=0.29, small effect)
- **Pre-registration** in `benchmark-results/preregistrations/` before running experiments

### External Benchmarks to Run

| Benchmark | Why | Priority |
|-----------|-----|----------|
| **MemoryAgentBench** (ICLR 2026) | Conflict resolution competency directly tests tension-graph | P0 |
| **LongMemEval** (ICLR 2025) | Knowledge update questions map to contradicts/corrects edges | P0 |
| **FinBen** (NeurIPS 2024) | 42 datasets, stock trading tasks — baseline model capability | P1 |
| **ForecastBench** | Prediction calibration benchmark | P1 |
| **LoCoMo** | Multi-hop retrieval across conversations | P2 |

---

## Part 8: Implementation Roadmap

### Week 1: Validate + Quick Wins (Zero Compute Cost)
- [ ] Run CPCV on backtest
- [ ] Add transaction costs to backtest
- [ ] Check survivorship bias in ticker universe
- [ ] Enable MLX + pull Qwen3.5-35B-A3B
- [ ] Set OLLAMA_KEEP_ALIVE=-1, FLASH_ATTENTION=1, KV_CACHE_TYPE=q8_0
- [ ] Implement information asymmetry (agent data slices)
- [ ] Replace rigid priors with soft Bayesian priors
- [ ] Add per-agent temperature/sampling params

### Week 2: Memory + Debate Fixes
- [ ] Implement retrieval-induced forgetting
- [ ] Replace uniform downscaling with EWC-selective
- [ ] Add temporal validity columns (valid_from, invalid_at)
- [ ] Add JSD + belief update + Simpson's D to debate output
- [ ] Implement early termination (4/5 supermajority)
- [ ] Eliminate moderator interlude calls
- [ ] Expand benchmark to n=200+ with cosine + random baselines

### Week 3: Signal Quality
- [ ] Compute IC and IR for LightGBM signals
- [ ] Wire in short squeeze score as LightGBM feature
- [ ] Add SUE/earnings momentum feature
- [ ] Implement conformal prediction intervals
- [ ] Run FF5+momentum regression
- [ ] Apply Deflated Sharpe Ratio

### Week 4: Architecture
- [ ] Implement multi-perspective single-call debate
- [ ] Add vector embeddings for memory seed finding (SQLite-VSS or Chroma)
- [ ] Implement FSRS scheduling for memory retrieval
- [ ] Add regime-gated forgetting
- [ ] Run against MemoryAgentBench and LongMemEval
- [ ] Stack LightGBM + XGBoost + CatBoost

### Week 5+: Research
- [ ] Test Kronos zero-shot vs LightGBM
- [ ] Implement CLS dual-store architecture
- [ ] Try TFT for multi-horizon forecasting
- [ ] Implement threat simulation in REM phase
- [ ] LLM-generated alpha formula experiments
- [ ] HMM regime detection

---

## Key Sources

### Memory Architectures
- [Zep/Graphiti — Temporal Knowledge Graph (arXiv:2501.13956)](https://arxiv.org/abs/2501.13956)
- [MAGMA — Multi-Graph Agentic Memory (arXiv:2601.03236)](https://arxiv.org/abs/2601.03236)
- [MemRL — Self-Evolving via Runtime RL (arXiv:2601.03192)](https://arxiv.org/abs/2601.03192)
- [SCM — Sleep-Consolidated Memory (arXiv:2604.20943)](https://arxiv.org/abs/2604.20943)
- [A-MEM — Zettelkasten-Inspired (arXiv:2502.12110)](https://arxiv.org/abs/2502.12110)
- [GAM — Hierarchical Graph Memory (arXiv:2604.12285)](https://arxiv.org/abs/2604.12285)
- [Memory in the Age of AI Agents Survey (arXiv:2512.13564)](https://arxiv.org/abs/2512.13564)

### Neuroscience
- [CLS Theory Updated (Kumaran et al. 2016)](https://www.cell.com/trends/cognitive-sciences/abstract/S1364-6613(16)30043-2)
- [FSRS Algorithm](https://github.com/open-spaced-repetition/free-spaced-repetition-scheduler)
- [EWC — Overcoming Catastrophic Forgetting (PNAS 2017)](https://www.pnas.org/doi/10.1073/pnas.1611835114)
- [Retrieval-Induced Forgetting (Wimber et al. 2015)](https://pmc.ncbi.nlm.nih.gov/articles/PMC4394359/)
- [SleepGate — Learned Gating (arXiv:2603.14517)](https://arxiv.org/html/2603.14517)

### Compute
- [Ollama MLX Backend](https://ollama.com/blog/mlx)
- [Latent Agents — 93% Token Reduction (arXiv:2604.24881)](https://arxiv.org/abs/2604.24881)
- [S2-MAD — 94.5% Token Reduction (NAACL 2025)](https://aclanthology.org/2025.naacl-long.475/)
- [Apple MLX + M5 Research](https://machinelearning.apple.com/research/exploring-llms-mlx-m5)

### Multi-Agent Disagreement
- [Sycophancy as Core Debate Failure (arXiv:2509.23055)](https://arxiv.org/abs/2509.23055)
- [Debate Triggers 2-3x More Sycophancy (arXiv:2604.21564)](https://arxiv.org/abs/2604.21564)
- [Mixture of Agents (arXiv:2406.04692)](https://arxiv.org/abs/2406.04692)
- [Degeneration-of-Thought (arXiv:2305.19118)](https://arxiv.org/abs/2305.19118)

### Alternative Models
- [Kronos — Financial OHLCV Foundation Model (AAAI 2026)](https://arxiv.org/abs/2508.02739)
- [FinCast — Financial Time Series Foundation Model](https://arxiv.org/abs/2508.19609)
- [Conformal Prediction for Stock Selection (PMLR 2025)](https://proceedings.mlr.press/v266/kaya25a.html)
- [LLM-Generated Formulaic Alpha (arXiv:2508.04975)](https://arxiv.org/html/2508.04975v1)

### Benchmarks
- [MemoryAgentBench (ICLR 2026)](https://github.com/HUST-AI-HYZ/MemoryAgentBench)
- [LongMemEval (ICLR 2025)](https://arxiv.org/abs/2410.10813)
- [FinBen (NeurIPS 2024)](https://arxiv.org/abs/2402.12659)
- [Probability of Backtest Overfitting (Bailey)](https://www.davidhbailey.com/dhbpapers/backtest-prob.pdf)
- [CPCV Methodology](https://towardsai.net/p/l/the-combinatorial-purged-cross-validation-method)
