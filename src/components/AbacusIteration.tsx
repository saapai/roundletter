"use client";
import { useEffect, useState } from "react";

// Gentle live counter for the abacus round (= number of resets). Polls
// /api/v1-letters every 10s for the current round and renders a quiet
// mono line at the top of the home page.

export default function AbacusIteration() {
  const [round, setRound] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () => {
      // Timestamp param busts any intermediate (CDN/browser) cache so the
      // counter reflects the abacus round in real time.
      fetch(`/api/v1-letters?t=${Date.now()}`, { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((j: { round?: number } | null) => {
          if (!alive) return;
          if (j && typeof j.round === "number") setRound(j.round);
        })
        .catch(() => {});
    };
    load();
    const t = setInterval(load, 10000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  return (
    <p className="abacus-iter" aria-live="polite">
      <span className="abacus-iter-k">// abacus · test iteration</span>
      <span className="abacus-iter-v">
        {round == null ? "—" : String(round).padStart(3, "0")}
      </span>
    </p>
  );
}
