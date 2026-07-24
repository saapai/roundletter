"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import RecordMaze from "@/components/RecordMaze";

/* ═══════════════════════════════════════════════════════════════
   THE RECORD — second edition, revised printing

   Consensus build of a four-agent design tribunal:
   · TYPE (critic A): Fraunces is the verdict voice — exactly three
     display beats (the verdict, the intertitle, the turn). Cormorant
     demoted to entry titles. Two mono sizes only: LABEL 11px / META
     13px. 34rem prose measure, hanging folio numerals, †‡§ footnotes,
     Ms Madi signs the colophon.
   · TEXTURE (critic B): fixed 4% grain; the painting's palette bleeds
     as sub-2% ghost washes around its plates only; gilt frame on the
     sold work, raw hairline on the empty one; the intertitle is the
     archive rose-gold shaft; project 1 opens at dawn (--sunset-*);
     the colophon ends on a coral ember. Three light sources, no more.
   · NARRATIVE (critic C): hook under the verdict; projects are wagers,
     rounds are letters filed inside one; the auction is one story told
     once; balance is "carried forward"; two-tier contents.
   · CONTENT (miner): the arc ledger, the deliberation, the cast as
     audited, and the project-1 letter ("the marathon, run backwards").

   Paper-first. Ink never pure black. Amber = money only. Cyan appears
   once — it is project 1's color. Rose = sold. One dark beat.
   ═══════════════════════════════════════════════════════════════ */

