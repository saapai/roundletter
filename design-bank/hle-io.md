# hle.io — Design Teardown

**URL:** https://hle.io/
**Stack:** Nuxt.js 2 (Vue), 24 inline scoped `<style>` blocks (Vue SFC scoping via `data-v-*` attrs), no external CSS file. Custom font system (PPSupply by Pangram Pangram). Animation primarily via custom Vue + (likely) GSAP-style scroll math driving a `<canvas>`/`<video>` start screen.
**Source artifacts:** `/_nuxt/runtime.js`, `/_nuxt/pages/index.js`, `/_nuxt/commons/app.js`, `/_nuxt/vendors/app.js`, `/_nuxt/app.js`. No CDN-loaded GSAP/Lenis tag — but the scroll behavior (500vh "ghost height" wrapper driving a fixed canvas) is the canonical Lenis-or-locomotive + scroll-linked timeline pattern.
**The vibe:** brutalist editorial × Apple product page × analog hi-fi switchgear. Day/Night theme baked into the geometry. Everything feels like a physical object: skeuomorphic toggle switches, dot-grid HUDs, a clock, a "Sound on/off" radio.

---

## 1. Layout grid

No CSS Grid. Pure flex + absolute positioning anchored to a fixed viewport.

```css
/* The whole site sits inside a custom virtual scroller */
#scroller[data-v-314f53c6] {
  position: absolute;
  left: 0;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
}
#scroller::-webkit-scrollbar { display: none; }

/* The intro is a 5-screen-tall ghost div that drives a fixed canvas */
.start-screen-wrapper {
  height: 500vh;       /* gives 5 viewport heights of scroll runway */
  pointer-events: none;
}
.start-screen {
  width: 100vw;
  position: fixed;     /* canvas/video stays put, scroll just feeds time */
  inset: 0;
  background-color: var(--color-dark-gray);
  color: var(--color-dark);
}
.start-screen.night-mode { background-color: var(--color-dark-blue); }
```

**Container padding scale (responsive, no Tailwind):**
- desktop default: `padding-left/right: 40px`
- mobile (`max-width: 767px`): `var(--container-padding-mobile)` = `1.6rem`
- "container" max width var: `--container-padding: 11.7rem`

**Breakpoints (4-tier, all manual `@media`):**
| range | role |
|---|---|
| `min-width: 1920px` | "XL display" (sizes scale up, not down) |
| `max-width: 1439px` | "laptop" |
| `max-width: 1023px` | "tablet" |
| `max-width: 767px` | "mobile" |

Note the inversion: the *large* breakpoint scales up, everything else scales down. This is the OG "design for 1440 then expand both ways" approach.

---

## 2. Typography stack

Two-axis custom typeface family, all in `:root` as CSS vars:

```css
:root {
  --font-mono-regular:     "PPSupplyMonoRegular";   /* for HUD/labels */
  --font-mono-ultralight:  "PPSupplyMonoUltralight";
  --font-sans-regular:     "PPSupplySansRegular";   /* for headlines */
  --font-sans-ultralight:  "PPSupplySansUltralight";
}
```

**Type scale (rem-based, with 4 viewport tiers):**

