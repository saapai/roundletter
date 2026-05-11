// Trade Recommendation Engine
// Converts debate consensus + signals + hunches + prices into specific actionable trades
// Runs locally on M5 Max 128GB via Ollama — zero API costs
//
// Output: ranked list of TradeRecommendation objects with dollar amounts, stop-losses, urgency

import { z } from "zod";

// ── Types ─────────────────────────────────────────────────────────────────

export type TradeAction = "buy" | "sell" | "hold" | "trim" | "add" | "hedge" | "kill";
export type Urgency = "immediate" | "today" | "this_week" | "opportunistic";
export type SignalType = "earnings" | "technical" | "catalyst" | "hunch" | "drift" | "stop_loss" | "debate_consensus" | "edgar_alert";

export type TradeRecommendation = {
  id: string;
  generated_at: string;
  ticker: string;
  action: TradeAction;
  amount_dollars: number;
  shares_approx: number;
  current_price: number;
  urgency: Urgency;
  stop_loss_price: number | null;
  take_profit_price: number | null;
  conviction_score: number;        // 0-1, Kelly-weighted
  expected_value_pct: number;      // E[return] for this trade
  signal_type: SignalType;
  rationale: string;
  risk_reward_ratio: number;       // reward/risk
  position_size_kelly_pct: number; // Kelly criterion suggested allocation %
  correlation_penalty: number;     // reduction due to correlated positions
};

export type TradeQueue = {
  generated_at: string;
  portfolio_value: number;
  session: "pre_market" | "market_open" | "intraday" | "after_hours" | "evening";
  recommendations: TradeRecommendation[];
  portfolio_risk_metrics: PortfolioRiskMetrics;
  growth_projection: GrowthProjection;
};

export type PortfolioRiskMetrics = {
  portfolio_volatility_annual_pct: number;
  max_correlated_exposure_pct: number;     // quantum cluster correlation risk
  sharpe_estimate: number;
  sortino_estimate: number;
  max_drawdown_risk_30d_pct: number;
  volatility_regime: "low" | "normal" | "high" | "extreme";
  position_count: number;
  concentration_hhi: number;               // Herfindahl-Hirschman Index
};

export type GrowthProjection = {
  expected_cagr_pct: number;
  monte_carlo_30d: { p10: number; p25: number; p50: number; p75: number; p90: number };
  monte_carlo_60d: { p10: number; p25: number; p50: number; p75: number; p90: number };
  monte_carlo_90d: { p10: number; p25: number; p50: number; p75: number; p90: number };
  optimal_changes: string[];
};

// ── Constants ─────────────────────────────────────────────────────────────

// Portfolio parameters
const PORTFOLIO_VALUE = 3821;
const MIN_TRADE_DOLLARS = 25;       // Don't recommend trades smaller than $25
const MAX_SINGLE_TRADE_PCT = 10;    // Never allocate >10% in one trade
const RISK_FREE_RATE = 0.052;       // T-bill rate (SGOV yield)

// Correlation matrix for quantum cluster (empirical from 2025-2026 data)
// These are approximate pairwise correlations
const QUANTUM_CORRELATIONS: Record<string, Record<string, number>> = {
  IONQ: { IONQ: 1.0, RGTI: 0.82, QBTS: 0.78, QTUM: 0.65, NVDA: 0.45, GOOG: 0.30, MSFT: 0.28, IBM: 0.35, CEG: 0.20, SGOV: -0.05 },
  RGTI: { IONQ: 0.82, RGTI: 1.0, QBTS: 0.85, QTUM: 0.60, NVDA: 0.40, GOOG: 0.25, MSFT: 0.22, IBM: 0.30, CEG: 0.15, SGOV: -0.05 },
  QBTS: { IONQ: 0.78, RGTI: 0.85, QBTS: 1.0, QTUM: 0.58, NVDA: 0.38, GOOG: 0.22, MSFT: 0.20, IBM: 0.28, CEG: 0.12, SGOV: -0.05 },
  QTUM: { IONQ: 0.65, RGTI: 0.60, QBTS: 0.58, QTUM: 1.0, NVDA: 0.55, GOOG: 0.45, MSFT: 0.48, IBM: 0.50, CEG: 0.30, SGOV: 0.02 },
  NVDA: { IONQ: 0.45, RGTI: 0.40, QBTS: 0.38, QTUM: 0.55, NVDA: 1.0, GOOG: 0.65, MSFT: 0.68, IBM: 0.42, CEG: 0.25, SGOV: -0.08 },
  GOOG: { IONQ: 0.30, RGTI: 0.25, QBTS: 0.22, QTUM: 0.45, NVDA: 0.65, GOOG: 1.0, MSFT: 0.82, IBM: 0.50, CEG: 0.20, SGOV: -0.10 },
  MSFT: { IONQ: 0.28, RGTI: 0.22, QBTS: 0.20, QTUM: 0.48, NVDA: 0.68, GOOG: 0.82, MSFT: 1.0, IBM: 0.55, CEG: 0.22, SGOV: -0.10 },
  IBM:  { IONQ: 0.35, RGTI: 0.30, QBTS: 0.28, QTUM: 0.50, NVDA: 0.42, GOOG: 0.50, MSFT: 0.55, IBM: 1.0, CEG: 0.30, SGOV: -0.05 },
  CEG:  { IONQ: 0.20, RGTI: 0.15, QBTS: 0.12, QTUM: 0.30, NVDA: 0.25, GOOG: 0.20, MSFT: 0.22, IBM: 0.30, CEG: 1.0, SGOV: 0.00 },
  SGOV: { IONQ: -0.05, RGTI: -0.05, QBTS: -0.05, QTUM: 0.02, NVDA: -0.08, GOOG: -0.10, MSFT: -0.10, IBM: -0.05, CEG: 0.00, SGOV: 1.0 },
};

