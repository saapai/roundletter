"use client";
import { useEffect, useState } from "react";
import { V1_THEMES } from "@/lib/v1data";

// Two-row hangman earned-letters display at the bottom of /positions:
//  1. "what we've found" — GLOBAL aggregation of every letter any visitor has
//     solved on /v1/{n} pages. Polled from /api/v1-letters every 15s.
//  2. "what you've found" — PERSONAL: the letters this specific viewer has
//     solved. Reads localStorage v1-solved-{slug} flags, updates in real time
//     when this tab fires the v1-solved event.

type Row = { slug: string; letter: string; green: string };

const solvedKey = (slug: string) => `v1-solved-${slug}`;

export default function SolvedLetters() {
  const [globalRows, setGlobalRows] = useState<Row[]>([]);
  const [personalRows, setPersonalRows] = useState<Row[]>([]);
  const [mounted, setMounted] = useState(false);

  const loadGlobal = async () => {
    try {
      const r = await fetch("/api/v1-letters", { cache: "no-store" });
      if (!r.ok) return;
      const j = (await r.json()) as { solved?: Array<{ slug: string }> };
      const solvedSet = new Set((j.solved ?? []).map((s) => s.slug));
      const rows = V1_THEMES.filter((t) => solvedSet.has(t.slug)).map((t) => ({
        slug: t.slug,
        letter: t.letter,
        green: t.green,
      }));
      setGlobalRows(rows);
    } catch {
      // keep last known state on error
    }
  };

  const loadPersonal = () => {
    try {
      const rows = V1_THEMES.filter((t) => localStorage.getItem(solvedKey(t.slug)) === "1").map(
        (t) => ({ slug: t.slug, letter: t.letter, green: t.green }),
      );
      setPersonalRows(rows);
    } catch {
      setPersonalRows([]);
    }
  };

  // Retroactive sync: any letter the viewer has in localStorage but that
  // isn't yet in the global state gets POSTed so everyone else sees it.
  // This catches legacy solves made before the global endpoint existed.
  const backfillGlobal = async (localSlugs: string[], globalSlugs: Set<string>) => {
    const missing = localSlugs.filter((s) => !globalSlugs.has(s));
    if (missing.length === 0) return;
    await Promise.all(
      missing.map((slug) =>
        fetch("/api/v1-letters/solve", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ slug }),
          keepalive: true,
        }).catch(() => {}),
      ),
    );
    // reload once after the backfill settles
    setTimeout(() => loadGlobal(), 400);
  };

  useEffect(() => {
    setMounted(true);
    loadPersonal();
    // initial global load + one-time retroactive sync
    (async () => {
      try {
        const r = await fetch("/api/v1-letters", { cache: "no-store" });
        if (!r.ok) return;
        const j = (await r.json()) as { solved?: Array<{ slug: string; letter: string }> };
        const globalSlugs = new Set((j.solved ?? []).map((s) => s.slug));
        const rows = V1_THEMES.filter((t) => globalSlugs.has(t.slug)).map((t) => ({
          slug: t.slug,
          letter: t.letter,
          green: t.green,
        }));
        setGlobalRows(rows);

        const localSlugs = V1_THEMES.filter(
          (t) => localStorage.getItem(solvedKey(t.slug)) === "1",
        ).map((t) => t.slug);
        await backfillGlobal(localSlugs, globalSlugs);
      } catch {}
    })();

    const globalTimer = setInterval(loadGlobal, 15000);
    const onSolved = () => {
      loadGlobal();
      loadPersonal();
    };
    window.addEventListener("v1-solved", onSolved as EventListener);
    window.addEventListener("storage", onSolved);
    return () => {
      clearInterval(globalTimer);
      window.removeEventListener("v1-solved", onSolved as EventListener);
      window.removeEventListener("storage", onSolved);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mounted) return null;
  if (globalRows.length === 0 && personalRows.length === 0) return null;

  return (
    <section className="solved-letters" aria-hidden="true">
      {globalRows.length > 0 && (
        <div className="solved-letters-block">
          <p className="solved-letters-eyebrow">// what we&rsquo;ve found</p>
          <div className="solved-letters-row">
            {globalRows.map((e) => (
              <span
                key={`g-${e.slug}`}
                className="solved-letter"
                style={{ ["--letter-green" as string]: e.green }}
              >
                {e.letter}
              </span>
            ))}
          </div>
        </div>
      )}

      {personalRows.length > 0 && (
        <div className="solved-letters-block solved-letters-personal">
          <p className="solved-letters-eyebrow">// what you&rsquo;ve found</p>
          <div className="solved-letters-row">
            {personalRows.map((e) => (
              <span
                key={`p-${e.slug}`}
                className="solved-letter"
                style={{ ["--letter-green" as string]: e.green }}
              >
                {e.letter}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
