# AURELIEX · RELAUNCH PLAN

> **Status:** Planning complete. Decisions locked. Awaiting build.
> **Last updated:** 25 apr 2026
> **Owner:** saapai
> **Audience:** future Claude Code agents (debate + implement)

---

## 0 · TL;DR

Aureliex is a publicly-owned studio whose product is **green credit** — a
stake-balance backed by a public portfolio, redeemable on demand via
Venmo/Zelle, personally guaranteed by saapai. Three weeks since launch,
the apparatus stands at **$4,129** across three books (stocks +
Polymarket + Kalshi). The relaunch ships:

- `/studio` — the canonical ledger (replaces nothing, becomes the spine)
- `/letters/round-1` — the announcement post (the asset to share)
- `/green-credit` — rewritten as the product page
- `/buy` — Stripe checkout for green credit, 5 tiers
- `/sealed/impossible` — 5 hashed claims, revealed at the party
- `/party` — rules + flight pool + redemption mechanics
- `/auction` — sealed-bid for one art piece, closes party day
- `/panel` — public AI debate interface (local inference)

Cull `/friday`, `/attention`, `/market`. Don't touch the rest.

---

## 1 · Context (for agents joining cold)

### What aureliex is today

A live, magazine-style site at **aureliex.com** documenting one person's
attempt to take a **$3,453 brokerage account to $100,000** by their
**21st birthday (21 jun 2026)**. Built in Next.js 14 (app router),
Tailwind, deployed on Vercel.

The site has ~30 routes. Key surfaces:

- `/` (homepage cover) · Yoshida woodblock + wager + live ticker
- `/positions` · the stock book detail
- `/argument` · five-agent panel debate (bull/bear/macro/flow/historian)
- `/trades` · timestamped trade ledger with rationale
- `/let-down` · the foundational pre-mortem essay
- `/green-credit` · the manifesto (currently)
- `/archive` · everything below the cover (coda, bookends, Tyler posters, etc.)
- `/6969` · the credits roll / hunt entrance
- `/letters/round-0` · the original sealed pre-mortem letter

The site already has a 5-agent panel debate mechanic (`/api/agents/stock-debate`),
sealed-prediction filer (`OpenPredictionFiler` component), an easter-egg
hunt system (`HuntProvider`), and live portfolio polling
(`/api/prices`, `LedgerColumn`, `LiveStrip`).

### What changed three weeks in

1. **External capital arrived** ($100 cumulative across two ext entries)
2. **Easter eggs paid out** ($61 in equity gifted to readers who solved them)
3. **Polymarket + Kalshi books opened** (real positions, real today P&L)
4. **Local AI inference capability** (panel debates can run free)
5. **Stripe-ready** (waiting on env vars + pages)

### The full apparatus, today

```
APPARATUS · 25 apr 2026 · day 13

  stock book · Fidelity              $3,870.38
  polymarket · saathvikpai             $192.75
  kalshi     · loud.flamingo3142        $66.07
  ──────────
  TOTAL APPARATUS                    $4,129.20

  goal                             $100,000.00
  gap                              −$95,870.80
  T                                     58 days
```

### The cap table

```
saapai (founder)                    $3,968.20    96.1%
external cash investors               $100.00     2.4%
egg-solvers (gifted equity)            $61.00     1.5%
──────────
green credit outstanding              $161.00
```

**Critical detail:** the $61 of gifted equity is a **cap-table transfer**,
not a cash outflow. Money has not left the apparatus. Egg-solvers earned
their stakes by playing the hunt. They paid zero. They redeem on the same
terms as paid investors.

---

## 2 · The thesis (one paragraph, locked)

> **aureliex is a publicly-owned studio.** Its product is **green credit** —
> a stake-balance backed by a public portfolio. Holders can buy it. Holders
> can redeem it on demand, instantly, via Venmo or Zelle, personally
> guaranteed by saapai from his own bank account. Every dollar in, every
> dollar out, every position, every cap-table seat is publicly visible on
> `/studio` in real time. The studio runs four products. The wager is the
> apparatus reaches $100,000 by 21 June 2026 — through trading + external
> investment + predictions + auction proceeds combined. *No payment
> platform that profits from float has guaranteed redemption this fast.
> Nobody.*

Sign that paragraph and the rest of the relaunch follows from it.

---

## 3 · The studio · 4 products

