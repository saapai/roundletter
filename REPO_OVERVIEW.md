# roundletter (aureliex.com) — Repo Overview

## Project Summary
A Next.js App Router site that publishes a single retail investor's portfolio in public: letters, trades, positions, and a canvas view. Core artifact is a weekly "round letter." Goal of the site is a transparent, scoreable logbook of decisions. Tech: Next.js 14 App Router, TypeScript, Tailwind, filesystem-backed content (JSON + Markdown).

## Architecture Diagram
```
                 +----------------------------+
    browser ---> |   Next.js App Router       |
                 |                            |
                 |  /            page.tsx (article = home)
                 |  /letters/round-0 page.tsx (duplicate view)
                 |  /positions  page.tsx
                 |  /trades     page.tsx
                 |  /canvas     page.tsx
                 |  /about-the-method page.tsx
                 |  /api/views  route.ts  <-- POST on scroll-to-bottom
                 +-------------+--------------+
                               |
                               v
                 +----------------------------+
                 |  src/lib/data.ts (read)    |
                 |  src/lib/md.ts  (render)   |
                 +-------------+--------------+
                               |
                               v
                 +----------------------------+
                 |  src/data/*.json           |
                 |  src/data/letters/*.md     |
                 |  data/views.json  <-- append log (gitignored)
                 +----------------------------+
```

## File/Directory Map
```
src/
  app/
    page.tsx                     home (v3) — PortfolioChart hero + v1 manifesto lines + BettableOdds + stack dock
    layout.tsx                   shell, nav, footer, metadata
    globals.css                  tailwind + typography
    letters/round-0/page.tsx     canonical letter URL (same content as /)
    positions/page.tsx           holdings table
    trades/page.tsx              trade log
    canvas/page.tsx              infinite-pan sketchbook
    about-the-method/page.tsx    method description
    api/views/route.ts           POST view-event logger, GET store dump
  components/
    ViewTracker.tsx              client; IntersectionObserver on end-of-article sentinel; POSTs /api/views once per session
    BettableOdds.tsx             server; hardcoded BOOK[] of 8 sealed predictions with 10–90 odds (thesis + % + hairline bar + mono meta)
    PortfolioChart.tsx           client; fetches /api/prices, composes sum(shares × close) grid, 1D/2D/All filter, SVG sparkline
    SavingsHero.tsx              client; tombstone figure ($1,296→peak) + BirthdayCountdown, rendered on /positions
    BirthdayCountdown.tsx        client; HH:MM:SS ticker to 2006-06-21 anniversary
  data/
    portfolio.json               baseline book, buckets, triggers, history
    trades.json                  timestamped trades
    agents.json                  five-agent panel metadata
    hunches.json                 externally-sourced hunches (S1 data + S2 human) with numerical credit attribution; read by the daily debate cron
    debates.json                 rolling log of last 180 daily debates (written by scripts/run-daily-debate.ts)
    gambles.json                 public bets with friends + self-bet
    letters/round-0.md           the pre-mortem letter (satirical-hook title)
  lib/
    data.ts                      reads JSON + letter markdown with frontmatter
    md.ts                        shared markdown -> HTML renderer
data/
  views.json                     runtime-written view log (gitignored)
```

## Feature Logic & Flows

### Home page = v3 live chart + manifesto + book
- `/` renders, top to bottom: `.v3-hero` (eyebrow strip + `<PortfolioChart>` with enlarged tombstone-register value) → `.v3-manifesto` (4 punchy serif lines distilled from v1.md) → `<BettableOdds>` (8 sealed predictions in 10–90 band) → `.v3-stack` (dock of links to `/letters/*`, `/about-the-method`, `/positions`).
- `PortfolioChart` fetches `/api/prices` client-side (Yahoo 30-min bars, 5d, cached 10min via sessionStorage), sums `shares × close` across the 10 holdings, anchors the "All" timeframe to the baseline ts with `account_value_at_entry` as the opening print.
- `<ViewTracker slug="home-v3" />` mounts at the end; same session-dedup as other slugs.
- Letter bodies (`round-0.md`, `math.md`, `paradigm.md`, `v1.md`) are still reachable at their canonical `/letters/*` URLs — they were removed from the home page, not deleted.

