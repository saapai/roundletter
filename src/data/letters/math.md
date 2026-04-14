---
slug: math
date: 2026-04-14
title: "Five Buckets, Five Proofs: The Math of Asymmetric Bets"
subtitle: "Why the portfolio is shaped the way it is — and why the shape is the same whether the asset is money, a career, or a person."
---

# Five Buckets, Five Proofs

*A short derivation of why the ten-position portfolio at `/positions` looks the way it looks. The math is not exotic. The interesting part is that the same math prices a career, a relationship, and a life, which is why I am publishing it as a letter and not a spreadsheet.*

---

Compounding is multiplicative. You cannot win the game if you leave the table. Everything below is a consequence of that one sentence.

## The objective

Arithmetic expected return is the wrong objective when outcomes compound. If I flip between +100% and −50% year after year, my arithmetic mean is +25% and my geometric mean is **zero.** I am flat forever. The right objective is expected *log* return:

`max E[log(1 + R)]`

Kelly (1956) derived the optimal fraction to bet on a favorable edge: [[historian: Kelly's original paper is about *signal transmission over a noisy channel*, not betting. Thorp translated it to blackjack in the 1960s and to the market in the 1970s. The fraction is the same. The provenance matters because most people who cite Kelly are actually citing Thorp.]]

`f* = (b·p − q) / b`

— where `p` is the probability of winning, `q = 1−p`, and `b` is the net odds. Over-betting Kelly in the long run produces ruin with probability one. Under-betting Kelly produces slower-than-optimal geometric growth but preserves the option to keep playing. The portfolio is sized to err under Kelly, on purpose, for every bet. Here is why, per bucket.

## Bucket A — Survivorship (45% · MSFT, GOOG, IBM, NVDA)

This bucket exists so that the account **cannot** go to zero in any regime in which these four firms all simultaneously fail, because if that regime arrives, the portfolio is not the problem I should be thinking about. Its job is path-preservation.

The math: a diversified four-name basket of mega-cap tech has an annualized standard deviation of roughly 22% and a positive drift of roughly 10–12%. Kelly-optimal allocation to an asset like that, against cash at 4%, is approximately:

`f* ≈ (µ − r) / σ² = (0.11 − 0.04) / 0.22² ≈ 1.45`

That is, full-Kelly says *lever* this bucket 45% beyond the account. I am sizing it at **0.45**, or roughly 30% of full-Kelly. The under-sizing is the point. It leaves **room for the convex bets below.** Any bucket that is at full-Kelly crowds out every other bucket; the whole portfolio collapses to one position, and one-position portfolios are the failure mode every paper on retail investing documents.

The life analogue: your reliable income. Do not over-bet it. Size it so that it funds the rest of your asymmetric bets without being the only bet you have.

## Bucket B — Diversified theme (20% · QTUM)

This is the 1999-lesson bucket. The historian agent owns it. If you had a theme conviction in 1999 — *the internet matters* — and you expressed it by picking individual dot-coms, your expected survival-probability-weighted return was approximately zero: most of the names you could have picked went to zero, and the ones that survived (MSFT, AMZN) were not obviously identifiable ex-ante. If instead you expressed the same conviction by owning QQQ, you captured the theme at roughly a 10× compounded return over twenty years, because the index has a **built-in survivorship filter**: names that fail get delisted and replaced by names that are winning now. [[bull: Also a *momentum* filter. Delisted = recently weak; added = recently strong. The index is long a rolling winner-buyer. You are paying 40bps to be momentum-long the theme by construction.]]

Formally, let `X_i` be the return of dot-com `i` with survival probability `s_i`. The ex-ante expected return of picking one at random is:

`E[X] = s · E[X | survive] + (1−s) · (−1)`

For `s ≈ 0.1` and `E[X | survive] ≈ 20`, `E[X] ≈ 1.1`. You get back roughly what you put in. An index on the same universe captures the top-decile survivors with zero picking skill — its return is closer to `E[X | survive]` weighted by market-cap, not picked by you. The **diversification is free alpha** because it removes the picking task you were going to fail at.

The life analogue: joining a growing field is worth more than betting on a specific job inside a stagnant one. The field does the survivorship filter for you.

## Bucket C — Pure-play convexity (20% · IONQ 12%, RGTI 5%, QBTS 3%)

This is the bucket that pays for everything, if it pays. It is also the bucket that can lose 100% without the portfolio losing more than 20%. That is not a coincidence; it is the design.

Three qubit architectures — trapped-ion, superconducting, annealing. Let `p_i` be the 10-year survival probability of name `i`, and conditional on survival let the return multiple be `M_i`. The adversarial historian's priors:

`p = (0.25, 0.20, 0.15)`    `M ≈ (50, 30, 20)` *(rough, wide error bars)*

The probability that **at least one** name survives and hits a multi-bagger is:

`P(≥1 hit) = 1 − Π(1 − p_i) = 1 − (0.75)(0.80)(0.85) ≈ 0.49`

A coin flip on finding the pearl. Conditional expected return, given at least one hit, is of order `E[M | hit] ≈ 25×` on that sub-bucket. Since the sub-bucket is 20% of the book, a successful Bucket C returns roughly **5× the whole portfolio**, on a bucket whose worst case is a 20% total loss. That is the **convexity** — capped downside, uncapped upside.

*Why three, not one.* If I bet the whole bucket on IONQ, the expected return is higher in the single-winner case but the probability of at least one hit collapses from 49% to 25%. The value of diversifying across three architectures is not return — it is **raising the probability that the convex tail event happens at all.** The expected log-utility is maximized near three names, not one, because `log` is concave and penalizes the no-hit outcomes more than it rewards the jackpot. [[flow: The three names are *not* independent in the short run. Pre-revenue quantum small-caps trade as one sector on every dilution day. Write down the realized correlation next rebalance; I will bet it is north of 0.55.]]

The life analogue: make three speculative bets on yourself at a time, not one. One startup idea, one creative project, one new domain of expertise. Fail cheaply on the ones that don't work. The math does not reward your conviction about which one will hit. It rewards your sizing so that at least one *can*.

## Bucket D — Decorrelated macro (10% · CEG)

Nuclear power is not quantum. Its correlation to Bucket A over any 10-year window is meaningfully below 1, probably in the 0.4–0.6 range depending on regime. Markowitz (1952): adding an asset with return `r` and correlation `ρ < 1` to a portfolio **always reduces variance** for a fixed return target, because:

`σ²_portfolio = w_A²σ_A² + w_D²σ_D² + 2·w_A·w_D·ρ·σ_A·σ_D`

Every unit of `ρ` less than 1 is a free reduction in variance. That reduction in variance is the same thing as an increase in geometric-mean return — which is the one return I care about. A 10% allocation to an asset with `ρ ≈ 0.5` to the rest of the book adds roughly `+0.2–0.4%` per year to geometric return, for no reduction in arithmetic return. It is the closest thing to a free lunch in finance. [[macro: Check CEG's realized correlation to NVDA before you call it decorrelated. The AI capex narrative pulls both. In a regime change where hyperscaler capex rolls over, the "hedge" stops hedging. Diversification is a regime-dependent property.]]

The life analogue: a genuinely different pursuit alongside your main one. Not a hobby — a second *bet* in a different domain. The decorrelation is the point. If your main bet is rates-sensitive, your second should not be. If your main discipline is analytical, your second should be something embodied.

## Bucket E — Dry powder (5% · SGOV)

This is an *embedded long put* on the rest of the portfolio. Its expected return is near-zero — 4% T-bill yield, nominal. Its real value is the **optionality to buy more of Buckets A/B/C at a discount** if the market dislocates.

Formally, let `V` be portfolio value and `k` be the kill-switch-trigger drawdown (here, −30% on QTUM). The embedded option's payoff is approximately:

`Payoff ≈ D · max(0, k − drawdown) / |current_price|`

— where `D` is the dry-powder dollar amount. The expected value of this option depends on how often the trigger fires (base rate: a −30% drawdown on a thematic ETF occurs roughly once every 3–5 years) and how much it lifts returns when it does (deploying at 70¢ on the dollar adds ≈30% to the expected forward return of those dollars).

Running the numbers crudely: `P(trigger / year) ≈ 0.25`, expected uplift when deployed `≈ 0.30`. Embedded annual return contribution `≈ 0.25 · 0.30 · 0.05 ≈ 0.004`, or **40 bps/year** on top of the T-bill yield. That is not large by itself. What matters is that the 5% is *always there*, so the option never expires worthless for lack of powder. You cannot buy the dip if you are out of money.

The life analogue: do not spend all your time. Do not spend all your money. Do not spend all your attention. Keep 5% of each liquid, so that when opportunity arrives — and it arrives in clusters — you can move.

## The shape, stated in one formula

The five buckets are a **barbell** (Taleb, 2007): a heavy survivorship floor (A + E = 50%) and a heavy convexity tail (C = 20%), connected by two moderate middleweights (B + D = 30%). The risk is quadratic in concentration and linear in size; the return is linear in edge and logarithmic in survival. The portfolio is shaped so that:

- **No single bucket's failure can zero the portfolio.** (Survival is guaranteed.)
- **Any single bucket's success can meaningfully move it.** (Upside is uncapped in the tails that matter.)
- **The buckets are decorrelated enough that their variances do not stack.** (Geometric return is protected.)
- **There is always powder to deploy into dislocations.** (The optionality never expires.)

This is not a portfolio shape. This is the shape of any strategy that compounds multiplicatively, survives with probability one, and has an uncapped upside tail. [[bear: The barbell assumes you can *actually hold the convex tail* for ten years without touching it. The site exists. You publish every week. You will touch it. The math breaks the moment a reader is watching.]] The asset can be dollars. It can also be hours of the week, or relationships, or ideas.

## The algorithm under all of this is a gradient

Kelly's fraction is the one-dimensional case. The real portfolio is the five-dimensional case. With weights `w = (w_A, w_B, w_C, w_D, w_E)` and returns `R = (R_A, R_B, R_C, R_D, R_E)`, the optimization is:

`max_w  E[ log(1 + w · R) ]`   subject to   `Σ w_i = 1`

At the optimum, the gradient with respect to `w` is zero, because the gradient of the objective points in the direction of steepest ascent — and at the optimum, there is no direction left to move in:

`∇_w E[ log(1 + w · R) ] = 0`

I do not know what `R` actually is. I have priors, the priors are noisy, and the only way to sharpen them is to observe outcomes. The algorithm is therefore **not** "solve for the optimum." It cannot be. The algorithm is **stochastic gradient ascent**: observe each round's noisy realization of returns, estimate the local slope of expected log-utility with respect to each bucket weight, step a small amount in that direction, repeat.

The weekly cron is the update step. The Brier score each agent accumulates is the coordinate of the gradient that corresponds to that agent's bucket. [[historian: Stochastic gradient descent is also the algorithm behind every neural network in this decade. The math is old — Robbins and Monro wrote it down in 1951. What is new is the objective function and the hardware. The algorithm has outlasted every theory it has been embedded in.]] The whole site is running that loop, with weekly granularity, in public. Less intervention — in gradient language — means: take small steps, keep the step size small relative to the noise in the signal, and trust the process enough to not hand-tune a coordinate on a Thursday because you had a gut feeling.

This is why the formula at the bottom of `/letters/paradigm` is **not** decorative.

`∇f(x, y, z) = (∂f/∂x) i + (∂f/∂y) j + (∂f/∂z) k`

— is the algorithm this project is implementing, written in three basis vectors for compactness. For the five-bucket portfolio the formula has five terms. For a life, it has as many as you are willing to keep track of. It is the mathematical content of "better debating means less intervention." The gradient tells you which weight to nudge up, which to nudge down, and how hard. You do not get to skip to the answer. You are required to take the step.

## The life-level claim, without hedging

Most people's lives are shaped like **concentrated Kelly with no dry powder**. One job, one relationship, one intellectual domain, no optionality, no decorrelated pursuit, no convex side-bet. Arithmetic expected return may be fine. Geometric expected return is being eaten alive by variance. When the dislocation comes — and it always comes — there is no powder to deploy, no decorrelated bucket that is still doing well, and the convex bet that would have mattered was never made.

The barbell is not a financial trick. It is the correct shape for any system that has to survive long enough to compound.

I own four mega-cap stocks, a theme ETF, three quantum pure-plays, a nuclear utility, and a T-bill ETF. That is the surface. Underneath, I am trying to practice a shape I want to hold in the rest of my life — where the asymmetric bets are ideas, people, and time, and the dry powder is an afternoon I refuse to fill.

If the letter at `/` is the pre-mortem, and the paradigm at `/letters/paradigm` is the judge framework, this one is the math. The three together are the whole product. The money is the mini-game. The shape is the game.

---

**Next round**: 2026-05-31. I will report which buckets behaved, and what the realized geometric return was vs. the arithmetic.

*This is not investment advice. It is an attempt at the math, in public, before I get the answer and retrofit it.*