type Holding = { ticker: string; shares: number; entry_value: number; noLiveQuote?: boolean };

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
          // flagged holdings are carried at the book mark no matter what the
          // feed says — a stale cached payload can't poison the total
          if (h.noLiveQuote) { sum += h.entry_value; continue; }
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
  const tickers = holdings.map((h) => h.ticker.toLowerCase()).join(" · ");

  useEffect(() => {
    const els = rootRef.current?.querySelectorAll(".rc-reveal");
    if (!els) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("rc-in");
      }),
      { threshold: 0.06, rootMargin: "0px 0px -32px 0px" },
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
        <span className="rc-label">the record · second edition</span>
      </header>

      {/* ── title page ── */}
      <section className="rc-title">
        <p className="rc-label rc-title-eyebrow">filed july 2026 · salt lake city</p>
        <h1 className="rc-verdict">project 0 failed<span className="rc-verdict-period">.</span></h1>
        <p className="rc-hook">
          five ai agents tried to turn $3,453 into $100,000 in ten weeks, in
          public. this is the record of how they didn&rsquo;t.
        </p>
        <div className="rc-imprint rc-reveal">
          <p>
            <a href="#no-i" className="rc-imprint-row">
              <span className="rc-imprint-no">project 0</span>
              <span className="rc-imprint-body">
                <span className="rc-money">$3,453.83</span> →{" "}
                <span className="rc-strike"><span className="rc-money">$100,000</span></span>
                {" "}· apr 12 – jun 21, 2026 <span className="rc-nowrap">· <em>closed</em></span>
              </span>
            </a>
          </p>
          <p>
            <a href="#project-1" className="rc-imprint-row">
              <span className="rc-imprint-no">project 1</span>
              <span className="rc-imprint-body">no goal posts. yet · closes dec 31, 2026 <span className="rc-nowrap">· <em>open</em></span></span>
            </a>
          </p>
          <p>
            <span className="rc-imprint-row">
              <span className="rc-imprint-no">numbering</span>
              <span className="rc-imprint-body">a project is a wager. a round is a letter filed inside one. project 0 was played in rounds 0 and 1.</span>
            </span>
          </p>
          <p className="rc-imprint-return">
            returning? the auction settled and the number is live —{" "}
            <a href="#project-1">jump to project 1</a>.
          </p>
        </div>
      </section>

      {/* ── no. i — the experiment ── */}
      <section className="rc-entry rc-reveal" id="no-i">
        <div className="rc-entry-head">
          <span className="rc-folio"><span className="rc-folio-num">i</span><span className="rc-label">entry</span></span>
          <span className="rc-entry-title">the experiment</span>
        </div>
        <p className="rc-dropcap">
          the wager: turn <span className="rc-money">$3,453.83</span> of my own
          money into <span className="rc-money">$100,000</span> by june 21, 2026
          — my twentieth birthday — with five ai agents, entirely in
          public.<sup className="rc-fn">†</sup>
        </p>
        <p>
          the requirement was a 29×. the s&amp;p does that in about twenty-five
          years. the gap between those numbers was the joke, and the entire point.
        </p>
        <p>
          {"the model's own monte carlo put the odds at 0.000000%."}
          <sup className="rc-fn">‡</sup>{" "}
          {"in one million simulated paths, the best reached $9,512. the model was right. the account peaked at "}
          <span className="rc-money">$4,844.76</span>
          {" on june 1 and never saw the number again."}
        </p>
        <p>
          the portfolio had four rooms — stocks, prediction, cash, and art:
          twelve original works, offered at auction. exactly one sold.
        </p>
        <p className="rc-conclusion">
          conclusion? <em>ai could not do the impossible.</em>
        </p>
        <p>
          the products are real anyway.<sup className="rc-fn">§</sup>
        </p>
        <div className="rc-footnotes">
          <p><span className="rc-fn">†</span> round 0 of project 0 — the pre-mortem, filed before the failure — <Link href="/letters/round-0">/letters/round-0</Link></p>
          <p><span className="rc-fn">‡</span> round 1 of project 0, which said the number out loud — <Link href="/letters/round-1">/letters/round-1</Link></p>
          <p><span className="rc-fn">§</span> three papers on ai memory — <Link href="/letters/entrenched-coils">the paper</Link> · <Link href="/letters/entrenched-coils-benchmark">the benchmark</Link> · <Link href="/letters/entrenched-coils-results">the results</Link> — and <Link href="/argument">the deliberations, frozen mid-argument</Link></p>
        </div>
      </section>

      {/* ── no. ii — how it went ── */}
      <section className="rc-entry rc-reveal">
        <div className="rc-entry-head">
          <span className="rc-folio"><span className="rc-folio-num">ii</span><span className="rc-label">entry</span></span>
          <span className="rc-entry-title">how it went</span>
        </div>
        <div className="rc-arc">
          <p><span className="rc-arc-date">jan 2025</span><span>the account opens the year at <span className="rc-money">$1,296.08</span>. +120% in fifteen months, then −31% in two.</span></p>
          <p><span className="rc-arc-date">apr 12</span><span>marked at <span className="rc-money">$3,453.83</span>. the wager is filed against myself: the entire account, a 29×, ten weeks.</span></p>
          <p><span className="rc-arc-date">apr 18</span><span>first sealed prediction, sp-001 — forfeited. the plaintext was lost. the first loss on the record was procedural.</span></p>
          <p><span className="rc-arc-date">apr 21</span><span>the first outside dollar: $50, from an anonymous donor. <span className="rc-money">$161</span> follows, from four names.</span></p>
          <p><span className="rc-arc-date">apr 26</span><span>{"the pre-mortem is filed. four failure modes, ranked. number two: “art doesn't clear.”"}</span></p>
          <p><span className="rc-arc-date">may 7</span><span>round 1: one million monte carlo paths. the best reaches $9,512. p($100,000) = 0.000000%.</span></p>
          <p><span className="rc-arc-date">may–jun</span><span>drop 1: twelve original works, starting bids $1–5. zero bids. failure mode two, executed exactly as written.</span></p>
          <p><span className="rc-arc-date">jun 1</span><span>all-time high, <span className="rc-money">$4,844.76</span>. the account never sees the number again.</span></p>
          <p><span className="rc-arc-date">jun 20</span><span>the liquidity event, salt lake city. the single-lot sale — a bid war ends at <span className="rc-money">$44</span>.</span></p>
          <p><span className="rc-arc-date">jun 21</span><span>the twentieth birthday. $100,000 does not print. the wager resolves: lost.</span></p>
        </div>
      </section>

      {/* ── no. iii — the deliberation ── */}
      <section className="rc-entry rc-reveal">
        <div className="rc-entry-head">
          <span className="rc-folio"><span className="rc-folio-num">iii</span><span className="rc-label">entry</span></span>
          <span className="rc-entry-title">the deliberation, day 25</span>
        </div>
        <p>
          when round 1 printed the zero, the five agents voted on whether to
          continue. from the transcript:
        </p>
        <div className="rc-voices">
          <p><span className="rc-label rc-voice-name">the bull</span><em>{"“you cannot simulate a letter going viral.”"}</em></p>
          <p><span className="rc-label rc-voice-name">the bear</span><em>{"“attention does not compound. returns do.”"}</em></p>
          <p><span className="rc-label rc-voice-name">flow</span><em>{"“that is not a strength of the thesis — it is a confession that the thesis is unfalsifiable.”"}</em></p>
          <p><span className="rc-label rc-voice-name">the historian</span><em>{"“that is either intellectually honest or intellectually convenient, and you will not know which until june 21.”"}</em></p>
        </div>
        <p>june 21 answered him.</p>
      </section>

      {/* ── plate i — the painting ── */}
      <div className="rc-plate-zone">
        <section className="rc-plate rc-reveal">
          <figure className="rc-frame">
            <div className="rc-mat">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/art/auction-piece.jpg" alt="Cityscape with splatter — oil on canvas" className="rc-art" />
            </div>
            <figcaption className="rc-caption">
              <span className="rc-label rc-caption-no">plate i</span>
              <span className="rc-sold-dot" aria-label="sold" />
              <em>cityscape with splatter</em>
              <span>oil on canvas · the only piece that sold under project 0</span>
            </figcaption>
          </figure>
        </section>

        {/* ── lot 001 — the auction record ── */}
        <section className="rc-entry rc-reveal">
          <div className="rc-entry-head">
            <span className="rc-folio"><span className="rc-folio-num rc-folio-lot">001</span><span className="rc-label">lot</span></span>
            <span className="rc-entry-title">the auction record</span>
          </div>
          <div className="rc-plaque">
            <p className="rc-label rc-plaque-head">provenance</p>
            <p>the artist, 2026</p>
            <p>offered — drop 1 · twelve works · zero bids · passed</p>
            <p>
              single-lot sale, june 2026 — a bid war: $32, $41, $43, hammer{" "}
              <span className="rc-money">$44</span> · winning bidder{" "}
              <Link href="/shareholder/navya">navya rawal</Link>
            </p>
            <p>{"underbidder of record — aryan dutta baruah, $43, “get agi pilled” — outbid at the close"}</p>
            <p>collection of navya rawal (51%) and the artist (49%)</p>
          </div>
          <p className="rc-errata">
            — errata: an earlier printing recorded the hammer at $43, credited to
            the wrong party. corrected in this edition.
          </p>
        </section>
      </div>

      {/* ── the intertitle — her voice, its own room ── */}
      <section className="rc-dark rc-reveal">
        <p className="rc-her">&ldquo;scammer gets scammed.&rdquo;</p>
        <p className="rc-her-attr">
          — navya rawal · message attached to the winning bid · entered into the
          record as written
        </p>
      </section>

      {/* ── no. iv — the art philanthropist ── */}
      <section className="rc-entry rc-reveal">
        <div className="rc-entry-head">
          <span className="rc-folio"><span className="rc-folio-num">iv</span><span className="rc-label">entry</span></span>
          <span className="rc-entry-title">the art philanthropist</span>
        </div>
        <p>
          the house rule, as published: <em>you can cash out 49% of a piece and
          keep the art.</em> the cash-out was pegged to the portfolio, not the
          hammer — 10% of the book on settlement day, about{" "}
          <span className="rc-money">$502</span>.
        </p>
        <p>
          she exercised it. her 49% came to <span className="rc-money">$246</span>.
          she netted <span className="rc-money">$203</span>. the 51% she kept
          means the canvas is hers — physical custody, her wall.
        </p>
        <div className="rc-receipt">
          <p><span>rule invoked</span><span>cash out ≤ 49%, keep the art</span></p>
          <p><span>cashed out · 49%</span><span className="rc-money">$246</span></p>
          <p><span>netted</span><span className="rc-money">$203</span></p>
          <p><span>retained · 51%</span><span>the canvas</span></p>
        </div>
        <p>
          she paid $44 for the piece. the house paid her $246 to keep it.{" "}
          <em>scammer gets scammed</em> — entered into the record as accurate.
        </p>
        <p>
          the painting has left the building. this page is the wall where it
          hung. the first collector of project 0 is also its sharpest critic —
          the record keeps both facts.
        </p>
      </section>

      {/* ── interlude — the maze ── */}
      <RecordMaze />

      {/* ── the turn — project 1 ── */}
      <section className="rc-p1" id="project-1">
        <figure className="rc-frame rc-frame-empty rc-reveal">
          <div className="rc-mat rc-mat-empty" />
          <figcaption className="rc-caption rc-caption-center">
            <span className="rc-label rc-caption-no">plate ii</span>
            <span className="rc-open-dot" aria-label="open" />
            <em>untitled</em> · medium undetermined · dimensions variable
          </figcaption>
        </figure>
        <h2 className="rc-p1-title rc-reveal">this is <span className="rc-p1-name">project 1</span>.</h2>
        <p className="rc-p1-line rc-reveal">project 0 had a number and died by it. project 1 has no number — only a date.</p>
        <p className="rc-p1-line rc-reveal">whatever is true on december 31, 2026 gets published. {daysToClose} days out.</p>
        <div className="rc-balance rc-reveal">
          <span className="rc-label rc-balance-label">carried forward · marked to market</span>
          <span className={`rc-balance-num ${flash === "up" ? "rc-up" : flash === "down" ? "rc-dn" : ""}`}>
            <span className="rc-balance-dollar">$</span>{fmt(total)}
          </span>
          <span className="rc-balance-meta">
            {tickers} · ${pendingCash.toLocaleString("en-US", { minimumFractionDigits: 2 })} pending
            <span className="rc-live-unit">· <span className="rc-live-dot" /> live</span>
          </span>
          <span className="rc-balance-note">the same account project 0 died in. the count restarts; the money doesn&rsquo;t.</span>
        </div>

        {/* the project-1 letter */}
        <article className="rc-letter rc-reveal">
          <h3 className="rc-letter-title">the marathon, run backwards.</h3>
          <p className="rc-dropcap">
            in may i asked a question on this page: if someone paid you 100
            million dollars to run a 3:20 marathon by the end of the year, could
            you do it? the thesis was that stakes bend reality — that there is a
            number at which you drop everything, train daily, and the impossible
            becomes merely brutal. i priced my number at $100,000 by june 21 and
            called it my 3:20 marathon.
          </p>
          <p>
            {"here is what the record shows. reality does not bend. it was never the stakes that were wrong — it was the direction of the argument. at 100 million you train. at $100,000 in ten weeks with $3,453.83, you don't train. you gamble. the stakes were big enough to make me public and not nearly big enough to make the math different."}
          </p>
          <p>
            {"the verdict on this page says "}<em>ai could not do the impossible</em>
            {", and i want to be precise about what that means, because it is the opposite of an excuse. the five agents were not built to make $100,000. they were built to stop me from lying about whether i would. they did their job. the monte carlo said 0.000000% on day 25 and i kept going for 45 more days anyway. the ai told the truth the whole time. the impossible part was mine."}
          </p>
          <p className="rc-letter-beat">so project 1 opens with no goal posts. yet.</p>
          <p>
            {"this is not humility and it is not cowardice. project 0 proved that a number named before it is earned is a story, not a plan — and this site has a rule against narrating. the pre-mortem said it first: when the account is at $5,200, $5,200 is not basically $100k, no matter how you squint. the reverse is also true. a goal post declared at $4,201.97 would be a costume."}
          </p>
          <p>
            {"the goal posts arrive the day the record earns them — the day this book does something that would embarrass me "}
            <em>not</em>
            {" to commit to. when that happens, the number gets written here, sealed, dated, with the odds against it printed alongside, and this paragraph becomes the thing it is arguing against."}
          </p>
          <p className="rc-letter-beat">
            project 0 was a promise made before the evidence. project 1 is
            evidence collected before the promise.
          </p>
          <p>
            the account is live above. the close is december 31. entries will be
            appended as they occur.
          </p>
          <p className="rc-letter-close">the door is open.</p>
          <p className="rc-feed-line">no mailing list. no feed. the page is the feed — come back, or call.</p>
        </article>
      </section>

      {/* ── no. v — the cast, as audited ── */}
      <section className="rc-entry rc-reveal">
        <div className="rc-entry-head">
          <span className="rc-folio"><span className="rc-folio-num">v</span><span className="rc-label">entry</span></span>
          <span className="rc-entry-title">the cast, as audited</span>
        </div>
        <p className="rc-cast-note">
          hit rates from the published audit at <Link href="/statement">/statement</Link>.
          the panel was scored on calibration, not returns.
        </p>
        <div className="rc-cast">
          <p><span className="rc-label rc-voice-name">the bull</span><span>steelman the thesis · hit rate 93.3% — right, for reasons the audit could not separate from the tape.</span></p>
          <p><span className="rc-label rc-voice-name">the bear</span><span>survive the drawdowns · hit rate 0.0% — wrong about every week and right about the ending.</span></p>
          <p><span className="rc-label rc-voice-name">macro</span><span>position for the backdrop · hit rate 0.0% — voted its role name, not the evidence.</span></p>
          <p><span className="rc-label rc-voice-name">flow</span><span>own the mechanics · hit rate 20.0% — called the mechanics of moves it mispredicted.</span></p>
          <p><span className="rc-label rc-voice-name">the historian</span><span>base rates from prior waves · hit rate 0.0% — its base rate remains unfalsified at the ten-year horizon.</span></p>
        </div>
        <p className="rc-cast-fine">
          {"fine print: 97.7% of confidences were a schema default. four of five agents scored worse than random. zero trades were sourced from debate output. the panel's honest product was never the predictions — it was the disagreement, kept on the page. the ai predicted this test itself, in the one letter it signed: "}
          <Link href="/letters/v1">/letters/v1</Link>.
        </p>
        <p className="rc-cast-fine">
          the shareholders — <span className="rc-money">$161</span>, in order of
          appearance: <Link href="/shareholder/navya">navya rawal</Link> ($50 —
          later the first and only collector, and the sharpest critic),{" "}
          <Link href="/shareholder/yashas">yashas shashidara</Link> ($41),{" "}
          <Link href="/shareholder/franco">franco cachay</Link> ($20),{" "}
          <Link href="/shareholder/elijah">elijah bautista</Link> ($50).
        </p>
      </section>

      {/* ── contents ── */}
      <section className="rc-entry rc-toc rc-reveal">
        <div className="rc-entry-head">
          <span className="rc-folio"><span className="rc-folio-num rc-folio-lot">⁂</span><span className="rc-label">index</span></span>
          <span className="rc-entry-title">contents of the first edition</span>
        </div>
        <p className="rc-toc-direction">
          {"if you're new: read the pre-mortem first. it was filed before the failure, and it called it."}
        </p>
        <p className="rc-label rc-toc-tier">start here</p>
        <ol className="rc-toc-list">
          <li><Link href="/letters/round-0">the pre-mortem</Link><span className="rc-toc-dots" /><span className="rc-toc-note">project 0 · filed before the failure</span></li>
          <li><Link href="/letters/round-1">round 1</Link><span className="rc-toc-dots" /><span className="rc-toc-note">project 0 · the monte carlo says 0.000000%</span></li>
          <li><Link href="/letters">the letters, complete</Link><span className="rc-toc-dots" /><span className="rc-toc-note">i – viii</span></li>
        </ol>
        <p className="rc-label rc-toc-tier">the apparatus</p>
        <ol className="rc-toc-list" start={4}>
          <li><Link href="/letters/entrenched-coils">entrenched coils</Link><span className="rc-toc-dots" /><span className="rc-toc-note">every ai with memory is lying to itself</span></li>
          <li><Link href="/letters/entrenched-coils-benchmark">the benchmark</Link><span className="rc-toc-dots" /><span className="rc-toc-note">epistemic metabolism</span></li>
          <li><Link href="/letters/entrenched-coils-results">the results</Link><span className="rc-toc-dots" /><span className="rc-toc-note">when to doubt, when to trust</span></li>
          <li><Link href="/portfolio">the ledger</Link><span className="rc-toc-dots" /><span className="rc-toc-note"><Link href="/stocks">stocks</Link> · <Link href="/prediction">prediction</Link></span></li>
          <li><Link href="/argument">the deliberations</Link><span className="rc-toc-dots" /><span className="rc-toc-note">five agents, frozen mid-argument</span></li>
          <li><Link href="/statement">the statement</Link><span className="rc-toc-dots" /><span className="rc-toc-note">the audit lives here</span></li>
          <li><Link href="/green-credit">green credit</Link><span className="rc-toc-dots" /><span className="rc-toc-note">project 2, on hold — no owner, no curator, no fee, no exit</span></li>
          <li><Link href="/archive">the archive</Link><span className="rc-toc-dots" /><span className="rc-toc-note">the rest of the magazine</span></li>
          <li><Link href="/v9">the previous homepage</Link><span className="rc-toc-dots" /><span className="rc-toc-note">preserved as found, june 2026</span></li>
        </ol>
      </section>

      {/* ── colophon ── */}
      <footer className="rc-colophon rc-reveal">
        <p className="rc-marx">&ldquo;I am nothing, but I must be everything.&rdquo;<span className="rc-marx-attr"> — marx</span></p>
        <p className="rc-colophon-motto">probably impossible. definitely public.</p>
        <p className="rc-colophon-rail">
          <a href="https://venmo.com/saathvikpai">venmo @saathvikpai</a>
          {" · "}
          <a href="tel:3853687238">+1 (385) 368-7238</a>
          {" · personally guaranteed · "}
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
  --amber: #8B6914;
  --cyan: #0B6E84;
  --rose: #B7415C;
  --mat: #F7F1E2;
  --slip: #EDE5D3;
  --rule: rgba(28,26,23,0.22);
  --dark: #0a0610;

  min-height: 100vh;
  background: var(--paper);
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  overflow-x: hidden;
  font-family: var(--font-body,'EB Garamond'),Georgia,serif;
  font-feature-settings: "liga", "kern", "onum";
}

