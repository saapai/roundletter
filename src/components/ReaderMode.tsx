"use client";
import { useEffect, useState } from "react";

export default function ReaderMode() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("reader-mode", on);
    return () => document.body.classList.remove("reader-mode");
  }, [on]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "f" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const t = e.target as HTMLElement | null;
        if (t && /INPUT|TEXTAREA/i.test(t.tagName)) return;
        setOn(v => !v);
      } else if (e.key === "Escape") {
        setOn(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <button
      onClick={() => setOn(v => !v)}
      aria-label={on ? "Exit reader mode" : "Enter reader mode"}
      title={on ? "Exit reader mode (Esc or f)" : "Reader mode (f)"}
      className="fixed top-4 right-4 z-50 h-9 w-9 rounded-full border border-ink/40 bg-parchment/90 backdrop-blur text-[15px] font-display hover:bg-parchment transition"
    >
      {on ? "×" : "↔"}
    </button>
  );
}
