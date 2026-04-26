// Salon Wall manifest. Order = curatorial sequence (arrow keys / swipe
// traverse this order, NOT the visual grid order). Spans are deterministic
// per piece — reloads are stable, never random. Heroes (eagle,
// tarantula-colored, watercolor-face) get larger spans per the synthesis.
//
// Desktop grid: 12 cols, grid-auto-rows 8rem.
// Mobile grid:  6 cols,  grid-auto-rows 5rem (spans clamped server-side
// in CSS via @media — JS spans are the desktop spans; mobile clamp is
// CSS-driven via .art-frame having two custom-property fallbacks.)

export type PiecePlacement = {
  id: string;
  // desktop column track (1..13) and span (1..12)
  colStart: number;
  colSpan: number;
  rowSpan: number;
  // mobile (6-col) — independent placement so the wall stays composed
  mColStart: number;
  mColSpan: number;
  mRowSpan: number;
};

// Order matches src/data/art-portfolio.json (the curator's sequence).
export const PLACEMENTS: PiecePlacement[] = [
  // 1. heron, in color — opening color note, mid-left
  { id: "rainbow-heron-2019",   colStart: 1,  colSpan: 4, rowSpan: 4, mColStart: 1, mColSpan: 4, mRowSpan: 4 },
  // 2. bald eagle, watching — HERO, big top-right
  { id: "eagle-2018",            colStart: 6,  colSpan: 5, rowSpan: 5, mColStart: 1, mColSpan: 6, mRowSpan: 5 },
  // 3. tarantula, orange on black — HERO, second row left
  { id: "tarantula-2019",        colStart: 1,  colSpan: 5, rowSpan: 5, mColStart: 1, mColSpan: 5, mRowSpan: 4 },
  // 4. eagle, up close — supporting square, second row right
  { id: "eagle-closeup-2020",    colStart: 7,  colSpan: 4, rowSpan: 4, mColStart: 2, mColSpan: 4, mRowSpan: 3 },
  // 5. robber fly — small detail, far right
  { id: "robber-fly-2019",       colStart: 11, colSpan: 2, rowSpan: 3, mColStart: 1, mColSpan: 3, mRowSpan: 3 },
  // 6. profile, man-bun — portrait pillar
  { id: "bearded-profile-2020",  colStart: 6,  colSpan: 3, rowSpan: 4, mColStart: 4, mColSpan: 3, mRowSpan: 3 },
  // 7. conch, tangled — pen study, mid wall
  { id: "zentangle-conch-2018",  colStart: 9,  colSpan: 4, rowSpan: 3, mColStart: 1, mColSpan: 6, mRowSpan: 3 },
  // 8. small face, large eyes — child portrait, intimate left
  { id: "child-portrait-2017",   colStart: 1,  colSpan: 3, rowSpan: 3, mColStart: 1, mColSpan: 3, mRowSpan: 3 },
  // 9. scorpion — anatomical detail
  { id: "scorpion-2017",         colStart: 4,  colSpan: 3, rowSpan: 3, mColStart: 4, mColSpan: 3, mRowSpan: 3 },
  // 10. a face, unfinished — HERO watercolor, plate-sized
  { id: "watercolor-face-2026",  colStart: 7,  colSpan: 6, rowSpan: 5, mColStart: 1, mColSpan: 6, mRowSpan: 5 },
  // 11. kraft folio — meta plate, small lower-left
  { id: "kraft-folio-back",      colStart: 1,  colSpan: 3, rowSpan: 3, mColStart: 1, mColSpan: 3, mRowSpan: 3 },
  // 12. tupac · basketball — closer, mid lower
  { id: "tupac-basketball-2026", colStart: 4,  colSpan: 5, rowSpan: 4, mColStart: 4, mColSpan: 3, mRowSpan: 3 },
];
