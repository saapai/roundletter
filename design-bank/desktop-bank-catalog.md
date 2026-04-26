# Desktop Image Bank Catalog

Source: `/Users/gopalakrishnapai/Desktop/bank/` (32 PNG/HEIC screenshots)
Cataloged: 2026-04-25
Converted (HEIC → JPEG to /tmp/, originals untouched): IMG_4014, IMG_4023, IMG_4030.

These are visual references the user collected. Each entry reads:
**filename** — what's shown / technique / where to port on roundletter.

---

## Theme: Editorial Illustration & Optical-Density Crowds (dernadler series)

These are the dominant visual idea in the bank. Every dernadler image stacks
millions of tiny rendered figures into a single editorial composition — the
"optical density" effect — so a stadium reads from afar as a color field and
up close as a literal crowd. This is exactly the "register / hunt-ledger /
attention" aesthetic roundletter already half-leans into.

### IMG_3958.PNG — Aerial city/dam meets crowd-on-bridge
Skyscraper-density windows on the left mass, painterly sunset/mountain on the
right; the seam between them is a vanishing-point bridge crammed with stick
figures. Technique: two textures (architectural grid + landscape painting)
butted against a foreshortened diagonal, with the diagonal carrying the
"data" (people). Port: `/portfolio` index hero or `/about-the-method` opener
— two visual halves (works vs. method) joined by a populated diagonal of
"letters written so far".

### IMG_3959.PNG — Wall of windows + mountain sunset
Same series, different page. The compositional trick is a hard vertical
seam dividing dense ledger pattern from open painterly sky. Technique:
extreme texture-contrast composition (busy left / quiet right). Port:
`/letters` index — one half a crammed list of letter cells, the other half
a single wide quote/epigraph in serif.

### IMG_3960.PNG — Crowd-river snaking through the wall
A foreshortened wall of tiny window-cells with a blue river of people
flowing diagonally through it. Technique: continuous "river" path overlaid
on grid texture. Port: `/attention` route — the existing AttentionTracker
could render its visit history as a snaking river through a window grid.

### IMG_3961.PNG — Linear sunset reflection over crowd diagonal
Vertical orange sunset reflection acting as an optical anchor against
diagonal crowd-mass. Technique: single bright vertical "spine" against
chaos. Port: `/statement` or `/let-down` coda — single rust-colored
vertical accent down center of the page anchoring a wide noisy field.

### IMG_4024.PNG — Curved crowd field with team-color sweep
Stadium tiers rendered as pointillist orange/blue dots, with bold sweeping
white/orange/blue curves abstracted from team colors. Technique: dense dot
field + 3 huge color-arcs that read as motion. Port: `/portfolio`
allocation chart — instead of bars, render allocations as broad sweeping
curves of dots, color = ticker.

### IMG_4025.PNG — Pure stipple stadium
Same series, more abstract: just the stippled crowd. Technique: pointillism
for crowd density. Port: `/views` or `SiteViewTracker` background — render
each unique view as a single dot, building a stipple crowd over time.

### IMG_4026.PNG — Pixel-art stadium at sunset
Isometric-ish stadium pixel-art with a warm vertical gradient sky. The
notable trick: the building behind the stadium is also pixel-built so
everything is one consistent atomic unit. Technique: single-pixel grain
across an entire scene. Port: `/6969` or `/17` trailer routes — pixel-art
header that uses a uniform pixel grain across hero + chrome.

### IMG_4027.PNG — Indoor arena with overhead cube
Basketball arena, court glowing, scoreboard cube hanging center, dense
seating. Technique: single bright object floating over a dense field
acts as the "headline." Port: `/closed` or `/keys` — a single floating
artifact (a sealed letter, a key) glowing over a dense background grid.

### IMG_4032.PNG — Stadium open-roof color spectrum
Stadium with the crowd rendered as a literal rainbow gradient — red on the
near tier, fading through orange/yellow/green/blue toward the far end.
Technique: data-as-color-gradient (each seat = a hue). Port: `/heat` API
view or `Heatmap` component — render heat as continuous spectrum across the
crowd metaphor instead of red-to-yellow squares.

### IMG_4033.PNG — Tennis stadium, cloud ceiling
Tennis grand-slam court ringed by a stipple crowd, white cloud-ceiling sky,
green court at center. Technique: bright green geometric shape as anchor in
center of a soft stipple field. Port: `PortfolioChart` empty state — center
the green plotted line in a ring of grey stipple "noise" representing
non-positions / market.

### IMG_4034.PNG — Stadium-in-city overview
Pulled-back view: stadium glowing inside a textured rainbow cityscape.
Technique: scale shift — the entire surrounding context becomes the
texture. Port: `/portfolio` — show the user's positions as one bright
stadium inside a textured field of "everything else in the market."

