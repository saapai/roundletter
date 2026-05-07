"use client";
/**
 * BootSequence — dual-mode device boot for aureliex.com
 *
 * PORTRAIT  (mobile / iPhone-style)
 * ──────────────────────────────────
 * "black"      0 ms      Pure black. Nothing visible.
 * "wordmark"   500 ms    Wordmark fades in over 800 ms.
 * "bar"        1300 ms   Progress bar track fades in over 200 ms.
 * "fill"       1500 ms   Bar fills left → right over 1700 ms.
 * "lockscreen" 3200 ms   iOS lock screen: real time + date + "swipe up to enter". 800 ms fade-in.
 * "exit"       4500 ms   White flash 0→0.15 over 150 ms, then content fades in 200 ms.
 * "done"       4900 ms   Boot unmounts. Content fully visible.
 *
 * LANDSCAPE  (desktop/tablet / macOS-style)
 * ──────────────────────────────────────────
 * "black"      0 ms      Pure black.
 * "wordmark"   500 ms    Wordmark fades in over 800 ms.
 * "bar"        1300 ms   Progress bar track fades in over 200 ms.
 * "fill"       1500 ms   Bar fills left → right over 1700 ms.
 * "loginscreen"3200 ms   macOS login: real time + username avatar + "click to continue". 800 ms fade-in.
 * "exit"       4500 ms   White flash + content fades in.
 * "done"       4900 ms   Boot unmounts.
 *
 * SKIP: click/tap anywhere collapses to "done" immediately.
 * SESSION: sessionStorage key "aureliex-booted" = "1" skips on reload.
 * Total auto-play: ~4.9 seconds (lock/login screen is shown for ~1.3 s before auto-exit).
 */

import { useEffect, useState, useRef, useCallback } from "react";

type Phase =
  | "black"        // 0 ms — nothing
  | "wordmark"     // 500 ms — wordmark fade-in begins
  | "bar"          // 1300 ms — bar track fades in
  | "fill"         // 1500 ms — bar fill animates
  | "lockscreen"   // 3200 ms — iOS lock screen (portrait) or macOS login (landscape)
  | "exit"         // 4500 ms — white flash, then content
  | "done";        // 4900 ms — boot gone, content visible

function useLiveTime() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function formatTime(d: Date) {
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return { time: `${h}:${m}`, ampm };
}

function formatDate(d: Date) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
}

/* ── iOS Lock Screen ─────────────────────────────────────── */
function LockScreen({ visible }: { visible: boolean }) {
  const now = useLiveTime();
  if (!now) return null;
  const { time, ampm } = formatTime(now);
  const date = formatDate(now);
  return (
    <div className={`boot-lock ${visible ? "boot-lock--visible" : ""}`} aria-hidden="true">
      <div className="boot-lock-time">
        <span className="boot-lock-hhmm">{time}</span>
        <span className="boot-lock-ampm">{ampm}</span>
      </div>
      <div className="boot-lock-date">{date}</div>
      <div className="boot-lock-swipe">swipe up to enter</div>
    </div>
  );
}

/* ── macOS Login Screen ──────────────────────────────────── */
function LoginScreen({ visible }: { visible: boolean }) {
  const now = useLiveTime();
  if (!now) return null;
  const { time, ampm } = formatTime(now);
  const date = formatDate(now);
  return (
    <div className={`boot-login ${visible ? "boot-login--visible" : ""}`} aria-hidden="true">
      <div className="boot-login-clock">
        <span className="boot-login-hhmm">{time}</span>
        <span className="boot-login-ampm">{ampm}</span>
      </div>
      <div className="boot-login-date">{date}</div>
      <div className="boot-login-avatar" aria-hidden="true">
        <span className="boot-login-initial">a</span>
      </div>
      <div className="boot-login-username">aureliex</div>
      <div className="boot-login-hint">click to continue</div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────── */
export default function BootSequence({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>("black");
  const [isPortrait, setIsPortrait] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    timersRef.current.push(setTimeout(fn, ms));
  }, []);

  const handleSkip = useCallback(() => {
    clearTimers();
    setPhase("done");
    try { sessionStorage.setItem("aureliex-booted", "1"); } catch { /* private browsing */ }
  }, [clearTimers]);

  useEffect(() => {
    // Detect orientation once on mount (JS side for phase logic)
    const mq = window.matchMedia("(orientation: portrait)");
    setIsPortrait(mq.matches);
  }, []);

  useEffect(() => {
    // Already played this session — mount content immediately
    try {
      if (sessionStorage.getItem("aureliex-booted") === "1") {
        setPhase("done");
        return;
      }
    } catch { /* private browsing — always play */ }

    // Shared phase chain — absolute offsets from mount
    schedule(() => setPhase("wordmark"),    500);   // 0 → 500 ms: black
    schedule(() => setPhase("bar"),        1300);   // 500 → 1300 ms: wordmark fade-in
    schedule(() => setPhase("fill"),       1500);   // 1300 → 1500 ms: bar track fade-in
    schedule(() => setPhase("lockscreen"), 3200);   // 1500 → 3200 ms: bar fills (both modes, CSS differs)
    schedule(() => setPhase("exit"),       4500);   // 3200 → 4500 ms: lock/login screen hold
    schedule(() => {                                // 4500 → 4900 ms: exit
      setPhase("done");
      try { sessionStorage.setItem("aureliex-booted", "1"); } catch {}
    }, 4900);

    return clearTimers;
  }, [schedule, clearTimers]);

  // ── Already done: render content at full opacity ──────────────
  if (phase === "done") {
    return (
      <div className="boot-content boot-content--visible">
        {children}
      </div>
    );
  }

  const modeClass = isPortrait ? "boot-portrait" : "boot-landscape";

  // ── Boot overlay + content (hidden beneath) ────────────────────
  return (
    <>
      {/* ── Overlay ── */}
      <div
        className={`boot-overlay boot-overlay--${phase} ${modeClass}`}
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

        {/* Lock / Login screen — rendered when phase reaches "lockscreen" or "exit" */}
        {(phase === "lockscreen" || phase === "exit") && (
          <>
            {/* Portrait: iOS lock screen */}
            <LockScreen visible={phase === "lockscreen" || phase === "exit"} />
            {/* Landscape: macOS login screen */}
            <LoginScreen visible={phase === "lockscreen" || phase === "exit"} />
          </>
        )}
      </div>

      {/* ── Content (fades in during exit phase) ── */}
      <div className={`boot-content boot-content--${phase}`}>
        {children}
      </div>
    </>
  );
}
