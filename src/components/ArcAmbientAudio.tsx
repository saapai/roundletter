"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Ambient audio tied to a section's visibility.
 *
 * Place the component inside a section (it observes its own parent). When
 * the section scrolls into view the track attempts muted-autoplay (permitted
 * by browsers). A small sound toggle lets the user unmute. When the section
 * scrolls out, the track pauses.
 *
 * Used for Let Down on the arc home; the placeholder file at
 * /audio/let-down.mp3 can be dropped in later.
 */

type Props = {
  src: string;
  label: string;                 // e.g. "let down"
  storageKey?: string;           // per-track mute memory
  threshold?: number;            // in-view threshold (0..1)
};

export default function ArcAmbientAudio({
  src,
  label,
  storageKey = "rl:arc-ambient-muted",
  threshold = 0.35,
}: Props) {
  const [muted, setMuted] = useState(true);
  const [inView, setInView] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored === "0") setMuted(false);
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const section = host.closest("section") ?? host.parentElement;
    if (!section) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => setInView(e.isIntersecting));
      },
      { threshold }
    );
    io.observe(section);
    return () => io.disconnect();
  }, [threshold]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.muted = muted;
    a.loop = true;
    a.volume = 0.5;
    if (inView) {
      a.play().catch(() => {});
    } else {
      try { a.pause(); } catch {}
    }
  }, [inView, muted]);

  function toggle() {
    setMuted((prev) => {
      const next = !prev;
      try { window.localStorage.setItem(storageKey, next ? "1" : "0"); } catch {}
      const a = audioRef.current;
      if (a) {
        a.muted = next;
        if (!next && inView) a.play().catch(() => {});
      }
      return next;
    });
  }

  return (
    <div ref={hostRef} className="arc-ambient">
      <audio ref={audioRef} src={src} preload="metadata" playsInline muted />
      <button
        type="button"
        className="arc-ambient-toggle"
        onClick={toggle}
        aria-label={muted ? `unmute ${label}` : `mute ${label}`}
      >
        <span className="arc-ambient-dot" aria-hidden="true" />
        <span className="arc-ambient-text">
          {muted ? `♪ ${label} · off` : `♪ ${label} · on`}
        </span>
      </button>
    </div>
  );
}
