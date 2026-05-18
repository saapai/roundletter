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
const VIDEO_ID = "zASKzSAA9t8";

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
  const likeBaseRef = useRef(47102);
  const lastLikeIncRef = useRef(Date.now());
  const nextIncDelayRef = useRef(3000 + Math.random() * 5000);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  const [showSoundOverlay, setShowSoundOverlay] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [likeIsValue, setLikeIsValue] = useState(false);
  const [showFinalContent, setShowFinalContent] = useState(false);
  const [showBBQ, setShowBBQ] = useState(false);

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
          mute: 0,
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
    // likeBase, lastLikeInc, nextIncDelay moved to refs to survive re-renders

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
        if (now - lastLikeIncRef.current > nextIncDelayRef.current) {
          likeBaseRef.current++;
          setLikeCount(likeBaseRef.current.toLocaleString());
          lastLikeIncRef.current = now;
          nextIncDelayRef.current = 3000 + Math.random() * 5000;
        } else if (!triggeredRef.current.has(100)) {
          setLikeCount(likeBaseRef.current.toLocaleString());
          triggeredRef.current.add(100);
        }
      }

      // Phase 2: subtle hint only (gold shift delayed to Phase 3 resume)
      if (newPhase >= 2 && !triggeredRef.current.has(200)) {
        triggeredRef.current.add(200);
        // Just a subtle avatar border hint — gold comes with Lasso
        setAvatarBorder("1px solid rgba(240,216,144,0.2)");
      }

      // Phase 3: the hinge
      if (newPhase >= 3 && !triggeredRef.current.has(300)) {
        triggeredRef.current.add(300);

        // No pause — video keeps playing through the transformation

        // Character swap
        const oldTitle = "nothing, except everything";
        const newTitle = fmt(total) + " → $100,000";
        const maxLen = Math.max(oldTitle.length, newTitle.length);
        const chars: { ch: string; fading: boolean; delay: number }[] = [];
        for (let i = 0; i < maxLen; i++) {
          chars.push({
            ch: i < newTitle.length ? newTitle[i] : "",
            fading: true,
            delay: i * 55,
          });
        }
        setTitleChars(chars);
        const swapDuration = maxLen * 55 + 600;
        setTimeout(() => {
          setTitleChars(null);
          setTitleText(newTitle);
        }, swapDuration);

        // Like → portfolio value
        setLikeCount(fmt(total));
        setLikeIsValue(true);

        // Dislike → 0.000%
        setDislikeText("0.000%");

        // Subscribe fades
        setSubscribeVisible(false);

        // Subscribers → days left
        setSubscriberText(`${d} days left`);

        // Gold color shift + chrome dissolve after char swap finishes
        setTimeout(() => {
          setProgressBarColor("#f0d890");
          setSubscribeBg("rgba(240,216,144,0.15)");
          setSubscribeColor("#f0d890");
          setAvatarBorder("2px solid rgba(240,216,144,0.5)");
          triggeredRef.current.add(400);
          setChromeVisible(false);
          setBgColor("#050505");
          setShowAureContent(true);
        }, swapDuration + 1500);
      }

      // Phase 5: PIP
      if (newPhase >= 5 && !triggeredRef.current.has(500)) {
        triggeredRef.current.add(500);
        setVideoPIP(true);
        setShowFinalContent(true);
      }

      // Barbecue sauce moment at ~2:42
      if (ct >= 162 && ct < 165 && !triggeredRef.current.has(600)) {
        triggeredRef.current.add(600);
        setShowBBQ(true);
        setTimeout(() => setShowBBQ(false), 2500);
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
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    setShowGoldPlay(false);
    try { playerRef.current?.playVideo(); } catch { /* */ }
    setProgressBarColor("#f0d890");
    setSubscribeBg("rgba(240,216,144,0.15)");
    setSubscribeColor("#f0d890");
    setAvatarBorder("2px solid rgba(240,216,144,0.5)");
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
            {!isMobile && phase >= 1 && phase < 4 && (
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

          {/* Barbecue sauce flash */}
          {showBBQ && (
            <div className="D-bbq">barbecue sauce</div>
          )}

          {/* ── FAKE YOUTUBE CHROME (desktop only) ── */}
          {!isMobile && (
            <div
              className={`D-chrome ${!chromeVisible ? "D-chrome--dissolving" : ""}`}
              style={{
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

              {/* Channel row — matches YouTube dark mode 2025 */}
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

              {/* Actions row — YouTube pill buttons */}
              <div className="D-chrome-actions">
                <div className="D-chrome-like-pill">
                  <button className="D-chrome-like-btn">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M18.77 11h-4.23l1.52-4.94C16.38 5.03 15.54 4 14.38 4c-.58 0-1.14.24-1.52.65L7 11H1v11h16.21a2.99 2.99 0 002.86-2.13l1.9-6.36c.13-.42.05-.88-.2-1.24A1.54 1.54 0 0018.77 11z" opacity="0" />
                      <path d="M7 11l5-7c1.12 0 2.09.82 2.23 1.93L13 11h6.77c.45 0 .86.22 1.12.58.25.36.33.82.2 1.24l-1.9 6.36A2.99 2.99 0 0116.21 22H1V11h6zm-1 1H2v9h4v-9z" fill="none" stroke="currentColor" strokeWidth="1" />
                    </svg>
                    <span className={likeIsValue ? "D-chrome-action-value" : ""}>{likeCount}</span>
                  </button>
                  <div className="D-chrome-pill-divider" />
                  <button className="D-chrome-dislike-btn">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1">
                      <path d="M17 13l-5 7c-1.12 0-2.09-.82-2.23-1.93L11 13H4.23c-.45 0-.86-.22-1.12-.58a1.54 1.54 0 01-.2-1.24l1.9-6.36A2.99 2.99 0 017.79 2H23v11h-6zm1-1h4V3h-4v9z" />
                    </svg>
                    {dislikeText && <span>{dislikeText}</span>}
                  </button>
                </div>
                <button className="D-chrome-action-pill">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M15 5.63L20.66 12 15 18.37V14h-1c-3.96 0-7.14 1-9.75 3.09 1.84-4.07 5.11-6.4 9.89-7.1l.86-.13V5.63M14 3v6C6.22 10.13 3.11 15.33 2 21c2.78-3.97 6.44-6 12-6v6l8-9-8-9z" />
                  </svg>
                  Share
                </button>
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

          {/* ── PHASE 5 FINAL CONTENT ── */}
          {showFinalContent && (
            <div className="D-final">
              {/* Wave 1: The golden flash */}
              <div className="D-drinks-flash">
                <span className="D-drinks-text">drinks are on me.</span>
                <div className="D-drinks-flare" />
              </div>

              {/* Wave 2: The score */}
              <div className="D-score-block">
                <div className="D-score-number">{fmt(total)}</div>
                <div className="D-score-meta">
                  <span className="D-score-arrow">→</span>
                  <span className="D-score-target">$100,000</span>
                  <span className="D-score-sep">·</span>
                  <span className="D-score-days">{d} days</span>
                </div>
                <p className="D-score-question">do you think he makes it?</p>
              </div>

              {/* Wave 3: Two actions — editorial rows */}
              <div className="D-actions-block">
                <a href="/art" className="D-action-row">
                  <span className="D-action-num">001</span>
                  <span className="D-action-div" />
                  <div className="D-action-body">
                    <span className="D-action-name">the art piece</span>
                    <span className="D-action-detail">opening bid $25 · backed by 10% of portfolio</span>
                  </div>
                  <span className="D-action-go">→</span>
                </a>
                <a href="/invest" className={`D-action-row ${videoEnded ? "D-action-row--glow" : ""}`}>
                  <span className="D-action-num">002</span>
                  <span className="D-action-div" />
                  <div className="D-action-body">
                    <span className="D-action-name">the party</span>
                    <span className="D-action-detail">june 21 · 10% dividend · flight comp · stake ∝ earliness</span>
                  </div>
                  <span className="D-action-go">→</span>
                </a>
              </div>

              {/* Four doors */}
              <div className="D-doors-grid">
                <a href="https://aureliex.com/green-credit" className="D-door-panel">
                  <span className="D-door-roman">I</span>
                  <span className="D-door-name">the financial<br/>revolution</span>
                </a>
                <a href="https://aureliex.com/archive" className="D-door-panel">
                  <span className="D-door-roman">II</span>
                  <span className="D-door-name">the art<br/>revolution</span>
                </a>
                <a href="https://aureliex.com/letters/round-1" className="D-door-panel">
                  <span className="D-door-roman">III</span>
                  <span className="D-door-name">the socialist<br/>revolution</span>
                </a>
                <a href="https://aureliex.com/letters/entrenched-coils" className="D-door-panel">
                  <span className="D-door-roman">IV</span>
                  <span className="D-door-name">the ai<br/>revolution</span>
                </a>
              </div>

              <p className="D-sig">aureliex.com</p>
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
    padding: 40px 16px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100vh;
    overflow-y: auto;
    justify-content: flex-start;
  }

  /* ── VIDEO ── */
  .D-video {
    position: relative;
    width: 80vw;
    max-width: 800px;
    max-height: 65vh;
    aspect-ratio: 16 / 9;
    border-radius: 12px;
    overflow: hidden;
    background: #000;
    margin-top: 12px;
    transition:
      width 2s cubic-bezier(0.22, 1, 0.36, 1),
      max-width 2s cubic-bezier(0.22, 1, 0.36, 1),
      margin-top 2s cubic-bezier(0.22, 1, 0.36, 1),
      border-radius 2s cubic-bezier(0.22, 1, 0.36, 1),
      box-shadow 2s cubic-bezier(0.22, 1, 0.36, 1),
      top 2s cubic-bezier(0.22, 1, 0.36, 1),
      right 2s cubic-bezier(0.22, 1, 0.36, 1);
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
    width: 80vw;
    max-width: 800px;
    padding: 12px 0 16px;
  }

  /* ── STAGGERED CHROME DISSOLUTION ── */
  .D-chrome--dissolving .D-chrome-actions {
    opacity: 0;
    transition: opacity 0.6s ease 0s;
  }
  .D-chrome--dissolving .D-chrome-subscribe {
    opacity: 0;
    transition: opacity 0.6s ease 0.3s;
  }
  .D-chrome--dissolving .D-chrome-channel-name {
    opacity: 0;
    transition: opacity 0.6s ease 0.8s;
  }
  .D-chrome--dissolving .D-chrome-subs {
    opacity: 0;
    transition: opacity 0.6s ease 0.8s;
  }
  .D-chrome--dissolving .D-chrome-title {
    opacity: 0;
    filter: blur(4px);
    transition: opacity 0.8s ease 1.2s, filter 0.8s ease 1.2s;
  }
  .D-chrome--dissolving .D-chrome-avatar {
    opacity: 0;
    transition: opacity 0.8s ease 1.5s;
  }

  .D-chrome-sep {
    display: none;
  }
  .D-chrome-title {
    font-family: Roboto, sans-serif;
    font-size: 20px;
    font-weight: 700;
    color: #f1f1f1;
    line-height: 1.3;
    margin-bottom: 12px;
  }

  /* Character swap animation */
  .D-char-swap {
    display: inline-block;
    animation: char-fade-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    opacity: 0;
  }
  @keyframes char-fade-in {
    0% { opacity: 0; transform: translateY(8px) scaleY(0.3); filter: blur(3px); }
    30% { opacity: 0.7; transform: translateY(-2px) scaleY(1.1); filter: blur(1px); }
    60% { opacity: 0.9; transform: translateY(1px) scaleY(0.95); filter: blur(0); }
    100% { opacity: 1; transform: translateY(0) scaleY(1); filter: blur(0); }
  }

  /* Channel row */
  .D-chrome-channel {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }
  .D-chrome-avatar {
    width: 40px; height: 40px;
    border-radius: 50%;
    background: #272727;
    display: flex; align-items: center; justify-content: center;
    font-family: Roboto, sans-serif;
    font-size: 16px;
    font-weight: 500;
    color: #aaa;
    flex-shrink: 0;
    transition: border 5s ease;
  }
  .D-chrome-channel-info {
    display: flex; flex-direction: column; gap: 0;
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

  /* Actions row — YouTube 2025 pill buttons */
  .D-chrome-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .D-chrome-like-pill {
    display: flex;
    align-items: center;
    background: #272727;
    border-radius: 18px;
    overflow: hidden;
  }
  .D-chrome-like-btn, .D-chrome-dislike-btn {
    display: flex; align-items: center; gap: 6px;
    background: none; border: none; color: #f1f1f1;
    font-family: Roboto, sans-serif; font-size: 14px;
    padding: 8px 16px; cursor: default;
    font-variant-numeric: tabular-nums;
  }
  .D-chrome-like-btn { padding-right: 12px; }
  .D-chrome-dislike-btn { padding-left: 12px; }
  .D-chrome-pill-divider {
    width: 1px; height: 24px;
    background: #494949;
  }
  .D-chrome-like-btn svg, .D-chrome-dislike-btn svg { flex-shrink: 0; }
  .D-chrome-action-value {
    font-family: 'JetBrains Mono', monospace !important;
    color: #dbb645 !important;
    font-weight: 500;
    animation: value-pulse 0.8s ease;
  }
  @keyframes value-pulse {
    0% { transform: scale(1); }
    40% { transform: scale(1.08); }
    100% { transform: scale(1); }
  }
  .D-chrome-action-pill {
    display: flex; align-items: center; gap: 6px;
    background: #272727; border: none; color: #f1f1f1;
    border-radius: 18px; padding: 8px 16px;
    font-family: Roboto, sans-serif; font-size: 14px;
    cursor: default;
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

  /* ══ PHASE 5: FINAL REVEAL ══ */
  .D-final {
    position: fixed; inset: 0; z-index: 50;
    display: flex; flex-direction: column;
    justify-content: center; align-items: flex-start;
    padding: 48px 10vw 32px;
    overflow-y: auto;
  }

  /* ── DRINKS FLASH ── */
  .D-drinks-flash {
    position: relative; width: 100%;
    margin-bottom: 48px;
  }
  .D-drinks-text {
    display: block;
    font-family: 'EB Garamond', Georgia, serif;
    font-size: clamp(42px, 8vw, 96px);
    font-style: italic; font-weight: 400;
    color: #dbb645; letter-spacing: -0.02em;
    line-height: 1; position: relative; z-index: 2;
    animation: drinks-in 2.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  .D-drinks-flare {
    position: absolute; top: 50%; left: 0;
    width: 100%; height: 200%;
    transform: translateY(-50%);
    background: radial-gradient(ellipse 60% 50% at 30% 50%, rgba(219,182,69,0.15) 0%, rgba(219,182,69,0.04) 40%, transparent 70%);
    pointer-events: none; z-index: 1;
    animation: flare-pulse 3s ease forwards;
  }
  @keyframes drinks-in {
    0% { opacity: 0; transform: scale(1.6) translateY(-10%); filter: blur(12px); color: #f5e6a3; }
    15% { opacity: 1; filter: blur(0); color: #f5e6a3; }
    40% { transform: scale(1.0); color: #dbb645; }
    100% { opacity: 1; transform: scale(1) translateY(0); color: #dbb645; }
  }
  @keyframes flare-pulse {
    0% { opacity: 0; transform: translateY(-50%) scaleX(0.3); }
    20% { opacity: 1; transform: translateY(-50%) scaleX(1.1); }
    100% { opacity: 0.3; transform: translateY(-50%) scaleX(1); }
  }

  /* ── SCORE ── */
  .D-score-block {
    margin-bottom: 40px; opacity: 0;
    animation: score-in 1.5s ease 1.8s forwards;
  }
  .D-score-number {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: clamp(36px, 6vw, 64px);
    font-weight: 500; color: #e8e4dc;
    letter-spacing: -0.02em; line-height: 1;
    margin-bottom: 8px;
  }
  .D-score-meta {
    display: flex; align-items: baseline; gap: 8px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px; color: rgba(232,228,220,0.25);
    margin-bottom: 20px;
  }
  .D-score-arrow { color: rgba(219,182,69,0.4); }
  .D-score-target { color: rgba(232,228,220,0.35); }
  .D-score-sep { color: rgba(232,228,220,0.12); }
  .D-score-days { color: rgba(232,228,220,0.2); }
  .D-score-question {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 22px; font-style: italic;
    color: rgba(232,228,220,0.5); margin: 0;
  }
  @keyframes score-in {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* ── ACTIONS (editorial rows) ── */
  .D-actions-block {
    display: flex; flex-direction: column; gap: 0;
    width: 100%; max-width: 560px;
    margin-bottom: 40px; opacity: 0;
    animation: actions-in 1.2s ease 3.2s forwards;
  }
  .D-action-row {
    display: flex; align-items: center; gap: 16px;
    padding: 20px 0; text-decoration: none; color: #e8e4dc;
    border-top: 1px solid rgba(232,228,220,0.06);
    transition: all 0.4s ease; cursor: pointer;
  }
  .D-action-row:last-child { border-bottom: 1px solid rgba(232,228,220,0.06); }
  .D-action-row:hover { padding-left: 12px; border-color: rgba(219,182,69,0.15); }
  .D-action-num {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; letter-spacing: 0.2em;
    color: rgba(219,182,69,0.3); width: 36px; flex-shrink: 0;
  }
  .D-action-div {
    width: 1px; height: 32px;
    background: rgba(232,228,220,0.06); flex-shrink: 0;
  }
  .D-action-body { display: flex; flex-direction: column; gap: 4px; flex: 1; }
  .D-action-name {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 20px; font-weight: 500; color: #e8e4dc;
    transition: color 0.3s;
  }
  .D-action-row:hover .D-action-name { color: #dbb645; }
  .D-action-detail {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; color: rgba(232,228,220,0.2); line-height: 1.5;
  }
  .D-action-go {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 20px; color: rgba(232,228,220,0.1);
    transition: color 0.3s, transform 0.3s; flex-shrink: 0;
  }
  .D-action-row:hover .D-action-go { color: rgba(219,182,69,0.5); transform: translateX(4px); }
  .D-action-row--glow { animation: action-glow 2.5s ease 4.5s 1; }
  @keyframes action-glow {
    0% { background: transparent; }
    20% { background: rgba(219,182,69,0.04); }
    100% { background: transparent; }
  }
  @keyframes actions-in {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* ── DOORS ── */
  .D-doors-grid {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 2px; width: 100%; max-width: 480px;
    margin-bottom: 24px; opacity: 0;
    animation: doors-in 1.5s ease 4s forwards;
  }
  .D-door-panel {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 12px; padding: 24px 8px;
    text-decoration: none;
    border: 1px solid rgba(232,228,220,0.04);
    border-radius: 2px;
    transition: all 0.5s ease; cursor: pointer;
    position: relative; overflow: hidden;
  }
  .D-door-panel::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(219,182,69,0.03) 0%, transparent 100%);
    opacity: 0; transition: opacity 0.5s ease;
  }
  .D-door-panel:hover::before { opacity: 1; }
  .D-door-panel:hover { border-color: rgba(219,182,69,0.15); transform: translateY(-2px); }
  .D-door-roman {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 24px; font-weight: 400;
    color: rgba(219,182,69,0.25);
    transition: color 0.4s; position: relative; z-index: 1;
  }
  .D-door-panel:hover .D-door-roman { color: rgba(219,182,69,0.6); }
  .D-door-name {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 12px; font-style: italic;
    color: rgba(232,228,220,0.2); text-align: center;
    line-height: 1.5; transition: color 0.4s;
    position: relative; z-index: 1;
  }
  .D-door-panel:hover .D-door-name { color: rgba(232,228,220,0.5); }
  @keyframes doors-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* ── SIG ── */
  .D-sig {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; color: rgba(232,228,220,0.06);
    letter-spacing: 0.15em; margin-top: auto;
    opacity: 0; animation: sig-in 1s ease 5.5s forwards;
  }
  @keyframes sig-in { from { opacity: 0; } to { opacity: 1; } }

  /* ── BARBECUE SAUCE ── */
  .D-bbq {
    position: fixed; inset: 0; z-index: 200;
    display: flex; align-items: center; justify-content: center;
    pointer-events: none;
    animation: bbq-flash 2.5s ease forwards;
  }
  .D-bbq {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: clamp(48px, 12vw, 120px);
    font-weight: 500; font-style: italic;
    color: #c4622d;
    text-shadow: 0 0 60px rgba(196,98,45,0.3);
    letter-spacing: -0.02em;
  }
  @keyframes bbq-flash {
    0% { opacity: 0; transform: scale(0.8); filter: blur(8px); }
    12% { opacity: 1; filter: blur(0); transform: scale(1.05); }
    30% { opacity: 1; transform: scale(1); }
    70% { opacity: 0.8; }
    100% { opacity: 0; transform: scale(0.95); filter: blur(4px); }
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
    .D-aure-content {
      width: 90vw;
      padding: 24px 0;
    }
    .D-final { padding: 32px 24px 24px; align-items: flex-start; }
    .D-drinks-text { font-size: clamp(32px, 10vw, 52px); }
    .D-score-number { font-size: clamp(28px, 9vw, 44px); }
    .D-score-question { font-size: 18px; }
    .D-actions-block { max-width: 100%; }
    .D-action-row { gap: 12px; padding: 16px 0; }
    .D-action-name { font-size: 17px; }
    .D-action-num, .D-action-div { display: none; }
    .D-doors-grid { grid-template-columns: repeat(2, 1fr); max-width: 100%; }
    .D-door-panel { padding: 20px 8px; }
  }
`;