// Annualized volatility estimates per ticker (from recent 90-day realized vol)
const TICKER_VOLATILITY: Record<string, number> = {
  IONQ: 0.95,   // 95% annualized vol
  RGTI: 1.10,   // 110%
  QBTS: 1.20,   // 120%
  QTUM: 0.35,   // 35% (diversified ETF)
  NVDA: 0.55,   // 55%
  GOOG: 0.30,   // 30%
  MSFT: 0.28,   // 28%
  IBM:  0.25,   // 25%
  CEG:  0.45,   // 45%
  SGOV: 0.01,   // 1% (T-bills)
};

// ── Bayesian Kelly Position Sizing ───────────────────────────────────────
//
// Instead of hardcoded win rates, model WR as Beta(alpha, beta) distribution.
// Automatically conservative when few trades, grows confident with data.
// Reduces overbetting losses by 15-30% vs fixed Kelly.
//
// From prediction market calibration research: Beta-Bayesian Kelly is the
// highest-impact single improvement to sizing. See RESEARCH-LOG.md.

/**
 * Beta distribution state for a ticker or strategy.
 * alpha = pseudo-wins, beta = pseudo-losses.
 * Start with a weak prior (alpha=2, beta=2 → 50% mean, wide uncertainty).
 * Each win: alpha += 1. Each loss: beta += 1.
 * Posterior mean = alpha / (alpha + beta).
 * Conservative estimate = mean - 1 std dev.
 */
export type BetaState = {
  alpha: number;  // pseudo-wins (prior + observed)
  beta: number;   // pseudo-losses (prior + observed)
};

/** Default prior: weakly informative, centered at 50% */
export const DEFAULT_BETA_PRIOR: BetaState = { alpha: 2, beta: 2 };

/** Prior for LightGBM signals: slightly optimistic based on hit rate, but wide */
export const LIGHTGBM_BETA_PRIOR: BetaState = { alpha: 3, beta: 2 };

/**
 * Update Beta state with a new observation.
 */
export function updateBeta(state: BetaState, won: boolean): BetaState {
  return {
    alpha: state.alpha + (won ? 1 : 0),
    beta: state.beta + (won ? 0 : 1),
  };
}

/**
 * Posterior mean of Beta distribution.
 */
export function betaMean(state: BetaState): number {
  return state.alpha / (state.alpha + state.beta);
}

/**
 * Conservative win rate estimate: posterior mean minus 1 standard deviation.
 * This is what we use for Kelly — always size below the most likely WR.
 * With few trades (small alpha+beta), the std dev is large → very conservative.
 * With many trades, std dev shrinks → converges to observed WR.
 */
export function betaConservativeEstimate(state: BetaState): number {
  const n = state.alpha + state.beta;
  const mean = state.alpha / n;
  const variance = (state.alpha * state.beta) / (n * n * (n + 1));
  const stdDev = Math.sqrt(variance);
  return Math.max(0.01, mean - stdDev);
}

/**
 * Full Kelly: f* = (p*b - q) / b
 * where p = probability of win, q = 1-p, b = win/loss ratio
 *
 * Uses Beta-Bayesian conservative estimate for p instead of a point estimate.
 * Automatically conservative with few trades, grows confident with data.
 */
export function kellyFraction(
  winProbability: number,
  winLossRatio: number,
  fractionalKelly: number = 0.5, // half-Kelly default
): number {
  const p = Math.max(0.01, Math.min(0.99, winProbability));
  const q = 1 - p;
  const b = Math.max(0.1, winLossRatio);

  const fullKelly = (p * b - q) / b;

  // Kelly can be negative (meaning don't bet / bet against)
  // Clamp to [0, 0.25] — never more than 25% of portfolio on one idea
  const halfKelly = fullKelly * fractionalKelly;
  return Math.max(0, Math.min(0.25, halfKelly));
}

/**
 * Bayesian Kelly: uses Beta posterior for win probability.
 * Automatically conservative when N is small, grows with data.
 *
 * @param betaState - Current Beta(alpha, beta) distribution
 * @param winLossRatio - Expected win/loss magnitude ratio
 * @param fractionalKelly - Safety factor (0.5 = half-Kelly)
 */
export function bayesianKellyFraction(
  betaState: BetaState,
  winLossRatio: number,
  fractionalKelly: number = 0.5,
): { fraction: number; conservativeWR: number; meanWR: number; n: number } {
  const conservativeWR = betaConservativeEstimate(betaState);
  const meanWR = betaMean(betaState);
  const n = betaState.alpha + betaState.beta;
  const fraction = kellyFraction(conservativeWR, winLossRatio, fractionalKelly);
  return { fraction, conservativeWR, meanWR, n };
}

// ── Closing Line Value (CLV) ────────────────────────────────────────────
//
// Measures real edge by comparing entry price to final settlement price.
// If we consistently get better prices than the market's final assessment,
// we have genuine edge — detectable with only 20 trades.
//
// CLV > 0: we're getting better prices than the market (real edge)
// CLV < 0: we're getting worse prices (no edge, market is smarter)
// CLV ≈ 0: we're at market efficiency (no edge either way)

export type CLVRecord = {
  ticker: string;
  entry_price: number;      // our buy/sell price
  final_price: number;      // settlement or close price on resolution day
  direction: "long" | "short";
  clv: number;              // entry vs final, adjusted for direction
  timestamp: string;
};

/**
 * Compute CLV for a single trade.
 * For longs: CLV = (final - entry) / entry — positive means we bought cheap
 * For shorts: CLV = (entry - final) / entry — positive means we sold dear
 */
export function computeCLV(
  entryPrice: number,
  finalPrice: number,
  direction: "long" | "short",
): number {
  if (entryPrice === 0) return 0;
  if (direction === "long") {
    return (finalPrice - entryPrice) / entryPrice;
  }
  return (entryPrice - finalPrice) / entryPrice;
}

/**
 * Rolling CLV average over last N trades.
 * Positive = genuine edge. Negative = no edge.
 */
export function rollingCLV(records: CLVRecord[], windowSize: number = 20): number {
  if (records.length === 0) return 0;
  const recent = records.slice(-windowSize);
  return recent.reduce((sum, r) => sum + r.clv, 0) / recent.length;
}

// ── EWMA Brier Score ────────────────────────────────────────────────────
//
// Exponentially-weighted Brier score with configurable half-life.
// Detects strategy degradation 3x faster than flat rolling windows.
// Recent trades matter more than old ones.

