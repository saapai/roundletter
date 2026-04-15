"use client";
import { useRouter } from "next/navigation";

// The ASCII error card IS the button. Clicks increment recursion depth and
// navigate to /polymarket × (depth+1) / argument. The catch-all renders
// either another 6969 page (if new depth is 11..25) or a real 404 (if > 25).
// No client-side cap — the server decides when to notFound().

export default function SixNineCard({ depth }: { depth: number }) {
  const router = useRouter();
  const bar = "█".repeat(Math.min(depth, 25)) + "░".repeat(Math.max(0, 25 - depth));

  const handle = () => {
    const next = depth + 1;
    try { sessionStorage.setItem("polymarket-depth", String(next)); } catch {}
    const prefix = Array(next).fill("polymarket").join("/");
    router.push(`/${prefix}/argument`);
  };

  return (
    <button
      type="button"
      onClick={handle}
      className="six9-card-click"
      aria-label={`recurse to depth ${depth + 1}`}
    >
      <pre className="cli-body six9-body">
{`$ ./wordle --decode POLYMARKET --depth ${depth}
[ !! ] recursion exceeds listed depth · 10
[ ok ] listed depth was the happy path
[ -- ] you kept clicking anyway

        ╔══════════════════════════════════════════════╗
        ║                                              ║
        ║            E R R O R   6 9 6 9               ║
        ║                                              ║
        ║   "nice" — click this to recurse             ║
        ║                                              ║
        ╚══════════════════════════════════════════════╝

$ status
  code         ${depth}/25 until the real 404
  reason       you went past listing; market is illiquid out here
  action       the 6969 is the button. click to go deeper.

$ depth --visual
  ${bar}

$ next
  → /polymarket × ${depth + 1} / argument${depth + 1 > 25 ? " → 404" : ""}
`}
      </pre>
    </button>
  );
}
