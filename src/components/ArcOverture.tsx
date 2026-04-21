"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Ghost Town overture — a visual stand-in for the beat drop.
 *
 * Stages (absolute ms from mount):
 *   0      curtain covers viewport, pitch-dark with a single pulsing brass dot
 *   900    organ swells: halo widens, first lyric fades in
 *   2400   silence pause (the "ghost town is cold" line settles)
 *   2900   BEAT DROP: halo expands, curtain flashes warm, title slams in
 *   3700   curtain lifts away, landing page takes form beneath
 *
 * Returning visitors (localStorage flag) see no curtain — just the page.
 * A gentle "skip →" button is always visible during the overture.
 *
 * Audio: starts muted (browser autoplay policy). A sound toggle lets the
 * user unmute. If /audio/ghost-town.mp3 is missing, the <audio> fails silently.
 */

const STORAGE_KEY = "rl:arc-overture-seen-v1";
const MUTE_KEY = "rl:arc-overture-muted";

type Stage = "hidden" | "dark" | "swell" | "hold" | "drop" | "reveal" | "gone";

export default function ArcOverture() {
  const [mounted, setMounted] = useState(false);
  const [stage, setStage] = useState<Stage>("hidden");
  const [muted, setMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timers = useRef<number[]>([]);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      try { window.localStorage.setItem(MUTE_KEY, next ? "1" : "0"); } catch {}
      const a = audioRef.current;
      if (a) {
        a.muted = next;
        if (!next) a.play().catch(() => {});
      }
      return next;
    });
  }, []);

  useEffect(() => {
    setMounted(true);
    let seen = false;
    try {
      seen = window.localStorage.getItem(STORAGE_KEY) === "1";
      const storedMute = window.localStorage.getItem(MUTE_KEY);
      if (storedMute === "0") setMuted(false);
    } catch {
      seen = false;
    }
    if (seen) {
      setStage("gone");
      return;
    }
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setStage("gone");
      try { window.localStorage.setItem(STORAGE_KEY, "1"); } catch {}
      return;
    }

    setStage("dark");
    timers.current.push(window.setTimeout(() => setStage("swell"), 900));
    timers.current.push(window.setTimeout(() => setStage("hold"), 2400));
    timers.current.push(window.setTimeout(() => setStage("drop"), 2900));
    timers.current.push(window.setTimeout(() => setStage("reveal"), 3700));
    timers.current.push(
      window.setTimeout(() => {
        setStage("gone");
        try { window.localStorage.setItem(STORAGE_KEY, "1"); } catch {}
      }, 4500)
    );
    return () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    };
  }, []);

  // Attempt to start the track as soon as we enter "dark". Muted autoplay is
  // permitted; unmuted requires a gesture. We stop when the overture is gone.
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (stage === "dark" || stage === "swell") {
      a.muted = muted;
      a.play().catch(() => {});
    }
    if (stage === "gone") {
      try { a.pause(); } catch {}
    }
  }, [stage, muted]);

  function skip() {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setStage("gone");
    try { window.localStorage.setItem(STORAGE_KEY, "1"); } catch {}
    const a = audioRef.current;
    if (a) { try { a.pause(); } catch {} }
  }

  if (!mounted || stage === "gone" || stage === "hidden") return null;

  return (
    <div
      className={`overture overture-${stage}`}
      role="presentation"
      aria-hidden="true"
    >
      <audio
        ref={audioRef}
        src="/audio/ghost-town.mp3"
        preload="auto"
        playsInline
        // start muted so browsers permit autoplay; user toggles via the button
        muted
      />
      <div className="overture-halo" />
      <div className="overture-lyric">
        <span className="overture-lyric-line">i feel kinda free</span>
        <em className="overture-lyric-line overture-lyric-em">
          — and nothing hurts when my ghost town is cold.
        </em>
      </div>
      <div className="overture-title" aria-hidden="true">apparatus</div>

      <button
        type="button"
        className="overture-sound"
        onClick={toggleMute}
        aria-label={muted ? "unmute ghost town" : "mute ghost town"}
      >
        <span aria-hidden="true">{muted ? "♪ off" : "♪ on"}</span>
      </button>

      <button
        type="button"
        className="overture-skip"
        onClick={skip}
        aria-label="skip intro"
      >
        skip <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