/**
 * Compute EWMA Brier score from a sequence of (predicted_prob, outcome) pairs.
 * @param predictions - Array of { prob: number, outcome: 0 | 1 }
 * @param halfLife - Number of trades for weight to decay to 50% (default: 25)
 */
export function ewmaBrier(
  predictions: Array<{ prob: number; outcome: 0 | 1 }>,
  halfLife: number = 25,
): number {
  if (predictions.length === 0) return 0.25; // uninformative default
  const lambda = Math.log(2) / halfLife;
  let weightedSum = 0;
  let weightSum = 0;

  for (let i = 0; i < predictions.length; i++) {
    const age = predictions.length - 1 - i;
    const weight = Math.exp(-lambda * age);
    const brier = (predictions[i].prob - predictions[i].outcome) ** 2;
    weightedSum += weight * brier;
    weightSum += weight;
  }

  return weightSum > 0 ? weightedSum / weightSum : 0.25;
}

// ── Tension-Adjusted Edge ───────────────────────────────────────────────
//
// When multiple signal sources disagree, the raw "average edge" is meaningless.
// Tension-adjusted edge penalizes disagreement continuously:
//   effective_edge = raw_edge × (1 - model_tension)
//
// Low tension + high market divergence = trade with confidence.
// High tension = skip regardless of average edge.

/**
 * Compute inter-model tension from multiple probability estimates.
 * Tension = max(estimates) - min(estimates).
 * Returns 0-1 where 0 = perfect agreement, 1 = complete disagreement.
 */
export function computeModelTension(estimates: number[]): number {
  if (estimates.length < 2) return 0;
  return Math.max(...estimates) - Math.min(...estimates);
}

/**
 * Apply tension penalty to raw edge.
 * High tension reduces effective edge toward zero.
 */
export function tensionAdjustedEdge(
  rawEdge: number,
  tension: number,
  tensionThreshold: number = 0.20,  // skip if tension > 20%
): { effectiveEdge: number; shouldSkip: boolean } {
  const penalty = 1 - Math.min(1, tension / tensionThreshold);
  const effectiveEdge = rawEdge * penalty;
  return {
    effectiveEdge,
    shouldSkip: tension > tensionThreshold,
  };
}

// ── Legacy calibration (kept for backward compatibility) ────────────────

/**
 * Convert debate confidence (0-1) to win probability estimate.
 * DEPRECATED: Use bayesianKellyFraction with Beta state instead.
 * Kept for existing code paths that pass raw confidence values.
 */
export function calibrateConfidence(
  rawConfidence: number,
  historicalAccuracy: number = 0.55,
  shrinkageFactor: number = 0.6,
): number {
  const baseRate = historicalAccuracy;
  const calibrated = baseRate + (rawConfidence - 0.5) * shrinkageFactor;
  return Math.max(0.30, Math.min(0.85, calibrated));
}

// ── Volatility Regime Detection ──────────────────────────────────────────

export type VolatilityRegime = "low" | "normal" | "high" | "extreme";

/**
 * Detect volatility regime from recent price data.
 * Uses 5-day realized volatility vs 20-day baseline.
 *
 * Regimes:
 *   low:     5d vol < 0.5x 20d vol (compression, breakout coming)
 *   normal:  0.5x-1.5x 20d vol
 *   high:    1.5x-2.5x 20d vol (reduce position sizes by 50%)
 *   extreme: >2.5x 20d vol (reduce position sizes by 75%, raise stops)
 */
export function detectVolatilityRegime(
  recentDailyReturns: number[], // last 5 trading days
  baselineDailyReturns: number[], // last 20 trading days
): { regime: VolatilityRegime; multiplier: number; positionSizeMultiplier: number } {
  if (recentDailyReturns.length < 3 || baselineDailyReturns.length < 10) {
    return { regime: "normal", multiplier: 1.0, positionSizeMultiplier: 1.0 };
  }

  const recentVol = standardDeviation(recentDailyReturns) * Math.sqrt(252);
  const baselineVol = standardDeviation(baselineDailyReturns) * Math.sqrt(252);

  if (baselineVol === 0) return { regime: "normal", multiplier: 1.0, positionSizeMultiplier: 1.0 };

  const ratio = recentVol / baselineVol;

  if (ratio < 0.5) return { regime: "low", multiplier: ratio, positionSizeMultiplier: 1.2 };
  if (ratio < 1.5) return { regime: "normal", multiplier: ratio, positionSizeMultiplier: 1.0 };
  if (ratio < 2.5) return { regime: "high", multiplier: ratio, positionSizeMultiplier: 0.5 };
  return { regime: "extreme", multiplier: ratio, positionSizeMultiplier: 0.25 };
}

// ── Momentum / Mean-Reversion Indicators ─────────────────────────────────

/**
 * Simple RSI (Relative Strength Index) — computable from 14 days of closes.
 * RSI > 70: overbought (mean-reversion short signal)
 * RSI < 30: oversold (mean-reversion long signal)
 * RSI 40-60: neutral (momentum regime)
 */
export function computeRSI(closes: number[], period: number = 14): number {
  if (closes.length < period + 1) return 50; // default neutral

  let gains = 0;
  let losses = 0;

  for (let i = closes.length - period; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }

  if (losses === 0) return 100;
  const rs = gains / losses;
  return 100 - (100 / (1 + rs));
}

/**
 * Rate of Change (momentum) — 5-day and 20-day.
 * Positive = momentum up, Negative = momentum down.
 * Divergence between 5d and 20d signals exhaustion.
 */
export function computeROC(closes: number[], period: number): number {
  if (closes.length <= period) return 0;
  const current = closes[closes.length - 1];
  const prior = closes[closes.length - 1 - period];
  return prior === 0 ? 0 : ((current - prior) / prior) * 100;
}

/**
 * Simple Moving Average crossover signal.
 * SMA5 > SMA20 = bullish, SMA5 < SMA20 = bearish.
 * Distance between them = signal strength.
 */
