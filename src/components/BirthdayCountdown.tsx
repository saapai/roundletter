"use client";
import { useEffect, useState } from "react";

function nextOccurrence(birthdate: string): Date {
  const now = new Date();
  const y = now.getFullYear();
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(birthdate);
  let m = "06";
  let d = "21";
  if (iso) {
    [, m, d] = birthdate.split("-");
  } else {
    const match = /([A-Za-z]+)\s+(\d{1,2})/.exec(birthdate);
    if (match) {
      const monthMap: Record<string, string> = { january: "01", february: "02", march: "03", april: "04", may: "05", june: "06", july: "07", august: "08", september: "09", october: "10", november: "11", december: "12" };
      m = monthMap[match[1].toLowerCase()] ?? "06";
      d = match[2].padStart(2, "0");
    }
  }
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
      <span className="savings-countdown" aria-label="countdown to June 21">
        <span className="savings-countdown-hms">— — : — — : — —</span>
        <span className="savings-countdown-label">to June 21</span>
      </span>
    );
  }
  return (
    <span className="savings-countdown" aria-label="countdown to June 21">
      <span className="savings-countdown-d">{p.d}d</span>{" "}
      <span className="savings-countdown-hms">{pad(p.h)}:{pad(p.m)}:{pad(p.s)}</span>
      <span className="savings-countdown-label">to June 21</span>
    </span>
  );
}
