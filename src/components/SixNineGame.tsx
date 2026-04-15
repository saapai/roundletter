"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Standalone 6969 recursion game. All state is client-side (sessionStorage).
// No URL recursion anymore.
//
// Rules:
//  - Depth starts at 10 every time the component mounts.
//  - Main "ERROR 6969" button: +1 depth. At depth 26+ the button becomes a
//    link to /6969 (the pretend-404 trailer). The 6969 button is the only
//    one that can push past 20 (and ultimately past 25).
//  - Misdirect "recurse" button: -25 depth → always falls below 10 → bounces
//    home with a reset. Trap by design.
//  - Mini easter eggs (scattered small buttons) shift depth by various step
//    sizes, positive or negative. They cap at 20 upward and cannot push past
//    20; they bounce home if they'd drop depth below 10.
//  - Any drop below 10 from any source = bounce to / (lose).

const START_DEPTH = 10;
const EGG_CAP = 20;
const SIX9_ERROR_AT = 26;

type MiniEgg = { id: string; label: string; delta: number };
const MINI_EGGS: MiniEgg[] = [
  { id: "e1", label: "[ +2 ]", delta: +2 },
  { id: "e2", label: "[ -2 ]", delta: -2 },
  { id: "e3", label: "[ +5 ]", delta: +5 },
  { id: "e4", label: "[ -5 ]", delta: -5 },
  { id: "e5", label: "[ +3 ]", delta: +3 },
  { id: "e6", label: "[ -3 ]", delta: -3 },
];

export default function SixNineGame() {
  const router = useRouter();
  const [depth, setDepth] = useState<number>(START_DEPTH);
  const firedLossRef = useRef(false);

  // Mount → start at 10 every time. Refresh resets. sessionStorage is read
  // only so external components (cli-reveal) can see current depth if they
  // want to; we don't persist between mounts.
  useEffect(() => {
    setDepth(START_DEPTH);
    try { sessionStorage.setItem("polymarket-depth", String(START_DEPTH)); } catch {}
  }, []);

  const loseHome = () => {
    if (firedLossRef.current) return;
    firedLossRef.current = true;
    try { sessionStorage.setItem("polymarket-depth", String(START_DEPTH)); } catch {}
    router.push("/");
  };

  const apply = (delta: number, opts?: { cap20?: boolean; noPast25?: boolean }) => {
    const next = depth + delta;
    if (next < START_DEPTH) {
      loseHome();
      return;
    }
    // Only the 6969 button can push past 20/25. Mini eggs are capped at 20.
    if (opts?.cap20 && next > EGG_CAP) {
      setDepth(EGG_CAP);
      try { sessionStorage.setItem("polymarket-depth", String(EGG_CAP)); } catch {}
      return;
    }
    setDepth(next);
    try { sessionStorage.setItem("polymarket-depth", String(next)); } catch {}
  };

  const handleMain = () => apply(+1);
  const handleMisdirect = () => apply(-25);

  const overflowed = depth >= SIX9_ERROR_AT;
  const bar = "█".repeat(Math.min(depth, 25)) + "░".repeat(Math.max(0, 25 - depth));

  return (
    <section className="six9-game-wrap">
      <p className="six9-game-eyebrow">// /argument · terminal · recursion game</p>
      <div className="six9-card six9-game-card">
        <header className="cli-bar">
          <span className="cli-dot cli-dot-r" />
          <span className="cli-dot cli-dot-y" />
          <span className="cli-dot cli-dot-g" />
          <span className="cli-title">~ / argument / wordle.sh</span>
          <span className="cli-pid">pid {String(depth).padStart(4, "0")}</span>
        </header>

        {overflowed ? (
          // past 25 — the main button becomes a real link to /6969
          <Link href="/6969" className="six9-card-click six9-overflow-link">
            <pre className="cli-body six9-body">
{`$ ./wordle --decode POLYMARKET --depth ${depth}
[ !! ] recursion exceeded cap · 25
[ !! ] 26+ · market is illiquid
[ OK ] the error page is that way

        ╔══════════════════════════════════════════════╗
        ║                                              ║
        ║          E R R O R   4 0 4                   ║
        ║                                              ║
        ║    click this → /6969                        ║
        ║                                              ║
        ╚══════════════════════════════════════════════╝

$ next
  → /6969 · the trailer
`}
            </pre>
          </Link>
        ) : (
          <button type="button" onClick={handleMain} className="six9-card-click" aria-label={`increment depth to ${depth + 1}`}>
            <pre className="cli-body six9-body">
{`$ ./wordle --decode POLYMARKET --depth ${depth}
[ .. ] listed depth was the happy path
[ -- ] you kept clicking anyway

        ╔══════════════════════════════════════════════╗
        ║                                              ║
        ║           E R R O R   6 9 6 9                ║
        ║                                              ║
        ║   "nice" — click this to recurse             ║
        ║                                              ║
        ╚══════════════════════════════════════════════╝

$ status
  code         ${depth}/25 until the real 404
  reason       the 6969 is the only way up past 20
  action       step back = -25 = home. tread carefully.

$ depth --visual
  ${bar}

$ next
  → depth ${depth + 1}${depth + 1 >= SIX9_ERROR_AT ? " · → /6969 page" : ""}
`}
            </pre>
          </button>
        )}

        <div className="six9-minieggs" aria-label="mini easter eggs">
          {MINI_EGGS.map((egg) => (
            <button
              key={egg.id}
              type="button"
              onClick={() => apply(egg.delta, { cap20: true })}
              className={`six9-minibtn ${egg.delta > 0 ? "pos" : "neg"}`}
              title="mini easter egg"
            >
              {egg.label}
            </button>
          ))}
        </div>

        <div className="six9-actions">
          <button type="button" onClick={handleMisdirect} className="six9-recurse six9-misdirect">
            [ misdirect · recurse −25 ]
          </button>
        </div>
      </div>
    </section>
  );
}
