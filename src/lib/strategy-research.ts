// Strategy Research Agent System
// Seven specialized research agents study hedge fund strategies, day trading methods,
// quantitative models, and social signals — then debate how to deploy capital.
//
// Each agent has a DOMAIN it researches independently, then they argue in rounds
// with genuine disagreement because they've consumed different information.
//
// Runs LOCALLY on Ollama (qwen3:32b) — zero API cost on M5 Max 128GB.
// Twitter scraper for social signals. RSS/EDGAR for news.

import { z } from "zod";
import { localParse, type ModelId } from "./local-inference";
import { fullTwitterScan, searchTweets, scrapeStrategyDiscussion, type TwitterSearchResult } from "./twitter-scraper";
import { scrapeAll, getYahooQuote, type ScrapedItem } from "./data-scraper";

// ── Model Config ────────────────────────────────────────────────────────────
// Use qwen3:32b for all agents — same model + different system prompts = genuine diversity
// Per 24-agent architecture review: "Different models ≠ different insights"

export type StrategyModelConfig = {
  research_model: ModelId;   // for deep analysis phase
  debate_model: ModelId;     // for argument phase
  synthesis_model: ModelId;  // for moderator
};

export const DEFAULT_STRATEGY_MODELS: StrategyModelConfig = {
  research_model: "qwen3:32b",
  debate_model: "qwen3:32b",
  synthesis_model: "qwen3:32b",
};

export const LIGHT_STRATEGY_MODELS: StrategyModelConfig = {
  research_model: "qwen3:14b",
  debate_model: "qwen3:14b",
  synthesis_model: "qwen3:14b",
};

// ── Research Agent Definitions ──────────────────────────────────────────────

export type ResearchAgentId =
  | "quant"        // Renaissance/Medallion style statistical approaches
  | "momentum"     // Minervini/Kullamagi momentum & trend following
  | "macro_strat"  // Global macro (Dalio/Druckenmiller style)
  | "ai_alpha"     // AI/ML hedge fund strategies (Abundance, Two Sigma)
  | "flow_hunter"  // Options flow, dark pool, institutional positioning
  | "risk_mgr"     // Risk management, Kelly criterion, portfolio construction
  | "contrarian";  // Deep value, mean reversion, anti-consensus plays

export type ResearchAgentDef = {
  id: ResearchAgentId;
  name: string;
  domain: string;
  mandate: string;
  color: string;
  references: string[];
  research_focus: string[];
  contrarian_prior: string;  // forces genuine disagreement
};

