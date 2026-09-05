"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════
   HOMEPAGE — The Broadsheet

   A warm paper masthead → featured article → edition gallery
   → atmospheric route map → colophon.

   Hybrid of editorial authority and cinematic discovery.
   Zero libraries. Pure CSS + vanilla JS.
   ═══════════════════════════════════════════════════════ */

const SUBTITLES = [
  "letters on building, taste, and what lasts",
  "563 commits · 6 eras · one surface",
  "a public record of thinking out loud",
  "probably impossible. definitely public.",
  "the name is bullshit. the product is beautiful.",
];

type Edition = {
  id: string;
  issue: string;
  title: string;
  subtitle: string;
  dateRange: string;
  accent: string;
  route: string;
  pullQuote: string;
};

const EDITIONS: Edition[] = [
  { id: "round-zero", issue: "001", title: "Round Zero", subtitle: "The Pre-Mortem", dateRange: "Apr 14, 2026", accent: "#6B6560", route: "/letters/round-0", pullQuote: "A satirical birthday party frame for a very serious bet." },
  { id: "the-pitch", issue: "002", title: "The Pitch", subtitle: "Password-Gated Manifesto", dateRange: "Apr 14–22", accent: "#8B3A2E", route: "/pitch", pullQuote: "let's cut through the bullshit. together." },
  { id: "the-drafts", issue: "003", title: "The Drafts", subtitle: "Experiments in Space", dateRange: "Apr 15 – May 18", accent: "#4A8B8B", route: "/17", pullQuote: "A pannable multiverse of familiar UIs." },
  { id: "the-funnel", issue: "004", title: "The Funnel", subtitle: "Chart-First Public Offering", dateRange: "Apr 18 – May 26", accent: "#A89A7E", route: "/positions", pullQuote: "No owner. No curator. No fee. No exit." },
  { id: "the-rocks", issue: "005", title: "The Rocks", subtitle: "Cinematic Materialism", dateRange: "May 26 – Jun 23", accent: "#1C1A17", route: "/home-v9", pullQuote: "probably impossible. definitely public." },
  { id: "the-article", issue: "006", title: "The Article", subtitle: "Editorial Reset", dateRange: "Aug 1, 2026 –", accent: "#1ba4c4", route: "/editions", pullQuote: "Harm caused by drugs. 100 = maximum." },
];

const ROUTES = [
  { href: "/letters", label: "Letters", desc: "Eight dispatches from the surface" },
  { href: "/editions", label: "Editions", desc: "563 commits as a spatial magazine rack" },
  { href: "/archive", label: "Archive", desc: "Every version, every era, everything" },
  { href: "/home-v9", label: "The Rocks", desc: "The cinematic homepage, preserved as found" },
  { href: "/argument", label: "The Argument", desc: "Five agents disagree about all of this" },
  { href: "/green-credit", label: "Green Credit", desc: "Attention rewards better reasoning" },
  { href: "/draft", label: "Draft", desc: "A pannable multiverse of moments" },
  { href: "/letters/entrenched-coils", label: "Entrenched Coils", desc: "Tension-weighted memory framework" },
];

