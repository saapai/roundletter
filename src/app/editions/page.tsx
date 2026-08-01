"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════
   THE EDITIONS — Spatial Magazine Rack

   Each era of aureliex.com is a magazine issue, scattered
   on a warm paper surface. Click to open, swipe through
   commits as editorial spreads.

   563 commits. 70 days. 6 eras.
   ═══════════════════════════════════════════════════════ */

type Commit = {
  hash: string;
  date: string;
  message: string;
  details?: string;
};

type Era = {
  id: string;
  issue: string;
  title: string;
  subtitle: string;
  dateRange: string;
  accent: string;
  accentLight: string;
  pullQuote: string;
  rotation: number;
  zIndex: number;
  commits: Commit[];
  route?: string;
};

const ERAS: Era[] = [
  {
    id: "round-zero",
    issue: "001",
    title: "Round Zero",
    subtitle: "The Pre-Mortem",
    dateRange: "Apr 14, 2026",
    accent: "#6B6560",
    accentLight: "rgba(107,101,96,0.08)",
    pullQuote: "A satirical birthday party frame for a very serious bet.",
    rotation: -3.2,
    zIndex: 1,
    route: "/letters/round-0",
    commits: [
      { hash: "701676d", date: "Apr 14", message: "Initial public trade log", details: "$3,453.83 entry value. Bare portfolio tracker with satirical pre-mortem hook. The name is bullshit. The product is beautiful." },
      { hash: "e5aedf3", date: "Apr 14", message: "Design pass: responsive typography", details: "Muted hue system, hover-reveal margin notes, per-article view counts. Five-agent editorial pass established the visual language." },
      { hash: "bf3a499", date: "Apr 14", message: "Paradigm article + viral-launch polish", details: "Policy debate judge paradigm repurposed as portfolio framework. View tracking via abacus API. First invitation to watch a retail account in real time." },
    ],
  },
  {
    id: "the-pitch",
    issue: "002",
    title: "The Pitch",
    subtitle: "Password-Gated Manifesto",
    dateRange: "Apr 14 \u2013 22",
    accent: "#8B3A2E",
    accentLight: "rgba(139,58,46,0.07)",
    pullQuote: "let\u2019s cut through the bullshit. together.",
    rotation: 2.1,
    zIndex: 3,
    route: "/pitch",
    commits: [
      { hash: "acac2f2", date: "Apr 14", message: "Launch password-gated pitch deck", details: "9-slide dark-terminal deck. 5-zone gradient flow: dark \u2192 warm-dark \u2192 pivot \u2192 warm-cream \u2192 cream-final. Autoscroll synced to ispy.mp3 (253s)." },
      { hash: "\u2014", date: "Apr 15", message: "Hubble starfield + love recursion", details: "4-point sparkle animation. Fractal love/peace structure on slide 10. Coming-soon poster with chromatic RGB-split motion-blur." },
      { hash: "\u2014", date: "Apr 15", message: "POLYMARKET puzzle integration", details: "Word-level egg links. Title moon. Sealed predictions begin. 180 commits in 8 days of pitch iteration." },
      { hash: "\u2014", date: "Apr 20", message: "Masthead redesign \u2014 Cormorant unified", details: "Dropped monospace clash. Unified wordmark: Cormorant Garamond italic + rust dot. The identity crystallizes." },
      { hash: "\u2014", date: "Apr 21", message: "Sp-001 sealed prediction reveal", details: "Live countdown to auto-reveal at 4:20 PM ET. The first sealed prediction: a public commitment to be judged." },
      { hash: "f134320", date: "Apr 22", message: "Design audit + mobile constraints", details: "Tap targets fixed. Mobile overflow contained. The pitch deck reaches its final form." },
    ],
  },
  {
    id: "the-drafts",
    issue: "003",
    title: "The Drafts",
    subtitle: "Experiments in Space",
    dateRange: "Apr 15 \u2013 May 18",
    accent: "#4A8B8B",
    accentLight: "rgba(74,139,139,0.07)",
    pullQuote: "A pannable multiverse of familiar UIs.",
    rotation: -1.8,
    zIndex: 2,
    route: "/17",
    commits: [
      { hash: "\u2014", date: "Apr 15", message: "Gated ecosystem emerges", details: "/closed (gambling ledger), /17 (quant\u2192artistic trailer), /6969 (credits/wayfinder), /keys (hand-off protocol). All password-gated or unlinked." },
      { hash: "ea5101e", date: "Apr 18", message: "Green credit manifesto", details: "/green-credit: attention-rewards-better-reasoning manifesto. 10-second looped trailer as hook. Sealed prediction sp-001." },
      { hash: "\u2014", date: "May 17", message: "Spatial canvas + auction art", details: "Rebuild /draft as pannable multiverse. Living particle canvas + 5 minimal moments. Auction art piece introduced." },
      { hash: "\u2014", date: "May 18", message: "14 commits in 2.5 hours", details: "Gallery mat frames, CMIYGL poster palette, tearable ticket perforation, per-character coloring. Dark cinema \u2192 warm paper transition. The most intense design sprint." },
      { hash: "\u2014", date: "May 18", message: "4-agent design synthesis", details: "Oil-paint palette in closer. Party section as dark ink on light shaft. Sunset gradient stars. Final polish pass reviewed by four agents." },
    ],
  },
  {
    id: "the-funnel",
    issue: "004",
    title: "The Funnel",
    subtitle: "Chart-First Public Offering",
    dateRange: "Apr 18 \u2013 May 26",
    accent: "#A89A7E",
    accentLight: "rgba(168,154,126,0.08)",
    pullQuote: "No owner. No curator. No fee. No exit.",
    rotation: 3.4,
    zIndex: 4,
    route: "/positions",
    commits: [
      { hash: "2330ecb", date: "Apr 18", message: "V3: chart-first homepage", details: "YouTube-framed PortfolioChart hero. 4 punchy serif manifest lines. BettableOdds component: 8 sealed predictions in the 10\u201390 band." },
      { hash: "\u2014", date: "May 20", message: "View tracking overhaul", details: "All pages tracked. Split slug fix. Archive bug resolved. Scroll-to-bottom engagement tracking." },
      { hash: "\u2014", date: "May 24", message: "Live Kalshi API integration", details: "Prediction market balance pulled directly from Kalshi instead of manual snapshots. Real-time data pipeline established." },
      { hash: "\u2014", date: "May 26", message: "5-agent consensus panel", details: "Bull, Bear, Macro, Flow, Historian. Brier scores for calibration. Non-discretionary kill-switches. The agents start arguing." },
    ],
  },
  {
    id: "the-rocks",
    issue: "005",
    title: "The Rocks",
    subtitle: "Cinematic Materialism",
    dateRange: "May 26 \u2013 Jun 23",
    accent: "#1C1A17",
    accentLight: "rgba(28,26,23,0.06)",
    pullQuote: "probably impossible. definitely public.",
    rotation: -2.4,
    zIndex: 5,
    route: "/home-v9",
    commits: [
      { hash: "3ec9676", date: "May 26", message: "V9: rocks homepage \u2014 the big one", details: "Full-viewport cinematic hero. EEAAO rocks with mouse parallax. Phase system: void \u2192 develop \u2192 revealed \u2192 full. 4-agent design synthesis." },
      { hash: "6cbfe79", date: "May 26", message: "Broadsheet letter + warm palette", details: "The art refund thesis in full. $3,453 \u2192 $100K by birthday. Drop cap in Cormorant. Interactive ticket component: tear, fold, crush, drag." },
      { hash: "3f11934", date: "May 26", message: "Swap V9 to main homepage", details: "aureliex.com now shows the rocks hero. 7 commits in one evening. The most dramatic visual shift in the project's history." },
      { hash: "5b928e7", date: "Jun 5", message: "Shareholder pages go live", details: "Real names, real photos, real-time portfolio value per shareholder. Navya Rawal revealed as anonymous donor." },
      { hash: "dc59230", date: "Jun 2", message: "Entrenched Coils research paper", details: "Epistemic metabolism theory. Crossover theorem. Friston inversion. Full benchmark: EC wins 16/19 on real iMessages." },
      { hash: "1e1a3c8", date: "Jun 23", message: "Disable all workflows \u2014 final commit", details: "GitHub Actions turned off. 563 total commits across 70 days. The V9 era ends. The party was June 20." },
    ],
  },
  {
    id: "the-article",
    issue: "006",
    title: "The Article",
    subtitle: "Editorial Reset",
    dateRange: "Aug 1, 2026 \u2013",
    accent: "#1ba4c4",
    accentLight: "rgba(27,164,196,0.06)",
    pullQuote: "Harm caused by drugs. 100 = maximum.",
    rotation: 1.2,
    zIndex: 6,
    commits: [
      { hash: "\u2014", date: "Aug 1", message: "Article homepage: three sections, one chart", details: "Magazine-editorial article page. Drug harm chart from The Lancet. Three sections with inline editing. Click aureliex. to toggle edit mode." },
      { hash: "\u2014", date: "Aug 1", message: "V9 \u2192 /home-v9, archive conceived", details: "The rocks era preserved at its own route. The spatial edition rack designed by four arguing agents." },
    ],
  },
];