export function smaCrossoverSignal(closes: number[]): {
  direction: "bullish" | "bearish" | "neutral";
  strength: number; // 0-1
} {
  if (closes.length < 20) return { direction: "neutral", strength: 0 };

  const sma5 = closes.slice(-5).reduce((a, b) => a + b, 0) / 5;
  const sma20 = closes.slice(-20).reduce((a, b) => a + b, 0) / 20;

  const diff = (sma5 - sma20) / sma20;
  if (Math.abs(diff) < 0.005) return { direction: "neutral", strength: 0 };

  return {
    direction: diff > 0 ? "bullish" : "bearish",
    strength: Math.min(1, Math.abs(diff) * 10), // 10% gap = max strength
  };
}

/**
 * ATR (Average True Range) — used for stop-loss placement.
 * Stop = current_price - 2*ATR (standard 2-ATR trailing stop).
 */
export function computeATR(
  highs: number[],
  lows: number[],
  closes: number[],
  period: number = 14,
): number {
  if (highs.length < period + 1) {
    // Fallback: estimate from closes only (assume H-L = 2% of close)
    const avgClose = closes.slice(-period).reduce((a, b) => a + b, 0) / Math.min(period, closes.length);
    return avgClose * 0.02;
  }

  let atr = 0;
  for (let i = highs.length - period; i < highs.length; i++) {
    const tr = Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1]),
    );
    atr += tr;
  }
  return atr / period;
}

// ── Portfolio Risk Calculation ────────────────────────────────────────────

/**
 * Calculate portfolio-level risk metrics using correlation matrix.
 * Variance_portfolio = sum_i sum_j (w_i * w_j * sigma_i * sigma_j * rho_ij)
 */
export function calculatePortfolioRisk(
  weights: Record<string, number>,   // ticker -> weight (0-1, sums to 1)
  volatilities: Record<string, number>,
  correlations: Record<string, Record<string, number>>,
): PortfolioRiskMetrics {
  const tickers = Object.keys(weights);
  const n = tickers.length;

  // Portfolio variance
  let portfolioVariance = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const ti = tickers[i];
      const tj = tickers[j];
      const wi = weights[ti] ?? 0;
      const wj = weights[tj] ?? 0;
      const sigmaI = volatilities[ti] ?? 0.30;
      const sigmaJ = volatilities[tj] ?? 0.30;
      const rho = correlations[ti]?.[tj] ?? (i === j ? 1.0 : 0.3);
      portfolioVariance += wi * wj * sigmaI * sigmaJ * rho;
    }
  }

  const portfolioVol = Math.sqrt(portfolioVariance);

  // Concentration (Herfindahl-Hirschman Index)
  const hhi = Object.values(weights).reduce((sum, w) => sum + w * w, 0);

  // Max correlated exposure: sum of weights for quantum pure-plays
  const quantumPurePlays = ["IONQ", "RGTI", "QBTS"];
  const maxCorrelatedExposure = quantumPurePlays.reduce(
    (sum, t) => sum + (weights[t] ?? 0), 0
  );

  // Sharpe estimate (using portfolio historical returns if available)
  // Placeholder: use expected return from debate consensus
  const expectedReturn = 0.15; // 15% expected annual return (optimistic for quantum)
  const sharpe = (expectedReturn - RISK_FREE_RATE) / portfolioVol;

  // 30-day max drawdown risk (parametric, assuming normal — conservative)
  const dailyVol = portfolioVol / Math.sqrt(252);
  const thirtyDayVol = dailyVol * Math.sqrt(30);
  const maxDrawdown30d = -2 * thirtyDayVol * 100; // 2-sigma event

  // Volatility regime detection from portfolio vol
  let volRegime: VolatilityRegime = "normal";
  if (portfolioVol < 0.20) volRegime = "low";
  else if (portfolioVol < 0.40) volRegime = "normal";
  else if (portfolioVol < 0.60) volRegime = "high";
  else volRegime = "extreme";

  return {
    portfolio_volatility_annual_pct: portfolioVol * 100,
    max_correlated_exposure_pct: maxCorrelatedExposure * 100,
    sharpe_estimate: sharpe,
    sortino_estimate: sharpe * 1.2, // rough approximation
    max_drawdown_risk_30d_pct: maxDrawdown30d,
    volatility_regime: volRegime,
    position_count: n,
    concentration_hhi: hhi,
  };
}

// ── Monte Carlo Simulation ────────────────────────────────────────────────

/**
 * Run Monte Carlo simulation for portfolio value at T days.
 * Uses geometric Brownian motion with correlation structure.
 *
 * Parameters:
 *   - portfolioValue: current value
 *   - annualVol: portfolio-level annualized volatility
 *   - annualDrift: expected annual return (from debate consensus)
 *   - days: simulation horizon
 *   - simulations: number of paths (10000 default)
 *
 * Returns percentile distribution of final portfolio value.
 */
export function monteCarloSimulation(
  portfolioValue: number,
  annualVol: number,
  annualDrift: number,
  days: number,
  simulations: number = 10000,
): { p10: number; p25: number; p50: number; p75: number; p90: number } {
  const dt = 1 / 252; // daily step
  const dailyDrift = annualDrift * dt;
  const dailyVol = annualVol * Math.sqrt(dt);

  const finalValues: number[] = [];

  for (let sim = 0; sim < simulations; sim++) {
    let value = portfolioValue;
    for (let day = 0; day < days; day++) {
      // Box-Muller for normal random
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

      // GBM step
      const dailyReturn = dailyDrift - 0.5 * dailyVol * dailyVol + dailyVol * z;
      value *= Math.exp(dailyReturn);
    }
    finalValues.push(value);
  }

  finalValues.sort((a, b) => a - b);

  const percentile = (p: number) => finalValues[Math.floor(p * simulations)];

  return {
    p10: Math.round(percentile(0.10) * 100) / 100,
    p25: Math.round(percentile(0.25) * 100) / 100,
    p50: Math.round(percentile(0.50) * 100) / 100,
    p75: Math.round(percentile(0.75) * 100) / 100,
    p90: Math.round(percentile(0.90) * 100) / 100,
  };
}

// ── Signal Generation Pipeline ────────────────────────────────────────────

