"use client";

import { useState, useRef, useEffect, useCallback } from "react";

/* ── helpers ── */
function fmtCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}

function daysUntil(target: string) {
  const diff = new Date(target).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

/* ── Component ── */
export default function DraftPage() {
  const [noiseReady, setNoiseReady] = useState(false);
  const [signalVisible, setSignalVisible] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [bidAmount, setBidAmount] = useState(25);
  const [showBidConfirm, setShowBidConfirm] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);
  const noiseRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  const countdown = daysUntil("2026-06-21");

  // TV static noise
  useEffect(() => {
    const canvas = noiseRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 200;
    canvas.height = 120;
    let raf: number;
    let frame = 0;

    const draw = () => {
      const img = ctx.createImageData(canvas.width, canvas.height);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 255;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 40;
      }
      ctx.putImageData(img, 0, 0);
      frame++;
      raf = requestAnimationFrame(draw);
    };

    setNoiseReady(true);
    draw();

    const timer = setTimeout(() => setSignalVisible(true), 800);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, []);

  // Intersection observer for active section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = sectionRefs.current.indexOf(entry.target as HTMLElement);
            if (idx >= 0) setActiveSection(idx);
          }
        });
      },
      { threshold: 0.5 }
    );

    sectionRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (idx: number) => {
    sectionRefs.current[idx]?.scrollIntoView({ behavior: "smooth" });
  };

  const setRef = (idx: number) => (el: HTMLElement | null) => {
    sectionRefs.current[idx] = el;
  };

  return (
    <div className="draft" ref={scrollRef}>
      <style>{css}</style>

      {/* ── progress dots ── */}
      <nav className="draft-nav" aria-label="sections">
        {["signal", "channel", "wager", "auction", "party", "stake", "doors"].map((label, i) => (
          <button
            key={label}
            className={`draft-dot ${activeSection === i ? "active" : ""}`}
            onClick={() => scrollTo(i)}
            aria-label={label}
          >
            <span className="draft-dot-pip" />
          </button>
        ))}
      </nav>

      {/* ═══════ 1. NOISE → SIGNAL ═══════ */}
      <section className="s s-signal" ref={setRef(0)}>
        <canvas ref={noiseRef} className="noise-canvas" />
        <div className={`signal-text ${signalVisible ? "on" : ""}`}>
          <p className="signal-line">you&rsquo;ve seen this before.</p>
          <p className="signal-line signal-delay-1">the interface. the layout. the font.</p>
          <p className="signal-line signal-delay-2">familiarity is a shortcut to trust.</p>
          <p className="signal-line signal-delay-3 signal-accent">
            so what happens when you wrap a portfolio<br />inside something people already know?
          </p>
        </div>
        <button className="signal-scroll" onClick={() => scrollTo(1)}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </button>
      </section>

      {/* ═══════ 2. THE CHANNEL ═══════ */}
      <section className="s s-channel" ref={setRef(1)}>
        <div className="channel-chrome">
          <div className="channel-topbar">
            <svg viewBox="0 0 90 20" width="72" height="16" className="channel-logo">
              <rect x="0" y="0" width="22" height="16" rx="3" fill="#ff0000" />
              <polygon points="8,3 8,13 16,8" fill="#fff" />
              <text x="26" y="12" fill="#fff" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="11">YouTube</text>
            </svg>
          </div>
          <div className="channel-player">
            {videoStarted ? (
              <iframe
                src="https://www.youtube.com/embed/DPIoje1nfCQ?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3"
                className="channel-iframe"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                title="Telling the Same Joke Over and Over"
              />
            ) : (
              <div className="channel-poster" onClick={() => setVideoStarted(true)}>
                <img src="https://i.ytimg.com/vi/DPIoje1nfCQ/maxresdefault.jpg" alt="" className="channel-poster-img" />
                <button className="channel-play" aria-label="Play">
                  <svg viewBox="0 0 68 48" width="68" height="48">
                    <path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="#f00"/>
                    <path d="M27 34l17-10-17-10z" fill="#fff"/>
                  </svg>
                </button>
              </div>
            )}
          </div>
          <div className="channel-meta">
            <h2 className="channel-title">Telling the Same Joke Over and Over and Over and Over</h2>
            <div className="channel-info">
              <span className="channel-ch">Aaron Westberry</span>
              <span className="channel-views">2.8M views · Apr 28, 2025</span>
            </div>
          </div>
        </div>
        <p className="channel-aside">
          repetition creates familiarity.<br />
          familiarity creates trust.<br />
          <em>trust is the product.</em>
        </p>
      </section>

      {/* ═══════ 3. THE WAGER ═══════ */}
      <section className="s s-wager" ref={setRef(2)}>
        <div className="wager-eyebrow">the wager · live</div>
        <h1 className="wager-amount">$3,453 → $100,000</h1>
        <p className="wager-deadline">by my 20th birthday · June 21, 2026</p>
        <div className="wager-countdown">
          <div className="wager-count-num">{countdown}</div>
          <div className="wager-count-label">days left</div>
        </div>
        <div className="wager-stats">
          <div className="wager-stat">
            <span className="wager-stat-val">0.000000%</span>
            <span className="wager-stat-label">Monte Carlo P(success)</span>
          </div>
          <div className="wager-stat">
            <span className="wager-stat-val">5</span>
            <span className="wager-stat-label">AI agents per trade</span>
          </div>
          <div className="wager-stat">
            <span className="wager-stat-val">$4,519</span>
            <span className="wager-stat-label">current value</span>
          </div>
        </div>
        <blockquote className="wager-quote">
          The odds are the honesty. The bet is the product.<br />
          <em>Either way, you watched.</em>
        </blockquote>
        <a href="https://aureliex.com" className="wager-link" target="_blank" rel="noopener noreferrer">
          aureliex.com — live portfolio →
        </a>
      </section>

      {/* ═══════ 4. THE AUCTION ═══════ */}
      <section className="s s-auction" ref={setRef(3)}>
        <div className="auction-eyebrow">lot 001 · live auction</div>
        <div className="auction-layout">
          <div className="auction-image">
            <img src="/art/tarantula-full.jpg" alt="The Tarantula — graphite on bristol" />
            <div className="auction-badge">● LIVE</div>
          </div>
          <div className="auction-details">
            <h2 className="auction-title">The Tarantula</h2>
            <p className="auction-medium">Graphite on Bristol board · 18×24 in · Signed</p>
            <div className="auction-rule" />
            <div className="auction-row">
              <span>Opening bid</span>
              <span className="auction-price">$25</span>
            </div>
            <div className="auction-row">
              <span>Backed by</span>
              <span className="auction-backing">10% of portfolio NAV</span>
            </div>
            <div className="auction-rule" />
            <p className="auction-explain">
              The winning bidder receives the original artwork <em>plus</em> a guaranteed cashout
              worth 10% of the aureliex portfolio value on June 21, 2026.
            </p>
            <p className="auction-math">
              If portfolio = $10,000 → backing = $1,000<br />
              If portfolio = $100,000 → backing = $10,000
            </p>
            <p className="auction-thesis">
              <em>The auction price is your bet on where the portfolio lands.</em>
            </p>
            <div className="auction-bid-area">
              <div className="auction-bid-input">
                <span className="auction-dollar">$</span>
                <input
                  type="number"
                  min={25}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(Math.max(25, parseInt(e.target.value) || 25))}
                  className="auction-input"
                />
              </div>
              <button className="auction-btn" onClick={() => setShowBidConfirm(true)}>
                Place Bid
              </button>
            </div>
            {showBidConfirm && (
              <div className="auction-confirm">
                Auction opens June 1. You&rsquo;ll be notified.
                <button onClick={() => setShowBidConfirm(false)}>✕</button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════ 5. THE PARTY ═══════ */}
      <section className="s s-party" ref={setRef(4)}>
        <div className="party-pass">
          <div className="party-left">
            <div className="party-airline">AURELIEX</div>
            <div className="party-route">
              <div className="party-col">
                <span className="party-label">FROM</span>
                <span className="party-city">NOW</span>
              </div>
              <div className="party-arrow">
                <svg viewBox="0 0 100 20" width="80" height="16">
                  <line x1="0" y1="10" x2="85" y2="10" stroke="currentColor" strokeWidth="1" strokeDasharray="4 3" />
                  <polygon points="85,5 95,10 85,15" fill="currentColor" />
                </svg>
              </div>
              <div className="party-col">
                <span className="party-label">TO</span>
                <span className="party-city">JUN 21</span>
              </div>
            </div>
            <div className="party-grid">
              <div className="party-col">
                <span className="party-label">EVENT</span>
                <span className="party-val">20th Birthday</span>
              </div>
              <div className="party-col">
                <span className="party-label">LOCATION</span>
                <span className="party-val">Utah</span>
              </div>
              <div className="party-col">
                <span className="party-label">TYPE</span>
                <span className="party-val">Liquidity Event</span>
              </div>
            </div>
            <div className="party-rule" />
            <div className="party-terms">
              <p><strong>10% of portfolio value</strong> is the dividend pool.</p>
              <p>Withdrawable at the party, or reinvestable into Q3.</p>
              <p>Flight compensation covered by the pool.</p>
            </div>
          </div>
          <div className="party-tear">
            <div className="party-tear-hole party-tear-top" />
            <div className="party-tear-line" />
            <div className="party-tear-hole party-tear-bottom" />
          </div>
          <div className="party-right">
            <div className="party-barcode">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="party-bar" style={{ height: `${12 + ((i * 7 + 3) % 19)}px` }} />
              ))}
            </div>
            <div className="party-seat">DIVIDEND<br />PASS</div>
          </div>
        </div>
        <p className="party-footnote">
          the party is the liquidity event.
        </p>
      </section>

      {/* ═══════ 6. THE STAKE ═══════ */}
      <section className="s s-stake" ref={setRef(5)}>
        <div className="stake-eyebrow">investment · cap table</div>
        <h2 className="stake-title">How the stake works</h2>
        <div className="stake-grid">
          <div className="stake-card">
            <div className="stake-card-icon">⏱</div>
            <h3>Earliness × Size</h3>
            <p>
              Your stake is proportional to <em>when</em> you invest and <em>how much</em>.
              Earlier money earns a higher multiplier. The cap table rewards conviction, not just capital.
            </p>
          </div>
          <div className="stake-card">
            <div className="stake-card-icon">💰</div>
            <h3>$100 invested externally</h3>
            <p>
              External capital invested into the portfolio. Tracked on the ledger,
              visible on aureliex.com/invest. Every dollar accounted for.
            </p>
          </div>
          <div className="stake-card">
            <div className="stake-card-icon">🥚</div>
            <h3>$66 gifted as easter eggs</h3>
            <p>
              Hidden across the site. Found by paying attention.
              Long-press the wordmark. Type &ldquo;PARTY&rdquo;.
              Click the ornament five times in two seconds.
              The attention is the labor.
            </p>
          </div>
        </div>
        <div className="stake-totals">
          <div className="stake-total-row">
            <span>External investment</span>
            <span className="stake-total-val">$100.00</span>
          </div>
          <div className="stake-total-row">
            <span>Easter egg rewards</span>
            <span className="stake-total-val">$66.00</span>
          </div>
          <div className="stake-total-row stake-total-final">
            <span>Total outside capital</span>
            <span className="stake-total-val">$166.00</span>
          </div>
        </div>
        <p className="stake-note">
          Stake is settled on June 21. Proportional to earliness × size.<br />
          <em>The earlier you believed, the more it&rsquo;s worth.</em>
        </p>
      </section>

      {/* ═══════ 7. THE DOORS ═══════ */}
      <section className="s s-doors" ref={setRef(6)}>
        <div className="doors-eyebrow">departures · all times live</div>
        <h2 className="doors-title">aureliex</h2>
        <div className="doors-board">
          {[
            { route: "/", label: "the cover", status: "live", desc: "portfolio + thesis" },
            { route: "/argument", label: "the argument", status: "live", desc: "5 agents, 1 question, daily" },
            { route: "/positions", label: "the positions", status: "live", desc: "holdings + P&L" },
            { route: "/letters/round-0", label: "round 0", status: "published", desc: "the pre-mortem" },
            { route: "/about-the-method", label: "the method", status: "published", desc: "panel, scoring, kill-switches" },
            { route: "/art", label: "twelve plates", status: "live", desc: "salon wall · opening bids" },
            { route: "/green-credit", label: "green credit", status: "published", desc: "project 2 · the manifesto" },
            { route: "/archive", label: "the archive", status: "live", desc: "the rest of the magazine" },
            { route: "/statement", label: "the statement", status: "published", desc: "saathvikpai.com" },
          ].map((door) => (
            <a key={door.route} href={`https://aureliex.com${door.route}`} className="door-row" target="_blank" rel="noopener noreferrer">
              <span className="door-route">{door.route}</span>
              <span className="door-label">{door.label}</span>
              <span className="door-desc">{door.desc}</span>
              <span className={`door-status door-${door.status}`}>{door.status}</span>
            </a>
          ))}
        </div>
        <div className="doors-footer">
          <p>attention is what matters the most.</p>
        </div>
      </section>
    </div>
  );
}

