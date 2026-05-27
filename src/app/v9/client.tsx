"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const InteractiveTicket = dynamic(() => import("./InteractiveTicket"), { ssr: false });

/* ═══════════════════════════════════════════════════════
   v9 — THE ROCKS (iteration 2)

   3 worlds: Dark Earth → Warm Paper → Deep Night
   Real letter.txt as body content
   Cityscape painting only, no art grid
   Ghost color bleeding from painting into paper
   ═══════════════════════════════════════════════════════ */

type Props = {
  totalNow: number;
  daysToBirthday: number;
  holdings: Array<{ ticker: string; shares: number; entry_value: number }>;
  pendingCash: number;
  entryValue: number;
  nonStockValue: number;
};

type StockGain = { ticker: string; current: number; entry: number; pct: number };

function useLiveTotal(
  holdings: Props["holdings"],
  pendingCash: number,
  nonStockValue: number,
  fallback: number
) {
  const [total, setTotal] = useState<number>(fallback);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  const [stocks, setStocks] = useState<StockGain[]>([]);
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
        const gains: StockGain[] = [];
        for (const h of holdings) {
          const s = j.data[h.ticker];
          const cur = s?.closes?.length > 0 ? h.shares * s.closes[s.closes.length - 1] : h.entry_value;
          sum += cur;
          gains.push({
            ticker: h.ticker,
            current: cur,
            entry: h.entry_value,
            pct: h.entry_value > 0 ? ((cur - h.entry_value) / h.entry_value) * 100 : 0,
          });
        }
        if (sum !== prevRef.current) {
          setFlash(sum >= prevRef.current ? "up" : "down");
          setTimeout(() => setFlash(null), 800);
        }
        prevRef.current = sum;
        if (alive) { setTotal(sum); setStocks(gains); }
      } catch { /* noop */ }
    };
    pull();
    const id = setInterval(pull, 30_000);
    return () => { alive = false; clearInterval(id); };
  }, [holdings, pendingCash, nonStockValue]);

  return { total, flash, stocks };
}

function fmt(n: number) {
  return Math.round(n).toLocaleString("en-US");
}

