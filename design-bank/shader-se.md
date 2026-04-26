# shader.se — Creative Development Studio

**Source:** shader.se (Norrköping, Sweden)
**Aesthetic note:** As of fetch (2026-04-25), shader.se is **no longer a demoscene/dev personal portfolio** — it has become a polished creative-development studio site ("A Creative Development Studio, Plugged into the Future"). The original demoscene-influenced portfolio aesthetic the user remembered is not present in the current build.
**Why this still matters:** The current site is a useful counter-reference (what *not* to do for editorial-tech voice), and the *expected* demoscene patterns are documented below as the intended reference set.

---

## What's actually on shader.se today

### 1. Editorial Structure
Conventional studio-site hierarchy: hero statement → project carousel → service blocks → contact CTA. No editorial index, no sidebar, no per-project deep pages exposed in markup. "Scroll to Inspect Our Closed Deals" suggests scroll-triggered reveals.

### 2. Typography
No exposed `@font-face` or `font-family` declarations in the fetched markup. Semantic heading hierarchy (h1/h2). Hero copy ("Making Digital Storytelling More Playful, Powerful, and Alive") suggests display-weight serif or sans for emphasis. **No monospace, no technical metadata typography.**

### 3. Color Discipline
Palette is implicit and not extractable from the fetched content. No CSS variables or hex codes surfaced. No dark-mode signals. **This is the gap** — a true demoscene portfolio would commit hard to a 2-color or terminal palette here.

### 4. Sidebar / Navigation
Flat top nav: Home, Selected Work, About Us, Contact, Book a call (CTA). No sidebar, no left-edge index, no persistent IA.

### 5. Image-Text Integration
References a "project carousel" but layout specifics aren't exposed. Images appear separated from prose (carousel pattern), not integrated inline.

### 6. Terminal / Print Feel
**Absent.** No ASCII, no monospace, no code blocks, no technical metadata dumps. Copy is polished marketing prose ("don't troubleshoot printers").

### 7. Mobile Reflow
Not documented in fetched content; presumably standard responsive carousel collapse.

### 8. Interactions
Carousel Previous/Next, scroll-spy on "Closed Deals." No live shader previews or hover-to-play canvases observed.

### 9. Layout Grid
Unknown from fetched markup.

### 10. Header / Masthead
"A Creative Development Studio, Plugged into the Future" hero. Norrköping address, contact email. Mentions "interactive 3D and AI solutions for the web" and "recognizable Swedish brands" — no per-project metadata (dates, stack, role).

---

## What the user *expected* (and what's still portable from the demoscene/research-tech tradition)

These are the patterns you'd find in the canonical version of this aesthetic — Inigo Quilez's site, shadertoy entries, demoscene party prods, and the broader graphics-research community. Treat this as the reference even though shader.se has drifted away from it.

### Typography (expected)
- **Monospace for everything technical**: dates, file sizes, frame counts, GLSL snippets, build hashes. JetBrains Mono, IBM Plex Mono, Berkeley Mono, or system `ui-monospace`.
- **Sans body** (Inter, Söhne, or system-ui) for readable prose, mono for metadata — the contrast *is* the aesthetic.
- Tight `letter-spacing` (-0.01em) on display headings; loose tracking (0.08em) + uppercase on labels ("STATUS", "BUILD", "TAGS").
- Numerals tabular (`font-variant-numeric: tabular-nums`) for any data column.

### Color Discipline (expected)
- **Two colors total**: a near-black (`#0a0a0a` or `#111`) ground and an ink/cream (`#ededed` or `#e8e6e0`) figure. One accent (often a saturated cyan, magenta, or phosphor green) used **once or twice per page max**.
- Dark mode is the default — light mode is the toggle, if at all.
- Borders are 1px hairlines in a 12% alpha of the ink color, never grey-grey.

### Layout & Grid (expected)
- **Hard 12-column grid** with visible column rules in a debug mode (often left visible as a feature).
- Asymmetric layouts: left rail for index/metadata (4 cols), right rail for content (8 cols).
- Persistent sticky sidebar with project index — like a file tree.