### View tracking (scroll-to-bottom = one "true" view)
```
page renders
    |
    v
ViewTracker mounts -> checks sessionStorage["rl:viewed:round-0"]
    |
    | (unseen this session)
    v
IntersectionObserver watches #view-sentinel-round-0 (threshold 0.5)
    |
    v
sentinel enters viewport (bottom of article)
    |
    v
POST /api/views { slug, referrer }  (keepalive)
sessionStorage flagged so refresh/replays don't double-count
    |
    v
/api/views route appends to data/views.json:
   { counts: { "round-0": N }, events: [ {ts, slug, ip, ua, referrer}, ... ] }
   On write failure (read-only FS e.g. Vercel) it falls back to console.log("[views]", ...).
```
- Dedup: sessionStorage key per slug. Reopen in a new tab = new session = new count.
- Count is one-per-session (not one-per-scroll), which is the intent of "true view."
- Log location: `data/views.json` at repo root (gitignored). `GET /api/views` returns the store.

### Letter rendering
`src/lib/md.ts::renderMarkdown` handles: `#` / `##` headings, `---` rules, `- ` bullets, `**bold**` paragraphs, inline `**bold**`/`*em*`/`` `code` ``. Anything else falls through as paragraph.

## Branching & Git Strategy
- Not a git repo at time of writing (verify with `git status` before assuming remotes).
- No active branches tracked here.

## Recent Changes Log

### 2026-04-18 — v3 home: chart-first, punchy v1 manifesto, bettable 10–90 book
- **What**: Replaced `src/app/page.tsx` entirely. Old home (four stacked letter articles + AbacusIteration + HomePassword + AgentsLegend + ViewsBadge) is gone from `/`. New layout: (1) v3-hero — full-width `<PortfolioChart>` composed with bigger tombstone type (Cormorant `clamp(3.5rem, 9vw, 6.75rem)` on `.pch-value`) plus an eyebrow row with `aureliex · round 0 · live` on the left and `<BirthdayCountdown>` on the right; (2) v3-manifesto — four modern-arty serif lines compressed from v1.md ("v1 is the only version of anything that cannot be lying" / "the outcome has not arrived" / "publish before you know" / aside "— dye in the water"); (3) `<BettableOdds>` — new component at `src/components/BettableOdds.tsx` rendering 8 sealed predictions in the 10–90 band (portfolio >$5k/$10k/$100k by 21 jun, IONQ>$60, NVDA-beat 20 may, kill-switch fires in 90d, QTUM−30%→SGOV, panel-calibrated-at-cycle-17); each row is thesis + % + hairline bar + mono meta (sealed date, horizon); (4) `/letters/*` and `/positions` and `/about-the-method` linked as a "the stack" dock at the bottom. Appended ~180 lines of `.v3-*` and `.book-*` CSS to `src/app/globals.css` (paper/ink/gold tokens reused; no new palette). Added `<ViewTracker slug="home-v3" />`.
- **Why**: User ask — "the most beautiful version of the stock portfolio growth, like Fidelity/Robinhood, constantly updating, just for my portfolio" as the new home page; "v1 text incorporated however possible but way more simply and punchy but modern arty"; "bettable as possible with 10 to 90 odds". Three asks, one surface: chart-as-hero + compressed v1 thesis + public book of priors. Home previously led with ~8,000 words of stacked letters, which buries the live-updating artifact the user actually wants people to land on. Letters preserved at their canonical `/letters/*` URLs, so no content lost — just reordered.
- **Impact**: Flows checked — (i) `/api/prices` unchanged, `PortfolioChart` component unchanged (composed, not modified; override styles scoped to `.v3-chart-wrap`); (ii) `/letters/round-0` still renders the pre-mortem via `getLetter()` — unchanged; (iii) `ViewTracker`'s session-dedup and `/api/views` POST unchanged; new slug `home-v3` will appear in `data/views.json` alongside existing slugs without collision; (iv) `ViewsBadge` aggregate across `ARTICLES = ["round-0","math","paradigm","v1"]` was rendered on the old home for cumulative reads — now lives only where those letters render individually, which is acceptable since this is a home redesign not a reads-metric change; if aggregate readout is desired on the new home, add `<ViewsBadge slugs={["round-0","math","paradigm","v1","home-v3"]} mode="aggregate" />` inside `.v3-hero-eyebrow` (future cleanup); (v) `AbacusIteration` + `HomePassword` no longer mount on home — neither is referenced elsewhere; if either should persist, re-add to page.tsx; (vi) `BettableOdds`' book is hardcoded — next iteration can pull from a new `src/data/book.json` once the user confirms the bet list; (vii) `npx tsc --noEmit` clean.

