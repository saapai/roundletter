"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { POLYMARKET } from "@/lib/v1data";

// Invisible POLYMARKET cipher for the home page.
// No visible UI. A document-level keydown listener keeps a 10-character
// rolling window of the last keystrokes; if the window spells POLYMARKET
// (case-insensitive), we fire the Wordle×2K green animation and then
// route to /positions. Stateless — nothing is persisted, no server hit.

export default function PolymarketTyper() {
  const router = useRouter();
  const [buffer, setBuffer] = useState("");
  const [playAnim, setPlayAnim] = useState(false);
  const [solvedOnce, setSolvedOnce] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (solvedOnce) return;
      // Ignore when focus is in an editable element (no stray typing in inputs/textareas)
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || (e.target as HTMLElement | null)?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.length !== 1) return;
      const ch = e.key.toUpperCase();
      if (!/^[A-Z]$/.test(ch)) return;
      setBuffer((prev) => {
        const next = (prev + ch).slice(-POLYMARKET.length);
        if (next === POLYMARKET) {
          setSolvedOnce(true);
          setPlayAnim(true);
          setTimeout(() => router.push("/positions"), 3800);
        }
        return next;
      });
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [router, solvedOnce]);

  if (!playAnim) return null;

  return (
    <div className="home-green" aria-hidden="true">
      <div className="home-green-ring" />
      <div className="home-green-wave" />
      <div className="home-green-sparkles">
        {Array.from({ length: 40 }).map((_, i) => (
          <span key={i} style={{ ["--i" as string]: String(i) }} />
        ))}
      </div>
      <div className="home-green-rain">
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} style={{ ["--i" as string]: String(i) }} />
        ))}
      </div>
    </div>
  );
}
