"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  HUNT_CONSOLE_FLAG,
  HUNT_EGGS,
  HUNT_TOTAL,
  HUNT_PHONE_DISPLAY,
  HUNT_PHONE_SMS,
  HUNT_PHONE_TEL_LINK,
  KALSHI_URL,
  WAYMO_CODE,
  WAYMO_URL,
  GET_LUCKY_SPOTIFY,
  GET_LUCKY_SMS,
  LASSO_SMS,
  getEgg,
  readUnlocked,
  writeUnlocked,
  type HuntEgg,
} from "@/lib/hunt";

// Site-wide easter-egg hunt. Every trigger has a desktop-friendly and a
// mobile-friendly path, and any URL hash route works as a universal backup.
// Rendered once, from the root layout.
//
//   KALSHI ($25) ────────────────────
//     desktop · konami (↑↑↓↓←→←→BA) on any page
//     mobile  · swipe sequence ↑↑↓↓ anywhere
//     url     · any page + #stranger
//
//   WAYMO ($10) ─────────────────────
//     desktop · triple-click the rust period after aureliex.
//     mobile  · long-press that period · or triple-tap it
//     url     · any page + #ride
//
//   GET LUCKY (Daft Punk · SMS) ─────
//     desktop · type "getlucky" on any page
//     mobile  · double-tap the aureliex wordmark · or shake the phone
//     url     · any page + #song
//
//   LORE · BANKROLL ─────────────────
//     type "bankroll" on desktop · #bankroll on mobile
//
//   LORE · PLEASE ───────────────────
//     hash #please on any url
//
//   META · THE BOUNCE ───────────────
//     existing MetaEgg top↔bottom scroll with music playing
//
// Ledger of what the browser has found: /6969#hunt.

const KONAMI: string[] = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];
const TYPED_TARGETS: Record<string, string> = {
  bankroll: "bankroll",
  getlucky: "lucky",
  lasso: "lasso",
};
const TYPED_MAX = 24; // rolling buffer of recent alpha keys
const DOT_TRIPLE_WINDOW_MS = 700;
const LONG_PRESS_MS = 650;
const DOUBLE_TAP_MS = 420;
const SWIPE_MIN_PX = 40;
const SWIPE_TIMEOUT_MS = 4500; // 4-swipe sequence must land inside this window

// mobile swipe-konami: ↑↑↓↓ anywhere triggers the kalshi egg
const SWIPE_KONAMI: Array<"up" | "down"> = ["up", "up", "down", "down"];

// url hash routes for eggs (universal, mobile-friendly)
const HASH_ROUTES: Record<string, string> = {
  "#please": "please",
  "#stranger": "konami",
  "#ride": "thedot",
  "#song": "lucky",
  "#lucky": "lucky",
  "#bankroll": "bankroll",
  // numeric-route family — all land on /6969 with one of these hashes
  "#number-67": "numbers",
  "#number-420": "numbers",
  "#number-6767": "numbers",
  "#number-6769": "numbers",
  "#number-677777": "numbers",
  "#lasso": "lasso",
  "#tedlasso": "lasso",
};

// shake detection for get lucky: 3 motion spikes inside 1.6s
const SHAKE_THRESHOLD = 18; // m/s² magnitude above gravity baseline
const SHAKE_WINDOW_MS = 1600;
const SHAKE_SPIKES_NEEDED = 3;

declare global {
  interface Window {
    __hunt?: {
      found: () => string[];
      fire: (id: string) => void;
      all: () => HuntEgg[];
    };
  }
}

