#!/usr/bin/env python3
"""
CRITICAL validation of the LightGBM backtest claiming +63.8% over 6 months.
Tests 5 unvalidated risks:
  1. Transaction cost impact (0.25% slippage each way)
  2. Survivorship bias in ticker universe
  3. Information Coefficient (Spearman rank correlation)
  4. Deflated Sharpe Ratio (Bailey & de Prado)
  5. Feature importance stability

Usage: python scripts/quant/validate_backtest.py
"""

import sys
import warnings
from pathlib import Path

import numpy as np
import pandas as pd
from scipy import stats

warnings.filterwarnings("ignore")

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
RESULTS_PATH = REPO_ROOT / "models" / "backtest_results.csv"
TRADES_PATH = REPO_ROOT / "models" / "backtest_trades.csv"
CLF_IMPORTANCE_PATH = REPO_ROOT / "models" / "clf_feature_importance.csv"
REG_IMPORTANCE_PATH = REPO_ROOT / "models" / "reg_feature_importance.csv"
FEATURES_PATH = REPO_ROOT / "data" / "ml_features.parquet"

HOLD_DAYS = 5
PERIODS_PER_YEAR = 252 / HOLD_DAYS  # 50.4


def separator(title: str):
    print(f"\n{'='*70}")
    print(f"  {title}")
    print(f"{'='*70}\n")


# ── 1. BASIC STATS + TRANSACTION COST IMPACT ────────────────────────────────

def validate_basic_stats_and_costs():
    separator("1. BASIC STATS + TRANSACTION COST IMPACT")

    results = pd.read_csv(str(RESULTS_PATH))
    trades = pd.read_csv(str(TRADES_PATH))

    n_periods = len(results)
    n_trades = len(trades)

    # Raw return
    raw_total = (1 + results["return"]).prod() - 1
    hit_rate = (results["return"] > 0).mean()

    # Per-trade stats
    mean_trade_ret = trades["actual_5d_ret"].mean()
    median_trade_ret = trades["actual_5d_ret"].median()

    print(f"Rebalance periods:     {n_periods}")
    print(f"Total individual picks: {n_trades}")
    print(f"Unique tickers picked: {trades['ticker'].nunique()}")
    print(f"Raw total return:      {raw_total*100:+.2f}%")
    print(f"Hit rate (periods):    {hit_rate*100:.1f}%")
    print(f"Mean per-pick return:  {mean_trade_ret*100:+.3f}%")
    print(f"Median per-pick return:{median_trade_ret*100:+.3f}%")

    # Transaction costs: 0.25% slippage each way = 0.5% round-trip
    # Each rebalance buys 3 stocks and sells 3 stocks (assuming full turnover)
    # Conservative: apply 0.5% round-trip cost per rebalance period
    SLIPPAGE_ONEWAY = 0.0025
    ROUNDTRIP = 2 * SLIPPAGE_ONEWAY  # 0.5%

    # Check actual turnover: how many positions change each period
    results_sorted = results.sort_values("date").reset_index(drop=True)
    turnover_rates = []
    for i in range(1, len(results_sorted)):
        prev_tickers = set(results_sorted.iloc[i-1]["tickers"].split(", "))
        curr_tickers = set(results_sorted.iloc[i]["tickers"].split(", "))
        changed = len(prev_tickers.symmetric_difference(curr_tickers))
        turnover = changed / (2 * 3)  # fraction of portfolio that turned over
        turnover_rates.append(turnover)

    avg_turnover = np.mean(turnover_rates)
    print(f"\nAverage turnover/rebalance: {avg_turnover*100:.1f}%")

    # Cost per period = turnover * round-trip cost
    cost_per_period = avg_turnover * ROUNDTRIP
    print(f"Cost per period (turnover-adj): {cost_per_period*100:.3f}%")

    # Also compute assuming FULL turnover (worst case)
    cost_full = ROUNDTRIP
    print(f"Cost per period (full turnover): {cost_full*100:.3f}%")

    # Net returns after costs
    net_returns_adj = results["return"] - cost_per_period
    net_total_adj = (1 + net_returns_adj).prod() - 1

    net_returns_full = results["return"] - cost_full
    net_total_full = (1 + net_returns_full).prod() - 1

    print(f"\n--- After Transaction Costs ---")
    print(f"  Turnover-adjusted: {net_total_adj*100:+.2f}% (was {raw_total*100:+.2f}%)")
    print(f"  Full-turnover:     {net_total_full*100:+.2f}% (was {raw_total*100:+.2f}%)")
    print(f"  Cost drag (adj):   {(raw_total - net_total_adj)*100:.2f}pp")
    print(f"  Cost drag (full):  {(raw_total - net_total_full)*100:.2f}pp")

    # Sharpe before and after
    raw_sharpe = (results["return"].mean() / results["return"].std()) * np.sqrt(PERIODS_PER_YEAR)
    net_sharpe = (net_returns_adj.mean() / net_returns_adj.std()) * np.sqrt(PERIODS_PER_YEAR)
    print(f"\n  Sharpe (raw):  {raw_sharpe:.3f}")
    print(f"  Sharpe (net):  {net_sharpe:.3f}")

    # Max drawdown
    cum = (1 + results["return"]).cumprod()
    max_dd = ((cum - cum.cummax()) / cum.cummax()).min()
    cum_net = (1 + net_returns_adj).cumprod()
    max_dd_net = ((cum_net - cum_net.cummax()) / cum_net.cummax()).min()
    print(f"  Max DD (raw):  {max_dd*100:.2f}%")
    print(f"  Max DD (net):  {max_dd_net*100:.2f}%")

    return results, trades, raw_sharpe


