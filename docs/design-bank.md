# Design Bank · aureliex.com

Mood-board and reference pins gathered across the cover-redesign sessions.
Not every reference is used; these are kept for the next iteration.

## Current cover (shipped)

- **Yoshida Hiroshi · Twelve Scenes of Tokyo: Kagurazaka Street after a Night Rain, after 1929.** Woodblock print; ink and color on paper; 40.2 × 26.5 cm. Cleveland Museum of Art, Bequest of John Bonebrake, 2014.359. CC0. Files in `public/hero/`: `cover.jpg` (web, ~200KB), `cover-hires.jpg` (print, ~2.5MB), `cover.svg` (procedural placeholder fallback), `cover-credit.txt` (tombstone).

## Primary visual north star

- **Giulio Cercato · "Midnight Dreamer" series** (@dernadler on Instagram). Dense vertical megacity walls at sunset, thousands of illuminated amber windows against violet-to-orange skies. The single most-referenced source. We tried procedural CSS + SVG translations and they read as bar charts — only a real illustration or painting can carry this register.

## Alternate imagery bank

Sourced 24 apr 2026 during a "something similar" search. Not-yet-used; may fit future rotations or seasonal covers.

- **Sunset on Rome the Eternal City** · Fine Art America print. Orange-pink sunset over St. Peter's Basilica, bridge reflecting light on the Tiber. Near the Yoshida register but Italian.
- **Santorini Sunset Oil Painting** series · Etsy / "Number Artist" · multiple variants. Blue-domed churches, pink sunsets, Mediterranean palette. Warmer and more saturated than Yoshida — better for a round 1 cover if we want a temperature shift.
- **Original Cityscape Oil Painting** · eBay · sunset over a city skyline with deep purples + yellow-orange sky, reflection in water. More modern/abstract than woodblock.
- **Free Sunset Over City Image** · StockCake · warm sunset over a metropolitan skyline from a high vantage. Free-use.
- **FITSEN City Painting** · Amazon · Santorini clifftop village at dusk, lit windows. Another Cercato-adjacent composition.
- **wall26 Canvas Prints** · Santorini coastline oil paintings, multiple variants.

## Reference inspirations gathered over the session

- **noscroll.com** · warm cream canvas, pixel-mono logo, emoji avatar, em-dashed tagline, dark pill CTA, soft-tinted feature cards. "Warm clarity" reference.
- **hle.io** · pure near-black canvas with one monospace word + blinking cursor ("Positioned|"). Absolute confidence / negative-space reference.
- **shader.se** · deep royal-blue canvas with retro 80s-computer boot screen (white serif logo, pixel loading bar, copyright line). Terminal/specific-register reference.
- **the.culture.guy (Instagram)** · the arch-through-which-you-see-the-moon photograph. One frame, natural composition, total silence.
- **Spray-paint dance battle poster** (176 S. Western Ave, LA) · raw hand-painted graffiti aesthetic, acid green + hot pink + yellow, imperfect, not grid-aligned. "Alive" reference.
- **DONT WALK WALK Gallery** (Instagram) · chalk-drawn multicolor block-letter typography ("AT LEAST WE ARE GOOD LOOKING..."). Hand-lettering in distinct color-blocked word-boxes on black ground. Striking hand-made graphic reference.
- **Tyler, the Creator · CMIYGL posters** · the phone-number-poster aesthetic (single-color ground + Impact headline + phone number + tiny tag). Already implemented as CSS at `/67` `/420` `/6767` `/6769` `/677777`.

## Agent-debate consensus positions held in reserve

The four-way visual-direction agent panel (GRAPHIC-MINIMALIST · EDITORIAL · TERMINAL · GESTURAL) produced three defensible directions. Owner voted **A (EDITORIAL magazine-cover)** for the current commit. The other two remain valid alternates:

- **B · Graphic Minimalist** — flat bone canvas, no image, wager at ~22vw Fraunces, tracked tight. Linear / Vercel at its quietest.
- **C · Terminal** — deep navy canvas, Berkeley Mono throughout, boot-sequence arrival, live ticker tape along the bottom. Shader.se / Bloomberg register. Honest to "this is a live trading wager."

## Typographic reference

- **Fraunces** (variable, Google Fonts, free) · shipped for the cover wager + masthead. Has `ss01` stylistic set, oldstyle nums, true display `opsz` axis, weight 900. Swap target for Georgia italic wherever editorial punch is wanted.

## Palette (shipped)

- `--cov-bone` #F2EFE8 · warm off-white (body over image)
- `--cov-ink` #0A0A0A · near-black canvas
- `--cov-rust` #C44325 · signal accent (the arrow)
- `--cov-amber` #F5B740 · warm pull / caption / links
- plus image-side letterbox: a subtle `radial-gradient(#1a1430 → #050810)`

## Not-yet-tried

- **Public-domain Hiroshige Edo views** (wikimedia commons; specifically the ~10 night views from *One Hundred Famous Views of Edo*). Would pair well with Yoshida if we want a second cover for a rotation.
- **Japanese ukiyo-e night scenes** more broadly — MFA Boston, Library of Congress, and artic.edu all have vast CC0 collections.
- **Single-frame from a public-domain film** · Blade Runner-adjacent night cities from the Internet Archive (for seasonal rotations).

## Procedural attempts (archived, do not reuse)

The CSS "city of lit windows" (`.h2-tower`, `.h2-building`, `.h2-row-win` classes) was shipped in two iterations and retired because it read as a stacked bar chart, not architecture. Code remains in the repo but is no longer rendered from the homepage. If you ever want a live-data skyline on a secondary page, the components are in `src/components/LedgerColumn.tsx` and `src/components/LiveStrip.tsx` — LiveStrip is still live on the homepage as the narrow data band beneath the cover.
