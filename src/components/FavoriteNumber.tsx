"use client";

import { useEffect, useState } from "react";
import { HUNT_PHONE_TEL, HUNT_PHONE_DISPLAY } from "@/lib/hunt";

// "The AI's favorite number" — a Wesley Wang Nothing-Except-Everything
// homage.  Fetches live probabilities from /api/agents/favorite-number
// (refreshed hourly by the panel + by vercel cron).  Each candidate row
// is BETTABLE — tapping opens the native Messages composer with the
// pick + panel % pre-filled.  Closes fri midnight PT (same bell as
// the art portfolio + auction).

type Candidate = {
  n: string;
  label: string;
  pct: number;
  reason: string;
};
type Feed = {
  source: "claude" | "stub";
  generated_at: string;
  last_argued_at: string;
  moderator: string;
  candidates: Candidate[];
};

const CLOSE_ISO = "2026-04-25T00:00:00-07:00";

const FALLBACK: Candidate[] = [
  { n: "69",      label: "sixty-nine",              pct: 34, reason: "the credits page is /6969. the hunt ledger is /6969#hunt. 'channel 69' is already the egg that fires when the tv knobs land. the document points here six times before it points anywhere else." },
  { n: "420",     label: "four-twenty",             pct: 19, reason: "the counter-culture route. a sunflower sunset variant of the cmiygl homage. a number the audience already reads as belonging to them before the site gets a word in." },
  { n: "21",      label: "twenty-one",              pct: 14, reason: "the birthday. 21 june. the day the book closes and the ceremony runs. if the document is built around one date, it is this one." },
  { n: "10",      label: "ten",                     pct: 11, reason: "the sidecars (10% art, 10% prediction). the holdings count. the S&P does 10× in 25 years — the gap we're trying to close in two months." },
  { n: "1997",    label: "nineteen ninety-seven",   pct: 8,  reason: "radiohead · let down · ok computer. the pre-mortem. the frame the whole site is a derivative of." },
  { n: "2018",    label: "twenty-eighteen",         pct: 7,  reason: "kanye · ghost town · ye. 21 savage · a lot. two of the three launch-trailer songs come from this year; the bottom bookend is here." },
  { n: "27.1",    label: "twenty-seven-point-one",  pct: 4,  reason: "the multiplier on the chapter 02 vital: $3,453.83 × 27.1 = $100,000. a number that exists only because the goal does." },
  { n: "3453.83", label: "thirty-four fifty-three", pct: 3,  reason: "the baseline. the day the round got sealed. the number everything on the positions page is measured against." },
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

function fmtArgued(iso: string): string {
  const d = Date.parse(iso);
  if (Number.isNaN(d)) return "—";
  const secs = Math.max(0, (Date.now() - d) / 1000);
  if (secs < 90) return "just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

function bidSms(c: Candidate): string {
  const body = [
    `betting on · ${c.n} · ${c.label}`,
    `panel · ${c.pct}%`,
    `reason · ${c.reason}`,
    "",
    "— via aureliex.com/#favorite-number",
  ].join("\n");
  const num = HUNT_PHONE_TEL.replace(/^tel:/, "");
  return `sms:${num}?&body=${encodeURIComponent(body)}`;
}

export default function FavoriteNumber() {
  const [feed, setFeed] = useState<Feed | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    let alive = true;
    const pull = () =>
      fetch("/api/agents/favorite-number", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => {
          if (!alive || !j) return;
          setFeed(j as Feed);
        })
        .catch(() => {});
    pull();
    // refresh every 10 min so the hourly tick is reflected within the minute
    const poll = window.setInterval(pull, 10 * 60 * 1000);
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      alive = false;
      window.clearInterval(poll);
      window.clearInterval(tick);
    };
  }, []);

  const candidates = feed?.candidates ?? FALLBACK;
  const closeMs = Date.parse(CLOSE_ISO);
  const secs = Math.max(0, Math.floor((closeMs - now) / 1000));
  const settled = secs === 0;
  const max = Math.max(...candidates.map((c) => c.pct));
  const argued = feed ? fmtArgued(feed.last_argued_at) : "loading";
  const source = feed?.source ?? "stub";

  return (
    <section className="fav" id="favorite-number" aria-label="the ai's favorite number">
      <div className="fav-head">
        <div>
          <div className="fav-eye">// the ai&rsquo;s favorite number · argued hourly</div>
          <h2 className="fav-title">
            <em>what number is this document about?</em>
          </h2>
          <p className="fav-sub">
            panel re-scores every hour · settles <strong>fri 24 apr · midnight PT</strong>.
            tap any row to place a bet via imessage — holders of the
            correct number at lock get a stake in round 1.
          </p>
          <p className="fav-argued">
            <em>last argued · <strong>{argued}</strong> · source · {source}</em>
          </p>
        </div>
        <div className={`fav-countdown ${settled ? "is-settled" : ""}`}>
          <div className="fav-countdown-k">{settled ? "locked" : "closes"}</div>
          <div className="fav-countdown-v">{fmtCountdown(secs)}</div>
        </div>
      </div>

      {feed?.moderator ? (
        <p className="fav-moderator">
          <em>moderator · {feed.moderator}</em>
        </p>
      ) : null}

      <ul className="fav-list">
        {candidates.map((c, i) => {
          const isLeader = i === 0;
          const barW = max > 0 ? (c.pct / max) * 100 : 0;
          return (
            <li key={c.n} className={`fav-row ${isLeader ? "is-leader" : ""}`}>
              <a className="fav-row-link" href={bidSms(c)} aria-label={`bet on ${c.n} at ${c.pct}%`}>
                <div className="fav-row-head">
                  <span className="fav-n">{c.n}</span>
                  <span className="fav-lbl"><em>{c.label}</em></span>
                  <span className="fav-pct">{c.pct}%</span>
                  <span className="fav-bet">bet · {HUNT_PHONE_DISPLAY}</span>
                </div>
                <div className="fav-bar" aria-hidden="true">
                  <div className="fav-bar-fill" style={{ width: `${barW}%` }} />
                </div>
                <p className="fav-reason"><em>{c.reason}</em></p>
              </a>
            </li>
          );
        })}
      </ul>

      <p className="fav-foot">
        <em>
          lines re-argued hourly by the panel (bull · bear · macro · flow ·
          historian). stakes settle by text. the holder of the winning
          number at lock gets a small stake in round 1 — ratio by
          negotiation.
        </em>
      </p>
    </section>
  );
}
