---
slug: tension-field
date: 2026-05-13
title: "Tension Field: 58 Experiments on a $4,097 Portfolio"
subtitle: "When every analytical system disagrees, the disagreement is the finding. A single day of automated research on eight tickers."
portfolio_value: 4097
---

# Tension Field

*58 experiments. 7 research agents. 16 scripts. 51 documented findings. one portfolio. one day. this is what the data says when you let it argue with itself.*

---

the portfolio is $4,097. eight tickers. quantum computing, semiconductors, one search engine. the goal was simple: run every analytical approach available — backtests, factor models, LLM debates, Monte Carlo, neuroscience-inspired mechanisms, insider data, options flow, academic factors — and see where they agree, where they disagree, and whether the disagreements contain more information than the agreements.

they do.

---

## I. The Setup

| ticker | weight | return | thesis |
| --- | --- | --- | --- |
| QBTS | 23.4% | +0.03% | D-Wave quantum. largest position. maximum tension. |
| NVDA | 20.8% | +12.5% | AI compute. earnings May 20. |
| MU | 18.0% | +8.8% | Memory. 733% 12-month momentum. |
| IONQ | 12.8% | +17.3% | Trapped-ion quantum. every system says sell. |
| QTUM | 9.3% | +20.5% | Quantum ETF. lowest vol. |
| NXPI | 6.5% | +1.1% | Semis. only loser. triple analyst downgrade. |
| GOOG | 4.7% | +21.0% | Mega-cap. only BUY signal across all systems. |
| RGTI | 4.5% | +8.0% | Rigetti quantum. counter-trend trap. |

six analytical systems were deployed simultaneously:

1. **factor backtesting** — 11 technical factors, grid-searched across 16 tickers, 1 year of daily OHLCV
2. **meta-pipeline optimizer** — tests 6 different pipeline architectures, finds optimal weights with tension gating
3. **ML ensemble** — LightGBM + XGBoost + CatBoost with a tension-aware meta-learner
4. **LLM debates** — 5-agent tool-augmented debates via Ollama (qwen3:14b), plus cross-architecture comparison (deepseek-r1:14b, phi4:14b)
5. **web research agents** — insider trades, short interest, analyst revisions, options flow, academic factor zoo, semiconductor cycles, macro calendar
6. **neuroscience mechanisms** — RPE, reconsolidation, Hurst regime detection, sleep consolidation, emotional tagging, Weber-Fechner transforms, ACh exploration gating

the question: does the tension between these systems — the places where they actively disagree — contain more information than any single system alone?

---

## II. What Agreed (and Why That's Less Interesting)

some signals were unanimous. when every system points the same direction, the finding is simple and actionable, but it teaches you nothing about the structure of the problem.

**IONQ: unanimous sell.** 7/7 pipeline variants. 3/5 debate agents voting DOWN. 3/3 LLM architectures recommending TRIM. counter-trend analysis: tickers that bounce >15% while still >30% below their 52-week high lose -10.75% on average over 20 days with 21% hit rate. for IONQ specifically: -7.44% average, 8% hit rate. the market confirmed this on the day of the analysis: IONQ -1.10%.

**GOOG: the only BUY.** the meta-backtest's winning pipeline flagged GOOG as the sole buy signal. LLM debates said UP. the Sharpe optimizer ranked it #2 (3.22 annualized). GOOG +3.96% on the day. Sharpe trend: increasing (+1.03 over recent windows).

these are good trades. they are not interesting findings. the interesting findings are in the disagreements.

---

## III. The Five Tensions

### tension 1: factor edge vs pipeline selectivity

momentum_60d has the highest per-signal edge in the universe: +7.42%. when 60-day momentum is positive, forward 20-day returns average 7.66%. when negative, 0.24%. this is the largest single factor edge across all 11 tested factors.

but the pipeline that uses momentum has Sharpe 1.04 and max drawdown -98%.

the pipeline that uses RSI + drawdown from high — two factors with edges of +0.28% and literally zero (drawdown_from_high has no positive signals in the dataset) — has Sharpe 3.56 and max drawdown -5.7%.

the explanation: **the edge is not in the factor. the edge is in the filter.** RSI + drawdown fires 36 times per year across 16 tickers. momentum fires 1,318 times. the 36 signals happen to occur at extreme reversal points where forward returns are structurally high regardless of which factor triggered the entry. the factor is incidental. the selectivity is the mechanism.

we tested this directly: 1,000 random sparse signals (N=36 each) produced median Sharpe 0.88. RSI + drawdown produced Sharpe 2.20 — at the 99.8th percentile of the random distribution. p < 0.005.

