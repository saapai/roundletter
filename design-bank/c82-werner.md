# c82.net/werner — Werner's Nomenclature of Colours

**Source:** Nicholas Rougeux's recreation of the 1821 Werner color guidebook
**Aesthetic:** Editorial-research, scholarly catalog, "transparent scaffolding"
**Why it's a reference:** It treats web content as a published reference work, not a blog. Restraint is the dominant move.

---

## 1. Editorial Structure

- Information is broken into **research units**, not paragraphs. Each color is a self-contained card with: name, sequential number, three-column taxonomy (Animal | Vegetable | Mineral), historical descriptive prose, and modern photographic evidence.
- **Hierarchical groupings** (Whites, Greys, Blacks, Blues, Purples, Greens, Yellows, Oranges, Reds, Browns) gate the 110 entries into 10 digestible chapters.
- A characteristic-color marker (`*`) within each series adds a second layer of indexing without UI clutter.
- Disclaimers like "Colors in these photos are approximate" are inlined as marginalia — they signal research honesty rather than apologize.

## 2. Typography

- Body text is a **transitional/old-style serif** (Georgia-class system serif by appearance) — chosen because the eye trusts it as "book."
- **Italics carry historical voice** — Werner's 1821 prose is italicized, modern editorial commentary is roman. This is the single most important typographic choice.
- **Small caps** for the "W." attribution preserves period authenticity.
- **Footnote markers** use real typographic symbols (`†`, `‡`, `§`) as superscript — never emoji, never `[1]`.
- Color names are bolded inline; their hex tone is used as the link color, so the *name itself* is its own swatch.
- Measure constrained to ~60–70 characters per line for the prose column.

## 3. Color Discipline

- The **page chrome is monochrome** — black, paper-white, one warm grey for rules. All chromatic energy is reserved for the catalog content (the swatches).
- The accent color of any given entry **is the entry's swatch color** — there is no global accent. The page recolors itself locally per section.
- No decorative gradients, no shadows, no illustrations beyond the swatches and source photos.
- Background is off-white (paper tone), not pure `#fff` — reduces glare, signals "printed."

## 4. Sidebar / Index / TOC

- **Anchor-link table of contents at top**: Intro, Colors, Posters, Original Guidebook, Classification, About.
- Within "Colors," a second-level index lists all 10 hue families as anchors.
- **Sequential numbering (1–110)** acts as a stable internal address — color #23 can be referenced from #67 via `#color-snow-white`-style anchors.
- Cross-references between related colors are inline links, not a sidebar — the index lives *in the prose*.
- Hamburger fallback (`[Menu](#)`) for narrow viewports.

## 5. Image-Text Integration

- Photos sit **below** their descriptive text in a 3–5 image grid per color — text leads, images verify.
- Each image carries a minimal caption: subject + photographer attribution as a link. This keeps the grid quiet but traceable.
- Images are uniformly sized and aligned — the grid feels like a plate from a botanical reference.
- No floats, no wraparound text — images are *evidence blocks*, not decoration.

## 6. Print-Feel CSS

- **Three-column taxonomy table** (Animal | Vegetable | Mineral) per entry — column rules implied by alignment, not borders.
- **Italic + roman voice toggle** (see Typography) is the print-feel workhorse.
- Likely `font-feature-settings: "liga", "kern", "onum"` on body — old-style numerals would match the period feel.
- Period-correct punctuation preserved (em dashes, semicolons, "viz.") — copy editing as design.
- Pull quotes appear when historical definitions are blockquoted away from photo commentary.
- No drop caps observed, but the masthead's centered title acts as a printed-frontispiece equivalent.

## 7. Mobile Reflow

- Three-column taxonomy collapses to a stacked single column; labels (Animal/Vegetable/Mineral) become inline tags.
- Image grid reflows from 3–5 wide to 1–2 wide.
- Top-anchor TOC compresses behind a hamburger.
- Measure narrows but the *editorial structure remains intact* — nothing is hidden, only stacked.

## 8. Clever Interactions

- **Color names as swatches**: link color = the actual color, so navigation *is* the chromatic experience.
- **Anchor cross-references** between color entries function as inline tooltips/jumps — no JS needed.
- **Photo source links** invite traceability; the page rewards investigation.
- Subtle: hovering a color name likely changes the cursor to indicate the dual role (link + sample).

## 9. Layout Grid

- Single centered prose column for narrative passages (~640px max).
- 3-column taxonomy block per entry.
- 3–5 column image grid beneath.
- Generous outer margins — the page breathes like a page, not a feed.

## 10. Header / Masthead

- Centered H1 "Werner's Nomenclature of Colours" — full title, no abbreviation.
- Byline "By P. Syme" + a one-sentence editorial standfirst describing the project as a recreation of the 1821 guidebook.
- Single CTA "Explore »" sits below intro — gentle entry point, no above-the-fold pressure.
- No hero image. The *type itself* is the hero.

---

## PORTABLE TO ROUNDLETTER

### For `/letters/round-0` (the article surface)

1. **Italic-vs-roman voice toggle.** Mark up "quoted source," "historical voice," or "the pre-mortem self" in italic; editorial commentary stays roman. This single choice reads as "publication" instantly.
2. **Real footnote symbols (†, ‡, §)** with anchor jumps — not `[1]`, not modal popups. Footnotes live at the bottom of their section, not as floating UI.
3. **Off-white paper background** (~`#faf8f3` or similar) instead of pure white — signals "printed."
4. **Centered masthead with byline + standfirst** above the article, no hero image. The type carries the brand.
5. **Constrained measure (~62ch)** for the prose column; let images and tables break out wider when needed (full-bleed evidence blocks).
6. **Anchored section index at top** of long letters — gives the post a "Contents" the way a chapter has one.
7. **Old-style numerals + ligatures** via `font-feature-settings` on body type.
8. **Pull quotes as blockquotes**, not styled boxes — flush left, italic, hanging quotation mark.

### For `/portfolio` (data tables that should feel curated)

1. **Three-column taxonomy pattern.** Don't show all metadata — pick three orthogonal axes (e.g., Domain | Stack | Outcome) and commit. Werner's "Animal | Vegetable | Mineral" is the model: terse, parallel, repeatable.
2. **Sequential numbering (01–N)** as a stable left-rail address. Lets you cross-reference projects in prose ("see #07") and gives the index gravity.
3. **Per-entry accent color drawn from the work itself** — like Werner's swatches. The portfolio recolors locally; the page chrome stays monochrome.
4. **Project name bolded, with the *name itself* as the link** — no "Read more →" CTA. The whole entry is the affordance.
5. **Modern evidence + historical context split.** Each project = short editorial description (the "Werner voice") + image evidence grid below. Text leads, images verify.
6. **Characteristic markers** (a `*` or small glyph) to flag standout entries within a section without resorting to "Featured" badges.
7. **Inline cross-refs between projects** — turns the portfolio into a *catalog* with internal logic, not a list.

### Top single move

Adopt the **italic = source / roman = editor** convention site-wide. It's the cheapest, highest-signal change and it makes everything downstream feel like a publication.
