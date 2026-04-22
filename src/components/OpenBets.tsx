"use client";

// Open bets — sub-bets the panel is tracking live. Each row shows a
// question and the panel's implied probability for YES / NO (not
// american odds — the audience here is not a sportsbook audience).
// Clicking YES or NO opens the native messages composer pre-filled
// with the finder's position. Only the "portfolio to $100k by 21 jun"
// bet is YES-only; the AI uses the pool to hedge the other yes sides
// and distribute to yeses.

import { HUNT_PHONE_TEL, HUNT_PHONE_DISPLAY } from "@/lib/hunt";

type Bet = {
  id: string;
  label: string;
  yesPct: number;   // implied probability YES (0..100)
  noPct: number | null;  // null → YES-only bet
  note?: string;
};

// Panel's current read as implied probabilities. Numbers are rounded to
// whole percentage points — sharper feels false for bets this bespoke.
const BETS: Bet[] = [
  {
    id: "portfolio-100k",
    label: "portfolio reaches $100,000 by 21 jun 2026",
    yesPct: 3,
    noPct: null,
    note: "the house bet. the AI uses the yes pool to hedge the other yes bets and distribute winnings. no NO side — that's the point.",
  },
  {
    id: "portfolio-25k",
    label: "portfolio reaches $25,000 before 21 jun",
    yesPct: 18,
    noPct: 82,
  },
  {
    id: "portfolio-10k",
    label: "portfolio reaches $10,000 before 21 jun",
    yesPct: 44,
    noPct: 56,
  },
  {
    id: "ionq-beats-consensus",
    label: "IONQ beats the street for 1Q 2026",
    yesPct: 48,
    noPct: 52,
  },
  {
    id: "nvda-beats-consensus",
    label: "NVDA beats the street for 1Q 2026",
    yesPct: 64,
    noPct: 36,
  },
  {
    id: "qtum-50",
    label: "QTUM closes above $50 before 21 jun",
    yesPct: 50,
    noPct: 50,
  },
  {
    id: "spray-paint-attendance",
    label: "spray-paint auction friday (ovation) hits 100+ people",
    yesPct: 31,
    noPct: 69,
  },
  {
    id: "auction-gross",
    label: "friday auction grosses over $500 in bids",
    yesPct: 47,
    noPct: 53,
  },
];

function fmtPct(n: number): string {
  return `${n}%`;
}

function buildSms(side: "YES" | "NO", bet: Bet): string {
  const panel =
    side === "YES"
      ? `panel at ${bet.yesPct}%`
      : `panel at ${bet.noPct ?? "—"}%`;
  const body =
    `betting ${side} on [${bet.label}] (${panel})\n— via aureliex.com/#open-bets`;
  const num = HUNT_PHONE_TEL.startsWith("tel:")
    ? HUNT_PHONE_TEL.slice(4)
    : HUNT_PHONE_TEL;
  return `sms:${num}?&body=${encodeURIComponent(body)}`;
}

export default function OpenBets() {
  return (
    <section className="home-bets" id="open-bets" aria-label="open bets">
      <div className="home-bets-head">
        <span className="home-bets-eye">// open bets</span>
        <span className="home-bets-sub">
          each yes / no opens your messages to {HUNT_PHONE_DISPLAY} · the panel reads + confirms by text
        </span>
      </div>

      <ul className="home-bets-list">
        {BETS.map((bet) => (
          <li key={bet.id} className={`home-bets-row ${bet.noPct === null ? "is-yesonly" : ""}`}>
            <div className="home-bets-row-head">
              <span className="home-bets-label">{bet.label}</span>
              <span className="home-bets-line">
                panel · {fmtPct(bet.yesPct)} yes
                {bet.noPct !== null ? ` / ${fmtPct(bet.noPct)} no` : " · no-no"}
              </span>
            </div>
            <div className="home-bets-actions">
              <a className="home-bets-btn home-bets-btn-yes" href={buildSms("YES", bet)}>
                <span className="home-bets-btn-k">yes</span>
                <span className="home-bets-btn-odds">{fmtPct(bet.yesPct)}</span>
              </a>
              {bet.noPct === null ? (
                <span className="home-bets-btn home-bets-btn-none" aria-disabled="true">
                  <span className="home-bets-btn-k">no</span>
                  <span className="home-bets-btn-odds">—</span>
                </span>
              ) : (
                <a className="home-bets-btn home-bets-btn-no" href={buildSms("NO", bet)}>
                  <span className="home-bets-btn-k">no</span>
                  <span className="home-bets-btn-odds">{fmtPct(bet.noPct)}</span>
                </a>
              )}
            </div>
            {bet.note ? <p className="home-bets-note"><em>{bet.note}</em></p> : null}
          </li>
        ))}
      </ul>

      <p className="home-bets-foot">
        <em>
          percentages are the panel&rsquo;s implied probabilities, not book
          prices. stakes negotiate by text. no NO on portfolio-to-$100k —
          the AI uses the yes pool to hedge the other yes bets and
          distribute winnings to the book.
        </em>
      </p>
    </section>
  );
}