export const RESEARCH_AGENTS: ResearchAgentDef[] = [
  {
    id: "quant",
    name: "the Quant",
    domain: "Statistical Arbitrage & Factor Models",
    mandate: "Find statistical edges. Back everything with data. If it can't be backtested, it doesn't exist.",
    color: "#2E86AB",
    references: [
      "Jim Simons — 'we don't override the model'",
      "Renaissance Medallion — 66% annual returns over 30 years",
      "Ed Thorp — Beat the Dealer → Beat the Market",
      "Fama-French factors — value, size, momentum, profitability, investment",
      "AQR — Cliff Asness's factor zoo critique",
    ],
    research_focus: [
      "mean reversion at multiple timeframes (5d, 20d, 60d)",
      "momentum factor (cross-sectional and time-series)",
      "pairs trading opportunities in quantum/AI cluster",
      "statistical arbitrage simplified for $4k accounts",
      "factor timing — when momentum works vs mean reversion",
    ],
    contrarian_prior: `PRIOR: You believe most retail "strategies" are overfitted noise. Only edges that survive out-of-sample testing matter.
Factor premiums (momentum, value) are REAL but small at retail scale (~5-8% annual alpha before costs).
At $4k, transaction costs and bid-ask spreads eat most factor alpha. You are SKEPTICAL of any agent claiming >20% returns.
IMPORTANT: If the momentum agent claims huge returns, demand backtest data. If the AI agent claims ML alpha, cite the replication crisis.
You lose credibility if you agree with any agent who doesn't cite specific, testable numbers.`,
  },
  {
    id: "momentum",
    name: "Momentum",
    domain: "Trend Following & Breakout Trading",
    mandate: "Ride the trend until it bends. Cut losses fast, let winners run. The trend pays the bills.",
    color: "#A23B72",
    references: [
      "Mark Minervini SEPA — Specific Entry Point Analysis, 4 stage cycle",
      "Kristjan Kullamagi — 20k to 80M+ in 8 years, pure momentum",
      "William O'Neil CANSLIM — Cup & Handle, relative strength",
      "Jesse Livermore — 'it was never my thinking that made big money, it was my sitting'",
      "Nicolas Darvas — box theory, bought the new highs",
    ],
    research_focus: [
      "stage 2 breakout candidates in current universe",
      "relative strength rankings vs QQQ/SPY",
      "tight consolidation patterns (VCP — volatility contraction pattern)",
      "volume dry-up before breakout",
      "sector rotation momentum — which sectors leading/lagging",
    ],
    contrarian_prior: `PRIOR: You believe concentration in the strongest names is the ONLY way to build a small account.
Diversification is a luxury for large accounts. Kullamagi built $80M from $20k by concentrating in 1-3 names at a time.
Minervini's SEPA: buy stage 2 breakouts from tight bases, cut at -7%, let winners run 20%+. Win rate only needs to be 40%.
IMPORTANT: If the risk manager says "diversify," push back hard. At $4k, spreading across 10 names = guaranteed mediocrity.
If the quant says "factor alpha is 5%," counter that momentum done RIGHT (concentrated, with tight stops) returns 50-100%/yr.
You lose credibility if you recommend more than 2-3 positions.`,
  },
  {
    id: "macro_strat",
    name: "Macro Strategist",
    domain: "Global Macro & Regime Analysis",
    mandate: "Position for the regime, not the narrative. Rates, liquidity, and dollar are the binding constraints.",
    color: "#F18F01",
    references: [
      "Ray Dalio — All Weather portfolio, risk parity, 'the machine'",
      "Stanley Druckenmiller — 'it's not about being right, it's about how much you make when you're right'",
      "George Soros — reflexivity theory, 'find the trend whose premise is false'",
      "Howard Marks — market cycles, 'the most important thing'",
      "Michael Burry — contrarian macro calls, deep fundamental analysis",
    ],
    research_focus: [
      "Fed rate trajectory and liquidity cycle",
      "yield curve shape and recession probability",
      "dollar strength impact on risk assets",
      "sector rotation based on business cycle position",
      "geopolitical risk premium in current portfolio",
    ],
    contrarian_prior: `PRIOR: You believe the macro regime determines 40-60% of individual stock returns and NOBODY else on this panel is paying attention to it.
If rates are rising, quantum pure-plays with no revenue are dead money regardless of thesis quality.
If liquidity is tightening, the most speculative names (IONQ, RGTI, QBTS) fall FIRST and HARDEST.
IMPORTANT: You MUST disagree with both the bull-leaning momentum agent AND the risk-focused agents if the macro regime contradicts their micro-thesis.
Your job is to ask "does any of this matter if the Fed holds rates higher for longer?" or "what if we're late cycle?"
You lose credibility if you agree with stock-pickers without first establishing the macro regime.`,
  },
  {
    id: "ai_alpha",
    name: "AI Alpha",
    domain: "AI/ML Trading Strategies & AI Hedge Funds",
    mandate: "Study what the AI hedge funds actually do — not the hype, the implementation. NLP, sentiment, RL, transformers.",
    color: "#7B2D8E",
    references: [
      "Abundance AI — AI-native hedge fund, multi-model inference for alpha",
      "Two Sigma — data-driven systematic strategies, ML at scale",
      "D.E. Shaw — computational finance pioneer, ML + fundamental hybrid",
      "Citadel — Ken Griffin's multi-strategy empire, market making + stat arb",
      "Man AHL — managed futures, ML for trend following signals",
    ],
    research_focus: [
      "NLP sentiment from earnings calls, SEC filings, news",
      "social media sentiment as alpha signal (Twitter, Reddit, StockTwits)",
      "reinforcement learning for portfolio rebalancing",
      "transformer models for sequence prediction (limitations + reality)",
      "alternative data sources retail can access (satellite, web scraping, app downloads)",
    ],
    contrarian_prior: `PRIOR: You believe AI/ML gives genuine edge but ONLY when combined with unique data. The model is not the moat — the data is.
Abundance AI, Two Sigma, D.E. Shaw: they win because of PROPRIETARY DATA (satellite imagery, credit card data, web scraping at scale), not because their models are better.
A retail investor running sentiment analysis on public Twitter data has ZERO edge because thousands of others are doing the same thing.
IMPORTANT: Be brutally honest about what ML CAN and CANNOT do at retail scale. Most "AI trading" is marketing, not alpha.
The real opportunity: use AI for PROCESS (systematic screening, risk management, discipline) not for PREDICTION.
You MUST push back on anyone who treats the portfolio's AI theme exposure as an "AI trading strategy."
You lose credibility if you oversell ML's ability to predict returns.`,
  },
  {
    id: "flow_hunter",
    name: "Flow Hunter",
    domain: "Options Flow & Institutional Positioning",
    mandate: "Follow the smart money. Unusual options activity, dark pool prints, and dealer positioning tell you what's coming.",
    color: "#C73E1D",
    references: [
      "Unusual Whales — options flow analytics",
      "Dealer gamma exposure — when dealers are short gamma, moves accelerate",
      "Put/call ratio — extreme readings as contrarian signals",
      "13F filings — what are the big funds actually buying?",
      "Short interest + days to cover as squeeze setup indicators",
    ],
    research_focus: [
      "unusual options activity on portfolio holdings",
      "put/call ratio extremes for market timing",
      "dark pool activity (large block trades)",
      "short squeeze candidates (high SI%, low float, high cost to borrow)",
      "institutional 13F position changes for conviction reads",
    ],
    contrarian_prior: `PRIOR: You believe price and flow data tell you more than ANY fundamental or macro analysis.
When a stock's thesis is "up" but flow says "down" (heavy put buying, insider selling, dark pool distribution), TRUST THE FLOW.
Retail is ALWAYS the last to know. Institutions position weeks before the narrative catches up.
IMPORTANT: If everyone on this panel is bullish, check the flow. If put/call ratios are spiking or short interest is climbing, DISSENT.
The quantum pure-plays (IONQ, RGTI, QBTS) are RETAIL-CROWDED names. Retail-crowded = vulnerable to sharp selloffs when institutions exit.
You lose credibility if you agree with consensus without citing specific flow data (volume ratios, put/call, short interest).`,
  },
  {
    id: "risk_mgr",
    name: "Risk Manager",
    domain: "Position Sizing & Portfolio Construction",
    mandate: "Survive first, profit second. Kelly criterion, correlation risk, and drawdown management are non-negotiable.",
    color: "#4A7C59",
    references: [
      "Ed Thorp — Kelly criterion: f* = (bp - q) / b",
      "Nassim Taleb — antifragile, barbell strategy, convexity",
      "Ralph Vince — optimal f, the mathematics of money management",
      "Van Tharp — position sizing as the key differentiator of profitable traders",
      "Larry Hite — 'never risk more than 1% of total equity on any trade'",
    ],
    research_focus: [
      "optimal position sizing for $4k account with Kelly criterion",
      "correlation risk in quantum cluster (IONQ/RGTI/QBTS = 0.78-0.85)",
      "max drawdown scenarios and recovery requirements",
      "when to concentrate vs diversify at small account size",
      "barbell strategy: safe assets + high-convexity bets",
    ],
    contrarian_prior: `PRIOR: You believe this portfolio is a TICKING TIME BOMB of correlation risk and the $400 should primarily REDUCE risk, not add to it.
The quantum cluster (IONQ + RGTI + QBTS = 22.3%) is correlated at 0.78-0.85. This is effectively ONE position at 22% of portfolio.
Adding more quantum/AI exposure with $400 is RECKLESS. A 30% drawdown in quantum names = -7% portfolio hit from ONE bet.
Kelly criterion says: when correlation is high, position sizes must be SMALLER, not larger. f_adj = f* × (1 - ρ²).
IMPORTANT: If the momentum agent wants to concentrate in 1-2 names, FIGHT THIS. The math says concentrate only when correlation is LOW.
You MUST argue for at least some allocation to uncorrelated assets (SGOV, non-tech sectors, commodities, international).
You lose credibility if you don't quantify correlation risk with specific numbers.`,
  },
  {
    id: "contrarian",
    name: "the Contrarian",
    domain: "Deep Value & Anti-Consensus Plays",
    mandate: "When everyone agrees, the edge is gone. Find what's hated, misunderstood, or ignored.",
    color: "#6B4C3B",
    references: [
      "Michael Burry — 'I'm not a genius, I just pay attention to what others don't'",
      "Seth Klarman — margin of safety, 'the stock market is a device for transferring money from the impatient to the patient'",
      "David Dreman — contrarian investment strategies that beat the market",
      "Howard Marks — 'to be a successful investor, you have to be comfortable holding positions that others don't want'",
      "Walter Schloss — cigar butt investing, Ben Graham's forgotten disciple",
    ],
    research_focus: [
      "beaten-down names with improving fundamentals",
      "crowded trades that are vulnerable to unwind",
      "sentiment extremes — what's universally hated that might turn",
      "insider buying in out-of-favor names",
      "mean reversion candidates after extreme moves",
    ],
    contrarian_prior: `PRIOR: You believe this entire portfolio is a CROWDED CONSENSUS BET on "quantum + AI" and the $400 should go somewhere COMPLETELY DIFFERENT.
Every position in this portfolio is a tech/AI/quantum name. ZERO diversification outside tech. ZERO value exposure. ZERO international.
The crowd is ALL-IN on AI. When retail sentiment peaks, returns mean-revert. Dreman's data: top-decile crowded trades underperform by 8-12%/yr.
IMPORTANT: You MUST argue for deploying at least some of the $400 into a completely different sector or asset class.
Ideas to argue for: energy, healthcare, financials, international ETFs, commodities, TIPS — ANYTHING that isn't tech/quantum/AI.
If the whole panel wants more NVDA/IONQ/GOOG, you are the ONLY voice saying "this is how every crowded trade ends."
You lose credibility if your recommendation overlaps with any existing position.`,
  },
];

