"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { POLYMARKET, V1_THEMES } from "@/lib/v1data";
import { syncRiddleRound } from "@/lib/riddle-sync";

// (Legacy Props type for the killed /polymarket recursion maze has been
// removed. The card is now a plain Link to /positions.)

// Stateless POLYMARKET riddle at the top of the home page.
// Every page load starts with 10 empty boxes — NO prefill from v1-solved
// letters, NO localStorage for solved state, NO server hit. The only
// cross-component hint is the "what you've found" hangman row at the bottom
// of /positions, which reflects that viewer's own /v1/{n} solves.
//
// Typing POLYMARKET into the grid (case-insensitive, Wordle input) fires
// a per-letter cascade flip into green, then a full 2K celebration (ring
// burst + field-goal wave + FIFA confetti + Matrix rain), then swaps the
// boxes for a green pill link to /positions. On page refresh, everything
// resets — the boxes return. The experience is always fresh.

export default function HomePassword() {
  const router = useRouter();
  const [chars, setChars] = useState<string[]>(Array.from({ length: 10 }, () => ""));
  const [solved, setSolved] = useState(false);
  const [playAnim, setPlayAnim] = useState(false);
  const [flipIndex, setFlipIndex] = useState(-1);
  const [showLink, setShowLink] = useState(false);
  const [globalSolved, setGlobalSolved] = useState<boolean | null>(null);
  // Local-only retry mode: user clicked back from /positions (or clicked the
  // "try again" link on the card). We show the boxes again without changing
  // global state. Refresh → back to the card (fresh global check fires).
  const [retryLocal, setRetryLocal] = useState(false);
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    // Detect back/forward from /positions → show boxes again; other mounts
    // always start with empty boxes. Home wordle is stateless across
    // reloads by design — users retype POLYMARKET every visit.
    try {
      const entries = performance.getEntriesByType("navigation");
      const nav = entries[0] as PerformanceNavigationTiming | undefined;
      if (nav?.type === "back_forward") setRetryLocal(true);
    } catch {}
    syncRiddleRound();
    // globalSolved stays null intentionally — the card only shows after an
    // in-session local solve (showLink flips). Refresh resets.
    setGlobalSolved(false);
    // Also use a sessionStorage cache for speed (shorter TTL than sticky).
    try {
      const raw = sessionStorage.getItem("polymarket-global-cache");
      if (raw) {
        const cached = JSON.parse(raw) as { solved: boolean; _savedAt: number };
        if (cached._savedAt && Date.now() - cached._savedAt < 5 * 60 * 1000) {
          setGlobalSolved(cached.solved);
        }
      }
    } catch {}

    fetch("/api/polymarket", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { solved?: boolean } | null) => {
        const solved = !!(j && j.solved);
        setGlobalSolved(solved);
        try {
          sessionStorage.setItem(
            "polymarket-global-cache",
            JSON.stringify({ solved, _savedAt: Date.now() }),
          );
          if (solved) localStorage.setItem("polymarket-global-solved-sticky", "1");
        } catch {}
      })
      .catch(() => {
        // on network fail, keep whatever optimistic state we had
      });
  }, []);

  useEffect(() => {
    const full = chars.join("");
    if (full === POLYMARKET && !solved) {
      setSolved(true);
      for (let i = 0; i < 10; i++) {
        setTimeout(() => setFlipIndex(i), i * 110);
      }
      setTimeout(() => setPlayAnim(true), 400);
      setTimeout(() => setShowLink(true), 3800);
      // After the animation ends, exit retry mode — the card returns.
      setTimeout(() => setRetryLocal(false), 3900);
      // Only hit the server if this is the first global solve. If already
      // globally solved, retry is a client-only replay — no server write.
      if (!globalSolved) {
        // Optionally record the solve to the server for metrics, but don't
      // rely on it for UI state. Home wordle is per-user-per-session.
      fetch("/api/polymarket/solve", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password: full }),
        keepalive: true,
      }).catch(() => {});
      }
    }
  }, [chars, solved, globalSolved]);

  const onCharChange = (i: number, v: string) => {
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

  // Globally solved → always show the COMING SOON card. First visitor who
  // solves it in this session plays the animation first then sees the card.
  // Subsequent visitors (any device) skip the animation.
  if (globalSolved === null) {
    // still checking — render nothing to avoid a flash of boxes
    return <div className="home-pw" aria-hidden="true" />;
  }
  // Card shows when globally solved OR when this visitor just solved locally,
  // UNLESS they're in retry mode (came back from /positions or clicked the
  // "try again" link). Refresh clears retryLocal and the card returns.
  if ((globalSolved || showLink) && !retryLocal) {
    return (
      <div className="home-pw home-pw-global-solved">
        <Link href="/positions" className="coming-soon-trailer" aria-label="polymarket — coming soon">
          <span className="cst-coming">
            <span className="cst-coming-word">COMING</span>
            <span className="cst-coming-word cst-coming-word-2">SOON</span>
          </span>
          <span className="cst-polymarket">
            polymarket
            <span className="cst-cursor" aria-hidden="true" />
          </span>
          <span className="cst-tagline"><em>every revolution needs its counterculture.</em></span>
          <span className="cst-glow" aria-hidden="true" />
        </Link>
        <button
          type="button"
          className="home-pw-retry"
          onClick={(e) => {
            e.preventDefault();
            // reset local solve state so the boxes come back; global abacus
            // remains untouched. refresh still shows the card.
            setRetryLocal(true);
            setShowLink(false);
            setSolved(false);
            setFlipIndex(-1);
            setChars(Array.from({ length: 10 }, () => ""));
          }}
        >
          · try the riddle again ·
        </button>
      </div>
    );
  }

  return (
    <div className={`home-pw ${solved ? "is-solving" : ""}`}>
      <p className="home-pw-label">// 10 letters. find them in the deck.</p>
      <div className="home-pw-grid">
        {V1_THEMES.map((t, i) => {
          const correct = chars[i] === t.letter;
          const flipped = flipIndex >= i && solved;
          return (
            <input
              key={t.n}
              ref={(el) => {
                refs.current[i] = el;
              }}
              className={`home-pw-input ${correct && !solved ? "is-correct" : ""} ${flipped ? "is-flipped" : ""}`}
              type="text"
              maxLength={1}
              value={chars[i]}
              onChange={(e) => onCharChange(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              aria-label={`letter ${i + 1} of 10`}
              autoComplete="off"
              spellCheck={false}
              disabled={solved}
              style={{ ["--pw-green" as string]: t.green, ["--flip-delay" as string]: `${i * 110}ms` }}
            />
          );
        })}
      </div>
      {playAnim && <HomeGreen />}
    </div>
  );
}

function HomeGreen() {
  return (
    <div className="home-green" aria-hidden="true">
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
