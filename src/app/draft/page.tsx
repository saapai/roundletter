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
                <a href="/invest" className="D-drinks">drinks are on me.</a>
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
    max-height: 55vh;
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
    font-size: 18px;
    font-weight: 600;
    color: #f1f1f1;
    line-height: 1.4;
    margin-bottom: 8px;
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
    gap: 10px;
    margin-bottom: 10px;
  }
  .D-chrome-avatar {
    width: 32px; height: 32px;
    border-radius: 50%;
    background: #333;
    display: flex; align-items: center; justify-content: center;
    font-family: Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    color: #aaa;
    flex-shrink: 0;
    transition: border 5s ease;
  }
  .D-chrome-channel-info {
    display: flex; flex-direction: column; gap: 0;
    margin-right: auto;
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
    font-variant-numeric: tabular-nums;
  }
  .D-chrome-action svg {
    opacity: 0.9;
  }
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
    overflow-y: auto;
    padding: 40px 16px;
  }
  .D-final > * {
    opacity: 0;
    animation: final-child-in 1.2s ease forwards;
  }
  .D-final > *:nth-child(1) { animation-delay: 0s; }
  .D-final > *:nth-child(2) { animation-delay: 0.5s; }
  .D-final > *:nth-child(3) { animation-delay: 1.2s; }
  .D-final > *:nth-child(4) { animation-delay: 2.5s; }
  .D-final > *:nth-child(5) { animation-delay: 4s; }
  .D-final > *:nth-child(6) { animation-delay: 4s; }
  .D-final > *:nth-child(7) { animation-delay: 5.5s; }
  @keyframes final-child-in {
    from { opacity: 0; transform: translateY(12px); filter: blur(2px); }
    to { opacity: 1; transform: translateY(0); filter: blur(0); }
  }
  .D-final-value {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: clamp(48px, 10vw, 80px);
    font-weight: 500;
    color: #dbb645;
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
    font-size: 24px;
    font-style: italic;
    color: rgba(232,228,220,0.7);
    margin: 32px 0 0;
    letter-spacing: 0.01em;
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
    0% { box-shadow: 0 0 0 0 rgba(201,168,76,0.4); }
    30% { box-shadow: 0 0 24px 6px rgba(201,168,76,0.2); }
    60% { box-shadow: 0 0 12px 2px rgba(201,168,76,0.1); }
    100% { box-shadow: 0 0 0 0 rgba(201,168,76,0); }
  }
  .D-drinks {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 20px; font-style: italic;
    color: #dbb645; margin-top: 32px;
    text-decoration: none; position: relative;
    animation: drinks-entrance 2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  .D-drinks::after {
    content: ''; position: absolute;
    bottom: -4px; left: 50%; transform: translateX(-50%);
    width: 0; height: 1px;
    background: linear-gradient(90deg, transparent, #dbb645, transparent);
    animation: drinks-line 1.5s ease 1s forwards;
  }
  .D-drinks::before {
    content: ''; position: absolute;
    top: 50%; left: 50%; transform: translate(-50%, -50%);
    width: 200px; height: 60px;
    background: radial-gradient(ellipse, rgba(219,182,69,0.08) 0%, transparent 70%);
    animation: drinks-glow 3s ease forwards;
    pointer-events: none; z-index: -1;
  }
  @keyframes drinks-entrance {
    0% { opacity: 0; transform: translateY(16px); letter-spacing: 0.3em; filter: blur(4px); }
    60% { opacity: 0.9; letter-spacing: 0.05em; filter: blur(0); }
    100% { opacity: 1; transform: translateY(0); letter-spacing: 0.02em; }
  }
  @keyframes drinks-line { from { width: 0; } to { width: 100%; } }
  @keyframes drinks-glow {
    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
    40% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
    100% { opacity: 0.4; transform: translate(-50%, -50%) scale(1); }
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
    gap: 12px; padding: 20px;
    border: 1px solid rgba(240,216,144,0.12);
    border-radius: 8px;
    text-decoration: none; color: #e8e4dc;
    transition: border-color 0.3s, background 0.3s, box-shadow 0.3s;
    cursor: pointer;
    background: rgba(240,216,144,0.02);
  }
  .D-funnel:hover {
    border-color: rgba(240,216,144,0.2);
    background: rgba(240,216,144,0.03);
    box-shadow: 0 2px 16px rgba(240,216,144,0.06);
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
    font-size: 14px; font-style: italic;
    color: rgba(232,228,220,0.3);
    transition: color 0.3s;
    border-bottom: 1px solid rgba(232,228,220,0.06);
    padding-bottom: 2px;
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
    .D-final {
      padding: 24px 16px;
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
