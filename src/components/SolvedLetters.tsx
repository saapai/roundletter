"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { V1_THEMES } from "@/lib/v1data";
import { syncRiddleRound } from "@/lib/riddle-sync";

// Round-scoped sticky key: when the server bumps the round, the old-round
// flag is orphaned (never read) and the CompleteReveal hides correctly
// until letters are globally solved again in the new round.
const crowdSolvedKey = (round: number) => `crowd-solved-r${round}`;

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
  // Optimistic crowd-solved state: once this browser has ever seen 10/10
  // globally, we render the CompleteReveal immediately on future mounts —
  // no flash, no API wait. The API still runs and reconciles in the
  // background, but the UI is instant.
  const [crowdSolvedSticky, setCrowdSolvedSticky] = useState<boolean>(false);

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
    (async () => {
      // Invalidate stale client state if server round has advanced.
      await syncRiddleRound();
      loadPersonal();
      // Fetch the current round + global solves together. Read the sticky
      // flag for THIS round only — older rounds' stickies are ignored.
      try {
        const r = await fetch("/api/v1-letters", { cache: "no-store" });
        if (!r.ok) return;
        const j = (await r.json()) as {
          round?: number;
          solved?: Array<{ slug: string; letter: string }>;
        };
        const round = typeof j.round === "number" ? j.round : 1;
        const globalSlugs = new Set((j.solved ?? []).map((s) => s.slug));
        const rows = V1_THEMES.filter((t) => globalSlugs.has(t.slug)).map((t) => ({
          slug: t.slug,
          letter: t.letter,
          green: t.green,
        }));
        setGlobalRows(rows);

        // Sticky flag is round-scoped. Set when we see 10/10 in this round;
        // read on next mount to render the CompleteReveal without waiting.
        if (rows.length === 10) {
          try { localStorage.setItem(crowdSolvedKey(round), "1"); } catch {}
          setCrowdSolvedSticky(true);
        } else {
          try {
            setCrowdSolvedSticky(localStorage.getItem(crowdSolvedKey(round)) === "1");
          } catch {
            setCrowdSolvedSticky(false);
          }
        }

        const localSlugs = V1_THEMES.filter(
          (t) => localStorage.getItem(solvedKey(t.slug)) === "1",
        ).map((t) => t.slug);
        await backfillGlobal(localSlugs, globalSlugs);
      } catch {}
    })();
    // (the async IIFE above is closed just below)

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

  // CompleteReveal shows when either (a) we see 10/10 in the current API
  // response, or (b) the sticky localStorage flag says we've seen it before.
  // Sticky stays true forever on this browser — "permanent once solved."
  const allGlobalFound = globalRows.length === 10 || crowdSolvedSticky;

  return (
    <section className="solved-letters" aria-hidden="true">
      {allGlobalFound ? (
        <CompleteReveal />
      ) : (
        globalRows.length > 0 && (
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
        )
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

// CompleteReveal — command-line wordle terminal. Sharp, analytical, techy.
// Single link to /argument (the ONLY link to /argument on the site besides
// the /6969 page). No URL recursion; the 6969 depth game lives on /argument.
function CompleteReveal() {
  return (
    <Link href="/argument" className="cli-reveal" aria-label="polymarket — argument">
      <header className="cli-bar">
        <span className="cli-dot cli-dot-r" />
        <span className="cli-dot cli-dot-y" />
        <span className="cli-dot cli-dot-g" />
        <span className="cli-title">~ / polymarket / wordle.sh</span>
        <span className="cli-pid">pid 0010</span>
      </header>

      <pre className="cli-body">
{`$ ./wordle --decode POLYMARKET
[ ok ] crowd signal · 10/10 letters discovered
[ ok ] consensus · unanimous
[ .. ] listing    · pending

        ╔══════════════════════════════════════════════╗
        ║                                              ║
        ║   >_ P O L Y M A R K E T${"\u00A0"}`}<span className="cli-cursor" aria-hidden="true">_</span>{`          ║
        ║                                              ║
        ╚══════════════════════════════════════════════╝

$ status
  bid         ask         last        open_interest
  —           —           —           10 / 10

$ next
  → /argument`}
      </pre>

      <div className="cli-footer">
        <span className="cli-k">next call</span>
        <span className="cli-v">→ /argument</span>
      </div>
    </Link>
  );
}
