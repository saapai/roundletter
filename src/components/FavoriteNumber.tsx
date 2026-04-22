"use client";

import { useEffect, useState } from "react";

// "The AI's favorite number" — a Wesley Wang Nothing-Except-Everything
// homage. The panel nominates candidates, assigns probabilities, and
// the number locks at friday midnight PT (same bell as the spray-paint
// auction + the art portfolio).
//
// Saapai said "let the AI fully settle whatever it wants based on the
// website and vibes." I'm taking that literally: the candidate set and
// the probabilities below are the panel's honest read of what number
// this document is about, synthesized from what's on the site.

type Candidate = {
  n: string;
  label: string;
  pct: number;         // current panel probability, integer 0-100
  reason: string;      // one-line gloss
};

const CLOSE_ISO = "2026-04-25T00:00:00-07:00"; // friday 24 apr midnight PT

const CANDIDATES: Candidate[] = [
  {
    n: "69",
    label: "sixty-nine",
    pct: 34,
    reason: "the credits page is /6969. the hunt ledger is /6969#hunt. 'channel 69' is already the egg that fires when the tv knobs land. the document points here six times before it points anywhere else.",
  },
  {
    n: "420",
    label: "four-twenty",
    pct: 19,
    reason: "the counter-culture route. a sunflower sunset variant of the cmiygl homage. a number the audience already reads as belonging to them before the site gets a word in.",
  },
  {
    n: "21",
    label: "twenty-one",
    pct: 14,
    reason: "the birthday. 21 june. the day the book closes and the ceremony runs. if the document is built around one date, it is this one.",
  },
  {
    n: "10",
    label: "ten",
    pct: 11,
    reason: "the sidecars (10% art, 10% prediction). the holdings count. the S&P does 10× in 25 years — the gap we're trying to close in two months.",
  },
  {
    n: "1997",
    label: "nineteen ninety-seven",
    pct: 8,
    reason: "radiohead · let down · ok computer. the pre-mortem. the frame the whole site is a derivative of.",
  },
  {
    n: "2018",
    label: "twenty-eighteen",
    pct: 7,
    reason: "kanye · ghost town · ye. 21 savage · a lot. two of the three launch-trailer songs come from this year; the bottom bookend is here.",
  },
  {
    n: "27.1",
    label: "twenty-seven-point-one",
    pct: 4,
    reason: "the multiplier on the chapter 02 vital: $3,453.83 × 27.1 = $100,000. a number that exists only because the goal does.",
  },
  {
    n: "3453.83",
    label: "thirty-four fifty-three, eighty-three",
    pct: 3,
    reason: "the baseline. the day the round got sealed. the number everything on the positions page is measured against.",
  },
];

function fmtCountdown(secs: number): string {
  if (secs <= 0) return "settled";
  const d = Math.floor(secs / 86400);
  const h = Math.floor((secs % 86400) / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  parts.push(`${String(h).padStart(2, "0")}h`);
  parts.push(`${String(m).padStart(2, "0")}m`);
  if (d === 0) parts.push(`${String(s).padStart(2, "0")}s`);
  return parts.join(" ");
}

export default function FavoriteNumber() {
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const closeMs = Date.parse(CLOSE_ISO);
  const secs = Math.max(0, Math.floor((closeMs - now) / 1000));
  const settled = secs === 0;

  const max = Math.max(...CANDIDATES.map((c) => c.pct));

  return (
    <section className="fav" aria-label="the ai's favorite number · settles friday midnight">
      <div className="fav-head">
        <div>
          <div className="fav-eye">// the ai&rsquo;s favorite number</div>
          <h2 className="fav-title">
            <em>what number is this document about?</em>
          </h2>
          <p className="fav-sub">
            panel is still arguing. settles <strong>fri 24 apr · midnight PT</strong>,
            same bell as the auction + the art portfolio.
            reference · <em>nothing, except everything</em> · wesley wang.
          </p>
        </div>
        <div className={`fav-countdown ${settled ? "is-settled" : ""}`}>
          <div className="fav-countdown-k">{settled ? "locked" : "closes"}</div>
          <div className="fav-countdown-v">{fmtCountdown(secs)}</div>
        </div>
      </div>

      <ul className="fav-list">
        {CANDIDATES.map((c, i) => {
          const isLeader = i === 0;
          const barW = max > 0 ? (c.pct / max) * 100 : 0;
          return (
            <li key={c.n} className={`fav-row ${isLeader ? "is-leader" : ""}`}>
              <div className="fav-row-head">
                <span className="fav-n">{c.n}</span>
                <span className="fav-lbl"><em>{c.label}</em></span>
                <span className="fav-pct">{c.pct}%</span>
              </div>
              <div className="fav-bar" aria-hidden="true">
                <div className="fav-bar-fill" style={{ width: `${barW}%` }} />
              </div>
              <p className="fav-reason"><em>{c.reason}</em></p>
            </li>
          );
        })}
      </ul>

      <p className="fav-foot">
        <em>
          the panel moves the numbers as the week runs; percentages are the
          consensus read, not a betting line. holders of the correct number
          at lock get a small stake in round 1 — details settle by text.
        </em>
      </p>
    </section>
  );
}