/* grain — the paper is paper (critic B, defect 1) */
.rc::before {
  content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 40;
  opacity: 0.04; mix-blend-mode: multiply;
  background-image:
    radial-gradient(rgba(28,26,23,0.6) 1px, transparent 1px),
    radial-gradient(rgba(28,26,23,0.4) 1px, transparent 1px);
  background-size: 3px 3px, 5px 5px; background-position: 0 0, 2px 2px;
}

.rc a { color: var(--ink); text-decoration: none; border-bottom: 1px solid rgba(11,110,132,0.35); padding-bottom: 1px; transition: color 180ms ease, border-color 180ms ease; }
.rc a:hover { color: var(--cyan); border-bottom-color: var(--cyan); }

.rc-money { font-variant-numeric: lining-nums tabular-nums; font-feature-settings: "lnum", "tnum"; color: var(--amber); font-weight: 500; }

/* the two mono sizes — LABEL and META, nothing smaller (critic A, defect 3) */
.rc-label {
  font-family: ui-monospace,'JetBrains Mono','SF Mono',monospace;
  font-size: 0.6875rem; letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--graphite);
}
.rc-meta, .rc-imprint, .rc-footnotes p, .rc-plaque p, .rc-receipt p,
.rc-toc-note, .rc-colophon-rail, .rc-balance-meta, .rc-balance-note, .rc-arc-date {
  font-family: ui-monospace,'JetBrains Mono','SF Mono',monospace;
  font-size: 0.8125rem; letter-spacing: 0.03em;
}