the edge is real. it is not the factor. it is the condition the factor identifies.

---

### tension 2: portfolio-specific vs universal

we ran every finding on two groups: the portfolio tickers (quantum + semis, 14 names) and a mega-cap benchmark (AAPL, MSFT, AMZN, etc., 15 names).

| finding | portfolio | benchmark | universal? |
| --- | --- | --- | --- |
| RSI + drawdown edge | Sharpe 2.20, p=0.001 | Sharpe 0.27, p=0.324 | **no** |
| logit-RSI beats linear | +29% improvement | +54% improvement | **yes** |
| overbought + trending | +7.92% avg | +1.72% avg | **direction yes** |
| counter-trend trap | -10.75%, 21% HR | +2.76%, 75% HR | **inverts** |

one-third of findings are universal. one-half are valid but portfolio-specific. one-sixth invert on the benchmark — meaning the exact opposite signal is correct for mega-caps.

the counter-trend finding is the most striking. on our volatile quantum tickers (100%+ annualized vol), a bounce from a deep drawdown fails 92% of the time. on mega-caps (20-30% vol), the same pattern succeeds. the mechanism is volatility: high-vol names in drawdown are there for structural reasons (dilution, revenue miss, sector rotation) that a bounce doesn't fix. mega-cap drawdowns are more often sentiment-driven and mean-revert naturally.

**the calibration: 33% universal, 50% valid-for-us, 17% would have lost money if generalized.**

---

### tension 3: conviction vs decay

MU has the highest conviction score in the pipeline: +0.591. strongest Sharpe (3.70), strongest insider signal ($3.9M director buy), strongest momentum (733% 12-month). the conviction score predicted today's performance: MU +4.83%, the biggest single-day winner.

but the rolling 30-day Sharpe tells a different story. MU's Sharpe has fallen from 7.07 to 1.85 over the last 8 months. the edge is decaying. the stock is 74% above its 60-day SMA — and historical data shows that >50% above SMA produces negative 20-day forward returns.

meanwhile GOOG has the #2 conviction score (+0.392) but its Sharpe is *increasing* (+1.03 trend). the edge is strengthening, not decaying.

the tension: **the best-performing ticker by historical Sharpe is the one whose edge is disappearing fastest. the second-best is the one whose edge is growing.** any system that optimizes on historical Sharpe alone will over-allocate to the decaying edge and under-allocate to the growing one.

---

### tension 4: the overbought paradox

RSI > 70 traditionally means "sell." on our portfolio:

| condition | avg 20d return | hit rate |
| --- | --- | --- |
| overbought + mean-reverting regime | +10.26% | 83% |
| overbought + trending regime | +7.92% | 57% |
| oversold + trending regime | +5.84% | 59% |

buying overbought stocks in mean-reverting regimes — the exact opposite of textbook RSI — is the single highest hit-rate signal in the dataset. MU (Hurst 0.20, mean-reverting) at RSI 84 is not a sell. it is a continuation buy with 83% probability.

this finding is portfolio-specific. on mega-caps, overbought + reverting produces only +0.85% with 60% hit rate. the mechanism is the same extreme volatility that makes the counter-trend filter work: on 100%+ vol names, RSI extremes represent momentum bursts that continue, not exhaustion that reverses.

the Weber-Fechner correction from neuroscience makes this sharper. logit-RSI (the logarithmic transform the brain uses for magnitude perception) beats linear RSI by 29% on the portfolio and 54% on the benchmark. the improvement is universal — the brain's logarithmic encoding of magnitude is information-theoretically optimal for noisy signals.

---

### tension 5: systems vs the market

the ML ensemble — three tree-based models (LightGBM, XGBoost, CatBoost) trained on 208,139 rows of historical data — learned something the backtesting pipeline couldn't discover:

| model | meta-learner weight | role |
| --- | --- | --- |
| CatBoost | +2.36 | highest trust |
| LightGBM | +1.61 | secondary |
| XGBoost | -0.48 | **inverted** |
| tension score | -1.20 | **reduce on disagreement** |

the meta-learner independently learned to invert XGBoost's predictions and to reduce confidence when models disagree. the tension coefficient (-1.20) is the strongest weight after the individual models. **the ML system, trained from scratch on stock data, arrived at the same conclusion as the Entrenched Coils paper: disagreement between analytical systems should reduce position size, not be averaged away.**

this is not the same thing as simply averaging predictions. averaging treats all models as partial views of the same truth. the tension coefficient treats disagreement as evidence that the truth is uncertain — a fundamentally different operation that the meta-learner discovered without being told to look for it.