### IMG_4035.PNG — Night tennis stadium with moon
Same composition as IMG_4033 but rendered in indigo with a single moon
disc. Technique: same scene, two palettes (day vs. night) — strong
narrative pair. Port: any landing page — provide a manual "day/night"
toggle that does not just invert colors but re-composes the painting.

---

## Theme: Painterly / Sunset Color Palettes

### IMG_3981.PNG, IMG_3982.PNG — Pinterest grid: Naples/Santorini sunset paintings
Acrylic-painting color palettes: peach, terracotta, coral, deep blue,
yellow gold. Technique: warm-coastal color study. Port: extend
`globals.css` with a `--sunset-*` palette family (peach, terracotta,
gold) for `/friday` or `/positions` celebratory states — the existing
`--rust` already lives in this family.

### IMG_3978.PNG — Crayon-on-blackboard typography
"AT LEAST WE ARE GOOD LOOKING / IMAGINE THIS SHIT IF WE WERE UGLY!" hand-
drawn in crayon on black with each word in a different bright fill.
Technique: chunky hand-lettered display type with multi-color word-by-word
fill on dark ground. Port: `/6969` headline or hunt-found 404 — replace
serif H1 with a one-off SVG of crayon letterforms; rotate per page-load.

---

## Theme: Mixed-Media / Texture / Imperfection

### IMG_4014.jpg (HEIC) — Spray-painted box from above
Workshop overhead: a steel box with masking-tape corners, spray-paint
overspray, pencil sketches in the margins. Technique: deliberately
imperfect studio-floor texture; tape corners as "registration marks."
Port: `/about-the-method` page background — taped corners on each section
card as a literal "draft" frame.

### IMG_4023.jpg (HEIC) — Tupac stencil + spray-paint canvases on wall
Salon-hung student art: a stencil portrait next to abstract spray basketball
piece. Technique: gallery wall pinned to dorm — varied media, hung close.
Port: `/portfolio/art` `ArtContactSheet` arrangement — overlap and slight
rotation per piece, pinned-to-wall feel rather than uniform grid.

### IMG_4030.jpg (HEIC) — Airport mural seen through escalator framing
Architectural photo of a mall/airport interior framed so the actual
"content" is one small pastel floral mural in the center, with industrial
metal stairs and ducts cropping in. Technique: extreme negative space
around a soft delicate central element. Port: `/closed` or `Insignia`
display — surround one tiny florid emblem with vast mechanical/structural
framing chrome.

---

## Theme: Album / Cover-Art Composition

### IMG_4031.PNG — "Electric Dusk" album cover (Leon Thomas)
Glitched portrait, orange/black duotone, scan-line distortion, parental-
advisory sticker, album title in narrow western-style serif top-left.
Technique: duotone + horizontal scan glitch + small-caps narrow serif label.
Port: `/letters/[slug]` hero — duotone ink+paper version of the letter
illustration with a thin horizontal glitch band; title in masthead serif.

---

## Theme: Cayde Painterly Series (IMG_4056–IMG_4065)

A consistent ten-canvas set by @cayde.wav: small acrylic paintings of
nostalgic 2000s objects (American Psycho still, Xbox 360, Star Wars
Lego figures, a McDonald's Happy Meal head, Minecraft sheep, BSOD,
oil-painted screenshots of a video-game cockpit). Color is muted, the
brush is loose, and each piece is photographed sitting on the easel with
spray-paint cans + palette visible — the framing IS part of the work.

### IMG_4056.PNG — American Psycho painting + game-cockpit oil
Two-panel scroll. Technique: split-canvas pairing (figure + interior).
Port: `/portfolio/art` slide format — every art entry shown as a paired
diptych of painting + reference photo.

### IMG_4057.PNG — Painting of a small landscape framed within a frame
Inception trick — a painting of a painting standing on the easel.
Technique: meta-framing. Port: `/archive` or `/archives` index — every
archived item rendered as a tiny painting on a tiny easel thumbnail.

### IMG_4058.PNG — Xbox 360 painting on easel with beer cans
Object portraiture — render an icon of the era at painting scale.
Technique: small still-life with maximalist studio chrome. Port:
`ApparatusThumb` component — wrap each apparatus thumbnail in a
photographed-easel chrome.

### IMG_4059.PNG — Hand holding a pencil (close crop)
Tight crop of a painted hand. Technique: extreme detail crop of a wider
work used as cover. Port: letter cards on `/letters` — instead of full
illustration, crop tight on one detail per card; reveal full image on
hover/tap.

### IMG_4060.PNG — Painted cat with cigar
Surreal still-life. Technique: subject + "wrong" object = humor.
Port: hunt easter-egg artwork (`HuntLedger` reward).

### IMG_4061.PNG — Star Wars dual scene (cantina + droids) painted
Pop-culture reference rendered painterly. Technique: pop-cultural deep cut
+ painterly treatment = signature voice. Port: `/v1` retrospective covers.

