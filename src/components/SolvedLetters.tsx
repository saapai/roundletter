"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
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

  const allGlobalFound = globalRows.length === 10;

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

// CompleteReveal — rendered at the bottom of /positions once all 10 letters
// have been crowd-solved globally. Sharp, techy, market-themed COMING SOON
// card. Bloomberg-terminal vibes: tabular monospace, box-drawing borders,
// bid/ask/spread readout, ticker tape. Implicit money/markets language.
function CompleteReveal() {
  return (
    <Link href="/argument" className="complete-reveal" aria-label="polymarket — coming soon">
      <div className="cr-top">
        <span className="cr-tkr">TKR · POLYMARKET</span>
        <span className="cr-status">LISTING · PENDING</span>
      </div>

      <div className="cr-headline">
        <span className="cr-eyebrow">// crowd discovery complete · 10/10</span>
        <div className="cr-coming">
          <span>COMING</span>
          <span>SOON</span>
        </div>
        <div className="cr-symbol">
          POLYMARKET
          <span className="cr-cursor" aria-hidden="true" />
        </div>
      </div>

      <div className="cr-grid">
        <div className="cr-cell"><span className="cr-k">bid</span><span className="cr-v">—</span></div>
        <div className="cr-cell"><span className="cr-k">ask</span><span className="cr-v">—</span></div>
        <div className="cr-cell"><span className="cr-k">last</span><span className="cr-v">—</span></div>
        <div className="cr-cell"><span className="cr-k">open</span><span className="cr-v">—</span></div>
        <div className="cr-cell"><span className="cr-k">high</span><span className="cr-v">—</span></div>
        <div className="cr-cell"><span className="cr-k">low</span><span className="cr-v">—</span></div>
        <div className="cr-cell"><span className="cr-k">open interest</span><span className="cr-v cr-v-up">10 / 10</span></div>
        <div className="cr-cell"><span className="cr-k">depth</span><span className="cr-v cr-v-up">100%</span></div>
        <div className="cr-cell"><span className="cr-k">spread</span><span className="cr-v">tightening</span></div>
      </div>

      <div className="cr-ticker" aria-hidden="true">
        <span>
          ── OPEN INTEREST 10/10 ── DEPTH 100% ── SPREAD TIGHTENING ── SETTLEMENT TBD ── MARKET IS MAKING ── METHOD &gt; OUTCOME ── ATTENTION IS PRICED IN ── PICK YOUR REVOLUTION ── CONVICTION ≠ EDGE ── KELLY SAYS SIZE BY EDGE ── BASE RATES HOLD ── THE METHOD IS THE MEDICINE ──
        </span>
      </div>
    </Link>
  );
}
