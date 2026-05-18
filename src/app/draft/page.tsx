"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";

/* ── Seeded random for deterministic-per-session but different-per-load ── */
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── Content cards — real aureliex material ── */
type CardSkin = "youtube" | "imessage" | "polaroid" | "terminal" | "apple-note" | "notification" | "tweet" | "vinyl" | "auction" | "boarding-pass" | "receipt";

interface ContentCard {
  id: string;
  skin: CardSkin;
  title: string;
  body: string;
  meta?: string;
  link?: string;
  image?: string;
  width?: number;
  height?: number;
}

const CARDS: ContentCard[] = [
  // YouTube skins
  {
    id: "yt-eeao",
    skin: "youtube",
    title: "Telling the Same Joke Over and Over and Over and Over",
    body: "Aaron Westberry",
    meta: "2.8M views · Apr 28, 2025",
    link: "https://www.youtube.com/watch?v=DPIoje1nfCQ",
    width: 380,
    height: 290,
  },
  {
    id: "yt-wesley",
    skin: "youtube",
    title: "The Long Take That Changed My Life",
    body: "Wesley Wang",
    meta: "1.4M views · 3 months ago",
    width: 380,
    height: 290,
  },
  {
    id: "yt-chungking",
    skin: "youtube",
    title: "Chungking Express — How Wong Kar-wai Made Loneliness Beautiful",
    body: "Every Frame a Painting",
    meta: "8.2M views · 7 years ago",
    width: 380,
    height: 290,
  },

  // iMessage skins
  {
    id: "imsg-wager",
    skin: "imessage",
    title: "Friday",
    body: `hey the portfolio is at $4,519 today\n\nmonte carlo still says 0.000000%\n\nbut we're up 31% this week so\n\nidk maybe the math is wrong`,
    meta: "Today 9:41 AM",
    width: 320,
    height: 340,
  },
  {
    id: "imsg-birthday",
    skin: "imessage",
    title: "Mom",
    body: `What do you want for your birthday?\n\nnothing i already bet everything on it\n\nSaathvik.\n\nit's fine it's all public\n\nThat doesn't make it fine`,
    meta: "Yesterday",
    width: 300,
    height: 310,
  },

  // Polaroid skins (art pieces)
  {
    id: "pol-tarantula",
    skin: "polaroid",
    title: "The Tarantula",
    body: "Graphite on Bristol · 2025",
    image: "/art/tarantula-full.jpg",
    meta: "Opening bid: $200",
    width: 260,
    height: 340,
  },
  {
    id: "pol-eagle",
    skin: "polaroid",
    title: "Eagle Study",
    body: "Charcoal on newsprint · 2025",
    image: "/art/eagle-full.jpg",
    meta: "Opening bid: $150",
    width: 260,
    height: 340,
  },

  // Terminal skins
  {
    id: "term-debate",
    skin: "terminal",
    title: "agent-debate v64",
    body: `$ run-debate --ticker IONQ --round 47

BULL:  Target $82. Quantum computing TAM expanding.
BEAR:  Revenue negative. Pure speculation.
MACRO: Fed pause benefits growth names. Bullish.
FLOW:  Dark pool activity spiking. Someone knows.
HIST:  Last time we saw this pattern: PLTR pre-breakout.

MODERATOR: Split 3-2. Conviction: 0.64. Size: Half-Kelly.
MODERATOR: The bear's objection is noted but priced in.`,
    meta: "~/aureliex",
    width: 440,
    height: 340,
  },
  {
    id: "term-monte",
    skin: "terminal",
    title: "monte-carlo.ts",
    body: `$ node monte-carlo --sims 100000 --goal 100000

Starting balance: $3,453
Target: $100,000 by June 21, 2026

Simulations complete.
P(success) = 0.000000%
Median outcome: $4,519
95th percentile: $12,847
Best sim: $67,302

"The odds are the honesty."`,
    meta: "~/aureliex/scripts",
    width: 400,
    height: 320,
  },

  // Apple Note skins
  {
    id: "note-thesis",
    skin: "apple-note",
    title: "the thesis",
    body: `Attention is what matters the most.

Not money. Not credentials. Not followers.

The bet: turn $3,453 into $100,000 by my 20th birthday. Live. Public. Every trade logged.

The portfolio is the proof.
The transparency is the product.
The attention is the point.

If I lose, I lose publicly. That's the cost.
If I win, I win publicly. That's the reward.

Either way, you watched.`,
    meta: "April 12, 2026",
    width: 320,
    height: 380,
  },
  {
    id: "note-premortem",
    skin: "apple-note",
    title: "pre-mortem",
    body: `Ways this fails:

1. Market crash (macro, uncontrollable)
2. Single position blowup (fixable w/ stops)
3. Overconfidence after early wins (the real risk)
4. Agents agree too much (echo chamber)
5. I override the agents (ego)
6. Attention corrupts the thesis (meta-risk)

P(success) < 1%.
Publishing this before trade #1.`,
    meta: "April 10, 2026",
    width: 310,
    height: 360,
  },

  // Notification skins
  {
    id: "notif-kalshi",
    skin: "notification",
    title: "Kalshi",
    body: "Your position in 'NVDA > $150 by June' filled at $0.72",
    meta: "now",
    width: 340,
    height: 100,
  },
  {
    id: "notif-robinhood",
    skin: "notification",
    title: "Robinhood",
    body: "IONQ is up 12.4% today",
    meta: "2m ago",
    width: 340,
    height: 100,
  },
  {
    id: "notif-stripe",
    skin: "notification",
    title: "Stripe",
    body: "You received a $200.00 payment for 'The Tarantula' print",
    meta: "1h ago",
    width: 340,
    height: 100,
  },

  // Tweet skins
  {
    id: "tweet-wager",
    skin: "tweet",
    title: "@saapai",
    body: `$3,453 → $100,000 by my 20th birthday.

Live portfolio. 5 AI agents argue every trade. Monte Carlo says 0.000000%.

The odds are the honesty.

aureliex.com`,
    meta: "Apr 12, 2026 · 847 likes",
    width: 360,
    height: 260,
  },
  {
    id: "tweet-update",
    skin: "tweet",
    title: "@saapai",
    body: `Week 5 update:

Portfolio: $4,519 (+30.9%)
Trades: 23
Agent agreement rate: 64%
Kill switches triggered: 0
Days to birthday: 35

The bear agent is getting louder. That's probably healthy.`,
    meta: "May 17, 2026 · 412 likes",
    width: 360,
    height: 280,
  },

  // Vinyl skin
  {
    id: "vinyl-lasso",
    skin: "vinyl",
    title: "Ted Lasso — Believe",
    body: "The show about an optimist coaching a sport he doesn't understand. Sound familiar?",
    meta: "Season 1, Episode 1",
    width: 280,
    height: 280,
  },
  {
    id: "vinyl-chungking",
    skin: "vinyl",
    title: "Chungking Express",
    body: "If memories could be canned, would they also have expiry dates?",
    meta: "Wong Kar-wai, 1994",
    width: 280,
    height: 280,
  },

  // More letters
  {
    id: "note-tension",
    skin: "apple-note",
    title: "entrenched coils",
    body: `What if memory isn't retrieval—it's tension?

Standard RAG: store → retrieve → generate.
Entrenched coils: store → contradict → wrestle → generate.

The anti-echo-chamber isn't a feature.
It's the architecture.

Five agents. Weighted disagreement.
The memory that survives is the one
that earned its place against opposition.`,
    meta: "The Research Paper",
    width: 330,
    height: 370,
  },
  {
    id: "note-kelly",
    skin: "apple-note",
    title: "kelly criterion & life",
    body: `The formula: f* = (bp - q) / b

Where:
  b = odds received
  p = probability of winning
  q = probability of losing (1 - p)

Kelly says: bet proportionally to your edge.
Too much = ruin. Too little = waste.

This applies to money. And attention.
And relationships. And career moves.

Most people overbet on safe things
and underbet on asymmetric ones.`,
    meta: "Letters · Math",
    width: 320,
    height: 370,
  },

  // Portfolio snapshot
  {
    id: "term-portfolio",
    skin: "terminal",
    title: "portfolio-snapshot",
    body: `$ cat portfolio.json | jq '.holdings'

QBTS   25.1%  ████████████▌
NVDA   21.3%  ██████████▋
MU     17.2%  ████████▋
IONQ   12.4%  ██████▎
GOOG    8.8%  ████▍
CEG     6.2%  ███▏
SGOV    5.1%  ██▌
CASH    3.9%  ██

Total: $4,519.00
Goal:  $100,000.00
Progress: ▓░░░░░░░░░ 4.5%`,
    meta: "~/aureliex",
    width: 380,
    height: 340,
  },

  // Auction skin
  {
    id: "auction-tarantula",
    skin: "auction",
    title: "LOT 001 — The Tarantula",
    body: "Graphite on Bristol board, 18×24 in. Signed. One of twelve plates from the aureliex collection.\n\nThis work is backed by 10% of the aureliex portfolio value on June 21, 2026. The winning bidder may cash out the backing at any time on or after that date, or hold the piece.\n\nIf portfolio = $10,000 → backing = $1,000\nIf portfolio = $100,000 → backing = $10,000\n\nThe auction price is your bet on where the portfolio lands.",
    meta: "Opening bid: $25.00",
    image: "/art/tarantula-full.jpg",
    width: 400,
    height: 480,
  },

  // Boarding pass — party dividend
  {
    id: "pass-party",
    skin: "boarding-pass",
    title: "AURELIEX — JUNE 21 EVENT",
    body: "DIVIDEND PASS",
    meta: "10% of portfolio value is withdrawable or reinvestable as party stake on June 21, 2026. This pass represents flight compensation + liquidity event. Present at door.",
    width: 420,
    height: 220,
  },

  // Receipt — dividend terms
  {
    id: "receipt-dividend",
    skin: "receipt",
    title: "AURELIEX DIVIDEND RECEIPT",
    body: `DATE: June 21, 2026
EVENT: 20th Birthday / Liquidity Event
─────────────────────────────
PORTFOLIO VALUE (est.)    $???
DIVIDEND POOL (10%)       $???
─────────────────────────────
ART AUCTION BACKING       10%
  LOT 001: The Tarantula
  Opening bid:            $25
  Guaranteed floor:       10% NAV
─────────────────────────────
PARTY STAKE POOL          10%
  Withdrawable at event
  Or reinvestable into Q3
─────────────────────────────
FLIGHT COMPENSATION       ✓
  Covered by dividend
─────────────────────────────

"The party is the liquidity event."

         ████████████
         ████████████
         SCAN TO RSVP`,
    width: 340,
    height: 500,
  },

  // Notification for auction
  {
    id: "notif-auction",
    skin: "notification",
    title: "aureliex",
    body: "Auction for 'The Tarantula' is now live. Opening bid: $25. Backed by 10% of portfolio.",
    meta: "just now",
    width: 360,
    height: 100,
  },

  // iMessage about the party
  {
    id: "imsg-party",
    skin: "imessage",
    title: "Group: june 21",
    body: `so the party is also a liquidity event?\n\nyes 10% of whatever the portfolio is worth\n\nyou can cash out or reinvest\n\nwait so if you hit 100k we each get…\n\ncome and find out\n\nalso there's an art auction\n\nwhat\n\nthe tarantula drawing. starts at $25. backed by 10% of the portfolio\n\nso if you buy it for $25 and the portfolio hits $100k you can cash out $10,000?\n\nyes\n\nthat's insane\n\nthat's the point`,
    meta: "Today 11:22 AM",
    width: 330,
    height: 440,
  },
];