# ── 2. SURVIVORSHIP BIAS ────────────────────────────────────────────────────

def validate_survivorship_bias():
    separator("2. SURVIVORSHIP BIAS ANALYSIS")

    df = pd.read_parquet(str(FEATURES_PATH))
    df["date"] = pd.to_datetime(df["date"])

    tickers = sorted(df["ticker"].unique())
    print(f"Total tickers in dataset: {len(tickers)}")

    # Check date coverage per ticker
    ticker_coverage = df.groupby("ticker").agg(
        first_date=("date", "min"),
        last_date=("date", "max"),
        n_days=("date", "count"),
    ).sort_values("first_date")

    # Tickers that START during the test period = potential survivorship issue
    test_start = df["date"].max() - pd.DateOffset(months=6)
    late_additions = ticker_coverage[ticker_coverage["first_date"] > test_start]
    early_ends = ticker_coverage[ticker_coverage["last_date"] < df["date"].max() - pd.Timedelta(days=10)]

    print(f"\nTest period starts: {test_start.strftime('%Y-%m-%d')}")
    print(f"Tickers added AFTER test start (potential bias): {len(late_additions)}")
    if len(late_additions) > 0:
        print(f"  {list(late_additions.index)}")

    print(f"Tickers ending BEFORE dataset end (potential delistings): {len(early_ends)}")
    if len(early_ends) > 0:
        for t, row in early_ends.iterrows():
            print(f"  {t}: data ends {row['last_date'].strftime('%Y-%m-%d')}")

    # Key question: was this universe selected ex-post?
    print(f"\n--- CRITICAL ASSESSMENT ---")
    print(f"  Universe is a HAND-CURATED watchlist (tickers.ts), not a point-in-time index.")
    print(f"  Contains current holdings + thematic picks (quantum, AI, nuclear, etc.).")
    print(f"  This is NOT random selection. It's a momentum/growth universe.")
    print(f"  RISK: The universe was likely curated KNOWING these sectors performed well.")
    print(f"  MITIGATION: Backtest uses walk-forward (no future data in training).")
    print(f"  MITIGATION: Equal-weight-all benchmark captures the universe tailwind.")

    # Check how much the equal-weight universe returned
    trades = pd.read_csv(str(TRADES_PATH))
    results = pd.read_csv(str(RESULTS_PATH))

    # Reconstruct equal-weight universe return from features
    max_date = df["date"].max()
    test_df = df[df["date"] >= test_start].copy()
    test_dates = sorted(test_df["date"].unique())

    ew_returns = []
    for i in range(0, len(test_dates), HOLD_DAYS):
        d = test_dates[i]
        day_df = test_df[test_df["date"] == d]
        rets = day_df["target_ret_5d"].dropna()
        if len(rets) > 10:
            ew_returns.append(rets.mean())

    if ew_returns:
        ew_total = (1 + pd.Series(ew_returns)).prod() - 1
        strat_total = (1 + results["return"]).prod() - 1
        alpha = strat_total - ew_total
        print(f"\n  Equal-weight universe return: {ew_total*100:+.2f}%")
        print(f"  Strategy return:              {strat_total*100:+.2f}%")
        print(f"  Alpha over universe:          {alpha*100:+.2f}pp")
        print(f"  (This alpha measures stock SELECTION, not universe SELECTION)")


