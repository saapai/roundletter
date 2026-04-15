import { notFound } from "next/navigation";
import Link from "next/link";
import PositionsPage from "../../positions/page";
import ArgumentPage from "../../argument/page";
import RecurseButton from "@/components/RecurseButton";

// Catch-all for the polymarket recursion maze.
//
// Depths (counting /polymarket itself as 1):
//   1..10   → render the real page (positions or argument) at the nested URL
//   11..25  → purposefully "6969" joke error page (green terminal)
//   26+     → real notFound() / 404
//
// Accepted shapes:
//   /polymarket [/polymarket]*    — bare, renders argument
//   /polymarket [/polymarket]* /positions
//   /polymarket [/polymarket]* /argument
// Anything else (non-polymarket segments besides the terminal) 404s.

const HAPPY_MAX = 10;
const SIX9_MAX = 25;

export default async function PolymarketCatchAll({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  const { path } = await params;
  const segments = path ?? [];
  const lastSeg = segments[segments.length - 1];
  const terminal = lastSeg === "positions" || lastSeg === "argument" ? lastSeg : null;
  const polymarketSegs = terminal ? segments.slice(0, -1) : segments;

  const allArePolymarket = polymarketSegs.every((s) => s === "polymarket");
  if (!allArePolymarket) notFound();

  const totalPolymarkets = 1 + polymarketSegs.length;

  if (totalPolymarkets <= HAPPY_MAX) {
    if (terminal === "positions") return <PositionsPage />;
    return <ArgumentPage />;
  }

  if (totalPolymarkets <= SIX9_MAX) {
    return <SixtyNineSixtyNinePage depth={totalPolymarkets} />;
  }

  notFound();
}

function SixtyNineSixtyNinePage({ depth }: { depth: number }) {
  const bar = "█".repeat(Math.min(depth, SIX9_MAX)) + "░".repeat(Math.max(0, SIX9_MAX - depth));
  return (
    <main className="six9-root">
      <div className="six9-card">
        <header className="cli-bar six9-bar">
          <span className="cli-dot cli-dot-r" />
          <span className="cli-dot cli-dot-y" />
          <span className="cli-dot cli-dot-g" />
          <span className="cli-title">~ / polymarket × {depth} / void.sh</span>
          <span className="cli-pid">pid 0069</span>
        </header>
        <pre className="cli-body six9-body">
{`$ ./wordle --decode POLYMARKET --depth ${depth}
[ !! ] recursion exceeds listed depth · 10
[ ok ] listed depth was the happy path
[ -- ] you kept clicking anyway

        ╔══════════════════════════════════════════════╗
        ║                                              ║
        ║            E R R O R   6 9 6 9               ║
        ║                                              ║
        ║   "nice"                                     ║
        ║                                              ║
        ╚══════════════════════════════════════════════╝

$ status
  code         ${depth}/${SIX9_MAX} until the real 404
  reason       you went past listing; market is illiquid out here
  action       the riddle was the point; the depth is the joke

$ depth --visual
  ${bar}

$ hint
  method is the medicine.
  the exit is up.
`}
        </pre>
        <div className="six9-actions">
          <RecurseButton currentDepth={depth} />
        </div>
        <div className="six9-nav">
          <Link href="/" className="six9-back">← home</Link>
          <span className="six9-dot">·</span>
          <Link href="/argument" className="six9-back">argument</Link>
          <span className="six9-dot">·</span>
          <Link href="/positions" className="six9-back">positions</Link>
        </div>
      </div>
    </main>
  );
}
