---
slug: math
date: 2026-04-14
title: "Five Buckets, Five Proofs: The Math of Asymmetric Bets"
subtitle: "Why the portfolio is shaped the way it is — and why the shape is the same whether the asset is money, a career, or a person."
---

# Five Buckets, Five Proofs

*A derivation of why the ten-position portfolio at `/positions` looks the way it looks. The math is not exotic. The interesting part is that the same math prices a career, a relationship, and a life — which is why this is a letter, not a spreadsheet.*

---

Compounding is multiplicative. You cannot win the game if you leave the table. Everything below is a consequence of that one sentence.

## The objective

Arithmetic expected return is the wrong goal when outcomes compound. Flip between +100% and −50% year after year: arithmetic mean is +25%, geometric mean is **zero.** Flat forever. Multiplication punishes variance more than addition rewards it. The right objective is expected *log* return:

`max E[log(1 + R)]`

Kelly (1956) derived the optimal fraction to bet on a favorable edge: [[historian: Kelly's original paper is about *signal transmission over a noisy channel*, not betting. Thorp translated it to blackjack in the 1960s and to the market in the 1970s. The fraction is the same. The provenance matters because most people who cite Kelly are actually citing Thorp.]]

`f* = (b·p − q) / b`

— where `p` is win probability, `q = 1−p`, and `b` is net odds. Over-bet Kelly and you guarantee ruin. Under-bet and you grow slower but stay in the game.

Note what happened: a formula born in information theory migrated to gambling, then to finance. It is about to migrate again. The formula does not change. The domain does. Every position in this portfolio under-bets Kelly, on purpose — and the reason applies equally whether the position is a stock or a year of your life. Here is why, per bucket.

## Bucket A — Survivorship (45% · MSFT, GOOG, IBM, NVDA)

This bucket exists so that the account **cannot** go to zero. Its job is path-preservation. Not growth. Survival. If all four mega-caps fail simultaneously, the portfolio is not the problem I should be thinking about.

Your reliable income — the job, the degree, the credential — is the same bucket. Its job is not to make you rich. Its job is to keep you in the game long enough for the other buckets to work.

A diversified four-name mega-cap tech basket has annualized standard deviation of ~22% and positive drift of ~10–12%. Kelly-optimal allocation against cash at 4%:

`f* ≈ (µ − r) / σ² = (0.11 − 0.04) / 0.22² ≈ 1.45`

Full-Kelly says *lever* this bucket 45% beyond the account. I size it at **0.45** — about 30% of full-Kelly. The under-sizing is the point. It leaves **room for the convex bets below.** A bucket at full-Kelly crowds out every other bucket. The portfolio collapses to one position, and one-position portfolios are the failure mode every paper on retail investing documents.

They are also the failure mode of most lives. The person who puts 95% of their time and identity into the floor — the safe job, the one relationship, the single intellectual domain — is running full-Kelly or above on Bucket A. The failure mode is not losing the floor. It is letting the floor expand until there is no room left for anything else.

## Bucket E — Dry powder (5% · SGOV)

I am placing this bucket second, not fifth, because it completes the floor. Buckets A and E together are 50% of the book — the survivorship half of the barbell. You need to see the floor before you can see what stands on it.

An *embedded long put* on the rest of the portfolio. Expected return: near-zero (4% T-bill yield, nominal). Real value: the **optionality to act when everyone else is frozen.**

Formally, let `V` be portfolio value and `k` be the kill-switch-trigger drawdown (here, −30% on QTUM):

`Payoff ≈ D · max(0, k − drawdown) / |current_price|`

— where `D` is the dry-powder dollar amount. How much is this option worth? It depends on how often the trigger fires (a −30% drawdown on a thematic ETF hits roughly once every 3–5 years) and how much it lifts returns when it does (deploying at 70c on the dollar adds ~30% to the expected forward return of those dollars).

Running the numbers crudely: `P(trigger / year) ≈ 0.25`, expected uplift when deployed `≈ 0.30`. Embedded annual return contribution `≈ 0.25 · 0.30 · 0.05 ≈ 0.004`, or **40 bps/year** on top of the T-bill yield. Not large by itself. What matters is that the 5% is *always there*, so the option never expires worthless for lack of powder. You cannot buy the dip if you are out of money.

You also cannot seize an opportunity if you have no slack. Do not spend all your time. Do not spend all your money. Do not spend all your attention. Keep 5% of each liquid, because opportunity arrives in clusters, and if you are fully deployed when it does, you watch from the sideline. The person who fills every hour and every dollar to capacity is running a portfolio with no dry powder. Their arithmetic return looks fine. Their geometric return is being eaten by the inability to act when it matters most.

## Bucket D — Decorrelated macro (10% · CEG)

The floor is built. Now the structure above it.

Nuclear power is not quantum. Its correlation to Bucket A over any 10-year window sits below 1 — likely 0.4–0.6 depending on regime. Markowitz (1952): adding an asset with return `r` and correlation `ρ < 1` to a portfolio **always reduces variance** for a fixed return target:

`σ²_portfolio = w_A²σ_A² + w_D²σ_D² + 2·w_A·w_D·ρ·σ_A·σ_D`

Every unit of `ρ` below 1 is free variance reduction. And reduced variance, for a compounding system, *is* increased geometric-mean return — the only return that matters here. A 10% allocation to an asset with `ρ ≈ 0.5` adds ~0.2–0.4% per year to geometric return with no cost to arithmetic return. Closest thing to a free lunch in finance. [[macro: Check CEG's realized correlation to NVDA before you call it decorrelated. The AI capex narrative pulls both. In a regime change where hyperscaler capex rolls over, the "hedge" stops hedging. Diversification is a regime-dependent property.]]

The free lunch is not only financial. A genuinely different pursuit alongside your main one — not a hobby, a second *bet* in a different domain — reduces the variance of your life-portfolio by the same formula. If your main discipline is analytical, your second should be embodied. Every unit of `ρ` below 1 between two fields you inhabit is a free lunch on your intellectual portfolio — ideas from one domain that land as novel in the other, carried across for zero marginal cost. Markowitz's variance-reduction formula is, at bottom, the math of why polymaths get away with stealing.

## Bucket B — Diversified theme (20% · QTUM)

The 1999-lesson bucket. The historian agent owns it. If you had a theme conviction in 1999 — *the internet matters* — and expressed it by picking individual dot-coms, your survival-weighted expected return was near zero. Most names went to zero. The survivors (MSFT, AMZN) were not identifiable beforehand. Express the same conviction through QQQ instead, and you captured the theme at ~10x over twenty years, because the index has a **built-in survivorship filter**: failures get delisted, winners get added. [[bull: Also a *momentum* filter. Delisted = recently weak; added = recently strong. The index is long a rolling winner-buyer. You are paying 40bps to be momentum-long the theme by construction.]]

Formally, let `X_i` be the return of dot-com `i` with survival probability `s_i`:

`E[X] = s · E[X | survive] + (1−s) · (−1)`

For `s ≈ 0.1` and `E[X | survive] ≈ 20`, `E[X] ≈ 1.1`. You get back what you put in. An index on the same universe captures the top-decile survivors with zero stock-picking skill — its return tracks `E[X | survive]`, weighted by market cap, not by your guesses. **Diversification is free alpha** because it removes the picking task you were going to fail at.

This may be the strongest life analogue in the portfolio. Join a growing field instead of betting on a specific job inside a stagnant one. The field does the survivorship filter for you — bad companies in a growing sector get replaced by good ones, and your skills transfer across them. Picking the right company in a dying industry is the individual dot-com bet: even if you win, the theme is working against you. Picking the right *field* is the index bet. Express your conviction at the theme level, not the name level, and let the built-in filter do the work you were going to fail at anyway.

## Bucket C — Pure-play convexity (20% · IONQ 12%, RGTI 5%, QBTS 3%)

Everything before this bucket exists so that this bucket can exist. The floor preserves the path. The decorrelated macro reduces variance. The diversified theme captures the sector. This bucket is where the shape pays off — if it pays off.

It can also lose 100% without the portfolio losing more than 20%. Not a coincidence. The design.

Three qubit architectures: trapped-ion, superconducting, annealing. Let `p_i` be the 10-year survival probability, and conditional on survival let the return multiple be `M_i`. The adversarial historian's priors:

`p = (0.25, 0.20, 0.15)`    `M ≈ (50, 30, 20)` *(wide error bars)*

Probability that **at least one** name survives and hits a multi-bagger:

`P(≥1 hit) = 1 − Π(1 − p_i) = 1 − (0.75)(0.80)(0.85) ≈ 0.49`

A coin flip on finding the pearl. Conditional expected return given at least one hit: ~25x on the sub-bucket. Since the sub-bucket is 20% of the book, a successful Bucket C returns roughly **5x the whole portfolio** — on a bucket whose worst case is a 20% total loss. Capped downside, uncapped upside. That is **convexity**.

*Why three, not one.* Bet the whole bucket on IONQ and expected return rises in the single-winner case, but hit probability collapses from 49% to 25%. Diversifying across three architectures does not buy return — it buys **the probability that the convex tail event happens at all.** Expected log-utility peaks near three names, not one, because `log` is concave and penalizes wipeouts more than it rewards jackpots. [[flow: The three names are *not* independent in the short run. Pre-revenue quantum small-caps trade as one sector on every dilution day. Write down the realized correlation next rebalance; I will bet it is north of 0.55.]]

Now the life version, which is the real argument this whole letter has been building toward. Make three speculative bets on yourself at a time, not one. A startup idea, a creative project, a new domain. Size them so you can lose all three without it mattering — that is what the 20% cap does. The math does not reward conviction about *which* one will hit. It rewards the *architecture*: three uncorrelated shots at a convex payoff, sized so failure is cheap and success is transformative. The person who bets everything on one speculative dream has higher expected return in the single-winner case and a 75% chance of total loss. The person who makes three small bets has a coin flip on at least one of them working. `log` is concave. It penalizes ruin more than it rewards jackpots. The formula is the same whether the bet is denominated in dollars or in years.

## The shape, stated in one formula

Five buckets, one **barbell** (Taleb, 2007): a heavy survivorship floor (A + E = 50%) and a heavy convexity tail (C = 20%), connected by two moderate middleweights (B + D = 30%). Risk is quadratic in concentration, linear in size. Return is linear in edge, logarithmic in survival. The portfolio is shaped so that:

- **No single bucket's failure can zero the portfolio.** (Survival is guaranteed.)
- **Any single bucket's success can meaningfully move it.** (Upside is uncapped in the tails that matter.)
- **The buckets are decorrelated enough that their variances do not stack.** (Geometric return is protected.)
- **There is always powder to deploy into dislocations.** (The optionality never expires.)

Not a portfolio shape. The shape of any strategy that compounds multiplicatively, survives with probability one, and keeps an uncapped upside tail. [[bear: The barbell assumes you can *actually hold the convex tail* for ten years without touching it. The site exists. You publish every week. You will touch it. The math breaks the moment a reader is watching.]] If the same structure keeps appearing across domains that share no surface features — dollars, hours, relationships, ideas — you are looking at something real. Not a metaphor.

## The algorithm under all of this is a gradient

Kelly's fraction is the one-dimensional case. The real portfolio lives in five dimensions. With weights `w = (w_A, w_B, w_C, w_D, w_E)` and returns `R = (R_A, R_B, R_C, R_D, R_E)`:

`max_w  E[ log(1 + w · R) ]`   subject to   `Σ w_i = 1`

At the optimum, the gradient with respect to `w` is zero — nowhere left to climb:

`∇_w E[ log(1 + w · R) ] = 0`

But I do not know what `R` actually is. My priors are noisy, and the only way to sharpen them is to observe outcomes. So the algorithm is **not** "solve for the optimum." It cannot be. It is **stochastic gradient ascent**: observe each round's noisy returns, estimate the local slope of expected log-utility with respect to each bucket weight, step a small amount in that direction, repeat.

Each week's cron is the update step. Each agent's Brier score is the gradient coordinate for that agent's bucket. [[historian: Stochastic gradient descent is also the algorithm behind every neural network in this decade. The math is old — Robbins and Monro wrote it down in 1951. What is new is the objective function and the hardware. The algorithm has outlasted every theory it has been embedded in.]] That last sentence is the polymathy argument in one line: Kelly moved from information theory to finance. SGD moved from statistics to deep learning. The shape moves from portfolio to life. The algorithm outlasts the theory because it is domain-invariant. The whole site runs that loop, weekly, in public. Less intervention — in gradient language — means: small steps, step size small relative to noise, and enough discipline to not hand-tune a coordinate on a Thursday because you had a gut feeling.

This is why the formula at the bottom of `/letters/paradigm` is **not** decorative.

`∇f(x, y, z) = (∂f/∂x) i + (∂f/∂y) j + (∂f/∂z) k`

That is the algorithm this project implements, in three basis vectors. Five terms for the portfolio. As many as you track, for a life. It is the mathematical content of "better debating means less intervention." The gradient tells you which weight to nudge up, which to nudge down, and how hard. You do not get to skip to the answer. You take the step.

## The life-level claim, without hedging

Most people's lives are shaped like **concentrated Kelly with no dry powder.** One job. One relationship. One intellectual domain. No optionality, no decorrelated pursuit, no convex side-bet.

Arithmetic expected return looks fine. That is exactly the trap — because arithmetic return is not what compounds into a life. Geometric return is being eaten alive by variance and by a correlation of 1.0 across every dimension, because every dimension *is* the same dimension. And they cannot see it, because variance is silent right up until the moment it speaks.

When the dislocation comes — and it always comes — there is no powder to deploy. No decorrelated bucket still performing. The convex bet that would have changed everything was never placed.

The barbell is not a financial trick. It is the correct shape for any system that must survive long enough to compound. Full stop.

I own four mega-cap stocks, a theme ETF, three quantum pure-plays, a nuclear utility, and a T-bill ETF. That is the surface. Underneath, I am practicing a shape I want to hold for the rest of my life — where the asymmetric bets are ideas, people, and time, and the dry powder is an afternoon I refuse to fill.

If the letter at `/` is the pre-mortem, and the paradigm at `/letters/paradigm` is the judge framework, this one is the math. The three together are the whole product. The money is the mini-game. The shape is the game.

---

**Next round**: 2026-05-31. I will report which buckets behaved, and what the realized geometric return was vs. the arithmetic.

*This is not investment advice. It is an attempt at the math, in public, before I get the answer and retrofit it.*