# ── 3. INFORMATION COEFFICIENT ──────────────────────────────────────────────

def validate_information_coefficient():
    separator("3. INFORMATION COEFFICIENT (IC)")

    trades = pd.read_csv(str(TRADES_PATH))

    # Also need scores for ALL tickers, not just top-3
    # Reconstruct from features using the backtest walk-forward logic
    df = pd.read_parquet(str(FEATURES_PATH))
    df["date"] = pd.to_datetime(df["date"])

    test_start = df["date"].max() - pd.DateOffset(months=6)
    test_df = df[df["date"] >= test_start].copy()

    # We can compute IC from the trades data (limited to top-3 picks)
    # AND from the full cross-section using a re-run

    # IC from trades (biased: only top-3 picks, truncated distribution)
    print("--- IC from trade log (TOP-3 PICKS ONLY -- truncated, biased upward) ---")
    if len(trades) > 10:
        # Group by date, compute rank correlation within each date
        ic_values_clf = []
        ic_values_reg = []

        for date, group in trades.groupby("date"):
            if len(group) >= 3:
                rho_clf, _ = stats.spearmanr(group["clf_score"], group["actual_5d_ret"])
                rho_reg, _ = stats.spearmanr(group["reg_pred"], group["actual_5d_ret"])
                if not np.isnan(rho_clf):
                    ic_values_clf.append(rho_clf)
                if not np.isnan(rho_reg):
                    ic_values_reg.append(rho_reg)

        if ic_values_clf:
            ic_clf = np.mean(ic_values_clf)
            ic_clf_se = np.std(ic_values_clf) / np.sqrt(len(ic_values_clf))
            print(f"  Classifier IC:  {ic_clf:.4f} +/- {1.96*ic_clf_se:.4f} (95% CI)")
        if ic_values_reg:
            ic_reg = np.mean(ic_values_reg)
            ic_reg_se = np.std(ic_values_reg) / np.sqrt(len(ic_values_reg))
            print(f"  Regressor IC:   {ic_reg:.4f} +/- {1.96*ic_reg_se:.4f} (95% CI)")
        print(f"  WARNING: Only 3 tickers per date -- rank correlation is unreliable.")
        print(f"  This is NOT a valid IC estimate. Need full cross-section.")

    # Full cross-section IC: re-score all tickers
    print(f"\n--- FULL CROSS-SECTION IC (re-running inference) ---")
    try:
        import lightgbm as lgb
        import joblib

        FEATURE_COLS = [
            "ret_5d", "ret_10d", "ret_20d", "ret_60d",
            "vol_10d", "vol_20d", "atr_14", "atr_14_pct", "boll_bw",
            "rvol_20d", "vol_mom", "obv_slope_10d",
            "rsi_14", "rsi_5", "dist_sma20", "dist_sma50",
            "sma_cross_10_50", "macd_norm", "macd_signal", "high_52w_prox", "low_52w_prox",
            "spy_rel_ret_5d", "spy_rel_ret_20d", "spy_beta_60d", "spy_corr_20d",
            "qqq_rel_ret_5d", "qqq_rel_ret_20d", "qqq_beta_60d", "qqq_corr_20d",
            "dow_sin", "dow_cos", "month_sin", "month_cos",
        ]

        # We need to do a proper walk-forward IC computation
        # Use the same logic as backtest.py but score ALL tickers
        has_target = df["target_beat_median"].notna() & df["target_ret_5d"].notna()
        available_features = [c for c in FEATURE_COLS if c in df.columns]
        has_features = df[available_features].notna().mean(axis=1) > 0.8
        df_clean = df[has_target & has_features].copy()

        all_dates = sorted(df_clean["date"].unique())
        max_date = all_dates[-1]
        test_start_dt = max_date - pd.DateOffset(months=6)
        test_dates = [d for d in all_dates if d >= test_start_dt]

        # Rebalance every 5 days
        rebalance_dates = [test_dates[i] for i in range(0, len(test_dates), HOLD_DAYS)]

        ic_clf_full = []
        ic_reg_full = []
        ic_ensemble_full = []
        current_month = None

        for reb_date in rebalance_dates:
            reb_month = pd.Timestamp(reb_date).to_period("M")

            if reb_month != current_month:
                train_data = df_clean[df_clean["date"] < reb_date].copy()
                if len(train_data) < 200:
                    continue

                for col in available_features:
                    q01, q99 = train_data[col].quantile(0.01), train_data[col].quantile(0.99)
                    train_data[col] = train_data[col].clip(q01, q99)

                # Train models
                X_train = train_data[available_features]
                y_clf = train_data["target_beat_median"]
                y_reg = train_data["target_ret_5d"]

                clf_params = {
                    "objective": "binary", "metric": "binary_logloss", "verbosity": -1,
                    "n_jobs": -1, "learning_rate": 0.05, "num_leaves": 31, "max_depth": 6,
                    "min_child_samples": 50, "subsample": 0.8, "colsample_bytree": 0.7,
                    "reg_alpha": 0.1, "reg_lambda": 1.0,
                }
                reg_params = {
                    "objective": "regression", "metric": "rmse", "verbosity": -1,
                    "n_jobs": -1, "learning_rate": 0.05, "num_leaves": 31, "max_depth": 6,
                    "min_child_samples": 50, "subsample": 0.8, "colsample_bytree": 0.7,
                    "reg_alpha": 0.1, "reg_lambda": 1.0,
                }

                dtrain_clf = lgb.Dataset(X_train, label=y_clf)
                dtrain_reg = lgb.Dataset(X_train, label=y_reg)
                clf_model = lgb.train(clf_params, dtrain_clf, num_boost_round=300)
                reg_model = lgb.train(reg_params, dtrain_reg, num_boost_round=300)
                current_month = reb_month

            # Score ALL tickers on this date
            score_data = df_clean[df_clean["date"] == reb_date].copy()
            if len(score_data) < 10:
                continue

            X_score = score_data[available_features]
            clf_scores = clf_model.predict(X_score)
            reg_preds = reg_model.predict(X_score)

            # Ensemble
            clf_rank = pd.Series(clf_scores).rank(pct=True).values
            reg_rank = pd.Series(reg_preds).rank(pct=True).values
            ensemble = 0.6 * clf_scores + 0.4 * reg_rank

            actual = score_data["target_ret_5d"].values

            # Spearman IC
            rho_clf, p_clf = stats.spearmanr(clf_scores, actual)
            rho_reg, p_reg = stats.spearmanr(reg_preds, actual)
            rho_ens, p_ens = stats.spearmanr(ensemble, actual)

            if not np.isnan(rho_clf):
                ic_clf_full.append(rho_clf)
            if not np.isnan(rho_reg):
                ic_reg_full.append(rho_reg)
            if not np.isnan(rho_ens):
                ic_ensemble_full.append(rho_ens)

        def ic_report(name, ic_values):
            ic_mean = np.mean(ic_values)
            ic_std = np.std(ic_values)
            ic_se = ic_std / np.sqrt(len(ic_values))
            t_stat = ic_mean / ic_se if ic_se > 0 else 0
            p_value = 2 * (1 - stats.t.cdf(abs(t_stat), df=len(ic_values)-1))
            ic_ir = ic_mean / (ic_std + 1e-8)  # IC information ratio

            print(f"\n  {name}:")
            print(f"    Mean IC:     {ic_mean:.4f}")
            print(f"    Std IC:      {ic_std:.4f}")
            print(f"    IC IR:       {ic_ir:.4f} (IC / std(IC))")
            print(f"    t-stat:      {t_stat:.3f}")
            print(f"    p-value:     {p_value:.4f}")
            print(f"    95% CI:      [{ic_mean - 1.96*ic_se:.4f}, {ic_mean + 1.96*ic_se:.4f}]")
            print(f"    N periods:   {len(ic_values)}")
            sig = "YES" if p_value < 0.05 else "NO"
            print(f"    Significant: {sig} (p < 0.05)")

            # Interpretation
            if abs(ic_mean) < 0.02:
                print(f"    VERDICT: NEGLIGIBLE -- essentially random")
            elif abs(ic_mean) < 0.05:
                print(f"    VERDICT: WEAK -- typical for quant signals, usable with many assets")
            elif abs(ic_mean) < 0.10:
                print(f"    VERDICT: MODERATE -- good for a single factor")
            else:
                print(f"    VERDICT: STRONG -- suspiciously high, check for lookahead")

            return ic_mean, p_value

        ic_report("Classifier (clf_score)", ic_clf_full)
        ic_report("Regressor (reg_pred)", ic_reg_full)
        ic_report("Ensemble (0.6*clf + 0.4*reg_rank)", ic_ensemble_full)

    except Exception as e:
        print(f"  ERROR computing full IC: {e}")
        import traceback
        traceback.print_exc()


