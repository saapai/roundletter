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

### 2026-04-14 — Satirical ego-mini-game hook + article-as-home + view tracking
- **What**: (a) Rewrote `round-0.md` title/intro as a satirical pre-mortem: "How I'm Going to Turn $3,453 Into a $100,000 Birthday Party Using Five AI Agents and No Job." Added an explicit "mini-game, stated plainly" section and threaded the birthday/party framing through failure modes 3 and 4 and the closing. (b) Moved the article onto `/` (home page), added compact 3-card stats strip (account value / drawdown / distance-to-$100K). (c) Added end-of-article scroll tracker: `ViewTracker` client component + `/api/views` route that appends to `data/views.json` with dedup via sessionStorage.
- **Why**: User request. Applied classic hook craft (specific opening number, stated absurdity gap, self-implication, named mini-game stakes, failure-as-promise). Tracking scroll-to-bottom gives a true-view metric instead of a pageview vanity count.
- **Impact**: Flows checked — (i) `/letters/round-0` still works and now uses the shared renderer + tracker; (ii) layout nav still points to `/letters/round-0` which is fine (redundant with `/` but intentional — a permanent URL for the letter); (iii) portfolio/trades/canvas/method pages untouched; (iv) `data/views.json` added to `.gitignore`; (v) API route uses `nodejs` runtime + `force-dynamic` so fs writes work in dev/self-hosted. On read-only production FS (e.g. Vercel) the handler falls back to stderr logging — swap to KV/Upstash if/when deploying there.
