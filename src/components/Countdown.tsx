"use client";
import { useEffect, useState } from "react";

export default function Countdown({ target, label = "days to the party" }: { target: string; label?: string }) {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => {
      const t = new Date(target).getTime();
      const now = Date.now();
      const d = Math.max(0, Math.ceil((t - now) / 86400000));
      setDays(d);
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [target]);

  return (
    <span className="inline-flex items-baseline gap-2 text-[12px] font-body tracking-wide">
      <span className="font-mono text-base text-ink">{days === null ? "—" : days}</span>
      <span className="text-graphite uppercase tracking-[0.2em] text-[10px]">{label}</span>
    </span>
  );
}
