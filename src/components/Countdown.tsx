"use client";
import { useEffect, useState } from "react";

function nextOccurrence(birthdateISO: string): Date {
  const [, m, d] = birthdateISO.split("-");
  const now = new Date();
  const y = now.getFullYear();
  let candidate = new Date(`${y}-${m}-${d}T00:00:00`);
  if (candidate.getTime() < now.getTime()) {
    candidate = new Date(`${y + 1}-${m}-${d}T00:00:00`);
  }
  return candidate;
}

export default function Countdown({ birthdate, label = "days to the party" }: { birthdate: string; label?: string }) {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => {
      const target = nextOccurrence(birthdate);
      const d = Math.max(0, Math.ceil((target.getTime() - Date.now()) / 86_400_000));
      setDays(d);
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [birthdate]);

  return (
    <span className="inline-flex items-baseline gap-2">
      <span className="font-mono text-[13px] text-ink tabular-nums">{days === null ? "—" : days}</span>
      <span className="text-[10px] tracking-[0.22em] uppercase text-graphite">{label}</span>
    </span>
  );
}
