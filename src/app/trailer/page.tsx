import Link from "next/link";

// /trailer — a cinematic "pretend 404" page. Framed as a playable credits
// roll for everything built in the 2026-04-15 session: the pitch deck, the
// POLYMARKET cipher, the /v1 letter pages, the agent panel and moderator,
// the scorecards, the 2-day portfolio chart, the CLI wordle, the recursion
// maze, the 6969 joke, all of it. Every tagline is a direct quote from
// somewhere on the site.

export const metadata = {
  title: "not found. yet. — aureliex trailer",
};

const BEATS: Array<{
  kicker: string;
  line: string;
  sub?: string;
  tone?: "dark" | "warm" | "green" | "rust" | "amber";
}> = [
  {
    kicker: "404 · NOT FOUND · YET",
    line: "you went further than the page was built to go.",
    sub: "so here is what the page was built from.",
    tone: "dark",
  },
  {
    kicker: "I · THE QUIET CASE",
    line: "inexplicably.",
    sub: "// bullshitmaxxing. a guide to sep. built mostly from git history.",
    tone: "dark",
  },
  {
    kicker: "II · THE RECEIPTS",
    line: "résumés lie. commit counts don't.",
    sub: "rush-react · sep-ats-checkin · sep-ats — three rushes, one infrastructure.",
    tone: "dark",
  },
  {
    kicker: "III · THE PIVOT",
    line: "every mind whispers what it rewards too.",
    sub: "the whisper worth making is alignment — because that's how you transcend.",
    tone: "amber",
  },
  {
    kicker: "IV · THE THESIS",
    line: "attention is all you need.",
    sub: "sep is not a tech frat. startups are the surface.",
    tone: "warm",
  },
  {
    kicker: "V · THE MOVES",
    line: "toolmaking becomes the norm. attention becomes the metric.",
    sub: "every pledge class ships directionally correctly and at scale — or we deem our experiment of pledging a failure. whose failure?",
    tone: "warm",
  },
  {
    kicker: "VI · THE REFRAME",
    line: "i wanted the arena. so i built it. now i want the year to give it away.",
    sub: "to the polymaths of sep. of ucla. of the world. of all future generations. that's legacy.",
    tone: "warm",
  },
  {
    kicker: "VII · THE ENDING",
    line: "the poison won't cure itself. get upstream.",
    sub: "let's cut through the bullshit. together.",
    tone: "green",
  },
  {
    kicker: "VIII · THE PANEL",
    line: "six voices. two phases. until they agree.",
    sub: "the moderator · the bull · the bear · macro · flow · the historian.",
    tone: "dark",
  },
  {
    kicker: "IX · THE RIDDLE",
    line: "ten letters. find them. type them here.",
    sub: "P · O · L · Y · M · A · R · K · E · T",
    tone: "green",
  },
  {
    kicker: "X · THE LISTING",
    line: "coming soon — polymarket.",
    sub: "open interest 10/10 · depth 100% · spread tightening · settlement tbd.",
    tone: "green",
  },
  {
    kicker: "XI · THE MAZE",
    line: "10 polymarkets, then 6969, then the void.",
    sub: "the riddle was the point; the depth is the joke.",
    tone: "dark",
  },
  {
    kicker: "XII · THE METHOD",
    line: "the method is the medicine.",
    sub: "even when the work is bullshit — especially then.",
    tone: "rust",
  },
];

export default function TrailerPage() {
  return (
    <main className="trailer-root">
      <div className="trailer-film" aria-hidden="true" />

      <section className="trailer-hero">
        <p className="trailer-hero-eyebrow">aureliex · 2026-04-15 · saapai</p>
        <h1 className="trailer-hero-title">
          <span className="trailer-hero-404">404</span>
          <span className="trailer-hero-dash">—</span>
          <span className="trailer-hero-word">
            <em>not found.</em>
          </span>
          <span className="trailer-hero-yet">
            <em>yet.</em>
          </span>
        </h1>
        <p className="trailer-hero-sub">
          <em>
            you went further than the page was built to go. so here is what the page was built
            from.
          </em>
        </p>
        <p className="trailer-hero-hint">↓ scroll</p>
      </section>

      <div className="trailer-beats">
        {BEATS.slice(1).map((beat, i) => (
          <section
            key={i}
            className={`trailer-beat trailer-beat-${beat.tone ?? "dark"}`}
            style={{ ["--i" as string]: String(i) }}
          >
            <span className="trailer-kicker">{beat.kicker}</span>
            <p className="trailer-line">
              <em>{beat.line}</em>
            </p>
            {beat.sub && (
              <p className="trailer-sub">
                <em>{beat.sub}</em>
              </p>
            )}
          </section>
        ))}
      </div>

      <section className="trailer-credits">
        <p className="trailer-credits-eye">// credits</p>
        <ul className="trailer-credits-list">
          <li><span>direction, text, interaction</span><span><em>saapai</em></span></li>
          <li><span>infrastructure, typography, typescript</span><span><em>Claude Opus 4.6 · 1M-context</em></span></li>
          <li><span>swipe file</span><span><em>Paul Graham · Ted Lasso · Gil Scott-Heron · EEAO · Ford v Ferrari · Iverson · Roosevelt · Thorp · Vaswani et al.</em></span></li>
          <li><span>listing venue</span><span><em>polymarket · coming soon</em></span></li>
          <li><span>horizon</span><span><em>10 years · starting now</em></span></li>
        </ul>
      </section>

      <nav className="trailer-nav">
        <Link href="/" className="trailer-back">← home</Link>
        <span className="trailer-dot">·</span>
        <Link href="/argument" className="trailer-back">the argument</Link>
        <span className="trailer-dot">·</span>
        <Link href="/positions" className="trailer-back">the positions</Link>
        <span className="trailer-dot">·</span>
        <Link href="/pitch" className="trailer-back">the pitch</Link>
      </nav>

      <footer className="trailer-outro">
        <p>
          <em>every revolution needs its counterculture.</em>
        </p>
        <p className="trailer-outro-accent">
          <em>pick yours.</em>
        </p>
      </footer>
    </main>
  );
}
