import Link from "next/link";

// /17 — quant → artistic trailer. The cut between aureliex.com and
// saathvikpai.com, presented in /6969's beat-card vocabulary so it sits in
// the same cinematic register as the existing trailer. Slug is the private
// cipher (3,453 → 17). Unlinked from nav by design.

export const metadata = {
  title: "seventeen. — aureliex → saathvikpai trailer",
};

const BEATS: Array<{
  kicker: string;
  line: string;
  sub?: string;
  tone?: "dark" | "warm" | "green" | "rust" | "amber";
}> = [
  {
    kicker: "00 · COLD OPEN",
    line: "the public number, and the one underneath it.",
    sub: "$3,453.83. seventeen. one of those two is the joke. the other is the point.",
    tone: "dark",
  },
  {
    kicker: "I · THE QUANT PORTAL",
    line: "i need a 29x.",
    sub: "the s&p does 10x in roughly 25 years. the gap between those two numbers is the entire joke. it is also the entire point.",
    tone: "dark",
  },
  {
    kicker: "II · THE PANEL",
    line: "i convened a panel.",
    sub: "bull · bear · macro · flow · historian. five voices. one ballot.",
    tone: "dark",
  },
  {
    kicker: "III · THE PRE-MORTEM",
    line: "i will be wrong about the specific failure modes above.",
    sub: "the value of writing them down is that when i am wrong about them, i will be wrong in a legible, scoreable way — not a 'oh i always said' way.",
    tone: "dark",
  },
  {
    kicker: "IV · THE KILL-SWITCH",
    line: "armed.",
    sub: "two cron-triggered trades per twelve months. publishing manufactures the urge to trade. the switch exists because the urge will.",
    tone: "amber",
  },
  {
    kicker: "V · THE TURN",
    line: "the money is the mini-game.",
    sub: "and the mini-game is the product. the money is the scoreboard.",
    tone: "amber",
  },
  {
    kicker: "VI · THE TURN, CONT'D",
    line: "the method is the game.",
    sub: "i know that sounds like a tee-ball line. so, in the voice it deserves —",
    tone: "warm",
  },
  {
    kicker: "VII · IVERSON, AT THE PODIUM",
    line: "we're talking about practice.",
    sub: "not a round. not the ballot. practice.",
    tone: "warm",
  },
  {
    kicker: "VIII · THE BLOOM",
    line: "the cream wash arrives.",
    sub: "cormorant italic. rust accents. the terminal-green drains out in one long dissolve. the artistic portal opens.",
    tone: "rust",
  },
  {
    kicker: "IX · THE STATEMENT",
    line: "i convened a panel on myself.",
    sub: "they could not agree. i published the disagreement.",
    tone: "rust",
  },
  {
    kicker: "X · SIXTEEN VOICES",
    line: "the disagreement is the statement.",
    sub: "one voice becomes two. two becomes four. four becomes sixteen. the moderator breaks in: the argument is pointless. that is the point.",
    tone: "rust",
  },
  {
    kicker: "XI · THE COLLAPSE",
    line: "sixteen voices compress back into one.",
    sub: "the cream holds. one voice, quiet:",
    tone: "warm",
  },
  {
    kicker: "XII · THE CODA",
    line: "i am nineteen. i have $3,453.83 and no job. i keep the receipt.",
    sub: "score and receipt are different verbs.",
    tone: "warm",
  },
  {
    kicker: "XIII · THE BALLOT",
    line: "the logbook is the ballot.",
    sub: "the largest impact in this round is method, not money. a lost trade with a clean logbook is worth more than a won trade with no reasoning.",
    tone: "green",
  },
  {
    kicker: "XIV · UPSTREAM",
    line: "get upstream of the revolution — you get upstream of life.",
    sub: "the people who win on wall street are not the people who call the top. they are the people who take commission.",
    tone: "green",
  },
  {
    kicker: "XV · THE COROLLARY (saapai)",
    line: "revolution = experimental love, fed back into the stream of consciousness.",
    sub: "no permanent underclass. new players welcomed. kindness as the default operating system. this one's mine.",
    tone: "rust",
  },
  {
    kicker: "XVI · 7,000 RPM",
    line: "the float point. the felt texture of a great run.",
    sub: "banked since the start. spent here, exactly once. a trailer is a float point — that's the right place to spend it.",
    tone: "amber",
  },
];

export default function SeventeenPage() {
  return (
    <main className="trailer-root">
      <div className="trailer-film" aria-hidden="true" />

      <section className="trailer-hero">
        <p className="trailer-hero-eyebrow">aureliex → saathvikpai · trailer · saapai · 2026-04-17</p>
        <h1 className="trailer-hero-title">
          <span className="trailer-hero-404">$3,453.83</span>
          <span className="trailer-hero-dash">—</span>
          <span className="trailer-hero-word">
            <em>seventeen.</em>
          </span>
        </h1>
        <p className="trailer-hero-sub">
          <em>
            the public number, and the one underneath it. one minute forty. one cut, from quant to
            artistic. claim, warrant, impact. cue music.
          </em>
        </p>
        <p className="trailer-hero-hint">↓ scroll</p>
      </section>

      <div className="trailer-beats">
        {BEATS.map((beat, i) => (
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
          <li><span>direction, voice, cipher</span><span><em>saapai</em></span></li>
          <li><span>typography, infrastructure</span><span><em>Claude Opus 4.7 · 1M-context</em></span></li>
          <li><span>spent from the bank</span><span><em>Iverson · Gil Scott-Heron · 7,000 RPM</em></span></li>
          <li><span>still banked, on purpose</span><span><em>EEAO bagel · Roosevelt arena · barbecue sauce · naked king</em></span></li>
          <li><span>portals</span><span><em>aureliex.com → saathvikpai.com</em></span></li>
          <li><span>runtime</span><span><em>1:46</em></span></li>
          <li><span>linked from</span><span><em>nowhere. on purpose.</em></span></li>
        </ul>
      </section>

      <nav className="trailer-nav">
        <Link href="/" className="trailer-back">← home</Link>
      </nav>

      <footer className="trailer-outro">
        <p>
          <em>i convened a panel on myself. they could not agree. i published the disagreement.</em>
        </p>
        <p className="trailer-outro-accent">
          <em>the disagreement is the statement.</em>
        </p>
      </footer>
    </main>
  );
}
