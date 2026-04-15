// POLYMARKET — ten letter pages, each themed to saapai's bank, each gated by
// a single case-sensitive letter. Slide 9 is the egg canvas: clicking anywhere
// jumps to the nearest egg's target page. Rare pages have fewer + tighter eggs.

export type V1Theme = {
  n: number;            // 1..10
  letter: string;       // P, O, L, Y, M, A, R, K, E, T
  slug: string;
  hero: string;         // storybook first-letter concept
  eyebrow: string;
  body: string;
  hint: string;
  tone: number;         // 0=dark/tech, 1=light/consumer — drives y-center
  green: string;        // celebration green, per page
  rhyme: string;        // slide-9 bank phrase this page rhymes with
  rarity: "common" | "medium" | "rare" | "very-rare";
  count: number;        // eggs allocated to this theme (sums to 100)
  sigma: number;        // cluster spread — smaller = harder to hit randomly
  cx: number;           // x-center on slide 9 (0..1)
  cy: number;           // y-center on slide 9 (0..1) — matches tone
};

export const V1_THEMES: V1Theme[] = [
  {
    n: 1, letter: "P", slug: "polymath", hero: "Polymath",
    eyebrow: "// v1.1 — the proof",
    body: "a polymath is not someone who knows many things. it is someone who has been many people. you borrow a life by paying attention to it. you keep a piece of it by doing something with what you borrowed.",
    hint: "one letter. the first of what you're spelling.",
    tone: 0.50, green: "#3B7A4A", rhyme: "polymath is the proof.",
    rarity: "rare", count: 6, sigma: 0.040, cx: 0.52, cy: 0.50,
  },
  {
    n: 2, letter: "O", slug: "opus", hero: "Opus",
    eyebrow: "// v1.2 — the colophon",
    body: "the v1 letter on aureliex.com is not edited by me. it is written by an opus. a model that reads its own output, disagrees, re-drafts. the colophon is a signature by something that didn't sign up to be named.",
    hint: "the second letter. round as a colophon.",
    tone: 0.08, green: "#2E6B5C", rhyme: "opus 4.6 · 1m-context.",
    rarity: "very-rare", count: 3, sigma: 0.025, cx: 0.78, cy: 0.08,
  },
  {
    n: 3, letter: "L", slug: "love", hero: "Love",
    eyebrow: "// v1.3 — the motive",
    body: "a little love in the heart — and good things happen. this is not decoration. this is the engineering principle. the only durable reason to keep doing hard things is that the doing is a form of loving the people the doing is for.",
    hint: "the third letter. lean in.",
    tone: 0.88, green: "#5E9E4B", rhyme: "a little love in the heart — and good things happen.",
    rarity: "common", count: 13, sigma: 0.095, cx: 0.36, cy: 0.88,
  },
  {
    n: 4, letter: "Y", slug: "year", hero: "Year",
    eyebrow: "// v1.4 — the mandate",
    body: "i am asking for the year. not the title. the year is the apprenticeship time — the block on the calendar inside which the next invisible person can become invisible. one year is short enough to be real, long enough to be trained.",
    hint: "the fourth letter. branches out.",
    tone: 0.60, green: "#6B8E3E", rhyme: "the year only adds a mandate.",
    rarity: "common", count: 13, sigma: 0.095, cx: 0.78, cy: 0.60,
  },
  {
    n: 5, letter: "M", slug: "method", hero: "Method",
    eyebrow: "// v1.5 — the medicine",
    body: "even when the work is bullshit — especially then — the method is the medicine. the method survives the outcome. a lost trade with a clean logbook is worth more than a won trade with no reasoning.",
    hint: "the fifth letter. middle of the word.",
    tone: 0.18, green: "#2F5E4B", rhyme: "the method is the medicine.",
    rarity: "medium", count: 11, sigma: 0.065, cx: 0.18, cy: 0.18,
  },
  {
    n: 6, letter: "A", slug: "attention", hero: "Attention",
    eyebrow: "// v1.6 — the surface removed",
    body: "startups are the surface. underneath — attention. where you point it, how long you hold it, whether you can give it to a thing that does not ask for it. attention is the rarest, quietest virtue. it is the one thing you can spend without diluting it.",
    hint: "the sixth letter. at the top of its own alphabet.",
    tone: 0.42, green: "#4E8B52", rhyme: "ATTENTION is what matters the most.",
    rarity: "common", count: 13, sigma: 0.095, cx: 0.62, cy: 0.42,
  },
  {
    n: 7, letter: "R", slug: "revolution", hero: "Revolution",
    eyebrow: "// v1.7 — pick yours",
    body: "every revolution needs its counterculture. the revolution will not be televised. this letter is not a post. pick your revolution and pick your counterculture — or someone else picks them for you and you end up mid-scroll inside their pick.",
    hint: "the seventh letter. rust-colored.",
    tone: 0.25, green: "#3E7A4D", rhyme: "pick your revolution.",
    rarity: "medium", count: 11, sigma: 0.065, cx: 0.40, cy: 0.25,
  },
  {
    n: 8, letter: "K", slug: "keys", hero: "Keys",
    eyebrow: "// v1.8 — give them away",
    body: "i wanted the arena. then i built it. now i want the year to give it away. the presidency is the keys. the keys are not the product. they are the hand-off. the product is whoever holds them next — and the method you taught them on the way.",
    hint: "the eighth letter. cuts.",
    tone: 0.20, green: "#285E4A", rhyme: "now i want the year to give it away.",
    rarity: "rare", count: 6, sigma: 0.040, cx: 0.90, cy: 0.20,
  },
  {
    n: 9, letter: "E", slug: "empathy", hero: "Empathy",
    eyebrow: "// v1.9 — the method",
    body: "empathy is how you borrow a life. the shortest path to polymathy is through the lives of the people around you. you do not become many people by reading many books. you become many people by listening hard to one person at a time.",
    hint: "the ninth letter. ear-shaped.",
    tone: 0.82, green: "#5E9058", rhyme: "empathy is the method.",
    rarity: "common", count: 13, sigma: 0.095, cx: 0.68, cy: 0.82,
  },
  {
    n: 10, letter: "T", slug: "toolmaking", hero: "Toolmaking",
    eyebrow: "// v1.10 — the norm",
    body: "more people talk about their projects. so more people present. so more people argue. so more people build the tool and get people to use it to prove they're right about their shit. don't matter who's right or wrong. toolmaking becomes the norm.",
    hint: "the last letter. crosses the top.",
    tone: 0.30, green: "#355C4E", rhyme: "toolmaking becomes the norm.",
    rarity: "medium", count: 11, sigma: 0.065, cx: 0.22, cy: 0.30,
  },
];

export const POLYMARKET = "POLYMARKET";

export function getThemeByN(n: number): V1Theme | undefined {
  return V1_THEMES.find((t) => t.n === n);
}

// ── Egg generation ───────────────────────────────────────────────────────────
// Tight gaussian clusters around per-theme (cx, cy). Rare themes → smaller σ
// → smaller effective Voronoi cells → lower random-click probability.
// Total eggs = sum(counts) = 6+3+13+13+11+13+11+6+13+11 = 100.

export type Egg = {
  id: number;
  n: number;
  x: number;  // [0, 1]
  y: number;  // can be < 0 or > 1 (spills into slide 8 / 10)
};

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gauss(rand: () => number) {
  let u = 0, v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export const EGGS: Egg[] = (() => {
  const rand = mulberry32(20260415);
  const eggs: Egg[] = [];
  for (const theme of V1_THEMES) {
    for (let i = 0; i < theme.count; i++) {
      const x = Math.max(0.01, Math.min(0.99, theme.cx + gauss(rand) * theme.sigma));
      const y = theme.cy + gauss(rand) * theme.sigma;
      eggs.push({ id: eggs.length, n: theme.n, x, y });
    }
  }
  return eggs;
})();