export default function V9Client({
  totalNow, daysToBirthday, holdings, pendingCash, entryValue, nonStockValue,
}: Props) {
  const { total, flash, stocks } = useLiveTotal(holdings, pendingCash, nonStockValue, totalNow);
  const rootRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"void" | "develop" | "revealed" | "full">("void");

  const gain = total - entryValue;
  const gainPct = ((gain / entryValue) * 100).toFixed(1);
  const progressPct = Math.min(100, Math.max(0, ((total - 3453) / (100000 - 3453)) * 100));

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

  /* scroll-reveal */
  useEffect(() => {
    const els = rootRef.current?.querySelectorAll(".v9-reveal");
    if (!els) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("v9-in");
      }),
      { threshold: 0.06, rootMargin: "0px 0px -40px 0px" },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  /* mouse parallax on hero — rocks drift opposite, number drifts with */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const rocks = rootRef.current?.querySelector(".v9-rocks") as HTMLElement | null;
    const num = rootRef.current?.querySelector(".v9-hero-num") as HTMLElement | null;
    if (!rocks || !num) return;
    const onMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5);
      const ny = (e.clientY / window.innerHeight - 0.5);
      rocks.style.transform = `scale(1.04) translate(${nx * -14}px, ${ny * -10}px)`;
      num.style.transform = `translate(${nx * 5}px, ${ny * 3}px)`;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [phase]);

  /* 3D tilt on revolution cards */
  useEffect(() => {
    const cards = rootRef.current?.querySelectorAll(".v9-rev") as NodeListOf<HTMLElement> | undefined;
    if (!cards) return;
    const handlers: Array<() => void> = [];
    cards.forEach((card) => {
      const onMove = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(800px) rotateX(${y * -10}deg) rotateY(${x * 10}deg) translateZ(4px)`;
      };
      const onLeave = () => { card.style.transform = ""; };
      card.addEventListener("mousemove", onMove, { passive: true });
      card.addEventListener("mouseleave", onLeave);
      handlers.push(() => {
        card.removeEventListener("mousemove", onMove);
        card.removeEventListener("mouseleave", onLeave);
      });
    });
    return () => handlers.forEach((h) => h());
  }, []);

  const showNumber = phase === "revealed" || phase === "full";
  const showFull = phase === "full";

  return (
    <div className="v9" data-phase={phase} ref={rootRef}>
      <style>{CSS}</style>

      {/* ═══════ WORLD 1: DARK EARTH ═══════ */}
      <section className="v9-hero">
        <div className={`v9-rocks ${phase !== "void" ? "v9-rocks--on" : ""}`} />
        <div className="v9-vignette" />
        <div className="v9-lens" />

        <div className={`v9-hero-eye ${showFull ? "v9-vis" : ""}`}>
          <span className="v9-eye">a public wager · {daysToBirthday} days left</span>
        </div>

        <div className={`v9-hero-num ${showNumber ? "v9-vis" : ""}`}>
          <span className={`v9-num ${flash === "up" ? "v9-up" : flash === "down" ? "v9-dn" : ""}`}>
            <span className="v9-dollar">$</span>{fmt(total)}
          </span>
          {showFull && (
            <div className="v9-meta">
              <span className="v9-delta">{gain >= 0 ? "+" : ""}{gainPct}%</span>
              <span className="v9-sep">·</span>
              <span className="v9-tgt">→ $100,000</span>
              <span className="v9-sep">·</span>
              <span className="v9-dot" />
              <span className="v9-live">live</span>
            </div>
          )}
        </div>

        {showFull && (
          <div className="v9-hero-foot">
            <p className="v9-tagline">probably impossible. definitely public.</p>
            <div className="v9-trace">
              <span>$3,453</span>
              <div className="v9-trace-bar"><div className="v9-trace-fill" style={{ width: `${progressPct}%` }} /></div>
              <span>$100K</span>
            </div>
            <div className="v9-cue"><span /></div>
          </div>
        )}
      </section>

      {/* ═══════ BRIDGE: dark → warm ═══════ */}
      <div className="v9-bridge-1" />

      {/* ═══════ WORLD 2: WARM PAPER — THE LETTER ═══════ */}
      <section className="v9-paper">
        <div className="v9-grain" />

        {/* The letter — real content from letter.txt */}
        <article className="v9-letter">

          <p className="v9-lede v9-reveal">
            <span className="v9-drop">D</span>elusion makes the statistically
            impossible possible. That&rsquo;s my hypothesis.
          </p>

          <p className="v9-reveal">
            If someone would pay you 100 million dollars to run a 3:20 marathon
            by the end of the year could you do it? The pace seems a bit less
            absurd when you realize you&rsquo;d be setting yourself up for
            generations. What about 1 million? Probably similar decision calculus.
            100k? 10k? Hmmm now it kinda gets interesting, because that&rsquo;s
            not financial freedom, so the idea of dropping everything to just
            train is far less feasible.
          </p>

          <p className="v9-reveal">
            But there&rsquo;s a point at which the stakes become just enough for
            you to bend reality to make it work. For 10k maybe you run once or
            twice a week just to see what sticks. For 100 mil you probably think
            about running all the time, watch videos on techniques, get training,
            maybe even drop everything else you&rsquo;re doing except just run.
          </p>

          <p className="v9-reveal">This project started with the same thesis.</p>

          {/* The numbers — marginalia box */}
          <div className="v9-proof v9-reveal">
            <div className="v9-proof-row">
              <span className="v9-proof-l">opened</span>
              <span className="v9-proof-v">$3,453</span>
            </div>
            <div className="v9-proof-row">
              <span className="v9-proof-l">now</span>
              <span className="v9-proof-v v9-proof-live">${fmt(total)}</span>
            </div>
            <div className="v9-proof-row">
              <span className="v9-proof-l">needed</span>
              <span className="v9-proof-v">29&times;</span>
            </div>
            <div className="v9-proof-row">
              <span className="v9-proof-l">needs</span>
              <span className="v9-proof-v">{Math.ceil(100000 / total)}&times;</span>
            </div>
            <div className="v9-proof-row">
              <span className="v9-proof-l">monte carlo</span>
              <span className="v9-proof-v v9-proof-zero">0.000000%</span>
            </div>
            <div className="v9-proof-row">
              <span className="v9-proof-l">published</span>
              <span className="v9-proof-v">before the first trade</span>
            </div>
          </div>

          {/* Stock gains grid */}
          {stocks.length > 0 && (
            <div className="v9-stocks v9-reveal">
              {stocks.sort((a, b) => b.pct - a.pct).map((s) => (
                <div key={s.ticker} className="v9-stock">
                  <span className="v9-stock-ticker">{s.ticker}</span>
                  <span className={`v9-stock-pct ${s.pct >= 0 ? "v9-stock-up" : "v9-stock-dn"}`}>
                    {s.pct >= 0 ? "+" : ""}{s.pct.toFixed(1)}%
                  </span>
                  <span className="v9-stock-val">${fmt(s.current)}</span>
                </div>
              ))}
            </div>
          )}

          <p className="v9-reveal">
            A month and a half ago, I made a public bet that I could turn 3.5k
            into 100k. I would need to 20x in less than a month to hit my goal.
            But at the start of the project I needed a 29x. All the models
            estimated my probability to be 0.000000000%.
          </p>

          <p className="v9-reveal">
            I figured the best way to force myself to commit to a project was
            to make it unaffordable to quit. I didn&rsquo;t really want to put
            myself in debt or physical harm, so instead public embarrassment was
            my choice of poison. It would be way cooler to have 100k on my
            birthday than not, so just that factor alone means my odds of 100k
            are higher.
          </p>

          {/* Agent bracket — proof of real disagreement */}
          <div className="v9-bracket v9-reveal">
            <div className="v9-bracket-line">
              <span className="v9-bracket-tag v9-tag-bear">bear</span>
              <span>That is not a strategy. That is Thanksgiving.</span>
            </div>
            <div className="v9-bracket-line">
              <span className="v9-bracket-tag v9-tag-hist">historian</span>
              <span>The 0.000000% is the probability before the letter. The probability after is unknowable.</span>
            </div>
          </div>

          <p className="v9-reveal">
            Through the last few weeks, I realized that my methods were not
            nearly enough, and my mind started to always drift to insane stories,
            like Gamestop, Bitcoin, NFTs, and art in general. The crazy money
            movements were tied either to a narrative people believed in or
            death. I wanted to avoid the second.
          </p>

          <p className="v9-reveal">
            My mind started to also drift to adjacent questions. What if you
            could make NFTs that are actually sustainable? What if art could be
            accessible to everyone? What if art wasn&rsquo;t some vague status
            symbol?
          </p>

          <p className="v9-pull v9-reveal">
            I think if any of these things were possible you get something a lot
            cooler than 100k: democratized art, but I think it&rsquo;s also very
            easy to make 100k as a result.
          </p>

          <p className="v9-reveal">
            One thing I think NFTs proved is that art has 2 dimensions.
            A consensus on the value of the art. And a limitation that creates
            scarcity. The second component is the reason that a lot of art or
            sports memorabilia skyrocket in value after someone&rsquo;s death.
          </p>

          <p className="v9-reveal">
            So I&rsquo;m doubling down on the project, with a two-fold purpose.
            Figure out how to make art with taste. And figure out how to make
            the valuation of art favorable for all parties involved.
          </p>

          {/* The mechanism */}
          <div className="v9-mechanism v9-reveal">
            <p className="v9-mech-head">On June 21, I will guarantee cashout of the art for 10% of the portfolio.</p>
            <ul className="v9-wins">
              <li>The portfolio grows so much that losing 10% to the art doesn&rsquo;t matter.</li>
              <li>I make money with the bids to make up for any loss in the art cashout.</li>
              <li>The most interesting: people overbid for the art because they believe in the art or the portfolio, or they just want the art that bad. And they keep most of it.</li>
            </ul>
          </div>

          <p className="v9-closing-line v9-reveal">
            This is my promise to make my art worth 10k by June 21.<br />
            This is my 3:20 marathon.
          </p>

          {/* Sealed hash */}
          <div className="v9-seal v9-reveal">
            <span className="v9-seal-tag">sealed</span>
            <span className="v9-seal-hash">commitment · a8f7c2············</span>
            <span className="v9-seal-when">reveal 19 jun 2026 · 18:00 PT</span>
          </div>

          {/* Ways in */}
          <div className="v9-ways v9-reveal">
            <Link href="/invest" className="v9-way">
              <span className="v9-way-name">The wager →</span>
              <span className="v9-way-sub">bet on the bet</span>
            </Link>
            <Link href="/argument" className="v9-way">
              <span className="v9-way-name">The argument →</span>
              <span className="v9-way-sub">5 agents disagree daily</span>
            </Link>
            <a href="https://saathvikpai.com" className="v9-way">
              <span className="v9-way-name">The paper →</span>
              <span className="v9-way-sub">37 pages on agent memory</span>
            </a>
            <Link href="/art" className="v9-way">
              <span className="v9-way-name">The art →</span>
              <span className="v9-way-sub">12 originals, starting at $1</span>
            </Link>
          </div>

          {/* ═══════ ADDENDUM ═══════ */}
          <div className="v9-addendum-rule" />
          <div className="v9-addendum-tag v9-reveal">addendum — {daysToBirthday} days out</div>

          <p className="v9-reveal">
            When I wrote the marathon line I had no idea what was actually going
            to get built. The pre-mortem filed on April 26 lists four failure
            modes, a birthday party, and a vague belief that the art would
            &ldquo;eventually clear.&rdquo; What it does not list: a 37-page
            research paper that six AI agents stress-tested across 100-year
            datasets. A local multi-model debate system running for free on my
            laptop. Twelve pieces of art that actually repriced when the
            portfolio started doing things. A party with real backers &mdash;
            Franco, Elijah, Yashas &mdash; and an anonymous fourth who I still
            do not know how to thank without sounding like a Kickstarter
            update. None of that was planned. All of it was downstream of one
            thing I did that should not have been upstream: I told people about
            a birthday party and filed the reasoning before the result.
          </p>

          <p className="v9-reveal">
            Let me be honest about what the numbers actually say. I&rsquo;m at
            ${fmt(total)}. I need $100,000. The models still say 0.000000% &mdash;
            same as before. I&rsquo;ve built a trading system, a multi-agent
            debate framework, a paper on memory architectures, and a party. The
            gap between here and there is not a chapter in a comeback story.
            It&rsquo;s a mathematical fact. {daysToBirthday} days left.
          </p>

          <p className="v9-reveal">
            So I&rsquo;m hiding 5% of the portfolio as easter eggs across this
            site. Not links to art. Not discount codes. Actual value, hidden in
            the scroll behavior, in the source code, in routes that aren&rsquo;t
            in the nav. The first person to find each egg gets the most. The
            more eggs get found, the less each subsequent one is worth. I know
            exactly what this is: I&rsquo;m paying you to pay attention to me.
            Phil Ivey didn&rsquo;t count cards. He found a game where the house
            had structured the payout wrong and he sat there and bled them.
            I&rsquo;m doing the same thing with attention. Except I&rsquo;m the
            house. And I might be the one getting bled.
          </p>

          <p className="v9-reveal">
            The letter argued that art needs two things: consensus on value and
            a limitation that creates scarcity. NFTs failed the second &mdash;
            the limitation was arbitrary, everyone knew it, so the consensus
            collapsed. But an easter egg that degrades in value each time
            someone finds one has a real limitation. It is not
            &ldquo;only 10,000 exist.&rdquo; It is: the faster you find it, the
            more it is worth. Every platform does a version of this dishonestly.
            Twitter gives early posters more reach and calls it an algorithm.
            Substack gives early subscribers a price lock and calls it loyalty.
            I&rsquo;m just making the mechanic explicit.
          </p>

          <p className="v9-reveal">
            I said this is my 3:20 marathon. I still mean it. What I did not
            know when I wrote it is that a marathon has aid stations, and the
            aid stations are the agents, and the paper, and the backers, and
            the twelve pieces of art that somebody has touched with their hands,
            and the easter eggs that are already placed and waiting. The promise
            is the same &mdash; June 21, no quiet revisions to what
            &ldquo;basically counts.&rdquo; The outcome box at the bottom of
            this page is still blank. I put it there to fill in. I still
            don&rsquo;t know what I&rsquo;m going to write.
          </p>

        </article>
      </section>

      {/* ═══════ THE PARTY — amber gradient descent ═══════ */}
      <section className="v9-party">
        <div className="v9-party-inner v9-reveal">
          <span className="v9-party-presents">aureliex presents</span>
          <h2 className="v9-party-title">the party.</h2>
          <span className="v9-party-sub">the liquidity event · june 20 · 2026</span>
          <div className="v9-party-rule" />
          <p className="v9-party-tagline">june 20 · salt lake city</p>
          <span className="v9-party-detail">10% of portfolio → flights &amp; reimbursements</span>
        </div>

        {/* Interactive Ticket */}
        <div className="v9-reveal">
          <InteractiveTicket />
        </div>

        {/* Backed by */}
        <div className="v9-backed v9-reveal">
          <span className="v9-backed-label">backed by</span>
          <div className="v9-backed-names">
            <span>Franco Cachay</span><span>Elijah Bautista</span><span>Yashas Shashidara</span><span>an anonymous donor</span>
          </div>
        </div>
      </section>

      {/* ═══════ THE PAINTING — the only piece ═══════ */}
      <section className="v9-painting v9-reveal">
        <div className="v9-painting-glow" />
        <div className="v9-painting-inner">
          <div className="v9-painting-frame">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/art/auction-piece.jpg" alt="Cityscape with splatter — oil on canvas" className="v9-painting-img" />
          </div>
          <div className="v9-painting-caption">
            <span className="v9-painting-title">cityscape with splatter</span>
            <div className="v9-painting-terms">
              <div className="v9-painting-term">
                <span className="v9-painting-label">current bid</span>
                <span className="v9-painting-value">$20</span>
              </div>
              <div className="v9-painting-term">
                <span className="v9-painting-label">cashout value · june 20</span>
                <span className="v9-painting-value v9-painting-live">${fmt(total * 0.1)}</span>
              </div>
            </div>
            <div className="v9-first-bid">
              <span className="v9-first-bid-name">Aryan Dutta Baruah</span>
              <span className="v9-first-bid-msg">&ldquo;agi needs to be built&rdquo;</span>
            </div>
            <p className="v9-painting-meta">the winning bidder can cash out 10% of the portfolio on june 20, or keep the painting.</p>
            <Link href="/art" className="v9-painting-bid">bid →</Link>
          </div>
        </div>
      </section>

      {/* ═══════ WORLD 3: DEEP NIGHT ═══════ */}

      {/* Four revolutions */}
      <nav className="v9-revs v9-reveal">
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

      {/* Door — rocks return, dark */}
      <section className="v9-door">
        <div className="v9-door-rocks" />
        <div className="v9-door-fade" />
        <div className="v9-door-content v9-reveal">
          <p className="v9-door-line">The door is open.</p>
          <div className="v9-door-acts">
            <Link href="/invest" className="v9-btn">The wager →</Link>
            <Link href="/argument" className="v9-link-dim">Five agents disagree about this →</Link>
          </div>
          <p className="v9-door-rail">
            <a href="https://venmo.com/saathvikpai">venmo @saathvikpai</a>
            {" · "}
            <a href="tel:3853687238">385-368-7238</a>
            {" · "}
            <span>personally guaranteed</span>
          </p>
          <div className="v9-outcome">
            <span>Outcome:</span>
            <span className="v9-outcome-blank" />
            <span>June 21, 2026</span>
          </div>
        </div>

        {/* CMIYGL closer */}
        <footer className="v9-closer v9-reveal">
          <p className="v9-cmiygl">
            {"call me if you get lost.".split("").map((ch, i) => (
              <span key={i} className="v9-rc" style={{ "--i": i } as React.CSSProperties}>
                {ch === " " ? "\u00A0" : ch}
              </span>
            ))}
          </p>
          <p className="v9-sig">
            {"aureliex.".split("").map((ch, i) => (
              <span key={i} className="v9-rw" style={{ "--i": i } as React.CSSProperties}>
                {ch}
              </span>
            ))}
          </p>
          <span className="v9-phone">+1 (385) 368-7238</span>
        </footer>

        <nav className="v9-rooms v9-reveal">
          <Link href="/letters/round-0">the pre-mortem</Link>
          <Link href="/letters/round-1">round 1</Link>
          <Link href="/positions">positions</Link>
          <Link href="/argument">the argument</Link>
          <Link href="/art">art</Link>
          <Link href="/archive">archives</Link>
        </nav>
      </section>

      {/* Mobile nav */}
      <nav className="v9-mob">
        <Link href="/positions">stocks</Link>
        <Link href="/letters/round-0">letters</Link>
        <Link href="/art">art</Link>
        <Link href="/invest">invest</Link>
      </nav>
    </div>
  );
}

const CSS = `
/* ── TOKENS ── */
.v9 {
  --paper: #F5EAD6;
  --ink: #3D2B0F;
  --rust: #8B3A2E;
  --amber: #C8A96E;
  --deep-amber: #8B6914;
  --gold-num: #D4A94C;
  --dark: #0a0908;
  --navy-ghost: rgba(45,85,140,0.06);
  --gold-ghost: rgba(180,140,40,0.08);
  --purple-ghost: rgba(107,77,138,0.05);

  min-height: 100vh;
  background: #000;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  overflow-x: hidden;
}

/* ═══════ WORLD 1: DARK EARTH ═══════ */
.v9-hero {
  position: sticky;
  top: 0;
  height: 100svh;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  z-index: 0;
}
.v9-rocks {
  position: absolute;
  inset: -4%;
  background: url('/hero/rocks.webp') center 38% / cover no-repeat;
  filter: brightness(0) saturate(0);
  transition: filter 3s cubic-bezier(0.16,1,0.3,1);
  will-change: filter, transform;
  animation: v9-drift 50s linear infinite alternate;
}
.v9-rocks--on {
  filter: brightness(0.62) saturate(0.88) contrast(1.06) sepia(0.10);
}
@keyframes v9-drift {
  from { transform: scale(1.04) translateX(0); }
  to   { transform: scale(1.04) translateX(-1.2%); }
}

.v9-vignette {
  position: absolute; inset: 0; pointer-events: none; z-index: 1;
  background:
    linear-gradient(to bottom, rgba(4,3,2,0.6) 0%, rgba(4,3,2,0.15) 20%, transparent 40%),
    linear-gradient(to top, rgba(4,3,2,0.85) 0%, rgba(4,3,2,0.4) 22%, transparent 48%),
    linear-gradient(to right, rgba(4,3,2,0.2) 0%, transparent 18%, transparent 82%, rgba(4,3,2,0.2) 100%);
}
.v9-lens {
  position: absolute; inset: 0; pointer-events: none; z-index: 2;
  background: radial-gradient(ellipse 50% 40% at 55% 40%, rgba(210,170,70,0.10) 0%, transparent 70%);
  mix-blend-mode: soft-light;
}

.v9-hero-eye {
  position: relative; z-index: 3; text-align: center;
  opacity: 0; transform: translateY(8px);
  transition: opacity 1.2s ease 0.2s, transform 1.2s cubic-bezier(0.22,1,0.36,1) 0.2s;
}
.v9-hero-eye.v9-vis { opacity: 1; transform: translateY(0); }
.v9-eye {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.6rem; letter-spacing: 0.28em; text-transform: uppercase;
  color: rgba(240,235,226,0.4);
}

.v9-hero-num {
  position: relative; z-index: 3; text-align: center; margin-top: 0.8rem;
  opacity: 0; transform: translateY(12px);
  transition: opacity 1.5s cubic-bezier(0.22,1,0.36,1), transform 1.5s cubic-bezier(0.22,1,0.36,1);
}
.v9-hero-num.v9-vis { opacity: 1; transform: translateY(0); }
.v9-num {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-size: clamp(4rem,14vw,7.5rem); font-weight: 300; letter-spacing: -0.015em;
  line-height: 1; color: var(--gold-num); display: block;
  transition: color 0.6s ease, text-shadow 0.8s ease;
  animation: v9-float 8s ease-in-out infinite;
  will-change: transform;
}
@keyframes v9-float {
  0%, 100% { transform: translateY(0); text-shadow: 0 0 60px rgba(212,169,76,0.20), 0 2px 20px rgba(6,4,2,0.5); }
  50% { transform: translateY(-4px); text-shadow: 0 0 80px rgba(212,169,76,0.30), 0 4px 28px rgba(6,4,2,0.4); }
}
.v9-up, .v9-dn { animation-play-state: paused; }
.v9-dollar { font-size: 0.36em; vertical-align: 0.38em; margin-right: 0.05em; opacity: 0.55; }
.v9-up { color: #7dba6a !important; text-shadow: 0 0 60px rgba(125,186,106,0.25); }
.v9-dn { color: #c45a5a !important; text-shadow: 0 0 60px rgba(196,90,90,0.25); }

.v9-meta {
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  margin-top: 0.8rem; font-family: 'JetBrains Mono',monospace; font-size: 0.56rem;
  letter-spacing: 0.08em; color: rgba(240,235,226,0.3);
}
.v9-delta { color: #7dba6a; opacity: 0.8; }
.v9-tgt { opacity: 0.5; }
.v9-sep { opacity: 0.2; }
.v9-dot {
  width: 5px; height: 5px; border-radius: 50%; background: #7dba6a;
  animation: v9-pulse 4s ease-in-out infinite;
}
.v9-live { font-size: 0.5rem; letter-spacing: 0.18em; text-transform: uppercase; color: #7dba6a; opacity: 0.6; }
@keyframes v9-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.25; } }

.v9-hero-foot {
  position: absolute; bottom: clamp(2.5rem,6vh,4rem); left: 50%;
  transform: translateX(-50%); z-index: 3; text-align: center;
  width: min(90%,36rem); opacity: 0; animation: v9-up 1.5s ease 0.5s forwards;
}
.v9-tagline {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-style: italic; font-size: clamp(1rem,2.5vw,1.3rem);
  color: rgba(240,235,226,0.45); margin: 0 0 1.2rem;
}
.v9-trace {
  display: flex; align-items: center; gap: 0.75rem;
  font-family: 'JetBrains Mono',monospace; font-size: 0.55rem;
  color: rgba(240,235,226,0.2);
}
.v9-trace-bar { flex: 1; height: 3px; border-radius: 1.5px; background: rgba(240,235,226,0.06); overflow: hidden; }
.v9-trace-fill { height: 100%; border-radius: 1.5px; background: var(--amber); transition: width 1.5s ease; min-width: 4px; }
.v9-cue { margin-top: 2rem; display: flex; justify-content: center; }
.v9-cue span {
  display: block; width: 1px; height: 24px; background: rgba(240,235,226,0.3);
  animation: v9-cue-p 2s ease-in-out 1s 1 forwards;
}
@keyframes v9-cue-p {
  0% { opacity: 0.3; transform: scaleY(1); }
  50% { opacity: 0.7; transform: scaleY(1.4); }
  100% { opacity: 0.3; transform: scaleY(1); }
}
@keyframes v9-up {
  from { opacity: 0; transform: translateX(-50%) translateY(12px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}

/* ═══════ BRIDGE: rocks → paper ═══════ */
.v9-bridge-1 {
  height: clamp(80px,15vh,160px);
  background: linear-gradient(to bottom, rgba(4,3,2,0.9) 0%, var(--paper) 100%);
  position: relative; z-index: 2;
  box-shadow: 0 -40px 80px rgba(10,9,8,0.5);
}

/* ═══════ WORLD 2: WARM PAPER ═══════ */
.v9-paper {
  position: relative; z-index: 2;
  background:
    radial-gradient(ellipse 120% 60% at 85% 20%, var(--navy-ghost) 0%, transparent 70%),
    radial-gradient(ellipse 80% 40% at 15% 70%, var(--gold-ghost) 0%, transparent 60%),
    radial-gradient(ellipse 90% 50% at 50% 50%, var(--purple-ghost) 0%, transparent 80%),
    var(--paper);
  padding: clamp(3rem,6vw,5rem) clamp(1.25rem,4vw,2rem) clamp(2rem,4vw,3rem);
}
.v9-grain {
  position: absolute; inset: 0; pointer-events: none; z-index: 0;
  opacity: 0.04; mix-blend-mode: multiply;
  background-image:
    radial-gradient(rgba(28,26,23,0.6) 1px, transparent 1px),
    radial-gradient(rgba(28,26,23,0.4) 1px, transparent 1px);
  background-size: 3px 3px, 5px 5px; background-position: 0 0, 2px 2px;
}

.v9-letter {
  position: relative; z-index: 1;
  max-width: 42rem; margin: 0 auto;
}
.v9-letter p {
  font-family: var(--font-body,'EB Garamond'),Georgia,serif;
  font-size: clamp(1.05rem,0.95rem+0.4vw,1.18rem);
  line-height: 1.85; margin-top: 1.5rem; color: var(--ink);
  text-indent: 1.5em;
}
.v9-letter p:first-of-type, .v9-lede, .v9-lede + p,
.v9-pull, .v9-closing-line { text-indent: 0; }

.v9-lede {
  font-size: clamp(1.08rem,1rem+0.4vw,1.22rem) !important;
  line-height: 1.8 !important; margin-top: 0 !important;
}
.v9-drop {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-style: italic; font-weight: 300; float: left;
  font-size: 4.5rem; line-height: 0.78; padding: 0.22rem 0.55rem 0 0;
  color: var(--rust);
}

/* Proof box */
.v9-proof {
  margin: 2rem 0; padding: 1.2rem 1.5rem;
  border-left: 4px solid var(--rust);
  background: linear-gradient(135deg, rgba(139,58,46,0.06) 0%, rgba(200,169,110,0.06) 100%);
  font-family: 'JetBrains Mono',monospace; font-size: 0.65rem; letter-spacing: 0.04em;
}
.v9-proof-row {
  display: flex; justify-content: space-between; padding: 0.4rem 0;
  border-bottom: 1px solid rgba(61,43,15,0.08);
}
.v9-proof-row:last-child { border-bottom: none; }
.v9-proof-l { text-transform: uppercase; letter-spacing: 0.1em; color: rgba(61,43,15,0.5); }
.v9-proof-v { color: var(--ink); font-weight: 500; }
.v9-proof-live { color: var(--deep-amber); }
.v9-proof-zero { color: var(--rust); font-weight: 700; font-size: 0.75rem; }

/* Stock gains grid */
.v9-stocks {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px;
  margin: 1.5rem 0; border-radius: 3px; overflow: hidden;
}
.v9-stock {
  display: flex; flex-direction: column; gap: 2px;
  padding: 0.7rem 0.6rem;
  background: rgba(61,43,15,0.04);
  opacity: 0;
  transform: perspective(600px) rotateX(-45deg) translateY(12px);
  transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.34,1.56,0.64,1);
}
.v9-stocks.v9-in .v9-stock { opacity: 1; transform: perspective(600px) rotateX(0deg) translateY(0); }
.v9-stocks.v9-in .v9-stock:nth-child(2) { transition-delay: 60ms; }
.v9-stocks.v9-in .v9-stock:nth-child(3) { transition-delay: 120ms; }
.v9-stocks.v9-in .v9-stock:nth-child(4) { transition-delay: 180ms; }
.v9-stocks.v9-in .v9-stock:nth-child(5) { transition-delay: 240ms; }
.v9-stocks.v9-in .v9-stock:nth-child(6) { transition-delay: 300ms; }
.v9-stocks.v9-in .v9-stock:nth-child(7) { transition-delay: 360ms; }
.v9-stocks.v9-in .v9-stock:nth-child(8) { transition-delay: 420ms; }
.v9-stock-ticker {
  font-family: 'JetBrains Mono',monospace; font-size: 0.55rem;
  font-weight: 600; letter-spacing: 0.08em; color: var(--ink); opacity: 0.5;
}
.v9-stock-pct {
  font-family: 'JetBrains Mono',monospace; font-size: 0.72rem;
  font-weight: 700; letter-spacing: 0.02em;
}
.v9-stock-up { color: #5a7a48; }
.v9-stock-dn { color: var(--rust); }
.v9-stock-val {
  font-family: 'JetBrains Mono',monospace; font-size: 0.5rem;
  color: var(--ink); opacity: 0.3;
}

/* Agent bracket */
.v9-bracket {
  margin: 1.5rem 0; border-left: 2px solid rgba(61,43,15,0.1); padding-left: 1rem;
}
.v9-bracket-line {
  padding: 0.5rem 0;
  font-family: var(--font-body,'EB Garamond'),Georgia,serif;
  font-size: 0.95rem; font-style: italic; line-height: 1.65;
  color: rgba(61,43,15,0.7);
}
.v9-bracket-tag {
  font-family: 'JetBrains Mono',monospace; font-size: 0.52rem; font-style: normal;
  font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase;
  display: inline-block; margin-right: 0.5rem; padding: 2px 6px; border-radius: 2px;
}
.v9-tag-bear { color: #b54040; background: rgba(181,64,64,0.08); }
.v9-tag-hist { color: #6B6560; background: rgba(107,101,96,0.08); }

/* Pull quote */
.v9-pull {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif !important;
  font-style: italic;
  font-size: clamp(1.2rem,1rem+0.8vw,1.45rem) !important;
  line-height: 1.45 !important; text-align: center;
  color: var(--ink); max-width: 34ch; margin: 2.5rem auto !important;
  padding: 2rem 1rem;
  border-top: 2px solid rgba(200,169,110,0.4);
  border-bottom: 2px solid rgba(200,169,110,0.4);
}

/* Art mechanism box */
.v9-mechanism {
  margin: 2rem 0; padding: 1.5rem;
  background: rgba(200,169,110,0.08); border-radius: 3px;
}
.v9-mech-head {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-style: italic; font-size: 1.1rem; font-weight: 500;
  color: var(--deep-amber); margin: 0 0 1rem; text-indent: 0 !important;
}
.v9-wins {
  list-style: none; padding: 0; margin: 0;
}
.v9-wins li {
  font-family: var(--font-body,'EB Garamond'),Georgia,serif;
  font-size: 0.98rem; line-height: 1.7; color: var(--ink);
  padding: 0.5rem 0 0.5rem 1.2rem; position: relative;
}
.v9-wins li::before {
  content: '·'; position: absolute; left: 0;
  color: var(--amber); font-weight: 700;
}

/* Closing line */
.v9-closing-line {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif !important;
  font-style: italic; font-size: 1.2rem !important;
  color: var(--deep-amber); margin-top: 2rem !important;
  text-align: center;
}

/* Seal */
.v9-seal {
  display: flex; flex-direction: column; gap: 0.3rem;
  margin: 2rem 0; padding: 0.8rem 1rem;
  border-left: 2px solid var(--rust);
  background: rgba(139,58,46,0.04);
  font-family: 'JetBrains Mono',monospace;
}
.v9-seal-tag { font-size: 0.52rem; font-weight: 700; letter-spacing: 0.25em; text-transform: uppercase; color: var(--rust); }
.v9-seal-hash { font-size: 0.6rem; color: rgba(61,43,15,0.4); letter-spacing: 0.04em; }
.v9-seal-when { font-size: 0.52rem; color: rgba(61,43,15,0.3); letter-spacing: 0.06em; }

/* Ways in */
.v9-ways {
  display: grid; grid-template-columns: 1fr 1fr; gap: 2px;
  margin: 2.5rem 0 0; border-radius: 3px; overflow: hidden;
}
.v9-way {
  display: flex; flex-direction: column; gap: 4px; padding: 1.1rem 1rem;
  background: rgba(61,43,15,0.04); text-decoration: none; color: var(--ink);
  transition: background 0.3s ease;
}
.v9-way:hover { background: rgba(61,43,15,0.09); }
.v9-way-name {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-style: italic; font-weight: 500; font-size: 1rem;
}
.v9-way-sub {
  font-family: 'JetBrains Mono',monospace; font-size: 0.5rem;
  letter-spacing: 0.06em; color: rgba(61,43,15,0.4);
}

/* Links */
/* Addendum */
.v9-addendum-rule {
  margin: 3rem 0 1.5rem;
  border-top: 1px solid rgba(139,58,46,0.2);
}
.v9-addendum-tag {
  font-family: 'JetBrains Mono',monospace;
  font-size: 0.6rem; letter-spacing: 0.15em; text-transform: uppercase;
  color: var(--rust); opacity: 0.7; margin-bottom: 1.5rem;
}

.v9-letter a, .v9-link {
  color: var(--ink); text-decoration: none;
  border-bottom: 1px solid rgba(139,58,46,0.3); padding-bottom: 1px;
  transition: color 200ms ease, border-color 200ms ease;
}
.v9-letter a:hover, .v9-link:hover { color: var(--rust); border-bottom-color: var(--rust); }

/* ═══════ THE PAINTING ═══════ */
.v9-painting {
  position: relative;
  background:
    radial-gradient(ellipse 150% 80% at 60% 40%, rgba(27,58,107,0.14) 0%, transparent 70%),
    radial-gradient(ellipse 80% 60% at 20% 80%, rgba(107,77,138,0.10) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 20%, rgba(200,169,74,0.12) 0%, transparent 50%),
    #1a1208;
  padding: clamp(5rem,10vw,8rem) clamp(1.25rem,4vw,2rem);
  color: #e8e4dc;
}
.v9-painting-glow {
  position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(ellipse 80% 60% at 50% 35%, rgba(200,169,74,0.10) 0%, transparent 70%);
  transition: opacity 0.6s ease;
}
.v9-painting:hover .v9-painting-glow { opacity: 1.4; }
.v9-painting-inner {
  max-width: 58rem; margin: 0 auto; position: relative; z-index: 1;
  display: grid; grid-template-columns: 1fr 1fr; gap: clamp(2rem,4vw,3.5rem); align-items: start;
}
.v9-painting-frame {
  border-radius: 2px; overflow: hidden; padding: clamp(10px,2vw,18px);
  background: linear-gradient(145deg, #2a2218, #1e1810);
  box-shadow:
    0 0 0 1px rgba(200,169,74,0.28),
    0 0 80px rgba(200,169,74,0.14),
    0 0 160px rgba(27,58,107,0.12),
    0 28px 80px rgba(0,0,0,0.6);
  perspective: 800px;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.22,1,0.36,1), box-shadow 0.6s ease;
  cursor: default;
}
.v9-painting:hover .v9-painting-frame {
  transform: rotateY(-2deg) rotateX(1deg) translateZ(8px);
  box-shadow:
    0 0 0 1px rgba(200,169,74,0.38),
    0 0 100px rgba(200,169,74,0.20),
    0 0 200px rgba(27,58,107,0.15),
    0 40px 100px rgba(0,0,0,0.7);
}
.v9-painting-img { display: block; width: 100%; height: auto; }
.v9-painting-caption { display: flex; flex-direction: column; gap: 0.5rem; padding-top: clamp(10px,2vw,18px); }
.v9-painting-title {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-size: 1.25rem; font-style: italic; font-weight: 500; color: rgba(232,228,220,0.7);
}
.v9-painting-terms { display: flex; flex-direction: column; gap: 18px; margin: 20px 0 12px; }
.v9-painting-term { display: flex; flex-direction: column; gap: 2px; }
.v9-painting-label {
  font-family: 'JetBrains Mono',monospace; font-size: 0.58rem;
  letter-spacing: 0.1em; text-transform: uppercase; opacity: 0.35;
}
.v9-painting-value {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-size: 1.7rem; font-weight: 500; color: rgba(232,228,220,0.8);
}
.v9-painting-live { color: var(--amber); }
.v9-painting-meta {
  font-family: 'JetBrains Mono',monospace; font-size: 0.58rem;
  letter-spacing: 0.02em; line-height: 1.7; opacity: 0.3; margin-top: 8px;
}
.v9-painting-bid {
  display: inline-block; margin-top: 1.25rem;
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-size: 1rem; font-weight: 500; text-decoration: none;
  padding: 0.6rem 1.75rem; border-radius: 2px;
  color: rgba(232,228,220,0.8); border: 1px solid rgba(200,169,74,0.28);
  transition: all 0.4s ease;
}
.v9-painting-bid:hover { background: rgba(200,169,74,0.15); border-color: rgba(200,169,74,0.55); color: var(--amber); }
.v9-first-bid {
  display: flex; flex-direction: column; gap: 2px; margin: 10px 0 8px;
}
.v9-first-bid-name {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-style: italic; font-size: 0.9rem; color: rgba(232,228,220,0.6);
}
.v9-first-bid-msg {
  font-family: var(--font-body,'EB Garamond'),Georgia,serif;
  font-style: italic; font-size: 0.85rem; color: rgba(232,228,220,0.35);
  letter-spacing: 0.01em;
}

/* ═══════ THE PARTY ═══════ */
@keyframes v9-spotlight {
  0%   { opacity: 0.5; transform: scale(1) translateY(0); }
  50%  { opacity: 0.85; transform: scale(1.06) translateY(-2%); }
  100% { opacity: 0.5; transform: scale(1) translateY(0); }
}
@keyframes v9-presents-in {
  from { opacity: 0; letter-spacing: 0.6em; }
  to   { opacity: 1; letter-spacing: 0.32em; }
}
.v9-party {
  position: relative; overflow: hidden;
  background:
    linear-gradient(155deg, #1a1208 0%, #3D2B0F 8%, #8B6248 20%, #C4A882 32%, #A88060 42%, #C9A882 52%, #8B6248 65%, #4A2A1A 80%, var(--dark) 100%);
}
.v9-party::before {
  content: '';
  position: absolute; inset: 0; pointer-events: none; z-index: 0;
  background:
    radial-gradient(ellipse 55% 70% at 50% 38%, rgba(212,175,80,0.18) 0%, transparent 65%),
    radial-gradient(ellipse 80% 60% at 85% 90%, rgba(168,120,60,0.14) 0%, transparent 100%),
    radial-gradient(ellipse 60% 50% at 10% 8%, rgba(60,36,20,0.18) 0%, transparent 100%);
  animation: v9-spotlight 8s ease-in-out infinite;
}
.v9-party-inner {
  position: relative; z-index: 1; display: flex; flex-direction: column;
  align-items: center; text-align: center;
  padding: clamp(5rem,14vh,9rem) clamp(1.5rem,5vw,3rem);
}
.v9-party-presents {
  font-family: 'JetBrains Mono',monospace; font-size: 0.62rem;
  letter-spacing: 0.32em; text-transform: uppercase; color: #C44B6C; margin-bottom: 28px;
  animation: v9-presents-in 1.4s cubic-bezier(0.22,1,0.36,1) both;
}
.v9-party-inner.v9-in .v9-party-presents { animation-delay: 0.1s; }
.v9-party-title {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-size: clamp(3.5rem,10vw,5.5rem); font-weight: 400; font-style: italic;
  color: #EDE5D5; line-height: 1.05; letter-spacing: -0.02em; margin: 0 0 24px;
}
.v9-party-sub {
  font-family: 'JetBrains Mono',monospace; font-size: 0.6rem;
  letter-spacing: 0.2em; text-transform: uppercase; color: rgba(237,229,213,0.5); margin-bottom: 48px;
}
.v9-party-rule { width: min(320px,55%); height: 2px; background: linear-gradient(90deg, transparent, var(--amber), transparent); margin-bottom: 48px; }
.v9-party-tagline {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-size: clamp(1.5rem,4vw,2.4rem); font-style: italic; color: #EDE5D5;
  letter-spacing: 0.01em; line-height: 1.3; margin: 0 0 24px;
}
.v9-party-detail {
  font-family: 'JetBrains Mono',monospace; font-size: clamp(0.58rem,1.5vw,0.68rem);
  letter-spacing: 0.18em; text-transform: uppercase; color: rgba(237,229,213,0.4); margin-top: 4px;
}

/* Ticket */
/* Backed by */
.v9-backed { text-align: center; padding: 0 0 clamp(3rem,6vw,5rem); }
.v9-backed-label { font-family: 'JetBrains Mono',monospace; font-size: 0.55rem; letter-spacing: 0.35em; text-transform: uppercase; color: rgba(229,221,210,0.2); display: block; margin-bottom: 20px; }
.v9-backed-names { display: flex; gap: 40px; justify-content: center; flex-wrap: wrap; }
.v9-backed-names span { font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif; font-size: 0.95rem; font-weight: 500; color: rgba(229,221,210,0.35); letter-spacing: 0.04em; }

/* ═══════ INTERACTIVE TICKET ═══════ */
.it-stage {
  display: flex; flex-direction: column; align-items: center;
  padding: clamp(2rem,4vw,3.5rem) 1rem; user-select: none; overflow: visible;
  position: relative; min-height: 280px;
}
.it-hint {
  font-family: 'JetBrains Mono',monospace; font-size: 9px; letter-spacing: 0.12em;
  color: rgba(229,221,210,0.2); text-align: center; margin-bottom: 1.5rem;
}
.it-wrap {
  will-change: transform; cursor: grab; touch-action: none;
}
.it-wrap:active { cursor: grabbing; }
.it {
  position: relative; width: min(480px, 85vw); height: 170px;
  perspective: 1200px; transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4,0,0.2,1);
  border-radius: 4px; will-change: transform, clip-path;
}
.it--flipped { transform: rotateX(180deg); }
.it-face {
  position: absolute; inset: 0; backface-visibility: hidden;
  -webkit-backface-visibility: hidden; border-radius: inherit; overflow: hidden;
}
.it-front { background: #141210; display: flex; }
.it-back {
  background: #1a1810; transform: rotateX(180deg);
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem;
}
.it-watermark {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-style: italic; font-size: 1.8rem; color: rgba(229,221,210,0.1); letter-spacing: 0.08em;
}
.it-back-note {
  font-family: 'JetBrains Mono',monospace; font-size: 9px; letter-spacing: 0.14em;
  color: rgba(229,221,210,0.2); text-transform: uppercase;
}
.it-scene { flex: 1; display: flex; flex-direction: column; }
.it-top {
  flex: 1; display: flex; align-items: flex-end;
  background: #141210; will-change: transform; border-radius: 4px 0 0 0;
  position: relative;
}
.it-top::after {
  content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
  background: rgba(201,149,42,0.08);
}
.it-bottom { flex: 1; display: flex; background: #141210; border-radius: 0 0 0 4px; }
.it-body-top, .it-body-bottom {
  flex: 1; display: flex; flex-direction: column; padding: 0 1.25rem;
}
.it-body-top { justify-content: flex-end; padding-bottom: 0.5rem; }
.it-body-bottom { justify-content: flex-start; padding-top: 0.5rem; cursor: pointer; }
.it-eyebrow {
  font-family: 'JetBrains Mono',monospace; font-size: 9px; letter-spacing: 0.22em;
  text-transform: uppercase; color: rgba(229,221,210,0.3); margin-bottom: 0.2rem;
}
.it-title {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-style: italic; font-size: 1.3rem; font-weight: 500; color: #C9952A; line-height: 1.1;
}
.it-date {
  font-family: 'JetBrains Mono',monospace; font-size: 9px; letter-spacing: 0.15em;
  text-transform: uppercase; color: rgba(229,221,210,0.35); margin-bottom: 0.4rem;
}
.it-cta {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-style: italic; font-size: 0.85rem; color: rgba(201,149,42,0.5);
}
/* Tear line */
.it-tear {
  position: absolute; top: 0; bottom: 0; right: 80px; width: 1px;
  display: flex; flex-direction: column; align-items: center; justify-content: space-between;
  z-index: 5; pointer-events: none;
  background: repeating-linear-gradient(to bottom, rgba(229,221,210,0.12) 0px, rgba(229,221,210,0.12) 4px, transparent 4px, transparent 8px);
  transition: opacity 0.3s ease;
}
.it-tear-hole {
  width: 12px; height: 12px; border-radius: 50%;
  background: radial-gradient(circle, rgba(80,50,25,0.9), rgba(40,25,12,0.95));
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.5);
  flex-shrink: 0; position: relative; left: 0;
}
.it-tear-t { margin-top: -6px; }
.it-tear-b { margin-bottom: -6px; }
.it-tear-dash { flex: 1; }
/* Stub */
.it-stub {
  position: absolute; top: 0; right: 0; bottom: 0; width: 80px;
  background: #111010; border-left: 1px solid rgba(201,149,42,0.08);
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
  cursor: grab; touch-action: none; will-change: transform, box-shadow;
  border-radius: 0 4px 4px 0; transform-origin: left center; z-index: 20;
}
.it-stub:active { cursor: grabbing; }
.it-barcode { display: flex; gap: 1.5px; align-items: flex-end; }
.it-bar { width: 1.5px; background: rgba(229,221,210,0.25); border-radius: 1px; }
.it-admit {
  font-family: 'JetBrains Mono',monospace; font-size: 7px; letter-spacing: 0.15em;
  color: rgba(229,221,210,0.18); text-transform: uppercase;
  writing-mode: vertical-lr; transform: rotate(180deg);
}
/* Torn edge */
.it-body--torn::after {
  content: ''; position: absolute; top: 0; right: 0; bottom: 0; width: 10px;
  background: linear-gradient(to right, transparent, rgba(229,221,210,0.06) 50%, transparent);
  clip-path: polygon(0% 0%,100% 2%,95% 8%,100% 15%,92% 22%,100% 30%,96% 38%,100% 45%,93% 52%,100% 60%,97% 68%,100% 75%,94% 82%,100% 90%,98% 100%,0% 100%);
  pointer-events: none;
}
/* Front face paper texture */
.it-front::before {
  content: ''; position: absolute; inset: 0; pointer-events: none; z-index: 1;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Ccircle cx='1' cy='1' r='0.4' fill='%23EDE5D5' fill-opacity='0.5'/%3E%3C/svg%3E");
}

@media (max-width: 640px) {
  .it { width: min(340px, 90vw); height: 150px; }
  .it-stub { width: 60px; }
  .it-tear { right: 60px; }
  .it-title { font-size: 1.1rem; }
}

/* ═══════ FOUR REVOLUTIONS ═══════ */
.v9-revs { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; overflow: hidden; }
.v9-rev {
  display: flex; flex-direction: column; gap: 8px; padding: 36px 32px;
  background: #0e0d0b; text-decoration: none; color: #e8e4dc;
  border-left: 2px solid transparent;
  transition: background 0.35s ease, border-color 0.35s ease, transform 0.12s ease-out;
  position: relative;
  transform-style: preserve-3d;
}
.v9-rev::after {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.04), transparent 60%);
  opacity: 0; transition: opacity 0.3s ease;
}
.v9-rev:hover::after { opacity: 1; }
.v9-rev:hover { background: #161412; }
/* I — financial: gold */
.v9-rev:nth-child(1):hover { border-color: #C9952A; }
.v9-rev:nth-child(1):hover .v9-rev-n { opacity: 1; color: #C9952A; }
/* II — art: dusty rose */
.v9-rev:nth-child(2):hover { border-color: #C08080; }
.v9-rev:nth-child(2):hover .v9-rev-n { opacity: 1; color: #C08080; }
/* III — socialist: muted red */
.v9-rev:nth-child(3):hover { border-color: #B54040; }
.v9-rev:nth-child(3):hover .v9-rev-n { opacity: 1; color: #B54040; }
/* IV — AI: cold steel blue */
.v9-rev:nth-child(4):hover { border-color: #5A8AB0; }
.v9-rev:nth-child(4):hover .v9-rev-n { opacity: 1; color: #5A8AB0; }
.v9-rev-n {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-size: 1.1rem; color: #C9952A; opacity: 0.35;
  transition: opacity 0.35s ease, color 0.35s ease;
}
.v9-rev-name { font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif; font-size: 1.05rem; font-weight: 600; font-style: italic; color: rgba(232,228,220,0.7); }
.v9-rev-sub { font-family: 'JetBrains Mono',monospace; font-size: 0.55rem; opacity: 0.25; letter-spacing: 0.06em; color: rgba(232,228,220,0.4); margin-top: 4px; }

/* ═══════ WORLD 3: THE DOOR ═══════ */
.v9-door { position: relative; min-height: 55vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: clamp(4rem,10vw,8rem) clamp(1.25rem,4vw,2rem); overflow: hidden; }
.v9-door-rocks {
  position: absolute; inset: -4%;
  background: url('/hero/rocks.webp') center 55% / cover no-repeat;
  filter: brightness(0.35) saturate(0.45) contrast(1.08);
  animation: v9-drift 60s linear infinite alternate;
}
.v9-door-fade { position: absolute; inset: 0; pointer-events: none; background: linear-gradient(to bottom, rgba(10,9,8,0.88) 0%, rgba(10,9,8,0.3) 18%, transparent 40%, transparent 75%, rgba(4,3,2,1) 100%); }

.v9-door-content { position: relative; z-index: 1; text-align: center; }
.v9-door-line { font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif; font-style: italic; font-size: clamp(1.8rem,5vw,2.8rem); color: rgba(240,235,226,0.7); margin: 0 0 1.5rem; }
.v9-door-acts { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; }
.v9-btn { display: inline-block; padding: 0.7rem 2rem; font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif; font-style: italic; font-size: 1rem; color: var(--paper); background: color-mix(in srgb, var(--amber) 85%, var(--dark)); text-decoration: none; border-radius: 2px; transition: background 250ms ease; }
.v9-btn:hover { background: var(--amber); }
.v9-link-dim { font-family: var(--font-body,'EB Garamond'),Georgia,serif; font-style: italic; font-size: 0.9rem; color: rgba(240,235,226,0.4); text-decoration: none; transition: color 200ms ease; }
.v9-link-dim:hover { color: rgba(240,235,226,0.75); }
.v9-door-rail { font-family: 'JetBrains Mono',monospace; font-size: 0.55rem; letter-spacing: 0.08em; color: rgba(240,235,226,0.2); margin-top: 0.5rem; }
.v9-door-rail a { color: rgba(240,235,226,0.3); text-decoration: none; transition: color 200ms ease; }
.v9-door-rail a:hover { color: rgba(240,235,226,0.6); }

.v9-outcome { display: flex; align-items: baseline; justify-content: center; gap: 0.5rem; margin-top: 2rem; font-family: 'JetBrains Mono',monospace; font-size: 0.6rem; letter-spacing: 0.08em; color: rgba(240,235,226,0.18); }
.v9-outcome-blank { display: inline-block; width: 8rem; border-bottom: 0.5px solid rgba(240,235,226,0.15); }

/* CMIYGL closer */
.v9-closer { position: relative; z-index: 1; text-align: center; padding-top: clamp(4rem,10vw,8rem); padding-bottom: 1rem; }
.v9-cmiygl { font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif; font-size: clamp(1.8rem,4.5vw,3rem); font-style: italic; font-weight: 300; margin: 0 0 1.5rem; line-height: 1.2; opacity: 0.5; }
.v9-sig { font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif; font-size: clamp(0.85rem,1.8vw,1.1rem); font-style: italic; letter-spacing: 0.15em; margin: 0 0 2rem; opacity: 0.38; }
.v9-phone { font-family: 'JetBrains Mono',monospace; font-size: 0.55rem; letter-spacing: 0.18em; opacity: 0.12; display: block; color: rgba(240,235,226,0.5); }

.v9-rc { display: inline-block; }
.v9-cmiygl .v9-rc:nth-child(4n+1) { color: #a09484; }
.v9-cmiygl .v9-rc:nth-child(4n+2) { color: #b0a290; }
.v9-cmiygl .v9-rc:nth-child(4n+3) { color: #968a7a; }
.v9-cmiygl .v9-rc:nth-child(4n)   { color: #a89c8a; }
.v9-cmiygl .v9-rc:last-child      { color: #c9a840; }
.v9-rw { display: inline-block; }
.v9-rw:nth-child(1) { color: #C9952A; } .v9-rw:nth-child(2) { color: #D4A040; }
.v9-rw:nth-child(3) { color: #C4884A; } .v9-rw:nth-child(4) { color: #B8784A; }
.v9-rw:nth-child(5) { color: #A86840; } .v9-rw:nth-child(6) { color: #C9952A; }
.v9-rw:nth-child(7) { color: #B8784A; } .v9-rw:nth-child(8) { color: #9B5A38; }
.v9-rw:nth-child(9) { color: #8B4A2E; }

/* Nav rooms */
.v9-rooms { position: relative; z-index: 1; display: flex; justify-content: center; gap: 1.5rem; flex-wrap: wrap; padding: 2rem 1.5rem clamp(3rem,6vw,5rem); }
.v9-rooms a { font-family: var(--font-body,'EB Garamond'),Georgia,serif; font-style: italic; font-size: 0.85rem; color: rgba(240,235,226,0.35); text-decoration: none; transition: color 200ms ease; }
.v9-rooms a:hover { color: rgba(240,235,226,0.7); }

/* ═══════ SCROLL REVEAL ═══════ */
.v9-reveal { opacity: 0; transform: translateY(16px); transition: opacity 0.9s ease, transform 0.9s cubic-bezier(0.22,1,0.36,1); }
.v9-reveal.v9-in { opacity: 1; transform: translateY(0); }

/* ═══════ MOBILE NAV ═══════ */
.v9-mob { position: fixed; bottom: 0; left: 0; right: 0; height: 52px; display: none; align-items: center; justify-content: center; gap: clamp(1.5rem,6vw,2.5rem); background: rgba(10,10,10,0.94); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border-top: 1px solid rgba(201,149,42,0.08); z-index: 100; padding-bottom: env(safe-area-inset-bottom,0px); }
.v9-mob a { font-family: ui-monospace,'SF Mono',monospace; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(240,235,226,0.28); text-decoration: none; transition: color 0.15s ease; padding: 6px 4px; }
.v9-mob a:hover { color: rgba(240,235,226,0.75); }

/* ═══════ MOBILE ═══════ */
@media (max-width: 640px) {
  .v9-mob { display: flex; }
  .v9-eye { font-size: 0.52rem; letter-spacing: 0.22em; }
  .v9-num { font-size: clamp(3rem,14vw,5rem); }
  .v9-dollar { font-size: 0.4em; }
  .v9-meta { font-size: 0.5rem; gap: 0.35rem; flex-wrap: wrap; justify-content: center; }
  .v9-tagline { font-size: 0.95rem; }
  .v9-hero-foot { width: min(92%,30rem); }
  .v9-trace { font-size: 0.5rem; }
  .v9-paper { padding: 2rem 1.25rem 1.5rem; }
  .v9-drop { font-size: 3.5rem; padding: 0.15rem 0.4rem 0 0; }
  .v9-letter p { font-size: 1rem; }
  .v9-lede { font-size: 1rem !important; }
  .v9-pull { font-size: 1.1rem !important; padding: 1.5rem 0.5rem; max-width: 100%; }
  .v9-proof { padding: 1rem; font-size: 0.6rem; }
  .v9-proof-row { flex-direction: column; gap: 2px; padding: 0.45rem 0; }
  .v9-stocks { grid-template-columns: repeat(2, 1fr); }
  .v9-ways { grid-template-columns: 1fr; }
  .v9-painting { padding: 2.5rem 1.25rem; }
  .v9-painting-inner { grid-template-columns: 1fr; gap: 1.5rem; max-width: 100%; }
  .v9-painting-terms { flex-direction: row; gap: 24px; }
  .v9-painting-value { font-size: 1.3rem; }
  .v9-painting-bid { padding: 0.65rem 1.8rem; min-height: 44px; display: inline-flex; align-items: center; }
  .v9-painting:hover .v9-painting-frame { transform: none; }
  .v9-party-inner { padding: 3.5rem 1.25rem; }
  .v9-party-title { font-size: clamp(2.6rem,9vw,3.8rem); }
  .v9-backed { padding: 0 1.25rem 3rem; }
  .v9-backed-names { flex-direction: column; align-items: center; gap: 14px; }
  .v9-revs { grid-template-columns: 1fr; }
  .v9-rev { padding: 26px 20px; }
  .v9-door { min-height: 50vh; padding: 3rem 1.25rem; }
  .v9-door-line { font-size: 1.6rem; }
  .v9-closer { padding-top: 3rem; }
  .v9-cmiygl { font-size: 1.5rem; }
  .v9-rooms { gap: 0.8rem 1rem; padding-bottom: calc(52px + env(safe-area-inset-bottom,0px) + 2rem); }
  .v9-rooms a { font-size: 0.78rem; }
}

/* ═══════ REDUCED MOTION ═══════ */
@media (prefers-reduced-motion: reduce) {
  .v9-rocks { animation: none !important; filter: brightness(0.62) saturate(0.88) contrast(1.06) sepia(0.10) !important; }
  .v9-door-rocks { animation: none !important; }
  .v9-dot { animation: none !important; opacity: 0.7; }
  .v9-cue span { animation: none !important; }
  .v9-party::before { animation: none !important; }
  .v9-party-presents { animation: none !important; }
  .v9-reveal { opacity: 1; transform: none; transition: none; }
  .v9-hero-eye, .v9-hero-num { opacity: 1; transform: none; transition: none; }
  .v9-hero-foot { opacity: 1; animation: none !important; }
  .v9-painting:hover .v9-painting-frame { transform: none !important; }
  .v9-rev:hover { transform: none !important; }
}
`;