/* ── Intro text sequence ── */
const INTRO_LINES = [
  { text: "you've seen this before.", delay: 0, duration: 1800 },
  { text: "the interface. the layout. the font.", delay: 2000, duration: 1800 },
  { text: "familiarity is a shortcut to trust.", delay: 4200, duration: 2000 },
  { text: "so what happens when you build a portfolio inside a youtube video?", delay: 6500, duration: 2400 },
  { text: "or a thesis inside an imessage thread?", delay: 9200, duration: 2000 },
  { text: "or a research paper inside an apple note?", delay: 11500, duration: 2000 },
  { text: "attention is what matters the most.", delay: 14000, duration: 2200 },
  { text: "this is aureliex.", delay: 16800, duration: 2000 },
];

const TOTAL_INTRO_MS = 20000;

/* ── Component ── */
export default function DraftPage() {
  const [phase, setPhase] = useState<"intro" | "explode" | "canvas">("intro");
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [fadingLines, setFadingLines] = useState<number[]>([]);

  // Canvas pan state
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasOpacity, setCanvasOpacity] = useState(0);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [showMinimap, setShowMinimap] = useState(true);

  // Generate random positions for cards (stable per session via seed)
  const seed = useMemo(() => Math.floor(Math.random() * 1000000), []);
  const cardPositions = useMemo(() => {
    const rng = mulberry32(seed);
    const SPREAD = 3200;
    const positions: { x: number; y: number; rot: number }[] = [];

    // Place cards in a loose spiral with jitter
    const count = CARDS.length;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 6 + rng() * 0.8;
      const radius = 200 + i * 65 + rng() * 180;
      const x = Math.cos(angle) * radius + (rng() - 0.5) * 300;
      const y = Math.sin(angle) * radius + (rng() - 0.5) * 300;
      const rot = (rng() - 0.5) * 8;
      positions.push({ x, y, rot });
    }
    return positions;
  }, [seed]);

  // Center of mass for initial pan
  const centerOfMass = useMemo(() => {
    const cx = cardPositions.reduce((s, p) => s + p.x, 0) / cardPositions.length;
    const cy = cardPositions.reduce((s, p) => s + p.y, 0) / cardPositions.length;
    return { x: cx, y: cy };
  }, [cardPositions]);

  // Intro sequence
  useEffect(() => {
    if (phase !== "intro") return;
    const timers: ReturnType<typeof setTimeout>[] = [];

    INTRO_LINES.forEach((line, i) => {
      timers.push(setTimeout(() => setVisibleLines((v) => [...v, i]), line.delay));
      timers.push(
        setTimeout(
          () => setFadingLines((v) => [...v, i]),
          line.delay + line.duration - 400
        )
      );
    });

    timers.push(
      setTimeout(() => {
        setPhase("explode");
        // Brief white flash then canvas
        setTimeout(() => {
          setPhase("canvas");
          setPan({ x: -centerOfMass.x, y: -centerOfMass.y });
          setTimeout(() => setCanvasOpacity(1), 50);
        }, 600);
      }, TOTAL_INTRO_MS)
    );

    return () => timers.forEach(clearTimeout);
  }, [phase, centerOfMass]);

  // Skip intro on click
  const skipIntro = useCallback(() => {
    if (phase === "intro") {
      setPhase("canvas");
      setPan({ x: -centerOfMass.x, y: -centerOfMass.y });
      setTimeout(() => setCanvasOpacity(1), 50);
    }
  }, [phase, centerOfMass]);

  // Pan handlers
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (selectedCard) return;
      setIsDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [pan, selectedCard]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setPan({ x: dragStart.current.panX + dx, y: dragStart.current.panY + dy });
    },
    [isDragging]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (phase !== "canvas") return;
    const handler = (e: KeyboardEvent) => {
      const step = e.shiftKey ? 200 : 80;
      if (e.key === "ArrowLeft") setPan((p) => ({ ...p, x: p.x + step }));
      if (e.key === "ArrowRight") setPan((p) => ({ ...p, x: p.x - step }));
      if (e.key === "ArrowUp") setPan((p) => ({ ...p, y: p.y + step }));
      if (e.key === "ArrowDown") setPan((p) => ({ ...p, y: p.y - step }));
      if (e.key === "Escape") setSelectedCard(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase]);

  // Scroll to pan
  useEffect(() => {
    if (phase !== "canvas") return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      setPan((p) => ({ x: p.x - e.deltaX * 0.8, y: p.y - e.deltaY * 0.8 }));
    };
    const el = containerRef.current;
    if (el) el.addEventListener("wheel", handler, { passive: false });
    return () => el?.removeEventListener("wheel", handler);
  }, [phase]);

  return (
    <div className="draft-root">
      <style>{styles}</style>

      {/* ── INTRO ── */}
      {phase === "intro" && (
        <div className="intro-screen" onClick={skipIntro}>
          {INTRO_LINES.map((line, i) => (
            <p
              key={i}
              className={`intro-line ${visibleLines.includes(i) ? "visible" : ""} ${fadingLines.includes(i) ? "fading" : ""}`}
            >
              {line.text}
            </p>
          ))}
          <span className="skip-hint">click to skip</span>
        </div>
      )}

      {/* ── FLASH ── */}
      {phase === "explode" && <div className="flash-screen" />}

      {/* ── CANVAS ── */}
      {(phase === "canvas" || phase === "explode") && (
        <div
          className="canvas-viewport"
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{ opacity: canvasOpacity, cursor: isDragging ? "grabbing" : "grab" }}
        >
          <div
            className="canvas-world"
            style={{
              transform: `translate(calc(50vw + ${pan.x}px), calc(50vh + ${pan.y}px))`,
            }}
          >
            {CARDS.map((card, i) => {
              const pos = cardPositions[i];
              const isSelected = selectedCard === card.id;
              return (
                <div
                  key={card.id}
                  className={`card-wrapper card-enter ${isSelected ? "card-selected" : ""}`}
                  style={{
                    left: pos.x,
                    top: pos.y,
                    transform: isSelected ? "rotate(0deg) scale(1.1)" : `rotate(${pos.rot}deg)`,
                    zIndex: isSelected ? 100 : hoveredCard === card.id ? 50 : 1,
                    animationDelay: `${i * 60 + 100}ms`,
                    width: card.width ?? 320,
                  }}
                  onMouseEnter={() => setHoveredCard(card.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCard(isSelected ? null : card.id);
                  }}
                >
                  <CardRenderer card={card} />
                </div>
              );
            })}
          </div>

          {/* Minimap */}
          {showMinimap && (
            <div className="minimap">
              <div className="minimap-inner">
                {cardPositions.map((pos, i) => (
                  <div
                    key={i}
                    className={`minimap-dot minimap-dot-${CARDS[i].skin}`}
                    style={{
                      left: `${((pos.x + 2000) / 4000) * 100}%`,
                      top: `${((pos.y + 2000) / 4000) * 100}%`,
                    }}
                  />
                ))}
                <div
                  className="minimap-viewport"
                  style={{
                    left: `${((-pan.x - window.innerWidth / 2 + 2000) / 4000) * 100}%`,
                    top: `${((-pan.y - window.innerHeight / 2 + 2000) / 4000) * 100}%`,
                    width: `${(window.innerWidth / 4000) * 100}%`,
                    height: `${(window.innerHeight / 4000) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Navigation hint */}
          <div className="nav-hint">
            <span>drag or scroll to explore</span>
            <span>·</span>
            <span>arrow keys to navigate</span>
            <span>·</span>
            <span>click a card to focus</span>
          </div>

          {/* Title watermark */}
          <div className="watermark">aureliex</div>
        </div>
      )}
    </div>
  );
}

/* ── Card Renderers ── */
function CardRenderer({ card }: { card: ContentCard }) {
  switch (card.skin) {
    case "youtube":
      return <YouTubeCard card={card} />;
    case "imessage":
      return <IMessageCard card={card} />;
    case "polaroid":
      return <PolaroidCard card={card} />;
    case "terminal":
      return <TerminalCard card={card} />;
    case "apple-note":
      return <AppleNoteCard card={card} />;
    case "notification":
      return <NotificationCard card={card} />;
    case "tweet":
      return <TweetCard card={card} />;
    case "vinyl":
      return <VinylCard card={card} />;
    case "auction":
      return <AuctionCard card={card} />;
    case "boarding-pass":
      return <BoardingPassCard card={card} />;
    case "receipt":
      return <ReceiptCard card={card} />;
    default:
      return null;
  }
}

function YouTubeCard({ card }: { card: ContentCard }) {
  return (
    <div className="skin-youtube">
      <div className="yt-thumb-area">
        {card.id === "yt-eeao" ? (
          <img src="https://i.ytimg.com/vi/DPIoje1nfCQ/hqdefault.jpg" alt="" className="yt-thumb-img" />
        ) : (
          <div className="yt-thumb-placeholder" />
        )}
        <div className="yt-play-btn">
          <svg viewBox="0 0 68 48" width="48" height="34">
            <path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="#f00" />
            <path d="M27 34l17-10-17-10z" fill="#fff" />
          </svg>
        </div>
      </div>
      <div className="yt-info">
        <div className="yt-avatar-dot" />
        <div className="yt-text">
          <p className="yt-vid-title">{card.title}</p>
          <p className="yt-vid-channel">{card.body}</p>
          <p className="yt-vid-meta">{card.meta}</p>
        </div>
      </div>
    </div>
  );
}

function IMessageCard({ card }: { card: ContentCard }) {
  const lines = card.body.split("\n").filter(Boolean);
  return (
    <div className="skin-imessage">
      <div className="im-header">
        <div className="im-avatar">{card.title[0]}</div>
        <span className="im-name">{card.title}</span>
        <span className="im-time">{card.meta}</span>
      </div>
      <div className="im-thread">
        {lines.map((line, i) => {
          // Alternate sent/received — odd lines are "sent" (blue, right)
          const isSent = i % 2 !== 0;
          return (
            <div key={i} className={`im-bubble ${isSent ? "im-sent" : "im-received"}`}>
              {line}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PolaroidCard({ card }: { card: ContentCard }) {
  return (
    <div className="skin-polaroid">
      <div className="pol-image">
        {card.image ? (
          <img src={card.image} alt={card.title} />
        ) : (
          <div className="pol-placeholder" />
        )}
      </div>
      <div className="pol-caption">
        <p className="pol-title">{card.title}</p>
        <p className="pol-body">{card.body}</p>
        {card.meta && <p className="pol-meta">{card.meta}</p>}
      </div>
    </div>
  );
}

function TerminalCard({ card }: { card: ContentCard }) {
  return (
    <div className="skin-terminal">
      <div className="term-titlebar">
        <div className="term-dots">
          <span className="term-dot red" />
          <span className="term-dot yellow" />
          <span className="term-dot green" />
        </div>
        <span className="term-path">{card.meta}</span>
      </div>
      <pre className="term-body">{card.body}</pre>
    </div>
  );
}

function AppleNoteCard({ card }: { card: ContentCard }) {
  return (
    <div className="skin-apple-note">
      <div className="an-header">
        <span className="an-date">{card.meta}</span>
      </div>
      <h3 className="an-title">{card.title}</h3>
      <p className="an-body">{card.body}</p>
    </div>
  );
}

function NotificationCard({ card }: { card: ContentCard }) {
  return (
    <div className="skin-notification">
      <div className="notif-icon">{card.title[0]}</div>
      <div className="notif-content">
        <div className="notif-top">
          <span className="notif-app">{card.title}</span>
          <span className="notif-time">{card.meta}</span>
        </div>
        <p className="notif-body">{card.body}</p>
      </div>
    </div>
  );
}

function TweetCard({ card }: { card: ContentCard }) {
  return (
    <div className="skin-tweet">
      <div className="tw-header">
        <div className="tw-avatar">{card.title[1]?.toUpperCase()}</div>
        <div className="tw-names">
          <span className="tw-display">Saathvik Pai</span>
          <span className="tw-handle">{card.title}</span>
        </div>
        <svg className="tw-x-logo" viewBox="0 0 24 24" width="18" height="18" fill="#71767b">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </div>
      <p className="tw-body">{card.body}</p>
      <span className="tw-meta">{card.meta}</span>
    </div>
  );
}

function VinylCard({ card }: { card: ContentCard }) {
  return (
    <div className="skin-vinyl">
      <div className="vinyl-disc">
        <div className="vinyl-label">
          <div className="vinyl-hole" />
        </div>
      </div>
      <div className="vinyl-sleeve">
        <p className="vinyl-title">{card.title}</p>
        <p className="vinyl-body">{card.body}</p>
        <span className="vinyl-meta">{card.meta}</span>
      </div>
    </div>
  );
}

function AuctionCard({ card }: { card: ContentCard }) {
  return (
    <div className="skin-auction">
      <div className="auc-header">
        <span className="auc-house">AURELIEX</span>
        <span className="auc-live">● LIVE</span>
      </div>
      {card.image && (
        <div className="auc-image">
          <img src={card.image} alt={card.title} />
        </div>
      )}
      <div className="auc-body">
        <h3 className="auc-lot">{card.title}</h3>
        <p className="auc-desc">{card.body}</p>
        <div className="auc-bid-row">
          <span className="auc-bid-label">Opening bid</span>
          <span className="auc-bid-amount">$25.00</span>
        </div>
        <div className="auc-bid-row">
          <span className="auc-bid-label">Backing</span>
          <span className="auc-bid-backing">10% of NAV</span>
        </div>
        <button className="auc-place-bid">Place Bid</button>
      </div>
    </div>
  );
}

function BoardingPassCard({ card }: { card: ContentCard }) {
  return (
    <div className="skin-boarding">
      <div className="bp-left">
        <div className="bp-airline">{card.title}</div>
        <div className="bp-main">
          <div className="bp-col">
            <span className="bp-label">FROM</span>
            <span className="bp-value">NOW</span>
          </div>
          <div className="bp-arrow">→</div>
          <div className="bp-col">
            <span className="bp-label">TO</span>
            <span className="bp-value">JUN 21</span>
          </div>
        </div>
        <div className="bp-detail-row">
          <div className="bp-col">
            <span className="bp-label">PASSENGER</span>
            <span className="bp-value-sm">HOLDER</span>
          </div>
          <div className="bp-col">
            <span className="bp-label">CLASS</span>
            <span className="bp-value-sm">{card.body}</span>
          </div>
          <div className="bp-col">
            <span className="bp-label">GATE</span>
            <span className="bp-value-sm">10%</span>
          </div>
        </div>
      </div>
      <div className="bp-tear" />
      <div className="bp-right">
        <div className="bp-barcode">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="bp-bar" style={{ height: `${14 + Math.random() * 20}px` }} />
          ))}
        </div>
        <span className="bp-seat">STAKE</span>
      </div>
    </div>
  );
}

function ReceiptCard({ card }: { card: ContentCard }) {
  return (
    <div className="skin-receipt">
      <div className="rcpt-header">{card.title}</div>
      <pre className="rcpt-body">{card.body}</pre>
    </div>
  );
}

/* ── Styles ── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&family=SF+Pro+Display:wght@300;400;500;600&display=swap');

  .draft-root {
    position: fixed; inset: 0;
    background: #000;
    color: #fff;
    font-family: 'Inter', -apple-system, sans-serif;
    overflow: hidden;
    -webkit-font-smoothing: antialiased;
  }

  /* ── INTRO ── */
  .intro-screen {
    position: absolute; inset: 0;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 24px; padding: 40px;
    cursor: pointer;
    z-index: 10;
  }
  .intro-line {
    font-size: 22px; font-weight: 300;
    letter-spacing: 0.02em; line-height: 1.6;
    color: #fff; text-align: center;
    opacity: 0; transform: translateY(12px);
    transition: opacity 0.6s ease, transform 0.6s ease;
    max-width: 600px;
  }
  .intro-line.visible {
    opacity: 1; transform: translateY(0);
  }
  .intro-line.fading {
    opacity: 0.15;
    transition: opacity 1.2s ease;
  }
  .skip-hint {
    position: absolute; bottom: 32px;
    font-size: 12px; color: #444; letter-spacing: 0.1em; text-transform: uppercase;
  }

  /* ── FLASH ── */
  .flash-screen {
    position: absolute; inset: 0; z-index: 20;
    background: #fff;
    animation: flashAnim 0.6s ease-out forwards;
  }
  @keyframes flashAnim {
    0% { opacity: 1; }
    100% { opacity: 0; }
  }

  /* ── CANVAS ── */
  .canvas-viewport {
    position: absolute; inset: 0;
    overflow: hidden;
    transition: opacity 0.8s ease;
    background: #0a0a0a;
    touch-action: none;
    user-select: none;
  }
  .canvas-world {
    position: absolute;
    width: 0; height: 0;
  }

  /* ── CARDS ── */
  .card-wrapper {
    position: absolute;
    transition: transform 0.3s ease, box-shadow 0.3s ease, z-index 0s;
    cursor: pointer;
  }
  .card-wrapper:hover {
    transform: rotate(0deg) scale(1.04) !important;
    z-index: 50 !important;
  }
  .card-selected {
    z-index: 100 !important;
  }
  .card-enter {
    opacity: 0;
    animation: cardEnter 0.8s ease forwards;
  }
  @keyframes cardEnter {
    from { opacity: 0; transform: scale(0.7) rotate(0deg); }
    to { opacity: 1; }
  }

  /* ── YOUTUBE SKIN ── */
  .skin-youtube {
    background: #0f0f0f; border-radius: 12px; overflow: hidden;
    font-family: 'Roboto', Arial, sans-serif;
    box-shadow: 0 4px 24px rgba(0,0,0,0.6);
  }
  .yt-thumb-area {
    position: relative; width: 100%; aspect-ratio: 16/9;
    background: #1a1a2e; overflow: hidden;
  }
  .yt-thumb-img { width: 100%; height: 100%; object-fit: cover; }
  .yt-thumb-placeholder {
    width: 100%; height: 100%;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  }
  .yt-play-btn {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    opacity: 0.85;
  }
  .yt-info { display: flex; gap: 12px; padding: 12px; }
  .yt-avatar-dot {
    width: 36px; height: 36px; border-radius: 50%;
    background: #333; flex-shrink: 0;
  }
  .yt-text { min-width: 0; }
  .yt-vid-title {
    font-size: 14px; font-weight: 500; line-height: 1.3;
    margin: 0 0 4px; color: #f1f1f1;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .yt-vid-channel { font-size: 12px; color: #aaa; margin: 0; }
  .yt-vid-meta { font-size: 12px; color: #aaa; margin: 0; }

  /* ── iMESSAGE SKIN ── */
  .skin-imessage {
    background: #1c1c1e; border-radius: 20px; overflow: hidden;
    font-family: -apple-system, 'SF Pro Display', sans-serif;
    box-shadow: 0 4px 24px rgba(0,0,0,0.6);
  }
  .im-header {
    display: flex; align-items: center; gap: 10px;
    padding: 14px 16px; border-bottom: 1px solid #2c2c2e;
  }
  .im-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    background: #636366; color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 600;
  }
  .im-name { font-size: 15px; font-weight: 600; flex: 1; }
  .im-time { font-size: 11px; color: #8e8e93; }
  .im-thread {
    padding: 12px 16px; display: flex; flex-direction: column; gap: 6px;
  }
  .im-bubble {
    max-width: 85%; padding: 8px 14px; border-radius: 18px;
    font-size: 15px; line-height: 1.35;
  }
  .im-sent {
    align-self: flex-end; background: #0b84fe; color: #fff;
    border-bottom-right-radius: 4px;
  }
  .im-received {
    align-self: flex-start; background: #3a3a3c; color: #fff;
    border-bottom-left-radius: 4px;
  }

  /* ── POLAROID SKIN ── */
  .skin-polaroid {
    background: #f5f0e8; padding: 12px 12px 20px; border-radius: 4px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.5), 2px 2px 0 rgba(0,0,0,0.1);
  }
  .pol-image {
    width: 100%; aspect-ratio: 1; background: #ddd; overflow: hidden;
    margin-bottom: 12px;
  }
  .pol-image img { width: 100%; height: 100%; object-fit: cover; }
  .pol-placeholder { width: 100%; height: 100%; background: linear-gradient(135deg, #d4c5a9, #e8dcc8); }
  .pol-caption { text-align: center; }
  .pol-title { font-size: 14px; font-weight: 600; color: #2a2a2a; margin: 0 0 2px; font-family: 'Georgia', serif; }
  .pol-body { font-size: 11px; color: #666; margin: 0 0 4px; }
  .pol-meta { font-size: 10px; color: #999; margin: 0; font-style: italic; }

  /* ── TERMINAL SKIN ── */
  .skin-terminal {
    background: #1a1b26; border-radius: 10px; overflow: hidden;
    font-family: 'JetBrains Mono', 'SF Mono', monospace;
    box-shadow: 0 4px 24px rgba(0,0,0,0.6);
    border: 1px solid #2a2b36;
  }
  .term-titlebar {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 14px; background: #16171f;
    border-bottom: 1px solid #2a2b36;
  }
  .term-dots { display: flex; gap: 6px; }
  .term-dot { width: 12px; height: 12px; border-radius: 50%; }
  .term-dot.red { background: #ff5f57; }
  .term-dot.yellow { background: #febc2e; }
  .term-dot.green { background: #28c840; }
  .term-path { font-size: 12px; color: #565f89; }
  .term-body {
    padding: 14px; font-size: 12px; line-height: 1.5;
    color: #a9b1d6; margin: 0; white-space: pre-wrap;
    overflow: hidden;
  }

  /* ── APPLE NOTE SKIN ── */
  .skin-apple-note {
    background: #1c1c1e; border-radius: 12px; overflow: hidden;
    font-family: -apple-system, 'SF Pro Display', sans-serif;
    box-shadow: 0 4px 24px rgba(0,0,0,0.6);
    padding: 20px;
  }
  .an-header { margin-bottom: 8px; }
  .an-date { font-size: 12px; color: #8e8e93; }
  .an-title {
    font-size: 22px; font-weight: 700; margin: 0 0 12px;
    color: #fff; letter-spacing: -0.3px;
  }
  .an-body {
    font-size: 15px; line-height: 1.5; color: #d1d1d6;
    margin: 0; white-space: pre-wrap;
  }

  /* ── NOTIFICATION SKIN ── */
  .skin-notification {
    background: rgba(50, 50, 50, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 16px; padding: 14px 16px;
    display: flex; gap: 12px; align-items: flex-start;
    font-family: -apple-system, 'SF Pro Display', sans-serif;
    box-shadow: 0 4px 24px rgba(0,0,0,0.5);
    border: 1px solid rgba(255,255,255,0.08);
  }
  .notif-icon {
    width: 36px; height: 36px; border-radius: 8px;
    background: #333; color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; font-weight: 700; flex-shrink: 0;
  }
  .notif-content { flex: 1; min-width: 0; }
  .notif-top { display: flex; justify-content: space-between; margin-bottom: 2px; }
  .notif-app { font-size: 13px; font-weight: 600; color: #aaa; }
  .notif-time { font-size: 12px; color: #666; }
  .notif-body { font-size: 14px; color: #fff; margin: 0; line-height: 1.35; }

  /* ── TWEET SKIN ── */
  .skin-tweet {
    background: #000; border: 1px solid #2f3336;
    border-radius: 16px; padding: 16px;
    font-family: -apple-system, 'Segoe UI', sans-serif;
    box-shadow: 0 4px 24px rgba(0,0,0,0.5);
  }
  .tw-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .tw-avatar {
    width: 40px; height: 40px; border-radius: 50%;
    background: #1d9bf0; color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; font-weight: 700;
  }
  .tw-names { flex: 1; }
  .tw-display { display: block; font-size: 15px; font-weight: 700; color: #e7e9ea; }
  .tw-handle { font-size: 14px; color: #71767b; }
  .tw-x-logo { margin-left: auto; }
  .tw-body {
    font-size: 15px; line-height: 1.45; color: #e7e9ea;
    margin: 0 0 10px; white-space: pre-wrap;
  }
  .tw-meta { font-size: 13px; color: #71767b; }

  /* ── VINYL SKIN ── */
  .skin-vinyl {
    display: flex; flex-direction: column; align-items: center;
    padding: 20px;
  }
  .vinyl-disc {
    width: 180px; height: 180px; border-radius: 50%;
    background: conic-gradient(from 0deg, #111 0%, #222 15%, #111 30%, #1a1a1a 45%, #111 60%, #222 75%, #111 90%, #1a1a1a 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 20px rgba(0,0,0,0.6);
    animation: vinylSpin 8s linear infinite;
    margin-bottom: 16px;
  }
  @keyframes vinylSpin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .vinyl-label {
    width: 60px; height: 60px; border-radius: 50%;
    background: linear-gradient(135deg, #c4302b, #e74c3c);
    display: flex; align-items: center; justify-content: center;
  }
  .vinyl-hole {
    width: 8px; height: 8px; border-radius: 50%; background: #000;
  }
  .vinyl-sleeve { text-align: center; }
  .vinyl-title {
    font-size: 14px; font-weight: 600; margin: 0 0 4px; color: #fff;
  }
  .vinyl-body {
    font-size: 12px; color: #aaa; margin: 0 0 6px;
    font-style: italic; line-height: 1.4;
  }
  .vinyl-meta { font-size: 11px; color: #555; }

  /* ── AUCTION SKIN ── */
  .skin-auction {
    background: #0c0c0c; border-radius: 4px; overflow: hidden;
    border: 1px solid #2a2a2a;
    font-family: 'Inter', -apple-system, sans-serif;
    box-shadow: 0 4px 24px rgba(0,0,0,0.6);
  }
  .auc-header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 12px 16px; border-bottom: 1px solid #1a1a1a;
  }
  .auc-house {
    font-size: 11px; font-weight: 600; letter-spacing: 0.2em;
    color: #888; text-transform: uppercase;
  }
  .auc-live {
    font-size: 11px; font-weight: 600; color: #e74c3c;
    animation: livePulse 2s ease infinite;
  }
  @keyframes livePulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  .auc-image {
    width: 100%; aspect-ratio: 4/3; overflow: hidden;
    background: #1a1a1a;
  }
  .auc-image img { width: 100%; height: 100%; object-fit: cover; }
  .auc-body { padding: 16px; }
  .auc-lot {
    font-size: 16px; font-weight: 700; margin: 0 0 10px;
    color: #fff; letter-spacing: 0.02em;
  }
  .auc-desc {
    font-size: 12px; line-height: 1.55; color: #999;
    margin: 0 0 16px; white-space: pre-wrap;
  }
  .auc-bid-row {
    display: flex; justify-content: space-between; align-items: baseline;
    padding: 6px 0; border-top: 1px solid #1a1a1a;
  }
  .auc-bid-label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.08em; }
  .auc-bid-amount { font-size: 20px; font-weight: 700; color: #fff; }
  .auc-bid-backing { font-size: 14px; font-weight: 600; color: #c9a84c; }
  .auc-place-bid {
    width: 100%; margin-top: 14px; padding: 12px;
    background: #fff; color: #000; border: none; border-radius: 4px;
    font-size: 14px; font-weight: 700; cursor: pointer;
    letter-spacing: 0.06em; text-transform: uppercase;
    transition: background 0.15s;
  }
  .auc-place-bid:hover { background: #e0e0e0; }

  /* ── BOARDING PASS SKIN ── */
  .skin-boarding {
    display: flex; overflow: hidden;
    background: #faf8f4; color: #1a1a1a; border-radius: 12px;
    font-family: 'Inter', -apple-system, sans-serif;
    box-shadow: 0 4px 24px rgba(0,0,0,0.5);
    min-height: 180px;
  }
  .bp-left { flex: 1; padding: 20px; display: flex; flex-direction: column; gap: 14px; }
  .bp-airline {
    font-size: 10px; font-weight: 700; letter-spacing: 0.15em;
    color: #c4302b; text-transform: uppercase;
  }
  .bp-main { display: flex; align-items: center; gap: 16px; }
  .bp-arrow { font-size: 24px; color: #ccc; }
  .bp-col { display: flex; flex-direction: column; gap: 2px; }
  .bp-label { font-size: 9px; font-weight: 600; color: #999; letter-spacing: 0.1em; text-transform: uppercase; }
  .bp-value { font-size: 22px; font-weight: 800; color: #1a1a1a; letter-spacing: -0.5px; }
  .bp-detail-row { display: flex; gap: 20px; }
  .bp-value-sm { font-size: 13px; font-weight: 700; color: #1a1a1a; }
  .bp-tear {
    width: 1px; background: repeating-linear-gradient(
      to bottom, #ddd 0px, #ddd 4px, transparent 4px, transparent 8px
    );
    margin: 10px 0; position: relative;
  }
  .bp-tear::before, .bp-tear::after {
    content: ''; position: absolute; left: -6px;
    width: 12px; height: 12px; border-radius: 50%;
    background: #0a0a0a;
  }
  .bp-tear::before { top: -6px; }
  .bp-tear::after { bottom: -6px; }
  .bp-right {
    width: 80px; padding: 16px 12px;
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 10px;
    background: #f5f2ec;
  }
  .bp-barcode { display: flex; gap: 1.5px; align-items: flex-end; }
  .bp-bar { width: 2px; background: #1a1a1a; border-radius: 1px; }
  .bp-seat {
    font-size: 10px; font-weight: 800; letter-spacing: 0.15em;
    color: #1a1a1a; transform: rotate(90deg);
    white-space: nowrap;
  }

  /* ── RECEIPT SKIN ── */
  .skin-receipt {
    background: #faf8f2; color: #2a2a2a; border-radius: 2px;
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    box-shadow: 0 4px 24px rgba(0,0,0,0.5);
    padding: 0;
    position: relative;
  }
  .skin-receipt::after {
    content: ''; position: absolute; bottom: -6px; left: 0; right: 0;
    height: 12px;
    background: linear-gradient(135deg, #faf8f2 33.33%, transparent 33.33%) 0 0,
                linear-gradient(225deg, #faf8f2 33.33%, transparent 33.33%) 0 0;
    background-size: 12px 12px;
  }
  .rcpt-header {
    text-align: center; padding: 16px 16px 8px;
    font-size: 12px; font-weight: 700; letter-spacing: 0.1em;
    border-bottom: 1px dashed #ccc;
  }
  .rcpt-body {
    padding: 12px 16px 20px; font-size: 11px; line-height: 1.6;
    margin: 0; white-space: pre-wrap; color: #333;
  }

  /* ── MINIMAP ── */
  .minimap {
    position: fixed; bottom: 60px; right: 20px;
    width: 140px; height: 100px;
    background: rgba(20, 20, 20, 0.85);
    border: 1px solid #333; border-radius: 8px;
    overflow: hidden; z-index: 200;
    backdrop-filter: blur(8px);
  }
  .minimap-inner {
    position: relative; width: 100%; height: 100%;
  }
  .minimap-dot {
    position: absolute; width: 4px; height: 4px;
    border-radius: 50%; transform: translate(-50%, -50%);
  }
  .minimap-dot-youtube { background: #ff0000; }
  .minimap-dot-imessage { background: #0b84fe; }
  .minimap-dot-polaroid { background: #f5f0e8; }
  .minimap-dot-terminal { background: #28c840; }
  .minimap-dot-apple-note { background: #ffd60a; }
  .minimap-dot-notification { background: #888; }
  .minimap-dot-tweet { background: #1d9bf0; }
  .minimap-dot-vinyl { background: #e74c3c; }
  .minimap-viewport {
    position: absolute;
    border: 1px solid rgba(255,255,255,0.4);
    border-radius: 2px;
    background: rgba(255,255,255,0.05);
  }

  /* ── NAV HINT ── */
  .nav-hint {
    position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
    display: flex; gap: 12px; align-items: center;
    font-size: 12px; color: #444; letter-spacing: 0.05em;
    z-index: 200;
    animation: fadeInHint 1s ease 1s forwards;
    opacity: 0;
  }
  @keyframes fadeInHint {
    to { opacity: 1; }
  }

  /* ── WATERMARK ── */
  .watermark {
    position: fixed; top: 20px; left: 24px;
    font-size: 14px; font-weight: 600; letter-spacing: 0.15em;
    color: #222; z-index: 200;
    text-transform: lowercase;
  }

  /* ── RESPONSIVE ── */
  @media (max-width: 640px) {
    .intro-line { font-size: 18px; }
    .minimap { display: none; }
    .nav-hint { font-size: 10px; gap: 8px; }
  }
`;
