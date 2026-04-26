# Gorilla Science (watchgorillascience.com)

## Strongest Design Idea
A "plugged-in vs. unplugged" electrical-imagery metaphor that frames the site as a counter-establishment broadcast — graphics literally pull cords on the conventional narrative.

## Layout Pattern
Asymmetric single-column with full-viewport hero blocks. Alternating text/image rows feed into a card-based content grid for video picks. Horizontal alignment shifts (image floats left, then right, then center) deliberately break the column axis without leaving it.

## Motion / Interaction
- Scroll-triggered reveal animations cued by an explicit "Explore" indicator graphic.
- SVG gorilla "disc" element on hero acts as a loading/spinner motif that doubles as a brand mark.
- Layered absolutely-positioned SVG plug/unplug graphics overlap content for parallax-like depth without a parallax library.
- Card hover states use simple CSS transitions (opacity / translate) rather than complex GSAP timelines.

## Mobile Experience
- Card grid collapses to a single column.
- Hero imagery is served through `?fit=` query params (image CDN), so art-direction crops happen at the URL level rather than via `<picture>` srcset.
- Decorative SVG layers likely get hidden via `display:none` at small breakpoints to keep the hero readable.
- Nav switches to hamburger.

## Typography
- Sans-serif primary, with heavy-weight italic emphasis on charged words ("World", "Lied", "freedom") used as in-line typographic punctuation.
- All-caps small-cap labels for category tags ("WATCH VIDEO", "WORLD | NEW CL").
- Hierarchy is built on size jumps + weight contrast rather than typeface mixing.

## Color
- Near-black background, high-contrast white body text.
- Single bright accent reserved for CTAs (likely a saturated yellow/orange to read like a warning/electrical sign).
- Mood: edgy, underground, "samizdat" newsroom.

## Genuinely Novel
The metaphor is enforced at the asset level: SVG cords/plugs are positioned to physically "connect" one section to the next, so scrolling reads as following a wire down the page. It's a structural use of decoration rather than ornament.

## PORTABLE TO ROUNDLETTER
- Use a single recurring graphic motif (a wire, a thread, a ledger line) that visually links sections, so the eye follows continuity rather than encountering discrete blocks.
- Reserve one saturated accent color exclusively for action — every appearance becomes a signal, not decoration.
- Italic-bold inline emphasis on a tiny set of charged words ("growth", "public", "compounding") inside otherwise neutral copy creates editorial voice without extra components.
- URL-level image cropping (`?fit=`, `?ar=`) is a cheap art-direction lever for hero variants per breakpoint.
