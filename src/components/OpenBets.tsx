"use client";

// Open bets — sub-bets the panel is tracking live. Each row shows a
// question + the panel's implied probability for YES / NO (not
// american odds). Clicking YES or NO opens the native messages
// composer pre-filled with the finder's position.
//
// Economics:
// · portfolio-to-$100k is YES-only. the AI uses the pool to hedge the
//   other yes sides + distribute to yeses.
// · auction attendance + auction gross skew YES DOWN — the public can
//   influence those, so driving them benefits the book + the finder.
// · lakers ladder skews YES SLIGHTLY HIGH (3-5pp above sharp
//   kalshi/polymarket fair) — LA bettors bias pro-lakers, the small
//   premium benefits the book without being arb-able.

import { HUNT_PHONE_TEL, HUNT_PHONE_DISPLAY } from "@/lib/hunt";

type Bet = {
  id: string;
  label: string;
  yesPct: number;             // implied probability YES (0..100)
  noPct: number | null;       // null → YES-only
  note?: string;
  lastReviewed: string;       // ISO date YYYY-MM-DD
};

// All lines were re-reviewed together on this date. Updating the
// constant flips every bet's tag; per-bet overrides stay in each row.
const LINES_LAST_REVIEWED = "2026-04-22";

const BETS: Bet[] = [
  {
    id: "portfolio-100k",
    label: "portfolio reaches $100,000 by 21 jun 2026",
    yesPct: 3,
    noPct: null,
    note: "the house bet. the AI uses the yes pool to hedge the other yes bets and distribute winnings. no NO side — that's the point.",
    lastReviewed: LINES_LAST_REVIEWED,
  },
  {
    id: "portfolio-25k",
    label: "portfolio reaches $25,000 before 21 jun",
    yesPct: 12,
    noPct: 88,
    lastReviewed: LINES_LAST_REVIEWED,
  },
  {
    id: "portfolio-10k",
    label: "portfolio reaches $10,000 before 21 jun",
    yesPct: 28,
    noPct: 72,
    lastReviewed: LINES_LAST_REVIEWED,
  },
  {
    id: "ionq-beats-consensus",
    label: "IONQ beats the street for 1Q 2026",
    yesPct: 46,
    noPct: 54,
    lastReviewed: LINES_LAST_REVIEWED,
  },
  {
    id: "nvda-beats-consensus",
    label: "NVDA beats the street for 1Q 2026",
    yesPct: 66,
    noPct: 34,
    lastReviewed: LINES_LAST_REVIEWED,
  },
  {
    id: "qtum-50",
    label: "QTUM closes above $50 before 21 jun",
    yesPct: 38,
    noPct: 62,
    lastReviewed: LINES_LAST_REVIEWED,
  },
  {
    id: "spray-paint-attendance",
    label: "spray-paint auction friday (ovation) hits 100+ people",
    yesPct: 18,
    noPct: 82,
    note: "you can drive this one. panel skews YES low on outcomes the public can influence — show up, bet YES, win the bigger payout. same mechanic below.",
    lastReviewed: LINES_LAST_REVIEWED,
  },
  {
    id: "auction-gross",
    label: "friday auction grosses over $500 in bids",
    yesPct: 22,
    noPct: 78,
    lastReviewed: LINES_LAST_REVIEWED,
  },
  // — NBA playoff futures · cross-referenced against kalshi + polymarket +
  //   FanDuel + DraftKings + ESPN + covers by a research agent on this
  //   review date. lakers series is 2-0 vs Rockets after games 1 + 2;
  //   Luka + Reaves targeting return game 5. lakers ladder ~3pp HIGH on
  //   YES to soak LA-biased bets; cavs + finals-7 sit at fair.
  {
    id: "nba-lakers-round-one",
    label: "lakers win their first-round series vs HOU (up 2-0)",
    yesPct: 85,
    noPct: 15,
    note: "lakers 2-0 after 107-98 + 101-94 wins; luka/reaves targeting return. sharp consensus ~82% post-game-2; panel sits +3pp high on YES. la bettors bias pro-lakers; premium absorbs some of that skew.",
    lastReviewed: LINES_LAST_REVIEWED,
  },
  {
    id: "nba-lakers-conf-semis",
    label: "lakers reach the conference finals (win two rounds)",
    yesPct: 19,
    noPct: 81,
    lastReviewed: LINES_LAST_REVIEWED,
  },
  {
    id: "nba-lakers-finals",
    label: "lakers reach the 2026 NBA finals (win three rounds)",
    yesPct: 9,
    noPct: 91,
    lastReviewed: LINES_LAST_REVIEWED,
  },
  {
    id: "nba-lakers-chip",
    label: "lakers win the 2026 NBA championship (all four rounds)",
    yesPct: 4,
    noPct: 96,
    lastReviewed: LINES_LAST_REVIEWED,
  },
  {
    id: "nba-cavs-chip",
    label: "cavaliers win the 2026 NBA championship",
    yesPct: 6,
    noPct: 94,
    lastReviewed: LINES_LAST_REVIEWED,
  },
  {
    id: "nba-finals-seven",
    label: "the 2026 NBA finals go 7 games",
    yesPct: 18,
    noPct: 82,
    lastReviewed: LINES_LAST_REVIEWED,
  },
];

function fmtPct(n: number): string {
  return `${n}%`;
}

function fmtReviewed(iso: string): string {
  const d = new Date(iso + "T12:00:00Z");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toLowerCase();
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
          each yes / no opens your messages to {HUNT_PHONE_DISPLAY} · the panel
          reads + confirms by text · lines reviewed{" "}
          <strong>{fmtReviewed(LINES_LAST_REVIEWED)}</strong>
        </span>
      </div>

      <ul className="home-bets-list">
        {BETS.map((bet) => (
          <li
            key={bet.id}
            className={`home-bets-row ${bet.noPct === null ? "is-yesonly" : ""}`}
          >
            <div className="home-bets-row-head">
              <span className="home-bets-label">{bet.label}</span>
              <span className="home-bets-line">
                panel · {fmtPct(bet.yesPct)} yes
                {bet.noPct !== null ? ` / ${fmtPct(bet.noPct)} no` : " · no-no"}
                {" · reviewed "}{fmtReviewed(bet.lastReviewed)}
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
          lines reviewed weekdays · panel skews YES down on outcomes you can
          influence, up on one-sided bias · no NO on portfolio-to-$100k.
        </em>
      </p>
      <details className="home-bets-expand">
        <summary>panel mechanics · how the pool works</summary>
        <p>
          <em>
            percentages are the panel&rsquo;s implied probabilities, not book
            prices. stakes negotiate by text. no NO on portfolio-to-$100k —
            the AI uses the yes pool to hedge the other yes bets and
            distribute winnings to the book. the panel purposefully skews YES
            down on outcomes the public can influence (auction attendance,
            auction gross), and up on outcomes with one-sided public bias
            (lakers ladder, LA-weighted audience). the prediction-market book
            rides on 10% of the total portfolio stake; every payout comes
            from that slice, every gain rolls back into it.
          </em>
        </p>
      </details>
    </section>
  );
}
