"use client";
import { useRouter } from "next/navigation";

// Renders inside the 6969 error page. Each click pushes one level deeper
// (up to depth 25, after which the catch-all returns a real 404). Also
// syncs sessionStorage so home + CLI + 6969 share one depth counter.

export default function RecurseButton({ currentDepth }: { currentDepth: number }) {
  const router = useRouter();
  const next = currentDepth + 1;

  const handle = () => {
    try { sessionStorage.setItem("polymarket-depth", String(next)); } catch {}
    const prefix = Array(next).fill("polymarket").join("/");
    router.push(`/${prefix}/argument`);
  };

  const label =
    next > 25
      ? `[ 404 at depth ${next} · the void awaits ]`
      : `[ recurse → depth ${next}/25 ]`;

  return (
    <button onClick={handle} className="six9-recurse" type="button">
      {label}
    </button>
  );
}
