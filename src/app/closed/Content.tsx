import { getGambles, getAccomplishments } from "@/lib/closed";
import Timeline from "./Timeline";
import { logout } from "./actions";

export default function Content() {
  const gambles = getGambles();
  const accomps = getAccomplishments();

  const wins = gambles.filter(g => g.resolved && g.won === true).length;
  const losses = gambles.filter(g => g.resolved && g.won === false).length;
  const open = gambles.filter(g => !g.resolved).length;

  return (
    <article className="article">
      <div className="eyebrow">closed · invitation only · living document</div>
      <h1 style={{ textAlign: "center" }}>the locked room</h1>
      <p className="deck">
        A private ledger of the bets I place with friends, and a timeline of the
        things I've done. Public only to people who guessed the password — which
        was enough to prove they know me.
      </p>

      <h2>Why this exists</h2>
      <p>
        The three articles on the home page document the reasoning behind a
        portfolio. This one documents the reasoning behind a life. I place bets
        with my friends — on my grades, on my projects, on my timelines — and I
        resolve them in public to prove that I can reality-distort the shape of
        my own year. Every row below is a claim I had to collect or pay on. The
        stake is usually small. The record is what matters.
      </p>

      <h2>The Gambling Ledger</h2>
      <p className="ledger-summary">
        <strong>{wins}</strong> won · <strong>{losses}</strong> lost · <strong>{open}</strong> open
      </p>
      <div className="ledger">
        {gambles.slice().reverse().map((g, i) => {
          const status =
            !g.resolved ? "open" :
            g.won === true ? "won" :
            "lost";
          return (
            <div key={i} className={`ledger-row ledger-${status}`}>
              <div className="ledger-head">
                <span className="ledger-date">{g.date}</span>
                <span className="ledger-sep">·</span>
                <span className="ledger-with">with <em>{g.counterparty}</em></span>
                <span className="ledger-sep">·</span>
                <span className="ledger-stake">{g.stake}</span>
                <span className={`ledger-status status-${status}`}>{status}</span>
              </div>
              <div className="ledger-claim">&ldquo;{g.claim}&rdquo;</div>
              {g.note && <div className="ledger-note">{g.note}</div>}
            </div>
          );
        })}
      </div>

      <h2>Accomplishments, Timed</h2>
      <p>Not a résumé. A graph. Dates on the left, entries on the right, the rule in the middle is the line of my life so far.</p>
      <Timeline entries={accomps} />

      <h2>The cabinet</h2>
      <p>
        There's another door inside this one. It lives at <a className="pathlink" href="/closed/medicine">/closed/medicine</a>.
        The password is <em>one word, lowercase, eight letters</em>, and the clues on the gate spell it out in pieces if
        you're willing to sit with them. Nothing behind the door — the door is the point.
      </p>
      <ul className="herrings">
        <li><strong>things that do not open the cabinet:</strong></li>
        <li>cure · remedy · rx · tonic · dose · pill · pharma · heal</li>
        <li>drugs · capsule · balm · salve · lozenge · therapy</li>
        <li>pretty sure it isn't <em>ambrosia</em> either</li>
        <li>it is not a brand name. it is not a molecule. it is what you call the whole category at dinner.</li>
      </ul>

      <form action={logout} className="closed-footer">
        <button type="submit" className="logout-btn">sign out of the locked room</button>
      </form>

      <p className="closed-fineprint">
        Both datasets (<code>src/data/gambles.json</code> and <code>src/data/accomplishments.json</code>) are edited by hand and published on redeploy. Nothing on this page is hidden from my friends by design; it is only hidden from the public by password.
      </p>
    </article>
  );
}
