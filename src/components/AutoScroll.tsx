"use client";
import { useEffect, useRef, useState } from "react";

const DURATION_MS = 300_000; // exactly five minutes

// easeInOutCubic — breathes on hero, accelerates through mid, breathes on close
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function AutoScroll() {
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = () => {
    setActive(false);
    setProgress(0);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const start = () => {
    setActive(true);
    const startY = window.scrollY;
    const endY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const distance = endY - startY;
    const t0 = performance.now();

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => { /* file missing or blocked; scroll still runs */ });
    }

    const tick = (now: number) => {
      const elapsed = now - t0;
      const p = Math.min(elapsed / DURATION_MS, 1);
      setProgress(p);
      window.scrollTo(0, startY + distance * easeInOutCubic(p));
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        stop();
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const toggle = () => (active ? stop() : start());

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && /INPUT|TEXTAREA/i.test(t.tagName)) return;
      if (e.key === "a" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        toggle();
      }
      if (e.key === "Escape" && active) stop();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const minutesLeft = Math.max(0, Math.ceil(((1 - progress) * DURATION_MS) / 1000));
  const mm = Math.floor(minutesLeft / 60).toString().padStart(1, "0");
  const ss = (minutesLeft % 60).toString().padStart(2, "0");

  return (
    <>
      {active && (
        <div className="autoscroll-progress" style={{ width: `${progress * 100}%` }} />
      )}

      <button
        onClick={toggle}
        className={`autoscroll-btn${active ? " is-active" : ""}`}
        aria-label={active ? "stop autoscroll" : "play · 5-minute autoscroll"}
        title={active ? `${mm}:${ss} left · press a or click to stop` : "play · 5-min autoscroll (press a)"}
      >
        <span className="autoscroll-glyph">
          {active ? "■" : "▶"}
        </span>
        <span className="autoscroll-label">
          {active ? `${mm}:${ss}` : "play"}
        </span>
      </button>

      {/* Optional audio — drop a 5-minute edit of the melt into /public/sweet-melt.mp3 */}
      <audio ref={audioRef} src="/sweet-melt.mp3" preload="none" />
    </>
  );
}
