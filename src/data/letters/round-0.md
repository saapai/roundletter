---
round: 0
date: 2026-04-14
title: "How I'm Going to Turn $3,453 Into a $100,000 Birthday Party Using Five AI Agents and No Job: A Pre-Mortem"
subtitle: "I need a 29x. The S&P does 10x in 25 years. The gap between those numbers is the entire joke, and also the entire point."
portfolio_value: 3453.83
---

# How I'm Going to Turn $3,453 Into a $100,000 Birthday Party Using Five AI Agents and No Job

*A pre-mortem, filed before the first weekly cron has even fired, so that when I am wrong I cannot quietly pretend I did not know I would be.*

---

The account is at **$3,453.83**. The goal is **$100,000 by June 21** — my birthday. That is about **ten weeks.** The plan is to let five AI agents argue about stocks while I sit on the couch and refuse to get a job. The party is already booked in my head — rooftop, open bar, a printed copy of this letter taped to the door at eye level. [[bear: This is the sentence that will sell you on the trade you should not make. Flag it.]]

I need a **29x**. The S&P does 10x in roughly 25 years. The gap between those two numbers is the entire joke. It is also the entire point. This is not an investment plan. This is an **ego mini-game** with a P&L attached, and the mini-game is the product. The money is the scoreboard.

I am publishing the pre-mortem so that later, when the account is at $4,100 and I am quietly telling myself that "$4,100 is basically $100,000 if you squint," there is a document on the internet with my name on it reminding me that no, it is not.

## The mini-game, stated plainly

- **Stake**: $3,453.83.
- **Goal**: $100,000 by June 21 (summer solstice).
- **Required multiple**: ~29x.
- **Jobs held during game**: zero, by design.
- **Counsel**: five AI agents — the Bull, the Bear, Macro, Flow, the Historian — equal-weighted until they earn their weights by being right about things in public.
- **Win condition**: the party.
- **Loss condition**: any of the four failure modes below.
- **Meta-win condition** (far more likely, also fine): a complete, scoreable logbook of being wrong in legible ways.

I am going to lose. That is the base rate, and I know it. What makes this worth doing is that I am going to lose in public, with my reasoning timestamped, which is the one version of losing that teaches anything. [[bull: 49% is a coin flip, not a loss. The probability that at least one of the three pure-plays hits is almost exactly one-in-two. Call the math what it is.]]

## What I just did

I liquidated five non-thematic positions (SMR, QNC, RIME, SRFM, TENX), trimmed IONQ from 18.5 shares to 11.3, and bought a ten-position portfolio anchored around quantum computing for a 10-year horizon. The shape:

- **45%** in big-tech companies with credible quantum programs (MSFT, GOOG, IBM, NVDA). The bear agent owns most of this bucket. These are companies that don't need quantum to work.
- **20%** in QTUM, the Defiance quantum ETF. The historian agent's pick, borrowed from the 1999 lesson: owning QQQ beat picking individual dot-coms by orders of magnitude.
- **20%** in three pure-plays — IONQ (trapped-ion), RGTI (superconducting), QBTS (annealing). The bull agent's thesis. Sized so that if all three go to zero, the portfolio is down 20%, not 50%. Split across three qubit architectures because at least one of them is going to die. [[flow: Three names, three different funding-market exposures. If one of them opens an ATM shelf, the others catch sector sympathy on the same day. Treat the correlation as 0.6, not 0.]]
- **10%** in Constellation Energy, the macro agent's conviction that electrons are the binding constraint on compute and nuclear PPAs are the moat. [[macro: 10% is the floor. If a hyperscaler signs a second nuclear PPA before the next round, this bucket doubles before anything in the quantum book moves.]]
- **5%** in SGOV, dry powder reserved for a kill-switch buy if QTUM draws down 30% from here.

The full holdings table is at `/positions`. Every trade is at `/trades`.

Note what this portfolio is **not**: it is not a 29x portfolio. A 29x portfolio is three small-cap lottery tickets and a prayer, and the prayer has to work. This one is built for survival, which is a polite word for "the birthday math does not work." The mini-game and the portfolio are arguing with each other. I am letting them. The argument is the content.

## Why publish a pre-mortem

I got 120%+ in 15 months and then gave back 31% in two months. Anyone could narrate that as skill. The only defense against retrofitting a story to whatever happens next is to write down, in public, what I think will go wrong **before** it goes wrong. The other defense is admitting on the record that I am partly doing this for a party.

So here are the four ways I expect the mini-game to end with me sending a regret text to the venue.

## Failure mode 1 — The pure-plays dilute me into the ground

