# e-t-d-s.com — Design Teardown

**URL:** https://e-t-d-s.com/shop/products/e-t-d-s-cd-player
**Stack:** Next.js (App Router) on Vercel + Shopify Storefront API. CSS-Modules naming convention (`.product-image-gallery-module__n8D76q__images`). Three CSS chunks: `613257da008e7b47.css` (reset + tokens + fonts), `e86961203ff05006.css` (rich-text + info-pane), `2628073a6c61d629.css` (the bulk of components). No external animation library detected (no GSAP, no Framer Motion, no Embla, no Swiper) — **the famous "scroll through images on phone" gallery is built with native CSS scroll-snap.**
**The vibe:** "physical product pamphlet" meets HUD. Every chrome element is a small floating glass module (`position: fixed`, 1px border, `var(--background)` color), with a dot-matrix font and a perpetual smiley logo glued to the top of the screen. Cult/zine retail, but technically clean.

---

## 1. Layout grid

No CSS Grid. Mostly flex, `position: fixed` for chrome, and a single full-bleed scrolling column for the gallery.

```css
/* Reset/baseline */
*,:before,:after { box-sizing: border-box }
* { margin: 0 }
html { font-size: 62.5% }     /* 1rem = 10px → makes 1.4rem = 14px */
body {
  -webkit-font-smoothing: antialiased;
  line-height: 1.5;
  background-color: var(--background);
  color: var(--foreground);
  transition: background-color 1s var(--ease-out-quart), color 1s var(--ease-out-quart);
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-family: king, monospace, sans-serif;
  font-size: 1.4rem;
  line-height: 1.285;
  display: flex;
}
img,picture,video,canvas,svg { max-width: 100%; height: auto; display: block }
input,button,textarea,select { font: inherit; cursor: pointer }
p { text-wrap: pretty }
h1,h2,h3,h4,h5,h6 { text-wrap: balance }
:root { --site-padding: 2rem }
```

**The gallery (THE move):**

```css
.product-image-gallery-module__n8D76q__productImageGallery {
  width: 100%;
  position: relative;
}
.product-image-gallery-module__n8D76q__images {
  scroll-snap-type: y mandatory;     /* vertical snap! not horizontal */
  scrollbar-width: none;
  flex-direction: column;
  gap: 2.5rem;
  padding: 40svh 2rem;               /* 40svh top AND bottom = each image centers */
  display: flex;
}
.product-image-gallery-module__n8D76q__image {
  opacity: 0.5;                      /* off-snap images are dimmed */
  scroll-snap-align: center;
  width: 100%;
  height: 40vh;                      /* every image is exactly 40vh tall */
}
.product-image-gallery-module__n8D76q__image img {
  object-fit: contain;
  width: 100%;
  height: 100%;
}
```

Why this feels so good on phone:
1. `scroll-snap-type: y mandatory` — the page **must** snap to an image. No half-states.
2. `scroll-snap-align: center` — the snap point is the *center* of the image, not top/bottom.
3. `padding: 40svh 2rem` (top and bottom) — combined with each image being `40vh`, the math works out so each image lands centered with whitespace above and below.
4. `svh` (small viewport height) instead of `vh` — accounts for mobile browser chrome (Safari URL bar). Crucial.
5. `opacity: 0.5` on all images by default — the "active" one almost certainly gets `opacity: 1` via JS observing `IntersectionObserver` and toggling a class (the styles for the active state aren't in the static CSS bundle, suggesting it's done with inline-style or a Module class added in the React render).
6. `scrollbar-width: none` — the scroll feels invisible and direct.
7. `gap: 2.5rem` — gentle breathing room between snap points.

**No carousel JS library at all.** No Swiper, no Embla, no Flickity, no KeenSlider. Pure native CSS. Touch momentum, snap, indicators are all browser-native.

---

## 2. Typography stack

Two custom fonts loaded as `@font-face`:

```css
@font-face {
  font-family: dot-array;
  src: url(/fonts/dot-array/DotArray.woff2) format("woff2"),
       url(/fonts/dot-array/DotArray.woff)  format("woff"),
       url(/fonts/dot-array/DotArray.otf)   format("opentype");
  font-style: normal; font-weight: 400;
}
@font-face {
  font-family: king;
  src: url(/fonts/king/King.woff2) format("woff2"),
       url(/fonts/king/King.woff)  format("woff"),
       url(/fonts/king/King.otf)   format("opentype");
  font-style: normal; font-weight: 400;
}
```