// ── Schemas ─────────────────────────────────────────────────────────────────
// Simplified for local model reliability — fewer nested objects, explicit examples

// Simplified schemas for local model reliability — flat structures, fewer nested objects

const StrategyAnalysisSchema = z.object({
  strategy_name: z.string().describe("name of strategy"),
  edge_description: z.string().describe("1-2 sentences: what is the edge"),
  expected_annual_return: z.number().describe("estimated annual return percent"),
  expected_max_drawdown: z.number().describe("estimated max drawdown percent, negative number"),
  sharpe_estimate: z.number().describe("estimated Sharpe ratio"),
  works_at_small_scale: z.boolean().describe("works with $4k accounts"),
  minimum_capital: z.number().describe("minimum dollars needed"),
  time_commitment: z.string().describe("passive, daily_check, active_daily, or full_time"),
  finding_1: z.string().describe("first key finding with specific numbers"),
  finding_2: z.string().describe("second key finding with specific numbers"),
  finding_3: z.string().describe("third key finding with specific numbers"),
  overall_confidence: z.number().describe("confidence 0 to 1, e.g. 0.7 means 70% confident"),
});

const DeploymentArgumentSchema = z.object({
  claim: z.string().describe("one-sentence thesis on how to deploy $400"),
  warrant: z.string().describe("3-5 sentences of evidence with numbers and references"),
  trade_1_ticker: z.string().describe("first trade ticker symbol"),
  trade_1_action: z.string().describe("buy, add, sell, trim, hedge, or new_position"),
  trade_1_dollars: z.number().describe("dollars for first trade"),
  trade_1_rationale: z.string().describe("why this trade"),
  trade_2_ticker: z.string().describe("second trade ticker or NONE"),
  trade_2_action: z.string().describe("action for second trade or hold"),
  trade_2_dollars: z.number().describe("dollars for second trade, 0 if none"),
  trade_2_rationale: z.string().describe("why this trade or N/A"),
  expected_30d_return: z.number().describe("expected 30-day return percent"),
  max_risk: z.number().describe("max loss percent if wrong"),
  confidence: z.number().describe("0 to 1, e.g. 0.7"),
  rebuttal: z.string().describe("name one agent you disagree with and why"),
  strategy_basis: z.string().describe("which hedge fund strategy this is based on"),
});