export default function EditionsPage() {
  const [openEra, setOpenEra] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const pagesRef = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setEntered(true));
  }, []);

  useEffect(() => {
    const h = window.location.hash.replace("#", "");
    if (h && ERAS.find((e) => e.id === h)) {
      setOpenEra(h);
    }
  }, []);

  useEffect(() => {
    if (openEra) window.location.hash = openEra;
    else if (typeof window !== "undefined") history.replaceState(null, "", window.location.pathname);
  }, [openEra]);

  const openIssue = useCallback((id: string) => {
    setPageIndex(0);
    setOpenEra(id);
  }, []);

  const closeIssue = useCallback(() => setOpenEra(null), []);

  const currentEra = ERAS.find((e) => e.id === openEra);

  useEffect(() => {
    if (!currentEra) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") closeIssue();
      if (e.key === "ArrowRight" || e.key === "j") setPageIndex((i) => Math.min(i + 1, currentEra.commits.length - 1));
      if (e.key === "ArrowLeft" || e.key === "k") setPageIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentEra, closeIssue]);

  useEffect(() => {
    const el = pagesRef.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / el.clientWidth);
      setPageIndex(idx);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [openEra]);

  useEffect(() => {
    const el = pagesRef.current;
    if (!el) return;
    el.scrollTo({ left: pageIndex * el.clientWidth, behavior: "smooth" });
  }, [pageIndex]);

  return (
    <div className="ed">
      <style>{CSS}</style>

      <header className="ed-header">
        <Link href="/" className="ed-back">&larr; cover</Link>
        <span className="ed-eyebrow">aureliex.com</span>
        <h1 className="ed-title">The Editions</h1>
        <p className="ed-sub">563 commits &middot; 70 days &middot; 6 eras &middot; every version of the thing.</p>
        <div className="ed-rule" />
      </header>

      <div className={`ed-rack ${entered ? "ed-entered" : ""}`}>
        <div className="ed-grain" />
        <div className="ed-grid">
          {ERAS.map((era, i) => (
            <button
              key={era.id}
              className={`ed-issue ${openEra ? "ed-issue--dim" : ""}`}
              style={{
                "--rot": `${era.rotation}deg`,
                "--z": era.zIndex,
                "--delay": `${i * 0.09}s`,
                "--accent": era.accent,
                "--accent-light": era.accentLight,
              } as React.CSSProperties}
              onClick={() => openIssue(era.id)}
            >
              <div className="ed-cover">
                <div className="ed-band" />
                <div className="ed-cover-body">
                  <span className="ed-inum">No. {era.issue}</span>
                  <h2 className="ed-ititle">{era.title}</h2>
                  <span className="ed-isub">{era.subtitle}</span>
                  <p className="ed-iquote">&ldquo;{era.pullQuote}&rdquo;</p>
                </div>
                <div className="ed-cover-foot">
                  <span>{era.dateRange}</span>
                  <span>{era.commits.length} changes</span>
                </div>
                <div className="ed-cover-brand"><span>aureliex.</span></div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── VIEWER ── */}
      {currentEra && (
        <div className="vw" onClick={(e) => { if (e.target === e.currentTarget) closeIssue(); }}>
          <div className="vw-issue" style={{ "--accent": currentEra.accent } as React.CSSProperties}>
            <div className="vw-spine" />
            <div className="vw-head">
              <div>
                <span className="vw-inum">Issue {currentEra.issue}</span>
                <h2 className="vw-title">{currentEra.title}</h2>
                <span className="vw-sub">{currentEra.subtitle} &middot; {currentEra.dateRange}</span>
              </div>
              <button className="vw-close" onClick={closeIssue}>&times;</button>
            </div>

            <div className="vw-pages" ref={pagesRef}>
              {currentEra.commits.map((c, ci) => (
                <article key={ci} className="vw-page">
                  <div className="vw-folio">
                    <span className="vw-pnum">{String(ci + 1).padStart(2, "0")}</span>
                    <span className="vw-pdate">{c.date}</span>
                  </div>
                  <div className="vw-pcontent">
                    <h3 className="vw-phead">{c.message}</h3>
                    {c.details && <p className="vw-pbody">{c.details}</p>}
                  </div>
                  <span className="vw-phash">{c.hash}</span>
                </article>
              ))}
            </div>

            <div className="vw-nav">
              {currentEra.commits.map((_, ci) => (
                <button
                  key={ci}
                  className={`vw-dot ${ci === pageIndex ? "vw-dot--on" : ""}`}
                  onClick={() => setPageIndex(ci)}
                />
              ))}
              {currentEra.route && (
                <Link href={currentEra.route} className="vw-visit">visit &rarr;</Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const CSS = `
/* ── TOKENS ── */
.ed {
  --paper: #F4EFE6;
  --ink: #1C1A17;
  --graphite: #6B6560;
  --rust: #8B3A2E;
  --rule: rgba(28,26,23,0.14);
  min-height: 100vh;
  background: var(--paper);
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  font-feature-settings: "liga" 1, "kern" 1;
}

/* ── HEADER ── */
.ed-header {
  text-align: center;
  padding: clamp(2.5rem, 6vw, 5rem) clamp(1.25rem, 4vw, 2rem) clamp(1rem, 2vw, 1.5rem);
  position: relative;
}
.ed-back {
  position: absolute;
  top: clamp(1rem, 2.5vw, 1.5rem);
  left: clamp(1.25rem, 4vw, 2rem);
  font-family: var(--font-body, 'EB Garamond'), Georgia, serif;
  font-style: italic;
  font-size: 0.85rem;
  color: var(--graphite);
  text-decoration: none;
  opacity: 0.5;
  transition: opacity 0.2s;
}
.ed-back:hover { opacity: 0.9; }
.ed-eyebrow {
  display: block;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 9px; letter-spacing: 0.35em; text-transform: uppercase;
  color: var(--graphite); opacity: 0.4; margin-bottom: 14px;
}
.ed-title {
  font-family: var(--font-display, 'Cormorant Garamond'), Georgia, serif;
  font-style: italic; font-weight: 400;
  font-size: clamp(2.6rem, 2rem + 3.5vw, 4.5rem);
  letter-spacing: -0.02em; line-height: 1.05; margin: 0 0 10px;
}
.ed-sub {
  font-family: var(--font-body, 'EB Garamond'), Georgia, serif;
  font-style: italic; font-size: 0.95rem; color: var(--graphite); margin: 0 0 clamp(1rem, 2vw, 1.5rem);
}
.ed-rule {
  width: 60px; height: 2px; margin: 0 auto;
  background: linear-gradient(90deg, transparent, var(--ink), transparent);
  opacity: 0.15;
}

/* ── RACK ── */
.ed-rack {
  position: relative;
  max-width: 1060px;
  margin: 0 auto;
  padding: clamp(2rem, 4vw, 4rem) clamp(1rem, 3vw, 2.5rem) clamp(6rem, 12vw, 10rem);
}
.ed-grain {
  position: absolute; inset: 0; pointer-events: none;
  opacity: 0.03; mix-blend-mode: multiply;
  background-image:
    radial-gradient(rgba(28,26,23,0.5) 1px, transparent 1px),
    radial-gradient(rgba(28,26,23,0.3) 1px, transparent 1px);
  background-size: 3px 3px, 5px 5px; background-position: 0 0, 2px 2px;
}

/* ── GRID ── */
.ed-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(2rem, 4vw, 3rem);
  justify-items: center;
  position: relative; z-index: 1;
}

/* ── ISSUE BUTTON ── */
.ed-issue {
  all: unset; cursor: pointer; display: block;
  width: min(210px, 100%); aspect-ratio: 3 / 4.1;
  position: relative; z-index: var(--z);
  transform: rotate(var(--rot));
  transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
              opacity 0.35s ease, box-shadow 0.4s ease;
  opacity: 0;
}
.ed-entered .ed-issue {
  animation: ed-drop 0.65s cubic-bezier(0.22, 1, 0.36, 1) var(--delay) both;
}
@keyframes ed-drop {
  from { opacity: 0; transform: rotate(var(--rot)) translateY(-24px) scale(0.93); }
  to   { opacity: 1; transform: rotate(var(--rot)) translateY(0) scale(1); }
}
.ed-issue:hover {
  transform: rotate(var(--rot)) translateY(-12px) scale(1.04);
  z-index: 30;
}
.ed-issue--dim { opacity: 0.1 !important; pointer-events: none; }

/* ── COVER ── */
.ed-cover {
  width: 100%; height: 100%;
  background: var(--paper);
  border: 1px solid var(--rule);
  border-radius: 3px;
  display: flex; flex-direction: column; overflow: hidden;
  box-shadow:
    0 1px 2px rgba(28,26,23,0.06),
    0 6px 20px rgba(28,26,23,0.09),
    0 18px 44px rgba(28,26,23,0.05);
  transition: box-shadow 0.4s ease;
}
.ed-issue:hover .ed-cover {
  box-shadow:
    0 2px 6px rgba(28,26,23,0.10),
    0 14px 36px rgba(28,26,23,0.13),
    0 28px 56px rgba(28,26,23,0.07);
}
.ed-band {
  height: 7px; flex-shrink: 0;
  background: var(--accent);
}
.ed-cover-body {
  flex: 1; display: flex; flex-direction: column;
  padding: clamp(10px, 2vw, 16px) clamp(10px, 2vw, 14px);
  background: var(--accent-light);
}
.ed-inum {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 8px; letter-spacing: 0.25em; text-transform: uppercase;
  color: var(--accent); margin-bottom: 6px; opacity: 0.7;
}
.ed-ititle {
  font-family: var(--font-display, 'Cormorant Garamond'), Georgia, serif;
  font-style: italic; font-weight: 500;
  font-size: clamp(1.1rem, 0.9rem + 0.8vw, 1.4rem);
  line-height: 1.15; letter-spacing: -0.01em;
  color: var(--ink); margin: 0 0 3px;
}
.ed-isub {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 7.5px; letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--graphite); opacity: 0.55;
}
.ed-iquote {
  flex: 1; display: flex; align-items: flex-end;
  font-family: var(--font-body, 'EB Garamond'), Georgia, serif;
  font-style: italic;
  font-size: clamp(0.68rem, 0.6rem + 0.25vw, 0.78rem);
  line-height: 1.45; color: var(--graphite);
  margin: 8px 0 0; padding-top: 8px;
  border-top: 1px solid var(--rule);
}
.ed-cover-foot {
  display: flex; justify-content: space-between;
  padding: 5px clamp(10px, 2vw, 14px);
  border-top: 1px solid var(--rule);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 7px; letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--graphite); opacity: 0.35;
}
.ed-cover-brand {
  padding: 4px clamp(10px, 2vw, 14px) 6px;
  text-align: center; border-top: 1px solid var(--rule);
}
.ed-cover-brand span {
  font-family: var(--font-display, 'Cormorant Garamond'), Georgia, serif;
  font-style: italic; font-size: 0.65rem; color: var(--graphite); opacity: 0.22;
  letter-spacing: 0.1em;
}

/* ── VIEWER ── */
.vw {
  position: fixed; inset: 0; z-index: 100;
  display: flex; align-items: center; justify-content: center;
  background: rgba(28,26,23,0.5);
  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
  animation: vw-in 0.3s ease both;
  padding: clamp(0.75rem, 2vw, 1.5rem);
}
@keyframes vw-in { from { opacity: 0; } to { opacity: 1; } }

.vw-issue {
  position: relative;
  width: min(880px, 94vw); max-height: 88vh;
  background: var(--paper); border-radius: 4px; overflow: hidden;
  display: flex; flex-direction: column;
  box-shadow: 0 4px 24px rgba(28,26,23,0.14), 0 20px 56px rgba(28,26,23,0.10);
  animation: vw-open 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes vw-open {
  from { opacity: 0; transform: scale(0.9) translateY(24px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.vw-spine {
  position: absolute; top: 0; left: 0; bottom: 0; width: 5px;
  background: var(--accent); z-index: 2;
}

.vw-head {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: clamp(1rem, 2.5vw, 1.75rem) clamp(1.25rem, 2.5vw, 2rem);
  padding-left: clamp(1.5rem, 3vw, 2.5rem);
  border-bottom: 1px solid var(--rule); flex-shrink: 0;
}
.vw-inum {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 9px; letter-spacing: 0.25em; text-transform: uppercase;
  color: var(--accent); opacity: 0.6; display: block; margin-bottom: 3px;
}
.vw-title {
  font-family: var(--font-display, 'Cormorant Garamond'), Georgia, serif;
  font-style: italic; font-weight: 500;
  font-size: clamp(1.5rem, 1.2rem + 1.3vw, 2.2rem);
  line-height: 1.15; color: var(--ink); margin: 0 0 4px;
}
.vw-sub {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--graphite); opacity: 0.45;
}
.vw-close {
  all: unset; cursor: pointer; font-size: 1.8rem; color: var(--graphite);
  opacity: 0.35; transition: opacity 0.2s, transform 0.2s; line-height: 1; padding: 4px;
}
.vw-close:hover { opacity: 0.8; transform: scale(1.1); }

/* ── PAGES ── */
.vw-pages {
  flex: 1; display: flex; overflow-x: auto; overflow-y: hidden;
  scroll-snap-type: x mandatory; scrollbar-width: none;
}
.vw-pages::-webkit-scrollbar { display: none; }
.vw-page {
  min-width: 100%; flex-shrink: 0; scroll-snap-align: center;
  display: flex; flex-direction: column; position: relative;
  padding: clamp(1.5rem, 3vw, 3rem) clamp(1.25rem, 2.5vw, 2rem);
  padding-left: clamp(3rem, 5vw, 4.5rem);
}
.vw-folio {
  position: absolute;
  left: clamp(0.75rem, 1.5vw, 1.25rem);
  top: clamp(1.5rem, 3vw, 3rem);
  display: flex; flex-direction: column; align-items: center; gap: 4px;
}
.vw-pnum {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 10px; font-weight: 600; letter-spacing: 0.06em; color: var(--ink); opacity: 0.25;
}
.vw-pdate {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 8px; letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--graphite); opacity: 0.35;
  writing-mode: vertical-lr; transform: rotate(180deg); white-space: nowrap;
}
.vw-pcontent {
  flex: 1; display: flex; flex-direction: column; justify-content: center;
  max-width: 36rem;
}
.vw-phead {
  font-family: var(--font-display, 'Cormorant Garamond'), Georgia, serif;
  font-style: italic; font-weight: 500;
  font-size: clamp(1.2rem, 1rem + 1vw, 1.8rem);
  line-height: 1.3; color: var(--ink); margin: 0 0 clamp(0.6rem, 1.2vw, 1rem);
}
.vw-pbody {
  font-family: var(--font-body, 'EB Garamond'), Georgia, serif;
  font-size: clamp(0.9rem, 0.82rem + 0.35vw, 1.05rem);
  line-height: 1.75; color: var(--graphite); margin: 0;
}
.vw-phash {
  position: absolute;
  bottom: clamp(0.75rem, 1.5vw, 1.25rem);
  right: clamp(1.25rem, 2.5vw, 2rem);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 9px; letter-spacing: 0.04em; color: var(--graphite); opacity: 0.18;
}

/* ── NAV ── */
.vw-nav {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: clamp(0.6rem, 1.2vw, 1rem);
  border-top: 1px solid var(--rule); flex-shrink: 0;
}
.vw-dot {
  all: unset; cursor: pointer;
  width: 7px; height: 7px; border: 1.5px solid var(--rule); border-radius: 1px;
  transition: background 0.2s, border-color 0.2s;
}
.vw-dot--on { background: var(--ink); border-color: var(--ink); }
.vw-dot:hover { border-color: var(--graphite); }
.vw-visit {
  margin-left: auto;
  font-family: var(--font-body, 'EB Garamond'), Georgia, serif;
  font-style: italic; font-size: 0.8rem; color: var(--accent);
  text-decoration: none; opacity: 0.6; transition: opacity 0.2s;
}
.vw-visit:hover { opacity: 1; }

/* ── RESPONSIVE ── */
@media (max-width: 768px) {
  .ed-grid { grid-template-columns: repeat(2, 1fr); gap: clamp(1.25rem, 3vw, 2rem); }
  .ed-issue { width: min(175px, 100%); }
  .vw-issue { width: 97vw; max-height: 94vh; }
}
@media (max-width: 480px) {
  .ed-grid { grid-template-columns: repeat(2, 1fr); gap: 1rem; }
  .ed-issue { width: 100%; transform: rotate(0deg) !important; }
  .vw-page { padding-left: clamp(2.2rem, 4vw, 3rem); }
  .vw-folio { left: 0.4rem; }
  .vw-pdate { font-size: 7px; }
}

/* ── REDUCED MOTION ── */
@media (prefers-reduced-motion: reduce) {
  .ed-issue { transition: none; animation: none !important; opacity: 1; }
  .vw { animation: none; }
  .vw-issue { animation: none; }
  .vw-pages { scroll-behavior: auto; }
}
`;