```css
/* H1 — gigantic editorial display */
.h1 { line-height: 1; font-weight: 400; font-size: 13.4rem; }
@media (min-width: 1920px) { .h1 { font-size: 17.4rem; } }
@media (max-width: 1439px) { .h1 { font-size: 9rem;    } }
@media (max-width: 1023px) { .h1 { font-size: 6.5rem;  } }
@media (max-width: 767px)  { .h1 { font-size: 4.8rem;  } }

.h2 { line-height: 1; font-weight: 400; font-size: 7.7rem; }   /* ↑ 8.7 / ↓ 5 / 5 / 4.1 */
.h3 { line-height: 1; font-weight: 400; font-size: 4.7rem; }   /* ↑ 5.7 / ↓ 3.4 / 3.4 / 2.4 */

/* P1 — body lead in MONO */
.p1 { font-family: var(--font-mono-regular); font-size: 2.2rem; font-weight: 400; line-height: 1; }

/* P2 — small mono, for HUD/nav/labels */
.p2 { font-family: var(--font-mono-regular); font-size: 1.5rem; font-weight: 400; line-height: 1.3; }
@media (min-width: 1920px) { .p2 { font-size: 1.7rem; } }

/* The preloader uses an even bigger size — a custom one-off */
.preloader__text {
  font-weight: 400;
  max-width: 123.6rem;
  font-size: 11.8rem;
  line-height: 0.99;
}
@media (min-width: 1920px) { .preloader__text { font-size: 14.8rem; max-width: 158.7rem; } }
```

**Mixing rule:** Sans for editorial display (H1–H3), **MONO for everything functional** (nav, buttons, footer, clock, "Scroll Down", labels). Line-height is **always exactly 1** for headlines (0.99 for the preloader). Body leans dense.

**`html { font-size }` base:** standard 10px (assumed via Nuxt boilerplate, since rem values like `1.5rem = 15px` work out perfectly for monospace).

---

## 3. Color palette

```css
:root {
  --color-light:     #ffffff;
  --color-dark:      #101011;   /* near-black, slightly warm */
  --color-gray:      #CBCBCB;
  --color-dark-gray: #bbbbbb;   /* the DAY-mode background */
  --color-fade-light:#383838;
  --color-dark-blue: #141334;   /* the NIGHT-mode background — deep indigo, not black */
  --color-accent:    #32A4C3;   /* cyan, used sparingly for interaction states */
  --color-error:     #FD4E28;   /* signal orange */
}
```

**Usage rules I extracted:**
- Day mode: `bg #bbbbbb / text #101011` — *not* white-on-black or black-on-white. The midtone gray is the signature.
- Night mode: `bg #141334 / text #ffffff` — indigo, not pure black.
- `--color-accent: #32A4C3` lives only in interactive moments.
- The mode switch is mediated by a `.start-screen.night-mode` class swap with no transition declared on bg-color (the canvas overlay does the visual fade).
- Skeuomorphic switches use baked shadow tokens:
  ```css
  --shadow:
    -2.59048px -2.59048px 7.85333px rgba(165,165,165,0.4),
     2.59048px  2.59048px 5.18095px rgba( 66, 66, 66,0.5);
  ```
  …yes, those subpixel numbers are real — copied from a Figma export. They give the toggle that "warm extruded plastic" look.

---

## 4. Motion

```css
:root {
  --transition:        0.5s ease-in-out;
  --transition-300:    0.3s ease-in-out;
  --timing-function:   cubic-bezier(0.2, 0, 0.8, 1);  /* quint-ish, soft both ends */
}
```

**Patterns:**
- Underlines reveal via `transform: scaleX(0) → scaleX(1)`, `transform-origin: left center`, `transition: var(--transition-300)`.
- Toggle bodies move via `transform` only (`translateX`) — never `left`. Always GPU-accelerated.
- Mode switching is mediated by a class swap on `.start-screen` and crossfading two `<video>`/canvas layers.
- `.start-screen-wrapper { height: 500vh }` + `.start-screen { position: fixed }` is the **scroll-driven timeline** primitive: the user scrolls 5 viewports, the on-screen canvas updates frame-by-frame.

**No GSAP `<script>` tag in the HTML head**, but the `_nuxt/vendors/app.js` bundle almost certainly contains it (or `framer-motion`/`@vueuse/motion` equivalent). The video element with `playsInline loop muted crossOrigin` and `src="/models/tv_square.mp4"` is the source for a `<canvas>` that reads its frames — likely scrubbed via `requestAnimationFrame` based on scroll position. (This is the "Apple AirPods Pro" technique.)

---

## 5. Hero / opening (first 1 second)