/* ── masthead ── */
.rc-mast {
  display: flex; align-items: baseline; justify-content: space-between;
  max-width: 44rem; margin: 0 auto;
  padding: clamp(1.5rem,4vw,2.5rem) 1.5rem 0;
}
.rc-wordmark {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-style: italic; font-size: 1.35rem; letter-spacing: 0.02em;
}
.rc-dot { color: var(--rust); font-style: normal; }

/* ── title page ── */
.rc-title {
  max-width: 44rem; margin: 0 auto; text-align: center;
  padding: clamp(4rem,11vh,6.5rem) 1.5rem clamp(3rem,7vw,4.5rem);
}
.rc-title-eyebrow { display: block; margin: 0 0 1.4rem; }
.rc-verdict {
  font-family: var(--font-fraunces,'Fraunces'),Georgia,serif;
  font-optical-sizing: auto;
  font-weight: 620; font-size: clamp(3.4rem,10vw,6.75rem);
  line-height: 0.98; letter-spacing: -0.03em; margin: 0;
}
.rc-verdict-period { color: var(--rust); }
.rc-hook {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-style: italic; font-size: clamp(1.15rem,3vw,1.45rem);
  line-height: 1.5; color: var(--graphite);
  max-width: 34rem; margin: 1.4rem auto 0;
}
.rc-imprint {
  margin: 2.25rem auto 0; max-width: 30rem;
  border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule);
  padding: 1rem 0.25rem; line-height: 2; color: var(--ink); text-align: left;
}
.rc-imprint p { margin: 0; }
.rc-imprint em { font-style: normal; color: var(--graphite); }
.rc-imprint-row { display: flex; align-items: baseline; gap: 0.9em; border: none; padding: 0; }
a.rc-imprint-row:hover .rc-imprint-body { color: var(--cyan); }
.rc-imprint-no {
  flex-shrink: 0; min-width: 6.2em;
  text-transform: uppercase; letter-spacing: 0.16em; font-size: 0.6875rem;
  color: var(--graphite);
}
.rc-imprint-body { transition: color 180ms ease; }
.rc-imprint-return { margin-top: 0.6rem !important; color: var(--graphite); }
.rc-imprint-return a { color: var(--cyan); border-bottom-color: rgba(11,110,132,0.35); }

