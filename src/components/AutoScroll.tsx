"use client";
import { useEffect, useRef, useState } from "react";

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function AutoScroll() {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [remaining, setRemaining] = useState<string | null>(null);
  const rafRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const anchorRef = useRef<{ startY: number; endY: number } | null>(null);
  const FADE_SECONDS = 3;

  const cancelRAF = () => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const reverseToTop = () => {
    const startY = window.scrollY;
    const duration = 8000;
    const t0 = performance.now();
    const back = (now: number) => {
      const elapsed = now - t0;
      const p = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      window.scrollTo(0, startY * (1 - eased));
      setProgress(Math.max(0, 1 - p));
      if (p < 1) {
        rafRef.current = requestAnimationFrame(back);
      } else {
        rafRef.current = null;
        setProgress(0);
        anchorRef.current = null;
      }
    };
    cancelRAF();
    rafRef.current = requestAnimationFrame(back);
  };

  const tick = () => {
    const audio = audioRef.current;
    const anchor = anchorRef.current;
    if (!audio || !anchor) return;

    if (audio.paused) { rafRef.current = null; return; }

    if (audio.ended) {
      setPlaying(false);
      setProgress(1);
      rafRef.current = null;
      reverseToTop();
      return;
    }

    if (audio.duration > 0) {
      const p = audio.currentTime / audio.duration;
      setProgress(p);
      const eased = easeInOutCubic(p);
      const y = anchor.startY + (anchor.endY - anchor.startY) * eased;
      window.scrollTo(0, y);

      // Remaining time display
      const left = Math.max(0, audio.duration - audio.currentTime);
      const mm = Math.floor(left / 60);
      const ss = Math.floor(left % 60).toString().padStart(2, "0");
      setRemaining(`${mm}:${ss}`);

      // Fade volume during last FADE_SECONDS
      if (left < FADE_SECONDS) {
        audio.volume = Math.max(0, left / FADE_SECONDS);
      } else if (audio.volume < 1) {
        audio.volume = 1;
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  };

  const play = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    const isFresh = audio.ended || audio.currentTime === 0 || audio.currentTime >= (audio.duration || Infinity) - 0.1;

    if (isFresh) {
      try { audio.currentTime = 0; } catch {}
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      // Recompute anchor on next tick so the layout is settled
      setTimeout(() => {
        anchorRef.current = {
          startY: 0,
          endY: Math.max(0, document.documentElement.scrollHeight - window.innerHeight),
        };
      }, 30);
    } else if (!anchorRef.current) {
      anchorRef.current = {
        startY: 0,
        endY: Math.max(0, document.documentElement.scrollHeight - window.innerHeight),
      };
    }

    audio.volume = 1;
    try {
      await audio.play();
    } catch {
      return; // autoplay blocked — user will press play again
    }
    setPlaying(true);
    cancelRAF();
    // Small delay so the anchor is set before first tick
    setTimeout(() => {
      rafRef.current = requestAnimationFrame(tick);
    }, 50);
  };

  const pause = () => {
    const audio = audioRef.current;
    if (audio) audio.pause();
    setPlaying(false);
    cancelRAF();
  };

  const toggle = () => (playing ? pause() : play());

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && /INPUT|TEXTAREA/i.test(t.tagName)) return;
      if (e.key === "a" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        toggle();
      }
      if (e.key === "Escape" && playing) pause();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  useEffect(() => {
    return () => {
      cancelRAF();
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  // Preload duration once metadata is loaded
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onLoad = () => {
      if (audio.duration > 0) {
        const mm = Math.floor(audio.duration / 60);
        const ss = Math.floor(audio.duration % 60).toString().padStart(2, "0");
        setRemaining(`${mm}:${ss}`);
      }
    };
    audio.addEventListener("loadedmetadata", onLoad);
    audio.load(); // kick preload
    return () => audio.removeEventListener("loadedmetadata", onLoad);
  }, []);

  return (
    <>
      {(playing || progress > 0) && (
        <div className="autoscroll-progress" style={{ width: `${progress * 100}%` }} />
      )}
      <button
        onClick={toggle}
        className={`autoscroll-btn${playing ? " is-active" : ""}`}
        aria-label={playing ? "pause autoscroll" : "play 4-minute autoscroll"}
        title={playing ? "pause · press a or esc" : "play · press a"}
      >
        <span className="autoscroll-glyph">{playing ? "■" : "▶"}</span>
        <span className="autoscroll-label">{playing ? (remaining ?? "…") : "play"}</span>
      </button>
      <audio ref={audioRef} src="/ispy.mp3" preload="metadata" />
    </>
  );
}