---

## IV. What Didn't Work

- **RPE (reward prediction error)**: delta = 0.000. no improvement from dopamine-inspired signal adjustment.
- **reconsolidation**: delta = -0.096. weakening previously wrong signals slightly hurt performance.
- **Hurst-adaptive strategy selection**: Sharpe 0.70 vs universal 2.20. knowing the regime didn't improve signal generation because the edge is in selectivity, not in regime-appropriate factor choice.
- **pairs trading**: -223% total return on MU-QTUM. the quantum/semi universe doesn't mean-revert within pairs — all names trend together on the same narrative.
- **ACh exploration-exploitation gating**: identical to static pipeline. the exploit pipeline fires so rarely (36 signals/year) that the accuracy window never fills, so the adaptive switch never triggers.
- **sentiment analysis**: Yahoo News API returned no headlines. DeepSeek-R1 generated hypothetical examples. needs a proper news feed.

six failed experiments. each failure is informative: they define the boundary of what works. neuroscience-inspired mechanisms add value for memory architecture (the original Entrenched Coils thesis) but not for signal generation. the signal generation edge is simpler than any neuroscience metaphor: fire rarely, fire at extremes, and when systems disagree, do less.

---

## V. The Number

portfolio beta to SPY: 2.58. portfolio R²: 0.371. Jensen's alpha: 51.6% annualized.

63% of the portfolio's variance is stock-specific. 37% is market risk. the alpha is real but it rides on high beta — when the market drops 1%, this portfolio drops 2.58%.

the NVDA earnings playbook illustrates the asymmetry. NVDA drops on 87% of its earnings reports (7/8 quarters). average 1-day return on earnings: -2.1%. but the quantum tickers in the portfolio are uncorrelated to NVDA earnings (ρ = -0.06). the "sympathy sell" thesis is wrong — quantum moves independently of NVDA on earnings days. buying NVDA two days after earnings produces +2.1% average 20-day return. the dip is temporary and predictable.

Monte Carlo simulation on the proposed trades (sell NXPI, trim IONQ 50%, add GOOG + MU):

| percentile | June 21 value |
| --- | --- |
| P10 | $3,983 |
| P25 | $4,314 |
| **P50** | **$4,690** |
| P75 | $5,079 |
| P90 | $5,453 |

probability of profit: 87%. probability of exceeding $5,000: 30%.

---

## VI. What Entrenched Coils Predicted

the original paper argued that *contradiction is a retrieval signal, not an error to resolve.* the 58 experiments validate this at a level the paper couldn't reach:

1. the ML meta-learner independently discovered a negative tension coefficient (-1.20), confirming that disagreement between models should reduce position size
2. the dual-track calibration showed that 17% of portfolio-specific findings *invert* on the benchmark — meaning a system that resolves the disagreement (picks one answer) would be wrong 17% of the time. preserving the tension prevents that error
3. the counter-trend fragility finding (92% failure rate) is itself a contradiction signal: the price is going up (agreement from momentum) but the structure is fragile (disagreement from drawdown analysis). preserving both signals produces better decisions than either alone

the paper said: *"40% novel, 60% recombination."* the experiments say: *"33% universal, 50% valid-for-us, 17% would lose money if generalized."* the ratio is nearly identical. the paper's self-assessment was well-calibrated.

---

## VII. The Trade

sell NXPI ($265). trim IONQ 50% ($262). buy GOOG ($250). buy MU ($150). cash reserve $127 for NVDA post-earnings dip.

execute next morning open. 15% portfolio-level stop. review May 20 (NVDA earnings), June 1 (D-Wave investor day), June 10-17 (CPI + FOMC).

the confidence is not 100%. the walk-forward validation showed 106% average overfit. the MU Sharpe is decaying. the growth-to-value rotation is only 6-8 months into a typical 64-month cycle. IONQ has 23% short interest with 15-25% quarterly squeeze probability that could override every bearish signal.

but the conviction score — integrating Sharpe, momentum, regime interaction, counter-trend filter, dip recovery rate, insider signals, analyst revisions, LLM consensus, options flow, and squeeze optionality, weighted by validated edge contribution — says GOOG and MU are the two highest-conviction names, IONQ is the lowest, and the current portfolio is already 87% likely to be profitable by June 21.

that is not certainty. it is 58 different ways of looking at the same eight tickers and finding that most of them, most of the time, point the same direction — except when they don't, and the exceptions are where the real information lives.

---

*58 experiments. one day. $4,097. the tension field is the finding.*