# ── 4. DEFLATED SHARPE RATIO ────────────────────────────────────────────────

def validate_deflated_sharpe(raw_sharpe: float):
    separator("4. DEFLATED SHARPE RATIO (Bailey & de Prado)")

    results = pd.read_csv(str(RESULTS_PATH))
    returns = results["return"]

    # Observed Sharpe
    SR = raw_sharpe
    T = len(returns)  # number of observations

    # Skewness and kurtosis of returns
    skew = stats.skew(returns)
    kurt = stats.kurtosis(returns, fisher=False)  # excess=False gives raw kurtosis

    print(f"Observed Sharpe:  {SR:.4f}")
    print(f"N observations:   {T}")
    print(f"Skewness:         {skew:.4f}")
    print(f"Kurtosis (raw):   {kurt:.4f}")

    # Number of strategy variants tested
    # From the code: TOP_N=3 was one choice, also tested top-2, top-5
    # HOLD_DAYS=5 was one choice, also tested 10, 20
    # Ensemble weights (0.6/0.4) was one choice
    # Stop-loss at 10% was one choice
    # Conservative estimate: at least 20 variants tried
    N_variants = 20  # conservative estimate
    print(f"Estimated variants tested: {N_variants}")

    # Expected maximum Sharpe under H0 (all strategies are zero-alpha)
    # E[max(SR)] ~ sqrt(2 * ln(N)) for N independent strategies (Euler-Mascheroni approx)
    euler_mascheroni = 0.5772156649
    E_max_SR = np.sqrt(2 * np.log(N_variants)) - euler_mascheroni / np.sqrt(2 * np.log(N_variants))
    print(f"E[max SR | H0]:   {E_max_SR:.4f}")

    # Standard error of SR
    # Var(SR) ~ (1 + skew*SR/2 + (kurt-1)*SR^2/4) / T   (Lo 2002)
    # But using the Bailey-de Prado formulation:
    SR_std = np.sqrt(
        (1 - skew * SR + (kurt - 1) / 4 * SR**2) / (T - 1)
    )
    print(f"Std(SR):          {SR_std:.4f}")

    # Deflated Sharpe Ratio
    # DSR = P(SR* < SR_observed) where SR* ~ N(E[max SR | H0], std(SR))
    # This is the probability that the observed SR exceeds what you'd expect
    # from the best of N random strategies
    DSR_z = (SR - E_max_SR) / (SR_std + 1e-8)
    DSR_pvalue = 1 - stats.norm.cdf(DSR_z)

    print(f"\n--- Deflated Sharpe ---")
    print(f"  DSR z-score:    {DSR_z:.4f}")
    print(f"  DSR p-value:    {DSR_pvalue:.4f}")
    print(f"  DSR (as prob):  {1 - DSR_pvalue:.4f}")

    if DSR_pvalue > 0.05:
        print(f"  VERDICT: FAILS deflated Sharpe test.")
        print(f"  The observed Sharpe ({SR:.3f}) is NOT significant after accounting for")
        print(f"  {N_variants} strategy variants tested. Could be data mining.")
    else:
        print(f"  VERDICT: PASSES deflated Sharpe test.")
        print(f"  The observed Sharpe ({SR:.3f}) is significant even after accounting for")
        print(f"  {N_variants} strategy variants tested.")

    # Sensitivity analysis
    print(f"\n--- Sensitivity to N variants ---")
    for n in [5, 10, 20, 50, 100]:
        e_max = np.sqrt(2 * np.log(n)) - euler_mascheroni / np.sqrt(2 * np.log(n))
        z = (SR - e_max) / (SR_std + 1e-8)
        p = 1 - stats.norm.cdf(z)
        status = "PASS" if p < 0.05 else "FAIL"
        print(f"  N={n:3d}: E[maxSR]={e_max:.3f}  z={z:+.3f}  p={p:.4f}  {status}")


