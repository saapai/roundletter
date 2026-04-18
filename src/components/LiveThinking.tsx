"use client";
import { useEffect, useState } from "react";

// Claude-Code-style rotating-verb thinking strip. Orange verb + dim task below.
// Pure client-side — no data fetch. The "thinking" is ornamental but consistent
// with what the daily-debate cron and 5h-argument cron are literally doing.

const VERBS = [
  "Brewing",
  "Cogitating",
  "Canoodling",
  "Flummoxing",
  "Germinating",
  "Untangling some thoughts",
  "Cross-referencing seventeen theories",
  "Weighing a few approaches",
  "Double-checking the double-checks",
  "Sautéing the premise",
  "Thinking",
];

const TASKS = [
  "// routing the daily debate onto specific positions",
  "// scoring Bull @ 30d on hunch H1 — NVDA earnings 20 may",
  "// checking S-3 / 424B5 on three pure-plays",
  "// re-weighting Flow after clean concession in round 2",
  "// PMI 24 apr — pre-committing SGOV deploy if < 48",
  "// calibrating against S&P 68-day return",
  "// computing Brier on last 20 resolved predictions",
  "// waiting for the second player to file",
];

export default function LiveThinking() {
  const [vIdx, setVIdx] = useState(0);
  const [tIdx, setTIdx] = useState(0);
  const [secs, setSecs] = useState(0);

  useEffect(() => {
    const vTick = setInterval(() => setVIdx((i) => (i + 1) % VERBS.length), 2600);
    const tTick = setInterval(() => setTIdx((i) => (i + 1) % TASKS.length), 4200);
    const sTick = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => {
      clearInterval(vTick);
      clearInterval(tTick);
      clearInterval(sTick);
    };
  }, []);

  return (
    <section className="v3-thinking" aria-label="live panel status">
      <div className="v3-thinking-row">
        <span className="v3-thinking-star">✳</span>
        <span className="v3-thinking-verb">{VERBS[vIdx]}…</span>
        <span className="v3-thinking-meta">
          ({secs}s · thinking · the panel is arguing at midnight ET)
        </span>
      </div>
      <div className="v3-thinking-task">
        <span className="v3-thinking-branch">└</span>
        <span>{TASKS[tIdx]}</span>
      </div>
    </section>
  );
}