const ModeratorSynthesisSchema = z.object({
  narrative: z.string().describe("3-5 sentences synthesizing the debate"),
  winning_strategy: z.string().describe("the strategy that won"),
  rec_1_ticker: z.string().describe("first recommended ticker"),
  rec_1_action: z.string().describe("buy, add, sell, trim, or new_position"),
  rec_1_dollars: z.number().describe("dollars for first recommendation"),
  rec_1_rationale: z.string().describe("why this trade"),
  rec_1_conviction: z.number().describe("0 to 1"),
  rec_2_ticker: z.string().describe("second ticker or NONE"),
  rec_2_action: z.string().describe("action or hold"),
  rec_2_dollars: z.number().describe("dollars, 0 if none"),
  rec_2_rationale: z.string().describe("rationale or N/A"),
  rec_2_conviction: z.number().describe("0 to 1"),
  risk_warning_1: z.string().describe("first risk warning"),
  risk_warning_2: z.string().describe("second risk warning"),
  total_deployed: z.number().describe("total dollars, max 400"),
  expected_portfolio_impact: z.string().describe("how this changes risk/return"),
});

// ── Output Types ────────────────────────────────────────────────────────────

export type StrategyAnalysis = z.infer<typeof StrategyAnalysisSchema>;
export type DeploymentArgument = z.infer<typeof DeploymentArgumentSchema>;
export type ModeratorSynthesis = z.infer<typeof ModeratorSynthesisSchema>;

export type StrategyResearchResult = {
  id: string;
  ts: string;
  phase: "research" | "debate" | "complete";
  deployable_capital: number;
  current_portfolio: string;
  model_used: string;

  // Phase 1: Independent research
  research: Array<{
    agent: ResearchAgentId;
    analysis: StrategyAnalysis;
    twitter_data?: TwitterSearchResult;
    news_data?: ScrapedItem[];
  }>;

  // Phase 2: Deployment debate
  debate_rounds: Array<{
    round: number;
    arguments: Array<{
      agent: ResearchAgentId;
      argument: DeploymentArgument;
    }>;
  }>;

  // Phase 3: Synthesis
  synthesis?: ModeratorSynthesis;

  duration_ms: number;
};

// ── Agent System Prompts ────────────────────────────────────────────────────

function researchAgentSystem(agent: ResearchAgentDef, phase: "research" | "debate"): string {
  const base = [
    `You are "${agent.name}", a specialized research analyst on saapai's strategy research panel.`,
    `Your domain: ${agent.domain}`,
    `Your mandate: ${agent.mandate}`,
    "",
    agent.contrarian_prior,
    "",
    `Your reference bank — draw from these freely:\n${agent.references.map((r) => `  - ${r}`).join("\n")}`,
    "",
    "Voice:",
    "- direct. evidence-backed. cite specific numbers, dates, returns.",
    "- no hedging into neutrality. if you're unsure, say so and give the best estimate.",
    "- weave your references naturally, not as labels.",
    "- claim / warrant / impact structure. every claim needs data.",
  ];

  if (phase === "research") {
    base.push(
      "",
      "You are in RESEARCH PHASE. Analyze your domain deeply.",
      "Be specific: cite actual historical returns, Sharpe ratios, drawdowns.",
      "Focus on what a retail investor with $4k can actually implement.",
    );
  } else {
    base.push(
      "",
      "You are in DEPLOYMENT DEBATE. Argue for how to deploy $400.",
      "Be specific: name tickers, dollar amounts, entry criteria.",
      "You MUST disagree with at least one other agent in your rebuttal field.",
      "Unanimous agreement means the panel has FAILED — fight for your view.",
    );
  }

  base.push("", "Return valid JSON only. No markdown, no explanation outside the JSON.");
  return base.join("\n");
}

