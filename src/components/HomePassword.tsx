"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { POLYMARKET, V1_THEMES } from "@/lib/v1data";

// 10 single-character inputs at the top of the home page.
//
// Boxes NEVER prefill. Each visitor types from scratch.
//
// Global state (via abacus counter): once anyone types POLYMARKET correctly,
// /api/polymarket/solve flips the counter from 0 → 1. That first hit gets
// wasFirst=true — they see the Wordle×2K green animation. Every subsequent
// visitor just sees the word rendered as a permanent green link to /argument.

type GlobalState = { solved: boolean; count: number };

export default function HomePassword() {
  const router = useRouter();
  const [chars, setChars] = useState<string[]>(Array.from({ length: 10 }, () => ""));
  const [solvedLocally, setSolvedLocally] = useState(false);
  const [global, setGlobal] = useState<GlobalState | null>(null);
  const [playAnim, setPlayAnim] = useState(false);
  const [flipIndex, setFlipIndex] = useState(-1);
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  // Check global solve state on mount
  useEffect(() => {
    fetch("/api/polymarket", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((s: GlobalState | null) => {
        if (s) setGlobal(s);
      })
      .catch(() => {});
  }, []);

  // Watch for completed word
  useEffect(() => {
    const full = chars.join("");
    if (full === POLYMARKET && !solvedLocally) {
      setSolvedLocally(true);
      // cascade per-letter Wordle flip
      for (let i = 0; i < 10; i++) {
        setTimeout(() => setFlipIndex(i), i * 110);
      }
      // after cascade finishes, hit server
      setTimeout(() => {
        fetch("/api/polymarket/solve", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ password: full }),
        })
          .then((r) => (r.ok ? r.json() : null))
          .then((j) => {
            if (!j) return;
            setGlobal({ solved: true, count: j.count });
            if (j.wasFirst) {
              setPlayAnim(true);
              // after full celebration, route to the payoff — positions is
              // where the savings story actually lives
              setTimeout(() => router.push("/positions"), 3800);
            } else {
              // not first — straight through, no animation
              router.push("/positions");
            }
          })
          .catch(() => {});
      }, 10 * 110 + 200);
    }
  }, [chars, solvedLocally, router]);

  const onCharChange = (i: number, v: string) => {
    // Uppercase-normalize so "polymarket" (lowercase typing) also matches the
    // POLYMARKET constant. Previously only the CSS text-transform made it look
    // uppercase — the underlying value stayed lowercase and the compare failed.
    const c = v.slice(-1).toUpperCase();
    const next = [...chars];
    next[i] = c;
    setChars(next);
    if (c && i < 9) refs.current[i + 1]?.focus();
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !chars[i] && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === "ArrowLeft" && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < 9) {
      refs.current[i + 1]?.focus();
    }
  };

  // If someone has already solved globally, render just the green link —
  // no boxes, no animation. The word is the feature.
  if (global?.solved && !playAnim) {
    return (
      <div className="home-pw home-pw-global-solved">
        <p className="home-pw-label">// it has been solved.</p>
        <Link href="/argument" className="home-pw-green-link">
          POLYMARKET
        </Link>
      </div>
    );
  }

  return (
    <div className={`home-pw ${solvedLocally ? "is-solving" : ""}`}>
      <p className="home-pw-label">// 10 letters. find them. type them here.</p>
      <div className="home-pw-grid">
        {V1_THEMES.map((t, i) => {
          const correct = chars[i] === t.letter;
          const flipped = flipIndex >= i && solvedLocally;
          return (
            <input
              key={t.n}
              ref={(el) => {
                refs.current[i] = el;
              }}
              className={`home-pw-input ${correct ? "is-correct" : ""} ${flipped ? "is-flipped" : ""}`}
              type="text"
              maxLength={1}
              value={chars[i]}
              onChange={(e) => onCharChange(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              aria-label={`letter ${i + 1} of 10`}
              autoComplete="off"
              spellCheck={false}
              disabled={solvedLocally}
              style={{ ["--pw-green" as string]: t.green, ["--flip-delay" as string]: `${i * 110}ms` }}
            />
          );
        })}
      </div>
      {playAnim && <HomeGreen />}
    </div>
  );
}

// The 2K green: screen-wide ring burst + rainfall particles + final bloom.
// Fires only on the very first global solve.
function HomeGreen() {
  return (
    <div className="home-green">
      <div className="home-green-ring" />
      <div className="home-green-wave" />
      <div className="home-green-sparkles">
        {Array.from({ length: 40 }).map((_, i) => (
          <span key={i} style={{ ["--i" as string]: String(i) }} />
        ))}
      </div>
      <div className="home-green-rain">
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} style={{ ["--i" as string]: String(i) }} />
        ))}
      </div>
    </div>
  );
}
