"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  HUNT_CONSOLE_FLAG,
  HUNT_EGGS,
  HUNT_TOTAL,
  HUNT_PHONE_DISPLAY,
  HUNT_PHONE_SMS,
  KALSHI_URL,
  WAYMO_CODE,
  WAYMO_URL,
  GET_LUCKY_SPOTIFY,
  GET_LUCKY_SMS,
  getEgg,
  readUnlocked,
  writeUnlocked,
  type HuntEgg,
} from "@/lib/hunt";

// Site-wide easter-egg hunt. Listens for four global triggers and renders
// a reward overlay when one fires. Mounted once, from the root layout.
//
//   konami (↑↑↓↓←→←→BA) ......... unlocks the Kalshi bankroll egg
//   triple-click the masthead dot. unlocks the Waymo bankroll egg
//   type "bankroll" anywhere ...... unlocks a lore egg + points to ledger
//   url hash #please .............. unlocks a lore egg + points to ledger
//   type "getlucky" anywhere ...... unlocks the Daft Punk ping — opens an
//                                    SMS composer pre-filled with the
//                                    Spotify link back to my number.
//   (the "bounce" meta egg is fired from MetaEgg when music is playing
//    and the reader scrolls top→bottom→top)
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
};
const TYPED_MAX = 24; // rolling buffer of recent alpha keys
const DOT_TRIPLE_WINDOW_MS = 700;

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
          "%c// there is a hunt. six eggs. two of them pay real money. one plays a song.",
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

  // triple-click on the masthead dot
  useEffect(() => {
    let clicks: number[] = [];
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      if (!t.classList.contains("dot")) return;
      const parent = t.parentElement;
      if (!parent || !parent.classList.contains("wordmark")) return;
      const now = Date.now();
      clicks = [...clicks.filter((ts) => now - ts < DOT_TRIPLE_WINDOW_MS), now];
      if (clicks.length >= 3) {
        clicks = [];
        fire("thedot");
      }
    };
    window.addEventListener("click", onClick, true);
    return () => window.removeEventListener("click", onClick, true);
  }, [fire]);

  // url hash triggers — #please and /hunt direct link
  useEffect(() => {
    const onHash = () => {
      const h = window.location.hash.toLowerCase();
      if (h === "#please") fire("please");
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
              this one pays. <strong>kalshi</strong> gives us <strong>$25 each</strong> when you
              sign up with my link and place a trade.
            </p>
            <a
              className="hunt-card-cta"
              href={KALSHI_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              open kalshi · claim $25 <span aria-hidden="true">↗</span>
            </a>
            <p className="hunt-card-payout-how">
              once the trade settles, <a className="hunt-card-phone" href={HUNT_PHONE_SMS}>text me at {HUNT_PHONE_DISPLAY}</a>.
              pick your payout: <em>cash</em> or <em>the same $25 in portfolio equity</em>.
              i&rsquo;ll confirm it&rsquo;s yours, on the record.
            </p>
          </div>
        ) : egg.reward === "waymo" ? (
          <div className="hunt-card-payout">
            <p className="hunt-card-payout-line">
              this one pays. <strong>waymo</strong> gives you <strong>$10 off your first ride</strong> with my code.
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
            <p className="hunt-card-payout-how">
              after the ride, <a className="hunt-card-phone" href={HUNT_PHONE_SMS}>text me at {HUNT_PHONE_DISPLAY}</a>.
              pick your payout: <em>$10 cash</em> or <em>$10 in portfolio equity</em>.
              i&rsquo;ll post the receipt.
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
              no money on this one — yet. two of the six eggs <em>do</em> pay. find those and
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
