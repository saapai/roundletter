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

type Parts = { d: number; h: number; m: number; s: number };

function diffParts(target: Date): Parts {
  let ms = Math.max(0, target.getTime() - Date.now());
  const d = Math.floor(ms / 86_400_000); ms -= d * 86_400_000;
  const h = Math.floor(ms / 3_600_000); ms -= h * 3_600_000;
  const m = Math.floor(ms / 60_000); ms -= m * 60_000;
  const s = Math.floor(ms / 1000);
  return { d, h, m, s };
}

const pad = (n: number) => n.toString().padStart(2, "0");

export default function BirthdayCountdown({ birthdate }: { birthdate: string }) {
  const [p, setP] = useState<Parts | null>(null);

  useEffect(() => {
    const tick = () => setP(diffParts(nextOccurrence(birthdate)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [birthdate]);

  if (!p) {
    return (
      <span className="savings-countdown" aria-label="countdown to 21 june">
        <span className="savings-countdown-hms">— — : — — : — —</span>
        <span className="savings-countdown-label">to 21 june</span>
      </span>
    );
  }
  return (
    <span className="savings-countdown" aria-label="countdown to 21 june">
      <span className="savings-countdown-d">{p.d}d</span>{" "}
      <span className="savings-countdown-hms">{pad(p.h)}:{pad(p.m)}:{pad(p.s)}</span>
      <span className="savings-countdown-label">to 21 june</span>
    </span>
  );
}
