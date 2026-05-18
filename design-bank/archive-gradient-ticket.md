# Archive Gradient — Ticket Design Reference

**Source:** aureliex.com/archive masthead (the `home-bridge-mast` class)
**Screenshot:** 2026-05-18 — the diagonal light-shaft hero

## Why this works

The archive masthead is the strongest visual moment on the site. It works because:
- **Diagonal light shaft** across center creates cinematic depth without any imagery
- **Dark plum edges** (#0a0610 → #2a1028 → #4a1a34) frame the light — not black, but warm-dark
- **Pink-gold center** (#d4928c → #e4b8a0 → #ecd4b8 → #f0dcc0) — rose-gold, not amber
- **Grain overlay** (soft-light, two radial-gradient noise layers at 4% opacity) kills banding
- **Typography:** large italic Cormorant Garamond, dark ink on the light shaft, light on dark edges
- **Monospace labels** in tracked uppercase at very low opacity (0.3–0.5) — metadata recedes

## The gradient (CSS)

```css
linear-gradient(
  155deg,
  #0a0610  0%,
  #14091a  8%,
  #2a1028  17%,
  #4a1a34  25%,
  #7a3048  33%,
  #b06068  39%,
  #d4928c  44%,
  #e4b8a0  48%,
  #ecd4b8  52%,
  #f0dcc0  55%,
  #e4c0a0  59%,
  #d09878  65%,
  #a06058  72%,
  #6a2840  80%,
  #2a1020  89%,
  #0a0610  100%
)
```

Plus radial overlays for corner interest:
- Bottom-right: `radial-gradient(ellipse 65% 50% at 82% 85%, rgba(196,138,122,0.2), transparent)`
- Top-left: `radial-gradient(ellipse 55% 45% at 8% 6%, rgba(52,18,40,0.35), transparent)`
- Center: `radial-gradient(ellipse 40% 30% at 55% 48%, rgba(200,168,72,0.08), transparent)`

## Portable to

- **Ticket component** on /draft/home — the liquidity event card (shipped 2026-05-18)
- **Any cinematic card** that needs to feel like a film poster or event invitation
- **Letter heroes** that want the warm-editorial feel without a photo
- **The closer section** — rose-gold per-character coloring echoes this palette

## Color palette extracted

| Role        | Hex       | Name         |
|-------------|-----------|--------------|
| Deep edge   | #0a0610   | midnight plum |
| Dark frame  | #2a1028   | wine shadow  |
| Wine        | #4a1a34   | deep wine    |
| Rose        | #7a3048   | dusty rose   |
| Blush       | #b06068   | warm blush   |
| Peach       | #d4928c   | light peach  |
| Gold-peach  | #e4b8a0   | rose gold    |
| Parchment   | #ecd4b8   | warm cream   |
| Light       | #f0dcc0   | champagne    |
| Terracotta  | #a06058   | terracotta   |
| Copper      | #d09878   | copper       |

## Typography on this gradient

- **Title:** Cormorant Garamond italic, 400 weight, dark (#1C1A17) on the light shaft center
- **On dark edges:** same font, color #E5DDD2 with text-shadow for depth
- **Labels:** JetBrains Mono, 0.5–0.55rem, letter-spacing 0.2–0.3em, uppercase, 30–50% opacity
