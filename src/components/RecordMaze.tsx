"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ═══════════════════════════════════════════════════════════════
   INTERLUDE — THE MAZE

   A scroll trap. When the maze fills the viewport, downward scroll
   is intercepted: the page rubber-bands against the section instead
   of moving (haptic pulse on supporting phones), so it feels stuck,
   not frozen. Scrolling back up always works.

   Three ways out:
   1. trace the corridor from ⌂ to the exit (pointer or finger) —
      touching a wall resets you to the entrance
   2. find the tiny rust dot hidden in the walls and press it
   3. wait 7 seconds — "call me if you get lost." fades in; click it

   Solved state persists per-session. Reduced-motion and keyboard
   users are never trapped (Escape also always releases).
   ═══════════════════════════════════════════════════════════════ */

const STORAGE_KEY = "rc_maze_solved";

// 13×9 grid. 1 = wall, 0 = corridor. S at [7,0], exit at [1,12].
const GRID: number[][] = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1],
  [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];
const START = { r: 7, c: 0 };
const EXIT = { r: 1, c: 12 };
// the hidden dot lives in a wall cell, lower right region
const DOT = { r: 6, c: 10 };

function isCorridor(r: number, c: number) {
  return GRID[r]?.[c] === 0;
}

export default function RecordMaze() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [solved, setSolved] = useState<boolean | null>(null); // null = unresolved (SSR)
  const [engaged, setEngaged] = useState(false);
  const [bump, setBump] = useState(0);       // rubber-band offset px
  const [shake, setShake] = useState(false);
  const [showEscape, setShowEscape] = useState(false);
  const [pos, setPos] = useState(START);      // current traced position
  const [dead, setDead] = useState(false);    // wall-touch flash
  const attemptsRef = useRef(0);
  const engagedRef = useRef(false);
  const solvedRef = useRef(false);
  const touchYRef = useRef<number | null>(null);
  const escapeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* resolve solved state on mount */
  useEffect(() => {
    let done = false;
    try {
      done = sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch { /* noop */ }
    const reduced = typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const isSolved = done || !!reduced; // reduced-motion users pass through
    solvedRef.current = isSolved;
    setSolved(isSolved);
  }, []);

  const solve = useCallback((how: string) => {
    if (solvedRef.current) return;
    solvedRef.current = true;
    setSolved(true);
    setEngaged(false);
    engagedRef.current = false;
    try { sessionStorage.setItem(STORAGE_KEY, "1"); } catch { /* noop */ }
    try {
      (window as unknown as { __hunt?: { fire?: (id: string) => void } })
        .__hunt?.fire?.(`maze-${how}`);
    } catch { /* noop */ }
  }, []);

  const rebuff = useCallback(() => {
    attemptsRef.current += 1;
    const n = attemptsRef.current;
    setBump(Math.min(64, 22 + n * 5));
    if (n >= 3) {
      setShake(true);
      setTimeout(() => setShake(false), 420);
    }
    try { navigator.vibrate?.(n >= 3 ? [10, 40, 12] : 8); } catch { /* noop */ }
    setTimeout(() => setBump(0), 90);
  }, []);

  /* engage / release the trap as the section crosses the viewport */
  useEffect(() => {
    if (solved !== false) return; // only trap when explicitly unsolved
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        const on = e.isIntersecting && e.intersectionRatio >= 0.55;
        engagedRef.current = on;
        setEngaged(on);
      },
      { threshold: [0, 0.55, 1] },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [solved]);

  /* the 7-second mercy line */
  useEffect(() => {
    if (engaged && !showEscape) {
      escapeTimerRef.current = setTimeout(() => setShowEscape(true), 7000);
      return () => { if (escapeTimerRef.current) clearTimeout(escapeTimerRef.current); };
    }
  }, [engaged, showEscape]);

  /* intercept downward scroll while engaged */
  useEffect(() => {
    if (solved !== false) return;
    const wheel = (e: WheelEvent) => {
      if (!engagedRef.current || solvedRef.current) return;
      if (e.deltaY > 0) { e.preventDefault(); rebuff(); }
    };
    const touchStart = (e: TouchEvent) => {
      touchYRef.current = e.touches[0]?.clientY ?? null;
    };
    const touchMove = (e: TouchEvent) => {
      if (!engagedRef.current || solvedRef.current) return;
      const y = e.touches[0]?.clientY ?? null;
      if (y != null && touchYRef.current != null && touchYRef.current - y > 6) {
        e.preventDefault();
        if (touchYRef.current - y > 24) { rebuff(); touchYRef.current = y; }
      }
    };
    const key = (e: KeyboardEvent) => {
      if (!engagedRef.current || solvedRef.current) return;
      if (e.key === "Escape") { solve("escape-key"); return; }
      if (["ArrowDown", "PageDown", "End", " "].includes(e.key)) {
        e.preventDefault(); rebuff();
      }
    };
    window.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("touchstart", touchStart, { passive: true });
    window.addEventListener("touchmove", touchMove, { passive: false });
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("wheel", wheel);
      window.removeEventListener("touchstart", touchStart);
      window.removeEventListener("touchmove", touchMove);
      window.removeEventListener("keydown", key);
    };
  }, [solved, rebuff, solve]);

  /* trace the corridor — pointer position → cell */
  const onTrace = useCallback((clientX: number, clientY: number) => {
    if (solvedRef.current) return;
    const g = gridRef.current;
    if (!g) return;
    const rect = g.getBoundingClientRect();
    const c = Math.floor(((clientX - rect.left) / rect.width) * GRID[0].length);
    const r = Math.floor(((clientY - rect.top) / rect.height) * GRID.length);
    if (r < 0 || c < 0 || r >= GRID.length || c >= GRID[0].length) return;
    setPos((prev) => {
      const adjacent = Math.abs(prev.r - r) + Math.abs(prev.c - c) <= 2;
      if (isCorridor(r, c) && adjacent) {
        if (r === EXIT.r && c === EXIT.c) solve("traced");
        return { r, c };
      }
      if (!isCorridor(r, c) && !(r === prev.r && c === prev.c)) {
        setDead(true);
        setTimeout(() => setDead(false), 300);
        return START;
      }
      return prev;
    });
  }, [solve]);

  if (solved === null) {
    // pre-hydration placeholder keeps layout stable
    return <section className="rc-maze" aria-hidden="true" />;
  }

  if (solved) {
    return (
      <section className="rc-maze rc-maze--solved" ref={sectionRef}>
        <p className="rc-maze-solved-line">interlude — the maze · <em>you found your way out</em></p>
      </section>
    );
  }

  return (
    <section
      className={`rc-maze ${shake ? "rc-maze--shake" : ""}`}
      ref={sectionRef}
      style={{ transform: bump ? `translateY(-${bump}px)` : undefined }}
    >
      <p className="rc-maze-eyebrow">interlude — the maze</p>
      <p className="rc-maze-hint">the record continues on the other side. trace your way through.</p>
      <div
        className={`rc-maze-grid ${dead ? "rc-maze-grid--dead" : ""}`}
        ref={gridRef}
        onPointerMove={(e) => onTrace(e.clientX, e.clientY)}
        onPointerDown={(e) => onTrace(e.clientX, e.clientY)}
        onTouchMove={(e) => {
          const t = e.touches[0];
          if (t) onTrace(t.clientX, t.clientY);
        }}
        role="application"
        aria-label="a small maze. press escape to skip it."
      >
        {GRID.map((row, r) =>
          row.map((cell, c) => {
            const isStart = r === START.r && c === START.c;
            const isExit = r === EXIT.r && c === EXIT.c;
            const isHere = pos.r === r && pos.c === c;
            const isDot = r === DOT.r && c === DOT.c;
            return (
              <div
                key={`${r}-${c}`}
                className={[
                  "rc-maze-cell",
                  cell === 1 ? "rc-maze-wall" : "rc-maze-path",
                  isStart ? "rc-maze-start" : "",
                  isExit ? "rc-maze-exit" : "",
                  isHere ? "rc-maze-here" : "",
                ].filter(Boolean).join(" ")}
              >
                {isStart && <span className="rc-maze-glyph">⌂</span>}
                {isExit && <span className="rc-maze-glyph">→</span>}
                {isDot && (
                  <button
                    className="rc-maze-dot"
                    aria-label="a way out"
                    onClick={() => solve("dot")}
                  />
                )}
              </div>
            );
          }),
        )}
      </div>
      <button
        className={`rc-maze-mercy ${showEscape ? "rc-maze-mercy--in" : ""}`}
        onClick={() => solve("mercy")}
        tabIndex={showEscape ? 0 : -1}
        aria-hidden={!showEscape}
      >
        call me if you get lost.
      </button>
    </section>
  );
}
