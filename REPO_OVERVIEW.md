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
    page.tsx                     home — renders round-0 letter + stats strip + ViewTracker
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
  data/
    portfolio.json               baseline book, buckets, triggers, history
    trades.json                  timestamped trades
    agents.json                  five-agent panel metadata
    letters/round-0.md           the pre-mortem letter (satirical-hook title)
  lib/
    data.ts                      reads JSON + letter markdown with frontmatter
    md.ts                        shared markdown -> HTML renderer
data/
  views.json                     runtime-written view log (gitignored)
```

## Feature Logic & Flows

### Home page = Article
- `/` reads `round-0.md` via `getLetter()` and renders with `renderMarkdown()`.
- A three-card stats strip sits above the article: account value, peak-to-trough drawdown, distance-to-$100K multiple.
- `<ViewTracker slug="round-0" />` is appended after the article body (also on `/letters/round-0`).

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
