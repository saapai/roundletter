"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════
   THE RECORD — second edition
   home, project 1

   Synthesis of a three-lens design argument:
   · spine: the published-record editorial (Werner voice — italic =
     source, roman = record, mono = metadata, numbered entries)
   · stolen from the gallery lens: the salon mat, the provenance
     plaque, the sold-dot motif (● sold / ○ open)
   · stolen from the cinematic lens: one full-bleed dark intertitle
     (the invariant's "intentional beat" clause, exercised once)

   paper-first. ink never pure black. amber = money, only money.
   cyan appears exactly once — it is project 1's color.
   ═══════════════════════════════════════════════════════════════ */

type Holding = { ticker: string; shares: number; entry_value: number };

type Props = {
  totalNow: number;
  holdings: Holding[];
  pendingCash: number;
  daysToClose: number;
};

function fmt(n: number) {
  return Math.round(n).toLocaleString("en-US");
}

function useLiveTotal(holdings: Holding[], pendingCash: number, fallback: number) {
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
        let sum = pendingCash;
        for (const h of holdings) {
          const s = j.data[h.ticker];
          sum += s?.closes?.length > 0 ? h.shares * s.closes[s.closes.length - 1] : h.entry_value;
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
  }, [holdings, pendingCash]);

  return { total, flash };
}