1. **Preloader** mounts immediately (`.preloader`, z-index 10000), full-bleed `--color-dark`, white type. Inside: a giant `--font-sans-regular` headline at `11.8rem / 0.99`, plus a 1px wide `.preloader__progress` bar growing.
2. Preloader exits (transition not in inline CSS — likely a clip-path reveal or Y-translate handled in JS).
3. **Start screen** renders: a `<video src="/models/tv_square.mp4" muted loop playsInline crossOrigin>` is hidden (`visibility: hidden`) and used as a texture; the visible content is a `<canvas>` filling the viewport.
4. HUD layers on top: corner header (logo, nav list, sound switch), corner footer (clock, "Scroll Down" indicator, tagline).
5. A custom **mix-blend-mode: difference** cursor renders on top of everything (desktop only, hidden < 1280px).
6. Scrolling drives the canvas/video frame, while the HUD elements ease in/out with `--timing-function: cubic-bezier(0.2, 0, 0.8, 1)`.

The first second feels like *booting a CRT TV* — that's the metaphor.

---

## 6. Navigation

```css
.start-header {
  position: fixed;
  inset: 0 0 auto 0;
  width: 100vw;
  z-index: 1000;
  pointer-events: none;            /* container is pass-through */
  display: flex;
  justify-content: space-between;
  padding: 2.4rem 40px 0;
}
.start-header__navigation-list { pointer-events: all; flex-direction: column; }
.start-header__navigation-item + .start-header__navigation-item { margin-top: 0.8rem; }
```

- **Always-visible, fixed at top.** Three corners: nav (top-left), logo (top-center), sound toggle (top-right).
- Each link is a `link-switcher` — a fake radio button + label, where the "switcher" body is a CSS-painted skeuomorphic dial. Hover reveals a 1px underline that scales from left.
- Footer corners hold the clock (live ticking) and "Scroll Down" affordance with a tiny square dot icon.
- No hamburger, no scroll-hide, no shrink-on-scroll. The nav is **furniture**, not chrome.

---

## 7. Cursor

The signature move:

```css
.cursor {
  position: fixed;
  z-index: 1500;
  left: 0; top: 0;
  pointer-events: none;
  mix-blend-mode: difference;        /* inverts whatever's beneath */
}
@media (max-width: 1279px) { .cursor { display: none; } }

.cursor__inner {
  position: absolute;
  width: 42px; height: 42px;
  transform: translate(-50%, -50%);
}
/* Four white bars forming a + crosshair, white over difference = inverse */
.cursor__inner > span {
  --size-1: 16px;
  --size-2: 3px;
  display: block;
  background-color: white;
  transform-origin: left center;
  position: absolute;
}
```

A small **crosshair cursor**, JS-positioned via `transform: translate3d()` on mousemove. `mix-blend-mode: difference` means it inverts colors of whatever's behind — bright on dark, dark on bright. Mobile: hidden.

---

## 8. Loading

A real preloader (`.preloader`, z-index 10000), not a skeleton:

```css
.preloader {
  background-color: var(--color-dark);
  color: var(--color-light);
  width: 100vw; height: 100vh;
  padding: 4.8rem 4rem;
  position: fixed;
  inset: 0;
  z-index: 10000;
}
@media (max-width: 767px) {
  .preloader { padding-left: var(--container-padding-mobile); padding-right: var(--container-padding-mobile); }
}
```

Inside: an enormous headline (`11.8rem / 0.99` line height) plus a `.preloader__progress` bar. There's also a separate `.loader` (z-index 10000) that hosts an `object-fit: cover` `<img>` for inter-page transitions.

A `.nuxt-progress` 2px bar sits at the top of the page during route transitions.

---

## 9. Image treatment

- Hero "image" is actually a `<video src="/models/tv_square.mp4">` rendered onto a `<canvas>` for scroll scrubbing.
- All page-transition images use `object-fit: cover` inside a fixed-position layer (`.loader__image`).
- No explicit `aspect-ratio` declarations in inline CSS — sizes are constrained by parent flex/percent boxes.
- No `clip-path` or distortion in the HTML I scraped.