### 2026-04-17 — 5h argument cron: agents argue positions and designs, logged on /positions
- **What**: (a) `src/data/arguments.json` — new rolling log of agent arguments. Schema: `{ note, next_axis, arguments: [{ id, ts, axis, kind, title, summary, body? debate? }] }`. Axis alternates `position` / `design` via `next_axis` state field. Seeded with five research reports from the Apr-17 synthesis pass (letters, design/references, git DNA, debate engine, trajectory). (b) `scripts/run-5h-argument.ts` — reads arguments.json + portfolio.json + hunches.json; builds axis-specific dayContext (positions uses universe + active hunches + catalyst calendar + moderator directive; design hardcodes the current SavingsHero tombstone surface as dayContext + open design questions); runs `runDebate({ maxArgumentRounds: 3 })`; appends a compact entry to arguments.json (keeps last 40); flips next_axis. (c) `src/components/ArgumentsPanel.tsx` — server component reading the last 8 entries reverse-chron, rendering with axis badges (gold for position, ink for design), kind labels, click-to-expand details for report-kind entries. (d) `src/app/positions/page.tsx` — mounts `<ArgumentsPanel />` below `<TodayDebate />`. (e) `.github/workflows/5h-argument.yml` — GH Actions cron `0 */5 * * *` (every 5 hours at :00 UTC = 00/05/10/15/20); runs the script, commits + pushes `src/data/arguments.json` only (separate file from debates.json so this workflow never merge-conflicts with the existing daily-debate workflow); concurrency group `5h-argument`. (f) `src/lib/agent-debate.ts` — widened `topic_kind` enum + Topic type to include `"design"` so the moderator can label design-axis entries naturally. (g) `src/app/globals.css` — appended ~130 lines of `.arguments-*` and `.argument-*` styling in the tombstone register (paper + ink + hairline dividers, serif italic prose, mono metadata, gold position-badge, ink design-badge).
- **Why**: User pivot from "send hourly iMessages via SendBlue starting 1:15pm" → "just have it logged on the positions website and have agents argue about the positions themselves and the designs every five hours." The SendBlue creds in `sep-ats/.env.local` returned 401 Invalid Credentials (stale / not the prod keys); the pivot to on-site logging is cleaner anyway — it fits the "legible in public" thesis of the whole experiment. Why separate file from debates.json: the existing `daily-debate.yml` runs at 13:00 UTC daily and commits `src/data/debates.json`; the new 5h workflow writes to a different file, giving both workflows independent git push paths with no merge conflicts. Why axis alternation via stateful `next_axis` field in the data file: deterministic regardless of cron timing drift or manual `workflow_dispatch` triggers — always alternates cleanly.
- **Impact**: Flows checked — (i) `daily-debate.yml` untouched and still writes debates.json on its own schedule; no workflow collision; (ii) `TodayDebate` component still reads `debates.json` and renders the latest daily debate — unchanged; (iii) seeded arguments.json means /positions has content immediately, doesn't wait for first cron fire; (iv) `runDebate` contract unchanged — the new script just calls it with a different dayContext; adding `"design"` to the `topic_kind` / `chosen_kind` enums is backwards-compatible (existing daily debates never emitted that value and won't start to); (v) GH Actions secret `ANTHROPIC_API_KEY` is reused (already in place for daily-debate); (vi) rendering on /positions uses existing palette tokens (paper / ink / gold / rule) and matches the tombstone register; (vii) `tsc --noEmit` clean.

