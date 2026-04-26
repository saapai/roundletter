# Art Gallery Pick — `/art`

**Pick: ART1 Salon Wall (asymmetric grid + thin frames).** Only this proposal's *resting state* matches the aureliex brand — Yoshida cover, paper-white chrome, italic-vs-roman voice. The wall *is* a magazine cover for twelve pieces; nothing animates on its own, the curatorial sequence is encoded in the layout, and 1px frame + warm mat reads as "printed catalogue plate." Card-decks (ART3) and panoramas (ART2) impose swipe gestures that betray the editorial register; full page-flip spreads (ART4) over-promise on 12 pieces. **Borrow three:** (1) ART4's **margin captions, italic title / roman medium-year** (Werner voice), placed outside each frame's left edge; (2) ART4's **COLOPHON closer** — a final row listing all 12 as a Werner sequential index with starting bids; (3) ART2's **FLIP `layoutId` lightbox** — the thumbnail's rect grows into the fullscreen plate, smooth handoff, no modal jump-cut. Skip ART3; its 3D depth fights the paper metaphor.

## Implementation spec

### Layout grid (CSS)
```css
.wall { background:#faf8f3; padding:6rem 6rem 16rem; }
.grid {
  display:grid;
  grid-template-columns:repeat(12,1fr);
  grid-auto-rows:8rem;
  gap:4rem 3rem;
}
.frame {
  border:1px solid rgb(0 0 0 / .85);
  padding:1rem;                     /* the mat */
  background:#f5f1e8;
  box-shadow:0 2px 0 rgb(0 0 0 / .08), 0 24px 40px -16px rgb(0 0 0 / .18);
  cursor:zoom-in;
}
.caption {
  font:italic 0.78rem/1.4 var(--serif);
  font-feature-settings:"onum","liga";
  margin-top:.75rem;
  text-align:left;             /* aligned to frame's left edge */
}
.caption em { font-style:italic } .caption span { font-style:normal }
@media (max-width:768px){
  .wall  { padding:3rem 1.5rem 8rem }
  .grid  { grid-template-columns:repeat(6,1fr); grid-auto-rows:5rem; gap:2.5rem 1.5rem }
}
```
Spans are baked into a `PIECES` manifest (`grid-column:"2 / span 5"`, `grid-row:"1 / span 4"`, etc.). Hero pieces 4–5×4, supporting 3×3, details 2×2. Mobile spans halve and clamp ≤6 cols. **Never random** — deterministic per piece so reloads are stable.

### Animation specs
- Frame entrance: `opacity 0→1, translateY 12px→0`, **stagger 60ms**, `cubic-bezier(.2,.8,.2,1)`, **400ms**.
- Lightbox open/close (Framer Motion `layoutId="piece-${id}"`): `spring { stiffness: 260, damping: 32 }` (~450ms). Backdrop fades `200ms ease-out`.
- Hover: **none** on the frame itself (e-t-d-s discipline). Cursor `zoom-in` is the only affordance.
- `@media (prefers-reduced-motion: reduce)`: disable stagger and `layoutId` interpolation; lightbox cross-fades over 120ms; no transforms.

### File structure
- **Modify:** `src/app/art/page.tsx` (replace current vertical list with `<SalonWall pieces={PIECES} />`).
- **Create:** `src/app/art/SalonWall.tsx` (client component, manifest + grid render).
- **Create:** `src/app/art/Lightbox.tsx` (`AnimatePresence` + shared `layoutId` from ART2).
- **Create:** `src/app/art/page.module.css` (grid, frame, mat, caption, paper backdrop).
- **Create:** `src/app/art/pieces.ts` (manifest: id, src, title, medium, year, startBid, col, row).
- **Create:** `public/art/paper-noise.svg` (4% horizontal woodgrain backdrop).
- **No changes** to `src/app/portfolio/page.tsx` — link "art" → `/art`.

### Mobile behavior (iPhone-first)
6-col grid, 1.5rem padding, all spans clamped ≤6. **No horizontal scroll ever** (`overflow-x:hidden` on wrapper). Tap a frame → lightbox grows from thumbnail rect to `90vw × 80vh contain`. Swipe left/right traverses **manifest order** (curatorial, not visual). Swipe-down or tap backdrop closes. `touch-action: manipulation` on frames.

### Desktop behavior
12-col grid, 6rem outer padding. Click → lightbox. **Arrow keys** ←/→ traverse, **Esc** closes. Cursor `zoom-in` over frames; default cursor over wall. No parallax, no hover-scale, no follow-cursor — wall stays still, the eye does the walking.

### Lightbox interaction (FLIP handoff, borrowed from ART2)
On open, set `layoutId="piece-${id}"` on both thumbnail `<motion.img>` and the lightbox `<motion.img>`; Framer Motion interpolates the bounding rect. Backdrop `rgba(0,0,0,.92)` fades in behind. Caption strip (italic title · roman medium · year · `$ start_`) renders bottom-left in dot-array mono. Close on Esc / backdrop click / down-swipe. After the **12th** lightbox image, the next-arrow lands on the **COLOPHON row** (the borrowed ART4 closer): full sequential index 01–12 with starting bids, anchor links, total `$36`.