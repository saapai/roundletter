"use client";
import { useEffect, useRef, useState } from "react";
import type { V1Theme } from "@/lib/v1data";

// Single-letter, case-sensitive input for the v1 pages.
// - Correct letter: store solved flag in localStorage; play green animation
//   ONCE (guarded by a separate localStorage flag) and then settle to static
//   green state. Returning visitors see only the static green.
// - Wrong letter: subtle shake, no storage.

type Props = { theme: V1Theme };

const keyFor = (slug: string) => `v1-solved-${slug}`;
const seenFor = (slug: string) => `v1-seen-${slug}`;

export default function LetterInput({ theme }: Props) {
  const [value, setValue] = useState("");
  const [solved, setSolved] = useState(false);
  const [playAnim, setPlayAnim] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      const already = localStorage.getItem(keyFor(theme.slug));
      if (already === "1") setSolved(true);
    } catch {}
  }, [theme.slug]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.slice(-1);
    setValue(v);
    if (!v) return;
    if (v === theme.letter) {
      // correct
      let seen = false;
      try {
        seen = localStorage.getItem(seenFor(theme.slug)) === "1";
        localStorage.setItem(keyFor(theme.slug), "1");
      } catch {}
      setSolved(true);
      if (!seen) {
        setPlayAnim(true);
        try { localStorage.setItem(seenFor(theme.slug), "1"); } catch {}
        // cross-tab signal for home page password gate
        try {
          window.dispatchEvent(new CustomEvent("v1-solved", { detail: { slug: theme.slug } }));
        } catch {}
      }
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  return (
    <div
      className={`letter-input-wrap ${solved ? "is-solved" : ""} ${playAnim ? "play-anim" : ""} ${shake ? "is-shake" : ""}`}
      style={{ ["--v1-green" as string]: theme.green }}
    >
      <label className="letter-input-label" htmlFor={`v1-input-${theme.slug}`}>
        {solved ? "solved." : "enter one letter. case-sensitive."}
      </label>
      <input
        id={`v1-input-${theme.slug}`}
        ref={inputRef}
        type="text"
        maxLength={1}
        value={solved ? theme.letter : value}
        onChange={onChange}
        disabled={solved}
        className="letter-input"
        autoComplete="off"
        spellCheck={false}
        inputMode="text"
      />
      {playAnim && <GreenAnimation theme={theme} onDone={() => setPlayAnim(false)} />}
    </div>
  );
}

// Per-page one-shot celebration. Each page passes its .green color; the SVG
// overlay animates a themed pattern (ring burst + expanding glow + pixel
// sparkles) in the theme's green. Self-removes after ~2.6s so the static
// green state remains afterward.
function GreenAnimation({ theme, onDone }: { theme: V1Theme; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="green-anim" style={{ ["--v1-green" as string]: theme.green }}>
      <div className="green-anim-ring" />
      <div className="green-anim-flood" />
      <div className="green-anim-sparkles">
        {Array.from({ length: 24 }).map((_, i) => (
          <span key={i} style={{ ["--i" as string]: String(i) }} />
        ))}
      </div>
    </div>
  );
}