# ── 5. FEATURE IMPORTANCE STABILITY ─────────────────────────────────────────

def validate_feature_stability():
    separator("5. FEATURE IMPORTANCE STABILITY")

    clf_imp = pd.read_csv(str(CLF_IMPORTANCE_PATH))
    reg_imp = pd.read_csv(str(REG_IMPORTANCE_PATH))

    # Normalize importance to fractions
    clf_imp["importance_frac"] = clf_imp["importance"] / clf_imp["importance"].sum()
    reg_imp["importance_frac"] = reg_imp["importance"] / reg_imp["importance"].sum()

    # Top-10 comparison
    clf_top10 = set(clf_imp.head(10)["feature"].tolist())
    reg_top10 = set(reg_imp.head(10)["feature"].tolist())
    overlap = clf_top10 & reg_top10

    print(f"Classifier top-10: {sorted(clf_top10)}")
    print(f"Regressor top-10:  {sorted(reg_top10)}")
    print(f"Overlap:           {sorted(overlap)} ({len(overlap)}/10)")

    # Rank correlation of ALL feature importances
    merged = clf_imp.merge(reg_imp, on="feature", suffixes=("_clf", "_reg"))
    rho, p = stats.spearmanr(merged["importance_clf"], merged["importance_reg"])
    print(f"\nRank correlation (all features): rho={rho:.4f}, p={p:.6f}")

    # Concentration: do a few features dominate?
    clf_top3_share = clf_imp.head(3)["importance_frac"].sum()
    clf_top5_share = clf_imp.head(5)["importance_frac"].sum()
    clf_top10_share = clf_imp.head(10)["importance_frac"].sum()

    reg_top3_share = reg_imp.head(3)["importance_frac"].sum()
    reg_top5_share = reg_imp.head(5)["importance_frac"].sum()
    reg_top10_share = reg_imp.head(10)["importance_frac"].sum()

    print(f"\n--- Importance Concentration ---")
    print(f"  Classifier:  Top-3={clf_top3_share:.1%}  Top-5={clf_top5_share:.1%}  Top-10={clf_top10_share:.1%}")
    print(f"  Regressor:   Top-3={reg_top3_share:.1%}  Top-5={reg_top5_share:.1%}  Top-10={reg_top10_share:.1%}")

    # Herfindahl index (concentration measure)
    clf_hhi = (clf_imp["importance_frac"] ** 2).sum()
    reg_hhi = (reg_imp["importance_frac"] ** 2).sum()
    n_features = len(clf_imp)
    max_hhi = 1.0  # single feature dominates
    min_hhi = 1.0 / n_features  # perfectly equal

    print(f"\n  HHI (Classifier): {clf_hhi:.4f} (min={min_hhi:.4f}, max={max_hhi:.4f})")
    print(f"  HHI (Regressor):  {reg_hhi:.4f}")

    # Calendar features check (should be low importance -- if high, it's overfitting)
    calendar_features = ["dow_sin", "dow_cos", "month_sin", "month_cos"]
    clf_calendar = clf_imp[clf_imp["feature"].isin(calendar_features)]
    reg_calendar = reg_imp[reg_imp["feature"].isin(calendar_features)]

    clf_calendar_share = clf_calendar["importance_frac"].sum()
    reg_calendar_share = reg_calendar["importance_frac"].sum()

    print(f"\n--- Calendar Feature Share (overfitting signal) ---")
    print(f"  Classifier: {clf_calendar_share:.1%}")
    print(f"  Regressor:  {reg_calendar_share:.1%}")

    # month_sin and month_cos are suspiciously high in classifier
    clf_month_rank = clf_imp[clf_imp["feature"] == "month_sin"].index[0] + 1
    reg_month_rank = reg_imp[reg_imp["feature"] == "month_sin"].index[0] + 1
    print(f"  month_sin rank: Classifier=#{clf_month_rank}, Regressor=#{reg_month_rank}")

    if clf_calendar_share > 0.10:
        print(f"  WARNING: Calendar features account for {clf_calendar_share:.1%} of classifier importance.")
        print(f"  This suggests potential overfitting to seasonal patterns in a small sample.")

    # Feature importance comparison table
    print(f"\n--- Feature Importance Comparison (sorted by classifier) ---")
    print(f"  {'Feature':<25s}  {'CLF':>6s}  {'Rank':>4s}  {'REG':>6s}  {'Rank':>4s}")
    print(f"  {'-'*25}  {'----':>6s}  {'----':>4s}  {'----':>6s}  {'----':>4s}")

    clf_ranks = {row["feature"]: i+1 for i, row in clf_imp.iterrows()}
    reg_ranks = {row["feature"]: i+1 for i, row in reg_imp.iterrows()}

    for _, row in clf_imp.iterrows():
        f = row["feature"]
        c_imp = row["importance"]
        c_rank = clf_ranks[f]
        r_imp = reg_imp[reg_imp["feature"] == f]["importance"].values[0]
        r_rank = reg_ranks[f]
        delta = abs(c_rank - r_rank)
        flag = " ***" if delta > 10 else ""
        print(f"  {f:<25s}  {c_imp:6.0f}  #{c_rank:<3d}  {r_imp:6.0f}  #{r_rank:<3d}{flag}")

    # Verdict
    print(f"\n--- VERDICT ---")
    if len(overlap) >= 7:
        print(f"  GOOD: {len(overlap)}/10 top features overlap. Models agree on key drivers.")
    elif len(overlap) >= 5:
        print(f"  OK: {len(overlap)}/10 top features overlap. Reasonable consistency.")
    else:
        print(f"  CONCERNING: Only {len(overlap)}/10 top features overlap. Models see different signals.")

    if rho > 0.8:
        print(f"  GOOD: High rank correlation ({rho:.3f}) -- feature importance is stable.")
    elif rho > 0.6:
        print(f"  OK: Moderate rank correlation ({rho:.3f}) -- some instability but acceptable.")
    else:
        print(f"  CONCERNING: Low rank correlation ({rho:.3f}) -- feature importance is unstable.")