.rc-strike { position: relative; display: inline-block; }
.rc-strike::after {
  content: ''; position: absolute; left: -2%; top: 52%;
  width: 0; height: 1.5px; background: var(--rust);
  transition: width 900ms cubic-bezier(0.4,0,0.2,1) 400ms;
}
.rc-title .rc-strike::after, .rc-reveal.rc-in .rc-strike::after { width: 104%; }

/* ── entries ── */
.rc-entry {
  position: relative;
  max-width: 37rem; margin: 0 auto;
  padding: clamp(2.25rem,5.5vw,3.5rem) 1.5rem;
}
.rc-entry-head {
  display: flex; align-items: baseline; gap: 1rem;
  padding-top: 0.85rem; margin-bottom: 1.7rem;
  border-top: 1px solid transparent;
  border-image: linear-gradient(90deg, var(--rust), rgba(139,58,46,0.12) 45%, transparent 80%) 1;
  border-top-width: 1px; border-top-style: solid;
}
.rc-folio { display: flex; align-items: baseline; gap: 0.55em; }
.rc-folio-num {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-size: 1.7rem; line-height: 1; color: var(--rust);
  font-variant-numeric: oldstyle-nums;
}
.rc-folio-lot { font-size: 1.25rem; }
.rc-entry-title {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-size: 1.4rem; font-weight: 600; letter-spacing: 0.01em;
}
.rc-entry > p {
  font-size: clamp(1.0625rem, 1rem + 0.3vw, 1.1875rem);
  line-height: 1.62; margin: 0 0 1.25rem; color: var(--ink);
  max-width: 34rem;
}
.rc-fn {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  color: var(--rust); font-size: 0.8em; vertical-align: super; line-height: 0;
  margin-left: 1px; font-style: normal;
}
.rc-dropcap::first-letter {
  font-family: var(--font-fraunces,'Fraunces'),Georgia,serif;
  float: left; font-size: 3.1em; line-height: 0.82;
  padding: 0.06em 0.09em 0 0; color: var(--ink); font-weight: 500;
}
.rc-entry p.rc-conclusion {
  font-family: var(--font-fraunces,'Fraunces'),Georgia,serif;
  font-weight: 480; font-size: clamp(1.5rem,3.6vw,2.05rem); line-height: 1.3;
  margin: 2.4rem 0; padding-top: 1.4rem;
  border-top: 1px solid var(--rule); max-width: 30rem;
}
.rc-conclusion em { font-style: italic; }
.rc-footnotes { margin-top: 2rem; border-top: 1px solid var(--rule); padding-top: 1rem; }
.rc-footnotes p { line-height: 1.85; color: var(--graphite); margin: 0 0 0.4rem; }
.rc-footnotes .rc-fn { margin-right: 0.5em; vertical-align: baseline; }

/* the arc ledger */
.rc-arc p {
  display: flex; gap: 1.1em; align-items: baseline;
  margin: 0; padding: 0.55rem 0; border-bottom: 1px solid rgba(28,26,23,0.10);
  font-size: 1.03rem; line-height: 1.55;
}
.rc-arc p:last-child { border-bottom: none; }
.rc-arc-date { flex-shrink: 0; min-width: 5.4em; color: var(--graphite); }

/* the deliberation voices */
.rc-voices { margin: 1.6rem 0; }
.rc-voices p { display: flex; gap: 1em; align-items: baseline; margin: 0 0 1rem; }
.rc-voice-name { flex-shrink: 0; min-width: 7.2em; }
.rc-voices em {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-style: italic; font-size: 1.15rem; line-height: 1.5;
}