export default function HomePage() {
  const [subtitleIdx, setSubtitleIdx] = useState(0);
  const [entered, setEntered] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  /* Rotate subtitles */
  useEffect(() => {
    setSubtitleIdx(Math.floor(Math.random() * SUBTITLES.length));
    const id = setInterval(() => setSubtitleIdx((i) => (i + 1) % SUBTITLES.length), 6000);
    return () => clearInterval(id);
  }, []);

  /* Entrance animation */
  useEffect(() => {
    requestAnimationFrame(() => setEntered(true));
  }, []);

  /* Scroll reveal */
  useEffect(() => {
    const els = rootRef.current?.querySelectorAll(".hm-reveal");
    if (!els) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("hm-in");
      }),
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className={`hm ${entered ? "hm-entered" : ""}`} ref={rootRef}>
      <style>{CSS}</style>

      {/* ═══════ SECTION 1: THE MASTHEAD ═══════ */}
      <section className="hm-mast">
        <div className="hm-grain" />
        <div className="hm-mast-inner">
          <span className="hm-eyebrow">est. april 2026 · los angeles · no. 007</span>
          <h1 className="hm-wordmark">aureliex<span className="hm-dot">.</span></h1>
          <p className="hm-subtitle" key={subtitleIdx}>{SUBTITLES[subtitleIdx]}</p>
          <div className="hm-mast-rule" />
        </div>
        <div className="hm-scroll-cue"><span /></div>
      </section>

      {/* ═══════ SECTION 2: FEATURED PIECE ═══════ */}
      <section className="hm-feature hm-reveal">
        <div className="hm-feature-inner">
          <div className="hm-feature-meta">
            <span className="hm-tag">Article</span>
            <span className="hm-date">August 2026</span>
          </div>
          <div className="hm-feature-spread">
            <div className="hm-feature-text">
              <h2 className="hm-feature-title">Alcohol</h2>
              <p className="hm-feature-deck">
                I think most people are aware that alcohol is really bad for you,
                yet it&rsquo;s so normalized that people don&rsquo;t mind that cost
                to have fun at a party. This isn&rsquo;t a criticism of that mindset,
                but it&rsquo;s to establish the premise that this exists pretty much
                everywhere&hellip;
              </p>
              <Link href="/editions#the-article" className="hm-feature-link">Continue reading →</Link>
            </div>
            <div className="hm-feature-img-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/harm-chart.gif" alt="Drug harm chart — The Lancet" className="hm-feature-img" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ SECTION 3: THE EDITIONS ═══════ */}
      <section className="hm-editions hm-reveal">
        <div className="hm-editions-head">
          <span className="hm-eyebrow">The Editions</span>
          <p className="hm-editions-sub">Every era of the thing, cover to cover.</p>
        </div>
        <div className="hm-gallery" ref={galleryRef}>
          {EDITIONS.map((ed) => (
            <Link key={ed.id} href={ed.route} className="hm-card" style={{ "--card-accent": ed.accent } as React.CSSProperties}>
              <div className="hm-card-band" />
              <div className="hm-card-body">
                <span className="hm-card-num">No. {ed.issue}</span>
                <h3 className="hm-card-title">{ed.title}</h3>
                <span className="hm-card-sub">{ed.subtitle}</span>
                <p className="hm-card-quote">&ldquo;{ed.pullQuote}&rdquo;</p>
              </div>
              <div className="hm-card-foot">
                <span>{ed.dateRange}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Bridge: paper → dark ── */}
      <div className="hm-bridge" />

      {/* ═══════ SECTION 4: THE MAP ═══════ */}
      <section className="hm-map">
        <div className="hm-map-inner">
          {ROUTES.map((r) => (
            <Link key={r.href} href={r.href} className="hm-route hm-reveal">
              <span className="hm-route-label">{r.label}</span>
              <span className="hm-route-desc">{r.desc}</span>
              <span className="hm-route-arrow">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════ SECTION 5: COLOPHON ═══════ */}
      <footer className="hm-colophon hm-reveal">
        <div className="hm-col-rule" />
        <p className="hm-cmiygl">
          {"call me if you get lost.".split("").map((ch, i) => (
            <span key={i} className="hm-rc" style={{ "--i": i } as React.CSSProperties}>
              {ch === " " ? "\u00A0" : ch}
            </span>
          ))}
        </p>
        <p className="hm-sig">aureliex.</p>
        <div className="hm-col-details">
          <span>Saathvik Pai · Los Angeles</span>
          <span className="hm-col-sep">·</span>
          <a href="tel:3853687238" className="hm-col-link">385-368-7238</a>
        </div>
      </footer>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════ */
const CSS = `
/* ── TOKENS ── */
.hm {
  --paper:       #F4EFE6;
  --paper-warm:  #FAF6F0;
  --ink:         #1C1A17;
  --graphite:    #6B6560;
  --rust:        #8B3A2E;
  --teal:        #1ba4c4;
  --navy:        #1a3a5c;
  --dark:        #0c0a08;
  --rule-color:  rgba(28,26,23,0.14);

  min-height: 100vh;
  background: var(--paper);
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  font-feature-settings: "liga" 1, "kern" 1;
  overflow-x: hidden;
}

/* ── SHARED ── */
.hm-grain {
  position: absolute; inset: 0; pointer-events: none; z-index: 0;
  opacity: 0.03; mix-blend-mode: multiply;
  background-image:
    radial-gradient(rgba(28,26,23,0.5) 1px, transparent 1px),
    radial-gradient(rgba(28,26,23,0.3) 1px, transparent 1px);
  background-size: 3px 3px, 5px 5px; background-position: 0 0, 2px 2px;
}

.hm-eyebrow {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 9px; letter-spacing: 0.3em; text-transform: uppercase;
  color: var(--graphite); opacity: 0.45;
}

/* ── REVEAL ── */
.hm-reveal {
  opacity: 0; transform: translateY(20px);
  transition: opacity 0.9s cubic-bezier(0.22,1,0.36,1), transform 0.9s cubic-bezier(0.22,1,0.36,1);
}
.hm-reveal.hm-in { opacity: 1; transform: translateY(0); }

/* ═══════ SECTION 1: MASTHEAD ═══════ */
.hm-mast {
  position: relative;
  min-height: 100svh;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  background: var(--paper-warm);
  padding: 2rem;
}
.hm-mast-inner {
  text-align: center;
  opacity: 0; transform: translateY(16px);
  animation: hm-rise 1.2s cubic-bezier(0.22,1,0.36,1) 0.3s forwards;
}
@keyframes hm-rise {
  to { opacity: 1; transform: translateY(0); }
}

.hm-wordmark {
  font-family: var(--font-display, 'Cormorant Garamond'), Georgia, serif;
  font-style: italic; font-weight: 400;
  font-size: clamp(4.5rem, 3rem + 8vw, 9rem);
  letter-spacing: -0.03em; line-height: 1;
  color: var(--ink); margin: 16px 0 0;
  user-select: none;
}
.hm-dot { color: var(--rust); }

.hm-subtitle {
  font-family: var(--font-body, 'EB Garamond'), Georgia, serif;
  font-style: italic;
  font-size: clamp(1rem, 0.85rem + 0.5vw, 1.2rem);
  color: var(--graphite);
  margin: 20px 0 0; letter-spacing: 0.01em;
  animation: hm-fade-sub 0.6s ease both;
}
@keyframes hm-fade-sub {
  from { opacity: 0; }
  to   { opacity: 0.7; }
}

.hm-mast-rule {
  width: 48px; height: 2px; margin: 28px auto 0;
  background: linear-gradient(90deg, transparent, var(--rust), transparent);
  opacity: 0.4;
}

.hm-scroll-cue {
  position: absolute; bottom: clamp(2rem, 5vh, 3.5rem);
  display: flex; justify-content: center; width: 100%;
}
.hm-scroll-cue span {
  display: block; width: 1px; height: 28px;
  background: rgba(28,26,23,0.2);
  animation: hm-cue 2.5s ease-in-out 2s infinite;
}
@keyframes hm-cue {
  0%, 100% { opacity: 0.2; transform: scaleY(1); }
  50%      { opacity: 0.6; transform: scaleY(1.5); }
}

/* ═══════ SECTION 2: FEATURED PIECE ═══════ */
.hm-feature {
  position: relative;
  background: var(--paper);
  padding: clamp(4rem, 8vw, 7rem) clamp(1.25rem, 4vw, 2.5rem);
  border-top: 1px solid var(--rule-color);
}
.hm-feature-inner {
  max-width: 56rem; margin: 0 auto;
}
.hm-feature-meta {
  display: flex; align-items: center; gap: 16px;
  margin-bottom: clamp(1.5rem, 3vw, 2.5rem);
}
.hm-tag {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase;
  color: var(--rust); border: 1px solid rgba(139,58,46,0.25);
  padding: 3px 10px; border-radius: 2px;
}
.hm-date {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--graphite); opacity: 0.5;
}

.hm-feature-spread {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: clamp(2rem, 4vw, 4rem); align-items: start;
}
.hm-feature-title {
  font-family: var(--font-display, 'Cormorant Garamond'), Georgia, serif;
  font-style: italic; font-weight: 500;
  font-size: clamp(2.2rem, 1.5rem + 3vw, 3.8rem);
  line-height: 1.1; letter-spacing: -0.015em;
  color: var(--ink); margin: 0 0 clamp(1rem, 2vw, 1.8rem);
}
.hm-feature-deck {
  font-family: var(--font-body, 'EB Garamond'), Georgia, serif;
  font-size: clamp(1rem, 0.9rem + 0.35vw, 1.12rem);
  line-height: 1.78; color: var(--ink); margin: 0 0 1.5rem;
}
.hm-feature-link {
  font-family: var(--font-display, 'Cormorant Garamond'), Georgia, serif;
  font-style: italic; font-size: 1rem;
  color: var(--rust); text-decoration: none;
  border-bottom: 1px solid rgba(139,58,46,0.3);
  padding-bottom: 2px;
  transition: color 0.3s ease, border-color 0.3s ease;
}
.hm-feature-link:hover { color: var(--ink); border-color: var(--ink); }

.hm-feature-img-wrap {
  border-radius: 3px; overflow: hidden;
  box-shadow: 0 2px 20px rgba(28,26,23,0.08), 0 0 0 1px rgba(28,26,23,0.06);
}
.hm-feature-img {
  display: block; width: 100%; height: auto;
  transition: transform 6s ease;
}
.hm-feature-img-wrap:hover .hm-feature-img {
  transform: scale(1.03);
}

/* ═══════ SECTION 3: EDITIONS ═══════ */
.hm-editions {
  padding: clamp(3rem, 6vw, 5rem) clamp(1.25rem, 4vw, 2.5rem);
  border-top: 1px solid var(--rule-color);
  background:
    radial-gradient(ellipse 120% 80% at 20% 30%, rgba(27,164,196,0.03) 0%, transparent 70%),
    radial-gradient(ellipse 100% 60% at 80% 70%, rgba(139,58,46,0.03) 0%, transparent 60%),
    var(--paper);
}
.hm-editions-head {
  text-align: center; margin-bottom: clamp(2rem, 4vw, 3rem);
}
.hm-editions-sub {
  font-family: var(--font-body, 'EB Garamond'), Georgia, serif;
  font-style: italic; font-size: 1rem;
  color: var(--graphite); margin: 10px 0 0; opacity: 0.6;
}

.hm-gallery {
  display: flex; gap: clamp(1rem, 2vw, 1.5rem);
  overflow-x: auto; scroll-snap-type: x mandatory;
  padding: 1rem 0 2rem;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.hm-gallery::-webkit-scrollbar { display: none; }

.hm-card {
  flex-shrink: 0;
  width: min(220px, 70vw);
  aspect-ratio: 3 / 4.1;
  scroll-snap-align: center;
  text-decoration: none; color: var(--ink);
  display: flex; flex-direction: column;
  background: var(--paper-warm);
  border: 1px solid var(--rule-color);
  border-radius: 3px; overflow: hidden;
  box-shadow:
    0 1px 2px rgba(28,26,23,0.05),
    0 6px 20px rgba(28,26,23,0.07);
  transition: transform 0.45s cubic-bezier(0.22,1,0.36,1), box-shadow 0.45s ease;
}
.hm-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow:
    0 4px 12px rgba(28,26,23,0.1),
    0 18px 40px rgba(28,26,23,0.1);
}

.hm-card-band {
  height: 6px; flex-shrink: 0;
  background: var(--card-accent);
}
.hm-card-body {
  flex: 1; display: flex; flex-direction: column;
  padding: clamp(10px, 2vw, 16px) clamp(10px, 2vw, 14px);
}
.hm-card-num {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 8px; letter-spacing: 0.25em; text-transform: uppercase;
  color: var(--card-accent); opacity: 0.7; margin-bottom: 6px;
}
.hm-card-title {
  font-family: var(--font-display, 'Cormorant Garamond'), Georgia, serif;
  font-style: italic; font-weight: 500;
  font-size: clamp(1.1rem, 0.9rem + 0.7vw, 1.35rem);
  line-height: 1.15; letter-spacing: -0.01em;
  color: var(--ink); margin: 0 0 4px;
}
.hm-card-sub {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 7px; letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--graphite); opacity: 0.5;
}
.hm-card-quote {
  flex: 1; display: flex; align-items: flex-end;
  font-family: var(--font-body, 'EB Garamond'), Georgia, serif;
  font-style: italic;
  font-size: clamp(0.68rem, 0.6rem + 0.25vw, 0.78rem);
  line-height: 1.45; color: var(--graphite);
  margin: 8px 0 0; padding-top: 8px;
  border-top: 1px solid var(--rule-color);
}
.hm-card-foot {
  padding: 5px clamp(10px, 2vw, 14px);
  border-top: 1px solid var(--rule-color);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 7px; letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--graphite); opacity: 0.35;
}

/* ── BRIDGE ── */
.hm-bridge {
  height: clamp(60px, 10vh, 100px);
  background: linear-gradient(to bottom, var(--paper) 0%, var(--dark) 100%);
}

/* ═══════ SECTION 4: THE MAP ═══════ */
.hm-map {
  background: var(--dark);
  padding: clamp(5rem, 10vw, 8rem) clamp(1.25rem, 4vw, 2.5rem);
}
.hm-map-inner {
  max-width: 36rem; margin: 0 auto;
  display: flex; flex-direction: column;
}
.hm-route {
  display: flex; align-items: center; gap: 1rem;
  padding: clamp(1.2rem, 2.5vw, 1.8rem) 0;
  border-bottom: 1px solid rgba(244,239,230,0.06);
  text-decoration: none;
  transition: opacity 0.3s ease;
}
.hm-route:first-child {
  border-top: 1px solid rgba(244,239,230,0.06);
}
.hm-route:hover { opacity: 1 !important; }
.hm-route:hover .hm-route-label { color: rgba(244,239,230,0.95); }
.hm-route:hover .hm-route-desc { opacity: 0.5; }
.hm-route:hover .hm-route-arrow { opacity: 0.8; transform: translateX(4px); }

.hm-route-label {
  font-family: var(--font-display, 'Cormorant Garamond'), Georgia, serif;
  font-style: italic; font-weight: 500;
  font-size: clamp(1.3rem, 1rem + 1.2vw, 1.8rem);
  color: rgba(244,239,230,0.6);
  transition: color 0.3s ease;
  min-width: 10ch;
}
.hm-route-desc {
  font-family: var(--font-body, 'EB Garamond'), Georgia, serif;
  font-size: 0.85rem; color: rgba(244,239,230,0.25);
  transition: opacity 0.3s ease; flex: 1;
}
.hm-route-arrow {
  font-family: var(--font-display, 'Cormorant Garamond'), Georgia, serif;
  font-size: 1.2rem; color: rgba(244,239,230,0.2);
  opacity: 0; transition: opacity 0.3s ease, transform 0.3s ease;
  flex-shrink: 0;
}

/* ═══════ SECTION 5: COLOPHON ═══════ */
.hm-colophon {
  background: var(--dark);
  padding: 0 clamp(1.25rem, 4vw, 2.5rem) clamp(4rem, 8vw, 6rem);
  text-align: center;
}
.hm-col-rule {
  width: min(200px, 50%); height: 1px; margin: 0 auto clamp(3rem, 6vw, 5rem);
  background: linear-gradient(90deg, transparent, rgba(244,239,230,0.12), transparent);
}

.hm-cmiygl {
  font-family: var(--font-display, 'Cormorant Garamond'), Georgia, serif;
  font-style: italic; font-size: clamp(1.3rem, 1rem + 1.5vw, 2rem);
  color: rgba(244,239,230,0.55); margin: 0 0 1.5rem;
  letter-spacing: 0.02em;
}
.hm-rc {
  display: inline-block;
  animation: hm-letter 3s ease-in-out calc(var(--i) * 0.08s) infinite alternate;
}
@keyframes hm-letter {
  0%, 100% { opacity: 0.55; }
  50%      { opacity: 0.9; }
}

.hm-sig {
  font-family: var(--font-display, 'Cormorant Garamond'), Georgia, serif;
  font-style: italic; font-weight: 400;
  font-size: 1.1rem; letter-spacing: 0.1em;
  color: rgba(244,239,230,0.2); margin: 0 0 2rem;
}

.hm-col-details {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.6rem; letter-spacing: 0.08em;
  color: rgba(244,239,230,0.2);
  display: flex; align-items: center; justify-content: center; gap: 8px;
  flex-wrap: wrap;
}
.hm-col-sep { opacity: 0.3; }
.hm-col-link {
  color: rgba(244,239,230,0.3); text-decoration: none;
  transition: color 0.3s ease;
}
.hm-col-link:hover { color: rgba(244,239,230,0.6); }

/* ═══════ RESPONSIVE ═══════ */
@media (max-width: 768px) {
  .hm-feature-spread {
    grid-template-columns: 1fr;
  }
  .hm-feature-img-wrap {
    order: -1;
  }
  .hm-route-desc { display: none; }
  .hm-route-arrow { opacity: 0.3; }
}

@media (max-width: 480px) {
  .hm-wordmark { font-size: clamp(3.5rem, 2.5rem + 6vw, 5rem); }
  .hm-card { width: min(180px, 75vw); }
}

/* ═══════ REDUCED MOTION ═══════ */
@media (prefers-reduced-motion: reduce) {
  .hm-mast-inner { animation: none; opacity: 1; transform: none; }
  .hm-subtitle { animation: none; opacity: 0.7; }
  .hm-scroll-cue span { animation: none; }
  .hm-rc { animation: none; opacity: 0.55; }
  .hm-reveal { transition: none; opacity: 1; transform: none; }
  .hm-feature-img { transition: none; }
}
`;