| # | Product | Status | Surface |
|---|---|---|---|
| 0 | aureliex / the apparatus | **LIVE** since 12 apr | `/studio` (existing data) |
| 1 | the panel · public AI | **SHIPS WITH RELAUNCH** | `/panel` (new, local inference) |
| 2 | bruin meals | **STEALTH** · UCLA waitlist | `/bruins` (placeholder) |
| 3 | open | — | — |

One studio. One cap table. One party. One stake buys you into all of them.

---

## 4 · The 5 sealed claims

Sealed today, revealed at the party 21 jun 2026 18:00 PT.

The **plaintext stays only on saapai's laptop** until reveal. The site only
shows the SHA-256 hash of `plaintext + nonce`.

Plaintext (for owner's eyes only — DO NOT COMMIT):

```
SP-IMPOSSIBLE-001
sealed:  25 apr 2026
reveal:  21 jun 2026 18:00 PT
nonce:   ··········

claim 1: green credit becomes the first payment instrument to maintain
         >100% personal redemption float (saapai's bank balance ≥ stakes
         outstanding) while profiting from float, verifiable continuously
         through 31 dec 2026.

claim 2: aureliex apparatus reaches $1,000,000 by 31 dec 2026.

claim 3: aureliex apparatus reaches $1,000,000,000 by 21 jun 2027
         (saapai's 21st birthday).

claim 4: at least one of the studio's products (aureliex, the panel,
         bruin meals, or product 3) reaches 10,000 weekly active users
         by 31 dec 2026.

claim 5: aureliex becomes the first publicly-owned trillionaire
         (cumulative held green credit ≥ $1T) before any private
         individual reaches $1T net worth.

attestation: signed by saathvik pai, 25 apr 2026.
```

The site stores the hash + commit signature in `src/data/sealed/impossible.json`:

```json
{
  "id": "SP-IMPOSSIBLE-001",
  "sealed_at": "2026-04-25T18:00:00-07:00",
  "reveal_at": "2026-06-21T18:00:00-07:00",
  "commitment_sha256": "a8f7c2....",
  "plaintext": null,
  "nonce": null
}
```

On reveal day, the plaintext + nonce get committed to the file. Verifier
hashes them, confirms match.

---

## 5 · Pages to build (canonical specs)

### 5.1 `/studio` · the canonical ledger

**File:** `src/app/studio/page.tsx`

**Reads from:**
- `src/data/portfolio.json` (existing)
- `/api/prices` (existing, live)
- `src/data/bet-lines.json` (existing)
- `src/data/art-portfolio.json` (existing)
- `src/data/trades.json` (existing)
- `src/data/auction.json` (NEW)
- `src/data/stake-ledger.json` (NEW)
- `src/data/sealed/impossible.json` (NEW)

**Sections (in order):**
1. The wager headline (apparatus / goal / gap / T)
2. The apparatus (3 books, all positions, live values)
3. The cap table (saapai / cash investors / egg-solvers / green credit outstanding)
4. Redemption float (saapai's personal bank balance, coverage %, rail, guarantor, backup)
5. External cash-flow ledger (in / gifted equity / no cash out)
6. The prediction sleeve (open positions, daily picks, public history)
7. The art portfolio (one in auction, 13 locked)
8. The studio (4 products with status)
9. Path to $100k (sources + range)
10. The seal (commitment hash, reveal countdown, verifier link)

**Live polling:** every 15s during market hours (matches `/positions`).

### 5.2 `/letters/round-1` · the post

**File:** `src/app/letters/round-1/page.tsx`

**Static page.** The 250-word version of the announcement (3 acts: green
credit live · studio framing · party/auction/seal). See section 6 below
for full copy.

### 5.3 `/green-credit` (rewrite)

**File:** `src/app/green-credit/page.tsx` (UPDATE existing)

Replace the manifesto-only page with:
1. **Top section:** product spec ("how it works", "why this has never existed", "the covenant", "precedent")
2. **Below:** existing manifesto content, retitled "the manifesto"

### 5.4 `/buy` · Stripe checkout

**File:** `src/app/buy/page.tsx` + `src/app/api/stripe/checkout/route.ts` + `src/app/api/stripe/webhook/route.ts`

**5 tiers:** $10 / $50 / $100 / $500 / $1,000

**Required env vars on Vercel:**
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

**On successful payment:** webhook writes a record to
`src/data/stake-ledger.json`:

```json
{
  "stripe_payment_intent": "pi_xxx",
  "amount_usd": 50,
  "tier": "stake-holder",
  "buyer_email": "buyer@example.com",
  "buyer_handle": "anonymous|public-display-name",
  "ts": "2026-04-25T14:32:00-07:00",
  "redeemed": false
}
```

(For v1, write the file via the GitHub Contents API since Vercel
serverless filesystems are read-only at runtime. Pattern is established
in `src/app/api/hero/generate/route.ts`.)

**Refund flow:**
- User texts `redeem $X` to saapai's number
- Saapai sends Venmo/Zelle from personal account (instant)
- Saapai issues Stripe refund manually (5-10 days to settle)
- `stake-ledger.json` record gets `redeemed: true` + `redeemed_at`

### 5.5 `/sealed/impossible`

**File:** `src/app/sealed/impossible/page.tsx`

**Layout:** centered, Cercato-cinematic register, big hash + countdown.
Reveal mechanism: when `plaintext != null` in `src/data/sealed/impossible.json`,
the page renders the plaintext + nonce alongside the hash for verification.

### 5.6 `/party`

**File:** `src/app/party/page.tsx`

Static rules page. See section 9 for full copy.

### 5.7 `/auction`

**File:** `src/app/auction/page.tsx` + `src/app/api/auction/bid/route.ts`

**Mechanic:** Stripe SetupIntent (authorize but don't charge). Bids
written to `src/data/auction.json`. On June 21 at 17:30 PT, the highest
bid is captured (charged); all others are released.

```json
{
  "piece_id": "eagle-up-close",
  "title": "eagle, up close",
  "medium": "graphite on paper",
  "year": 2019,
  "floor_usd": 100,
  "closes_at": "2026-06-21T17:30:00-07:00",
  "bids": [
    {
      "stripe_setup_intent": "seti_xxx",
      "max_bid_usd": 250,
      "bidder_handle": "anon",
      "ts": "2026-04-26T10:00:00-07:00"
    }
  ],
  "winner": null
}
```

### 5.8 `/panel`

**File:** `src/app/panel/page.tsx` + `src/app/api/panel/run/route.ts`

Public-facing AI debate interface. User submits a ticker / question, panel
runs (5 agents), output is rendered + archived. Free tier 5/day per IP.
$50+ tier unlimited (gated by stake-ledger lookup).

**Local inference endpoint:** TBD by saapai. For v1, route can call
Anthropic under the hood to ensure quality, swap to local once tested.

### 5.9 Cover (`/`) · minimal addition

**File:** `src/app/page.tsx` (UPDATE)

Add two elements to the existing dark cinematic cover:
- `buy green credit · /buy` — amber mono caps, just below the progress sub-line
- `sealed · reveal 21 jun · a8f7c2···` — tiny mono badge under the cursive signature

Wager headline updates to use **apparatus total ($4,129)** not stock-book-only.

---

## 6 · /letters/round-1 · canonical copy

```
AURELIEX · LETTER · ROUND 1
25 apr 2026 · day 13

─────────

thirteen days. the apparatus stands at $4,129.

    stock book     $3,870     +$38   today
    polymarket       $193     −$8    today
    kalshi           $66      −$9    today

$100 came in from people who paid. $61 went out as gifted
equity to readers who found the hunt's eggs. nothing has
left the apparatus — the eggs were cap-table seats, given
away for finding them. the door has been open both ways
the whole time.

today three things change.

─────────

I · GREEN CREDIT IS LIVE

green credit is a stake-balance backed by a public portfolio.
you can buy it. you can spend it. you can redeem it.

redemption is personal. if you want out, text me. I send you
Venmo or Zelle from my own bank account, in under 60 seconds,
for the full dollar amount you put in. my checking-account
balance for the redemption float is published on /studio in
real time. when stakes outstanding approach the float, new
sales pause.

no payment platform that profits from float has ever
honored redemption this fast. stripe doesn't profit. banks
take 2-5 days. brokerages settle T+2. crypto isn't spendable.

green credit is the product. the personal guarantee is
the differentiator.

     → /buy

─────────

II · AURELIEX IS A STUDIO

one studio · one cap table · four products

    product 0 · the apparatus               (LIVE)
    product 1 · the panel · public AI       (SHIPS TODAY)
    product 2 · bruin meals                  (STEALTH)
    product 3 · open                          —

one $50 stake gets you into all of them. like a record
label, not a single song.

     → /studio

─────────

III · THE PARTY · THE AUCTION · THE SEAL

21 june 2026. los angeles. stake-holders welcome.

ten percent of the apparatus on party day reimburses flights
for holders who attend physically. flat distribution. hold-
until-party. no flippers in the room.

one art piece — eagle, up close — closes for sealed bids
that day. floor $100. ten percent of the winning bid stakes
back into the apparatus. the auction reveal is the room's
first beat.

the seal is the room's last beat. five claims sealed today,
plaintext released at 18:00 PT. anyone can verify the hash.
only people in the room when it breaks see it land.

commitment ── a8f7c2············

     → /party  ·  /auction  ·  /sealed/impossible

─────────

the wager isn't just trading. it's the apparatus reaching
$100k through every legitimate source aureliex has — trading,
stakes, predictions, auction. that's why the relaunch is the
mechanism, not the marketing.

the door is open.

── saapai · aureliex
── 25 apr 2026 · day 13
```

---

## 7 · /buy · 5 tiers (canonical)

```
┌────────┬─────────┬──────────┬──────────┬──────────┐
│  $10   │  $50    │  $100    │  $500    │  $1,000  │
│ PATRON │ STAKE-  │ FOUNDER  │ INNER    │ STUDIO   │
│        │ HOLDER  │          │ RING     │ PARTNER  │
├────────┼─────────┼──────────┼──────────┼──────────┤
│ ledger │ + party │ + sealed │ + back-  │ + monthly│
│ name   │ access  │ auction  │ stage at │ studio   │
│        │ (LA, 21 │ pre-     │ the seal │ briefings│
│ /panel │ jun)    │ access   │ reveal   │ via SMS  │
│ 5x/day │         │          │          │          │
│        │ + flight│ + signed │ + /panel │ + named  │
│ /sealed│ pool    │ digital  │ unlimited│ in       │
│ on day │ pro-rata│ cert     │          │ founders'│
│ of     │         │          │ + bruin  │ row of   │
│ reveal │ + /panel│ + /panel │ meals    │ /studio  │
│        │ public  │ unlimited│ beta     │          │
└────────┴─────────┴──────────┴──────────┴──────────┘
```

---

## 8 · /studio · headline section copy

```
AURELIEX STUDIO · LEDGER · 25 apr 2026 · day 13

─── 1 · THE WAGER ───
$3,453 → $100,000 by 21 jun 2026
apparatus today  $4,129.20  · gap $95,870.80  · T-58

─── 2 · THE APPARATUS ───
[stock book table — pulled live from /api/prices]
[prediction book — Polymarket + Kalshi current values]
TOTAL APPARATUS                    $4,129.20

─── 3 · THE CAP TABLE ───
saapai (founder)                   $3,968.20    96.1%
external cash investors              $100.00     2.4%   N holders
egg-solvers (gifted equity)           $61.00     1.5%   M holders
────
green credit outstanding             $161.00

no money has left the apparatus. the $61 is equity transferred
on the cap table to the readers who found the hunt's eggs.
they are stake-holders. they paid in zero. they earned in
by playing.

─── 4 · REDEMPTION FLOAT (saapai's personal guarantee) ───
redeemable obligations              $161.00
saapai's personal float           $1,XXX.XX     [TBD]
coverage                           XXXX%
speed                              <60 seconds
rail                               Venmo · Zelle
guarantor                          saapai (personal · public)
backup                             [name TBD]

[remaining sections per section 3 above]
```

---

## 9 · /party · canonical rules

```
THE PARTY

21 june 2026 · sunset → midnight · los angeles
exact address texted to stake-holders 7 days prior

THE HOLD RULE
you get in if you bought a stake AND held it continuously
through the moment of the party. no flips.

THE FLIGHT POOL
on party day, 10% of apparatus value is set aside as a
flight-reimbursement pool. each attending holder gets their
flat share, capped at receipts they submit (flight + ground +
one night). stake size buys access. it does not buy MORE
reimbursement. flat is the rule.

THE AUCTION CLOSES HERE
sealed-bids close at 17:30 PT. winner announced 17:45 PT.
piece transferred 18:00 PT.

THE SEAL BREAKS HERE
18:00 PT exactly. on the projector. plaintext + nonce
committed publicly. you are in the room because you held.

REDEMPTION AT THE PARTY
green credit can be redeemed on the spot · for: the auction
bid · for party-exclusive merch · or for cash via Venmo/Zelle.
```

---

## 10 · Pages to cull

| Page | Why |
|---|---|
| `/friday` | dead chatbot, never wired |
| `/attention` | placeholder never completed |
| `/market` | UI stub, no commerce wired (Stripe will come via /buy instead) |

Just delete the directories.

---

## 11 · Pages to leave (DO NOT TOUCH)

`/let-down` · `/keys` · `/canvas` · `/arc` · `/archive` · `/archives` ·
`/archives/v3` · `/about-the-method` · `/closed` · `/closed/medicine` ·
`/letters/math` · `/letters/paradigm` · `/letters/v1` · `/letters/round-0` ·
`/v1/[n]` · `/17` · `/17/[funnel]` · `/statement/panel` · `/statement` ·
`/pitch` · `/positions` · `/argument` · `/trades` · `/canvas` · `/6969`

These are load-bearing as-is. The existing apparatus already supports
the new vision. Don't try to update them.

---

## 12 · Decision lock list

| Decision | Locked answer |
|---|---|
| Wager scope | apparatus (all 3 books summed) |
| Liquidity claim · marketing | "redeemed via Venmo/Zelle in under 60 seconds, personally guaranteed by saapai" |
| Liquidity mechanic · v1 | personal Venmo/Zelle from saapai's bank · Stripe refund refills float in 5-10 days |
| Float visibility on /studio | public · saapai's redemption-float balance shown in real time |
| Float threshold to pause sales | 150% (sales pause if outstanding > 67% of float) |
| Per-holder redemption cap | $500 / 24h |
| Naming of product | "green credit" (canonical) · "stake" (colloquial) |
| Cap table · public or private | public by default · opt-out via Stripe metadata |
| Equity gifted to egg-solvers · redeemable? | yes · same terms as paid stakes · full Venmo cash-out |
| Buy tiers | 5 tiers · $10/$50/$100/$500/$1,000 |
| Letter opener tone | matter-of-fact ("thirteen days. the apparatus stands at $4,129") |
| Sealed thesis · 5 claims | covenant + $1M EOY + $1B by 21st + 10K WAU + publicly-owned trillionaire |
| Sealed reveal time | 21 jun 2026 · 18:00 PT · at the party |
| Auction format | sealed bids · Stripe SetupIntent · close 17:30 PT party day |
| Auction stake-back | 10% of winning bid → apparatus |
| Auction piece | eagle, up close · floor $100 |
| Party reimbursement model | flat · pool split equally across attending holders, capped at receipts |
| Reimbursement pool size | 10% of apparatus on party day |
| Hold rule | continuous from purchase to party · no breaks |
| Sign-off | "saapai · aureliex" |
| Letter slug | `/letters/round-1` |
| Studio framing | loud · "aureliex is a studio with 4 products" headline-level |
| Products to name | all 4 (the panel ships, bruin meals stays stealth-named, product 3 stays open) |
| Which product ships day-1 | the panel · `/panel` |
| Letter length | 250-word version · /studio carries the depth |
| Live polling on /studio | every 15s during market hours |

---

## 13 · Numbers still TBD (waiting on saapai)

| Number / name | What it's for |
|---|---|
| Float starting commitment | minimum bank balance dedicated to redemptions (suggested: $1,000-$2,000) |
| Per-holder redemption cap | safety against runs (suggested: $500 / 24h) |
| Backup signer name | published on /studio in case saapai unavailable |
| Bruin Meals 1-line description | for the stealth blurb on /studio |
| Local-AI endpoint URL | for `/panel`; if not ready, fall back to Claude under the hood |
| Stripe API keys | put in Vercel env, see section 5.4 for var names |

---

## 14 · Implementation order

### Wave 1 · day-of relaunch (minimum to be credible)

1. `/studio` · the canonical ledger
2. `/letters/round-1` · the post
3. `/green-credit` · rewrite with product spec
4. `/sealed/impossible` · hash + countdown (plaintext local-only)
5. Cover update · `/buy` CTA + sealed badge
6. Cull `/friday`, `/attention`, `/market`

### Wave 2 · within a week

7. `/buy` + Stripe checkout + webhook + stake-ledger.json
8. `/party` · static rules

### Wave 3 · within two weeks

9. `/auction` + Stripe SetupIntent + auction.json
10. `/panel` · local AI debate interface

---

## 15 · Files to touch (concrete list)

### NEW

```
src/app/studio/page.tsx
src/app/letters/round-1/page.tsx
src/app/buy/page.tsx
src/app/sealed/impossible/page.tsx
src/app/party/page.tsx
src/app/auction/page.tsx
src/app/panel/page.tsx
src/app/api/stripe/checkout/route.ts
src/app/api/stripe/webhook/route.ts
src/app/api/auction/bid/route.ts
src/app/api/panel/run/route.ts
src/data/auction.json
src/data/stake-ledger.json
src/data/sealed/impossible.json
```

### UPDATE

```
src/app/page.tsx                 (cover · buy CTA + sealed badge)
src/app/green-credit/page.tsx    (rewrite with product spec)
src/app/globals.css              (new component styles for studio + buy + sealed)
```

### DELETE

```
src/app/friday/
src/app/attention/
src/app/market/
```

---

## 16 · Risk inventory (final)

1. **Personal liquidity event** · saapai's bank drained for non-redemption reason → keep dedicated "aureliex redemption" sub-account
2. **You disappear** · personal guarantee dies → name backup signer publicly
3. **Run on the bank** · coordinated mass redemption → $500/24h/holder cap in terms
4. **Stripe disputes** · fraud-card buyers → Stripe Radar high, eat early disputes
5. **Tax 1099-K** · Venmo above $600/yr triggers IRS reporting → record-keeping discipline
6. **Float opportunity cost** · idle redemption float doesn't compound → acceptable tax for trust at v1
7. **The seal is permanent** · 5 claims, sealed today, can't change → spend tonight on the actual plaintext
8. **/panel uncurated output** · disclaimer required: "not advice · entertainment · the panel is a fictional character"
9. **Local-AI quality** · public-facing AI must feel sharp → fall back to Claude under the hood for v1 if needed
10. **Studio expectation creep** · 4 products named = readers expect 4 to ship → plan to deliver something in each row by year-end
11. **Egg-solver tax** · gifted equity > $600/yr to one person triggers 1099-MISC → track gift values per recipient
12. **Trillionaire claim asymmetry** · falling short = lol moment, hitting it = generation-defining → asymmetry favors making the claim

---

## 17 · For future agents debating this plan

### Open questions worth re-arguing

- **Should the homepage cover ITSELF change radically for the relaunch**, or stay as the Yoshida-cinematic version with just the two added CTAs? (Current plan: just add CTAs. Counter-argument: the relaunch is a phase shift, the cover should signal that.)
- **Should `/letters/round-1` REPLACE the homepage at the URL**, or stay as a separate letter? (Current plan: separate. Counter-argument: the post IS the relaunch, the homepage should redirect to it for 24h after launch.)
- **Should green credit balances earn interest** (passing on a portion of the apparatus's gains to holders)? (Current plan: no — gains are saapai's, redemption is at-par. Counter-argument: holders get more skin in the game if they share upside.)
- **Should the redemption float be on-chain** (USDC in a wallet, public address) instead of a personal bank account? (Current plan: bank. Counter-argument: on-chain is more transparent and globally accessible. Tradeoff: regulatory complexity, KYC, harder for normies to use.)
- **Should the auction be sealed-bid OR live-ascending at the party**? (Current plan: sealed. Counter-argument: live-ascending is more theatrical and creates a higher final price.)
- **Should Bruin Meals be NAMED publicly in the relaunch**, or stay completely hidden? (Current plan: stealth-named, "STEALTH · UCLA waitlist." Counter-argument: don't introduce a product you can't ship; remove from the list entirely until ready.)
- **Should the /panel free-tier be 5 debates/day per IP**, or fully gated behind any stake purchase? (Current plan: 5 free/day. Counter-argument: free-tier dilutes the value of the paid tier.)
- **Should `/studio` show saapai's TOTAL bank balance**, or only the dedicated redemption sub-account? (Current plan: only the redemption float. Counter-argument: full transparency means full balance.)

### Conventions to follow when implementing

- **Tech:** Next.js 14 (app router), TypeScript, Tailwind, Vercel deployment
- **Style:** existing CSS in `src/app/globals.css` uses scoped class prefixes (`.h2-` for cover-v3, `.cov-` for the new cover, `.h2-strip-` for ticker, etc.) — follow this naming convention for new components
- **Type voices on cover (locked):** Fraunces (display italic for wager), Ms Madi (script for cursive signature), Georgia (body), ui-monospace (caption + ticker)
- **Palette (locked, scoped to `.home-v3`):** `--cov-bone #F2EFE8`, `--cov-ink #0A0A0A`, `--cov-rust #C44325`, `--cov-amber #F5B740`, plus `#9B2A4D` for the cursive signature
- **Existing components to reuse:** `LedgerColumn`, `LiveStrip`, `Masthead`, `LaunchTrailer`, `OpenPredictionFiler`, `HuntProvider`
- **Existing data files:** `src/data/portfolio.json`, `src/data/trades.json`, `src/data/bet-lines.json`, `src/data/art-portfolio.json`, `src/data/hook-debate.json`, `src/data/sealed-predictions.json`, `src/data/curation.json`
- **Existing API routes pattern:** see `src/app/api/agents/stock-debate/route.ts` for Anthropic SDK usage; see `src/app/api/hero/generate/route.ts` for GitHub Contents API write-back pattern
- **Bare paths** (no site chrome): `/`, `/archive`, `/17`, `/keys` — add `/studio`, `/letters/round-1`, `/buy`, `/sealed/impossible`, `/party`, `/auction`, `/panel` to this list in `src/app/layout.tsx`'s `BARE_PATHS`

### Suggested debate prompts for agents

1. *"Argue whether the auction should be sealed-bid or live-ascending. The owner picked sealed. Make the strongest case for live, then evaluate whether to overturn."*
2. *"Audit the legal posture of green credit's instant-liquidity claim. The owner has framed it as a personal Venmo guarantee, not a corporate one. Identify the strongest counter-argument that this is still securities or money transmission, then refute or concede."*
3. *"Imagine the relaunch ships and 1,000 stakes flow in within 7 days. The redemption float of $1,500 is now insufficient to cover $50,000 of outstanding stakes. What's the panel's emergency response plan? Argue: pause sales? Liquidate apparatus to refill? Disclose and ride it out?"*
4. *"Critique the 5 sealed claims. Which is most likely to fail? Which is most defensible? Should any be removed, weakened, or strengthened before the hash is committed?"*
5. *"The panel debates whether Bruin Meals should be named publicly in the relaunch. Bull says: it shows the studio is real. Bear says: don't name what you can't ship. Pick a winner."*

---

## 18 · How to start building

1. Read this doc end-to-end
2. Read `docs/design-bank.md` for the visual reference library
3. Read `src/app/page.tsx`, `src/app/archive/page.tsx`, and one `/letters/*/page.tsx` to internalize patterns
4. Read `src/data/portfolio.json` schema (it's the canonical book state)
5. Pick a Wave 1 file from section 14 and implement
6. Run `node_modules/.bin/tsc --noEmit && node_modules/.bin/next build` to verify before commit
7. Commit and push to main · Vercel auto-deploys

The owner has approved this plan in principle. Before shipping anything that
touches money (Stripe webhook, redemption flow, auction settlement), get
confirmation from the owner. Everything else is fair game.

---

## 19 · Glossary

- **Apparatus** · the total of all 3 books (stocks + Polymarket + Kalshi) combined
- **Green credit** · the canonical name for what users buy. A stake-balance backed by the apparatus
- **Stake** · colloquial for green credit. Used interchangeably in copy
- **Cap table** · the public ledger of who holds how much green credit
- **Redemption float** · saapai's personal bank balance dedicated to honoring redemptions via Venmo/Zelle
- **Hold-until-party** · the rule that party access requires continuous holding from purchase to 21 jun 2026
- **The seal** · 5 sealed claims about what aureliex becomes, hash committed today, plaintext revealed at the party
- **The studio** · aureliex framed as a holding-co with 4 products. Aureliex.com is the studio's mark
- **The hunt** · the existing easter-egg system that gifts equity to readers who solve puzzles
- **Egg-solver** · a reader who found a hunt egg and received gifted equity as their prize

---

*end · sleep on it · ship in the morning*