# ── 6. ADDITIONAL: RETURN DISTRIBUTION ANALYSIS ─────────────────────────────

def validate_return_distribution():
    separator("6. RETURN DISTRIBUTION & OUTLIER DEPENDENCE")

    results = pd.read_csv(str(RESULTS_PATH))
    returns = results["return"]

    print(f"Return distribution:")
    print(f"  Mean:   {returns.mean()*100:+.3f}%")
    print(f"  Median: {returns.median()*100:+.3f}%")
    print(f"  Std:    {returns.std()*100:.3f}%")
    print(f"  Min:    {returns.min()*100:+.3f}%")
    print(f"  Max:    {returns.max()*100:+.3f}%")
    print(f"  Skew:   {stats.skew(returns):.3f}")
    print(f"  Kurt:   {stats.kurtosis(returns):.3f}")

    # How much does the best period contribute?
    total_ret = (1 + returns).prod() - 1
    for n_remove in [1, 2, 3]:
        sorted_rets = returns.sort_values(ascending=False)
        trimmed = sorted_rets.iloc[n_remove:]
        trimmed_ret = (1 + trimmed).prod() - 1
        print(f"\n  Without best {n_remove} period(s): {trimmed_ret*100:+.2f}% (was {total_ret*100:+.2f}%)")
        print(f"    Lost: {(total_ret - trimmed_ret)*100:.2f}pp")

    # How dependent is the result on outliers?
    q95 = returns.quantile(0.95)
    q05 = returns.quantile(0.05)
    outlier_periods = returns[(returns > q95) | (returns < q05)]
    non_outlier = returns[(returns <= q95) & (returns >= q05)]

    print(f"\n  Outlier periods (>{q95*100:.1f}% or <{q05*100:.1f}%): {len(outlier_periods)}/{len(returns)}")
    print(f"  Non-outlier total return: {((1 + non_outlier).prod() - 1)*100:+.2f}%")


