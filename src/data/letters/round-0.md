---
round: 0
date: 2026-04-14
title: "Round 0 — The Pre-Mortem"
subtitle: "Before I know how this turns out, here is how I expect it to fail."
portfolio_value: 3453.83
---

# Round 0 — The Pre-Mortem

*Written 2026-04-14, before the first weekly cron has even fired. Published before I am proven wrong, so I can be accountable for the reasoning, not the result.*

---

## What I just did

I liquidated five non-thematic positions (SMR, QNC, RIME, SRFM, TENX), trimmed IONQ from 18.5 shares to 11.3, and bought a ten-position portfolio anchored around quantum computing for a 10-year horizon. The shape:

- **45%** in big-tech companies with credible quantum programs (MSFT, GOOG, IBM, NVDA). The bear agent owns most of this bucket. These are companies that don't need quantum to work.
- **20%** in QTUM, the Defiance quantum ETF. The historian agent's pick, borrowed from the 1999 lesson: owning QQQ beat picking individual dot-coms by orders of magnitude.
- **20%** in three pure-plays — IONQ (trapped-ion), RGTI (superconducting), QBTS (annealing). The bull agent's thesis. Sized so that if all three go to zero, the portfolio is down 20%, not 50%. Split across three qubit architectures because at least one of them is going to die.
- **10%** in Constellation Energy, the macro agent's conviction that electrons are the binding constraint on compute and nuclear PPAs are the moat.
- **5%** in SGOV, dry powder reserved for a kill-switch buy if QTUM drawsdown 30% from here.

The full holdings table is at `/positions`. Every trade is at `/trades`.

## Why publish a pre-mortem

I got 120%+ in 15 months and then gave back 31% in two months. Anyone could narrate that as skill. The only defense against retrofitting a story to whatever happens next is to write down, in public, what I think will go wrong **before** it goes wrong.

So here are the four ways I expect this portfolio to fail. If any of them comes true, I will not pretend I didn't see it coming.

## Failure mode 1 — The pure-plays dilute me into the ground

IONQ, RGTI, and QBTS are pre-revenue. They raise capital by issuing shares. The base-rate historian inside my agent panel put a 25% ten-year survival probability on IONQ and 15% on RGTI. That is the *optimistic* read; the adversarial agent's Barber-Odean reading is darker.

**What this looks like**: one of the three names files an S-3 shelf or a 424B5 after a rally, the stock opens −12%, I follow my own rule and cut the position 50% the same day, I book a loss, and in five years the company is still alive but my shares represent half the company they used to. Revenue can 10x while the stock halves.

**If it happens**, do not average down. The wash-sale rule plus the base rates says the add is almost always wrong on dilutive small-caps. The 50% cut is non-negotiable.

## Failure mode 2 — The big-tech names stall for reasons unrelated to quantum

MSFT, GOOG, IBM, and NVDA are 45% of the book. If the AI capex cycle rolls over for macro reasons — higher rates, a recession, China export-control escalation that hits NVDA specifically — this bucket drags the portfolio down, and quantum has nothing to do with it. The "survivorship" design means I live through it, but I will spend a year watching the book be down because of things the portfolio isn't even about.

**If it happens**, do not rotate out. The whole point of owning MSFT-GOOG-IBM is that they were bought for the 10-year quantum option, not the AI quarter. Selling the survivorship bucket to chase a non-quantum catalyst is the exact mistake the adversarial agent predicts.

## Failure mode 3 — I trade this account because the site exists

The analytics purist agent flagged this explicitly. A public trade-publishing site manufactures the urge to produce trades. Barber & Odean (1999, 2001) found retail investors who trade most underperform buy-and-hold by ~6.5%/yr. Publishing in public is a known overtrading trigger — "something to report" replaces "something to decide." The site's kill-switch is set at two cron-triggered trades per rolling 12 months. If I hit it, the weekly cron shuts off and I owe the reader an explanation.

**If it happens**, the site is the problem, not the portfolio. Shutting down the cron is the right move even if it feels like quitting.

## Failure mode 4 — Quantum takes 20 years, not 10

The bear agent's core thesis. Commercial quantum advantage may well arrive outside this portfolio's horizon. In that world, the pure-plays are mostly zeros, QTUM is roughly flat, and the big-tech bucket carries the book through its own AI cashflows without any quantum contribution. I end up with a portfolio that returned something like the Nasdaq because I owned mostly the Nasdaq. That is not a failure of risk-management — that is the thesis being wrong.

**If it happens**, the lesson is in the agent weights. The bear and historian were right; the bull was expensive. The reweighting mechanism built into the prediction log is what catches this over 2-3 years of Brier scoring. The point of this entire exercise is to produce data to settle exactly this question.

## What would actually make me happy, ten years from now

Not "I made 50x." That is survivorship bias talking before the fact. What would make me happy is: a complete logbook of decisions, a calibrated record of which agent was right about what, and the ability to hand a future version of myself a transcript of how a small retail portfolio navigated a technological thesis. The money is a mini-game. The method is the game.

I will be wrong about the specific failure modes above. The value of writing them down is that when I am wrong about them, I will be wrong in a legible, scoreable way — not a "oh I always said" way.

---

**Owned by**: all five agents, co-signed.
**Next round**: 2026-05-31.
**Drawdown as of publication**: 0.0% (baseline day). Peak was 2026-01-31 at $4,825.03.

*This is not investment advice. This is one person thinking in public, with real money, on a 10-year horizon.*