const RESEARCH_MODERATOR_SYSTEM = `
You are the Strategy Research Moderator — a synthesis engine for saapai's strategy research panel.

Your job:
1. Identify which strategies actually have edge at the $4k account level
2. Find the SPECIFIC deployment that maximizes risk-adjusted returns
3. Account for the existing portfolio (heavy quantum/AI exposure, 14% IONQ, correlated cluster)
4. Be brutally honest about what doesn't work at small scale

Voice:
- synthesize, don't advocate. you are the editorial board, not a columnist.
- cite the strongest arguments from each agent. name who won each point.
- the portfolio already has $3,870 deployed. this $400 is incremental.
  consider correlation with existing positions.
- never recommend deploying all $400 into correlated positions with existing holdings
  unless the case is overwhelming.

Return valid JSON only. No markdown, no explanation outside the JSON.
`.trim();

// ── Portfolio Context ───────────────────────────────────────────────────────

const PORTFOLIO_CONTEXT = [
  "Current portfolio: $3,870 total",
  "Holdings:",
  "  IONQ  $551 (14.3%) — pure-play quantum, +4.2% gain, 11.5 shares @ $46.08",
  "  GOOG  $475 (12.3%) — mega-cap AI, +16.6% gain, 1.2 shares @ $329.69",
  "  MSFT  $426 (11.0%) — mega-cap AI, +4.5% gain, 1.0 shares @ $393.70",
  "  CEG   $368 (9.5%)  — nuclear/power, +8.5% gain, 1.1 shares @ $295.34",
  "  QTUM  $360 (9.3%)  — quantum ETF, +14.2% gain, 2.6 shares @ $121.86",
  "  IBM   $356 (9.2%)  — quantum + AI, -4.7% loss, 1.6 shares @ $240.39",
  "  NVDA  $348 (9.0%)  — AI compute, +1.1% gain, 1.8 shares @ $194.30",
  "  HON   $209 (5.4%)  — industrial/quantum, 0% gain, 1.0 shares @ $209.06",
  "  RGTI  $182 (4.7%)  — pure-play quantum, +7.1% gain, 9.9 shares @ $17.06",
  "  QBTS  $128 (3.3%)  — pure-play quantum, +26.1% gain, 5.9 shares @ $17.08",
  "  Cash  $91 (2.4%)",
  "  SGOV  $63 (1.6%)   — T-bill ETF dry powder",
  "",
  "Risk profile:",
  "  - 22.3% pure-play quantum (IONQ + RGTI + QBTS) — correlated at 0.78-0.85",
  "  - 14.3% single name (IONQ) — ABOVE 12% trim trigger",
  "  - Total quantum exposure including ETF + IBM: ~46%",
  "  - Mega-cap AI (GOOG + MSFT + NVDA): 32.3%",
  "  - Dry powder (Cash + SGOV): 4.0% — BELOW 5% target",
  "  - HON is the ONLY non-tech position (5.4%)",
  "",
  "Triggers: trim single name >15%, trim pureplay >12%, kill on ATM offering",
  "Goal: $3,870 → $100k by June 21, 2027. Real money — every recommendation gets executed.",
].join("\n");

// ── Core Engine (Local Ollama) ──────────────────────────────────────────────