export default function RecordHome({ totalNow, holdings, pendingCash, daysToClose }: Props) {
  const { total, flash } = useLiveTotal(holdings, pendingCash, totalNow);
  const rootRef = useRef<HTMLDivElement>(null);

  /* soft scroll-reveal — the record doesn't animate, it arrives */
  useEffect(() => {
    const els = rootRef.current?.querySelectorAll(".rc-reveal");
    if (!els) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("rc-in");
      }),
      { threshold: 0.08, rootMargin: "0px 0px -32px 0px" },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="rc" ref={rootRef}>
      <style>{CSS}</style>

      {/* ── masthead ── */}
      <header className="rc-mast">
        <span className="rc-wordmark">aureliex<span className="rc-dot">.</span></span>
        <span className="rc-mast-eyebrow">the record · second edition</span>
      </header>

      {/* ── title page ── */}
      <section className="rc-title">
        <p className="rc-eyebrow">filed july 2026 · salt lake city</p>
        <h1 className="rc-verdict">project 0 failed.</h1>
        <p className="rc-verdict-sub">ai could not do the impossible.</p>
        <div className="rc-imprint rc-reveal">
          <p>
            <span className="rc-imprint-no">project 0</span>
            <span className="rc-money">$3,453.83</span> →{" "}
            <span className="rc-strike"><span className="rc-money">$100,000</span></span>
            {" "}· apr 12 – jun 21, 2026 · <em>closed</em>
          </p>
          <p>
            <span className="rc-imprint-no">project 1</span>
            no goal posts. yet · closes dec 31, 2026 · <em>open</em>
          </p>
        </div>
      </section>

      {/* ── no. 0 — the experiment ── */}
      <section className="rc-entry rc-reveal">
        <div className="rc-entry-head">
          <span className="rc-no">no. 0</span>
          <span className="rc-entry-title">the experiment</span>
        </div>
        <p>
          the wager: turn <span className="rc-money">$3,453.83</span> into{" "}
          <span className="rc-money">$100,000</span> by june 21, 2026 — a twentieth
          birthday — with five ai agents, entirely in public.<sup>1</sup>
        </p>
        <p>
          the requirement was a 29×. the s&amp;p does that in about twenty-five
          years. the gap between those numbers was the joke, and the entire point.
        </p>
        <p>
          the model&rsquo;s own monte carlo put the odds at 0.000000%.<sup>2</sup>{" "}
          the model was right. the account peaked at{" "}
          <span className="rc-money">$4,844.76</span> on june 1 and never saw the
          number again.
        </p>
        <p className="rc-conclusion">
          conclusion? <em>ai could not do the impossible.</em>
        </p>
        <p>
          the products are real anyway.<sup>3</sup>
        </p>
        <div className="rc-footnotes">
          <p><sup>1</sup> the pre-mortem, filed before the failure — <Link href="/letters/round-0">/letters/round-0</Link></p>
          <p><sup>2</sup> round 1, which said the number out loud — <Link href="/letters/round-1">/letters/round-1</Link></p>
          <p><sup>3</sup> three papers on ai memory — <Link href="/letters/entrenched-coils">the paper</Link> · <Link href="/letters/entrenched-coils-benchmark">the benchmark</Link> · <Link href="/letters/entrenched-coils-results">the results</Link> · and <Link href="/argument">the deliberations, frozen mid-argument</Link></p>
        </div>
      </section>

      {/* ── plate I — the painting ── */}
      <section className="rc-plate rc-reveal">
        <figure className="rc-frame">
          <div className="rc-mat">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/art/auction-piece.jpg" alt="Cityscape with splatter — oil on canvas" className="rc-art" />
            <span className="rc-sold-dot" aria-label="sold">●</span>
          </div>
          <figcaption className="rc-caption">
            <span className="rc-caption-no">plate i</span>
            <em>cityscape with splatter</em> · oil on canvas · the only piece that
            sold under project 0
          </figcaption>
        </figure>
      </section>

      {/* ── the auction record ── */}
      <section className="rc-entry rc-reveal">
        <div className="rc-entry-head">
          <span className="rc-no">lot 001</span>
          <span className="rc-entry-title">the auction record</span>
        </div>
        <div className="rc-plaque">
          <p className="rc-plaque-head">provenance</p>
          <p>the artist, 2026</p>
          <p>offered — drop 1 · twelve works · zero bids · passed</p>
          <p>
            single-lot sale, june 2026 — hammer <span className="rc-money">$44</span> ·
            winning bidder <Link href="/shareholder/navya">navya rawal</Link>
          </p>
          <p>collection of navya rawal (51%) and the artist (49%)</p>
        </div>
        <p className="rc-errata">
          errata — an earlier printing of this page recorded the hammer at $43 and
          credited the bid to the wrong party. corrected in this edition.
        </p>
      </section>

      {/* ── the intertitle — her voice, its own room ── */}
      <section className="rc-dark rc-reveal">
        <p className="rc-her">&ldquo;scammer gets scammed.&rdquo;</p>
        <p className="rc-her-attr">
          — navya rawal · message attached to the winning bid · entered into the
          record as written
        </p>
      </section>

      {/* ── no. 1 — the art philanthropist ── */}
      <section className="rc-entry rc-reveal">
        <div className="rc-entry-head">
          <span className="rc-no">no. 1</span>
          <span className="rc-entry-title">the art philanthropist</span>
        </div>
        <p>
          the house rule, as published: <em>you can cash out 49% of a piece and
          keep the art.</em>
        </p>
        <p>
          she exercised it. her 49% came to <span className="rc-money">$246</span>.
          she netted <span className="rc-money">$203</span>. the 51% she kept means
          the canvas is hers — physical custody, her wall.
        </p>
        <div className="rc-receipt">
          <p><span>rule invoked</span><span>cash out ≤ 49%, keep the art</span></p>
          <p><span>cashed out · 49%</span><span className="rc-money">$246</span></p>
          <p><span>netted</span><span className="rc-money">$203</span></p>
          <p><span>retained · 51%</span><span>the canvas</span></p>
        </div>
        <p>
          the painting has left the building. this page is the wall where it hung.
        </p>
        <p>
          the first collector of project 0 is also its sharpest critic. the record
          keeps both facts.
        </p>
      </section>

      {/* ── the turn — project 1 ── */}
      <section className="rc-p1 rc-reveal">
        <figure className="rc-frame rc-frame-empty">
          <div className="rc-mat rc-mat-empty">
            <span className="rc-open-dot" aria-label="open">○</span>
          </div>
          <figcaption className="rc-caption">
            <span className="rc-caption-no">plate ii</span>
            <em>untitled</em> · medium undetermined · dimensions variable
          </figcaption>
        </figure>
        <h2 className="rc-p1-title">this is <span className="rc-p1-name">project 1</span>.</h2>
        <p className="rc-p1-line">no explicit goal posts. yet.</p>
        <p className="rc-p1-line">closes december 31, 2026 — {daysToClose} days out.</p>
        <div className="rc-balance">
          <span className="rc-balance-label">opening balance, marked to market</span>
          <span className={`rc-balance-num ${flash === "up" ? "rc-up" : flash === "down" ? "rc-dn" : ""}`}>
            <span className="rc-balance-dollar">$</span>{fmt(total)}
          </span>
          <span className="rc-balance-meta">
            nbis · nok · shaz · spy · ${pendingCash.toLocaleString("en-US", { minimumFractionDigits: 2 })} pending
            · <span className="rc-live-dot" /> live
          </span>
        </div>
        <p className="rc-p1-append">entries will be appended as they occur.</p>
      </section>

      {/* ── contents of the first edition ── */}
      <section className="rc-entry rc-toc rc-reveal">
        <div className="rc-entry-head">
          <span className="rc-no">contents</span>
          <span className="rc-entry-title">the first edition, in full</span>
        </div>
        <ol className="rc-toc-list">
          <li><Link href="/letters/round-0">the pre-mortem</Link><span className="rc-toc-note">filed before the failure</span></li>
          <li><Link href="/letters/round-1">round 1</Link><span className="rc-toc-note">the monte carlo says 0.000000%</span></li>
          <li><Link href="/letters">the letters, complete</Link><span className="rc-toc-note">i – viii</span></li>
          <li><Link href="/letters/entrenched-coils">entrenched coils</Link><span className="rc-toc-note">every ai with memory is lying to itself</span></li>
          <li><Link href="/letters/entrenched-coils-benchmark">the benchmark</Link><span className="rc-toc-note">epistemic metabolism</span></li>
          <li><Link href="/letters/entrenched-coils-results">the results</Link><span className="rc-toc-note">when to doubt, when to trust</span></li>
          <li><Link href="/portfolio">the ledger</Link><span className="rc-toc-note"><Link href="/stocks">stocks</Link> · <Link href="/prediction">prediction</Link></span></li>
          <li><Link href="/argument">the deliberations</Link><span className="rc-toc-note">five agents, frozen mid-argument</span></li>
          <li><span className="rc-toc-plain">the shareholders</span><span className="rc-toc-note"><Link href="/shareholder/navya">navya</Link> · <Link href="/shareholder/franco">franco</Link> · <Link href="/shareholder/elijah">elijah</Link> · <Link href="/shareholder/yashas">yashas</Link></span></li>
          <li><Link href="/statement">the statement</Link><span className="rc-toc-note">everyone comes looking for a résumé</span></li>
          <li><Link href="/green-credit">green credit</Link><span className="rc-toc-note">project 2, on hold</span></li>
          <li><Link href="/archive">the archive</Link><span className="rc-toc-note">the rest of the magazine</span></li>
          <li><Link href="/v9">the previous homepage</Link><span className="rc-toc-note">preserved as found, june 2026</span></li>
        </ol>
      </section>

      {/* ── colophon ── */}
      <footer className="rc-colophon rc-reveal">
        <p className="rc-colophon-motto">probably impossible. definitely public.</p>
        <p className="rc-colophon-rail">
          <a href="https://venmo.com/saathvikpai">venmo @saathvikpai</a>
          {" · "}
          <a href="tel:3853687238">+1 (385) 368-7238</a>
          {" · "}
          <Link href="/6969">everything hidden points to /6969</Link>
        </p>
        <p className="rc-cmiygl">call me if you get lost.</p>
        <p className="rc-sig">aureliex.</p>
      </footer>
    </div>
  );
}

