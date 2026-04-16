"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { V1_THEMES } from "@/lib/v1data";
import { syncRiddleRound } from "@/lib/riddle-sync";

// Round-scoped sticky key: when the server bumps the round, the old-round
// flag is orphaned (never read) and the CompleteReveal hides correctly
// until letters are globally solved again in the new round.
const crowdSolvedKey = (round: number) => `crowd-solved-r${round}`;
// Progressive crowd letters union — ever-seen set within the current round.
// We read the server's global state, union it into this set, write back,
// and render from the union so the display can only GROW within a round.
const crowdUnionKey = (round: number) => `crowd-union-r${round}`;

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
    // SYNCHRONOUS pre-hydration: read last-seen-round + sticky + union
    // from localStorage BEFORE awaiting the API. If this browser has ever
    // seen 10/10, the Ted Lasso trailer renders on first paint — no flash.
    try {
      const lastRound = parseInt(localStorage.getItem("last-seen-round") || "0", 10);
      if (lastRound > 0) {
        // Sticky flag for 10/10 portal
        if (localStorage.getItem(crowdSolvedKey(lastRound)) === "1") {
          setCrowdSolvedSticky(true);
        }
        // Hydrate the crowd-letters union so the partial "what we've found"
        // row also shows instantly if there's partial progress.
        try {
          const raw = localStorage.getItem(crowdUnionKey(lastRound));
          if (raw) {
            const slugs = new Set<string>(JSON.parse(raw) as string[]);
            const rows = V1_THEMES.filter((t) => slugs.has(t.slug)).map((t) => ({
              slug: t.slug,
              letter: t.letter,
              green: t.green,
            }));
            setGlobalRows(rows);
          }
        } catch {}
      }
    } catch {}

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
        const serverSlugs = new Set((j.solved ?? []).map((s) => s.slug));

        // Progressive union: union server set with whatever this browser
        // has ever seen in this round. The display never shrinks.
        let unionSlugs = new Set<string>(serverSlugs);
        try {
          const existing = localStorage.getItem(crowdUnionKey(round));
          if (existing) {
            for (const s of JSON.parse(existing) as string[]) unionSlugs.add(s);
          }
          localStorage.setItem(crowdUnionKey(round), JSON.stringify(Array.from(unionSlugs)));
        } catch {}

        const rows = V1_THEMES.filter((t) => unionSlugs.has(t.slug)).map((t) => ({
          slug: t.slug,
          letter: t.letter,
          green: t.green,
        }));
        setGlobalRows(rows);

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
        await backfillGlobal(localSlugs, serverSlugs);
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

  // At 10/10 crowd-solved, the page is stateless → only the portal. No
  // personal row either. Before 10/10, show both rows.
  if (allGlobalFound) {
    return (
      <section className="solved-letters" aria-hidden="true">
        <CompleteReveal />
      </section>
    );
  }

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

// CompleteReveal — Ted Lasso under-construction trailer. Messy, warm,
// taped-together. BELIEVE sign, sticky notes at odd angles, biscuits,
// darts, masking tape, pushpins. One clickable card → /argument.
function CompleteReveal() {
  return (
    <Link href="/argument" className="lasso-trailer" aria-label="polymarket — argument">
      <span className="lt-tape lt-tape-tl" aria-hidden="true" />
      <span className="lt-tape lt-tape-tr" aria-hidden="true" />
      <span className="lt-tape lt-tape-bl" aria-hidden="true" />
      <span className="lt-tape lt-tape-br" aria-hidden="true" />

      <div className="lt-believe" aria-hidden="true">
        <span>B</span><span>E</span><span>L</span><span>I</span><span>E</span><span>V</span><span>E</span>
      </div>

      <span className="lt-note lt-note-1" aria-hidden="true">
        <em>be a goldfish.</em>
      </span>
      <span className="lt-note lt-note-2" aria-hidden="true">
        <em>we got y&rsquo;all.</em>
      </span>
      <span className="lt-note lt-note-3" aria-hidden="true">
        <em>you had to know me.</em>
      </span>
      <span className="lt-note lt-note-4" aria-hidden="true">
        <em>hot-take: under construction.</em>
      </span>
      <span className="lt-note lt-note-5" aria-hidden="true">
        <em>biscuits with the boss, tuesdays.</em>
      </span>

      <span className="lt-arrow" aria-hidden="true">↘</span>

      <div className="lt-headline">
        <span className="lt-coming">coming soon</span>
        <span className="lt-word">polymarket</span>
        <span className="lt-sub"><em>every revolution needs its counterculture.</em></span>
      </div>

      <div className="lt-footer">
        <span className="lt-step">step 1 of forever</span>
        <span className="lt-arrow-go">→ the argument</span>
      </div>

      <span className="lt-pin lt-pin-tr" aria-hidden="true" />
      <span className="lt-pin lt-pin-bl" aria-hidden="true" />
    </Link>
  );
}