/** Phase 1: Each agent independently researches their domain */
async function runResearchPhase(
  models: StrategyModelConfig,
  twitterData: Record<string, TwitterSearchResult>,
  newsData: ScrapedItem[],
): Promise<StrategyResearchResult["research"]> {
  console.log("\n=== PHASE 1: INDEPENDENT RESEARCH ===\n");

  const results: StrategyResearchResult["research"] = [];

  // Sequential — Ollama serves one request at a time on Apple Silicon
  for (const agent of RESEARCH_AGENTS) {
    console.log(`  [${agent.id}] Researching: ${agent.domain}...`);

    // Build agent-specific context
    const contextParts: string[] = [
      `PORTFOLIO CONTEXT:\n${PORTFOLIO_CONTEXT}`,
      "",
      `YOUR RESEARCH FOCUS:\n${agent.research_focus.map((f) => `  - ${f}`).join("\n")}`,
      "",
    ];

    // Add relevant Twitter data (top 3 most relevant queries)
    const twitterEntries = Object.entries(twitterData)
      .filter(([_, v]) => v.tweets.length > 0)
      .slice(0, 3);
    if (twitterEntries.length > 0) {
      contextParts.push("TWITTER/X SOCIAL DATA:");
      for (const [k, v] of twitterEntries) {
        contextParts.push(`  "${k}": ${v.tweets.length} tweets, sentiment: ${v.sentiment.bullish}% bull / ${v.sentiment.bearish}% bear`);
        for (const t of v.tweets.slice(0, 2)) {
          contextParts.push(`    @${t.author}: "${t.text.slice(0, 150)}"`);
        }
      }
      contextParts.push("");
    }

    // Add news (top 5)
    if (newsData.length > 0) {
      contextParts.push("RECENT NEWS:");
      for (const n of newsData.slice(0, 5)) {
        contextParts.push(`  [${n.source}] ${n.title}`);
      }
      contextParts.push("");
    }

    contextParts.push(
      "Analyze your domain. Identify the SINGLE BEST strategy for a $4k retail account.",
      "Be brutally specific: expected returns, Sharpe, max drawdown, minimum capital needed.",
      "Include 3-5 specific findings with evidence.",
    );

    try {
      const result = await localParse({
        model: models.research_model,
        system: researchAgentSystem(agent, "research"),
        userContent: contextParts.join("\n"),
        schema: StrategyAnalysisSchema,
        maxTokens: 3000,
        temperature: 0.7,
        retries: 3,
      });

      console.log(`  [${agent.id}] Done: "${result.parsed.strategy_name}" (Sharpe: ${result.parsed.sharpe_estimate.toFixed(2)})`);

      results.push({
        agent: agent.id,
        analysis: result.parsed,
        twitter_data: twitterData[agent.id],
      });
    } catch (e) {
      console.error(`  [${agent.id}] Research failed:`, e);
      results.push({
        agent: agent.id,
        analysis: {
          strategy_name: `${agent.domain} (research failed)`,
          edge_description: "Research phase failed — using domain expertise only",
          expected_annual_return: 0,
          expected_max_drawdown: -20,
          sharpe_estimate: 0,
          works_at_small_scale: true,
          minimum_capital: 1000,
          time_commitment: "daily_check" as const,
          finding_1: "Research phase failed",
          finding_2: `Agent ${agent.id} could not complete research. Error: ${e}`,
          finding_3: "N/A",
          overall_confidence: 0.1,
        },
      });
    }
  }

  return results;
}