### Editorial / Metadata Display (expected)
- Each project entry has a **metadata block** rendered as a definition list:
  ```
  YEAR     2024
  STACK    GLSL · WebGL2 · Rust
  ROLE     Author
  STATUS   Shipped
  ```
- Rendered in mono, label uppercase + tracked, value in ink color.
- Often inside a hairline-bordered box, or as a flush-left list with no box at all.

### Image / Canvas Integration (expected)
- Live shader/canvas previews inline — hover or scroll-into-view triggers play.
- Thumbnails are uniform aspect (16:9 or 1:1), no rounded corners, no shadows.
- Captions are 1-line mono with frame number or seed value.

### Interactions (expected)
- **Hover to play** on shader cards (start the WebGL loop on mouseenter, pause on leave).
- Keyboard navigation (`j`/`k` to step through entries) — exposes a "this was made by someone who reads code" signal.
- Cursor as a custom crosshair or plus-sign on canvas areas.
- Sometimes a `?` overlay revealing keybindings.

### Terminal-Feel CSS (expected)
- ASCII rules as section dividers: `─────────────────` or `=================`.
- Build/version footer: `v0.4.2 · build 1a3f9c · last updated 2026-04-25`.
- Page weight or render time printed in the footer as a flex.
- Status pills as bracketed text: `[shipped]`, `[wip]`, `[archived]` — never colored badges.

### Mobile Reflow (expected)
- Sidebar collapses to a top strip; metadata blocks stack inline as `LABEL: value` rows.
- Mono stays mono; nothing softens for mobile.

---

## PORTABLE TO ROUNDLETTER

### For `/letters/round-0`

1. **Mono metadata header** above each letter:
   ```
   ROUND     0
   PUBLISHED 2026-04-25
   READ      ~7 min
   STATUS    [draft] / [published] / [revised]
   ```
   Tabular-nums, uppercase labels tracked +0.08em. Instantly signals "this is a document, not a blog post."
2. **Build-stamp footer** on every letter: `round-0 · last revised 2026-04-25 · v1.2`. Treats writing like software — perfect fit for the pre-mortem voice.
3. **Bracketed status pills** (`[draft]`, `[shipped]`, `[retracted]`) instead of colored badges — same information, far more credibility.
4. **One-accent rule**: pick one accent color (Aureliex's, or a phosphor cyan) and use it *only* for the active link state and the status pill. Everything else is ink-on-paper or ink-on-black.
5. **Keyboard navigation** between letters (`j`/`k` or `←`/`→`) with a `?` overlay listing shortcuts — adds a "made by someone technical" texture without saying so.

### For `/portfolio`

1. **Definition-list metadata block** per project (YEAR / STACK / ROLE / STATUS / LINK), mono, uppercase labels, tabular-nums values. Replaces the spreadsheet feel with the build-manifest feel.
2. **Hairline 12% borders** instead of grey card backgrounds — the table breathes and reads as a typeset index, not a database export.
3. **Hover-to-play** on any project that has a canvas/video — pauses on leave. Static thumbnail otherwise. Single biggest "alive" signal.
4. **Persistent left-rail index** with project numbers (01–N) and titles, sticky on scroll — turns the portfolio into a *codex*, not a grid.
5. **ASCII rules** between portfolio sections (`─── ARCHIVE ───────────`) — cheap, distinctive, ties the page to the build-stamp footer.

### Top single move

A **mono metadata header + bracketed status pill + build-stamp footer** on every letter and every portfolio entry. Three small additions, one consistent voice: "this is a published artifact with a version number," not a CMS post.

---

## Caveat

If the user wants the *actual* demoscene shader.se aesthetic they remember, the better live references today are:
- **iquilezles.org** (Inigo Quilez) — the canonical research-portfolio look
- **pouet.net** — demoscene index/catalog patterns
- **shadertoy.com** profile pages — metadata + canvas grid integration
- **bvdo.dev / mrdoob.com** — minimal personal sites in the same lineage

Worth a follow-up fetch if you want a stronger primary source than current shader.se provides.