### 2026-04-17 — SavingsHero tombstone redesign (Sotheby's lens + live countdown)
- **What**: Inverted the information hierarchy on `/positions`'s hero strip. The 272% ride from $1,296 → $4,825 is now the single tombstone figure (display serif, 400-weight, `clamp(4rem, 11vw, 8rem)`, flat ink on paper, gilt hairline underneath). The four equal-weight cards are collapsed to three demoted statement cells (`high-water, 31 jan` / `gave some back` / `to six figures by 21 june`) with 1px hairline dividers and no backgrounds. New `<BirthdayCountdown />` component (`src/components/BirthdayCountdown.tsx`, client-only) ticks `Nd HH:MM:SS to 21 june` every second in monospace under the tombstone — the clock the book is racing. Drawdown demoted from rust red to `color-mix(ink 70%, paper)` — restraint signals confidence. Bar fill: solid ink replaces green→gold gradient; glow/shadows removed. Caveat paragraph is now centered, justified, serif italic, with a 3rem hairline `::before` (was dashed top-border). Copy: `CURRENT ACCOUNT` → `on the books today`; `PEAK` → `high-water, 31 jan`; `VS PEAK` → `gave some back`; `TO $100K` → `to six figures by 21 june`. Eyebrow: `// the savings story · live` → `the savings story — sighted 14 april 2026, 15-min tape`. Eyebrow on `/positions` page stripped of date (`Stocks · Round 0 · 2026-04-14` → `Stocks · Round 0`) since tombstone now carries the date.
- **Why**: User's request: "make sure it shows everything perfectly to make people jealous of what they missed out on." Three Plan agents (luxury/tombstone, social/screenshot, live-ticker/dashboard lenses) converged on the same diagnosis — the 272% that makes strangers feel sick was buried as parenthetical text at cell-value size; the four equal-weight cards had no hierarchy. Picked hybrid: Tombstone's flat-ink restraint (survives dark mode, print, og:image; billionaire-statement register not crypto-bro) + Live-ticker's HH:MM:SS countdown (turns static prestige into "this is happening right now and you're not watching"). All three agents agreed to keep the "held through the drawdown — not the one at peak" caveat verbatim — the honesty is what makes the flex land (Ted Lasso "I believe in believe" move). No emoji, no rocket, no metallic-foil text effect, no drop shadows, no glow, no glassmorphism — flat ink is the flex.
- **Impact**: Flows checked — (i) `SavingsHero` contract changed: added required props `baselineDate: string` and `birthdate: string`; `src/app/positions/page.tsx` updated to pass them from `portfolio.json` (`baseline_date`, `birthdate`). Any other caller would break, but grep confirms this is the only consumer; (ii) `gainFromStart` / `.savings-up` / `.savings-eyebrow` / `.savings-cell-main` are now dead — removed from tsx + CSS cleanly; (iii) price-fetch + cache behavior on client is untouched (`/api/prices`, `sessionStorage` `prices-cache-v1`, 10min fresh-ms); (iv) `BirthdayCountdown` is client-only, guards SSR hydration by returning a dash placeholder until the first `useEffect` tick; (v) `tsc --noEmit` clean; (vi) bar reads at log-scale unchanged — visual treatment shrunk (18px → 6px height), glow removed, now-mark is a 6px ink dot instead of a green glowing bulb; (vii) mobile <480px: 3-cell grid collapses to stacked column with top-border dividers; tombstone figure hits `11vw` clamp at ~52px which still carries the flex.

