// /17 funnel router. Detects which audience a visitor is in (via ?for=X,
// ?utm_source=X, or document.referrer) and returns a curated cut + whisper.
// Falls back to a seeded shuffle for unknown referrers.

export type FunnelId = "sep" | "debate" | "fintwit" | "ai" | "poly" | "keys" | "default";

export type FunnelCut = {
  id: FunnelId;
  label: string;              // shown in top chrome, lowercase
  whisper: string;            // the post-boot title line, the whole pitch in one breath
  subWhisper?: string;        // smaller second line
  scenes: string[];           // ordered scene ids
  nextUrl: { href: string; label: string }; // where they go after the coda
};

// Scene ids defined in Trailer.tsx
export const ALL_SCENE_IDS = [
  "shotmeter",
  "matrix",
  "iverson",
  "eeao",
  "lasso",
  "roosevelt",
  "moneyball",
];

export const FUNNELS: Record<FunnelId, FunnelCut> = {
  sep: {
    id: "sep",
    label: "cut · for sep",
    whisper: "résumés lie. commit counts don't.",
    subWhisper: "sep keeps the receipt.",
    scenes: ["iverson", "moneyball", "roosevelt", "eeao"],
    nextUrl: { href: "/pitch", label: "the pitch →" },
  },
  debate: {
    id: "debate",
    label: "cut · for the circuit",
    whisper: "better debating means less intervention.",
    subWhisper: "the paradigm is the ballot. the logbook is the flow.",
    scenes: ["iverson", "moneyball", "eeao", "roosevelt"],
    nextUrl: { href: "/letters/paradigm", label: "the paradigm →" },
  },
  fintwit: {
    id: "fintwit",
    label: "cut · for fintwit",
    whisper: "$3,453.83. real money. no course.",
    subWhisper: "the L's get the same clock as the W's.",
    scenes: ["moneyball", "shotmeter", "iverson", "eeao"],
    nextUrl: { href: "/letters/round-0", label: "the pre-mortem →" },
  },
  ai: {
    id: "ai",
    label: "cut · for the builders",
    whisper: "the ai wrote this paragraph and signed it.",
    subWhisper: "dye in the water. not the poison.",
    scenes: ["matrix", "eeao", "shotmeter", "moneyball"],
    nextUrl: { href: "/letters/v1", label: "the colophon →" },
  },
  poly: {
    id: "poly",
    label: "cut · for the polymaths",
    whisper: "a polymath has been many people.",
    subWhisper: "ρ < 1 is why you get to be many things.",
    scenes: ["matrix", "shotmeter", "roosevelt", "lasso"],
    nextUrl: { href: "/letters/math", label: "the math →" },
  },
  keys: {
    id: "keys",
    label: "cut · for the inheritors",
    whisper: "the presidency is not the product.",
    subWhisper: "the year is. the keys are the hand-off.",
    scenes: ["roosevelt", "iverson", "eeao", "lasso"],
    nextUrl: { href: "/keys", label: "the keys →" },
  },
  default: {
    id: "default",
    label: "cut · seeded random",
    whisper: "$3,453.83 → seventeen.",
    subWhisper: "one cut, from quant to artistic. reload for another.",
    scenes: [], // filled by seeded shuffle
    nextUrl: { href: "/", label: "home →" },
  },
};

// Deterministic shuffle. Same seed ⇒ same cut.
export function seededShuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  let s = seed + 1;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Infer a funnel from ?for=, ?utm_source=, or document.referrer.
export function detectFunnel(params: URLSearchParams, referrer: string): FunnelId {
  const explicit = (params.get("for") || params.get("utm_source") || "").toLowerCase();
  if (explicit in FUNNELS) return explicit as FunnelId;

  const r = referrer.toLowerCase();
  if (!r) return "default";
  if (r.includes("tabroom") || r.includes("debate")) return "debate";
  if (r.includes("polymarket") || r.includes("kalshi") || r.includes("stocktwits") || r.includes("reddit.com/r/wallstreetbets")) return "fintwit";
  if (r.includes("news.ycombinator") || r.includes("anthropic") || r.includes("openai.com")) return "ai";
  if (r.includes("sepatucla") || r.includes("ucla.edu")) return "sep";
  if (r.includes("paulgraham") || r.includes("marginalrevolution") || r.includes("astralcodex")) return "poly";
  if (r.includes("aureliex.com/pitch") || r.includes("aureliex.com/6969")) return "keys";
  // x.com / twitter.com gets the default seeded cut — too ambiguous to infer
  return "default";
}
