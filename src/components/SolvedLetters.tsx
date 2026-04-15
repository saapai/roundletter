"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { V1_THEMES } from "@/lib/v1data";

const CROWD_SOLVED_KEY = "crowd-solved-v1";
const POLYMARKET_DEPTH_KEY = "polymarket-depth";
const MAX_DEPTH = 10;

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
    loadPersonal();
    // Read sticky flag immediately so the CompleteReveal renders on first
    // paint if this browser has ever seen all 10.
    try {
      if (localStorage.getItem(CROWD_SOLVED_KEY) === "1") {
        setCrowdSolvedSticky(true);
      }
    } catch {}
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
        if (rows.length === 10) {
          try { localStorage.setItem(CROWD_SOLVED_KEY, "1"); } catch {}
          setCrowdSolvedSticky(true);
        }

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

// CompleteReveal — command-line wordle abacus. Sharp, analytical, techy.
// Cumulative polymarket recursion: each click increments a session-scoped
// depth counter (max 10), navigating to /polymarket[/polymarket]*/argument.
// Counter persists across back/forward navigation within the session.
function CompleteReveal() {
  const router = useRouter();
  const [depth, setDepth] = useState(0);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(POLYMARKET_DEPTH_KEY);
      const n = raw ? parseInt(raw, 10) : 0;
      if (Number.isFinite(n) && n >= 0) setDepth(Math.min(n, MAX_DEPTH));
    } catch {}
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const next = Math.min(depth + 1, MAX_DEPTH);
    try { sessionStorage.setItem(POLYMARKET_DEPTH_KEY, String(next)); } catch {}
    setDepth(next);
    const prefix = Array(next).fill("polymarket").join("/");
    const path = prefix ? `/${prefix}/argument` : `/argument`;
    router.push(path);
  };

  const progress = Math.min(depth, MAX_DEPTH);
  const progressBar = "█".repeat(progress) + "░".repeat(MAX_DEPTH - progress);

  return (
    <a href="/argument" onClick={handleClick} className="cli-reveal" aria-label="polymarket — coming soon">
      <header className="cli-bar">
        <span className="cli-dot cli-dot-r" />
        <span className="cli-dot cli-dot-y" />
        <span className="cli-dot cli-dot-g" />
        <span className="cli-title">~ / polymarket / wordle.sh</span>
        <span className="cli-pid">pid 00{Math.max(1, progress)}</span>
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

$ recurse --depth=${progress}/${MAX_DEPTH}
  ${progressBar}

$ _`}
      </pre>

      <div className="cli-footer">
        <span className="cli-k">next call</span>
        <span className="cli-v">
          {progress >= MAX_DEPTH
            ? "→ /polymarket × 10 / argument"
            : `→ /polymarket × ${progress + 1} / argument`}
        </span>
      </div>
    </a>
  );
}