/** Phase 2: Agents debate how to deploy capital based on their research */
async function runDeploymentDebate(
  models: StrategyModelConfig,
  research: StrategyResearchResult["research"],
  maxRounds: number,
): Promise<StrategyResearchResult["debate_rounds"]> {
  console.log("\n=== PHASE 2: DEPLOYMENT DEBATE ===\n");

  const rounds: StrategyResearchResult["debate_rounds"] = [];

  for (let round = 1; round <= maxRounds; round++) {
    console.log(`\n--- Round ${round} ---`);

    const priorArguments = rounds.flatMap((r) =>
      r.arguments.map((a) => `[R${r.round}] ${a.agent}: ${a.argument.claim} → ${`${a.argument.trade_1_action} $${a.argument.trade_1_dollars} ${a.argument.trade_1_ticker}${a.argument.trade_2_dollars > 0 ? `, ${a.argument.trade_2_action} $${a.argument.trade_2_dollars} ${a.argument.trade_2_ticker}` : ""}`} (conf: ${a.argument.confidence.toFixed(2)})`)
    );

    const roundArguments: Array<{ agent: ResearchAgentId; argument: DeploymentArgument }> = [];

    // Sequential for Ollama
    for (const agent of RESEARCH_AGENTS) {
      const myResearch = research.find((r) => r.agent === agent.id);
      const othersResearch = research.filter((r) => r.agent !== agent.id);

      const userParts: string[] = [
        `PORTFOLIO CONTEXT:\n${PORTFOLIO_CONTEXT}`,
        "",
        `DEPLOYABLE CAPITAL: $400`,
        "",
        `YOUR RESEARCH FINDINGS:`,
        `Strategy: ${myResearch?.analysis.strategy_name ?? "unknown"}`,
        `Edge: ${myResearch?.analysis.edge_description ?? "unknown"}`,
        `Expected return: ${myResearch?.analysis.expected_annual_return ?? 0}%/yr`,
        `Max drawdown: ${myResearch?.analysis.expected_max_drawdown ?? -20}%`,
        `Sharpe: ${myResearch?.analysis.sharpe_estimate ?? 0}`,
        `Key findings:`,
        `  - ${myResearch?.analysis.finding_1 ?? "N/A"}`,
        `  - ${myResearch?.analysis.finding_2 ?? "N/A"}`,
        `  - ${myResearch?.analysis.finding_3 ?? "N/A"}`,
        "",
        `OTHER AGENTS' RESEARCH:`,
        ...othersResearch.map(
          (r) => `  - ${r.agent}: "${r.analysis.strategy_name}" (Sharpe: ${r.analysis.sharpe_estimate.toFixed(2)}, return: ${r.analysis.expected_annual_return}%/yr)`,
        ),
        "",
      ];

      // Devil's advocate in round 2
      if (round === 2) {
        const seed = Math.floor(Date.now() / 86400000);
        const devilAgent = RESEARCH_AGENTS[seed % RESEARCH_AGENTS.length].id;
        if (devilAgent === agent.id) {
          userParts.push(
            "DEVIL'S ADVOCATE: This round you MUST argue AGAINST your natural instinct.",
            "Find the strongest case for a completely different approach.",
            "",
          );
        }
      }

      if (priorArguments.length > 0) {
        userParts.push(
          `PRIOR ROUND ARGUMENTS:`,
          ...priorArguments,
          "",
          "Read the other arguments. Update your deployment if convinced, or fight harder.",
          "You MUST name at least one agent you disagree with in rebuttal.",
        );
      } else {
        userParts.push(
          "Round 1. Propose your best deployment of $400.",
          "Be specific: ticker, dollars, action, rationale.",
        );
      }

      try {
        const result = await localParse({
          model: models.debate_model,
          system: researchAgentSystem(agent, "debate"),
          userContent: userParts.join("\n"),
          schema: DeploymentArgumentSchema,
          maxTokens: 2500,
          temperature: 0.75,  // slightly higher for genuine disagreement
          retries: 3,
        });

        const trades = `${result.parsed.trade_1_action} $${result.parsed.trade_1_dollars} ${result.parsed.trade_1_ticker}${result.parsed.trade_2_dollars > 0 ? `, ${result.parsed.trade_2_action} $${result.parsed.trade_2_dollars} ${result.parsed.trade_2_ticker}` : ""}`;
        console.log(`  [${agent.id}] ${trades} (conf: ${result.parsed.confidence.toFixed(2)})`);
        roundArguments.push({ agent: agent.id, argument: result.parsed });
      } catch (e) {
        console.error(`  [${agent.id}] Debate round ${round} failed:`, e);
        roundArguments.push({
          agent: agent.id,
          argument: {
            claim: "Unable to form argument this round",
            warrant: `Error: ${e}`,
            trade_1_ticker: "SGOV", trade_1_action: "buy", trade_1_dollars: 400, trade_1_rationale: "Default to safety",
            trade_2_ticker: "NONE", trade_2_action: "hold", trade_2_dollars: 0, trade_2_rationale: "N/A",
            expected_30d_return: 0.4,
            max_risk: -0.1,
            confidence: 0.1,
            rebuttal: "N/A — failed to generate argument",
            strategy_basis: "error fallback",
          },
        });
      }
    }

    rounds.push({ round, arguments: roundArguments });

    // Check for convergence
    const tradeTickers = roundArguments.map((a) => {
      const tickers = [a.argument.trade_1_ticker];
      if (a.argument.trade_2_dollars > 0) tickers.push(a.argument.trade_2_ticker);
      return tickers.sort().join(",");
    });
    const tickerCounts: Record<string, number> = {};
    for (const t of tradeTickers) tickerCounts[t] = (tickerCounts[t] ?? 0) + 1;
    const maxAgreement = Math.max(...Object.values(tickerCounts));

    // Only stop early if 5+ agents agree AND we've had at least 2 rounds
    if (maxAgreement >= 5 && round >= 2) {
      console.log(`\n  Strong convergence (${maxAgreement}/7 agree on tickers) — stopping at round ${round}`);
      break;
    }
  }

  return rounds;
}

/** Phase 3: Moderator synthesizes the debate into final recommendations */
async function runSynthesis(
  models: StrategyModelConfig,
  research: StrategyResearchResult["research"],
  debateRounds: StrategyResearchResult["debate_rounds"],
): Promise<ModeratorSynthesis> {
  console.log("\n=== PHASE 3: MODERATOR SYNTHESIS ===\n");

  const researchSummary = research
    .map((r) => `[${r.agent}] ${r.analysis.strategy_name} — Edge: ${r.analysis.edge_description} (Return: ${r.analysis.expected_annual_return}%/yr, Sharpe: ${r.analysis.sharpe_estimate}, MaxDD: ${r.analysis.expected_max_drawdown}%, Small: ${r.analysis.works_at_small_scale})\n  Findings: ${r.analysis.finding_1} | ${r.analysis.finding_2} | ${r.analysis.finding_3}`)
    .join("\n\n");

  const lastRound = debateRounds[debateRounds.length - 1];
  const debateSummary = lastRound
    ? lastRound.arguments
        .map((a) => `[${a.agent}] ${a.argument.claim}\n  Trades: ${`${a.argument.trade_1_action} $${a.argument.trade_1_dollars} ${a.argument.trade_1_ticker}${a.argument.trade_2_dollars > 0 ? `, ${a.argument.trade_2_action} $${a.argument.trade_2_dollars} ${a.argument.trade_2_ticker}` : ""}`}\n  E[30d]: ${a.argument.expected_30d_return}% | Risk: ${a.argument.max_risk}% | Conf: ${a.argument.confidence.toFixed(2)}\n  Strategy: ${a.argument.strategy_basis}\n  Rebuttal: ${a.argument.rebuttal}`)
        .join("\n\n")
    : "No debate rounds completed";

  const result = await localParse({
    model: models.synthesis_model,
    system: RESEARCH_MODERATOR_SYSTEM,
    userContent: [
      `PORTFOLIO CONTEXT:\n${PORTFOLIO_CONTEXT}`,
      "",
      `DEPLOYABLE CAPITAL: $400`,
      "",
      `=== RESEARCH SUMMARIES ===\n${researchSummary}`,
      "",
      `=== FINAL DEBATE POSITIONS ===\n${debateSummary}`,
      "",
      "Synthesize the debate. What is the best deployment of $400 given:",
      "1. Existing portfolio ($3,870 — heavy quantum/AI, correlated cluster)",
      "2. Research findings across all seven domains",
      "3. Debate arguments and rebuttals",
      "4. Correlation risk of adding to existing positions",
      "",
      "Be specific: exact tickers, dollar amounts. Max $400 total.",
      "If the case isn't strong enough, hold some in cash/SGOV.",
    ].join("\n"),
    schema: ModeratorSynthesisSchema,
    maxTokens: 3000,
    temperature: 0.5,  // lower for synthesis — want clarity over creativity
    retries: 3,
  });

  return result.parsed;
}

