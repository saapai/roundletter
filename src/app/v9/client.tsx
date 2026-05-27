"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════
   v9 — THE ROCKS

   Synthesis of 4 design agents:
   - Minimalist: three containers, image → number → letter
   - Cinematic: rocks develop from black, Ken Burns drift
   - Typographic: broadsheet genre, drop cap, § marks
   - Emotional: proof above fold, honest progress bar
   ═══════════════════════════════════════════════════════ */

type Props = {
  totalNow: number;
  daysToBirthday: number;
  holdings: Array<{ ticker: string; shares: number; entry_value: number }>;
  pendingCash: number;
  entryValue: number;
  nonStockValue: number;
};

/* ── Live price poller ── */
function useLiveTotal(
  holdings: Props["holdings"],
  pendingCash: number,
  nonStockValue: number,
  fallback: number
) {
  const [total, setTotal] = useState<number>(fallback);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  const prevRef = useRef<number>(fallback);

  useEffect(() => {
    let alive = true;
    const pull = async () => {
      try {
        const r = await fetch("/api/prices", { cache: "no-store" });
        if (!r.ok || !alive) return;
        const j = await r.json();
        if (!j?.hasData || !alive) return;
        let sum = pendingCash + nonStockValue;
        for (const h of holdings) {
          const s = j.data[h.ticker];
          if (s?.closes?.length > 0) sum += h.shares * s.closes[s.closes.length - 1];
          else sum += h.entry_value;
        }
        if (sum !== prevRef.current) {
          setFlash(sum >= prevRef.current ? "up" : "down");
          setTimeout(() => setFlash(null), 800);
        }
        prevRef.current = sum;
        if (alive) setTotal(sum);
      } catch { /* noop */ }
    };
    pull();
    const id = setInterval(pull, 30_000);
    return () => { alive = false; clearInterval(id); };
  }, [holdings, pendingCash, nonStockValue]);

  return { total, flash };
}

function fmt(n: number) {
  return Math.round(n).toLocaleString("en-US");
}

