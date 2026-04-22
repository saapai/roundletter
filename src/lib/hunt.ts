// The hunt — site-wide easter-egg ledger.
//
// Two of these eggs pay out real bankroll: the Kalshi sign-up pair gives the
// finder and me $25 each; the Waymo referral gives the finder $10 off their
// first ride. Either way, the finder texts the phone below when the trade or
// ride is done, and I send over cash (or the equivalent in portfolio equity,
// their choice). The remaining eggs are lore + hints that lead to the ledger.
//
// Storage is localStorage-only — no server round-trip. The finder can wipe
// their own progress by clearing site data; nothing is published about who
// has found what.

export const HUNT_STORAGE_KEY = "hunt:v1:unlocked";
export const HUNT_CONSOLE_FLAG = "hunt:v1:greeted";

export const HUNT_PHONE_DISPLAY = "+1 (385) 368-7238";
export const HUNT_PHONE_TEL = "+13853687238";
export const HUNT_PHONE_SMS = "sms:+13853687238";

export const KALSHI_URL =
  "https://kalshi.com/sign-up/?referral=cfbb33c1-d479-43e3-981b-b10bca851295&m=true";
export const WAYMO_URL = "https://waymo.smart.link/4pcoqniy5?code=SAATHVS7DT";
export const WAYMO_CODE = "SAATHVS7DT";

// Spotify deep-search URL — resolves to the Daft Punk / Pharrell track as the
// top result in the Spotify app and the website. A search URL is used rather
// than a track id because search ids are deterministic and don't rot.
export const GET_LUCKY_SPOTIFY =
  "https://open.spotify.com/search/Daft%20Punk%20Get%20Lucky";

// Pre-filled SMS composer: opens the native messages app with the number and
// body pre-populated. Tapping it on mobile dials straight in; on desktop it
// either hands to an SMS-capable app or is a silent no-op.
export const GET_LUCKY_SMS_BODY =
  encodeURIComponent(`got lucky · ${GET_LUCKY_SPOTIFY}`);
export const GET_LUCKY_SMS = `sms:+13853687238?&body=${GET_LUCKY_SMS_BODY}`;

// Ted Lasso ownership egg. Finders text saapai a piece of Ted Lasso-related
// writing, analysis, or art. Ownership share is undecided at discovery —
// settled case-by-case over text when saapai reads what they sent.
export const LASSO_SMS_BODY = encodeURIComponent(
  `ted lasso · [paste your writing, analysis, or art here — or attach a link]`,
);
export const LASSO_SMS = `sms:+13853687238?&body=${LASSO_SMS_BODY}`;

// "Call Me If You Get Lost" egg (Tyler, the Creator · 2021).
// Someone lands on a wrong numeric route — /67, /420, /6767, /6769, /677777.
// They "got lost." The reward is the album's title as a literal CTA —
// a tel: link that dials saapai's number.
export const HUNT_PHONE_TEL_LINK = HUNT_PHONE_TEL.startsWith("tel:")
  ? HUNT_PHONE_TEL
  : `tel:${HUNT_PHONE_TEL}`;

export type HuntReward =
  | "kalshi"
  | "waymo"
  | "lucky"
  | "lasso"
  | "lost"
  | "lore";

export type HuntEgg = {
  id: string;
  // one-line name shown on the ledger + in the reward overlay
  name: string;
  // where/how it fires, shown as a faint hint after the egg is found
  origin: string;
  // flavor line shown once the egg is caught
  flavor: string;
  // what kind of payout this egg gives
  reward: HuntReward;
  // difficulty marker on the ledger: higher = rarer
  rarity: 1 | 2 | 3;
};

export const HUNT_EGGS: HuntEgg[] = [
  {
    id: "konami",
    name: "the old password",
    origin:
      "desktop · ↑ ↑ ↓ ↓ ← → ← → b a · mobile · swipe ↑ ↑ ↓ ↓ · url · #stranger",
    flavor: "you typed the old password. of course it still works.",
    reward: "kalshi",
    rarity: 3,
  },
  {
    id: "thedot",
    name: "the rust dot",
    origin:
      "desktop · triple-click the period · mobile · triple-tap or long-press · url · #ride",
    flavor: "the punctuation always meant something.",
    reward: "waymo",
    rarity: 2,
  },
  {
    id: "bankroll",
    name: "the word itself",
    origin: "desktop · type b a n k r o l l · mobile · url #bankroll",
    flavor: "you said the quiet part out loud.",
    reward: "lore",
    rarity: 2,
  },
  {
    id: "please",
    name: "the polite one",
    origin: "any url · #please",
    flavor: "ask and you shall receive a hint.",
    reward: "lore",
    rarity: 1,
  },
  {
    id: "lucky",
    name: "get lucky",
    origin:
      "desktop · type g e t l u c k y · mobile · double-tap the wordmark · or shake the phone · url · #song",
    flavor: "we're up all night to get lucky. you found it.",
    reward: "lucky",
    rarity: 2,
  },
  {
    id: "meta",
    name: "the bounce",
    origin: "while music plays · top → bottom → top",
    flavor: "you read the document in one breath.",
    reward: "lore",
    rarity: 3,
  },
  {
    id: "numbers",
    name: "call me if you get lost",
    origin:
      "visit any of · /67 · /420 · /6767 · /6769 · /677777 · (/6969 is the real one)",
    flavor: "tyler said it first — call me if you get lost.",
    reward: "lost",
    rarity: 1,
  },
  {
    id: "lasso",
    name: "believe",
    origin:
      "desktop · type l a s s o · mobile · url #lasso · or text me a ted-lasso-related piece",
    flavor: "be a goldfish. you found the one that trades in care.",
    reward: "lasso",
    rarity: 2,
  },
];

export const HUNT_TOTAL = HUNT_EGGS.length;

export function getEgg(id: string): HuntEgg | undefined {
  return HUNT_EGGS.find((e) => e.id === id);
}

export function readUnlocked(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(HUNT_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((x): x is string => typeof x === "string"));
  } catch {
    return new Set();
  }
}

export function writeUnlocked(set: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      HUNT_STORAGE_KEY,
      JSON.stringify(Array.from(set)),
    );
  } catch {
    /* storage blocked — finder can still see the overlay, just no persistence */
  }
}