---

## 10. Signature visual moves

1. **Scroll-driven canvas-from-video** (the 500vh ghost wrapper).
2. **Difference-blend-mode crosshair cursor.**
3. **Skeuomorphic UI controls** (toggle switches with multi-stop inset/outset shadows mimicking molded plastic).
4. **HUD furniture corners** (clock, mode switch, sound toggle) framing a fullscreen canvas — like a viewfinder.
5. **Mode-switching as a first-class interaction** (not a footer afterthought) — Day/Night with separate background colors `#bbbbbb` / `#141334`, neither pure white nor black.
6. **Scoped Vue CSS via `data-v-*`** keeps every component truly isolated; no global cascade fights.

---

## PORTABLE TO ROUNDLETTER

| What | Where to put it | Snippet / approach |
|---|---|---|
| **Difference-blend crosshair cursor** | `src/components/Cursor.tsx`, mounted in `app/layout.tsx` (desktop only). Use on **aureliex.com** + **/portfolio**. | Copy the `.cursor` CSS verbatim. Track mouse with `useEffect` + `transform: translate3d(${x}px, ${y}px, 0)` on a `requestAnimationFrame` loop. Hide below 1280px. |
| **500vh ghost-scroll → fixed canvas** pattern | **/portfolio** or **/statement** could use it for an opening "scroll to reveal" hero. | Wrap a fixed scene in a `height: 500vh` div; map `window.scrollY / wrapper.height` to a 0..1 progress and feed it to whatever (a video's `currentTime`, a Three.js scene, a CSS variable `--t`). |
| **Day/Night mode with non-pure colors** | `src/app/globals.css` — define `--bg-day: #bbbbbb`, `--bg-night: #141334`. Apply to **saathvikpai.com** (=/statement) where you currently use plain black/white. | Copy the `:root` color block. Toggle via a `.night-mode` class on `<html>`. |
| **Mono-for-functional / Sans-for-display** type rule | Across all sites. Already has feel-difference value. | Pair an editorial sans (e.g. PP Editorial New, Söhne, Inter Display) with a mono (e.g. JetBrains Mono, Berkeley Mono) and reserve mono for nav/buttons/labels — never for body or headlines. |
| **Big numbers `font-size: 11–17rem; line-height: 0.99`** preloader text | **/portfolio** loading state, or **/statement** opening line. | The 0.99 line-height is the "tight typographic" trick. Combine with a `max-width` in rem so the wrap is intentional. |
| **Skeuomorphic toggle switches** for Sound / Mode | **aureliex.com** "play sound" and "dark mode" toggles. | Copy the `--shadow: -2.59048px -2.59048px 7.85333px rgba(165,165,165,0.4), 2.59048px 2.59048px 5.18095px rgba(66,66,66,0.5)` recipe verbatim onto a `4.8rem × 2.4rem` pill with an inset child. |
| **Fixed corner HUD framing** (logo, clock, scroll-hint, toggles all at fixed corners) | **/portfolio/art** — would make every page feel like a viewfinder. | `position: fixed` with `pointer-events: none` on the wrapper, `pointer-events: all` on the children. |
| **Hide-scrollbar but keep scroll** primitive | Any horizontal gallery in roundletter. | `scrollbar-width: none; -ms-overflow-style: none;` plus `::-webkit-scrollbar { display: none; }`. |
| **`--timing-function: cubic-bezier(0.2, 0, 0.8, 1)`** | Use as the global ease for hover transitions. | Drop into globals.css and reference everywhere instead of `ease-in-out`. |
| **Live ticking clock in the corner** | **saathvikpai.com** = /statement — pure personality move, costs nothing. | `setInterval(updateTime, 30000)` rendering `06 : 58 am` in mono font. |
