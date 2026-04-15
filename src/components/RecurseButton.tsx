"use client";
import { useRouter } from "next/navigation";

// Misdirect button: iterates NEGATIVELY. Clicks decrement the recursion
// depth. If the new depth falls below 9, it bounces to home AND resets
// the session counter to 10 — so returning to the 6969 realm starts
// fresh at depth 10. The real recurse path is now the 6969 card itself
// (see SixNineCard), which increments up to 25 → past 25 the catch-all
// serves a real 404.

export default function RecurseButton({ currentDepth }: { currentDepth: number }) {
  const router = useRouter();

  const handle = () => {
    const next = currentDepth - 1;
    if (next < 9) {
      // bounce — reset the counter so re-entry starts fresh
      try { sessionStorage.setItem("polymarket-depth", "10"); } catch {}
      router.push("/");
      return;
    }
    try { sessionStorage.setItem("polymarket-depth", String(next)); } catch {}
    const prefix = Array(next).fill("polymarket").join("/");
    router.push(`/${prefix}/argument`);
  };

  const label =
    currentDepth - 1 < 9
      ? "[ exit · the door is that way ]"
      : `[ step back · depth ${currentDepth - 1} ]`;

  return (
    <button onClick={handle} className="six9-recurse six9-misdirect" type="button">
      {label}
    </button>
  );
}
