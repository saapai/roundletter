# GRINK 2025 (grink2025.dviga.marketing)

## Strongest Design Idea
A vending-machine interaction metaphor — "PRESS THE LEVER AND RELEASE" — turns product browsing into a tactile dispensing ritual instead of a passive scroll.

## Layout Pattern
Asymmetric vertical scroll. Hero sections alternate full-width image blocks with text panels. Product showcase is a hybrid grid/carousel of clickable flavor cards. Notably, English and Russian variants of the same content are stacked in one DOM rather than served as separate routes — a single page does double duty.

## Motion / Interaction
- Smooth-scroll anchor navigation (`#main`, `#banana`, `#drinks`) — likely `scroll-behavior: smooth` with offset for sticky header.
- Bottle mockups respond to a "lever" interaction — implies a JS click handler that triggers a CSS keyframe sequence (bottle drops / rotates / dispenses).
- Hover on flavor cards: opacity + scale transforms on the "Learn more" affordance.
- A persistent "Pay here" CTA appears to use sticky positioning so it's always reachable during product browse.
- Carousel-like flavor switching may be implemented with CSS scroll-snap + anchor positioning rather than a JS carousel library.

## Mobile Experience
- Separate `#banana-m` / `#drinks-m` anchor IDs indicate **distinct mobile DOM sections** rather than a single responsive layout — desktop and mobile content are authored independently and toggled by media query.
- Nav collapses to a sheet/hamburger.
- Product grid stacks to single column.
- Sticky "Pay here" likely becomes a bottom-fixed bar (thumb-zone friendly).

## Typography
- Geometric/rounded sans-serif matching youthful beverage branding.
- Bold display ("Get ready for new") at ~36–48px, regular body at 14–16px.
- All-caps treatment with generous letter-spacing on key phrases ("PRESS THE LEVER AND RELEASE", "NEW FLAVOUR").
- Bilingual content sets both languages in the same family — language switching never disturbs visual rhythm.

## Color
- Vibrant flavor-driven greens (banana packaging) as the dominant brand hue.
- Black text on white backgrounds for product info — maximum contrast.
- Yellow/gold accent on the "Pay here" CTA — the only commerce trigger gets the only warm color.
- Mood: fresh, premium, retail-restrained.

## Genuinely Novel
Two things stand out:
1. **Authoring desktop and mobile as separate DOM sections** (`#banana` vs `#banana-m`) is unfashionable but bulletproof — you get pixel-perfect control per device without responsive compromise, and language toggles stay simple.
2. **Treating a CTA as a physical lever** — a single click triggers a multi-step CSS dispense animation, turning the buy moment into a small piece of theatre.

## PORTABLE TO ROUNDLETTER
- A "lever" / "deposit" / "pull" interaction for the primary subscribe or invest action — make the conversion moment feel mechanical, not just a form submit.
- Reserve one warm accent color (gold/yellow) **only** for monetary actions; everything else stays neutral. Your brain learns "yellow = money."
- Sticky thumb-zone CTA on mobile that mirrors the lever metaphor — a bottom bar that, when tapped, plays the same dispense animation as desktop.
- Consider authoring complex hero/portfolio sections as separate desktop and mobile DOM blocks rather than fighting one responsive layout — easier to ship a polished mobile narrative.
- CSS scroll-snap as a no-JS carousel for portfolio cards — fewer dependencies, native momentum.
