"use client";
import { useEffect, useState } from "react";
import { V1_THEMES } from "@/lib/v1data";

// Hangman-style GLOBAL earned-letters display at the bottom of /positions.
// Shows the letters that ANYONE has solved on /v1/{n} pages — aggregated
// across all visitors via the abacus counter service (/api/v1-letters).
// No empty placeholders, no count display. Just the letters that have
// been discovered, floating in theme order.

type Earned = { slug: string; letter: string; green: string };

export default function SolvedLetters() {
  const [earned, setEarned] = useState<Earned[]>([]);
  const [mounted, setMounted] = useState(false);

  const load = async () => {
    try {
      const r = await fetch("/api/v1-letters", { cache: "no-store" });
      if (!r.ok) return;
      const j = (await r.json()) as { solved?: Array<{ slug: string; letter: string }> };
      const solvedSet = new Set((j.solved ?? []).map((s) => s.slug));
      const rows = V1_THEMES.filter((t) => solvedSet.has(t.slug)).map((t) => ({
        slug: t.slug,
        letter: t.letter,
        green: t.green,
      }));
      setEarned(rows);
    } catch {
      // stay empty on network error
    }
  };

  useEffect(() => {
    setMounted(true);
    load();
    // refresh periodically so letters appear live as other visitors solve
    const t = setInterval(load, 15000);
    // also refresh when this tab solves a letter locally
    const onSolved = () => load();
    window.addEventListener("v1-solved", onSolved as EventListener);
    return () => {
      clearInterval(t);
      window.removeEventListener("v1-solved", onSolved as EventListener);
    };
  }, []);

  if (!mounted || earned.length === 0) return null;

  return (
    <section className="solved-letters" aria-hidden="true">
      <p className="solved-letters-eyebrow">// what you&rsquo;ve found</p>
      <div className="solved-letters-row">
        {earned.map((e) => (
          <span
            key={e.slug}
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