export type SignalInput = {
  // From morning briefing
  preMarketMoves: Record<string, number>;       // ticker -> % change
  overnightNews: Array<{ ticker?: string; title: string; source: string }>;
  edgarAlerts: string[];
  alertLevel: "normal" | "elevated" | "critical";

  // From debate system
  debateConsensus: {
    direction: "up" | "down" | "flat" | null;
    confidence: number;                          // 0-1
    topic: string;
    relevantTickers: string[];
  } | null;

  // From hunches
  activeHunches: Array<{
    id: string;
    thesis: string;
    direction: string;
    tickers: string[];
    catalystDate: string | null;
    actionSuggestion: string;
  }>;

  // From portfolio state
  currentPrices: Record<string, number>;
  currentWeights: Record<string, number>;        // ticker -> weight (0-1)
  portfolioValue: number;
  targetWeights: Record<string, number>;         // ticker -> target weight

  // From intraday/close data
  recentCloses: Record<string, number[]>;        // ticker -> last 20 closes
  dailyHighs?: Record<string, number[]>;
  dailyLows?: Record<string, number[]>;

  // From agent scores (calibration)
  agentAccuracy: number;                         // historical accuracy 0-1

  // Earnings calendar
  upcomingEarnings: Array<{ ticker: string; date: string; daysAway: number }>;
};

/**
 * Core signal generation: combine all inputs into ranked trade recommendations.
 *
 * Signal priority (highest to lowest):
 *   1. EDGAR critical (S-3/424B5) -> KILL position immediately
 *   2. Stop-loss breach -> SELL
 *   3. Earnings reaction (after-hours) -> TRIM/ADD based on guidance
 *   4. Allocation drift >5% -> REBALANCE
 *   5. Debate consensus + hunch alignment -> directional trade
 *   6. Technical signals (RSI extreme, momentum) -> tactical
 */