IONQ, RGTI, and QBTS are pre-revenue. They raise capital by issuing shares. The base-rate historian inside my agent panel put a 25% ten-year survival probability on IONQ and 15% on RGTI. That is the *optimistic* read; the adversarial agent's Barber-Odean reading is darker.

**What this looks like**: one of the three names files an S-3 shelf or a 424B5 after a rally, the stock opens −12%, I follow my own rule and cut the position 50% the same day, I book a loss, and in five years the company is still alive but my shares represent half the company they used to. Revenue can 10x while the stock halves.

**If it happens**, do not average down. The wash-sale rule plus the base rates says the add is almost always wrong on dilutive small-caps. The 50% cut is non-negotiable.

## Failure mode 2 — The big-tech names stall for reasons unrelated to quantum

MSFT, GOOG, IBM, and NVDA are 45% of the book. If the AI capex cycle rolls over for macro reasons — higher rates, a recession, China export-control escalation that hits NVDA specifically — this bucket drags the portfolio down, and quantum has nothing to do with it. The "survivorship" design means I live through it, but I will spend a year watching the book be down because of things the portfolio isn't even about.

**If it happens**, do not rotate out. The whole point of owning MSFT-GOOG-IBM is that they were bought for the 10-year quantum option, not the AI quarter. Selling the survivorship bucket to chase a non-quantum catalyst is the exact mistake the adversarial agent predicts.

## Failure mode 3 — I trade this account because the site exists (and because I want the party)

The analytics purist agent flagged this explicitly. A public trade-publishing site manufactures the urge to produce trades. A birthday deadline manufactures a second urge on top. Between the two, I have built myself an almost perfect overtrading machine.

Barber & Odean (1999, 2001) found retail investors who trade most underperform buy-and-hold by ~6.5%/yr. [[historian: The same dataset shows the *top* quintile of retail traders by turnover underperforms by 11.4%, not 6.5%. 6.5% is the median. Nobody is the median when they're the one posting on the internet.]] Publishing in public is a known overtrading trigger — "something to report" replaces "something to decide." A self-imposed birthday deadline is the same trigger wearing a hat. The site's kill-switch is set at two cron-triggered trades per rolling 12 months. If I hit it, the weekly cron shuts off and I owe the reader an explanation.

**If it happens**, the site is the problem, not the portfolio. The party gets canceled before the cron does; the cron gets canceled before I start pretending I am day-trading my way to a venue deposit.

## Failure mode 4 — Quantum takes 20 years, not 1, and so does the party

The bear agent's core thesis. Commercial quantum advantage may well arrive outside this portfolio's horizon — which, for the mini-game, is specifically ten weeks. In that world, the pure-plays are mostly flat, QTUM is roughly flat, and the big-tech bucket carries the book through its own AI cashflows without any quantum contribution. I end up on my birthday with a portfolio that returned something like the Nasdaq because I owned mostly the Nasdaq. That is not a failure of risk-management — that is the thesis being early, which, as the saying goes, is indistinguishable from the thesis being wrong, which, for party-planning purposes, is indistinguishable from the thesis being wrong.

**If it happens**, the lesson is in the agent weights. The bear and historian were right; the bull was expensive. The reweighting mechanism built into the prediction log is what catches this over 2-3 years of Brier scoring. The point of this entire exercise is to produce data to settle exactly this question. The point of the *party* was never going to be settled by this portfolio; the party was a framing device I used to trick myself into writing everything down. It worked.

## What would actually make me happy, on my birthday

Not "I made 29x." That is survivorship bias talking before the fact, and also, I know it is not going to happen. What would make me happy is: a complete logbook of decisions, a calibrated record of which agent was right about what, and the ability to hand a future version of myself a transcript of how a small retail portfolio with no salary behind it navigated a technological thesis and an ego mini-game at the same time.

The money is the mini-game. The method is the game. If on my birthday the account is at $7,200 and the logbook is complete, the party is smaller and the logbook is still the product. If on my birthday the account is at $100,000 and the logbook is empty, I have a party and no information. The second outcome would actually be worse. I am aware this is the kind of sentence people write right before they do not, in fact, behave that way.

I will be wrong about the specific failure modes above. The value of writing them down is that when I am wrong about them, I will be wrong in a legible, scoreable way — not a "oh I always said" way.

---

**Owned by**: all five agents, co-signed. The mini-game is owned by me alone.
**Next round**: 2026-05-31.
**Drawdown as of publication**: 0.0% (baseline day). Peak was 2026-01-31 at $4,825.03.
**Distance to $100K**: 28.95x and counting down.

*This is not investment advice. This is one person thinking in public, with real money, on a 10-year horizon, with a ten-week party deadline stapled to the front.*