**Mixing rule (the rule is the magic):**
- `body { font-family: king, monospace, sans-serif; }` — `king` is the default, a humanist mono-feeling face.
- `.dot-array { font-family: dot-array, monospace, sans-serif; }` — applied as a utility to ALL the chrome labels (toolbar, drawer toggle, add-to-cart). It's a literal LED/dot-matrix font.
- `.caps { text-transform: uppercase }` — utility, almost always paired with `.dot-array`.

Result: **chrome looks like a 90s electronics readout**, body looks like a zine.

**Sizes (the whole site has like 4):**
- body / nav / drawer header / cart: `1.4rem` (14px)
- disclaimer / `.longLabel`: `1.2rem` (12px)
- info-pane heading: `2.4rem`
- cart count badge: `1rem`
- letter-spacing on drawer footer links: `0.1em` (the only place tracking is bumped)
- `line-height: 1.285` for body, `1.5` baseline reset

That's the entire type system. **4 sizes. 1 ratio.**

---

## 3. Color palette

```css
:root {
  --site-padding: 2rem;
  --ease-out-quart: cubic-bezier(.25, 1, .5, 1);
}
:root:not(.dark-mode), .light-mode {
  --background: #fdfdfd;     /* near-white, faintly warm */
  --foreground: #000;        /* pure black */
  --border:     #d4d4d4;     /* mid gray, ~83% lightness */
}
@media (prefers-color-scheme: dark) {
  :root:not(.light-mode) {
    --background: #010101;   /* near-black, NOT pure */
    --foreground: #fff;
    --border:     #2b2b2b;
  }
}
.dark-mode {                 /* manual override */
  --background: #010101;
  --foreground: #fff;
  --border:     #2b2b2b;
}
```

**Dial-tone palette: 3 colors per mode.** Background, foreground, border. That's it. There's a single accent (`#504383` — a muted purple swatch on the product variant selector) and that's the entire color universe.

**Mode switching pattern is exemplary:**
- Uses `prefers-color-scheme: dark` as the default
- Manual `.light-mode` / `.dark-mode` override classes
- Every transitionable property pulls from a CSS var, so flipping modes is instantaneous and animated by `transition: ... 1s var(--ease-out-quart)` on `body`

```css
body {
  transition:
    background-color 1s var(--ease-out-quart),
    color            1s var(--ease-out-quart);
}
```

A **1-second** mode-switch transition is unusually slow — and it's what makes the toggle feel theatrical instead of instant.

---

## 4. Motion

**Single easing token:**
```css
--ease-out-quart: cubic-bezier(.25, 1, .5, 1);
```

This easing is the entire motion system. Used on:
- `body { transition: background-color 1s var(--ease-out-quart), color 1s ... }`
- All toolbars: `transition: background-color 1s var(--ease-out-quart), border-color 1s ..., color 1s ...`
- Smiley/freestar logos: `transition: filter 1s var(--ease-out-quart)` (so dark-mode invert is animated, not snap)
- Add-to-cart hover: `transition: color .18s var(--ease-out-quart), background-color .18s var(--ease-out-quart)`
- Drawer/info-pane: `transition: background-color 1s var(--ease-out-quart), border-color 1s var(--ease-out-quart)`

**Two durations only:** `1s` for big mood changes, `0.18s` for hover feedback.

**One keyframe found:**
```css
@keyframes button-flicker {
  0%, 6% { background-color: var(--foreground); color: var(--background) }
  /* …flickers like a CRT — the rest of the keyframe truncated in the CSS */
}
```

A button-flicker animation that simulates a tube TV warming up — applied to the cart button confirmation state. **No GSAP. No Framer. No Lenis.** Everything is native CSS transitions.

---

## 5. Hero / opening

1. Page loads with the body already snapping to vertical-center (`flex-direction: column; justify-content: center; align-items: center`).
2. The **giant smiley SVG logo** (`.nav-module__5O4h5a__globalSmiley`, `width: 5rem`, `inset: 4rem auto auto 50%`) renders at top-center, hard-coded as inline SVG in the HTML so there's no asset request lag. It uses `background-blend-mode: difference` so it survives mode switches.
3. The first product image has already snapped into center via the gallery's natural scroll-snap.
4. The toolbar pill (`.nav-module__5O4h5a__toolbar`) is fixed at `bottom: 4rem` — the mode toggle (sun/moon icon) and the cart drawer button.
5. The product detail header (`.header-module__e6yR9G__detailHeader`) is fixed at the top, sticky scrollable, with the title and price in the dot-array font.

The first second feels like opening a vending machine.

---

## 6. Navigation