### 2026-04-17 — Hunches + cron position-routing + memory scaffolding
- **What**: (a) New `src/data/hunches.json` — externally-sourced hunches with numerical credit attribution across four channels: `S1_data_heatmap`, `S2_human_jack`, `future_data_collection`, `luck`. Five initial hunches seeded (H1 NVDA downside into 2026-05-20 earnings; H2 pure-play quantum ATM/corr risk; H3 mega-cap rotation NVDA→IBM pre-PMI; H4 SGOV event-trigger vs existing -30% price trigger; H5 defined-risk options sleeve capped at $150 premium). Each hunch has `thesis / direction / tickers / catalyst / catalyst_date / expires_on / action_suggestion / credits{} / credit_rationale{}`. File also carries `sources[]` (S1 heatmap summary + S2 Jack Sarfati DM summary) and `catalyst_calendar[]` (PMI 2026-04-24; NVDA 2026-05-20; SLC meetup 2026-06-15; birthday 2026-06-21). (b) `scripts/run-daily-debate.ts` rewritten: loads hunches.json in parallel with portfolio + debates; retires hunches past `expires_on` in-place and writes back to hunches.json; `buildDayContext` now emits dense context (universe with target weights, one-line-per-hunch callouts, next 5 catalysts, explicit moderator directive to pin argument to specific positions/thresholds). (c) Memory scaffolding written: user profile, project (Round 0 bankroll game), reference (Jack Sarfati), and feedback (hunch attribution style) — future sessions boot with full context.
- **Why**: User provided Source 1 (market heatmap screenshots — rally day, semis rolling, mega-cap app-layer leading, meme-speculative leading) and Source 2 (IG DM screenshots with Jack Sarfati — PMI next week, NVDA earnings 5/20 short plan, structural recession/Warsh thesis, tactical "Qs/SPY/SPUU leveraged options" advice for short-window gains). Ask was: synthesize into hunches with numerical confidence attribution, add to positions, and optimize the cron so the debate roundtable hits *positions* not generic macro. Explicit follow-up: "make sure the debate hits the roundtable about the positions."
- **Impact**: Flows checked — (i) `scripts/run-daily-debate.ts` still has the same entry contract (GitHub Actions call, ANTHROPIC_API_KEY required, writes debates.json) — additional side effect is writing back hunches.json when retirements happen, which GH Actions will need to commit alongside debates.json; (ii) existing `portfolio.json` untouched — hunches are an *overlay*, not a book change, so `/positions` rendering is unaffected; (iii) `buildDayContext` now produces a multi-line string (was single-line) — the debate engine prompts use `${dayContext}` inline so multi-line is fine; (iv) agent `runPremise` prompts inherit the new context and will bias toward position-kind topics (explicit moderator directive), which is the intent; (v) no UI component consumes hunches yet — next task if requested is a `<HunchesPanel />` on `/positions` or in the letter sidebar.

### 2026-04-16 — saathvikpai.com personal statement page + host-based routing
- **What**: (a) New route `src/app/statement/page.tsx` — a panel-debate personal statement in five rounds: 1→2→4→8→16 voices, moderator enters at round 2 (only appears once ≥2 agents exist, per spec), moderator calls the argument pointless at round 5 ("the argument is pointless. that is the point."), coda collapses back to one voice (first-person) that names saathvikpai. Scoped styles in `statement.module.css` (cream/rust palette, Cormorant display italics, cacophony two-column layout for round V). (b) `middleware.ts` at project root — rewrites `/` to `/statement` when request host is `saathvikpai.com` or `www.saathvikpai.com`. (c) `src/app/layout.tsx` — uses `headers()` to detect the personal host and conditionally strips aureliex chrome (masthead/nav/ReaderMode/TableOfContents/Insignia/FridayMark/footer) on that host only. Rendering opt-in to dynamic is accepted cost.
- **Why**: User wants saathvikpai.com to show a personal statement built on the aureliex debate paradigm — "agent of 1 then 2 then 4 then geometrically increase disagreement until the moderator determines the argument is pointless for the sake of the point." Reference register: Frank Ocean "Pyramids" — two-movement transformation, regal→fallen, same iconography doubled back. Single Vercel project, two domains: easier to ship and keep in sync than a second repo.
- **Impact**: Flows checked — (i) aureliex.com unchanged: all existing routes still render with full chrome when host is `aureliex.com` (or any non-personal host); (ii) `/statement` is reachable on aureliex.com too, which is fine — it links back to `/about-the-method` as colophon; (iii) ALL routes are now `ƒ` (dynamic) rather than `○` (static) because `headers()` in root layout opts the tree into dynamic rendering — acceptable trade-off, no functional regression, cache-friendly responses still possible; (iv) middleware matcher excludes `api`, `_next/*`, favicon, and any path with a file extension — static assets and API routes unaffected; (v) view tracker on round-0 letter untouched; (vi) user must still add `saathvikpai.com` as a custom domain in the Vercel project dashboard and point DNS — this is the "connect" step.

