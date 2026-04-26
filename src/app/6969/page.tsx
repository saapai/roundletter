import Link from "next/link";
import HuntLedger from "@/components/HuntLedger";
import ViewsBadge from "@/components/ViewsBadge";

// /6969 — the credits roll. A "pretend 404" that serves as the site's
// elegant wayfinder: you went further than the page was built to go, so
// here is what the whole site is. Every beat reflects the current launch
// narrative (trailer, five-agent panel, sealed predictions, green credit,
// let-down/arc).

export const metadata = {
  title: "not found. yet. — aureliex · credits",
  description:
    "a credits roll for everything on aureliex.com — the five-agent panel, the sealed predictions, green credit, let down, the arc.",
};

type Beat = {
  n: string;
  kicker: string;
  line: string;
  sub?: string;
  href?: string;
  tone?: "dark" | "warm" | "green" | "rust" | "amber" | "cyan";
};

const BEATS: Beat[] = [
  {
    n: "00",
    kicker: "404 · not found · yet",
    line: "you went further than the page was built to go.",
    sub: "so here is what the page was built from.",
    tone: "dark",
  },
  {
    n: "01",
    kicker: "the punchline",
    line: "the name is bullshit. the product is beautiful.",
    sub: "every ai product you&rsquo;ve seen is useless but has a cool name. aureliex inverts it.",
    href: "/",
    tone: "warm",
  },
  {
    n: "02",
    kicker: "the numbers",
    line: "$3,453 → $100,000 by 21 june 2026.",
    sub: "a 29×. the S&P does 10× in 25 years. the gap is the joke and the point. no job.",
    href: "/positions",
    tone: "amber",
  },
  {
    n: "03",
    kicker: "the five-agent panel",
    line: "bull · bear · macro · flow · historian.",
    sub: "every decision argued live. brier-scored. kill-switches non-discretionary. the method is the product.",
    href: "/argument",
    tone: "dark",
  },
  {
    n: "04",
    kicker: "the sealed predictions",
    line: "sp-001 forfeited — honestly.",
    sub: "plaintext was lost. marked unverifiable in public. sp-002 onward uses a stricter runbook — see docs. the record is the return.",
    href: "/green-credit",
    tone: "rust",
  },
  {
    n: "05",
    kicker: "the actual product",
    line: "green credit.",
    sub: "a platform where attention in reasoning is rewarded with better reasoning. public bets on success, founder bets against themselves, record is the return.",
    href: "/green-credit",
    tone: "green",
  },
  {
    n: "06",
    kicker: "the launch trailer",
    line: "three songs. three jobs.",
    sub: "a lot (21 savage) · just like me (metro + future) · nuevayol (bad bunny). autoplay on load, scroll to compartmentalize.",
    href: "/",
    tone: "cyan",
  },
  {
    n: "07",
    kicker: "the frame",
    line: "let down.",
    sub: "a pre-mortem, after radiohead 1997. the feeling the whole site is a derivative of.",
    href: "/let-down",
    tone: "cyan",
  },
  {
    n: "08",
    kicker: "the arc",
    line: "ghost town → let down.",
    sub: "the cinematic descent. altarpiece to transit window. the b-side of the launch.",
    href: "/arc",
    tone: "dark",
  },
  {
    n: "09",
    kicker: "the method",
    line: "the document is the product.",
    sub: "debates timestamped. trades tied to agents. letters signed. nothing hidden. that&rsquo;s the whole architecture.",
    href: "/eggs",
    tone: "warm",
  },
  {
    n: "10",
    kicker: "the statement",
    line: "one voice. then two. then four. then the argument is pointless.",
    sub: "that&rsquo;s the point.",
    href: "/statement",
    tone: "dark",
  },
  {
    n: "11",
    kicker: "the rest",
    line: "canvas · trades · market · letters.",
    sub: "the book as graph. every trade logged. green apple vs rotten apple. round 0 pre-mortem.",
    href: "/canvas",
    tone: "green",
  },
];

export default function CreditsPage() {
  return (
    <main className="trailer-root">
      <div className="trailer-film" aria-hidden="true" />

      <section className="trailer-hero">
        <p className="trailer-hero-eyebrow">aureliex · credits · issue #001</p>
        <h1 className="trailer-hero-title">
          <span className="trailer-hero-404">404</span>
          <span className="trailer-hero-dash">—</span>
          <span className="trailer-hero-word"><em>not found.</em></span>
          <span className="trailer-hero-yet"><em>yet.</em></span>
        </h1>
        <p className="trailer-hero-sub">
          <em>you went further than the page was built to go. so here is what the page was built from.</em>
        </p>
        <p className="trailer-hero-hint">↓ scroll</p>
      </section>

      <div className="trailer-beats">
        {BEATS.slice(1).map((beat, i) => {
          const content = (
            <>
              <span className="trailer-kicker">
                <span className="trailer-kicker-n">{beat.n}</span>
                {beat.kicker}
              </span>
              <p className="trailer-line"><em>{beat.line}</em></p>
              {beat.sub && (
                <p className="trailer-sub">
                  <em dangerouslySetInnerHTML={{ __html: beat.sub }} />
                </p>
              )}
              {beat.href && (
                <span className="trailer-gocta" aria-hidden="true">open →</span>
              )}
            </>
          );
          const className = `trailer-beat trailer-beat-${beat.tone ?? "dark"}${beat.href ? " trailer-beat-link" : ""}`;
          return beat.href ? (
            <Link
              key={i}
              href={beat.href}
              className={className}
              style={{ ["--i" as string]: String(i) }}
            >
              {content}
            </Link>
          ) : (
            <section
              key={i}
              className={className}
              style={{ ["--i" as string]: String(i) }}
            >
              {content}
            </section>
          );
        })}
      </div>

      <HuntLedger />

      <section className="trailer-credits">
        <p className="trailer-credits-eye">// credits</p>
        <ul className="trailer-credits-list">
          <li><span>direction, text, decisions</span><span><em>saapai</em></span></li>
          <li><span>infrastructure, typography, typescript</span><span><em>claude opus 4.7 · 1m-context · claude code (also YEHub orange, if you squint)</em></span></li>
          <li><span>swipe file</span><span><em>burna boy · i told them · radiohead · kanye · 21 savage · metro boomin · bad bunny · playboi carti · paul graham · ted lasso</em></span></li>
          <li><span>listing venue</span><span><em>polymarket · coming soon</em></span></li>
          <li><span>horizon</span><span><em>10 years · starting now</em></span></li>
          <li>
            <span>readers</span>
            <span><ViewsBadge mode="total" label="across the site" /></span>
          </li>
        </ul>
      </section>

      <nav className="trailer-nav">
        <Link href="/" className="trailer-back">← home</Link>
        <span className="trailer-dot">·</span>
        <Link href="/argument" className="trailer-back">argument</Link>
        <span className="trailer-dot">·</span>
        <Link href="/positions" className="trailer-back">positions</Link>
        <span className="trailer-dot">·</span>
        <Link href="/green-credit" className="trailer-back">green credit</Link>
        <span className="trailer-dot">·</span>
        <Link href="/let-down" className="trailer-back">let down</Link>
      </nav>

      <footer className="trailer-outro">
        <p><em>the counter culture is here.</em></p>
        <p className="trailer-outro-accent"><em>the best you can do is watch.</em></p>
      </footer>
    </main>
  );
}
