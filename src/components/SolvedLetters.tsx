"use client";
import { useEffect, useState } from "react";
import { V1_THEMES } from "@/lib/v1data";

// Hangman-style earned-letters display at the bottom of /positions.
// Shows ONLY the letters the viewer has solved on /v1/{n} pages — no
// empty placeholders, no grid, no count. Just the letters they've earned,
// floating in the order they discovered them (localStorage holds solve
// flags; solve ts isn't tracked, so we fall back to theme order).
// Stateless beyond localStorage: every visitor sees their own progress.

type Earned = { n: number; letter: string; green: string };

const solvedKey = (slug: string) => `v1-solved-${slug}`;

export default function SolvedLetters() {
  const [earned, setEarned] = useState<Earned[]>([]);
  const [mounted, setMounted] = useState(false);

  const load = () => {
    try {
      const rows = V1_THEMES.filter((t) => localStorage.getItem(solvedKey(t.slug)) === "1").map((t) => ({
        n: t.n,
        letter: t.letter,
        green: t.green,
      }));
      setEarned(rows);
    } catch {
      setEarned([]);
    }
  };

  useEffect(() => {
    setMounted(true);
    load();
    // also update live if a v1 page solve fires while we're on this page
    const onSolved = () => load();
    window.addEventListener("v1-solved", onSolved as EventListener);
    window.addEventListener("storage", onSolved);
    return () => {
      window.removeEventListener("v1-solved", onSolved as EventListener);
      window.removeEventListener("storage", onSolved);
    };
  }, []);

  if (!mounted || earned.length === 0) return null;

  return (
    <section className="solved-letters" aria-hidden="true">
      <p className="solved-letters-eyebrow">// what you&rsquo;ve found</p>
      <div className="solved-letters-row">
        {earned.map((e) => (
          <span
            key={e.n}
            className="solved-letter"
            style={{ ["--letter-green" as string]: e.green }}
          >
            {e.letter}
          </span>
        ))}
      </div>
    </section>
  );
}
