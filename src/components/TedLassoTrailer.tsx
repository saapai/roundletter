import Link from "next/link";

// Pure JSX — no hooks, no client-only APIs. Renders on the server or the
// client. Used by both /positions (server-side when crowd-ever-10 is true)
// and SolvedLetters (client-side post-solve).

export default function TedLassoTrailer() {
  return (
    <Link href="/argument" className="lasso-trailer" aria-label="polymarket — argument">
      <span className="lt-darts" aria-hidden="true" />
      <span className="lt-dart" aria-hidden="true" />
      <span className="lt-corner lt-corner-tl" aria-hidden="true" />
      <span className="lt-corner lt-corner-br" aria-hidden="true" />

      <div className="lt-top-strip">
        <span className="lt-top-tick">apple · tv</span>
        <span className="lt-top-marquee">COMING SOON</span>
        <span className="lt-top-tick">ep · 01</span>
      </div>

      <div className="lt-sign" aria-label="BELIEVE">
        <span className="lt-sign-tape lt-sign-tape-tl" aria-hidden="true" />
        <span className="lt-sign-tape lt-sign-tape-tr" aria-hidden="true" />
        <span className="lt-sign-tape lt-sign-tape-bl" aria-hidden="true" />
        <span className="lt-sign-tape lt-sign-tape-br" aria-hidden="true" />
        <div className="lt-sign-inner">
          <div className="lt-believe" aria-hidden="true">
            <span>B</span><span>E</span><span>L</span><span>I</span><span>E</span><span>V</span><span>E</span>
          </div>
        </div>
      </div>

      <div className="lt-headline">
        <span className="lt-word">polymarket</span>
        <span className="lt-sub">
          <em>every revolution needs its counterculture.</em>
        </span>
      </div>

      <span className="lt-note lt-note-1" aria-hidden="true"><em>be a goldfish.</em></span>
      <span className="lt-note lt-note-2" aria-hidden="true"><em>barbecue sauce.</em></span>

      <div className="lt-bottom-strip">
        <span className="lt-bottom-k">enter</span>
        <span className="lt-bottom-sep">·</span>
        <span className="lt-bottom-v">the argument</span>
        <span className="lt-bottom-arrow">→</span>
      </div>
    </Link>
  );
}