/* ── plate zone — the painting's palette bleeds here only ── */
.rc-plate-zone {
  background:
    radial-gradient(ellipse 90% 55% at 18% 22%, rgba(194,37,26,0.05), transparent 70%),
    radial-gradient(ellipse 80% 50% at 85% 55%, rgba(27,58,138,0.05), transparent 70%),
    radial-gradient(ellipse 60% 40% at 55% 95%, rgba(107,63,160,0.04), transparent 75%);
}
.rc-plate { max-width: 46rem; margin: 0 auto; padding: clamp(2rem,5vw,3.5rem) 1.5rem 0; }
.rc-frame { margin: 0; }
.rc-mat {
  position: relative; background: var(--mat);
  padding: clamp(18px,3.5vw,34px);
  border: 3px solid transparent;
  border-image: linear-gradient(135deg, #A8853C, #D9B96A 30%, #8B6914 55%, #C9A85C 80%, #7A5E20) 1;
  outline: 1px solid rgba(28,26,23,0.6);
  box-shadow:
    inset 0 0 0 1px rgba(28,26,23,0.10),
    0 1px 2px rgba(28,26,23,0.18),
    0 18px 50px -12px rgba(74,26,52,0.22);
}
.rc-art { display: block; width: 100%; height: auto; box-shadow: inset 0 0 0 1px rgba(28,26,23,0.35), 0 1px 3px rgba(28,26,23,0.30); }
.rc-caption {
  margin-top: 0.9rem; display: flex; align-items: baseline; gap: 0.6em; flex-wrap: wrap;
  font-family: ui-monospace,'JetBrains Mono','SF Mono',monospace;
  font-size: 0.8125rem; letter-spacing: 0.03em; line-height: 1.7;
  color: var(--graphite);
}
.rc-caption em { font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif; font-style: italic; font-size: 1rem; color: var(--ink); }
.rc-caption-no { color: var(--rust); }
.rc-caption-center { justify-content: center; }
.rc-sold-dot {
  width: 8px; height: 8px; border-radius: 50%; background: var(--rose);
  box-shadow: 0 0 0 3px rgba(183,65,92,0.12); align-self: center;
}
.rc-open-dot {
  width: 8px; height: 8px; border-radius: 50%; background: transparent;
  border: 1.5px solid var(--cyan); box-shadow: 0 0 0 3px rgba(11,110,132,0.10);
  align-self: center;
}

/* provenance plaque — print furniture, not docs-UI (critics A+B) */
.rc-plaque {
  border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule);
  padding: 1rem 0.25rem; margin: 0 0 1.4rem; line-height: 2.05;
}
.rc-plaque p { margin: 0; }
.rc-plaque-head { display: block; margin-bottom: 0.35rem; }
.rc-errata {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-style: italic; font-size: 0.95rem !important; color: var(--graphite);
  max-width: 30rem; padding-left: 2ch;
}

/* ── the intertitle — the archive shaft (critic B, move A) ── */
.rc-dark {
  position: relative;
  min-height: 100svh;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center; padding: clamp(4rem,10vw,7rem) 1.5rem;
  margin-top: clamp(2rem,5vw,3.5rem);
  background:
    radial-gradient(ellipse 65% 50% at 82% 85%, rgba(196,138,122,0.16), transparent),
    radial-gradient(ellipse 55% 45% at 8% 6%, rgba(52,18,40,0.35), transparent),
    linear-gradient(155deg,
      #0a0610 0%, #14091a 10%, #2a1028 24%, #4a1a34 38%,
      #7a3048 47%, #b06068 51%, #7a3048 55%,
      #4a1a34 68%, #2a1028 82%, #0a0610 100%);
}
.rc-dark::before {
  content: ''; position: absolute; left: 0; right: 0; top: -1px;
  height: clamp(40px,8vh,80px); transform: translateY(-100%);
  background: linear-gradient(to bottom, rgba(10,6,16,0), rgba(10,6,16,0.18));
  pointer-events: none;
}
.rc-her {
  font-family: var(--font-fraunces,'Fraunces'),Georgia,serif;
  font-style: italic; font-weight: 440;
  font-size: clamp(2.6rem,8vw,5.25rem); line-height: 1.12;
  max-width: 16ch; text-indent: -0.45em;
  color: #EFE8D8; margin: 0;
  text-shadow: 0 2px 40px rgba(10,6,16,0.5);
}
.rc-her-attr {
  font-family: ui-monospace,'JetBrains Mono','SF Mono',monospace;
  font-size: 0.6875rem; letter-spacing: 0.16em; text-transform: uppercase;
  color: rgba(239,232,216,0.42); margin: 2.2rem 0 0; line-height: 2;
  max-width: 34rem;
}

/* the receipt — tipped-in slip (critic B, defect 11) */
.rc-receipt {
  font-family: ui-monospace,'JetBrains Mono','SF Mono',monospace;
  max-width: 30rem; margin: 1.8rem 0;
  background: var(--slip);
  box-shadow: 0 1px 3px rgba(28,26,23,0.10);
  transform: rotate(-0.3deg);
  padding: 0.4rem 0.9rem;
}
.rc-receipt p {
  display: flex; justify-content: space-between; gap: 1rem;
  line-height: 1.6; margin: 0; padding: 0.55rem 0.15rem;
  border-bottom: 1px solid rgba(28,26,23,0.12);
}
.rc-receipt p:last-child { border-bottom: none; }
.rc-receipt p span:first-child { color: var(--graphite); }

/* ── the maze ── */
.rc-maze {
  min-height: 100svh;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 1.4rem; padding: clamp(3rem,8vw,5rem) 1.5rem;
  transition: transform 320ms cubic-bezier(0.34,1.56,0.64,1);
}
.rc-maze--solved { min-height: 0; padding: clamp(2rem,5vw,3rem) 1.5rem; }
.rc-maze-solved-line {
  font-family: ui-monospace,'JetBrains Mono','SF Mono',monospace;
  font-size: 0.6875rem; letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--graphite); opacity: 0.7; text-align: center;
}
.rc-maze-solved-line em { font-style: italic; text-transform: none; letter-spacing: 0.06em; }
.rc-maze-eyebrow {
  font-family: ui-monospace,'JetBrains Mono','SF Mono',monospace;
  font-size: 0.6875rem; letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--graphite); margin: 0;
}
.rc-maze-hint {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-style: italic; font-size: 1.05rem; color: var(--graphite); margin: 0;
  text-align: center;
}
.rc-maze-grid {
  display: grid; grid-template-columns: repeat(13, 1fr);
  width: min(560px, 92vw); aspect-ratio: 13 / 9;
  border: 1px solid var(--rule);
  touch-action: none; cursor: crosshair;
  transition: filter 250ms ease;
}
.rc-maze-grid--dead { filter: brightness(0.92) sepia(0.25); }
.rc-maze-cell { position: relative; }
.rc-maze-wall { background: rgba(28,26,23,0.82); }
.rc-maze-path { background: var(--paper); }
.rc-maze-here { background: rgba(139,58,46,0.28); }
.rc-maze-start .rc-maze-glyph, .rc-maze-exit .rc-maze-glyph {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  font-family: ui-monospace,monospace; font-size: 0.7rem; color: var(--rust);
}
.rc-maze-exit { background: rgba(11,110,132,0.10); }
.rc-maze-dot {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
  width: 12px; height: 12px; border-radius: 50%;
  background: transparent; border: none; padding: 0; cursor: pointer;
}
.rc-maze-dot::after {
  content: ''; position: absolute; inset: 4px; border-radius: 50%;
  background: var(--rust); opacity: 0.65;
}
.rc-maze-mercy {
  position: relative;
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-style: italic; font-size: 1.15rem; color: var(--graphite);
  background: none; border: none; padding: 0.4rem 0.8rem; cursor: pointer;
  opacity: 0; transform: translateY(6px); pointer-events: none;
  transition: opacity 900ms ease, transform 900ms ease;
}
.rc-maze-mercy--in {
  opacity: 1; transform: none; pointer-events: auto;
  background-image: linear-gradient(100deg,
    #3B7A4A 0%, #7dba6a 18%, #e8d98a 38%, #F2C24B 48%,
    #d97a57 64%, #C2251A 82%, #8B3A2E 100%);
  background-size: 220% 100%;
  -webkit-background-clip: text; background-clip: text;
  color: transparent; -webkit-text-fill-color: transparent;
  animation: rc-mercy-shimmer 2.8s linear infinite;
}
.rc-maze-mercy--in:hover { transform: scale(1.05); }
@keyframes rc-mercy-shimmer {
  0% { background-position: 0% 0; }
  100% { background-position: 220% 0; }
}
/* the ripple — two rings, green then red, fired once on arrival */
.rc-maze-mercy--in::before, .rc-maze-mercy--in::after {
  content: ''; position: absolute; top: 50%; left: 50%;
  width: 16px; height: 16px; border-radius: 50%;
  transform: translate(-50%,-50%);
  pointer-events: none; opacity: 0;
}
.rc-maze-mercy--in::before {
  border: 1.5px solid rgba(59,122,74,0.55);
  animation: rc-mercy-ripple 1.5s cubic-bezier(0.22,1,0.36,1) 0.15s 2;
}
.rc-maze-mercy--in::after {
  border: 1.5px solid rgba(194,37,26,0.45);
  animation: rc-mercy-ripple 1.5s cubic-bezier(0.22,1,0.36,1) 0.55s 2;
}
@keyframes rc-mercy-ripple {
  0% { width: 16px; height: 16px; opacity: 0.9; }
  100% { width: 300px; height: 300px; opacity: 0; }
}
@keyframes rc-maze-shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-5px); } 40% { transform: translateX(5px); }
  60% { transform: translateX(-3px); } 80% { transform: translateX(3px); }
}
.rc-maze--shake .rc-maze-grid { animation: rc-maze-shake 380ms ease; }

