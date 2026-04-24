"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const BIRTHDAY_ISO = "2026-06-21T00:00:00-07:00";

function computeLeft(nowMs: number): { days: number; hours: number; minutes: number } {
  const target = Date.parse(BIRTHDAY_ISO);
  const ms = Math.max(0, target - nowMs);
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  return { days, hours, minutes };
}

export default function Masthead() {
  const [left, setLeft] = useState<{ days: number; hours: number; minutes: number } | null>(null);

  useEffect(() => {
    const tick = () => setLeft(computeLeft(Date.now()));
    tick();
    const t = window.setInterval(tick, 60_000);
    return () => window.clearInterval(t);
  }, []);

  return (
    <header className="h2-masthead">
      <Link href="/" className="h2-wordmark" aria-label="aureliex — home">
        aureliex<span className="h2-wordmark-dot">.</span>
      </Link>
      <div className="h2-countdown" aria-label="days to 21 june 2026">
        {left ? (
          <>
            <span className="h2-countdown-n" suppressHydrationWarning>
              T−{left.days}d {String(left.hours).padStart(2, "0")}h
            </span>
            <span className="h2-countdown-lab">to 21 jun</span>
          </>
        ) : (
          <span className="h2-countdown-lab">21 jun 2026</span>
        )}
        <Link href="/archive" className="h2-countdown-archive">archive ↗</Link>
      </div>
    </header>
  );
}
