"use client";
import { useEffect, useState } from "react";

// Day-by-day scrubber. Stock-timeframe-scaler register: a horizontal track,
// one tick per day from day 1 (4/12) to resolution (birthday). Click a past
// day to "scrub" to it — URL updates to /?t=dN (YouTube-timestamp style).
// Future days are disabled. The live day glows.

type Props = {
  entryValue: number;
  startDate: string;   // e.g. "2026-04-12"
  birthdate: string;   // e.g. "June 21"
};

const MONTHS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];

function fmtDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export default function ChartScrubber({ entryValue, startDate, birthdate }: Props) {
  const start = Date.parse(`${startDate}T00:00:00-04:00`);
  const now = Date.now();
  const match = /([A-Za-z]+)\s+(\d{1,2})/.exec(birthdate);
  const monthMap: Record<string, string> = { january: "01", february: "02", march: "03", april: "04", may: "05", june: "06", july: "07", august: "08", september: "09", october: "10", november: "11", december: "12" };
  const m = match ? (monthMap[match[1].toLowerCase()] ?? "06") : "06";
  const d = match ? match[2].padStart(2, "0") : "21";
  const yr = new Date().getFullYear();
  const tryYr = Date.parse(`${yr}-${m}-${d}T00:00:00-04:00`);
  const resolve = tryYr > now ? tryYr : Date.parse(`${yr + 1}-${m}-${d}T00:00:00-04:00`);
  const dayTotal = Math.max(1, Math.ceil((resolve - start) / 86_400_000));
  const dayToday = Math.min(dayTotal, Math.max(1, Math.ceil((now - start) / 86_400_000)));

  const [selected, setSelected] = useState<number>(dayToday);

  useEffect(() => {
    const u = new URL(window.location.href);
    const t = u.searchParams.get("t");
    if (t) {
      const m = t.match(/^d(\d+)$/);
      if (m) {
        const d = parseInt(m[1], 10);
        if (d >= 1 && d <= dayTotal) setSelected(d);
      }
    }
  }, [dayTotal]);

  const pick = (d: number) => {
    if (d > dayToday) return;
    setSelected(d);
    const u = new URL(window.location.href);
    if (d === dayToday) u.searchParams.delete("t");
    else u.searchParams.set("t", `d${d}`);
    window.history.replaceState({}, "", u.toString());
  };

  const selectedTs = start + (selected - 1) * 86_400_000;
  const progressPct = Math.min(100, ((dayToday - 1) / Math.max(1, dayTotal - 1)) * 100);

  // Anchor label: day 1 shows entry value; live day shows "live"; others show "snapshot"
  let readoutValue: string;
  let readoutHint: string;
  if (selected === 1) {
    readoutValue = `$${entryValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
    readoutHint = "entry · day 1";
  } else if (selected === dayToday) {
    readoutValue = "live";
    readoutHint = "today";
  } else {
    readoutValue = "snapshot";
    readoutHint = `${((selected / dayTotal) * 100).toFixed(0)}% through the round`;
  }

  return (
    <section className="chart-scrubber" aria-label="day scrubber">
      <div className="cs-head">
        <div className="cs-eyebrow">
          // day {selected} of {dayTotal} · <span className="cs-date">{fmtDate(selectedTs)}</span>
        </div>
        <div className="cs-readout">
          <span className="cs-readout-hint">{readoutHint}</span>
          <span className={`cs-readout-value ${selected === dayToday ? "cs-readout-live" : ""}`}>
            {readoutValue}
          </span>
        </div>
      </div>

      <div className="cs-track" role="slider" aria-valuemin={1} aria-valuemax={dayTotal} aria-valuenow={selected}>
        <div className="cs-track-bar">
          <div className="cs-track-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="cs-track-ticks">
          {Array.from({ length: dayTotal }, (_, i) => i + 1).map((d) => {
            const past = d <= dayToday;
            const isToday = d === dayToday;
            const isSelected = d === selected;
            const isMilestone = d === 1 || d === dayTotal || d % 10 === 0;
            const cls = [
              "cs-tick",
              past ? "cs-tick-past" : "cs-tick-future",
              isToday ? "cs-tick-today" : "",
              isSelected ? "cs-tick-selected" : "",
              isMilestone ? "cs-tick-milestone" : "",
            ].filter(Boolean).join(" ");
            return (
              <button
                key={d}
                type="button"
                className={cls}
                style={{ left: `${((d - 1) / Math.max(1, dayTotal - 1)) * 100}%` }}
                onClick={() => pick(d)}
                disabled={!past}
                aria-label={`day ${d}`}
                title={`day ${d} · ${fmtDate(start + (d - 1) * 86_400_000)}`}
              />
            );
          })}
        </div>
      </div>

      <div className="cs-legend">
        <span>day 1 · {fmtDate(start)}</span>
        <span className="cs-legend-sep">→</span>
        <span className="cs-legend-now">day {dayToday} · <em>live</em></span>
        <span className="cs-legend-sep">→</span>
        <span>day {dayTotal} · {fmtDate(resolve)} · resolution</span>
      </div>
    </section>
  );
}
