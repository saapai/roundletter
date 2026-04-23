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

// Bird scooters — third transport-stack referral.  Pattern mirrors the
// waymo egg: standard referral credit from bird + a bonus from me,
// text-verified.
export const BIRD_URL = "https://links.bird.co/LfJg8T";

// Spotify deep-search URL — resolves to the Daft Punk / Pharrell track as the
// top result in the Spotify app and the website. A search URL is used rather
// than a track id because search ids are deterministic and don't rot.
export const GET_LUCKY_SPOTIFY =
  "https://open.spotify.com/search/Daft%20Punk%20Get%20Lucky";

// "The second pair" — two YouTube videos saapai sent in. Panel voted to
// fold them into a single egg rather than inflating the hunt by two.
// Copy intentionally neutral ("the recording") until saapai confirms
// titles; see docs/BANK.md for the thematic slot.
export const SECOND_PAIR_A_ID = "_3PIkV2anqk";
export const SECOND_PAIR_B_ID = "GGopj8gp2gE";
export const SECOND_PAIR_A = `https://www.youtube.com/watch?v=${SECOND_PAIR_A_ID}`;
export const SECOND_PAIR_B = `https://www.youtube.com/watch?v=${SECOND_PAIR_B_ID}`;

// Spray-paint video — how the piece gets made. Fired from a typed
// trigger + a hash.
export const SPRAYPAINT_VIDEO_ID = "RYRHal-e97Y";
export const SPRAYPAINT_VIDEO =
  `https://www.youtube.com/watch?v=${SPRAYPAINT_VIDEO_ID}`;

// Kanye rant — sits under the existing Ghost Town bookend register
// allusion. This egg plays the rant in-place when caught.
export const YE_RANT_VIDEO_ID = "ImHpFQSpl2k";
export const YE_RANT_VIDEO =
  `https://www.youtube.com/watch?v=${YE_RANT_VIDEO_ID}`;

// The autoplaying trailer-coda clip. Not an egg — embedded as a section
// right after the LaunchTrailer on the home page. Stored here so all
// video ids live in one place.
export const WATCH_CODA_VIDEO_ID = "-Xh5gMREXXQ";
export const WATCH_CODA_VIDEO =
  `https://www.youtube.com/watch?v=${WATCH_CODA_VIDEO_ID}`;

// Apparatus-prelude clip — a green, Spotify-meets-YouTube-meets-Apple-TV
// embed that sits above the aesthetic research curation on the home page.
export const APPARATUS_VIDEO_ID = "BFul90BFjGc";
export const APPARATUS_VIDEO =
  `https://www.youtube.com/watch?v=${APPARATUS_VIDEO_ID}`;

// Bottom-of-home pink-blush embed — styled to echo the fucking-beautiful
// trailer scene. Lives between apparatus and the dock as the page's coda.
export const BOTTOM_PINK_VIDEO_ID = "1dj1kCrUFCY";
export const BOTTOM_PINK_VIDEO =
  `https://www.youtube.com/watch?v=${BOTTOM_PINK_VIDEO_ID}`;

// Bookend top — Wesley Wang short film (the register the doc reads in).
export const WESLEY_WANG_VIDEO_ID = "hif5eI5pBxo";
// Bookend bottom — Kanye rant (same clip as the yerant hunt egg). The
// panel voted to keep them one video: the bookend is the public surface,
// the egg is the hidden unlock. Same recording, two different reading
// positions.
export const KANYE_BOOKEND_VIDEO_ID = YE_RANT_VIDEO_ID;

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
  | "bird"
  | "lucky"
  | "lasso"
  | "lost"
  | "video"
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
      "visit any of · /67 · /420 · /6767 · /6769 · /677777 · (/6969 is the real one) — each path shows a different poster variant in tribute to tyler, the creator's 2021 album art.",
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
  {
    id: "thechannel",
    name: "channel 69",
    origin:
      "desktop · mess with the tv knobs on the home page · click the channel dial until it lands.",
    flavor: "you turned the dial. the signal came back.",
    reward: "lore",
    rarity: 2,
  },
  {
    id: "spraypaint",
    name: "the can",
    origin:
      "type p a i n t · or url #spraypaint",
    flavor: "the can rehearses itself. watch.",
    reward: "video",
    rarity: 2,
  },
  {
    id: "yerant",
    name: "the rant",
    origin: "type y e r a n t · or url #yerant",
    flavor: "kanye on record. no edits, no moderator.",
    reward: "video",
    rarity: 2,
  },
  {
    id: "secondpair",
    name: "the second pair",
    origin:
      "type r e c o r d i n g s · or url #recordings · two videos, bound",
    flavor: "two more recordings. paired on purpose.",
    reward: "video",
    rarity: 2,
  },
  {
    id: "bird",
    name: "the scoot",
    origin: "desktop · type s c o o t · mobile · url #bird or #scoot",
    flavor: "wheels under the transport stack. free credit, text me for the bonus.",
    reward: "bird",
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