const CSS = `
/* ── tokens ── */
.rc {
  --paper: #F4EFE6;
  --ink: #1C1A17;
  --graphite: #6B6560;
  --rust: #8B3A2E;
  --amber: #8B6914;       /* money on paper — deep amber, readable */
  --amber-bright: #C9952A; /* money on dark */
  --cyan: #0B6E84;        /* project 1's color. appears once. */
  --rose: #B7415C;        /* the sold dot, and only the sold dot */
  --mat: #EFE9DC;
  --rule: rgba(28,26,23,0.22);
  --dark: #171512;        /* the intertitle — warm ink, not pure black */

  min-height: 100vh;
  background: var(--paper);
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  overflow-x: hidden;
  font-family: var(--font-body,'EB Garamond'),Georgia,serif;
}

.rc a { color: var(--ink); text-decoration: none; border-bottom: 1px solid rgba(11,110,132,0.35); padding-bottom: 1px; transition: color 180ms ease, border-color 180ms ease; }
.rc a:hover { color: var(--cyan); border-bottom-color: var(--cyan); }

.rc-money { font-variant-numeric: tabular-nums; color: var(--amber); font-weight: 500; }

/* ── masthead ── */
.rc-mast {
  display: flex; align-items: baseline; justify-content: space-between;
  max-width: 42rem; margin: 0 auto;
  padding: clamp(1.5rem,4vw,2.5rem) 1.5rem 0;
}
.rc-wordmark {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-style: italic; font-size: 1.35rem; letter-spacing: 0.02em;
}
.rc-dot { color: var(--rust); font-style: normal; }
.rc-mast-eyebrow {
  font-family: ui-monospace,'JetBrains Mono','SF Mono',monospace;
  font-size: 0.58rem; letter-spacing: 0.22em; text-transform: uppercase;
  color: var(--graphite);
}

/* ── title page ── */
.rc-title {
  max-width: 42rem; margin: 0 auto; text-align: center;
  padding: clamp(4rem,12vh,7rem) 1.5rem clamp(3rem,7vw,4.5rem);
}
.rc-eyebrow {
  font-family: ui-monospace,'JetBrains Mono',monospace;
  font-size: 0.6rem; letter-spacing: 0.28em; text-transform: uppercase;
  color: var(--graphite); margin: 0 0 2.2rem;
}
.rc-verdict {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-weight: 500; font-size: clamp(2.8rem,9vw,5.25rem);
  line-height: 1.04; letter-spacing: -0.015em; margin: 0;
}
.rc-verdict-sub {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-style: italic; font-size: clamp(1.25rem,3.4vw,1.7rem);
  color: var(--graphite); margin: 1.1rem 0 0;
}
.rc-imprint {
  margin: 3rem auto 0; max-width: 34rem;
  border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule);
  padding: 1.1rem 0.5rem;
  font-family: ui-monospace,'JetBrains Mono',monospace;
  font-size: 0.68rem; letter-spacing: 0.04em; line-height: 2.1;
  color: var(--ink); text-align: left;
}
.rc-imprint p { margin: 0; display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.4em; }
.rc-imprint em { font-style: normal; color: var(--graphite); }
.rc-imprint-no {
  display: inline-block; min-width: 6.5em;
  text-transform: uppercase; letter-spacing: 0.18em; font-size: 0.6rem;
  color: var(--graphite);
}
/* the strikethrough — drawn once, on arrival */
.rc-strike { position: relative; display: inline-block; }
.rc-strike::after {
  content: ''; position: absolute; left: -2%; right: auto; top: 52%;
  width: 0; height: 1.5px; background: var(--rust);
  transition: width 900ms cubic-bezier(0.4,0,0.2,1) 400ms;
}
.rc-reveal.rc-in .rc-strike::after, .rc-title .rc-strike::after { width: 104%; }
.rc-strike .rc-money { color: color-mix(in srgb, var(--amber) 55%, var(--paper)); }

/* ── numbered entries ── */
.rc-entry {
  max-width: 42rem; margin: 0 auto;
  padding: clamp(2.5rem,6vw,4rem) 1.5rem;
}
.rc-entry-head {
  display: flex; align-items: baseline; gap: 1rem;
  border-top: 1px solid var(--rule); padding-top: 0.85rem; margin-bottom: 1.8rem;
}
.rc-no {
  font-family: ui-monospace,'JetBrains Mono',monospace;
  font-size: 0.6rem; letter-spacing: 0.22em; text-transform: uppercase;
  color: var(--rust);
}
.rc-entry-title {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-size: 1.15rem; font-weight: 500; letter-spacing: 0.01em;
}
.rc-entry p {
  font-size: clamp(1.02rem,0.95rem+0.35vw,1.15rem);
  line-height: 1.8; margin: 0 0 1.35rem; color: var(--ink);
}
.rc-entry sup {
  font-family: ui-monospace,'JetBrains Mono',monospace;
  font-size: 0.62em; color: var(--rust); margin-left: 1px;
}
.rc-conclusion {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-size: clamp(1.3rem,3vw,1.6rem) !important; line-height: 1.4 !important;
  margin: 2rem 0 !important;
}
.rc-conclusion em { font-style: italic; }
.rc-footnotes {
  margin-top: 2.2rem; border-top: 1px solid var(--rule); padding-top: 1rem;
}
.rc-footnotes p {
  font-family: ui-monospace,'JetBrains Mono',monospace;
  font-size: 0.66rem !important; line-height: 1.9 !important;
  letter-spacing: 0.02em; color: var(--graphite); margin: 0 0 0.35rem !important;
}
.rc-footnotes sup { margin-right: 0.5em; }

/* ── plate I ── */
.rc-plate { max-width: 46rem; margin: 0 auto; padding: clamp(2rem,5vw,3.5rem) 1.5rem; }
.rc-frame { margin: 0; }
.rc-mat {
  position: relative; background: var(--mat);
  padding: clamp(14px,3vw,26px);
  border: 1px solid rgba(28,26,23,0.85);
  box-shadow: 0 1px 2px rgba(28,26,23,0.12), 0 12px 40px rgba(28,26,23,0.10);
}
.rc-art { display: block; width: 100%; height: auto; }
.rc-sold-dot {
  position: absolute; right: 9px; bottom: 5px;
  color: var(--rose); font-size: 0.6rem; line-height: 1;
}
.rc-caption {
  margin-top: 0.85rem;
  font-family: ui-monospace,'JetBrains Mono',monospace;
  font-size: 0.64rem; letter-spacing: 0.05em; line-height: 1.7;
  color: var(--graphite);
}
.rc-caption em { font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif; font-style: italic; font-size: 0.85rem; color: var(--ink); }
.rc-caption-no {
  text-transform: uppercase; letter-spacing: 0.22em; font-size: 0.58rem;
  color: var(--rust); margin-right: 0.9em;
}

/* ── provenance plaque ── */
.rc-plaque {
  font-family: ui-monospace,'JetBrains Mono',monospace;
  font-size: 0.72rem; line-height: 2.15; letter-spacing: 0.03em;
  border-left: 2px solid var(--rule); padding-left: 1.25rem; margin: 0 0 1.6rem;
}
.rc-plaque p { font-size: 0.72rem !important; line-height: 2.15 !important; margin: 0 !important; font-family: inherit; }
.rc-plaque-head {
  text-transform: uppercase; letter-spacing: 0.25em; font-size: 0.6rem !important;
  color: var(--graphite); margin-bottom: 0.4rem !important;
}
.rc-errata {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-style: italic; font-size: 0.92rem !important; color: var(--graphite);
  border: 1px solid rgba(139,58,46,0.35); padding: 0.7rem 1rem; max-width: 34rem;
}

/* ── the intertitle ── */
.rc-dark {
  background: var(--dark);
  min-height: 72vh;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center; padding: clamp(4rem,10vw,7rem) 1.5rem;
  margin: clamp(2rem,5vw,3.5rem) 0;
}
.rc-her {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-style: italic; font-weight: 400;
  font-size: clamp(2rem,7vw,4rem); line-height: 1.2;
  color: #EFE8D8; margin: 0;
}
.rc-her-attr {
  font-family: ui-monospace,'JetBrains Mono',monospace;
  font-size: 0.6rem; letter-spacing: 0.16em; text-transform: uppercase;
  color: rgba(239,232,216,0.42); margin: 2rem 0 0; line-height: 2;
  max-width: 32rem;
}

/* ── receipt ── */
.rc-receipt {
  font-family: ui-monospace,'JetBrains Mono',monospace;
  max-width: 30rem; margin: 2rem 0; border-top: 1px solid var(--rule);
}
.rc-receipt p {
  display: flex; justify-content: space-between; gap: 1rem;
  font-size: 0.7rem !important; line-height: 1.6 !important; letter-spacing: 0.03em;
  font-family: inherit; margin: 0 !important; padding: 0.55rem 0.15rem;
  border-bottom: 1px solid var(--rule);
}
.rc-receipt p span:first-child { color: var(--graphite); }

/* ── project 1 ── */
.rc-p1 {
  max-width: 42rem; margin: 0 auto; text-align: center;
  padding: clamp(3rem,8vw,5rem) 1.5rem clamp(3rem,7vw,4.5rem);
}
.rc-frame-empty { max-width: 21rem; margin: 0 auto 2.6rem; }
.rc-mat-empty {
  aspect-ratio: 4 / 3; display: flex; align-items: center; justify-content: center;
  background: var(--paper);
}
.rc-open-dot { color: var(--cyan); font-size: 0.85rem; opacity: 0.8; }
.rc-frame-empty .rc-caption { text-align: center; }
.rc-p1-title {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-weight: 500; font-size: clamp(2rem,6vw,3.2rem); line-height: 1.1;
  margin: 0 0 1.2rem; letter-spacing: -0.01em;
}
.rc-p1-name { font-style: italic; color: var(--cyan); }
.rc-p1-line {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-style: italic; font-size: clamp(1.1rem,2.8vw,1.35rem);
  color: var(--graphite); margin: 0.3rem 0;
}
.rc-balance { display: flex; flex-direction: column; align-items: center; gap: 0.6rem; margin: 3rem 0 0; }
.rc-balance-label {
  font-family: ui-monospace,'JetBrains Mono',monospace;
  font-size: 0.58rem; letter-spacing: 0.24em; text-transform: uppercase;
  color: var(--graphite);
}
.rc-balance-num {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-size: clamp(3.2rem,11vw,5.5rem); font-weight: 400; line-height: 1;
  color: var(--amber); font-variant-numeric: tabular-nums;
  transition: color 600ms ease;
}
.rc-balance-dollar { font-size: 0.42em; vertical-align: 0.5em; margin-right: 0.06em; opacity: 0.6; }
.rc-up { color: #3B7A4A; }
.rc-dn { color: var(--rust); }
.rc-balance-meta {
  font-family: ui-monospace,'JetBrains Mono',monospace;
  font-size: 0.6rem; letter-spacing: 0.08em; color: var(--graphite);
  display: inline-flex; align-items: center; gap: 0.45em; flex-wrap: wrap; justify-content: center;
}
.rc-live-dot {
  display: inline-block; width: 5px; height: 5px; border-radius: 50%;
  background: #3B7A4A; animation: rc-pulse 4s ease-in-out infinite;
}
@keyframes rc-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.25; } }
.rc-p1-append {
  font-family: ui-monospace,'JetBrains Mono',monospace;
  font-size: 0.62rem; letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--graphite); margin: 2.6rem 0 0;
}

/* ── contents ── */
.rc-toc-list {
  list-style: none; margin: 0; padding: 0;
  counter-reset: rc-toc;
}
.rc-toc-list li {
  counter-increment: rc-toc;
  display: flex; align-items: baseline; gap: 1rem;
  padding: 0.7rem 0; border-bottom: 1px solid var(--rule);
  font-size: 1rem; line-height: 1.5;
}
.rc-toc-list li::before {
  content: counter(rc-toc, lower-roman) ".";
  font-family: ui-monospace,'JetBrains Mono',monospace;
  font-size: 0.62rem; color: var(--graphite); min-width: 2.4em;
  letter-spacing: 0.06em;
}
.rc-toc-list li > a, .rc-toc-plain { flex-shrink: 0; }
.rc-toc-note {
  font-family: ui-monospace,'JetBrains Mono',monospace;
  font-size: 0.62rem; letter-spacing: 0.04em; color: var(--graphite);
  margin-left: auto; text-align: right;
}
.rc-toc-note a { border-bottom-color: rgba(28,26,23,0.25); }

/* ── colophon ── */
.rc-colophon {
  max-width: 42rem; margin: 0 auto; text-align: center;
  padding: clamp(3rem,8vw,5rem) 1.5rem clamp(4rem,9vw,6rem);
}
.rc-colophon-motto {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-style: italic; font-size: 1.15rem; color: var(--ink); margin: 0 0 1.4rem;
}
.rc-colophon-rail {
  font-family: ui-monospace,'JetBrains Mono',monospace;
  font-size: 0.6rem; letter-spacing: 0.08em; color: var(--graphite); margin: 0 0 3rem;
}
.rc-colophon-rail a { color: var(--graphite); border-bottom-color: var(--rule); }
.rc-colophon-rail a:hover { color: var(--cyan); }
.rc-cmiygl {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-style: italic; font-size: clamp(1.4rem,4vw,2rem); margin: 0 0 0.8rem;
  color: var(--ink); opacity: 0.8;
}
.rc-sig {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-style: italic; font-size: 0.95rem; letter-spacing: 0.14em;
  color: var(--graphite); margin: 0;
}

/* ── reveal ── */
.rc-reveal { opacity: 0; transform: translateY(14px); transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.22,1,0.36,1); }
.rc-reveal.rc-in { opacity: 1; transform: none; }

/* ── mobile ── */
@media (max-width: 640px) {
  .rc-mast { padding-top: 1.25rem; }
  .rc-mast-eyebrow { display: none; }
  .rc-title { padding-top: 3rem; }
  .rc-imprint { font-size: 0.6rem; line-height: 2; }
  .rc-imprint-no { min-width: 100%; margin-bottom: -0.5em; }
  .rc-toc-list li { flex-wrap: wrap; }
  .rc-toc-note { margin-left: 3.4em; width: 100%; text-align: left; }
  .rc-dark { min-height: 60vh; }
  .rc-plaque { font-size: 0.66rem; }
  .rc-plaque p { font-size: 0.66rem !important; }
}

/* ── reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .rc-reveal { opacity: 1; transform: none; transition: none; }
  .rc-strike::after { transition: none; width: 104%; }
  .rc-live-dot { animation: none; }
}
`;