export default function V9Client({
  totalNow, daysToBirthday, holdings, pendingCash, entryValue, nonStockValue,
}: Props) {
  const { total, flash } = useLiveTotal(holdings, pendingCash, nonStockValue, totalNow);
  const rootRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"void" | "develop" | "revealed" | "full">("void");

  const gain = total - entryValue;
  const gainPct = ((gain / entryValue) * 100).toFixed(1);
  const progressPct = Math.min(100, Math.max(0, ((total - 3453) / (100000 - 3453)) * 100));

  /* Cinematic open: void → rocks develop → number → full */
  useEffect(() => {
    try {
      if (sessionStorage.getItem("v9_seen") === "1") {
        setPhase("full");
        return;
      }
    } catch { /* noop */ }
    sessionStorage.setItem("v9_seen", "1");
    setTimeout(() => setPhase("develop"), 300);
    setTimeout(() => setPhase("revealed"), 3000);
    setTimeout(() => setPhase("full"), 4200);
  }, []);

  /* scroll-reveal via IntersectionObserver */
  useEffect(() => {
    const els = rootRef.current?.querySelectorAll(".v9-reveal");
    if (!els) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("v9-in");
      }),
      { threshold: 0.06, rootMargin: "0px 0px -60px 0px" },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const showNumber = phase === "revealed" || phase === "full";
  const showFull = phase === "full";

  return (
    <div className="v9" data-phase={phase} ref={rootRef}>
      <style>{CSS}</style>

      {/* ═══════════ ACT I: THE ROCKS ═══════════ */}
      <section className="v9-hero">
        {/* Image with cinematic develop */}
        <div className={`v9-rocks ${phase !== "void" ? "v9-rocks--developing" : ""}`} />
        <div className="v9-vignette" />
        <div className="v9-lens-warm" />

        {/* Eyebrow */}
        <div className={`v9-hero-content ${showFull ? "v9-vis" : ""}`}>
          <span className="v9-eyebrow">a public wager · {daysToBirthday} days left</span>
        </div>

        {/* The number */}
        <div className={`v9-hero-number ${showNumber ? "v9-vis" : ""}`}>
          <span className={`v9-big-number ${flash === "up" ? "v9-flash-up" : flash === "down" ? "v9-flash-down" : ""}`}>
            <span className="v9-dollar">$</span>{fmt(total)}
          </span>
          {showFull && (
            <div className="v9-hero-meta">
              <span className="v9-delta">
                {gain >= 0 ? "+" : ""}{gainPct}% since april 12
              </span>
              <span className="v9-sep">·</span>
              <span className="v9-target">→ $100,000</span>
              <span className="v9-sep">·</span>
              <span className="v9-live-dot" />
              <span className="v9-live-label">live</span>
            </div>
          )}
        </div>

        {/* Floating lines in the landscape */}
        {showFull && (
          <div className="v9-hero-foot">
            <p className="v9-hero-tagline">probably impossible. definitely public.</p>
            <div className="v9-trace">
              <span className="v9-trace-s">$3,453</span>
              <div className="v9-trace-bar">
                <div className="v9-trace-fill" style={{ width: `${progressPct}%` }} />
              </div>
              <span className="v9-trace-e">$100K</span>
            </div>
            <div className="v9-scroll-cue"><span /></div>
          </div>
        )}
      </section>

      {/* ═══════════ ACT II: THE LETTER ═══════════ */}
      <section className="v9-paper">

        {/* Broadsheet flag */}
        <div className="v9-flag v9-reveal">
          <div className="v9-flag-rule" />
          <div className="v9-flag-row">
            <span className="v9-flag-wordmark">aureliex</span>
            <span className="v9-flag-issue">Vol. I · No. 1</span>
          </div>
          <div className="v9-flag-rule" />
        </div>

        {/* §1 — The bet */}
        <article className="v9-letter">
          <section className="v9-sect v9-reveal">
            <span className="v9-sect-mark">§</span>
            <h2 className="v9-sect-head">The bet</h2>
            <p className="v9-lede">
              <span className="v9-drop">E</span>very serious bet has a public record, filed
              before the math is decided, so I can&rsquo;t quietly
              retrofit the story later.
            </p>
            <p>
              The account opened at <strong>$3,453</strong> on April 12. The
              goal is <strong>$100,000 by June 21</strong> &mdash; my 20th
              birthday. Ten weeks. A <strong>29&times;</strong>. The S&amp;P
              takes 25 years.
            </p>

            {/* The gut punch — Monte Carlo proof */}
            <div className="v9-proof">
              <div className="v9-proof-row">
                <span className="v9-proof-label">target</span>
                <span className="v9-proof-value">$100,000</span>
              </div>
              <div className="v9-proof-row">
                <span className="v9-proof-label">monte carlo probability</span>
                <span className="v9-proof-value v9-proof-zero">0.000000%</span>
              </div>
              <div className="v9-proof-row">
                <span className="v9-proof-label">simulations run</span>
                <span className="v9-proof-value">1,000,000</span>
              </div>
              <div className="v9-proof-row">
                <span className="v9-proof-label">published</span>
                <span className="v9-proof-value">before the first trade</span>
              </div>
            </div>

            <p className="v9-coda-line">
              The odds are the honesty. The bet is the product.
            </p>
          </section>

          <div className="v9-orn">✦ · ✦</div>

          {/* §2 — What got built */}
          <section className="v9-sect v9-reveal">
            <span className="v9-sect-mark">§</span>
            <h2 className="v9-sect-head">What got built</h2>
            <p>
              Five AI agents{" "}
              <Link href="/argument" className="v9-link">argue every trade</Link>
              {" "}before I touch it &mdash; built to disagree, not agree.
              The bet produced:{" "}
              <Link href="/invest" className="v9-link">a prediction market</Link>,
              {" "}twelve{" "}
              <Link href="/art" className="v9-link">original artworks</Link>,
              and a{" "}
              <a href="https://saathvikpai.com" className="v9-link">research paper</a>
              {" "}on agent memory. Thirty-seven pages. None planned.
            </p>

            {/* Agent bracket — emotional proof of real disagreement */}
            <div className="v9-bracket">
              <div className="v9-bracket-line v9-bracket-bear">
                <span className="v9-bracket-tag">bear</span>
                <span>That is not a strategy. That is Thanksgiving.</span>
              </div>
              <div className="v9-bracket-line v9-bracket-historian">
                <span className="v9-bracket-tag">historian</span>
                <span>The 0.000000% is the probability before the letter. The probability after is unknowable. You will not know which until June 21.</span>
              </div>
            </div>
          </section>

          <div className="v9-orn">✦ · ✦</div>

          {/* §3 — The recursion */}
          <section className="v9-sect v9-reveal">
            <span className="v9-sect-mark">§</span>
            <h2 className="v9-sect-head">The recursion</h2>

            <p className="v9-pull">
              The research paper exists because the portfolio exists. The portfolio
              exists because the site exists. The site exists because I told people
              about a birthday party. Everything downstream was built by something
              that should not have been upstream.
            </p>

            <p>
              v0 is the portfolio. v1 is five agents plus sealed ballots plus
              automatic rules wrapped around v0 to make it honest in public. v2 is
              the new house. Every version corrects the one before it. The record
              of getting closer is the product.
            </p>

            <div className="v9-versions">
              <div className="v9-version">
                <span className="v9-version-n">v0</span>
                <span className="v9-version-d">the portfolio — $3,453, real money</span>
              </div>
              <div className="v9-version">
                <span className="v9-version-n">v1</span>
                <span className="v9-version-d">the apparatus — 5 agents, sealed predictions, kill-switches</span>
              </div>
              <div className="v9-version">
                <span className="v9-version-n">v2</span>
                <span className="v9-version-d">the new house — a room where attention builds reasoning</span>
              </div>
              <div className="v9-version">
                <span className="v9-version-n">v3</span>
                <span className="v9-version-d">the correction — whatever v2 missed</span>
              </div>
            </div>
          </section>

          <div className="v9-orn">✦ · ✦</div>

          {/* §4 — The honesty */}
          <section className="v9-sect v9-reveal">
            <span className="v9-sect-mark">§</span>
            <h2 className="v9-sect-head">The honesty</h2>

            <p>
              I am publishing this so when the account is at $5,200 and I am
              quietly telling myself &ldquo;$5,200 is basically $100k if you
              squint,&rdquo; there is a document on the internet with my name on
              it reminding me that no, it is not.
            </p>

            <div className="v9-seal">
              <span className="v9-seal-tag">sealed</span>
              <span className="v9-seal-hash">commitment · a8f7c2············</span>
              <span className="v9-seal-when">reveal 19 jun 2026 · 18:00 PT</span>
            </div>

            <blockquote className="v9-quote">
              <p>
                &ldquo;The credit belongs to the one who is actually in the
                market, whose account is marred by drawdowns and realized
                losses&hellip; who publishes the pre-mortem before the first
                trade, who knows the &lt;1% probability and starts anyway &mdash;
                so that his place shall never be with those who neither bet
                nor watched.&rdquo;
              </p>
            </blockquote>
          </section>

          <div className="v9-orn">✦ · ✦</div>

          {/* §5 — The invitation */}
          <section className="v9-sect v9-reveal">
            <span className="v9-sect-mark">§</span>
            <h2 className="v9-sect-head">The invitation</h2>

            <p>
              The party is June 20. Salt Lake City. Everyone in the pool
              gets comped. Flights reimbursed. One original artwork to the
              highest bidder in the room. Five sealed predictions open at 6 pm.
            </p>

            <div className="v9-ways">
              <Link href="/invest" className="v9-way">
                <span className="v9-way-name">The wager →</span>
                <span className="v9-way-sub">bet on the bet</span>
              </Link>
              <Link href="/art" className="v9-way">
                <span className="v9-way-name">The art →</span>
                <span className="v9-way-sub">12 originals, starting at $1</span>
              </Link>
              <Link href="/argument" className="v9-way">
                <span className="v9-way-name">The argument →</span>
                <span className="v9-way-sub">5 agents disagree daily</span>
              </Link>
              <a href="https://saathvikpai.com" className="v9-way">
                <span className="v9-way-name">The paper →</span>
                <span className="v9-way-sub">37 pages on agent memory</span>
              </a>
            </div>
          </section>

        </article>
      </section>

      {/* ═══════════ THE PAINTING ═══════════ */}
      <section className="v9-painting-zone v9-reveal">
        <div className="v9-painting-inner">
          <div className="v9-painting-frame">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/art/auction-piece.jpg"
              alt="Cityscape with splatter — oil on canvas"
              className="v9-painting-img"
            />
          </div>
          <div className="v9-painting-caption">
            <span className="v9-painting-title">cityscape with splatter</span>
            <div className="v9-painting-terms">
              <div className="v9-painting-term">
                <span className="v9-painting-label">current bid</span>
                <span className="v9-painting-value">$25</span>
              </div>
              <div className="v9-painting-term">
                <span className="v9-painting-label">cashout value · june 20</span>
                <span className="v9-painting-value v9-painting-live">{`$${fmt(total * 0.1)}`}</span>
              </div>
            </div>
            <p className="v9-painting-meta">
              the winning bidder can cash out 10% of the portfolio on june 20, or keep the painting.
            </p>
            <Link href="/art" className="v9-painting-bid">bid →</Link>
          </div>
        </div>

        {/* Art contact sheet — 6 piece teaser */}
        <div className="v9-art-grid">
          {[
            { src: "/art/rainbow-heron.jpg", title: "heron, in color", bid: "$5" },
            { src: "/art/eagle.jpg", title: "bald eagle, watching", bid: "$4" },
            { src: "/art/tarantula-colored.jpg", title: "tarantula, orange on black", bid: "$4" },
            { src: "/art/watercolor-face.jpg", title: "a face, unfinished", bid: "$3" },
            { src: "/art/tupac-basketball.jpg", title: "tupac · basketball", bid: "$4" },
            { src: "/art/kraft-folio.jpg", title: "kraft folio, back cover", bid: "$1" },
          ].map((p) => (
            <Link href="/art" key={p.src} className="v9-art-thumb">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.src} alt={p.title} />
              <span className="v9-art-thumb-info">
                <span className="v9-art-thumb-title">{p.title}</span>
                <span className="v9-art-thumb-bid">{p.bid}</span>
              </span>
            </Link>
          ))}
        </div>
        <div className="v9-art-cta">
          <Link href="/art" className="v9-link">12 originals, 2017–2026 · view the salon wall →</Link>
        </div>
      </section>

      {/* ═══════════ THE PARTY ═══════════ */}
      <section className="v9-party">
        <div className="v9-party-inner v9-reveal">
          <span className="v9-party-presents">aureliex presents</span>
          <h2 className="v9-party-title">the party.</h2>
          <span className="v9-party-sub">the liquidity event · june 20 · 2026</span>
          <div className="v9-party-rule" />
          <p className="v9-party-tagline">june 20 · salt lake city</p>
          <span className="v9-party-detail">10% of portfolio → flights &amp; reimbursements</span>
          <span className="v9-party-detail">proportional to who invested the most, earliest</span>
        </div>

        {/* Ticket */}
        <div className="v9-ticket-wrap v9-reveal">
          <Link href="/invest" className="v9-ticket">
            <div className="v9-ticket-main">
              <span className="v9-ticket-event">the liquidity event</span>
              <div className="v9-ticket-meta">
                <span>june 20, 2026</span>
                <span>salt lake city</span>
              </div>
              <span className="v9-ticket-cta">rsvp →</span>
            </div>
            <div className="v9-ticket-tear">
              <div className="v9-ticket-hole v9-ticket-hole-t" />
              <div className="v9-ticket-perf" />
              <div className="v9-ticket-hole v9-ticket-hole-b" />
            </div>
            <div className="v9-ticket-stub">
              <div className="v9-ticket-barcode">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="v9-ticket-bar" style={{ height: `${6 + ((i * 7 + 3) % 12)}px` }} />
                ))}
              </div>
              <span className="v9-ticket-admit">ADMIT ONE</span>
            </div>
          </Link>
        </div>

        {/* Backed by */}
        <div className="v9-backed v9-reveal">
          <span className="v9-backed-label">backed by</span>
          <div className="v9-backed-names">
            <span>Franco Cachay</span>
            <span>Elijah Bautista</span>
            <span>Yashas Shashidara</span>
            <span>an anonymous donor</span>
          </div>
        </div>
      </section>

      {/* ═══════════ FOUR REVOLUTIONS ═══════════ */}
      <nav className="v9-revolutions v9-reveal">
        <Link href="/green-credit" className="v9-rev">
          <span className="v9-rev-n">I</span>
          <span className="v9-rev-name">the financial revolution</span>
          <span className="v9-rev-sub">green credit · bet on the bet</span>
        </Link>
        <Link href="/archive" className="v9-rev">
          <span className="v9-rev-n">II</span>
          <span className="v9-rev-name">the art revolution</span>
          <span className="v9-rev-sub">12 pieces · salon wall · auction</span>
        </Link>
        <Link href="/letters/round-1" className="v9-rev">
          <span className="v9-rev-n">III</span>
          <span className="v9-rev-name">the socialist revolution</span>
          <span className="v9-rev-sub">round 1 · what the attention built</span>
        </Link>
        <Link href="/letters/entrenched-coils" className="v9-rev">
          <span className="v9-rev-n">IV</span>
          <span className="v9-rev-name">the ai revolution</span>
          <span className="v9-rev-sub">entrenched coils · tension-weighted memory</span>
        </Link>
      </nav>

      {/* ═══════════ ACT III: THE DOOR ═══════════ */}
      <section className="v9-door">
        <div className="v9-door-rocks" />
        <div className="v9-door-overlay" />
        <div className="v9-door-content v9-reveal">
          <p className="v9-door-line">The door is open.</p>
          <div className="v9-door-actions">
            <Link href="/invest" className="v9-btn">The wager →</Link>
            <Link href="/argument" className="v9-link-light">Five agents disagree about this →</Link>
          </div>
          <p className="v9-door-personal">
            <a href="https://venmo.com/saathvikpai" className="v9-door-rail">venmo @saathvikpai</a>
            {" · "}
            <a href="tel:3853687238" className="v9-door-rail">385-368-7238</a>
            {" · "}
            <span className="v9-door-note">personally guaranteed</span>
          </p>
          <div className="v9-outcome">
            <span className="v9-outcome-label">Outcome:</span>
            <span className="v9-outcome-blank" />
            <span className="v9-outcome-date">June 21, 2026</span>
          </div>
        </div>
        {/* CMIYGL closer */}
        <footer className="v9-closer v9-reveal">
          <p className="v9-closer-q">
            {"call me if you get lost.".split("").map((ch, i) => (
              <span key={i} className="v9-rainbow" style={{ "--i": i } as React.CSSProperties}>
                {ch === " " ? "\u00A0" : ch}
              </span>
            ))}
          </p>
          <p className="v9-closer-sig">
            {"aureliex.".split("").map((ch, i) => (
              <span key={i} className="v9-rainbow-warm" style={{ "--i": i } as React.CSSProperties}>
                {ch}
              </span>
            ))}
          </p>
          <span className="v9-closer-phone">+1 (385) 368-7238</span>
        </footer>

        {/* Navigation rooms */}
        <nav className="v9-nav-rooms v9-reveal">
          <Link href="/letters/round-0">the pre-mortem</Link>
          <Link href="/letters/round-1">round 1</Link>
          <Link href="/positions">positions</Link>
          <Link href="/argument">the argument</Link>
          <Link href="/art">art</Link>
          <Link href="/archive">archives</Link>
        </nav>
      </section>

      {/* Mobile nav */}
      <nav className="v9-mob-nav">
        <Link href="/positions">stocks</Link>
        <Link href="/letters/round-0">letters</Link>
        <Link href="/art">art</Link>
        <Link href="/invest">invest</Link>
      </nav>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════
   CSS — all scoped to .v9
   ═══════════════════════════════════════════════════════ */
