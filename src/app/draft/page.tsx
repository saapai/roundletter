"use client";

import { useState, useRef, useEffect, useCallback } from "react";

/* ── YT global type ── */
declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
  }
}

/* ── portfolio holdings ── */
const HOLDINGS = [
  { t: "QTUM", s: 5.584, fb: 679.74 },
  { t: "MSFT", s: 1.036, fb: 407.87 },
  { t: "GOOG", s: 1.235, fb: 407.17 },
  { t: "IONQ", s: 9.489, fb: 416.85 },
  { t: "IBM",  s: 1.553, fb: 373.33 },
  { t: "NVDA", s: 1.773, fb: 344.49 },
  { t: "CEG",  s: 1.148, fb: 339.05 },
  { t: "RGTI", s: 9.938, fb: 169.50 },
  { t: "SGOV", s: 2.625, fb: 263.94 },
  { t: "QBTS", s: 5.951, fb: 101.65 },
];
const PENDING_CASH = 46.57;
const PREDICTION_OFFSET = 250;
const TARGET = 100_000;
const DEADLINE = new Date("2026-06-21");
const VIDEO_ID = "0UArh-KjQYU";

/* ── live price hook ── */
function useLive(): number {
  const fallback = PENDING_CASH + PREDICTION_OFFSET + HOLDINGS.reduce((s, h) => s + h.fb, 0);
  const [v, setV] = useState<number>(fallback);
  useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const r = await fetch("/api/prices", { cache: "no-store" });
        if (!r.ok || !alive) return;
        const j = await r.json();
        if (!j?.hasData || !alive) return;
        let sum = PENDING_CASH + PREDICTION_OFFSET;
        for (const h of HOLDINGS) {
          const d = j.data[h.t];
          sum += d?.closes?.length > 0 ? h.s * d.closes[d.closes.length - 1] : h.fb;
        }
        if (alive) setV(sum);
      } catch { /* swallow */ }
    };
    poll();
    const id = setInterval(poll, 30_000);
    return () => { alive = false; clearInterval(id); };
  }, []);
  return v;
}

function daysLeft(): number {
  return Math.max(0, Math.ceil((DEADLINE.getTime() - Date.now()) / 86_400_000));
}

/* ── format helpers ── */
function fmt(n: number): string {
  return "$" + Math.round(n).toLocaleString();
}

/* ══════════════════════════════════════════════════════
   PAGE COMPONENT
   ══════════════════════════════════════════════════════ */