/* ── styles ── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=JetBrains+Mono:wght@400;500&display=swap');

  .draft {
    --paper: #F4EFE6;
    --ink: #1C1A17;
    --graphite: #6B6560;
    --rust: #8B3A2E;
    --shadow-blue: #3E4852;
    --rule: rgba(28,26,23,0.22);
    --gold: #C9A84C;

    height: 100vh;
    overflow-y: auto;
    scroll-snap-type: y mandatory;
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
  }
  .draft *, .draft *::before, .draft *::after { box-sizing: border-box; margin: 0; }
  .draft button, .draft input { font-family: inherit; }

  .s {
    min-height: 100svh;
    scroll-snap-align: start;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 40px 24px;
    position: relative;
  }

  /* ── NAV DOTS ── */
  .draft-nav {
    position: fixed; right: 20px; top: 50%;
    transform: translateY(-50%); z-index: 100;
    display: flex; flex-direction: column; gap: 12px;
  }
  .draft-dot {
    width: 24px; height: 24px;
    background: none; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    padding: 0;
  }
  .draft-dot-pip {
    width: 6px; height: 6px; border-radius: 50%;
    background: rgba(255,255,255,0.2);
    transition: all 0.3s ease;
  }
  .draft-dot.active .draft-dot-pip {
    width: 8px; height: 8px;
    background: var(--rust);
    box-shadow: 0 0 8px rgba(139,58,46,0.5);
  }

  /* ═══ 1. SIGNAL ═══ */
  .s-signal {
    background: #000; color: #fff;
    font-family: 'EB Garamond', Georgia, serif;
    overflow: hidden;
  }
  .noise-canvas {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    object-fit: cover; opacity: 0.15;
    image-rendering: pixelated;
  }
  .signal-text {
    position: relative; z-index: 1;
    text-align: center; max-width: 520px;
  }
  .signal-line {
    font-size: clamp(18px, 2.5vw, 24px);
    font-weight: 400; line-height: 1.7;
    opacity: 0; transform: translateY(8px);
    transition: opacity 0.8s ease, transform 0.8s ease;
    font-style: italic;
    color: rgba(255,255,255,0.7);
  }
  .signal-text.on .signal-line {
    opacity: 1; transform: translateY(0);
  }
  .signal-delay-1 { transition-delay: 1.2s; }
  .signal-delay-2 { transition-delay: 2.4s; }
  .signal-delay-3 { transition-delay: 4s; }
  .signal-accent {
    font-style: normal; font-weight: 500;
    color: rgba(255,255,255,0.95);
    margin-top: 16px;
  }
  .signal-scroll {
    position: absolute; bottom: 32px;
    background: none; border: none; color: rgba(255,255,255,0.2);
    cursor: pointer; animation: signal-bob 2s ease infinite;
    animation-delay: 6s;
    opacity: 0; animation-fill-mode: forwards;
  }
  @keyframes signal-bob {
    0% { opacity: 0; }
    10% { opacity: 1; }
    50% { transform: translateY(6px); opacity: 1; }
    100% { transform: translateY(0); opacity: 1; }
  }

  /* ═══ 2. CHANNEL ═══ */
  .s-channel {
    background: #0f0f0f; color: #f1f1f1;
    font-family: 'Roboto', Arial, sans-serif;
    gap: 24px;
  }
  .channel-chrome {
    width: 100%; max-width: 800px;
    background: #0f0f0f; border-radius: 12px;
    overflow: hidden;
  }
  .channel-topbar {
    padding: 12px 16px;
    display: flex; align-items: center;
  }
  .channel-player {
    width: 100%; aspect-ratio: 16/9;
    background: #000; position: relative;
  }
  .channel-iframe {
    width: 100%; height: 100%; border: none;
  }
  .channel-poster {
    width: 100%; height: 100%; cursor: pointer;
    position: relative;
  }
  .channel-poster-img {
    width: 100%; height: 100%; object-fit: cover;
  }
  .channel-play {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    background: none; border: none; cursor: pointer;
  }
  .channel-play svg { opacity: 0.85; }
  .channel-poster:hover .channel-play svg { opacity: 1; }
  .channel-meta { padding: 16px; }
  .channel-title {
    font-size: 18px; font-weight: 600;
    margin: 0 0 8px; line-height: 1.3;
  }
  .channel-info {
    display: flex; gap: 8px; font-size: 13px; color: #aaa;
  }
  .channel-ch { font-weight: 500; color: #f1f1f1; }
  .channel-aside {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 16px; line-height: 1.8;
    color: rgba(255,255,255,0.35);
    text-align: center;
    font-style: italic;
  }
  .channel-aside em {
    color: rgba(255,255,255,0.6);
    font-style: normal;
  }

  /* ═══ 3. WAGER ═══ */
  .s-wager {
    background: var(--paper); color: var(--ink);
    font-family: 'EB Garamond', Georgia, serif;
    gap: 16px;
  }
  .wager-eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px; text-transform: uppercase;
    letter-spacing: 0.2em; color: var(--graphite);
  }
  .wager-amount {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: clamp(36px, 7vw, 72px);
    font-weight: 300; letter-spacing: -0.02em;
    line-height: 1.1;
  }
  .wager-deadline {
    font-size: 18px; color: var(--graphite);
    font-style: italic;
  }
  .wager-countdown {
    display: flex; flex-direction: column;
    align-items: center; gap: 4px;
    margin: 8px 0;
  }
  .wager-count-num {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 56px; font-weight: 300;
    color: var(--rust); line-height: 1;
  }
  .wager-count-label {
    font-size: 12px; color: var(--graphite);
    text-transform: uppercase; letter-spacing: 0.15em;
    font-family: 'JetBrains Mono', monospace;
  }
  .wager-stats {
    display: flex; gap: 32px; margin: 16px 0;
    flex-wrap: wrap; justify-content: center;
  }
  .wager-stat { text-align: center; }
  .wager-stat-val {
    display: block; font-size: 22px; font-weight: 500;
    font-family: 'JetBrains Mono', monospace;
  }
  .wager-stat-label {
    display: block; font-size: 12px; color: var(--graphite);
    margin-top: 4px;
    font-family: 'JetBrains Mono', monospace;
    text-transform: uppercase; letter-spacing: 0.1em;
  }
  .wager-quote {
    max-width: 480px; text-align: center;
    font-size: 18px; font-style: italic;
    color: var(--graphite); line-height: 1.6;
    border-left: 2px solid var(--rust);
    padding-left: 20px; margin: 8px 0;
    text-align: left;
  }
  .wager-quote em { font-style: normal; color: var(--ink); }
  .wager-link {
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px; color: var(--rust);
    text-decoration: none; letter-spacing: 0.05em;
    border-bottom: 1px solid transparent;
    transition: border-color 0.2s;
  }
  .wager-link:hover { border-color: var(--rust); }

  /* ═══ 4. AUCTION ═══ */
  .s-auction {
    background: #0a0a0a; color: #e8e4dc;
    font-family: 'EB Garamond', Georgia, serif;
    gap: 20px;
  }
  .auction-eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px; text-transform: uppercase;
    letter-spacing: 0.2em; color: #666;
  }
  .auction-layout {
    display: flex; gap: 40px; max-width: 900px;
    width: 100%; align-items: flex-start;
    flex-wrap: wrap;
  }
  .auction-image {
    flex: 1; min-width: 280px; max-width: 400px;
    position: relative; border-radius: 4px; overflow: hidden;
  }
  .auction-image img { width: 100%; display: block; }
  .auction-badge {
    position: absolute; top: 12px; right: 12px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; letter-spacing: 0.15em;
    color: #e74c3c; background: rgba(0,0,0,0.8);
    padding: 4px 10px; border-radius: 4px;
    animation: pulse-live 2s ease infinite;
  }
  @keyframes pulse-live {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  .auction-details { flex: 1; min-width: 300px; }
  .auction-title {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 32px; font-weight: 400; margin: 0 0 8px;
  }
  .auction-medium {
    font-size: 14px; color: #888; font-style: italic;
    margin: 0 0 16px;
  }
  .auction-rule {
    height: 1px; background: rgba(255,255,255,0.1);
    margin: 16px 0;
  }
  .auction-row {
    display: flex; justify-content: space-between;
    align-items: baseline; padding: 8px 0;
    font-size: 14px; color: #999;
  }
  .auction-price {
    font-size: 28px; font-weight: 400; color: #fff;
    font-family: 'Cormorant Garamond', Georgia, serif;
  }
  .auction-backing {
    font-size: 16px; color: var(--gold);
    font-family: 'JetBrains Mono', monospace;
  }
  .auction-explain {
    font-size: 15px; line-height: 1.6; color: #aaa;
    margin: 0 0 12px;
  }
  .auction-math {
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px; color: #777; line-height: 1.8;
    margin: 0 0 12px;
  }
  .auction-thesis {
    font-size: 16px; color: #ccc; margin: 0 0 20px;
  }
  .auction-bid-area {
    display: flex; gap: 12px; align-items: stretch;
  }
  .auction-bid-input {
    display: flex; align-items: center;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 4px; padding: 0 12px;
    flex: 1;
  }
  .auction-dollar {
    font-size: 18px; color: #666;
    font-family: 'Cormorant Garamond', Georgia, serif;
  }
  .auction-input {
    background: none; border: none; color: #fff;
    font-size: 18px; padding: 12px 8px; width: 100%;
    outline: none;
    font-family: 'Cormorant Garamond', Georgia, serif;
  }
  .auction-btn {
    background: #fff; color: #000;
    border: none; border-radius: 4px;
    padding: 12px 24px; font-size: 13px;
    font-weight: 600; cursor: pointer;
    letter-spacing: 0.1em; text-transform: uppercase;
    font-family: 'JetBrains Mono', monospace;
    transition: opacity 0.15s;
    white-space: nowrap;
  }
  .auction-btn:hover { opacity: 0.85; }
  .auction-confirm {
    margin-top: 12px; padding: 10px 14px;
    background: rgba(255,255,255,0.05);
    border-radius: 4px; font-size: 13px;
    color: #aaa; display: flex; justify-content: space-between;
    align-items: center;
    font-family: 'JetBrains Mono', monospace;
  }
  .auction-confirm button {
    background: none; border: none; color: #666;
    cursor: pointer; font-size: 16px;
  }

  /* ═══ 5. PARTY ═══ */
  .s-party {
    background: var(--paper); color: var(--ink);
    font-family: 'EB Garamond', Georgia, serif;
    gap: 20px;
  }
  .party-pass {
    display: flex; max-width: 680px; width: 100%;
    background: #faf8f4;
    border-radius: 16px; overflow: visible;
    box-shadow: 0 2px 24px rgba(28,26,23,0.12);
    position: relative;
  }
  .party-left { flex: 1; padding: 32px; }
  .party-airline {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; font-weight: 600;
    letter-spacing: 0.25em; color: var(--rust);
    margin-bottom: 20px;
  }
  .party-route {
    display: flex; align-items: center; gap: 16px;
    margin-bottom: 24px;
  }
  .party-arrow { color: var(--graphite); opacity: 0.4; }
  .party-col { display: flex; flex-direction: column; gap: 2px; }
  .party-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px; font-weight: 600;
    letter-spacing: 0.15em; color: var(--graphite);
    text-transform: uppercase;
  }
  .party-city {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 28px; font-weight: 400;
    letter-spacing: -0.5px;
  }
  .party-grid {
    display: flex; gap: 24px; flex-wrap: wrap;
    margin-bottom: 16px;
  }
  .party-val {
    font-size: 14px; font-weight: 500;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
  }
  .party-rule {
    height: 1px;
    background: repeating-linear-gradient(90deg, var(--rule) 0, var(--rule) 4px, transparent 4px, transparent 8px);
    margin: 16px 0;
  }
  .party-terms { font-size: 14px; line-height: 1.7; color: var(--graphite); }
  .party-terms p { margin: 4px 0; }
  .party-terms strong { color: var(--ink); }
  .party-tear {
    width: 1px; position: relative;
    margin: 0; flex-shrink: 0;
  }
  .party-tear-line {
    position: absolute; top: 16px; bottom: 16px; left: 0;
    border-left: 1px dashed var(--rule);
  }
  .party-tear-hole {
    position: absolute; left: -8px;
    width: 16px; height: 16px; border-radius: 50%;
    background: var(--paper);
  }
  .party-tear-top { top: -8px; }
  .party-tear-bottom { bottom: -8px; }
  .party-right {
    width: 80px; padding: 24px 12px;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 16px;
  }
  .party-barcode { display: flex; gap: 1.5px; align-items: flex-end; }
  .party-bar { width: 2px; background: var(--ink); border-radius: 1px; opacity: 0.7; }
  .party-seat {
    font-family: 'JetBrains Mono', monospace;
    font-size: 8px; font-weight: 700;
    letter-spacing: 0.2em; text-align: center;
    color: var(--graphite);
    writing-mode: vertical-lr;
    transform: rotate(180deg);
  }
  .party-footnote {
    font-size: 14px; font-style: italic;
    color: var(--graphite);
  }

  /* ═══ 6. STAKE ═══ */
  .s-stake {
    background: #0f0f0f; color: #e8e4dc;
    font-family: 'EB Garamond', Georgia, serif;
    gap: 24px;
  }
  .stake-eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px; text-transform: uppercase;
    letter-spacing: 0.2em; color: #555;
  }
  .stake-title {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 32px; font-weight: 400;
  }
  .stake-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px; max-width: 800px; width: 100%;
  }
  .stake-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px; padding: 24px;
  }
  .stake-card-icon { font-size: 24px; margin-bottom: 12px; }
  .stake-card h3 {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 18px; font-weight: 500; margin: 0 0 8px;
  }
  .stake-card p {
    font-size: 14px; line-height: 1.6; color: #999; margin: 0;
  }
  .stake-card em { font-style: italic; color: #ccc; }
  .stake-totals {
    max-width: 400px; width: 100%;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
  }
  .stake-total-row {
    display: flex; justify-content: space-between;
    padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.06);
    color: #888;
  }
  .stake-total-val { color: #ccc; font-weight: 500; }
  .stake-total-final {
    border-top: 1px solid rgba(255,255,255,0.15);
    border-bottom: none; color: #fff;
    font-weight: 600; margin-top: 4px;
    padding-top: 12px;
  }
  .stake-total-final .stake-total-val { color: var(--gold); }
  .stake-note {
    font-size: 15px; color: #777; text-align: center;
    line-height: 1.7;
  }
  .stake-note em { color: #ccc; }

  /* ═══ 7. DOORS ═══ */
  .s-doors {
    background: var(--paper); color: var(--ink);
    font-family: 'EB Garamond', Georgia, serif;
    gap: 20px;
  }
  .doors-eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px; text-transform: uppercase;
    letter-spacing: 0.2em; color: var(--graphite);
  }
  .doors-title {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 36px; font-weight: 300;
    letter-spacing: 0.05em;
  }
  .doors-board {
    max-width: 640px; width: 100%;
    border-top: 1px solid var(--rule);
  }
  .door-row {
    display: grid;
    grid-template-columns: 100px 1fr 1fr auto;
    gap: 12px; padding: 12px 8px;
    border-bottom: 1px solid var(--rule);
    text-decoration: none; color: var(--ink);
    font-size: 14px; align-items: baseline;
    transition: background 0.15s;
  }
  .door-row:hover { background: rgba(139,58,46,0.04); }
  .door-route {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px; color: var(--graphite);
  }
  .door-label { font-weight: 500; }
  .door-desc {
    font-size: 13px; color: var(--graphite);
    font-style: italic;
  }
  .door-status {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  .door-live { color: #3a7a3a; }
  .door-published { color: var(--graphite); }
  .doors-footer {
    margin-top: 24px; text-align: center;
  }
  .doors-footer p {
    font-size: 16px; font-style: italic;
    color: var(--graphite);
  }

  /* ── RESPONSIVE ── */
  @media (max-width: 640px) {
    .draft-nav { right: 10px; }
    .draft-dot-pip { width: 5px; height: 5px; }
    .auction-layout { flex-direction: column; }
    .auction-image { max-width: 100%; }
    .party-pass { flex-direction: column; }
    .party-right {
      width: 100%; flex-direction: row;
      padding: 16px 24px; writing-mode: initial;
    }
    .party-seat { writing-mode: initial; transform: none; }
    .party-tear { display: none; }
    .door-row { grid-template-columns: 1fr 1fr; }
    .door-route, .door-desc { display: none; }
    .stake-grid { grid-template-columns: 1fr; }
    .wager-stats { gap: 20px; }
  }
`;
