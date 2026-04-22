"use client";

// Open bets — sub-bets the panel is tracking live. Each row shows a
// question, the panel's current line (yes/no odds), and yes/no buttons
// that open an SMS composer pre-filled with the finder's position. Only
// the "portfolio to $100,000 by 21 jun" bet is YES-only — the AI uses
// the pool to hedge and distribute to yeses. All others allow either
// side so the public is genuinely trading the book with us.

import { HUNT_PHONE_TEL, HUNT_PHONE_DISPLAY } from "@/lib/hunt";

type Bet = {
  id: string;
  label: string;
  line: string;
  yesOdds: string;
  noOdds: string | null;      // null → YES-only bet
  note?: string;
};

const BETS: Bet[] = [
  {
    id: "portfolio-100k",
    label: "portfolio reaches $100,000 by 21 jun 2026",
    line: "+2900 / no no",
    yesOdds: "+2900",
    noOdds: null,
    note: "the house bet. the AI uses the yes pool to hedge other yes bets and distribute winnings. no NO side — that's the point.",
  },
  {
    id: "portfolio-25k",
    label: "portfolio reaches $25,000 before 21 jun",
    line: "+450 / −600",
    yesOdds: "+450",
    noOdds: "−600",
  },
  {
    id: "portfolio-10k",
    label: "portfolio reaches $10,000 before 21 jun",
    line: "+125 / −145",
    yesOdds: "+125",
    noOdds: "−145",
  },
  {
    id: "ionq-beats-consensus",
    label: "IONQ beats the street for 1Q 2026",
    line: "+110 / −135",
    yesOdds: "+110",
    noOdds: "−135",
  },
  {
    id: "nvda-beats-consensus",
    label: "NVDA beats the street for 1Q 2026",
    line: "−175 / +145",
    yesOdds: "−175",
    noOdds: "+145",
  },
  {
    id: "qtum-50",
    label: "QTUM closes above $50 before 21 jun",
    line: "−110 / −110",
    yesOdds: "−110",
    noOdds: "−110",
  },
  {
    id: "spray-paint-attendance",
    label: "spray-paint auction friday (ovation) hits 100+ people",
    line: "+220 / −280",
    yesOdds: "+220",
    noOdds: "−280",
  },
  {
    id: "auction-gross",
    label: "friday auction grosses over $500 in bids",
    line: "−115 / −115",
    yesOdds: "−115",
    noOdds: "−115",
  },
];

function buildSms(side: "YES" | "NO", bet: Bet, stake: string = "") {
  const body =
    `betting ${side} on [${bet.label}] (line ${bet.line})` +
    (stake ? ` · stake ${stake}` : "") +
    `\n— via aureliex.com/open-bets`;
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
          <li key={bet.id} className={`home-bets-row ${bet.noOdds === null ? "is-yesonly" : ""}`}>
            <div className="home-bets-row-head">
              <span className="home-bets-label">{bet.label}</span>
              <span className="home-bets-line">line · {bet.line}</span>
            </div>
            <div className="home-bets-actions">
              <a
                className="home-bets-btn home-bets-btn-yes"
                href={buildSms("YES", bet)}
              >
                <span className="home-bets-btn-k">yes</span>
                <span className="home-bets-btn-odds">{bet.yesOdds}</span>
              </a>
              {bet.noOdds === null ? (
                <span className="home-bets-btn home-bets-btn-none" aria-disabled="true">
                  <span className="home-bets-btn-k">no</span>
                  <span className="home-bets-btn-odds">—</span>
                </span>
              ) : (
                <a
                  className="home-bets-btn home-bets-btn-no"
                  href={buildSms("NO", bet)}
                >
                  <span className="home-bets-btn-k">no</span>
                  <span className="home-bets-btn-odds">{bet.noOdds}</span>
                </a>
              )}
            </div>
            {bet.note ? <p className="home-bets-note"><em>{bet.note}</em></p> : null}
          </li>
        ))}
      </ul>

      <p className="home-bets-foot">
        <em>
          lines are the panel&rsquo;s current read, not market odds; stakes negotiate
          by text. no NO on portfolio-to-$100k — the AI uses the yes pool to hedge
          the other yes bets and distribute winnings to the book.
        </em>
      </p>
    </section>
  );
}