```css
.nav-module__5O4h5a__toolbar {
  z-index: 7;
  background-color: var(--background);
  color: var(--foreground);
  border: 1px solid var(--border);
  height: 4rem;
  transition: background-color 1s var(--ease-out-quart),
              border-color    1s var(--ease-out-quart),
              color           1s var(--ease-out-quart);
  align-items: center;
  display: flex;
  position: fixed;
  inset: auto 1.8rem 4rem;             /* mobile: pinned to bottom edge */
}
@media (min-width: 1024px) {
  .nav-module__5O4h5a__toolbar {
    width: 33.8rem;
    margin-left: -16.9rem;
    inset: auto auto 4rem 50%;         /* desktop: centered floating pill */
  }
}
```

- **Floating bottom pill nav.** Not a header, not a sidebar — a 4rem-tall bar pinned to bottom of viewport.
- Drawer (`.nav-module__5O4h5a__drawer`) opens **upward from the bottom** — `position: fixed; inset: auto 0 0;` mobile; on desktop becomes a centered modal.
- Inside the drawer, the nav itself is **a clock-face**: 8 labels arranged at compass positions (0°, 45°, 90°, 135°, …) around a `.navCircle` (13rem diameter). Each label is `position: absolute` + `transform: rotate(-90deg)` etc. The user **drags the indicator dot around the circle** to select a section (`cursor: grab → grabbing`, with `.navCircle` and `.navContainer` handling the gesture).
- The smiley logo at top-center stays visible always; it's the brand anchor.

This is one of the most original nav patterns I've seen — a literal **dial selector**.

---

## 7. Cursor / hover

Almost no custom cursor — they keep the OS cursor with two exceptions:

```css
.nav-module__5O4h5a__drawerMain  { cursor: grab }
.nav-module__5O4h5a__drawerMain:active { cursor: grabbing }
.nav-module__5O4h5a__navContainer       { cursor: grab }
.nav-module__5O4h5a__navContainer:active{ cursor: grabbing }
```

The dial nav uses `grab/grabbing` to telegraph "this rotates." Hover affordances are color-only:

```css
.product-toolbar-module__9MS3PW__addToCart:not([disabled]):hover {
  color: var(--background);
  background-color: var(--foreground);   /* full inversion */
}
.nav-module__5O4h5a__navLabel { opacity: .5; transition: opacity .2s ease-in-out; }
.nav-module__5O4h5a__navLabel:hover { opacity: 1 }
```

Restraint. Nothing magnetic, no parallax, no follow-cursor. Hover = invert OR fade-up. That's it.

---

## 8. Loading

No preloader detected in CSS. The site relies on Next.js streaming + the inline-rendered SVG logo to feel instant. The product image uses Next.js Image with `preload as="image" imageSrcSet="..."` in the HTML head, so the hero image is hinted to the browser before any JS runs:

```html
<link rel="preload" as="image"
      imageSrcSet="/_next/image?url=...ETDSCDPLAYER.png&w=3840&q=75 1x" />
```

That's a serious LCP optimization — the product gallery image is fetched in parallel with the HTML.

---

## 9. Image treatment

```css
.product-image-gallery-module__n8D76q__image     { width: 100%; height: 40vh; opacity: .5; scroll-snap-align: center }
.product-image-gallery-module__n8D76q__image img { object-fit: contain; width: 100%; height: 100% }
```

- **Always `object-fit: contain`**, never `cover` — the product is sacred, never cropped.
- Each frame is exactly `40vh` tall, regardless of the image's intrinsic aspect ratio.
- Off-snap dimming via `opacity: .5`.
- Light-mode info-pane images get `filter: invert()` so a dark-on-transparent illustration auto-inverts to the right contrast:
  ```css
  .light-mode .info-pane-module__6sOhrq__content img { filter: invert() }
  .nav-module__5O4h5a__navSmiley img { filter: invert(); transition: filter 1s var(--ease-out-quart) }
  .nav-module__5O4h5a__freestarImage { filter: grayscale() invert() }
  ```
  This **invert()** trick lets the same single asset serve both modes.

---

## 10. Signature visual moves

1. **Native CSS scroll-snap (vertical) gallery** with `padding: 40svh 2rem; gap: 2.5rem; image height: 40vh; opacity: .5; scroll-snap-align: center`. Zero JS library.
2. **`svh` viewport unit** (small viewport height, accounts for mobile browser chrome).
3. **`html { font-size: 62.5% }`** rem-as-px convention — `1.4rem = 14px`.
4. **Three-color-token palette** (`--background / --foreground / --border`), one per mode.
5. **1-second `cubic-bezier(.25, 1, .5, 1)` mode transition** — slow enough to feel like an event.
6. **Floating bottom toolbar pill** instead of a header — shifts all nav weight to thumb-reach zone.
7. **Compass-dial drawer nav** with grab/grabbing cursor.
8. **`filter: invert()`** to dual-mode a single asset.
9. **Inline-SVG hero logo** for zero-asset-request branding.
10. **`scroll-snap-align: center`** + symmetric viewport padding = images always center, not top-snap.

