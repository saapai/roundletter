import Link from "next/link";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

export default function FridayPage() {
  return (
    <main className="friday-root">
      <div className="friday-stage">

        <div className="friday-eyebrow">a calendar for the bot named after a day</div>

        <div className="friday-grid">
          {DAYS.map((day) => {
            const isFriday = day === "fri";
            return (
              <div key={day} className={`friday-cell${isFriday ? " is-friday" : ""}`}>
                <div className="cell-day">{day}</div>
                <div className="cell-date">{isFriday ? "·" : ""}</div>
                {isFriday && <div className="cell-mark">friday</div>}
              </div>
            );
          })}
        </div>

        <div className="friday-footer">
          <p className="friday-line"><em>Friday is the iMessage bot that ran SEP's rush.</em></p>
          <p className="friday-line faint"><em>She texts in lowercase. She answers in seconds. She does not miss.</em></p>
          <p className="friday-meta">
            <Link href="https://github.com/saapai/sep-rush-checkin" target="_blank" rel="noopener noreferrer" className="friday-repo-link">
              github.com/saapai/sep-rush-checkin →
            </Link>
          </p>
          <Link href="/" className="friday-back">← aureliex</Link>
        </div>

      </div>
    </main>
  );
}
