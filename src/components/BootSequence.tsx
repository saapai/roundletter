"use client";
/**
 * BootSequence — Apple-style boot for aureliex.com
 *
 * PHASE MACHINE
 * ─────────────
 * "black"    0 ms        Pure black. Nothing visible.
 * "wordmark" 500 ms      Wordmark fades in over 800 ms.
 * "bar"      1300 ms     Progress bar track fades in over 200 ms.
 * "fill"     1500 ms     Bar fills left → right over 1700 ms.
 * "hold"     3200 ms     Everything stays. No change. 200 ms.
 * "exit"     3400 ms     White flash overlay 0→0.15 over 200 ms, then
 *                        overlay unmounts and content fades in over 200 ms.
 * "done"     3800 ms     Boot unmounts. Content fully visible.
 *
 * SKIP: click/tap anywhere collapses to "done" immediately.
 * SESSION: sessionStorage key "aureliex-booted" = "1" skips on reload.
 */

import { useEffect, useState, useRef, useCallback } from "react";

type Phase =
  | "black"      // 0 ms — nothing
  | "wordmark"   // 500 ms — wordmark fade-in begins
  | "bar"        // 1300 ms — bar track fades in
  | "fill"       // 1500 ms — bar fill animates
  | "hold"       // 3200 ms — static hold
  | "exit"       // 3400 ms — white flash, then content
  | "done";      // 3800 ms — boot gone, content visible

export default function BootSequence({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>("black");
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Clear all pending timers
  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  // Schedule a timer and track it for cleanup
  const schedule = useCallback((fn: () => void, ms: number) => {
    timersRef.current.push(setTimeout(fn, ms));
  }, []);

  // Collapse immediately to done (skip)
  const handleSkip = useCallback(() => {
    clearTimers();
    setPhase("done");
    try { sessionStorage.setItem("aureliex-booted", "1"); } catch { /* private browsing */ }
  }, [clearTimers]);

  useEffect(() => {
    // Already played this session — mount content immediately
    try {
      if (sessionStorage.getItem("aureliex-booted") === "1") {
        setPhase("done");
        return;
      }
    } catch { /* private browsing — always play */ }

    // setTimeout chain — offsets are absolute from mount
    schedule(() => setPhase("wordmark"), 500);   // 0 → 500 ms: black
    schedule(() => setPhase("bar"),      1300);  // 500 → 1300 ms: wordmark fade-in
    schedule(() => setPhase("fill"),     1500);  // 1300 → 1500 ms: bar track fade-in
    schedule(() => setPhase("hold"),     3200);  // 1500 → 3200 ms: bar fills
    schedule(() => setPhase("exit"),     3400);  // 3200 → 3400 ms: hold
    schedule(() => {                             // 3400 → 3800 ms: white flash + content
      setPhase("done");
      try { sessionStorage.setItem("aureliex-booted", "1"); } catch {}
    }, 3800);

    return clearTimers;
  }, [schedule, clearTimers]);

  // ── Already done: render content at full opacity ──────────────────
  if (phase === "done") {
    return (
      <div className="boot-content boot-content--visible">
        {children}
      </div>
    );
  }

  // ── Boot overlay + content (hidden beneath) ───────────────────────
  return (
    <>
      {/* ── Overlay ── */}
      <div
        className={`boot-overlay boot-overlay--${phase}`}
        onClick={handleSkip}
        role="presentation"
        aria-hidden="true"
      >
        {/* White flash layer — animates on "exit" phase */}
        <div className="boot-flash" aria-hidden="true" />

        {/* Wordmark — "aureliex" in Ms Madi (--font-signature) */}
        <p className={`boot-wordmark boot-wordmark--${phase}`} aria-label="aureliex">
          aureliex
        </p>

        {/* Progress bar: track + fill */}
        <div className={`boot-bar-track boot-bar-track--${phase}`}>
          <div className={`boot-bar-fill boot-bar-fill--${phase}`} />
        </div>
      </div>

      {/* ── Content (fades in during exit phase) ── */}
      <div className={`boot-content boot-content--${phase}`}>
        {children}
      </div>
    </>
  );
}