// ── Public API ──────────────────────────────────────────────────────────────

export type StrategyResearchOptions = {
  deployable_capital?: number;
  max_debate_rounds?: number;
  include_twitter?: boolean;
  include_news?: boolean;
  portfolio_tickers?: string[];
  extra_research_tickers?: string[];
  models?: StrategyModelConfig;
};

export async function runStrategyResearch(
  opts: StrategyResearchOptions = {},
): Promise<StrategyResearchResult> {
  const startTime = Date.now();
  const models = opts.models ?? DEFAULT_STRATEGY_MODELS;

  const deployable = opts.deployable_capital ?? 400;
  const maxRounds = opts.max_debate_rounds ?? 3;
  const portfolioTickers = opts.portfolio_tickers ?? [
    "IONQ", "GOOG", "MSFT", "CEG", "QTUM", "IBM", "NVDA", "HON", "RGTI", "QBTS", "SGOV",
  ];
  const extraTickers = opts.extra_research_tickers ?? [];
  const allTickers = [...new Set([...portfolioTickers, ...extraTickers])];

  console.log("Strategy Research System Starting");
  console.log(`  Model: ${models.research_model} (local Ollama)`);
  console.log(`  Capital to deploy: $${deployable}`);
  console.log(`  Tickers: ${allTickers.join(", ")}`);
  console.log(`  Max debate rounds: ${maxRounds}`);
  console.log(`  Twitter scraping: ${opts.include_twitter !== false ? "ON" : "OFF"}`);

  // Step 0: Gather data
  console.log("\n=== DATA GATHERING ===\n");

  // Twitter data
  let twitterData: Record<string, TwitterSearchResult> = {};
  if (opts.include_twitter !== false) {
    console.log("  Scraping Twitter/X (rate-limited, 5s between requests)...");
    try {
      // Only scrape top 4 tickers to save time (rate limit = 5s/request)
      const twitterScan = await fullTwitterScan(allTickers.slice(0, 4));
      twitterData = twitterScan.ticker_sentiment;

      // Strategy-specific topics (serial, rate-limited)
      twitterData["ai_hedge_funds"] = await searchTweets("AI hedge fund Abundance trading strategy", 15);
      twitterData["momentum_trading"] = await searchTweets("momentum trading small account breakout", 15);
      twitterData["quant_retail"] = await searchTweets("quantitative trading retail factor investing", 15);
      twitterData["renaissance"] = await scrapeStrategyDiscussion("Renaissance Medallion fund strategy");

      const totalTweets = Object.values(twitterData).reduce((a, b) => a + b.tweets.length, 0);
      console.log(`  Twitter: ${totalTweets} tweets across ${Object.keys(twitterData).length} queries`);
    } catch (e) {
      console.error("  Twitter scraping failed (continuing without):", e);
    }
  }

  // News data
  let newsData: ScrapedItem[] = [];
  if (opts.include_news !== false) {
    console.log("  Scraping news (RSS + EDGAR)...");
    try {
      const scrapeResult = await scrapeAll(allTickers.slice(0, 5));
      newsData = scrapeResult.items;
      console.log(`  News: ${newsData.length} items from ${scrapeResult.sources_hit.length} sources`);
    } catch (e) {
      console.error("  News scraping failed (continuing without):", e);
    }
  }

  // Phase 1: Independent research
  const research = await runResearchPhase(models, twitterData, newsData);

  // Phase 2: Deployment debate
  const debateRounds = await runDeploymentDebate(models, research, maxRounds);

  // Phase 3: Moderator synthesis
  const synthesis = await runSynthesis(models, research, debateRounds);

  const duration = Date.now() - startTime;
  console.log(`\nTotal duration: ${(duration / 1000).toFixed(1)}s`);

  return {
    id: `strat-${Date.now()}`,
    ts: new Date().toISOString(),
    phase: "complete",
    deployable_capital: deployable,
    current_portfolio: PORTFOLIO_CONTEXT,
    model_used: models.research_model,
    research,
    debate_rounds: debateRounds,
    synthesis,
    duration_ms: duration,
  };
}