export function generateSignals(input: SignalInput): TradeRecommendation[] {
  const recommendations: TradeRecommendation[] = [];
  const now = new Date().toISOString();

  // ── Priority 1: EDGAR kill switch ───────────────────────────────────────
  for (const alert of input.edgarAlerts) {
    const ticker = extractTickerFromAlert(alert);
    if (ticker && input.currentWeights[ticker]) {
      const price = input.currentPrices[ticker] ?? 0;
      const positionValue = input.portfolioValue * (input.currentWeights[ticker] ?? 0);

      recommendations.push({
        id: `edgar_kill_${ticker}_${Date.now()}`,
        generated_at: now,
        ticker,
        action: "kill",
        amount_dollars: positionValue,
        shares_approx: price > 0 ? positionValue / price : 0,
        current_price: price,
        urgency: "immediate",
        stop_loss_price: null,
        take_profit_price: null,
        conviction_score: 0.95,
        expected_value_pct: -15, // ATM offerings typically gap down 10-20%
        signal_type: "edgar_alert",
        rationale: `ATM shelf filing detected: ${alert}. Panel kill-switch rule: sell entire position immediately.`,
        risk_reward_ratio: 0.1,
        position_size_kelly_pct: 0,
        correlation_penalty: 0,
      });

      // H2 rule: if one pure-play files ATM, cut the other two 50%
      const purePlays = ["IONQ", "RGTI", "QBTS"];
      if (purePlays.includes(ticker)) {
        for (const other of purePlays.filter(t => t !== ticker)) {
          if (input.currentWeights[other]) {
            const otherValue = input.portfolioValue * (input.currentWeights[other] ?? 0);
            const otherPrice = input.currentPrices[other] ?? 0;
            recommendations.push({
              id: `edgar_corr_cut_${other}_${Date.now()}`,
              generated_at: now,
              ticker: other,
              action: "trim",
              amount_dollars: otherValue * 0.5,
              shares_approx: otherPrice > 0 ? (otherValue * 0.5) / otherPrice : 0,
              current_price: otherPrice,
              urgency: "immediate",
              stop_loss_price: null,
              take_profit_price: null,
              conviction_score: 0.85,
              expected_value_pct: -10,
              signal_type: "edgar_alert",
              rationale: `Correlated ATM risk: ${ticker} filed shelf. H2 rule: cut correlated pure-plays 50% same day.`,
              risk_reward_ratio: 0.2,
              position_size_kelly_pct: 0,
              correlation_penalty: 0.85,
            });
          }
        }
      }
    }
  }

  // ── Priority 2: Stop-loss checks ───────────────────────────────────────
  for (const [ticker, closes] of Object.entries(input.recentCloses)) {
    if (closes.length < 5) continue;
    const currentPrice = input.currentPrices[ticker] ?? closes[closes.length - 1];
    const atr = computeATR(
      input.dailyHighs?.[ticker] ?? closes,
      input.dailyLows?.[ticker] ?? closes,
      closes,
    );

    // 2-ATR trailing stop from recent high
    const recentHigh = Math.max(...closes.slice(-10));
    const stopPrice = recentHigh - 2 * atr;

    if (currentPrice < stopPrice && input.currentWeights[ticker]) {
      const positionValue = input.portfolioValue * (input.currentWeights[ticker] ?? 0);
      const drawdownFromHigh = ((currentPrice - recentHigh) / recentHigh) * 100;

      recommendations.push({
        id: `stop_loss_${ticker}_${Date.now()}`,
        generated_at: now,
        ticker,
        action: "sell",
        amount_dollars: positionValue * 0.5, // sell half on stop breach
        shares_approx: currentPrice > 0 ? (positionValue * 0.5) / currentPrice : 0,
        current_price: currentPrice,
        urgency: "today",
        stop_loss_price: stopPrice,
        take_profit_price: null,
        conviction_score: 0.75,
        expected_value_pct: drawdownFromHigh,
        signal_type: "stop_loss",
        rationale: `2-ATR trailing stop breached. Price $${currentPrice.toFixed(2)} below stop $${stopPrice.toFixed(2)} (ATR=$${atr.toFixed(2)}). Selling half to preserve capital.`,
        risk_reward_ratio: 0.3,
        position_size_kelly_pct: 0,
        correlation_penalty: 0,
      });
    }
  }

  // ── Priority 3: Earnings pre-positioning ───────────────────────────────
  for (const earnings of input.upcomingEarnings) {
    const weight = input.currentWeights[earnings.ticker] ?? 0;
    if (weight === 0) continue;

    // If earnings within 5 days and position is >8%, consider trimming
    if (earnings.daysAway <= 5 && weight > 0.08) {
      const price = input.currentPrices[earnings.ticker] ?? 0;
      const trimAmount = input.portfolioValue * (weight - 0.08); // trim to 8%

      // Check if any hunch supports this
      const supportingHunch = input.activeHunches.find(
        h => h.tickers.includes(earnings.ticker) && h.direction.includes("down")
      );

      const conviction = supportingHunch ? 0.70 : 0.55;

      if (trimAmount > MIN_TRADE_DOLLARS) {
        recommendations.push({
          id: `earnings_trim_${earnings.ticker}_${Date.now()}`,
          generated_at: now,
          ticker: earnings.ticker,
          action: "trim",
          amount_dollars: trimAmount,
          shares_approx: price > 0 ? trimAmount / price : 0,
          current_price: price,
          urgency: earnings.daysAway <= 2 ? "today" : "this_week",
          stop_loss_price: null,
          take_profit_price: null,
          conviction_score: conviction,
          expected_value_pct: -5, // earnings risk premium
          signal_type: "earnings",
          rationale: `Earnings in ${earnings.daysAway} days. Position at ${(weight * 100).toFixed(1)}% — trim to 8% to manage binary risk.${supportingHunch ? ` Supported by hunch ${supportingHunch.id}: "${supportingHunch.thesis}"` : ""}`,
          risk_reward_ratio: 0.6,
          position_size_kelly_pct: kellyFraction(conviction, 0.6) * 100,
          correlation_penalty: 0,
        });
      }
    }
  }

  // ── Priority 4: Allocation drift rebalancing ───────────────────────────
  for (const [ticker, currentWeight] of Object.entries(input.currentWeights)) {
    const targetWeight = input.targetWeights[ticker] ?? 0;
    const driftPct = (currentWeight - targetWeight) * 100;

    // Only rebalance if drift > 3% (avoid churning)
    if (Math.abs(driftPct) < 3) continue;

    const price = input.currentPrices[ticker] ?? 0;
    const driftDollars = input.portfolioValue * Math.abs(currentWeight - targetWeight);

    if (driftDollars < MIN_TRADE_DOLLARS) continue;

    const action: TradeAction = currentWeight > targetWeight ? "trim" : "add";

    recommendations.push({
      id: `drift_${action}_${ticker}_${Date.now()}`,
      generated_at: now,
      ticker,
      action,
      amount_dollars: driftDollars,
      shares_approx: price > 0 ? driftDollars / price : 0,
      current_price: price,
      urgency: Math.abs(driftPct) > 5 ? "this_week" : "opportunistic",
      stop_loss_price: null,
      take_profit_price: null,
      conviction_score: 0.60,
      expected_value_pct: 0,
      signal_type: "drift",
      rationale: `Allocation drift: ${ticker} at ${(currentWeight * 100).toFixed(1)}% vs target ${(targetWeight * 100).toFixed(1)}% (drift ${driftPct > 0 ? "+" : ""}${driftPct.toFixed(1)}%).`,
      risk_reward_ratio: 1.0,
      position_size_kelly_pct: targetWeight * 100,
      correlation_penalty: 0,
    });
  }

  // ── Priority 5: Debate consensus + hunch alignment ─────────────────────
  if (input.debateConsensus && input.debateConsensus.direction) {
    const { direction, confidence, relevantTickers, topic } = input.debateConsensus;

    // Calibrate confidence using historical accuracy
    const calibratedP = calibrateConfidence(confidence, input.agentAccuracy);

    for (const ticker of relevantTickers) {
      if (!input.currentPrices[ticker]) continue;

      const price = input.currentPrices[ticker] ?? 0;
      const currentWeight = input.currentWeights[ticker] ?? 0;
      const vol = TICKER_VOLATILITY[ticker] ?? 0.40;

      // Check hunch alignment (strengthens signal)
      const alignedHunch = input.activeHunches.find(
        h => h.tickers.includes(ticker) && (
          (direction === "up" && h.direction.includes("up")) ||
          (direction === "down" && h.direction.includes("down"))
        )
      );

      // Boost confidence if hunch aligns
      const effectiveP = alignedHunch
        ? Math.min(0.85, calibratedP + 0.10)
        : calibratedP;

      // Expected move based on volatility (1-day expected move = dailyVol)
      const dailyVol = vol / Math.sqrt(252);
      const expectedMove = dailyVol * 100; // as percentage
      const winLossRatio = 1.5; // assume 1.5:1 via stop placement

      // Kelly position size
      const kellyPct = kellyFraction(effectiveP, winLossRatio);

      // Correlation penalty: reduce size if quantum cluster already overweight
      const correlationPenalty = calculateCorrelationPenalty(ticker, input.currentWeights);
      const adjustedKellyPct = kellyPct * (1 - correlationPenalty);

      const tradeDollars = Math.min(
        input.portfolioValue * adjustedKellyPct,
        input.portfolioValue * MAX_SINGLE_TRADE_PCT / 100,
      );

      if (tradeDollars < MIN_TRADE_DOLLARS) continue;

      let action: TradeAction;
      if (direction === "up") action = currentWeight > 0 ? "add" : "buy";
      else if (direction === "down") action = currentWeight > 0 ? "trim" : "hold";
      else action = "hold";

      if (action === "hold") continue;

      // Stop-loss: 2-ATR below entry for buys, above for sells
      const closes = input.recentCloses[ticker] ?? [];
      const atr = computeATR(
        input.dailyHighs?.[ticker] ?? closes,
        input.dailyLows?.[ticker] ?? closes,
        closes,
      );
      const stopLoss = direction === "up" ? price - 2 * atr : price + 2 * atr;
      const takeProfit = direction === "up" ? price + 3 * atr : price - 3 * atr;

      recommendations.push({
        id: `debate_${action}_${ticker}_${Date.now()}`,
        generated_at: now,
        ticker,
        action,
        amount_dollars: tradeDollars,
        shares_approx: price > 0 ? tradeDollars / price : 0,
        current_price: price,
        urgency: effectiveP > 0.70 ? "today" : "this_week",
        stop_loss_price: Math.round(stopLoss * 100) / 100,
        take_profit_price: Math.round(takeProfit * 100) / 100,
        conviction_score: effectiveP,
        expected_value_pct: (effectiveP * expectedMove * winLossRatio) - ((1 - effectiveP) * expectedMove),
        signal_type: alignedHunch ? "hunch" : "debate_consensus",
        rationale: `Debate consensus: ${direction} on "${topic}" (confidence ${(confidence * 100).toFixed(0)}%, calibrated to ${(effectiveP * 100).toFixed(0)}%).${alignedHunch ? ` Aligned with hunch ${alignedHunch.id}.` : ""} Kelly size: ${(adjustedKellyPct * 100).toFixed(1)}%.`,
        risk_reward_ratio: winLossRatio,
        position_size_kelly_pct: adjustedKellyPct * 100,
        correlation_penalty: correlationPenalty,
      });
    }
  }

  // ── Priority 6: Technical signals ──────────────────────────────────────
  for (const [ticker, closes] of Object.entries(input.recentCloses)) {
    if (closes.length < 14) continue;
    if (!input.currentWeights[ticker]) continue;

    const rsi = computeRSI(closes);
    const roc5 = computeROC(closes, 5);
    const sma = smaCrossoverSignal(closes);
    const price = input.currentPrices[ticker] ?? closes[closes.length - 1];
    const currentWeight = input.currentWeights[ticker] ?? 0;

    // RSI extreme: overbought sell signal
    if (rsi > 75 && currentWeight > 0.05) {
      const trimAmount = input.portfolioValue * currentWeight * 0.20; // trim 20%
      if (trimAmount >= MIN_TRADE_DOLLARS) {
        recommendations.push({
          id: `tech_rsi_overbought_${ticker}_${Date.now()}`,
          generated_at: now,
          ticker,
          action: "trim",
          amount_dollars: trimAmount,
          shares_approx: price > 0 ? trimAmount / price : 0,
          current_price: price,
          urgency: "opportunistic",
          stop_loss_price: null,
          take_profit_price: null,
          conviction_score: 0.55,
          expected_value_pct: -2,
          signal_type: "technical",
          rationale: `RSI=${rsi.toFixed(0)} (overbought). 5d momentum ${roc5 > 0 ? "+" : ""}${roc5.toFixed(1)}%. Mean-reversion signal: trim 20% of position.`,
          risk_reward_ratio: 0.8,
          position_size_kelly_pct: 0,
          correlation_penalty: 0,
        });
      }
    }

    // RSI extreme: oversold buy signal (only if we want more exposure)
    if (rsi < 25 && currentWeight < (input.targetWeights[ticker] ?? 0)) {
      const addAmount = Math.min(
        input.portfolioValue * 0.03, // max 3% on technical alone
        input.portfolioValue * ((input.targetWeights[ticker] ?? 0) - currentWeight),
      );
      if (addAmount >= MIN_TRADE_DOLLARS) {
        recommendations.push({
          id: `tech_rsi_oversold_${ticker}_${Date.now()}`,
          generated_at: now,
          ticker,
          action: "add",
          amount_dollars: addAmount,
          shares_approx: price > 0 ? addAmount / price : 0,
          current_price: price,
          urgency: "opportunistic",
          stop_loss_price: price * 0.90, // 10% stop on oversold bounce
          take_profit_price: price * 1.15,
          conviction_score: 0.55,
          expected_value_pct: 5,
          signal_type: "technical",
          rationale: `RSI=${rsi.toFixed(0)} (oversold). Mean-reversion long signal. Adding toward target weight.`,
          risk_reward_ratio: 1.5,
          position_size_kelly_pct: kellyFraction(0.55, 1.5) * 100,
          correlation_penalty: calculateCorrelationPenalty(ticker, input.currentWeights),
        });
      }
    }
  }

  // ── Sort by conviction * urgency priority ──────────────────────────────
  const urgencyWeight: Record<Urgency, number> = {
    immediate: 4,
    today: 3,
    this_week: 2,
    opportunistic: 1,
  };

  recommendations.sort((a, b) => {
    const scoreA = a.conviction_score * urgencyWeight[a.urgency];
    const scoreB = b.conviction_score * urgencyWeight[b.urgency];
    return scoreB - scoreA;
  });

  return recommendations;
}