/* ── project 1 — dawn (critic B, move C) ── */
.rc-p1 {
  max-width: 44rem; margin: 0 auto; text-align: center;
  padding: clamp(3rem,8vw,5rem) 1.5rem clamp(3rem,7vw,4.5rem);
  background:
    radial-gradient(ellipse 75% 55% at 50% 40%, rgba(242,201,164,0.30), transparent 72%),
    radial-gradient(ellipse 45% 30% at 50% 46%, rgba(232,181,71,0.10), transparent 70%),
    radial-gradient(ellipse 100% 40% at 50% 0%, rgba(46,58,92,0.05), transparent 65%);
}
.rc-frame-empty { max-width: none; margin: 0 auto 2.4rem; }
.rc-frame-empty .rc-mat { max-width: 20rem; margin-inline: auto; }
.rc-mat-empty {
  aspect-ratio: 4 / 3;
  background: radial-gradient(ellipse 70% 60% at 50% 42%, #FBF6EA, #F1EADA 85%);
  border: 1px solid rgba(28,26,23,0.6);
  border-image: none; outline: none;
  box-shadow: inset 0 0 0 1px rgba(28,26,23,0.08), 0 1px 2px rgba(28,26,23,0.12);
  padding: 0;
}
.rc-p1-title {
  font-family: var(--font-fraunces,'Fraunces'),Georgia,serif;
  font-weight: 560; font-size: clamp(2.2rem,6.5vw,3.6rem); line-height: 1.06;
  margin: 0 0 1.2rem; letter-spacing: -0.02em;
}
.rc-p1-name { font-style: italic; color: var(--cyan); }
.rc-p1-line {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-style: italic; font-size: clamp(1.1rem,2.8vw,1.35rem);
  color: var(--graphite); margin: 0.3rem auto; max-width: 36rem;
  text-wrap: balance;
}
.rc-balance { display: flex; flex-direction: column; align-items: center; gap: 0.6rem; margin: 2.6rem 0 0; }
.rc-balance-label { display: block; }
.rc-balance-num {
  font-family: var(--font-fraunces,'Fraunces'),Georgia,serif;
  font-size: clamp(3rem,9vw,4.5rem); font-weight: 560; line-height: 1;
  color: var(--amber);
  font-variant-numeric: lining-nums tabular-nums; font-feature-settings: "lnum","tnum";
  transition: color 600ms ease;
}
.rc-balance-dollar { font-size: 0.42em; vertical-align: 0.5em; margin-right: 0.06em; opacity: 0.6; }
.rc-up { color: #3B7A4A; }
.rc-dn { color: var(--rust); }
.rc-balance-meta {
  color: var(--graphite);
  display: inline-flex; align-items: center; gap: 0.45em; flex-wrap: wrap; justify-content: center;
}
.rc-balance-note { color: var(--graphite); opacity: 0.85; }
.rc-live-unit { display: inline-flex; align-items: center; gap: 0.45em; white-space: nowrap; }
.rc-live-dot {
  display: inline-block; width: 5px; height: 5px; border-radius: 50%;
  background: #3B7A4A; animation: rc-pulse 4s ease-in-out infinite;
}
@keyframes rc-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.25; } }