### IMG_4062.PNG — BSOD painted on canvas
A literal Windows blue-screen-of-death rendered in acrylic on blue canvas
including the ":(" emoticon. Technique: digital-native error rendered in
analog material. Port: roundletter 404 page or `error.tsx` — render the
404 as an oil-painted Windows BSOD; signature "cayde" lower-right.

### IMG_4063.PNG — Painted McDonald's Happy Meal head
Toy portrait. Same easel chrome. Technique: object-as-portrait. Port:
`MetaEgg` reward art.

### IMG_4064.PNG — Minecraft sheep painted in acrylic
Pixel-source rendered with painterly bleed. Technique: cross-medium
translation (pixel game → impressionist canvas). Port: `/6969` mascot art.

### IMG_4065.PNG — Painted dark fantasy figure scene
Moody small landscape with figures. Technique: dense small-canvas
composition. Port: `LaunchTrailer` or `GreenCreditTrailer` poster.

---

## Theme: Tennis Court Compositions (IMG_4045–IMG_4047)

A Giz Akdag series — surreal tennis courts plopped into impossible
botanical settings.

### IMG_4045.PNG — Clay court inside cactus garden
Single-figure red-clay court enclosed by a forest of cactus. Technique:
lonely human-scale rectangle inside a noisy organic field. Port: `/closed`
or `/let-down` — single signup card surrounded by chaotic organic texture.

### IMG_4046.PNG — Hard-court doubles inside a rose garden, top-down
Aerial of a doubles match with a halo of pink/white/red roses around the
court rectangle. Technique: top-down "diagram" composition framed by
botanicals. Port: `Heatmap` page — replace neutral background with a
botanical halo around the heat grid.

### IMG_4047.PNG — Clay court tucked under blue-tinged tree canopy
Court is barely visible, almost swallowed by foliage. Technique: hide the
content; reward attention. Port: hunt route — content half-buried in
canopy texture, becomes legible only after a small interaction.

---

# TOP 5 PORT CANDIDATES

Ranked by reusability across the existing routes, distinctness vs. what's
already shipping, and how strongly the visual matches roundletter's
ledger/letter/sportsbook editorial voice.

### 1. Optical-density "stipple crowd" as a render mode
Pulled from IMG_3958–61, IMG_4024–27, IMG_4032–35. The user has
collected at least 9 examples — this is clearly the dominant aspirational
look. Port to:
- new component: `src/components/StippleCrowd.tsx` (Canvas/SVG dot field
  driven by a data array)
- consumer: `src/components/Heatmap.tsx` and `src/app/api/views/route.ts`
  output rendered through it on `/attention` and `/views`.
- styles: append a `.stipple-field` utility set in
  `src/app/globals.css` (--stipple-r, --stipple-density, --stipple-fg).
Reads as roundletter's "every reader is a dot" thesis without asking
the iterator to invent new aesthetics.

### 2. Two-texture diagonal "bridge" hero composition
From IMG_3958/IMG_3959/IMG_3960. Hard seam between dense ledger pattern
and quiet painterly field, joined by a populated diagonal carrying the
"data". Port to:
- `src/app/portfolio/page.tsx` hero — left half = ledger of positions,
  right half = single epigraph; diagonal of letter-stamps connects them.
- `src/app/portfolio/page.module.css` (new file) for the seam geometry.

### 3. Sunset / coastal-painting palette extension
From IMG_3981/IMG_3982/IMG_3961/IMG_4026. Roundletter already owns
`--rust` and `--paper`. Add a coordinated `--sunset-peach`,
`--sunset-coral`, `--sunset-gold`, `--sunset-indigo` set scoped to
celebratory routes. Port to:
- `src/app/globals.css` `:root` palette block.
- `src/app/friday/`, `src/app/positions/`, `src/app/closed/` page CSS
  modules to opt-in via a `.is-sunset` body class.

### 4. Painted-on-easel chrome for art / archive thumbnails
From IMG_4056–IMG_4065 (cayde series). Every thumbnail becomes a
photograph of a small painting sitting on a paint-spattered easel. Port
to:
- `src/components/ArtContactSheet.tsx` and `src/components/ApparatusThumb.tsx`
- shared CSS module: `src/components/EaselFrame.module.css` with the
  spattered-palette photo as a tiled background and the painting clipped
  into the easel rectangle.

### 5. BSOD-painted error / 404 page
From IMG_4062. A single high-personality moment: oil-painted Windows
blue-screen as the roundletter error page, signed `roundletter` lower-
right in the masthead serif. Port to:
- `src/app/not-found.tsx` (create) or extend the existing one if present.
- companion: `src/app/error.tsx` runtime-error variant.
Cheap to ship (one painted SVG + serif), instantly recognizable, fits
the "letter from a real person" tone.