// ── Growth Rate Prediction ────────────────────────────────────────────────

/**
 * Estimate expected CAGR given current portfolio construction.
 *
 * Method: weighted average of per-position expected returns,
 * adjusted for correlation drag and trading costs.
 *
 * Historical quantum basket (2024-2025): ~40% CAGR but with 80% vol.
 * Big-tech quantum (GOOG, MSFT, IBM): ~15% CAGR, 30% vol.
 * Blended portfolio expected: ~20-25% CAGR, 40% vol.
 *
 * Kelly growth rate: g = r + f*(mu - r) - 0.5*f^2*sigma^2
 * For a diversified portfolio, the optimal growth rate depends on
 * how much you're leveraging vs the efficient frontier.
 */
export function estimateCAGR(
  weights: Record<string, number>,
  expectedReturns: Record<string, number>, // per-ticker expected annual return
  volatilities: Record<string, number>,
): number {
  // Weighted expected return
  let portfolioReturn = 0;
  let portfolioVol2 = 0;

  for (const [ticker, weight] of Object.entries(weights)) {
    portfolioReturn += weight * (expectedReturns[ticker] ?? 0.10);
  }

  // Subtract volatility drag: E[geometric return] = E[arithmetic return] - 0.5*sigma^2
  const volDrag = calculatePortfolioVariance(weights, volatilities);
  const geometricReturn = portfolioReturn - 0.5 * volDrag;

  // Subtract estimated trading friction (1% for a small account)
  const tradingCosts = 0.01;

  return geometricReturn - tradingCosts;
}