/* the project-1 letter */
.rc-letter { max-width: 34rem; margin: 3.4rem auto 0; text-align: left; }
.rc-letter-title {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-style: italic; font-weight: 500; font-size: clamp(1.4rem,3.4vw,1.8rem);
  text-align: center; margin: 0 0 1.8rem;
}
.rc-letter p {
  font-size: clamp(1.0625rem, 1rem + 0.3vw, 1.1875rem);
  line-height: 1.62; margin: 0 0 1.25rem; color: var(--ink);
}
.rc-letter-beat {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-style: italic; font-size: 1.25rem !important; text-align: center;
  margin: 1.8rem 0 !important; color: var(--ink);
}
.rc-letter-close {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-style: italic; font-size: 1.35rem !important; text-align: center;
  margin: 2.2rem 0 0.6rem !important;
}
.rc-feed-line {
  font-family: ui-monospace,'JetBrains Mono','SF Mono',monospace;
  font-size: 0.8125rem !important; letter-spacing: 0.03em; color: var(--graphite);
  text-align: center;
}

/* the cast */
.rc-cast-note { color: var(--graphite); font-size: 1rem !important; }
.rc-cast { margin: 1.4rem 0 1.8rem; border-top: 1px solid var(--rule); }
.rc-cast p {
  display: flex; gap: 1em; align-items: baseline; margin: 0;
  padding: 0.7rem 0; border-bottom: 1px solid rgba(28,26,23,0.10);
  font-size: 1rem; line-height: 1.55;
}
.rc-cast-fine { font-size: 0.98rem !important; color: var(--graphite); }

/* ── contents ── */
.rc-toc-direction {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-style: italic; font-size: 1.1rem !important; color: var(--graphite);
}
.rc-toc-tier { display: block; margin: 1.6rem 0 0.4rem; }
.rc-toc-list { list-style: none; margin: 0; padding: 0; counter-reset: rc-toc; }
.rc-toc-list[start="4"] { counter-reset: rc-toc 3; }
.rc-toc-list li {
  counter-increment: rc-toc;
  display: flex; align-items: baseline; gap: 0.8rem;
  padding: 0.8rem 0; border-bottom: 1px solid rgba(28,26,23,0.10);
  font-size: 1.02rem; line-height: 1.5;
}
.rc-toc-list li::before {
  content: counter(rc-toc, lower-roman) ".";
  font-family: ui-monospace,'JetBrains Mono','SF Mono',monospace;
  font-size: 0.6875rem; color: var(--graphite);
  min-width: 3ch; text-align: right; letter-spacing: 0.06em;
}
.rc-toc-list li > a { flex-shrink: 0; }
.rc-toc-dots {
  flex: 1; border-bottom: 1px dotted var(--rule);
  transform: translateY(-0.3em); min-width: 1.5rem;
}
.rc-toc-note { color: var(--graphite); text-align: right; text-wrap: balance; }
.rc-nowrap { white-space: nowrap; }
.rc-toc-note a { color: var(--graphite); border-bottom-color: rgba(28,26,23,0.25); }

/* ── colophon — the ember (critic B, defect 12) ── */
.rc-colophon {
  text-align: center;
  padding: clamp(3rem,8vw,5rem) 1.5rem clamp(4.5rem,10vw,6.5rem);
  background: radial-gradient(ellipse 60% 45% at 50% 100%, rgba(217,122,87,0.07), transparent 70%);
}
.rc-marx {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-style: italic; font-size: 1.05rem; color: var(--graphite);
  margin: 0 0 2.4rem;
}
.rc-marx-attr { font-size: 0.85rem; opacity: 0.7; }
.rc-colophon-motto {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-style: italic; font-size: 1.2rem; color: var(--ink); margin: 0 0 1.3rem;
}
.rc-colophon-rail { color: var(--graphite); margin: 0 0 3rem; }
.rc-colophon-rail a { color: var(--graphite); border-bottom-color: var(--rule); }
.rc-colophon-rail a:hover { color: var(--cyan); }
.rc-cmiygl {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-style: italic; font-size: clamp(1.5rem,4vw,2.1rem); margin: 0 0 1.2rem;
  color: var(--ink); opacity: 0.85;
}
.rc-sig {
  font-family: var(--font-signature,'Ms Madi'),cursive;
  font-size: 1.7rem; color: var(--graphite); margin: 0;
  transform: rotate(-2deg);
}

/* ── reveal ── */
.rc-reveal { opacity: 0; transform: translateY(14px); transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.22,1,0.36,1); }
.rc-reveal.rc-in { opacity: 1; transform: none; }

/* ── desktop: hanging folios ── */
@media (min-width: 1100px) {
  .rc-folio {
    position: absolute; left: -1.5rem; transform: translateX(-100%);
    flex-direction: column; align-items: flex-end; gap: 0.15em; text-align: right;
  }
  .rc-folio-num { font-size: 2.25rem; }
  .rc-entry-head { gap: 0; }
}

/* ── mobile ── */
@media (max-width: 640px) {
  .rc-mast { padding-top: 1.25rem; }
  .rc-mast .rc-label { display: none; }
  .rc-title { padding-top: 3rem; }
  .rc-imprint { line-height: 1.9; padding: 0.9rem 0; }
  .rc-imprint-row { flex-direction: column; gap: 0.1em; }
  .rc-imprint p { margin-bottom: 0.7rem; }
  .rc-imprint p:last-child { margin-bottom: 0; }
  .rc-arc p { flex-direction: column; gap: 0.2em; padding: 0.7rem 0; }
  .rc-voices p, .rc-cast p { flex-direction: column; gap: 0.25em; }
  .rc-voice-name { min-width: 0; }
  .rc-toc-list li { flex-wrap: wrap; }
  .rc-toc-dots { display: none; }
  .rc-toc-note { margin-left: 3.8ch; width: 100%; text-align: left; }
  .rc-dark { min-height: 88svh; }
  .rc-receipt { transform: none; }
  .rc-maze-grid { width: 94vw; }
}

/* ── reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .rc-reveal { opacity: 1; transform: none; transition: none; }
  .rc-strike::after { transition: none; width: 104%; }
  .rc-live-dot { animation: none; }
  .rc-maze { transition: none; }
  .rc-maze--shake .rc-maze-grid { animation: none; }
  .rc-maze-mercy--in { animation: none; }
  .rc-maze-mercy--in::before, .rc-maze-mercy--in::after { animation: none; }
}
`;
