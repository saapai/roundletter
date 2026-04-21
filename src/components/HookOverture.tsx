"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Hook overture — chapter 01's audio, used inside the hero YT-framed chapter.
 *
 * Two-phase switch-up:
 *   phase A: magnolia (playboi carti) — lowercase name-drop hype
 *   phase B: jimmy cooks (drake / 21 savage) — the bar-swap, product reveal
 *
 * Starts muted (autoplay policy). "♪ on / off" toggles audio. A "switch up"
 * button flips phase A → B manually. Audio files live at:
 *   /audio/magnolia.mp3
 *   /audio/jimmy-cooks.mp3
 * Silent-fails when missing.
 */

const MUTE_KEY = "rl:hook-muted";

export default function HookOverture() {
  const [phase, setPhase] = useState<"A" | "B">("A");
  const [muted, setMuted] = useState(true);
  const aRef = useRef<HTMLAudioElement | null>(null);
  const bRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(MUTE_KEY) === "0") setMuted(false);
    } catch {}
  }, []);

  useEffect(() => {
    const a = aRef.current;
    const b = bRef.current;
    if (!a || !b) return;
    a.muted = muted;
    b.muted = muted;
    a.loop = false;
    b.loop = true;
    a.volume = 0.55;
    b.volume = 0.55;
    if (phase === "A") {
      try { b.pause(); } catch {}
      a.play().catch(() => {});
    } else {
      try { a.pause(); } catch {}
      b.play().catch(() => {});
    }
  }, [phase, muted]);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      try { window.localStorage.setItem(MUTE_KEY, next ? "1" : "0"); } catch {}
      return next;
    });
  }, []);

  const switchUp = useCallback(() => {
    setPhase((p) => (p === "A" ? "B" : "A"));
  }, []);

  return (
    <div className={`hook-overture hook-phase-${phase}`}>
      <audio ref={aRef} src="/audio/magnolia.mp3" preload="auto" playsInline muted />
      <audio ref={bRef} src="/audio/jimmy-cooks.mp3" preload="auto" playsInline muted />

      <div className="hook-stage" aria-hidden="true">
        <div className="hook-track hook-track-a">
          <span className="hook-track-label">now playing</span>
          <span className="hook-track-name">magnolia</span>
          <span className="hook-track-attr">playboi carti · 2017</span>
        </div>
        <div className="hook-track hook-track-b">
          <span className="hook-track-label">switch up</span>
          <span className="hook-track-name">jimmy cooks</span>
          <span className="hook-track-attr">drake + 21 savage · 2022</span>
        </div>
      </div>

      <div className="hook-controls">
        <button type="button" className="hook-ctrl" onClick={toggleMute} aria-label={muted ? "unmute hook" : "mute hook"}>
          <span aria-hidden="true">{muted ? "♪ off" : "♪ on"}</span>
        </button>
        <button type="button" className="hook-ctrl hook-ctrl-switch" onClick={switchUp} aria-label="switch song">
          <span aria-hidden="true">{phase === "A" ? "switch up →" : "← back to magnolia"}</span>
        </button>
      </div>
    </div>
  );
}