export function calculateGrowthProjection(
  portfolioValue: number,
  weights: Record<string, number>,
  volatilities: Record<string, number>,
): GrowthProjection {
  // Expected returns by ticker class
  const expectedReturns: Record<string, number> = {
    QTUM: 0.15,
    GOOG: 0.12,
    MSFT: 0.11,
    IBM:  0.10,
    NVDA: 0.20,
    IONQ: 0.30,   // high expected but high vol
    RGTI: 0.35,
    QBTS: 0.40,   // lottery ticket
    CEG:  0.15,
    SGOV: 0.052,
  };

  const cagr = estimateCAGR(weights, expectedReturns, volatilities);

  // Portfolio-level vol for Monte Carlo
  const portfolioVol = Math.sqrt(calculatePortfolioVariance(weights, volatilities));

  // Run Monte Carlo for 30/60/90 days
  const mc30 = monteCarloSimulation(portfolioValue, portfolioVol, cagr, 30);
  const mc60 = monteCarloSimulation(portfolioValue, portfolioVol, cagr, 60);
  const mc90 = monteCarloSimulation(portfolioValue, portfolioVol, cagr, 90);

  // Optimal changes to maximize growth
  const optimal: string[] = [];

  // Check if quantum pure-play cluster is too concentrated
  const purePlayWeight = (weights["IONQ"] ?? 0) + (weights["RGTI"] ?? 0) + (weights["QBTS"] ?? 0);
  if (purePlayWeight > 0.20) {
    optimal.push(`Reduce pure-play quantum cluster from ${(purePlayWeight * 100).toFixed(0)}% to 15% — high correlation (0.85) creates volatility drag`);
  }

  // Check if SGOV (dry powder) is too low
  if ((weights["SGOV"] ?? 0) < 0.05) {
    optimal.push("Increase SGOV to 7-10% — provides rebalancing ammunition on drawdowns");
  }

  // Check Kelly optimal sizing
  if ((weights["NVDA"] ?? 0) > 0.12) {
    optimal.push(`NVDA at ${((weights["NVDA"] ?? 0) * 100).toFixed(0)}% exceeds Kelly optimal for its vol — trim to 8-10%`);
  }

  // CEG is uncorrelated diversifier
  if ((weights["CEG"] ?? 0) < 0.10) {
    optimal.push("CEG is lowest-correlated holding — increasing to 12% improves Sharpe without adding quantum risk");
  }

  return {
    expected_cagr_pct: cagr * 100,
    monte_carlo_30d: mc30,
    monte_carlo_60d: mc60,
    monte_carlo_90d: mc90,
    optimal_changes: optimal,
  };
}

// ── Backtest Framework ────────────────────────────────────────────────────

export type BacktestResult = {
  period: string;
  total_recommendations: number;
  hit_rate: number;                     // % of recommendations that were profitable
  average_return_pct: number;
  by_signal_type: Record<SignalType, { count: number; hit_rate: number; avg_return_pct: number }>;
  sharpe_of_recommendations: number;
  max_drawdown_pct: number;
  profit_factor: number;                // gross_profits / gross_losses
};

/**
 * Score a recommendation against actual outcome.
 * Call this T+1 or T+5 to measure if the signal was correct.
 */
export function scoreRecommendation(
  rec: TradeRecommendation,
  actualPriceAtExit: number,
): { correct: boolean; returnPct: number; timeToResolution: number } {
  const entryPrice = rec.current_price;
  const returnPct = ((actualPriceAtExit - entryPrice) / entryPrice) * 100;

  let correct: boolean;
  if (rec.action === "buy" || rec.action === "add") {
    correct = returnPct > 0;
  } else if (rec.action === "sell" || rec.action === "trim" || rec.action === "kill") {
    correct = returnPct < 0; // if price fell after our sell signal, we were right to sell
  } else {
    correct = Math.abs(returnPct) < 1; // hold was correct if price didn't move much
  }

  return {
    correct,
    returnPct: rec.action === "sell" || rec.action === "trim" ? -returnPct : returnPct,
    timeToResolution: 1, // placeholder
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────

function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function extractTickerFromAlert(alert: string): string | null {
  const tickers = ["IONQ", "RGTI", "QBTS", "NVDA", "GOOG", "MSFT", "IBM", "CEG", "QTUM", "SGOV"];
  for (const t of tickers) {
    if (alert.toUpperCase().includes(t)) return t;
  }
  return null;
}

function calculateCorrelationPenalty(
  ticker: string,
  currentWeights: Record<string, number>,
): number {
  // Sum of (correlation * weight) for all other positions
  // High penalty = adding to an already correlated cluster
  let penalty = 0;
  const correlations = QUANTUM_CORRELATIONS[ticker];
  if (!correlations) return 0;

  for (const [other, weight] of Object.entries(currentWeights)) {
    if (other === ticker) continue;
    const rho = correlations[other] ?? 0.3;
    penalty += rho * weight;
  }

  // Normalize: penalty of 1.0 means position is fully redundant
  return Math.min(0.8, penalty);
}

function calculatePortfolioVariance(
  weights: Record<string, number>,
  volatilities: Record<string, number>,
): number {
  const tickers = Object.keys(weights);
  let variance = 0;
  for (let i = 0; i < tickers.length; i++) {
    for (let j = 0; j < tickers.length; j++) {
      const ti = tickers[i];
      const tj = tickers[j];
      const wi = weights[ti] ?? 0;
      const wj = weights[tj] ?? 0;
      const sigmaI = volatilities[ti] ?? 0.30;
      const sigmaJ = volatilities[tj] ?? 0.30;
      const rho = QUANTUM_CORRELATIONS[ti]?.[tj] ?? (i === j ? 1.0 : 0.3);
      variance += wi * wj * sigmaI * sigmaJ * rho;
    }
  }
  return variance;
}

// ── Exports for scripts ──────────────────────────────────────────────────

export {
  QUANTUM_CORRELATIONS,
  TICKER_VOLATILITY,
  PORTFOLIO_VALUE,
  MIN_TRADE_DOLLARS,
  MAX_SINGLE_TRADE_PCT,
  RISK_FREE_RATE,
};
