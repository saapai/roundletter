"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { POLYMARKET, V1_THEMES } from "@/lib/v1data";

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
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const full = chars.join("");
    if (full === POLYMARKET && !solved) {
      setSolved(true);
      for (let i = 0; i < 10; i++) {
        setTimeout(() => setFlipIndex(i), i * 110);
      }
      // start the 2K animation once the cascade has begun
      setTimeout(() => setPlayAnim(true), 400);
      // reveal the green link once the full celebration finishes
      setTimeout(() => setShowLink(true), 3800);
    }
  }, [chars, solved]);

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

  // After the celebration, swap the grid for the COMING SOON · polymarket
  // movie-trailer × hackathon-under-construction card. Asymmetric, odd,
  // green. Links to /positions. Refresh resets back to boxes.
  if (showLink) {
    return (
      <div className="home-pw home-pw-global-solved">
        <Link href="/positions" className="coming-soon-trailer" aria-label="polymarket — coming soon">
          <span className="cst-scaffold cst-scaffold-tl" aria-hidden="true" />
          <span className="cst-scaffold cst-scaffold-br" aria-hidden="true" />
          <span className="cst-tape cst-tape-1" aria-hidden="true">//// under construction ////</span>
          <span className="cst-frame" aria-hidden="true">
            <span className="cst-corner cst-corner-tl" />
            <span className="cst-corner cst-corner-tr" />
            <span className="cst-corner cst-corner-bl" />
            <span className="cst-corner cst-corner-br" />
          </span>
          <span className="cst-build">// build: 0.1.0-alpha</span>
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
          <span className="cst-ticker" aria-hidden="true">
            <span>// WARN: positions not reconciled</span>
            <span>· live prices offline</span>
            <span>· method &gt; outcome</span>
            <span>· attention is all you need</span>
            <span>· pick your revolution</span>
          </span>
        </Link>
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