### 2026-04-15 — Pitch deck: seamless continuous-gradient deck + prose surgical cuts
- **What**: The deck used to feel like "PowerPoint slides connected together" because every `.pitch-slide.zone-*` had its own `background:` rule — gradient boxes stacked inside the dark `pitch-root`, producing sharp seams at every zone boundary. Refactor: (a) put ONE long dawn-gradient on `.pitch-root` that spans the whole deck height (dark at top → pivot mid → cream → aurora bottom, stops tuned to slide positions). (b) Every `.pitch-slide.zone-*` background now `transparent` (kept only the decorative radials on `zone-warm-cream` / `zone-cream-final` / `zone-aurora` because those are *content* overlays, not zone chrome). (c) Removed per-slide borders and inset box-shadows that were creating visible seams. (d) Removed the old `max-width: 62rem` on `.pitch-deck` and put the column-inset on `.pitch-slide` via `padding-inline: max(clamp(1.75rem, 6vw, 4.5rem), (100% − 62rem) / 2)` so content stays in a 62rem column while the dawn bleeds viewport-wide. (e) `overscroll-behavior-y: none` on html/body to prevent rubber-band flash of the charcoal body color against cream bottom. (f) Prose edits: slide 4 comment → terminal rhythm `// one person. three rushes. quietly.`; slide 6 paul graham tail `the president sets the next whisper` cut as redundant with slide position; slide 8 `keep maintaining` → `maintain`; slide 9 m2-ask muted line cut — the accent ask stands alone in negative space.
- **Why**: User: "it should feel like a seamless web experience not like a powerpoint connected together." Per-slide backgrounds, no matter how cleverly color-matched at endpoints, always produce a seam at the slide boundary because the paint is on different elements. The only fix is to lift the paint to a single ancestor that spans all slides. Prose pass: separately debated across four lenses (AI-context-window salience, human attention, narrative arc, minimalist empty-elegance) with the aureliex round-0 pre-mortem as voice reference.
- **Impact**: Flows checked — (i) pitch gate / auth flow untouched; (ii) `AutoScroll` (music volume by slide density) and `SlideReveal` untouched; (iii) zone-specific *text* colors preserved (dark text on cream zones, light text on dark zones) so contrast is unchanged; (iv) mobile `@media (max-width: 720px)` override for zone-pivot gradient is now dead code under the new architecture but harmless; (v) the `.pitch-root` background is the only source of color now — swapping palettes in the future means editing one gradient, not eight zone blocks.

### 2026-04-14 — Satirical ego-mini-game hook + article-as-home + view tracking
- **What**: (a) Rewrote `round-0.md` title/intro as a satirical pre-mortem: "How I'm Going to Turn $3,453 Into a $100,000 Birthday Party Using Five AI Agents and No Job." Added an explicit "mini-game, stated plainly" section and threaded the birthday/party framing through failure modes 3 and 4 and the closing. (b) Moved the article onto `/` (home page), added compact 3-card stats strip (account value / drawdown / distance-to-$100K). (c) Added end-of-article scroll tracker: `ViewTracker` client component + `/api/views` route that appends to `data/views.json` with dedup via sessionStorage.
- **Why**: User request. Applied classic hook craft (specific opening number, stated absurdity gap, self-implication, named mini-game stakes, failure-as-promise). Tracking scroll-to-bottom gives a true-view metric instead of a pageview vanity count.
- **Impact**: Flows checked — (i) `/letters/round-0` still works and now uses the shared renderer + tracker; (ii) layout nav still points to `/letters/round-0` which is fine (redundant with `/` but intentional — a permanent URL for the letter); (iii) portfolio/trades/canvas/method pages untouched; (iv) `data/views.json` added to `.gitignore`; (v) API route uses `nodejs` runtime + `force-dynamic` so fs writes work in dev/self-hosted. On read-only production FS (e.g. Vercel) the handler falls back to stderr logging — swap to KV/Upstash if/when deploying there.
