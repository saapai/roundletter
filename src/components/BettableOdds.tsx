// Public book — sealed predictions, each priced as a percentage in the 1–90 band.
// Odds are the book's prior. No bets accepted; the record settles whether
// anyone took the other side or not. Each bet shows days-to-resolve computed
// at render time.

type Bet = {
  id: string;
  thesis: string;
  odds: number;
  horizon: string;
  sealed: string;
  resolves: string;
};

const BOOK: Bet[] = [
  { id: "b1", thesis: "portfolio over $5,000",              odds: 42, horizon: "by 21 jun", sealed: "2026-04-14", resolves: "2026-06-21" },
  { id: "b2", thesis: "portfolio over $10,000",             odds: 12, horizon: "by 21 jun", sealed: "2026-04-14", resolves: "2026-06-21" },
  { id: "b3", thesis: "portfolio over $100,000",            odds: 1,  horizon: "by 21 jun", sealed: "2026-04-14", resolves: "2026-06-21" },
  { id: "b4", thesis: "IONQ closes above $60",              odds: 28, horizon: "by 21 jun", sealed: "2026-04-14", resolves: "2026-06-21" },
  { id: "b5", thesis: "NVDA beats on 20 may",               odds: 68, horizon: "earnings",  sealed: "2026-04-17", resolves: "2026-05-20" },
  { id: "b6", thesis: "any kill-switch fires",              odds: 55, horizon: "next 90d",  sealed: "2026-04-14", resolves: "2026-07-13" },
  { id: "b7", thesis: "QTUM draws 30% → SGOV deploys",      odds: 22, horizon: "next 90d",  sealed: "2026-04-14", resolves: "2026-07-13" },
  { id: "b8", thesis: "panel calibrated at cycle 17",       odds: 60, horizon: "365d",      sealed: "2026-04-14", resolves: "2027-04-14" },
];

function daysLeft(iso: string): number {
  const target = Date.parse(iso + "T23:59:59Z");
  const now = Date.now();
  return Math.max(0, Math.ceil((target - now) / (1000 * 60 * 60 * 24)));
}

function fmtDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const MONTHS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
  const [, , mm, dd] = m;
  return `${Number(dd)} ${MONTHS[Number(mm) - 1]}`;
}

export default function BettableOdds() {
  return (
    <section className="book">
      <header className="book-head">
        <div className="book-eyebrow">// the book · 1–90</div>
        <h2 className="book-title">Put your money where my mouth is.</h2>
        <p className="book-sub">
          Sealed claims on this round. The odds are the book's prior. Agree, fade, or read the record.
        </p>
      </header>

      <ol className="book-list">
        {BOOK.map((b) => {
          const left = daysLeft(b.resolves);
          return (
            <li key={b.id} className="book-row">
              <div className="book-row-top">
                <span className="book-thesis">{b.thesis}</span>
                <span className="book-odds">{b.odds}%</span>
              </div>
              <div className="book-bar" aria-hidden="true">
                <div className="book-bar-fill" style={{ width: `${b.odds}%` }} />
              </div>
              <div className="book-meta">
                <span>sealed {fmtDate(b.sealed)}</span>
                <span className="book-sep">·</span>
                <span>resolves {fmtDate(b.resolves)}</span>
                <span className="book-sep">·</span>
                <span className="book-countdown">{left} days left</span>
              </div>
            </li>
          );
        })}
      </ol>

      <p className="book-foot">
        No bets accepted here. This is a public prior, not a prop-bet market. The record settles the bet whether anyone took it or not.
      </p>
    </section>
  );
}