export default function DraftPage() {
  const total = useLive();
  const d = daysLeft();

  /* refs */
  const playerRef = useRef<any>(null);
  const playerReadyRef = useRef(false);
  const durationRef = useRef(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef(0);
  const triggeredRef = useRef<Set<number>>(new Set());
  const isMobileRef = useRef(false);

  /* state — only what needs to trigger re-render */
  const [phase, setPhase] = useState(0);
  const [progress, setProgress] = useState(0); // 0..1 playback progress
  const [likeCount, setLikeCount] = useState("47K");
  const [progressBarColor, setProgressBarColor] = useState("#ff0000");
  const [subscribeBg, setSubscribeBg] = useState("#fff");
  const [subscribeColor, setSubscribeColor] = useState("#0f0f0f");
  const [avatarBorder, setAvatarBorder] = useState("1px solid transparent");
  const [titleText, setTitleText] = useState("nothing, except everything");
  const [titleChars, setTitleChars] = useState<{ ch: string; fading: boolean; delay: number }[] | null>(null);
  const [dislikeText, setDislikeText] = useState<string | null>(null);
  const [subscriberText, setSubscriberText] = useState("342 subscribers");
  const [subscribeVisible, setSubscribeVisible] = useState(true);
  const [chromeVisible, setChromeVisible] = useState(true);
  const [bgColor, setBgColor] = useState("#0f0f0f");
  const [showAureContent, setShowAureContent] = useState(false);
  const [videoPIP, setVideoPIP] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [showGoldPlay, setShowGoldPlay] = useState(false);
  const [showSoundOverlay, setShowSoundOverlay] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [likeIsValue, setLikeIsValue] = useState(false);
  const [showFinalContent, setShowFinalContent] = useState(false);

  /* ── YouTube IFrame API setup ── */
  useEffect(() => {
    isMobileRef.current = window.innerWidth < 768;
    setIsMobile(window.innerWidth < 768);

    const onResize = () => {
      const m = window.innerWidth < 768;
      isMobileRef.current = m;
      setIsMobile(m);
    };
    window.addEventListener("resize", onResize);

    // Load YT API
    if (!document.getElementById("yt-api-script")) {
      const tag = document.createElement("script");
      tag.id = "yt-api-script";
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT!.Player("yt-player", {
        videoId: VIDEO_ID,
        playerVars: {
          autoplay: 1,
          mute: 1,
          rel: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          controls: 0,
          showinfo: 0,
          fs: 0,
          playsinline: 1,
        },
        events: {
          onReady: (e: any) => {
            playerReadyRef.current = true;
            durationRef.current = e.target.getDuration();
            e.target.playVideo();
          },
          onStateChange: (e: any) => {
            if (e.data === window.YT!.PlayerState.ENDED) {
              setVideoEnded(true);
              document.title = "aureliex";
            }
          },
        },
      });
    };

    // If YT already loaded
    if (window.YT && window.YT.Player) {
      window.onYouTubeIframeAPIReady();
    }

    return () => {
      window.removeEventListener("resize", onResize);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  /* ── Phase polling (250ms) ── */
  useEffect(() => {
    let likeBase = 47102;
    let lastLikeInc = Date.now();
    let nextIncDelay = 3000 + Math.random() * 5000;

    pollRef.current = setInterval(() => {
      const player = playerRef.current;
      if (!player || !playerReadyRef.current) return;

      let ct: number;
      try {
        ct = player.getCurrentTime();
      } catch {
        return;
      }
      const dur = durationRef.current || 1;
      setProgress(ct / dur);

      const now = Date.now();
      let newPhase = 0;

      // v2 reel timestamps (3:01 total):
      // 0:00-0:40 Wesley Wang | 0:40-1:05 WKW | 1:06-1:42 Rocks | 1:42-3:01 Ted Lasso
      if (ct < 35) {
        newPhase = 0;       // Pure YouTube
      } else if (ct < 66) {
        newPhase = 1;       // 0:35 — like count ticking
      } else if (ct < 102) {
        newPhase = 2;       // 1:06 — dip-to-black, progress bar goes gold
      } else if (ct < 140) {
        newPhase = 3;       // 1:42 — smash cut to Lasso, chrome dissolves
      } else if (ct < 175) {
        newPhase = 5;       // 2:20 — PIP + full reveal
      } else {
        newPhase = 6;       // 2:55+ — "drinks on me" freeze + end
      }

      // Phase 1: like count resolving
      if (newPhase >= 1 && !triggeredRef.current.has(100)) {
        // Start incrementing likes
      }
      if (newPhase >= 1 && newPhase < 3) {
        if (now - lastLikeInc > nextIncDelay) {
          likeBase++;
          setLikeCount(likeBase.toLocaleString());
          lastLikeInc = now;
          nextIncDelay = 3000 + Math.random() * 5000;
        } else if (!triggeredRef.current.has(100)) {
          setLikeCount(likeBase.toLocaleString());
          triggeredRef.current.add(100);
        }
      }

      // Phase 2: color bleed
      if (newPhase >= 2 && !triggeredRef.current.has(200)) {
        triggeredRef.current.add(200);
        setProgressBarColor("#f0d890");
        setSubscribeBg("rgba(240,216,144,0.15)");
        setSubscribeColor("#f0d890");
        setAvatarBorder("2px solid rgba(240,216,144,0.5)");
      }

      // Phase 3: the hinge
      if (newPhase >= 3 && !triggeredRef.current.has(300)) {
        triggeredRef.current.add(300);

        // Pause
        try { player.pauseVideo(); } catch { /* */ }

        // Character swap
        const oldTitle = "nothing, except everything";
        const newTitle = fmt(total) + " → $100,000";
        const maxLen = Math.max(oldTitle.length, newTitle.length);
        const chars: { ch: string; fading: boolean; delay: number }[] = [];
        for (let i = 0; i < maxLen; i++) {
          chars.push({
            ch: i < newTitle.length ? newTitle[i] : "",
            fading: true,
            delay: i * 40,
          });
        }
        setTitleChars(chars);
        setTimeout(() => {
          setTitleChars(null);
          setTitleText(newTitle);
        }, maxLen * 40 + 600);

        // Like → portfolio value
        setLikeCount(fmt(total));
        setLikeIsValue(true);

        // Dislike → 0.000%
        setDislikeText("0.000%");

        // Subscribe fades
        setSubscribeVisible(false);

        // Subscribers → days left
        setSubscriberText(`${d} days left`);

        // Show gold play button
        setShowGoldPlay(true);

        // Auto-resume after 5s
        setTimeout(() => {
          setShowGoldPlay(false);
          try { player.playVideo(); } catch { /* */ }
          // Phase 4 dissolve
          triggeredRef.current.add(400);
          setChromeVisible(false);
          setBgColor("#050505");
          setShowAureContent(true);
        }, 5000);
      }

      // Phase 5: PIP
      if (newPhase >= 5 && !triggeredRef.current.has(500)) {
        triggeredRef.current.add(500);
        setVideoPIP(true);
        setShowFinalContent(true);
      }

      if (newPhase !== phaseRef.current) {
        phaseRef.current = newPhase;
        setPhase(newPhase);
      }
    }, 250);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [total, d]);

  /* ── handlers ── */
  const handleUnmute = useCallback(() => {
    try {
      playerRef.current?.unMute();
      playerRef.current?.setVolume(100);
    } catch { /* */ }
    setShowSoundOverlay(false);
  }, []);

  const handleGoldPlay = useCallback(() => {
    setShowGoldPlay(false);
    try { playerRef.current?.playVideo(); } catch { /* */ }
    triggeredRef.current.add(400);
    setChromeVisible(false);
    setBgColor("#050505");
    setShowAureContent(true);
  }, []);

  /* ── render ── */
  return (
    <div className="D">
      <style>{CSS}</style>

      {/* ── VIDEO CONTAINER ── */}
      <div
        className={`D-video-wrap ${videoPIP ? "D-video-wrap--pip" : ""} ${videoEnded ? "D-video-wrap--ended" : ""}`}
        style={{ background: bgColor }}
      >
        <div className="D-page" style={{ background: bgColor, transition: "background 3s ease" }}>

          {/* Video player */}
          <div className={`D-video ${videoPIP ? "D-video--pip" : ""}`}>
            <div className="D-video-inner">
              <div id="yt-player" />
            </div>

            {/* Progress bar (fake) */}
            {!isMobile && phase < 4 && (
              <div className="D-progress-bar">
                <div
                  className="D-progress-fill"
                  style={{
                    width: `${progress * 100}%`,
                    background: progressBarColor,
                    transition: "background 5s ease",
                  }}
                />
              </div>
            )}

            {/* Sound overlay */}
            {showSoundOverlay && (
              <button className="D-sound-btn" onClick={handleUnmute}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 5L6 9H2v6h4l5 4V5z" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
                <span>Click for sound</span>
              </button>
            )}

            {/* Gold play button (Phase 3) */}
            {showGoldPlay && (
              <button className="D-gold-play" onClick={handleGoldPlay}>
                <svg width="24" height="28" viewBox="0 0 24 28" fill="none">
                  <path d="M4 2L22 14L4 26V2Z" fill="rgba(240,216,144,0.6)" />
                </svg>
              </button>
            )}
          </div>

          {/* ── FAKE YOUTUBE CHROME (desktop only) ── */}
          {!isMobile && (
            <div
              className="D-chrome"
              style={{
                opacity: chromeVisible ? 1 : 0,
                transition: "opacity 2s ease",
                pointerEvents: chromeVisible ? "auto" : "none",
              }}
            >
              {/* Separator */}
              <div className="D-chrome-sep" />

              {/* Title */}
              <div className="D-chrome-title">
                {titleChars ? (
                  titleChars.map((c, i) => (
                    <span
                      key={i}
                      className="D-char-swap"
                      style={{
                        animationDelay: `${c.delay}ms`,
                      }}
                    >
                      {c.ch}
                    </span>
                  ))
                ) : (
                  titleText
                )}
              </div>

              {/* Channel row */}
              <div className="D-chrome-channel">
                <div className="D-chrome-avatar" style={{ border: avatarBorder, transition: "border 5s ease" }}>
                  a
                </div>
                <div className="D-chrome-channel-info">
                  <span className="D-chrome-channel-name">aureliex</span>
                  <span className="D-chrome-subs">{subscriberText}</span>
                </div>
                {subscribeVisible && (
                  <button
                    className="D-chrome-subscribe"
                    style={{
                      background: subscribeBg,
                      color: subscribeColor,
                      transition: "background 5s ease, color 5s ease, opacity 1s ease",
                    }}
                  >
                    Subscribe
                  </button>
                )}
              </div>

              {/* Actions row */}
              <div className="D-chrome-actions">
                <div className="D-chrome-action">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M7 22V11l-5-5 1-4h5l2 2h4l2-2h5l1 4-5 5v11" />
                  </svg>
                  <span className={likeIsValue ? "D-chrome-action-value" : ""}>{likeCount}</span>
                </div>
                <div className="D-chrome-action-divider" />
                <div className="D-chrome-action">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ transform: "rotate(180deg)" }}>
                    <path d="M7 22V11l-5-5 1-4h5l2 2h4l2-2h5l1 4-5 5v11" />
                  </svg>
                  {dislikeText && <span>{dislikeText}</span>}
                </div>
                <div className="D-chrome-action">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                  <span>Share</span>
                </div>
                <div className="D-chrome-action">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>Download</span>
                </div>
              </div>
            </div>
          )}

          {/* ── PHASE 4 AURE CONTENT ── */}
          {showAureContent && !showFinalContent && (
            <div className="D-aure-content">
              <p className="D-aure-line1">five AI agents argue every trade.</p>
              <p className="D-aure-line2">the monte carlo says 0.000%.</p>
              <p className="D-aure-line3">every dollar is real.</p>
            </div>
          )}

          {/* ── PHASE 5 FINAL CONTENT — the funnel ── */}
          {showFinalContent && (
            <div className="D-final">
              <h1 className="D-final-value">{fmt(total)}</h1>
              <p className="D-final-target">→ $100,000 · {d} days</p>
              <p className="D-final-question">do you think he makes it?</p>

              {/* Two primary funnels */}
              <div className="D-funnels">
                <a href="/art" className="D-funnel">
                  <div className="D-funnel-img">
                    <img src="/art/auction-piece.jpg" alt="LOT 001" />
                  </div>
                  <div className="D-funnel-text">
                    <span className="D-funnel-eyebrow">// lot 001 · auction</span>
                    <span className="D-funnel-title">the art piece</span>
                    <span className="D-funnel-sub">opening bid $25 · backed by 10% of portfolio</span>
                  </div>
                </a>
                <a href="/invest" className={`D-funnel ${videoEnded ? "D-funnel--pulse" : ""}`}>
                  <div className="D-funnel-icon">
                    <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="rgba(240,216,144,0.4)" strokeWidth="1">
                      <rect x="2" y="7" width="20" height="14" rx="2" />
                      <path d="M16 7V5a4 4 0 00-8 0v2" />
                    </svg>
                  </div>
                  <div className="D-funnel-text">
                    <span className="D-funnel-eyebrow">// june 21 · liquidity event</span>
                    <span className="D-funnel-title">the party</span>
                    <span className="D-funnel-sub">10% dividend pool · flight comp · stake ∝ earliness × size</span>
                  </div>
                </a>
              </div>

              {/* Four revolutions */}
              <div className="D-revolutions">
                <a href="https://aureliex.com/green-credit" className="D-rev">
                  <span className="D-rev-label">the financial revolution</span>
                </a>
                <a href="https://aureliex.com/archive" className="D-rev">
                  <span className="D-rev-label">the art revolution</span>
                </a>
                <a href="https://aureliex.com/letters/round-1" className="D-rev">
                  <span className="D-rev-label">the socialism revolution</span>
                </a>
                <a href="https://aureliex.com/letters/entrenched-coils" className="D-rev">
                  <span className="D-rev-label">the ai revolution</span>
                </a>
              </div>

              {/* "drinks on me" — echoes the video's last line */}
              {videoEnded && (
                <p className="D-drinks">drinks are on me.</p>
              )}

              <p className="D-final-sig">aureliex.com</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   STYLES
   ══════════════════════════════════════════════════════ */

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=JetBrains+Mono:wght@400;500&family=Roboto:wght@400;500;600&display=swap');

  .D {
    position: fixed; inset: 0;
    background: #0f0f0f;
    overflow: hidden;
    -webkit-font-smoothing: antialiased;
  }

  .D-video-wrap {
    position: fixed; inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: background 3s ease;
  }

  .D-page {
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
    padding: 24px 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100vh;
    overflow-y: auto;
  }

  /* ── VIDEO ── */
  .D-video {
    position: relative;
    width: 85vw;
    max-width: 860px;
    aspect-ratio: 16 / 9;
    border-radius: 12px;
    overflow: hidden;
    background: #000;
    margin-top: 16px;
    transition: all 2s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 10;
  }
  .D-video--pip {
    position: fixed;
    top: 20px;
    right: 20px;
    width: 300px;
    max-width: 300px;
    margin-top: 0;
    border-radius: 8px;
    z-index: 100;
    box-shadow: 0 8px 32px rgba(0,0,0,0.6);
  }
  .D-video-wrap--ended .D-video--pip {
    opacity: 0;
    transition: opacity 2s ease;
    pointer-events: none;
  }
  .D-video-inner {
    width: 100%;
    height: 100%;
    position: relative;
  }
  .D-video-inner iframe,
  .D-video-inner > div {
    width: 100% !important;
    height: 100% !important;
    position: absolute;
    top: 0; left: 0;
    border: none;
  }

  /* ── PROGRESS BAR ── */
  .D-progress-bar {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 3px;
    background: rgba(255,255,255,0.2);
    z-index: 20;
  }
  .D-progress-fill {
    height: 100%;
    border-radius: 0 2px 2px 0;
    transition: background 5s ease;
  }

  /* ── SOUND BUTTON ── */
  .D-sound-btn {
    position: absolute;
    top: 12px; right: 12px;
    z-index: 30;
    display: flex; align-items: center; gap: 6px;
    background: rgba(0,0,0,0.7);
    color: #fff;
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 4px;
    padding: 6px 12px;
    font-family: Roboto, sans-serif;
    font-size: 12px;
    cursor: pointer;
    backdrop-filter: blur(4px);
    transition: opacity 0.3s;
  }
  .D-sound-btn:hover {
    background: rgba(0,0,0,0.85);
  }

  /* ── GOLD PLAY BUTTON ── */
  .D-gold-play {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    z-index: 30;
    width: 64px; height: 64px;
    border-radius: 50%;
    border: 1px solid rgba(240,216,144,0.3);
    background: rgba(240,216,144,0.08);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: background 0.3s, border-color 0.3s;
    animation: gold-pulse 2s ease-in-out infinite;
  }
  .D-gold-play:hover {
    background: rgba(240,216,144,0.15);
    border-color: rgba(240,216,144,0.5);
  }
  @keyframes gold-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(240,216,144,0.15); }
    50% { box-shadow: 0 0 20px 8px rgba(240,216,144,0.08); }
  }

  /* ── FAKE YOUTUBE CHROME ── */
  .D-chrome {
    width: 85vw;
    max-width: 860px;
    padding: 0 0 24px;
  }
  .D-chrome-sep {
    height: 1px;
    background: #272727;
    margin: 0 0 12px;
  }
  .D-chrome-title {
    font-family: Roboto, sans-serif;
    font-size: 20px;
    font-weight: 600;
    color: #f1f1f1;
    line-height: 1.4;
    margin-bottom: 12px;
  }

  /* Character swap animation */
  .D-char-swap {
    display: inline-block;
    animation: char-fade-in 0.4s ease forwards;
    opacity: 0;
  }
  @keyframes char-fade-in {
    0% { opacity: 0; transform: translateY(4px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  /* Channel row */
  .D-chrome-channel {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }
  .D-chrome-avatar {
    width: 36px; height: 36px;
    border-radius: 50%;
    background: #555;
    display: flex; align-items: center; justify-content: center;
    font-family: Roboto, sans-serif;
    font-size: 16px;
    font-weight: 500;
    color: #e8e4dc;
    flex-shrink: 0;
    transition: border 5s ease;
  }
  .D-chrome-channel-info {
    display: flex; flex-direction: column; gap: 1px;
    flex: 1;
  }
  .D-chrome-channel-name {
    font-family: Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    color: #f1f1f1;
  }
  .D-chrome-subs {
    font-family: Roboto, sans-serif;
    font-size: 12px;
    color: #aaa;
    transition: color 1s ease;
  }
  .D-chrome-subscribe {
    font-family: Roboto, sans-serif;
    font-size: 14px;
    font-weight: 600;
    border: none;
    border-radius: 20px;
    padding: 8px 16px;
    cursor: pointer;
    transition: background 5s ease, color 5s ease, opacity 1s ease;
  }

  /* Actions row */
  .D-chrome-actions {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .D-chrome-action {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: Roboto, sans-serif;
    font-size: 14px;
    color: #f1f1f1;
    cursor: default;
  }
  .D-chrome-action svg {
    opacity: 0.9;
  }
  .D-chrome-action-value {
    font-family: 'JetBrains Mono', monospace !important;
    color: #f0d890 !important;
    font-weight: 500;
  }
  .D-chrome-action-divider {
    width: 1px;
    height: 20px;
    background: #555;
  }

  /* ── PHASE 4: AURE CONTENT ── */
  .D-aure-content {
    width: 85vw;
    max-width: 860px;
    padding: 32px 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
    animation: aure-fade 2s ease forwards;
    opacity: 0;
  }
  @keyframes aure-fade {
    0% { opacity: 0; transform: translateY(12px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  .D-aure-line1 {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 18px;
    color: rgba(232,228,220,0.4);
    margin: 0;
  }
  .D-aure-line2 {
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    color: rgba(232,228,220,0.2);
    margin: 0;
  }
  .D-aure-line3 {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 16px;
    font-style: italic;
    color: rgba(240,216,144,0.3);
    margin: 0;
  }

  /* ── PHASE 5: FINAL CONTENT ── */
  .D-final {
    position: fixed;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    z-index: 50;
    animation: final-fade 2s ease forwards;
    opacity: 0;
  }
  @keyframes final-fade {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  .D-final-value {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: clamp(48px, 10vw, 80px);
    font-weight: 500;
    color: #f0d890;
    letter-spacing: -0.02em;
    margin: 0;
    line-height: 1;
  }
  .D-final-target {
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    color: rgba(232,228,220,0.3);
    margin: 0;
  }
  .D-final-question {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 22px;
    font-style: italic;
    color: rgba(232,228,220,0.5);
    margin: 24px 0 0;
  }
  .D-final-nav {
    display: flex;
    gap: 4px;
    margin-top: 24px;
  }
  .D-final-nav a {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: rgba(232,228,220,0.15);
    text-decoration: none;
    padding: 6px 10px;
    transition: color 0.2s;
  }
  .D-final-nav a:hover { color: #e8e4dc; }
  .D-funnel--pulse {
    border-color: rgba(201,168,76,0.4) !important;
    background: rgba(201,168,76,0.06) !important;
    animation: funnel-pulse 2s ease 1;
  }
  @keyframes funnel-pulse {
    0% { box-shadow: 0 0 0 0 rgba(201,168,76,0.3); }
    50% { box-shadow: 0 0 20px 4px rgba(201,168,76,0.15); }
    100% { box-shadow: 0 0 0 0 rgba(201,168,76,0); }
  }
  .D-drinks {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 18px;
    font-style: italic;
    color: #C9A84C;
    margin-top: 24px;
    animation: drinks-fade 1.5s ease forwards;
  }
  @keyframes drinks-fade {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .D-final-sig {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: rgba(232,228,220,0.06);
    margin-top: 32px;
    letter-spacing: 0.15em;
  }

  /* ── FUNNELS ── */
  .D-funnels {
    display: flex; gap: 20px;
    margin-top: 28px; width: 100%; max-width: 600px;
  }
  .D-funnel {
    flex: 1; display: flex; flex-direction: column;
    gap: 12px; padding: 16px;
    border: 1px solid rgba(240,216,144,0.08);
    border-radius: 6px;
    text-decoration: none; color: #e8e4dc;
    transition: border-color 0.3s, background 0.3s;
    cursor: pointer;
  }
  .D-funnel:hover {
    border-color: rgba(240,216,144,0.2);
    background: rgba(240,216,144,0.03);
  }
  .D-funnel-img {
    width: 100%; aspect-ratio: 4/3;
    border-radius: 3px; overflow: hidden;
  }
  .D-funnel-img img {
    width: 100%; height: 100%; object-fit: cover;
    filter: brightness(0.85) contrast(1.1);
    transition: filter 0.3s;
  }
  .D-funnel:hover .D-funnel-img img {
    filter: brightness(1) contrast(1.1);
  }
  .D-funnel-icon {
    display: flex; align-items: center; justify-content: center;
    height: 80px;
  }
  .D-funnel-text {
    display: flex; flex-direction: column; gap: 4px;
  }
  .D-funnel-eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px; letter-spacing: 0.15em;
    color: rgba(201,168,76,0.4);
  }
  .D-funnel-title {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 18px; font-weight: 500;
    color: #e8e4dc;
  }
  .D-funnel-sub {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; color: rgba(232,228,220,0.25);
    line-height: 1.5;
  }

  /* ── REVOLUTIONS ── */
  .D-revolutions {
    display: flex; gap: 0; margin-top: 24px;
    flex-wrap: wrap; justify-content: center;
  }
  .D-rev {
    text-decoration: none;
    padding: 8px 14px;
  }
  .D-rev-label {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 13px; font-style: italic;
    color: rgba(232,228,220,0.18);
    transition: color 0.3s;
  }
  .D-rev:hover .D-rev-label {
    color: rgba(240,216,144,0.5);
  }

  /* ── MOBILE ── */
  @media (max-width: 768px) {
    .D-video {
      width: 95vw;
      margin-top: 40px;
    }
    .D-video--pip {
      width: 160px;
      top: 12px;
      right: 12px;
    }
    .D-final-value {
      font-size: clamp(36px, 12vw, 56px);
    }
    .D-final-question {
      font-size: 18px;
      padding: 0 24px;
      text-align: center;
    }
    .D-funnels { flex-direction: column; }
    .D-revolutions { flex-direction: column; align-items: center; gap: 0; }
    .D-aure-content {
      width: 90vw;
      padding: 24px 0;
    }
  }
`;