const CSS = `
/* ── RESET & ROOT ── */
.v9 {
  --paper: #F4EFE6;
  --ink: #1C1A17;
  --rust: #8B3A2E;
  --parchment: #EDE5D5;
  --graphite: #6B6560;
  --gold: #C9A020;
  --gold-number: #D4A94C;

  min-height: 100vh;
  background: #000;
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  overflow-x: hidden;
}

/* ═══════════ ACT I: THE ROCKS ═══════════ */
.v9-hero {
  position: relative;
  height: 100svh;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* Rock image — develops from black like a Polaroid */
.v9-rocks {
  position: absolute;
  inset: -4%;
  background: url('/hero/rocks.webp') center 38% / cover no-repeat;
  filter: brightness(0) saturate(0);
  transition: filter 3s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: filter, transform;
  animation: v9-drift 50s linear infinite alternate;
}
.v9-rocks--developing {
  filter: brightness(0.58) saturate(0.82) contrast(1.08) sepia(0.08);
}

@keyframes v9-drift {
  from { transform: scale(1.04) translateX(0); }
  to   { transform: scale(1.04) translateX(-1.2%); }
}

/* Cinematic vignette */
.v9-vignette {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to bottom,
      rgba(4,3,2,0.7) 0%,
      rgba(4,3,2,0.25) 18%,
      transparent 35%
    ),
    linear-gradient(to top,
      rgba(4,3,2,0.82) 0%,
      rgba(4,3,2,0.4) 20%,
      transparent 42%
    ),
    linear-gradient(to right,
      rgba(4,3,2,0.25) 0%,
      transparent 18%,
      transparent 82%,
      rgba(4,3,2,0.25) 100%
    );
  pointer-events: none;
  z-index: 1;
}

/* Warm lens overlay */
.v9-lens-warm {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse 50% 40% at 55% 40%,
    rgba(210,170,70,0.10) 0%,
    rgba(201,149,42,0.03) 45%,
    transparent 70%
  );
  mix-blend-mode: soft-light;
  pointer-events: none;
  z-index: 2;
}

/* Hero content layers */
.v9-hero-content {
  position: relative;
  z-index: 3;
  text-align: center;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 1.2s ease 0.2s, transform 1.2s cubic-bezier(0.22,1,0.36,1) 0.2s;
}
.v9-hero-content.v9-vis {
  opacity: 1;
  transform: translateY(0);
}

.v9-eyebrow {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: rgba(240,235,226,0.4);
}

/* The big number */
.v9-hero-number {
  position: relative;
  z-index: 3;
  text-align: center;
  margin-top: 1rem;
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 1.5s cubic-bezier(0.22,1,0.36,1), transform 1.5s cubic-bezier(0.22,1,0.36,1);
}
.v9-hero-number.v9-vis {
  opacity: 1;
  transform: translateY(0);
}

.v9-big-number {
  font-family: var(--font-display, 'Cormorant Garamond'), Georgia, serif;
  font-size: clamp(4rem, 14vw, 7.5rem);
  font-weight: 300;
  letter-spacing: -0.015em;
  line-height: 1;
  color: var(--gold-number);
  display: block;
  transition: color 0.6s ease, text-shadow 0.8s ease;
}
.v9-dollar {
  font-size: 0.36em;
  font-weight: 400;
  vertical-align: 0.38em;
  margin-right: 0.05em;
  opacity: 0.55;
}
.v9-flash-up {
  color: #7dba6a !important;
  text-shadow: 0 0 60px rgba(125,186,106,0.25);
}
.v9-flash-down {
  color: #c45a5a !important;
  text-shadow: 0 0 60px rgba(196,90,90,0.25);
}

.v9-hero-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.8rem;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.58rem;
  letter-spacing: 0.08em;
  color: rgba(240,235,226,0.3);
}
.v9-delta { color: #7dba6a; opacity: 0.8; }
.v9-target { opacity: 0.5; }
.v9-sep { opacity: 0.2; }
.v9-live-dot {
  width: 5px; height: 5px;
  border-radius: 50%;
  background: #7dba6a;
  animation: v9-pulse 4s ease-in-out infinite;
}
.v9-live-label {
  font-size: 0.5rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #7dba6a;
  opacity: 0.6;
}
@keyframes v9-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.25; }
}

/* Hero foot — tagline + progress + scroll cue */
.v9-hero-foot {
  position: absolute;
  bottom: clamp(2.5rem, 6vh, 4rem);
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  text-align: center;
  width: min(90%, 36rem);
  opacity: 0;
  animation: v9-fade-up 1.5s ease 0.5s forwards;
}

.v9-hero-tagline {
  font-family: var(--font-display, 'Cormorant Garamond'), Georgia, serif;
  font-style: italic;
  font-size: clamp(1rem, 2.5vw, 1.3rem);
  color: rgba(240,235,226,0.45);
  letter-spacing: 0.02em;
  margin: 0 0 1.2rem;
}

.v9-trace {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.55rem;
  color: rgba(240,235,226,0.2);
}
.v9-trace-bar {
  flex: 1;
  height: 3px;
  border-radius: 1.5px;
  background: rgba(240,235,226,0.06);
  overflow: hidden;
}
.v9-trace-fill {
  height: 100%;
  border-radius: 1.5px;
  background: var(--gold);
  transition: width 1.5s ease;
}
.v9-trace-s, .v9-trace-e { white-space: nowrap; }

.v9-scroll-cue {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}
.v9-scroll-cue span {
  display: block;
  width: 1px;
  height: 24px;
  background: rgba(240,235,226,0.3);
  animation: v9-cue-pulse 2s ease-in-out 1s 1 forwards;
}
@keyframes v9-cue-pulse {
  0%   { opacity: 0.3; transform: scaleY(1); }
  50%  { opacity: 0.7; transform: scaleY(1.4); }
  100% { opacity: 0.3; transform: scaleY(1); }
}

@keyframes v9-fade-up {
  from { opacity: 0; transform: translateX(-50%) translateY(12px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}

/* ═══════════ ACT II: THE PAPER ═══════════ */
.v9-paper {
  background: var(--paper);
  position: relative;
  z-index: 1;
  padding: clamp(4rem, 8vw, 6rem) clamp(1.25rem, 4vw, 2rem) clamp(3rem, 6vw, 5rem);
}

/* Paper grain texture */
.v9-paper::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.035;
  mix-blend-mode: multiply;
  background-image:
    radial-gradient(rgba(28,26,23,0.6) 1px, transparent 1px),
    radial-gradient(rgba(28,26,23,0.4) 1px, transparent 1px);
  background-size: 3px 3px, 5px 5px;
  background-position: 0 0, 2px 2px;
  pointer-events: none;
}

/* Broadsheet flag */
.v9-flag {
  max-width: 44rem;
  margin: 0 auto 3rem;
}
.v9-flag-rule {
  height: 1px;
  background: var(--ink);
  opacity: 0.18;
}
.v9-flag-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 0.6rem 0;
}
.v9-flag-wordmark {
  font-family: var(--font-display, 'Cormorant Garamond'), Georgia, serif;
  font-style: italic;
  font-weight: 500;
  font-size: clamp(1.6rem, 3.5vw, 2.2rem);
  letter-spacing: -0.01em;
  color: var(--ink);
}
.v9-flag-issue {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.6rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--rust);
}

/* Letter body */
.v9-letter {
  max-width: 44rem;
  margin: 0 auto;
}

.v9-sect {
  margin-bottom: 0;
}

.v9-sect-mark {
  font-family: var(--font-display, 'Cormorant Garamond'), Georgia, serif;
  font-size: 0.85rem;
  color: var(--rust);
  opacity: 0.5;
  margin-right: 0.4rem;
}

.v9-sect-head {
  display: inline;
  font-family: var(--font-body, 'EB Garamond'), Georgia, serif;
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--rust);
}

.v9-lede {
  font-family: var(--font-body, 'EB Garamond'), Georgia, serif;
  font-size: clamp(1.04rem, 0.96rem + 0.4vw, 1.18rem);
  line-height: 1.85;
  margin-top: 1.5rem;
  color: var(--ink);
  text-indent: 0;
}

/* Drop cap */
.v9-drop {
  font-family: var(--font-display, 'Cormorant Garamond'), Georgia, serif;
  font-style: italic;
  font-weight: 300;
  float: left;
  font-size: 4.5rem;
  line-height: 0.78;
  padding: 0.22rem 0.55rem 0 0;
  color: var(--rust);
}

.v9-letter p {
  font-family: var(--font-body, 'EB Garamond'), Georgia, serif;
  font-size: clamp(1.02rem, 0.94rem + 0.36vw, 1.15rem);
  line-height: 1.82;
  margin-top: 1.4rem;
  color: var(--ink);
  text-indent: 1.5em;
}
.v9-letter p:first-of-type,
.v9-lede,
.v9-lede + p {
  text-indent: 0;
}

.v9-link {
  color: var(--ink);
  text-decoration: none;
  border-bottom: 1px solid color-mix(in srgb, var(--rust) 35%, transparent);
  padding-bottom: 1px;
  transition: color 200ms ease, border-color 200ms ease;
}
.v9-link:hover {
  color: var(--rust);
  border-bottom-color: var(--rust);
}

/* Monte Carlo proof box */
.v9-proof {
  margin: 2rem 0;
  padding: 1.5rem;
  border: 1px solid rgba(28,26,23,0.1);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.65rem;
  letter-spacing: 0.04em;
}
.v9-proof-row {
  display: flex;
  justify-content: space-between;
  padding: 0.45rem 0;
  border-bottom: 1px solid rgba(28,26,23,0.06);
}
.v9-proof-row:last-child { border-bottom: none; }
.v9-proof-label {
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--graphite);
}
.v9-proof-value {
  color: var(--ink);
  font-weight: 500;
}
.v9-proof-zero {
  color: var(--rust);
  font-weight: 700;
}

.v9-coda-line {
  font-family: var(--font-display, 'Cormorant Garamond'), Georgia, serif;
  font-style: italic;
  font-size: 1.15rem;
  color: var(--ink);
  text-indent: 0 !important;
  margin-top: 1.5rem;
  opacity: 0.75;
}

/* Ornamental separator */
.v9-orn {
  text-align: center;
  font-size: 0.75rem;
  letter-spacing: 0.3em;
  color: var(--rust);
  opacity: 0.35;
  margin: clamp(2.5rem, 5vw, 3.5rem) 0;
}

/* Agent bracket */
.v9-bracket {
  margin: 1.5rem 0;
  border-left: 2px solid rgba(28,26,23,0.08);
  padding-left: 1rem;
}
.v9-bracket-line {
  padding: 0.6rem 0;
  font-family: var(--font-body, 'EB Garamond'), Georgia, serif;
  font-size: 0.95rem;
  font-style: italic;
  line-height: 1.65;
  color: color-mix(in srgb, var(--ink) 80%, var(--paper));
}
.v9-bracket-tag {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.55rem;
  font-style: normal;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  display: inline-block;
  margin-right: 0.6rem;
  padding: 2px 6px;
  border-radius: 2px;
}
.v9-bracket-bear .v9-bracket-tag {
  color: #b54040;
  background: rgba(181,64,64,0.08);
}
.v9-bracket-historian .v9-bracket-tag {
  color: #6B6560;
  background: rgba(107,101,96,0.08);
}

/* Pull quote */
.v9-pull {
  font-family: var(--font-display, 'Cormorant Garamond'), Georgia, serif !important;
  font-style: italic;
  font-size: clamp(1.2rem, 1rem + 0.8vw, 1.5rem) !important;
  line-height: 1.45 !important;
  text-align: center;
  color: var(--ink);
  max-width: 34ch;
  margin: 2rem auto !important;
  padding: 2rem 1rem;
  border-top: 2px solid color-mix(in srgb, var(--rust) 30%, var(--paper));
  border-bottom: 2px solid color-mix(in srgb, var(--rust) 30%, var(--paper));
  text-indent: 0 !important;
}

/* Version ladder */
.v9-versions {
  margin: 2rem 0 0.5rem;
  border-top: 1px solid rgba(28,26,23,0.1);
}
.v9-version {
  display: flex;
  gap: 1rem;
  padding: 0.7rem 0;
  border-bottom: 1px solid rgba(28,26,23,0.06);
  align-items: baseline;
}
.v9-version-n {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--rust);
  width: 2rem;
  flex-shrink: 0;
}
.v9-version-d {
  font-family: var(--font-body, 'EB Garamond'), Georgia, serif;
  font-size: 0.95rem;
  color: var(--graphite);
  font-style: italic;
}

/* Seal */
.v9-seal {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin: 1.5rem 0;
  padding: 1rem;
  background: rgba(28,26,23,0.025);
  border-left: 2px solid var(--rust);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}
.v9-seal-tag {
  font-size: 0.55rem;
  font-weight: 700;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--rust);
}
.v9-seal-hash {
  font-size: 0.62rem;
  color: var(--graphite);
  letter-spacing: 0.04em;
}
.v9-seal-when {
  font-size: 0.55rem;
  color: var(--graphite);
  opacity: 0.6;
  letter-spacing: 0.06em;
}

/* Roosevelt quote */
.v9-quote {
  margin: 1.5rem 0;
  padding: 1.2rem 0 1.2rem 1.4rem;
  border-left: 3px solid color-mix(in srgb, var(--rust) 40%, var(--paper));
  font-family: var(--font-body, 'EB Garamond'), Georgia, serif;
  font-style: italic;
  font-size: 1rem;
  line-height: 1.7;
  color: color-mix(in srgb, var(--ink) 75%, var(--paper));
}
.v9-quote p {
  text-indent: 0 !important;
  margin: 0 !important;
  font-size: inherit !important;
}

/* Ways in */
.v9-ways {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  margin: 2rem 0 0;
  border-radius: 3px;
  overflow: hidden;
}
.v9-way {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 1.2rem 1rem;
  background: rgba(28,26,23,0.025);
  text-decoration: none;
  color: var(--ink);
  transition: background 0.3s ease;
}
.v9-way:hover { background: rgba(28,26,23,0.06); }
.v9-way-name {
  font-family: var(--font-display, 'Cormorant Garamond'), Georgia, serif;
  font-style: italic;
  font-weight: 500;
  font-size: 1rem;
}
.v9-way-sub {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.52rem;
  letter-spacing: 0.06em;
  color: var(--graphite);
}

/* Navigation rooms */
.v9-rooms {
  max-width: 44rem;
  margin: 3rem auto 0;
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  padding: 2rem 0 0;
  border-top: 1px solid rgba(28,26,23,0.1);
}
.v9-room {
  text-decoration: none;
}
.v9-room-label {
  font-family: var(--font-body, 'EB Garamond'), Georgia, serif;
  font-style: italic;
  font-size: 0.9rem;
  color: var(--graphite);
  transition: color 200ms ease;
}
.v9-room:hover .v9-room-label { color: var(--ink); }

/* ═══════════ THE PAINTING ═══════════ */
.v9-painting-zone {
  background: var(--parchment);
  padding: clamp(3rem, 6vw, 5rem) clamp(1.25rem, 4vw, 2rem);
}
.v9-painting-inner {
  max-width: 44rem;
  margin: 0 auto;
}
.v9-painting-frame {
  position: relative;
  border-radius: 2px;
  overflow: hidden;
  padding: clamp(10px, 2vw, 18px);
  background: linear-gradient(145deg, #DDD5C8, #CFC6B8);
  box-shadow:
    0 8px 40px rgba(28,26,23,0.12),
    0 2px 8px rgba(28,26,23,0.06),
    inset 0 1px 0 rgba(255,255,255,0.4),
    inset 0 -1px 0 rgba(0,0,0,0.05);
}
.v9-painting-img {
  display: block;
  width: 100%;
  height: auto;
  object-fit: contain;
}
.v9-painting-caption {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1.25rem;
}
.v9-painting-title {
  font-family: var(--font-display, 'Cormorant Garamond'), Georgia, serif;
  font-size: 1.1rem;
  font-style: italic;
  font-weight: 500;
  color: #2A2520;
}
.v9-painting-terms {
  display: flex;
  gap: 32px;
  margin: 14px 0 10px;
}
.v9-painting-term {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.v9-painting-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.35;
  color: var(--ink);
}
.v9-painting-value {
  font-family: var(--font-display, 'Cormorant Garamond'), Georgia, serif;
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--ink);
}
.v9-painting-live {
  color: var(--rust);
}
.v9-painting-meta {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  letter-spacing: 0.02em;
  line-height: 1.6;
  opacity: 0.35;
  color: var(--ink);
  margin-top: 6px;
}
.v9-painting-bid {
  display: inline-block;
  margin-top: 1rem;
  font-family: var(--font-display, 'Cormorant Garamond'), Georgia, serif;
  font-size: 1rem;
  font-weight: 500;
  text-decoration: none;
  padding: 0.55rem 1.5rem;
  border-radius: 2px;
  color: var(--ink);
  border: 1px solid rgba(28,26,23,0.2);
  transition: all 0.4s ease;
}
.v9-painting-bid:hover {
  background: var(--ink);
  color: var(--paper);
  border-color: var(--ink);
}

/* Art thumbnail grid */
.v9-art-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3px;
  max-width: 44rem;
  margin: 2.5rem auto 0;
  border-radius: 3px;
  overflow: hidden;
}
.v9-art-thumb {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  display: block;
}
.v9-art-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.22,1,0.36,1);
}
.v9-art-thumb:hover img {
  transform: scale(1.06);
}
.v9-art-thumb-info {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: 8px 10px;
  background: linear-gradient(to top, rgba(0,0,0,0.65), transparent);
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.v9-art-thumb:hover .v9-art-thumb-info { opacity: 1; }
.v9-art-thumb-title {
  font-family: var(--font-display, 'Cormorant Garamond'), Georgia, serif;
  font-style: italic;
  font-size: 0.75rem;
  color: rgba(240,235,226,0.85);
}
.v9-art-thumb-bid {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.55rem;
  color: rgba(240,235,226,0.5);
}
.v9-art-cta {
  max-width: 44rem;
  margin: 1.5rem auto 0;
  text-align: center;
  font-family: var(--font-body, 'EB Garamond'), Georgia, serif;
  font-style: italic;
  font-size: 0.9rem;
}

/* ═══════════ THE PARTY ═══════════ */
.v9-party {
  position: relative;
  background:
    radial-gradient(ellipse 80% 60% at 85% 90%, rgba(168,120,60,0.16) 0%, transparent 100%),
    radial-gradient(ellipse 60% 50% at 10% 8%, rgba(60,36,20,0.20) 0%, transparent 100%),
    linear-gradient(
      155deg,
      #EDE5D5 0%,
      #DDD0BA 12%,
      #C4A882 22%,
      #A88060 34%,
      #8B6248 42%,
      #C9A882 52%,
      #DDD0BA 60%,
      #C4A882 72%,
      #4A2A1A 88%,
      #0a0908 100%
    );
  padding: 0;
}
.v9-party::after {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.04;
  mix-blend-mode: soft-light;
  background-image:
    radial-gradient(rgba(229,221,210,0.5) 1px, transparent 1px);
  background-size: 3px 3px;
  pointer-events: none;
}
.v9-party-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: clamp(5rem, 14vh, 9rem) clamp(1.5rem, 5vw, 3rem);
}
.v9-party-presents {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.62rem;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: #C44B6C;
  margin-bottom: 28px;
}
.v9-party-title {
  font-family: var(--font-display, 'Cormorant Garamond'), Georgia, serif;
  font-size: clamp(3.5rem, 10vw, 5.5rem);
  font-weight: 400;
  font-style: italic;
  color: #1C1A17;
  line-height: 1.05;
  letter-spacing: -0.02em;
  margin: 0 0 24px;
}
.v9-party-sub {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #3A2520;
  margin-bottom: 48px;
}
.v9-party-rule {
  width: min(320px, 55%);
  height: 2px;
  background: linear-gradient(90deg, transparent, #A87A50, transparent);
  margin-bottom: 48px;
}
.v9-party-tagline {
  font-family: var(--font-display, 'Cormorant Garamond'), Georgia, serif;
  font-size: clamp(1.5rem, 4vw, 2.4rem);
  font-style: italic;
  color: #1C1A17;
  letter-spacing: 0.01em;
  line-height: 1.3;
  margin: 0 0 24px;
}
.v9-party-detail {
  font-family: 'JetBrains Mono', monospace;
  font-size: clamp(0.58rem, 1.5vw, 0.68rem);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #3A2520;
  margin-top: 4px;
}

/* Ticket */
.v9-ticket-wrap {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  padding: clamp(2.5rem, 5vw, 4rem) clamp(1rem, 3vw, 2rem);
  background: #0a0908;
}
.v9-ticket {
  display: flex;
  max-width: 400px;
  width: 100%;
  border-radius: 4px;
  overflow: visible;
  text-decoration: none;
  color: #e8e4dc;
  transition: transform 0.4s cubic-bezier(0.22,1,0.36,1), box-shadow 0.4s ease;
  cursor: pointer;
  box-shadow: 0 4px 20px -6px rgba(0,0,0,0.3);
}
.v9-ticket:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 36px -10px rgba(0,0,0,0.5);
}
.v9-ticket-main {
  flex: 1;
  background: #141210;
  border: 1px solid rgba(201,149,42,0.12);
  border-right: none;
  border-radius: 4px 0 0 4px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}
.v9-ticket-event {
  font-family: var(--font-display, 'Cormorant Garamond'), Georgia, serif;
  font-size: 1.2rem;
  font-style: italic;
  font-weight: 500;
  color: #C9952A;
  line-height: 1.2;
}
.v9-ticket-meta {
  display: flex;
  gap: 16px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.5rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(229,221,210,0.4);
}
.v9-ticket-cta {
  font-family: var(--font-display, 'Cormorant Garamond'), Georgia, serif;
  font-size: 0.85rem;
  font-style: italic;
  color: rgba(201,149,42,0.5);
  margin-top: 4px;
  transition: color 0.3s;
}
.v9-ticket:hover .v9-ticket-cta { color: #C9952A; }

.v9-ticket-tear {
  width: 1px;
  position: relative;
  flex-shrink: 0;
}
.v9-ticket-perf {
  position: absolute;
  top: 10px;
  bottom: 10px;
  left: 0;
  border-left: 1px dashed rgba(229,221,210,0.08);
}
.v9-ticket-hole {
  position: absolute;
  left: -6px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #0a0908;
}
.v9-ticket-hole-t { top: -6px; }
.v9-ticket-hole-b { bottom: -6px; }
.v9-ticket-stub {
  width: 52px;
  background: #111010;
  border: 1px solid rgba(201,149,42,0.08);
  border-left: none;
  border-radius: 0 4px 4px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 6px;
}
.v9-ticket-barcode { display: flex; gap: 1.5px; align-items: flex-end; }
.v9-ticket-bar {
  width: 1.5px;
  background: rgba(229,221,210,0.25);
  border-radius: 1px;
}
.v9-ticket-admit {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.4rem;
  letter-spacing: 0.15em;
  color: rgba(229,221,210,0.18);
  writing-mode: vertical-lr;
  transform: rotate(180deg);
  text-transform: uppercase;
}

/* Backed by */
.v9-backed {
  text-align: center;
  padding: 0 0 clamp(4rem, 8vw, 7rem);
  background: #0a0908;
  color: #e8e4dc;
}
.v9-backed-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.55rem;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: rgba(229,221,210,0.2);
  display: block;
  margin-bottom: 20px;
}
.v9-backed-names {
  display: flex;
  gap: 40px;
  justify-content: center;
  flex-wrap: wrap;
}
.v9-backed-names span {
  font-family: var(--font-display, 'Cormorant Garamond'), Georgia, serif;
  font-size: 0.95rem;
  font-weight: 500;
  color: rgba(229,221,210,0.35);
  letter-spacing: 0.04em;
}

/* ═══════════ FOUR REVOLUTIONS ═══════════ */
.v9-revolutions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  background: rgba(232,228,220,0.03);
  border-radius: 0;
  overflow: hidden;
}
.v9-rev {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 36px 32px;
  background: #0e0d0b;
  text-decoration: none;
  color: #e8e4dc;
  transition: background 0.4s ease;
}
.v9-rev:hover { background: #161412; }
.v9-rev-n {
  font-family: var(--font-display, 'Cormorant Garamond'), Georgia, serif;
  font-size: 1.1rem;
  color: #C9952A;
  opacity: 0.35;
}
.v9-rev-name {
  font-family: var(--font-display, 'Cormorant Garamond'), Georgia, serif;
  font-size: 1.05rem;
  font-weight: 600;
  font-style: italic;
  color: rgba(232,228,220,0.7);
}
.v9-rev-sub {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.55rem;
  opacity: 0.25;
  letter-spacing: 0.06em;
  color: rgba(232,228,220,0.4);
  margin-top: 4px;
}

/* ═══════════ ACT III: THE DOOR ═══════════ */
.v9-door {
  position: relative;
  min-height: 55vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: clamp(4rem, 10vw, 8rem) clamp(1.25rem, 4vw, 2rem);
  overflow: hidden;
}

.v9-door-rocks {
  position: absolute;
  inset: 0;
  background: url('/hero/rocks.webp') center 55% / cover no-repeat;
  filter: brightness(0.22) saturate(0.35) contrast(1.1);
}

.v9-door-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to bottom,
      var(--paper) 0%,
      transparent 25%,
      transparent 75%,
      rgba(4,3,2,1) 100%
    );
  pointer-events: none;
}

.v9-door-content {
  position: relative;
  z-index: 1;
  text-align: center;
}

.v9-door-line {
  font-family: var(--font-display, 'Cormorant Garamond'), Georgia, serif;
  font-style: italic;
  font-size: clamp(1.8rem, 5vw, 2.8rem);
  color: rgba(240,235,226,0.7);
  margin: 0 0 1.5rem;
  letter-spacing: 0.01em;
}

.v9-door-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.v9-btn {
  display: inline-block;
  padding: 0.7rem 2rem;
  font-family: var(--font-display, 'Cormorant Garamond'), Georgia, serif;
  font-style: italic;
  font-size: 1rem;
  color: var(--paper);
  background: color-mix(in srgb, var(--gold) 85%, var(--ink));
  text-decoration: none;
  letter-spacing: 0.02em;
  transition: background 250ms ease;
  border-radius: 2px;
}
.v9-btn:hover { background: var(--gold); }

.v9-link-light {
  font-family: var(--font-body, 'EB Garamond'), Georgia, serif;
  font-style: italic;
  font-size: 0.9rem;
  color: rgba(240,235,226,0.4);
  text-decoration: none;
  transition: color 200ms ease;
}
.v9-link-light:hover { color: rgba(240,235,226,0.75); }

.v9-door-personal {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.55rem;
  letter-spacing: 0.08em;
  color: rgba(240,235,226,0.2);
  margin-top: 0.5rem;
}
.v9-door-rail {
  color: rgba(240,235,226,0.3);
  text-decoration: none;
  transition: color 200ms ease;
}
.v9-door-rail:hover { color: rgba(240,235,226,0.6); }
.v9-door-note { opacity: 0.6; }

/* Outcome blank — the frameable line */
.v9-outcome {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.6rem;
  letter-spacing: 0.08em;
  color: rgba(240,235,226,0.18);
}
.v9-outcome-blank {
  display: inline-block;
  width: 8rem;
  border-bottom: 0.5px solid rgba(240,235,226,0.15);
}
.v9-outcome-date { opacity: 0.5; }

/* Signature block */
.v9-sig-block {
  position: relative;
  z-index: 1;
  text-align: center;
  margin-top: 2rem;
}
.v9-sig {
  font-family: var(--font-signature, 'Ms Madi'), cursive;
  font-size: 1.8rem;
  color: rgba(240,235,226,0.25);
  margin: 0;
}
.v9-wordmark {
  font-family: var(--font-display, 'Cormorant Garamond'), Georgia, serif;
  font-style: italic;
  font-size: 0.85rem;
  color: rgba(240,235,226,0.15);
  letter-spacing: 0.12em;
  margin: 0.25rem 0 0;
}
.v9-dot { color: var(--rust); opacity: 0.5; }

/* CMIYGL closer */
.v9-closer {
  position: relative;
  z-index: 1;
  text-align: center;
  padding-top: clamp(4rem, 10vw, 8rem);
  padding-bottom: clamp(1rem, 2vw, 2rem);
}
.v9-closer-q {
  font-family: var(--font-display, 'Cormorant Garamond'), Georgia, serif;
  font-size: clamp(1.8rem, 4.5vw, 3rem);
  font-style: italic;
  font-weight: 300;
  margin: 0 0 clamp(1.5rem, 3vw, 2.5rem);
  letter-spacing: 0.01em;
  line-height: 1.2;
  opacity: 0.5;
}
.v9-closer-sig {
  font-family: var(--font-display, 'Cormorant Garamond'), Georgia, serif;
  font-size: clamp(0.85rem, 1.8vw, 1.1rem);
  font-style: italic;
  font-weight: 400;
  letter-spacing: 0.15em;
  margin: 0 0 clamp(2rem, 4vw, 3rem);
  opacity: 0.38;
}
.v9-closer-phone {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.55rem;
  letter-spacing: 0.18em;
  opacity: 0.12;
  display: block;
  color: rgba(240,235,226,0.5);
  margin-top: 0.5rem;
}

/* Rainbow per-character */
.v9-rainbow { display: inline-block; }
.v9-closer-q .v9-rainbow:nth-child(4n+1) { color: #a09484; }
.v9-closer-q .v9-rainbow:nth-child(4n+2) { color: #b0a290; }
.v9-closer-q .v9-rainbow:nth-child(4n+3) { color: #968a7a; }
.v9-closer-q .v9-rainbow:nth-child(4n)   { color: #a89c8a; }
.v9-closer-q .v9-rainbow:last-child      { color: #c9a840; }

.v9-rainbow-warm { display: inline-block; }
.v9-rainbow-warm:nth-child(1) { color: #C9952A; }
.v9-rainbow-warm:nth-child(2) { color: #D4A040; }
.v9-rainbow-warm:nth-child(3) { color: #C4884A; }
.v9-rainbow-warm:nth-child(4) { color: #B8784A; }
.v9-rainbow-warm:nth-child(5) { color: #A86840; }
.v9-rainbow-warm:nth-child(6) { color: #C9952A; }
.v9-rainbow-warm:nth-child(7) { color: #B8784A; }
.v9-rainbow-warm:nth-child(8) { color: #9B5A38; }
.v9-rainbow-warm:nth-child(9) { color: #8B4A2E; }

/* Nav rooms */
.v9-nav-rooms {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  padding: 2rem 1.5rem clamp(3rem, 6vw, 5rem);
}
.v9-nav-rooms a {
  font-family: var(--font-body, 'EB Garamond'), Georgia, serif;
  font-style: italic;
  font-size: 0.85rem;
  color: rgba(240,235,226,0.25);
  text-decoration: none;
  transition: color 200ms ease;
}
.v9-nav-rooms a:hover { color: rgba(240,235,226,0.6); }

/* ═══════════ SCROLL REVEAL ═══════════ */
.v9-reveal {
  opacity: 0;
  transform: translateY(18px);
  transition: opacity 0.9s ease, transform 0.9s cubic-bezier(0.22,1,0.36,1);
}
.v9-reveal.v9-in {
  opacity: 1;
  transform: translateY(0);
}

/* ═══════════ MOBILE NAV ═══════════ */
.v9-mob-nav {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  height: 52px;
  display: none;
  align-items: center;
  justify-content: center;
  gap: clamp(1.5rem, 6vw, 2.5rem);
  background: rgba(10,10,10,0.94);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-top: 1px solid rgba(201,149,42,0.08);
  z-index: 100;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
.v9-mob-nav a {
  font-family: ui-monospace, 'SF Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(240,235,226,0.28);
  text-decoration: none;
  transition: color 0.15s ease;
  padding: 6px 4px;
}
.v9-mob-nav a:hover { color: rgba(240,235,226,0.75); }

/* ═══════════ MOBILE ═══════════ */
@media (max-width: 640px) {
  .v9-mob-nav { display: flex; }

  .v9-eyebrow { font-size: 0.55rem; letter-spacing: 0.22em; }
  .v9-big-number { font-size: clamp(3rem, 14vw, 5rem); }
  .v9-dollar { font-size: 0.4em; }
  .v9-hero-meta { font-size: 0.52rem; gap: 0.35rem; flex-wrap: wrap; justify-content: center; }
  .v9-hero-tagline { font-size: 0.95rem; }
  .v9-hero-foot { width: min(92%, 30rem); }
  .v9-trace { font-size: 0.5rem; }

  .v9-paper { padding: 2.5rem 1.25rem 2rem; }
  .v9-flag-wordmark { font-size: 1.4rem; }
  .v9-flag-issue { font-size: 0.52rem; }

  .v9-drop { font-size: 3.5rem; padding: 0.15rem 0.4rem 0 0; }
  .v9-letter p { font-size: 1rem; }
  .v9-lede { font-size: 1rem; }
  .v9-pull { font-size: 1.1rem !important; padding: 1.5rem 0.5rem; max-width: 100%; }

  .v9-proof { padding: 1rem; font-size: 0.6rem; }
  .v9-proof-row { flex-direction: column; gap: 2px; padding: 0.5rem 0; }

  .v9-bracket { margin: 1.2rem 0; }
  .v9-bracket-line { font-size: 0.9rem; }

  .v9-versions { margin: 1.5rem 0 0.5rem; }
  .v9-version { gap: 0.75rem; }
  .v9-version-d { font-size: 0.85rem; }

  .v9-ways { grid-template-columns: 1fr; }
  .v9-way { padding: 1rem; }

  .v9-rooms { gap: 0.8rem 1.2rem; }
  .v9-room-label { font-size: 0.82rem; }

  .v9-door { min-height: 50vh; padding: 3rem 1.25rem; }
  .v9-door-line { font-size: 1.6rem; }

  .v9-sig-block { padding-bottom: calc(52px + env(safe-area-inset-bottom, 0px) + 1.5rem); }

  .v9-orn { margin: 2rem 0; }

  /* Painting */
  .v9-painting-zone { padding: 2rem 1.25rem; }
  .v9-painting-terms { gap: 24px; }
  .v9-painting-value { font-size: 1.3rem; }
  .v9-painting-bid { padding: 0.65rem 1.8rem; min-height: 44px; display: inline-flex; align-items: center; }
  .v9-art-grid { grid-template-columns: repeat(2, 1fr); }
  .v9-art-thumb-info { opacity: 1; }

  /* Party */
  .v9-party-inner { padding: 3.5rem 1.25rem; }
  .v9-party-title { font-size: clamp(2.6rem, 9vw, 3.8rem); }
  .v9-party-sub { font-size: 0.6rem; margin-bottom: 28px; }
  .v9-party-rule { width: min(260px, 60%); margin-bottom: 28px; }
  .v9-party-tagline { font-size: clamp(1.2rem, 3.8vw, 1.8rem); }
  .v9-ticket-wrap { padding: 2rem 1.25rem; }
  .v9-ticket { max-width: 100%; }
  .v9-backed { padding: 0 1.25rem 3rem; }
  .v9-backed-names { flex-direction: column; align-items: center; gap: 14px; }

  /* Revolutions */
  .v9-revolutions { grid-template-columns: 1fr; }
  .v9-rev { padding: 26px 20px; }

  /* Door */
  .v9-closer { padding-top: 3rem; }
  .v9-closer-q { font-size: 1.5rem; }
  .v9-closer-sig { font-size: 0.75rem; }
  .v9-nav-rooms { gap: 0.8rem 1rem; }
  .v9-nav-rooms a { font-size: 0.78rem; }
}

/* ═══════════ REDUCED MOTION ═══════════ */
@media (prefers-reduced-motion: reduce) {
  .v9-rocks { animation: none !important; filter: brightness(0.58) saturate(0.82) contrast(1.08) sepia(0.08) !important; }
  .v9-live-dot { animation: none !important; opacity: 0.7; }
  .v9-scroll-cue span { animation: none !important; }
  .v9-reveal { opacity: 1; transform: none; transition: none; }
  .v9-hero-content,
  .v9-hero-number { opacity: 1; transform: none; transition: none; }
  .v9-hero-foot { opacity: 1; animation: none !important; }
}

/* ═══════════ PRINT ═══════════ */
@media print {
  .v9-hero { height: auto; min-height: 0; page-break-after: always; }
  .v9-rocks, .v9-vignette, .v9-lens-warm, .v9-door-rocks, .v9-door-overlay { display: none; }
  .v9-hero-content, .v9-hero-number, .v9-hero-foot { position: static; opacity: 1; transform: none; }
  .v9-hero { background: #fff; color: #000; padding: 2rem; }
  .v9-big-number { color: #000; font-size: 3rem; }
  .v9-eyebrow, .v9-hero-meta, .v9-hero-tagline { color: #333; }
  .v9-paper { background: #fff; }
  .v9-paper::before { display: none; }
  .v9-mob-nav { display: none !important; }
  .v9-door { background: #fff; color: #000; min-height: 0; padding: 2rem; }
  .v9-door-content * { color: #000 !important; }
  .v9-reveal { opacity: 1; transform: none; }
}
`;