---

## PORTABLE TO ROUNDLETTER

| What | Where to put it | Snippet / approach |
|---|---|---|
| **Vertical scroll-snap image gallery** (native, no library) | **/portfolio/art** on mobile — exact same pattern. Could also work on **aureliex.com** product display. | ```css\n.gallery {\n  scroll-snap-type: y mandatory;\n  scrollbar-width: none;\n  display: flex;\n  flex-direction: column;\n  gap: 2.5rem;\n  padding: 40svh 2rem;\n}\n.gallery::-webkit-scrollbar { display: none }\n.gallery > .image {\n  scroll-snap-align: center;\n  width: 100%;\n  height: 40vh;\n  opacity: .5;\n  transition: opacity .3s ease;\n}\n.gallery > .image.in-view { opacity: 1 }\n```\nUse `IntersectionObserver` with `threshold: 0.5, rootMargin: '-30% 0px -30% 0px'` to toggle `.in-view` on the snapped image. |
| **Horizontal scroll-snap variant** for an inline strip (e.g. on **/statement** to preview projects) | Components in `src/components/SnapStrip.tsx`. | Same as above with `scroll-snap-type: x mandatory; flex-direction: row; padding: 0 40vw`. |
| **`svh` over `vh`** everywhere on mobile-facing layouts | Sweep `globals.css` and replace `vh` → `svh` in any sticky-bottom nav or hero. | `min-height: 100svh` instead of `100vh` to dodge the Safari URL-bar reflow jump. |
| **3-token color system** (`--background / --foreground / --border`) | `src/app/globals.css` — replace any rich palette with these three for **/statement** at minimum. | ```css\n:root, .light-mode { --background:#fdfdfd; --foreground:#000; --border:#d4d4d4 }\n@media (prefers-color-scheme: dark) {\n  :root:not(.light-mode) { --background:#010101; --foreground:#fff; --border:#2b2b2b }\n}\n.dark-mode { --background:#010101; --foreground:#fff; --border:#2b2b2b }\n``` |
| **1-second `--ease-out-quart` mode transition on body** | `globals.css`. | ```css\n:root { --ease-out-quart: cubic-bezier(.25,1,.5,1) }\nbody { transition: background-color 1s var(--ease-out-quart), color 1s var(--ease-out-quart) }\n``` |
| **Floating bottom pill nav** (4rem tall, 1px border, `--background` color) | **aureliex.com** — replace the existing nav. Mobile-first thumb reach. | ```css\n.toolbar {\n  position: fixed;\n  inset: auto 1.8rem 4rem;\n  height: 4rem;\n  border: 1px solid var(--border);\n  background: var(--background);\n  display: flex;\n  align-items: center;\n  z-index: 7;\n}\n@media (min-width: 1024px) {\n  .toolbar { width: 33.8rem; inset: auto auto 4rem 50%; margin-left: -16.9rem }\n}\n``` |
| **`html { font-size: 62.5% }`** convention | `globals.css`. Lets you write `1.4rem = 14px` everywhere. Already common, but worth standardizing across all roundletter sub-sites. | One line in globals.css. Tailwind respects it. |
| **`filter: invert()` to dual-mode single SVG/PNG assets** | **/portfolio** — let one asset serve light & dark mode. | `.dark-mode img.auto-invert { filter: invert() }` |
| **`object-fit: contain` rule** for portfolio art (never crop the work) | **/portfolio/art**. | Default rule for all `.work img`. |
| **Inline-SVG hero logo** (no asset request) | `src/components/Logo.tsx` — return raw JSX SVG instead of `<Image src=…>`. | LCP win on every page. |
| **`text-wrap: balance` on headings, `text-wrap: pretty` on paragraphs** | `globals.css`. Free typography improvement. | `h1,h2,h3,h4,h5,h6 { text-wrap: balance } p { text-wrap: pretty }` |
| **Hover = full color inversion** (not lighten/darken) | All buttons across roundletter. Brutalist clarity. | ```css\n.btn:hover { color: var(--background); background: var(--foreground) }\n``` |
| **CRT button-flicker keyframe** for cart-add / submit success states | **/keys** or **/letters** submit button confirmation. | ```css\n@keyframes flicker {\n  0%,6% { background: var(--foreground); color: var(--background) }\n  7%,12% { background: var(--background); color: var(--foreground) }\n  13%,100% { background: var(--foreground); color: var(--background) }\n}\n.btn.fired { animation: flicker .6s steps(8) }\n``` |
