"use client";

import { useEffect, useState } from "react";

/**
 * Live countdown to the spray paint auction — Ovation Hollywood,
 * this Friday, sunset to midnight. "You'll find it."
 *
 * Takes an ISO target and renders `Nd HH:MM:SS` until doors.
 * Returns a dash placeholder during SSR so hydration is stable.
 */

type Props = { targetIso: string };

function diff(target: number) {
  const ms = target - Date.now();
  if (ms <= 0) return { done: true, d: 0, h: 0, m: 0, s: 0 };
  const s = Math.floor(ms / 1000);
  return {
    done: false,
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

const pad = (n: number) => n.toString().padStart(2, "0");

export default function AuctionCountdown({ targetIso }: Props) {
  const [mounted, setMounted] = useState(false);
  const [t, setT] = useState(() => diff(new Date(targetIso).getTime()));

  useEffect(() => {
    const target = new Date(targetIso).getTime();
    setMounted(true);
    setT(diff(target));
    const id = window.setInterval(() => setT(diff(target)), 1000);
    return () => window.clearInterval(id);
  }, [targetIso]);

  if (!mounted) return <span className="auction-clock" suppressHydrationWarning>—</span>;
  if (t.done) return <span className="auction-clock auction-clock-live">doors open · now</span>;
  return (
    <span className="auction-clock" suppressHydrationWarning>
      {t.d}d {pad(t.h)}:{pad(t.m)}:{pad(t.s)} to doors
    </span>
  );
}