# ── MAIN ─────────────────────────────────────────────────────────────────────

def main():
    print("=" * 70)
    print("  CRITICAL VALIDATION: LightGBM Backtest (+63.8% claimed)")
    print("  Generated: " + pd.Timestamp.now().strftime("%Y-%m-%d %H:%M:%S"))
    print("=" * 70)

    # Check files exist
    for path in [RESULTS_PATH, TRADES_PATH, CLF_IMPORTANCE_PATH, REG_IMPORTANCE_PATH, FEATURES_PATH]:
        if not path.exists():
            print(f"ERROR: Missing file: {path}")
            sys.exit(1)

    results, trades, raw_sharpe = validate_basic_stats_and_costs()
    validate_survivorship_bias()
    validate_information_coefficient()
    validate_deflated_sharpe(raw_sharpe)
    validate_feature_stability()
    validate_return_distribution()

    separator("SUMMARY")
    print("  Run complete. All 6 validation tests executed.")
    print("  Review each section above for pass/fail verdicts.")
    print("  Key risks to check:")
    print("    1. Transaction costs: How much do they eat?")
    print("    2. Survivorship bias: Is alpha real or universe tailwind?")
    print("    3. IC: Is prediction skill significant?")
    print("    4. Deflated Sharpe: Does it survive multiple testing correction?")
    print("    5. Feature stability: Are models robust or fragile?")
    print("    6. Outlier dependence: Is the return driven by 1-2 lucky trades?")


if __name__ == "__main__":
    main()