export default function HuntProvider() {
  const [unlocked, setUnlocked] = useState<Set<string>>(() => new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const unlockedRef = useRef(unlocked);
  unlockedRef.current = unlocked;

  const fire = useCallback((id: string) => {
    const egg = getEgg(id);
    if (!egg) return;
    const next = new Set(unlockedRef.current);
    const already = next.has(id);
    next.add(id);
    setUnlocked(next);
    writeUnlocked(next);
    setActiveId(id);
    if (typeof document !== "undefined") {
      document.body.classList.add("hunt-fired");
      window.setTimeout(() => {
        document.body.classList.remove("hunt-fired");
      }, 900);
    }
    if (!already && typeof console !== "undefined") {
      console.log(
        `%c// hunt · ${egg.name} · ${
          unlockedRef.current.size + 1
        }/${HUNT_TOTAL}`,
        "color:#8B3A2E;font-family:serif;font-style:italic;",
      );
    }
  }, []);

  const close = useCallback(() => setActiveId(null), []);

  // hydrate from storage + publish the window handle + greet once
  useEffect(() => {
    const initial = readUnlocked();
    setUnlocked(initial);

    window.__hunt = {
      found: () => Array.from(unlockedRef.current),
      fire,
      all: () => HUNT_EGGS.slice(),
    };

    try {
      const greeted = window.sessionStorage.getItem(HUNT_CONSOLE_FLAG);
      if (!greeted) {
        window.sessionStorage.setItem(HUNT_CONSOLE_FLAG, "1");
        const tag = "color:#8B3A2E;font-family:serif;font-style:italic;";
        const hint = "color:#6B6560;font-family:serif;";
        console.log("%c// you're reading the document in the console.", tag);
        console.log(
          "%c// there is a hunt. seven eggs. two pay real money (up to $50 + $20). one plays a song.",
          hint,
        );
        console.log("%c// try window.__hunt.found()", hint);
      }
    } catch {
      /* sessionStorage blocked — skip the console greeting */
    }

    return () => {
      if (window.__hunt) delete window.__hunt;
    };
    // fire is stable — depending on it is safe.
  }, [fire]);

  // konami
  useEffect(() => {
    let i = 0;
    const onKey = (e: KeyboardEvent) => {
      const expected = KONAMI[i];
      const pressed = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (pressed === expected) {
        i += 1;
        if (i >= KONAMI.length) {
          i = 0;
          fire("konami");
        }
      } else {
        // lenient restart: if the miskey could be the start of the sequence,
        // reset to 1 instead of 0 so partial overlap still counts.
        i = pressed === KONAMI[0] ? 1 : 0;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fire]);

  // typed word rolling-buffer
  useEffect(() => {
    let buf = "";
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.length !== 1) return;
      if (!/[a-zA-Z]/.test(e.key)) return;
      buf = (buf + e.key.toLowerCase()).slice(-TYPED_MAX);
      for (const [needle, id] of Object.entries(TYPED_TARGETS)) {
        if (buf.endsWith(needle)) {
          fire(id);
          buf = "";
          break;
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fire]);

  // masthead dot: triple-click/tap + long-press (waymo)
  useEffect(() => {
    let clicks: number[] = [];
    const isDot = (el: EventTarget | null): boolean => {
      const t = el as HTMLElement | null;
      if (!t || !t.classList || !t.classList.contains("dot")) return false;
      const parent = t.parentElement;
      return !!(parent && parent.classList.contains("wordmark"));
    };
    const onClick = (e: MouseEvent) => {
      if (!isDot(e.target)) return;
      const now = Date.now();
      clicks = [...clicks.filter((ts) => now - ts < DOT_TRIPLE_WINDOW_MS), now];
      if (clicks.length >= 3) {
        clicks = [];
        fire("thedot");
      }
    };

    let pressTimer: number | null = null;
    const onTouchStart = (e: TouchEvent) => {
      if (!isDot(e.target)) return;
      if (pressTimer != null) window.clearTimeout(pressTimer);
      pressTimer = window.setTimeout(() => {
        fire("thedot");
        pressTimer = null;
      }, LONG_PRESS_MS);
    };
    const cancelPress = () => {
      if (pressTimer != null) {
        window.clearTimeout(pressTimer);
        pressTimer = null;
      }
    };

    window.addEventListener("click", onClick, true);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", cancelPress, { passive: true });
    window.addEventListener("touchcancel", cancelPress, { passive: true });
    window.addEventListener("touchmove", cancelPress, { passive: true });
    return () => {
      cancelPress();
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", cancelPress);
      window.removeEventListener("touchcancel", cancelPress);
      window.removeEventListener("touchmove", cancelPress);
    };
  }, [fire]);

  // wordmark double-tap (get lucky, mobile-first)
  useEffect(() => {
    const isWordmarkText = (el: EventTarget | null): boolean => {
      const t = el as HTMLElement | null;
      if (!t) return false;
      // allow the Link or any non-dot child of .wordmark
      const wordmark = (t.closest && t.closest(".wordmark")) as HTMLElement | null;
      if (!wordmark) return false;
      // ignore hits on the rust dot — that's the waymo trigger
      if ((t as HTMLElement).classList?.contains("dot")) return false;
      return true;
    };
    let lastTap = 0;
    const onClick = (e: MouseEvent) => {
      if (!isWordmarkText(e.target)) return;
      const now = Date.now();
      if (now - lastTap < DOUBLE_TAP_MS) {
        lastTap = 0;
        e.preventDefault();
        fire("lucky");
        return;
      }
      lastTap = now;
    };
    // capture phase so we can preventDefault the navigation on the 2nd tap
    window.addEventListener("click", onClick, true);
    return () => window.removeEventListener("click", onClick, true);
  }, [fire]);

  // mobile swipe-konami: ↑↑↓↓ anywhere (kalshi)
  useEffect(() => {
    let start: { x: number; y: number; t: number } | null = null;
    let seq: Array<"up" | "down"> = [];
    let seqStartedAt = 0;

    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      start = { x: t.clientX, y: t.clientY, t: Date.now() };
    };
    const onEnd = (e: TouchEvent) => {
      if (!start) return;
      const t = e.changedTouches[0];
      if (!t) { start = null; return; }
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      start = null;
      if (Math.abs(dy) < SWIPE_MIN_PX) return;
      if (Math.abs(dy) <= Math.abs(dx)) return; // ignore horizontal swipes
      const dir: "up" | "down" = dy < 0 ? "up" : "down";
      const now = Date.now();
      if (seq.length === 0 || now - seqStartedAt > SWIPE_TIMEOUT_MS) {
        seq = [dir];
        seqStartedAt = now;
      } else {
        seq.push(dir);
      }
      // compare to prefix of SWIPE_KONAMI
      for (let i = 0; i < seq.length; i++) {
        if (seq[i] !== SWIPE_KONAMI[i]) {
          // mismatch: restart with this swipe if it's the sequence head
          seq = seq[seq.length - 1] === SWIPE_KONAMI[0] ? [seq[seq.length - 1]] : [];
          seqStartedAt = now;
          return;
        }
      }
      if (seq.length >= SWIPE_KONAMI.length) {
        seq = [];
        fire("konami");
      }
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
    };
  }, [fire]);

  // shake detection for get lucky (mobile, best-effort — iOS requires
  // an explicit permission grant; we silently opt out if unavailable).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("DeviceMotionEvent" in window)) return;
    // iOS 13+: DeviceMotionEvent.requestPermission exists. We don't ask —
    // silent no-op is better than a popup the user didn't trigger.
    const Ctor = (window as unknown as { DeviceMotionEvent: { requestPermission?: () => Promise<string> } }).DeviceMotionEvent;
    if (Ctor && typeof Ctor.requestPermission === "function") return;

    let spikes: number[] = [];
    const onMotion = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity;
      if (!a) return;
      const mag = Math.sqrt((a.x ?? 0) ** 2 + (a.y ?? 0) ** 2 + (a.z ?? 0) ** 2);
      // gravity baseline ~9.8 → subtract and look at residual
      const residual = Math.abs(mag - 9.8);
      if (residual < SHAKE_THRESHOLD) return;
      const now = Date.now();
      spikes = [...spikes.filter((ts) => now - ts < SHAKE_WINDOW_MS), now];
      if (spikes.length >= SHAKE_SPIKES_NEEDED) {
        spikes = [];
        fire("lucky");
      }
    };
    window.addEventListener("devicemotion", onMotion);
    return () => window.removeEventListener("devicemotion", onMotion);
  }, [fire]);

  // url hash triggers — each egg has a short universal route
  useEffect(() => {
    const onHash = () => {
      const h = window.location.hash.toLowerCase();
      const id = HASH_ROUTES[h];
      if (id) fire(id);
    };
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [fire]);

  if (!activeId) return null;
  const egg = getEgg(activeId);
  if (!egg) return null;
  return (
    <HuntOverlay
      egg={egg}
      foundCount={unlocked.size}
      onClose={close}
    />
  );
}

function HuntOverlay({
  egg,
  foundCount,
  onClose,
}: {
  egg: HuntEgg;
  foundCount: number;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="hunt-overlay" role="dialog" aria-modal="true">
      <button
        type="button"
        className="hunt-overlay-scrim"
        aria-label="close"
        onClick={onClose}
      />
      <div className="hunt-card">
        <div className="hunt-card-eyebrow">
          <span className="hunt-card-dot" aria-hidden="true" />
          hunt · egg caught · {foundCount}/{HUNT_TOTAL}
        </div>
        <h2 className="hunt-card-title">
          <em>{egg.name}.</em>
        </h2>
        <p className="hunt-card-flavor"><em>{egg.flavor}</em></p>

        {egg.reward === "kalshi" ? (
          <div className="hunt-card-payout">
            <p className="hunt-card-payout-line">
              this one pays twice. first, <strong>$25 from kalshi</strong> (their
              standard referral). second — and the interesting one — every
              successful referral under this egg contributes to a single public
              pool. when the pool caps at <strong>$1,000</strong> (40 finders,
              $25 each), the pool owns{" "}
              <strong>10% of the kalshi portfolio</strong>, split evenly among
              all finders. fewer finders → bigger share each. eight finders = each
              owns <strong>1.25%</strong>. forty = each owns <strong>0.25%</strong>.
            </p>
            <a
              className="hunt-card-cta"
              href={KALSHI_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              open kalshi · claim $25 <span aria-hidden="true">↗</span>
            </a>
            <ol className="hunt-card-steps">
              <li>sign up with the link above — the referral tag has to be on the url, not a plain kalshi.com visit.</li>
              <li>deposit and place <em>a real trade</em>. kalshi credits{" "}
                <strong>$25 to each of us</strong> once it settles.</li>
              <li><a className="hunt-card-phone" href={HUNT_PHONE_SMS}>text me at {HUNT_PHONE_DISPLAY}</a> with a screenshot of your first trade and the name you want on the ledger. you&rsquo;re now a partial owner of the kalshi book.</li>
            </ol>
            <p className="hunt-card-rules">
              <em>rules · kalshi side is their standard referral; terms at kalshi.com/help (regions, kyc, their changes apply). my side: 10% of the kalshi portfolio goes to finders as a group, capped at $1,000 total kalshi payouts (40 finders). good-faith sign-ups only — no self-referrals, no alt accounts. ownership math settles at each monthly rebalance and at round close. want to invest more than the referral $25 into the kalshi / polymarket / stock book? text me — negotiated one-on-one.</em>
            </p>
            <p className="hunt-card-lasso">
              <em>be a goldfish. — ted lasso</em>
            </p>
          </div>
        ) : egg.reward === "waymo" ? (
          <div className="hunt-card-payout">
            <p className="hunt-card-payout-line">
              this one pays monthly. waymo&rsquo;s promo is{" "}
              <strong>$10 off per month</strong> as long as you ride with my
              code. for each month you ride, <strong>0.5% of the waymo
              portfolio</strong> goes into the finders pool, split evenly among
              whoever rode that month. ride in more months = more months of
              share.
            </p>
            <div className="hunt-card-code">
              <span className="hunt-card-code-label">code</span>
              <span className="hunt-card-code-val">{WAYMO_CODE}</span>
            </div>
            <a
              className="hunt-card-cta"
              href={WAYMO_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              open waymo · redeem <span aria-hidden="true">↗</span>
            </a>
            <ol className="hunt-card-steps">
              <li>download waymo one (ios / android).</li>
              <li>apply <strong>{WAYMO_CODE}</strong> as your referral on sign-up — or use the url above, which pre-fills it.</li>
              <li>ride. each month you ride, waymo knocks <strong>$10 off</strong> one fare.</li>
              <li><a className="hunt-card-phone" href={HUNT_PHONE_SMS}>text me at {HUNT_PHONE_DISPLAY}</a> with a receipt the first month. i&rsquo;ll add you to the ledger. your 0.5%/month share settles at each monthly rebalance.</li>
            </ol>
            <p className="hunt-card-rules">
              <em>rules · waymo credit applies in waymo one service areas (sf / phoenix / la and growing); terms at waymo.com. my side: 0.5% of the waymo portfolio per month, split across active riders that month. pool has no hard cap — this one rewards repeat rides. want to invest more than the referral into the waymo / stock / polymarket book? text me.</em>
            </p>
            <p className="hunt-card-lasso">
              <em>believe. — ted lasso</em>
            </p>
          </div>
        ) : egg.reward === "lost" ? (
          <div className="hunt-card-payout">
            <p className="hunt-card-payout-line">
              you hit the wrong number. the right one is <strong>6969</strong>.
              but tyler, the creator already wrote the instruction for this
              exact moment — <em>call me if you get lost.</em>
            </p>
            <a className="hunt-card-cta" href={HUNT_PHONE_TEL_LINK}>
              call {HUNT_PHONE_DISPLAY} <span aria-hidden="true">↗</span>
            </a>
            <p className="hunt-card-payout-how">
              or <a className="hunt-card-phone" href={HUNT_PHONE_SMS}>text me at {HUNT_PHONE_DISPLAY}</a>.
              either way i&rsquo;ll point you at the real{" "}
              <a className="hunt-card-phone" href="/6969#hunt">/6969#hunt</a> and
              tell you which egg the neighborhood leads to next.
            </p>
            <p className="hunt-card-rules">
              <em>rules · not a bankroll egg. but call once and i answer. (referencing <strong>call me if you get lost</strong> · tyler, the creator · 2021.)</em>
            </p>
          </div>
        ) : egg.reward === "lasso" ? (
          <div className="hunt-card-payout">
            <p className="hunt-card-payout-line">
              <strong>believe.</strong> text me a piece of ted lasso — writing,
              analysis, or art you made. ownership share is{" "}
              <em>undecided at discovery</em>: we negotiate by text once i read
              what you sent. the good ones land in the art portfolio (coming
              soon) and earn a slice of that book.
            </p>
            <a className="hunt-card-cta" href={LASSO_SMS}>
              text me your lasso <span aria-hidden="true">→</span>
            </a>
            <ol className="hunt-card-steps">
              <li>make or paste the piece in the message body — short or long is fine. attach images as mms.</li>
              <li>send to <a className="hunt-card-phone" href={HUNT_PHONE_SMS}>{HUNT_PHONE_DISPLAY}</a>.</li>
              <li>i reply within 48 hours with an offer (cash, portfolio equity, or art-portfolio equity). you accept, counter, or walk.</li>
            </ol>
            <p className="hunt-card-rules">
              <em>rules · original work only — if you&rsquo;re referencing someone else&rsquo;s, credit them in-line. analysis of any ted lasso episode, character, or screenwriting beat counts. my reply is the deal — nothing is owed until both sides text &ldquo;yes.&rdquo;</em>
            </p>
          </div>
        ) : egg.reward === "lucky" ? (
          <div className="hunt-card-payout">
            <p className="hunt-card-payout-line">
              <strong>daft punk · pharrell · 2013.</strong> press the button — it
              opens your messages with the song and my number. hit send and
              i&rsquo;ll know a stranger heard it too.
            </p>
            <a className="hunt-card-cta" href={GET_LUCKY_SMS}>
              text me the song <span aria-hidden="true">→</span>
            </a>
            <p className="hunt-card-payout-how">
              sms composer opens with{" "}
              <a
                className="hunt-card-phone"
                href={GET_LUCKY_SPOTIFY}
                target="_blank"
                rel="noopener noreferrer"
              >
                the spotify link
              </a>{" "}
              already in the body and {HUNT_PHONE_DISPLAY} in the to-line. no
              money on this one — just a small, silly ping.
            </p>
          </div>
        ) : (
          <div className="hunt-card-lore">
            <p className="hunt-card-lore-line">
              no money on this one — yet. two of the seven eggs <em>do</em> pay (up to $50 on
              kalshi, $20 on waymo — their promo stacked with mine). find those and
              you claim real bankroll.
            </p>
            <p className="hunt-card-lore-hint">
              the ledger of what you&rsquo;ve found lives at{" "}
              <a href="/6969#hunt">/6969#hunt</a>.
            </p>
          </div>
        )}

        <div className="hunt-card-foot">
          <span className="hunt-card-origin"><em>origin · {egg.origin}</em></span>
          <button type="button" className="hunt-card-close" onClick={onClose}>
            close
          </button>
        </div>
      </div>
    </div>
  );
}
