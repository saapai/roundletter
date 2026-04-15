"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { POLYMARKET, V1_THEMES } from "@/lib/v1data";

// 10 single-character inputs at the top of the home page, one per POLYMARKET
// letter. On mount, auto-fill any letters the user has already solved on the
// v1.X pages (localStorage flag v1-solved-{slug}). When all 10 match, fire
// the home green celebration once.

const solvedKey = (slug: string) => `v1-solved-${slug}`;
const seenHomeKey = "home-green-seen";

export default function HomePassword() {
  const router = useRouter();
  const [chars, setChars] = useState<string[]>(Array.from({ length: 10 }, () => ""));
  const [solvedAll, setSolvedAll] = useState(false);
  const [playAnim, setPlayAnim] = useState(false);
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    // prefill from localStorage — letters already earned on v1.X pages
    try {
      const next = V1_THEMES.map((t) =>
        localStorage.getItem(solvedKey(t.slug)) === "1" ? t.letter : "",
      );
      setChars(next);
      if (next.join("") === POLYMARKET) {
        setSolvedAll(true);
      }
    } catch {}
    // listen for real-time solves from v1 pages via custom event
    const onSolved = () => {
      try {
        const next = V1_THEMES.map((t) =>
          localStorage.getItem(solvedKey(t.slug)) === "1" ? t.letter : "",
        );
        setChars(next);
      } catch {}
    };
    window.addEventListener("v1-solved", onSolved as EventListener);
    return () => window.removeEventListener("v1-solved", onSolved as EventListener);
  }, []);

  useEffect(() => {
    const full = chars.join("");
    if (full === POLYMARKET && !solvedAll) {
      setSolvedAll(true);
      let seen = false;
      try {
        seen = localStorage.getItem(seenHomeKey) === "1";
        localStorage.setItem(seenHomeKey, "1");
      } catch {}
      if (!seen) {
        setPlayAnim(true);
        // After the green celebration, route to the live agent debate
        setTimeout(() => router.push("/argument"), 3200);
      } else {
        // already seen the animation — straight to the argument
        router.push("/argument");
      }
    }
  }, [chars, solvedAll, router]);

  useEffect(() => {
    if (!playAnim) return;
    const t = setTimeout(() => setPlayAnim(false), 3400);
    return () => clearTimeout(t);
  }, [playAnim]);

  const onCharChange = (i: number, v: string) => {
    const c = v.slice(-1);
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

  return (
    <div className={`home-pw ${solvedAll ? "is-solved" : ""}`}>
      <p className="home-pw-label">// 10 letters. find them in the deck.</p>
      <div className="home-pw-grid">
        {V1_THEMES.map((t, i) => {
          const correct = chars[i] === t.letter;
          return (
            <input
              key={t.n}
              ref={(el) => { refs.current[i] = el; }}
              className={`home-pw-input ${correct ? "is-correct" : ""}`}
              type="text"
              maxLength={1}
              value={chars[i]}
              onChange={(e) => onCharChange(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              aria-label={`letter ${i + 1} of 10`}
              autoComplete="off"
              spellCheck={false}
              style={{ ["--pw-green" as string]: t.green }}
            />
          );
        })}
      </div>
      {playAnim && <HomeGreen />}
    </div>
  );
}

// Home green — all ten themed greens sweep through one after another in a
// single horizontal wave across the viewport, then settle into a gentle
// ambient sheen. Plays only on the first-time POLYMARKET solve.
function HomeGreen() {
  return (
    <div className="home-green">
      <div className="home-green-wave" />
      <div className="home-green-sparkles">
        {Array.from({ length: 32 }).map((_, i) => (
          <span key={i} style={{ ["--i" as string]: String(i) }} />
        ))}
      </div>
    </div>
  );
}
