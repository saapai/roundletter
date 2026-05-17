"use client";

import { useState, useRef, useEffect, useCallback } from "react";

/* ── helpers ── */
function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function fmtCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}

function timeAgo(d: Date) {
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days < 1) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

/* ── icons (inline SVG to avoid deps) ── */
const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

const PlaySmall = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const VolumeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
  </svg>
);

const FullscreenIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
  </svg>
);

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
  </svg>
);

const ThumbUpIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
  </svg>
);

const ThumbDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z" />
  </svg>
);

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M14 9V3L22 12 14 21V15C8.44 15 4.78 17.03 2 21 3.11 15.33 6.22 9.67 14 9z" />
  </svg>
);

const MoreIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
  </svg>
);

/* ── constants ── */
const CHANNEL = {
  name: "aureliex",
  avatar: "/hero/cityscape.png",
  subscribers: "1.2K",
};

const VIDEO = {
  title: "$3,453 → $100,000 in 10 weeks. Here's the entire plan.",
  views: 48_291,
  date: new Date("2026-04-12"),
  likes: 3_847,
  description: `The wager is simple: turn $3,453 into $100,000 by my 20th birthday — June 21, 2026.

The portfolio is live at aureliex.com. Five AI agents argue every trade before I touch it. Position sizes are Kelly-sized. The pre-mortem says <1% chance. The Monte Carlo says 0.000000%.

The odds are the honesty. The bet is the product.

Links:
aureliex.com — live portfolio
aureliex.com/argument — watch 5 agents disagree
aureliex.com/invest — the prediction market
aureliex.com/art — 12 original artworks

Follow the wager: @saapai`,
};

const COMMENTS = [
  {
    author: "quant_trader_99",
    avatar: "Q",
    time: "2 weeks ago",
    text: "This is either the most disciplined or the most delusional thing I've ever seen on this platform. Either way, subscribed.",
    likes: 847,
  },
  {
    author: "berkeley_cs_dropout",
    avatar: "B",
    time: "1 week ago",
    text: "The fact that you published the 0.000000% probability BEFORE starting is genuinely psychotic. Respect.",
    likes: 412,
  },
  {
    author: "passive_income_pete",
    avatar: "P",
    time: "5 days ago",
    text: 'bro the S&P takes 25 years and you want to do it in 10 weeks 💀 this is going to be incredible content either way',
    likes: 289,
  },
  {
    author: "sarah_builds",
    avatar: "S",
    time: "3 days ago",
    text: "The AI agent debate system is actually fascinating. Each agent argues AGAINST the trade? That's basically adversarial red-teaming for portfolio management.",
    likes: 156,
  },
  {
    author: "utah_local",
    avatar: "U",
    time: "1 day ago",
    text: "See you at the birthday party in June. Flying in from SLC.",
    likes: 73,
  },
];

const SIDEBAR_VIDEOS = [
  { title: "How I Built 5 AI Agents That Argue About My Money", views: "12K views", time: "3 days ago", dur: "18:42" },
  { title: "The Math Behind Kelly Criterion (Why Most Traders Size Wrong)", views: "8.4K views", time: "1 week ago", dur: "24:15" },
  { title: "Week 3 Update: +25% and the Monte Carlo Still Says 0%", views: "6.1K views", time: "2 weeks ago", dur: "11:33" },
  { title: "I Published My Pre-Mortem Before the First Trade", views: "15K views", time: "1 month ago", dur: "7:58" },
  { title: "Why I'm Betting Everything Public (The Attention Theory)", views: "21K views", time: "1 month ago", dur: "14:07" },
  { title: "Building a Prediction Market for My Own Portfolio", views: "4.2K views", time: "3 weeks ago", dur: "20:31" },
  { title: "The 12 Artworks I Made While Losing Money", views: "9.7K views", time: "2 weeks ago", dur: "8:44" },
  { title: "Real-Time Portfolio Tracker: Technical Breakdown", views: "3.8K views", time: "4 days ago", dur: "31:22" },
];

/* ── component ── */
export default function DraftPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState(1);
  const [descExpanded, setDescExpanded] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  }, []);

  const seek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    const bar = progressRef.current;
    if (!v || !bar) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    v.currentTime = pct * v.duration;
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => setCurrent(v.currentTime);
    const onMeta = () => setDuration(v.duration);
    const onEnd = () => setPlaying(false);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("ended", onEnd);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("ended", onEnd);
    };
  }, []);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setShowControls(false);
    }, 3000);
  }, []);

  const handleFullscreen = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.requestFullscreen) v.requestFullscreen();
  }, []);

  const handleVolume = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) videoRef.current.volume = val;
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="yt-page">
      <style>{ytStyles}</style>

      {/* ── TOP BAR ── */}
      <header className="yt-topbar">
        <div className="yt-topbar-left">
          <svg viewBox="0 0 90 20" width="90" height="20" className="yt-logo">
            <rect x="0" y="0" width="28" height="20" rx="4" fill="#ff0000" />
            <polygon points="11,4 11,16 21,10" fill="#fff" />
            <text x="32" y="15" fill="#fff" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="14">YouTube</text>
          </svg>
        </div>
        <div className="yt-topbar-center">
          <div className="yt-search-box">
            <input type="text" placeholder="Search" defaultValue="aureliex $100k wager" />
            <button className="yt-search-btn">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
            </button>
          </div>
        </div>
        <div className="yt-topbar-right">
          <div className="yt-avatar-small" style={{ background: "#c4302b", color: "#fff", fontWeight: 700 }}>S</div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <div className="yt-content">
        <div className="yt-primary">
          {/* Video player */}
          <div className="yt-player" onMouseMove={handleMouseMove} onMouseLeave={() => playing && setShowControls(false)}>
            <video
              ref={videoRef}
              src="/draft-video.mp4"
              className="yt-video"
              onClick={togglePlay}
              playsInline
              preload="metadata"
            />

            {/* Big play button overlay */}
            {!playing && (
              <button className="yt-big-play" onClick={togglePlay}>
                <PlayIcon />
              </button>
            )}

            {/* Controls */}
            <div className={`yt-controls ${showControls || !playing ? "yt-controls-show" : ""}`}>
              <div className="yt-progress-bar" ref={progressRef} onClick={seek}>
                <div className="yt-progress-buffered" style={{ width: "100%" }} />
                <div className="yt-progress-played" style={{ width: `${progress}%` }} />
                <div className="yt-progress-knob" style={{ left: `${progress}%` }} />
              </div>
              <div className="yt-controls-row">
                <div className="yt-controls-left">
                  <button className="yt-ctrl-btn" onClick={togglePlay}>
                    {playing ? <PauseIcon /> : <PlaySmall />}
                  </button>
                  <div className="yt-volume-group">
                    <button className="yt-ctrl-btn"><VolumeIcon /></button>
                    <input type="range" className="yt-volume-slider" min="0" max="1" step="0.05" value={volume} onChange={handleVolume} />
                  </div>
                  <span className="yt-time">
                    {fmtTime(currentTime)} / {fmtTime(duration)}
                  </span>
                </div>
                <div className="yt-controls-right">
                  <button className="yt-ctrl-btn"><SettingsIcon /></button>
                  <button className="yt-ctrl-btn" onClick={handleFullscreen}><FullscreenIcon /></button>
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="yt-title">{VIDEO.title}</h1>

          {/* Channel + actions */}
          <div className="yt-meta-row">
            <div className="yt-channel-info">
              <div className="yt-channel-avatar">
                <img src={CHANNEL.avatar} alt="" />
              </div>
              <div className="yt-channel-text">
                <span className="yt-channel-name">{CHANNEL.name}</span>
                <span className="yt-channel-subs">{CHANNEL.subscribers} subscribers</span>
              </div>
              <button className="yt-subscribe-btn">Subscribe</button>
            </div>
            <div className="yt-actions">
              <div className="yt-like-group">
                <button className="yt-action-btn yt-like-btn">
                  <ThumbUpIcon /> <span>{fmtCount(VIDEO.likes)}</span>
                </button>
                <div className="yt-like-divider" />
                <button className="yt-action-btn yt-dislike-btn">
                  <ThumbDownIcon />
                </button>
              </div>
              <button className="yt-action-btn"><ShareIcon /> <span>Share</span></button>
              <button className="yt-action-btn"><MoreIcon /></button>
            </div>
          </div>

          {/* Description */}
          <div className={`yt-description ${descExpanded ? "yt-desc-expanded" : ""}`} onClick={() => setDescExpanded(!descExpanded)}>
            <div className="yt-desc-stats">
              <span>{fmtCount(VIDEO.views)} views</span>
              <span>{timeAgo(VIDEO.date)}</span>
            </div>
            <p className="yt-desc-text">{VIDEO.description}</p>
            {!descExpanded && <span className="yt-desc-more">...more</span>}
            {descExpanded && <span className="yt-desc-less">Show less</span>}
          </div>

          {/* Comments */}
          <div className="yt-comments">
            <h3 className="yt-comments-head">{COMMENTS.length + 1_243} Comments</h3>
            <div className="yt-comment-input">
              <div className="yt-comment-avatar" style={{ background: "#c4302b", color: "#fff" }}>S</div>
              <input type="text" placeholder="Add a comment..." className="yt-comment-field" />
            </div>
            {COMMENTS.map((c, i) => (
              <div key={i} className="yt-comment">
                <div className="yt-comment-avatar">{c.avatar}</div>
                <div className="yt-comment-body">
                  <div className="yt-comment-meta">
                    <span className="yt-comment-author">{c.author}</span>
                    <span className="yt-comment-time">{c.time}</span>
                  </div>
                  <p className="yt-comment-text">{c.text}</p>
                  <div className="yt-comment-actions">
                    <button><ThumbUpIcon /></button>
                    <span>{c.likes}</span>
                    <button><ThumbDownIcon /></button>
                    <button className="yt-reply-btn">Reply</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── SIDEBAR ── */}
        <aside className="yt-sidebar">
          {SIDEBAR_VIDEOS.map((sv, i) => (
            <div key={i} className="yt-sidebar-card">
              <div className="yt-thumb">
                <div className="yt-thumb-inner" />
                <span className="yt-thumb-dur">{sv.dur}</span>
              </div>
              <div className="yt-sidebar-info">
                <p className="yt-sidebar-title">{sv.title}</p>
                <span className="yt-sidebar-channel">{CHANNEL.name}</span>
                <span className="yt-sidebar-meta">{sv.views} &middot; {sv.time}</span>
              </div>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}

/* ── styles ── */
const ytStyles = `
  .yt-page {
    --yt-bg: #0f0f0f;
    --yt-surface: #272727;
    --yt-text: #f1f1f1;
    --yt-text2: #aaa;
    --yt-red: #ff0000;
    --yt-blue: #3ea6ff;

    background: var(--yt-bg);
    color: var(--yt-text);
    font-family: "Roboto", Arial, sans-serif;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }

  /* ── reset parent layout ── */
  .yt-page,
  .yt-page * { box-sizing: border-box; }

  /* ── TOP BAR ── */
  .yt-topbar {
    position: sticky; top: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    height: 56px; padding: 0 16px;
    background: var(--yt-bg);
    border-bottom: 1px solid #222;
  }
  .yt-logo { flex-shrink: 0; }
  .yt-topbar-center { flex: 1; max-width: 640px; margin: 0 auto; }
  .yt-search-box {
    display: flex; border: 1px solid #303030; border-radius: 40px; overflow: hidden;
    background: #121212;
  }
  .yt-search-box input {
    flex: 1; padding: 8px 16px; background: transparent; border: none;
    color: var(--yt-text); font-size: 14px; outline: none;
  }
  .yt-search-btn {
    padding: 0 20px; background: #222; border: none; border-left: 1px solid #303030;
    color: var(--yt-text); cursor: pointer; display: flex; align-items: center;
  }
  .yt-avatar-small {
    width: 32px; height: 32px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center; font-size: 14px;
  }

  /* ── LAYOUT ── */
  .yt-content {
    display: flex; gap: 24px;
    max-width: 1720px; margin: 0 auto;
    padding: 24px 24px 64px;
  }
  .yt-primary { flex: 1; min-width: 0; max-width: 1100px; }
  .yt-sidebar { width: 402px; flex-shrink: 0; }

  /* ── PLAYER ── */
  .yt-player {
    position: relative; width: 100%; aspect-ratio: 16/9;
    background: #000; border-radius: 12px; overflow: hidden;
    cursor: pointer;
  }
  .yt-video { width: 100%; height: 100%; object-fit: contain; display: block; }
  .yt-big-play {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    background: rgba(0,0,0,0.35); border: none; color: #fff;
    cursor: pointer; transition: background 0.2s;
  }
  .yt-big-play:hover { background: rgba(0,0,0,0.5); }
  .yt-big-play svg { width: 68px; height: 68px; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.5)); }

  /* ── CONTROLS ── */
  .yt-controls {
    position: absolute; bottom: 0; left: 0; right: 0;
    background: linear-gradient(transparent, rgba(0,0,0,0.85));
    padding: 0 12px 8px;
    opacity: 0; transition: opacity 0.25s;
    pointer-events: none;
  }
  .yt-controls-show { opacity: 1; pointer-events: auto; }
  .yt-progress-bar {
    position: relative; height: 4px; background: rgba(255,255,255,0.2);
    cursor: pointer; margin-bottom: 8px; border-radius: 2px;
    transition: height 0.1s;
  }
  .yt-progress-bar:hover { height: 6px; }
  .yt-progress-buffered {
    position: absolute; top: 0; left: 0; height: 100%;
    background: rgba(255,255,255,0.3); border-radius: 2px;
  }
  .yt-progress-played {
    position: absolute; top: 0; left: 0; height: 100%;
    background: var(--yt-red); border-radius: 2px;
  }
  .yt-progress-knob {
    position: absolute; top: 50%; width: 14px; height: 14px;
    background: var(--yt-red); border-radius: 50%;
    transform: translate(-50%, -50%); opacity: 0;
    transition: opacity 0.1s;
  }
  .yt-progress-bar:hover .yt-progress-knob { opacity: 1; }
  .yt-controls-row {
    display: flex; align-items: center; justify-content: space-between;
  }
  .yt-controls-left, .yt-controls-right {
    display: flex; align-items: center; gap: 8px;
  }
  .yt-ctrl-btn {
    background: none; border: none; color: #fff; cursor: pointer;
    padding: 4px; display: flex; align-items: center;
    opacity: 0.9;
  }
  .yt-ctrl-btn:hover { opacity: 1; }
  .yt-volume-group { display: flex; align-items: center; }
  .yt-volume-slider {
    width: 0; overflow: hidden; transition: width 0.2s;
    accent-color: #fff; cursor: pointer;
  }
  .yt-volume-group:hover .yt-volume-slider { width: 60px; margin-left: 4px; }
  .yt-time { font-size: 12px; color: #ddd; margin-left: 8px; font-variant-numeric: tabular-nums; }

  /* ── TITLE ── */
  .yt-title {
    font-size: 20px; font-weight: 600; line-height: 28px;
    margin: 12px 0 0; color: var(--yt-text);
    font-family: "Roboto", Arial, sans-serif;
  }

  /* ── META ROW ── */
  .yt-meta-row {
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 12px;
    margin: 12px 0;
  }
  .yt-channel-info { display: flex; align-items: center; gap: 12px; }
  .yt-channel-avatar {
    width: 40px; height: 40px; border-radius: 50%; overflow: hidden;
    flex-shrink: 0;
  }
  .yt-channel-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .yt-channel-text { display: flex; flex-direction: column; }
  .yt-channel-name { font-size: 14px; font-weight: 600; }
  .yt-channel-subs { font-size: 12px; color: var(--yt-text2); }
  .yt-subscribe-btn {
    background: #fff; color: #0f0f0f; border: none; border-radius: 20px;
    padding: 8px 16px; font-size: 14px; font-weight: 600; cursor: pointer;
    margin-left: 8px;
  }
  .yt-subscribe-btn:hover { opacity: 0.9; }

  /* ── ACTIONS ── */
  .yt-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .yt-like-group {
    display: flex; background: var(--yt-surface); border-radius: 20px; overflow: hidden;
  }
  .yt-action-btn {
    display: flex; align-items: center; gap: 6px;
    background: var(--yt-surface); color: var(--yt-text); border: none;
    padding: 8px 16px; font-size: 14px; font-weight: 500;
    cursor: pointer; border-radius: 20px;
    white-space: nowrap;
  }
  .yt-action-btn:hover { background: #3a3a3a; }
  .yt-like-btn, .yt-dislike-btn { border-radius: 0; }
  .yt-like-divider { width: 1px; background: #494949; }

  /* ── DESCRIPTION ── */
  .yt-description {
    background: var(--yt-surface); border-radius: 12px;
    padding: 12px; margin: 12px 0; cursor: pointer;
    max-height: 90px; overflow: hidden;
    transition: max-height 0.3s ease;
    position: relative;
  }
  .yt-desc-expanded { max-height: 600px; cursor: auto; }
  .yt-desc-stats {
    display: flex; gap: 8px; font-size: 14px; font-weight: 600; margin-bottom: 4px;
  }
  .yt-desc-text {
    font-size: 14px; line-height: 1.5; white-space: pre-wrap; margin: 0;
    color: var(--yt-text);
  }
  .yt-desc-more, .yt-desc-less {
    font-size: 14px; font-weight: 600; color: var(--yt-text);
    cursor: pointer; display: inline-block; margin-top: 4px;
  }

  /* ── COMMENTS ── */
  .yt-comments { margin-top: 24px; }
  .yt-comments-head {
    font-size: 16px; font-weight: 600; margin: 0 0 24px;
    font-family: "Roboto", Arial, sans-serif;
  }
  .yt-comment-input {
    display: flex; gap: 12px; align-items: center; margin-bottom: 32px;
  }
  .yt-comment-avatar {
    width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; font-weight: 700;
    background: #444; color: #fff;
  }
  .yt-comment-field {
    flex: 1; background: transparent; border: none;
    border-bottom: 1px solid #494949;
    color: var(--yt-text); font-size: 14px; padding: 4px 0;
    outline: none;
  }
  .yt-comment-field:focus { border-color: #fff; }
  .yt-comment {
    display: flex; gap: 12px; margin-bottom: 20px;
  }
  .yt-comment-body { flex: 1; }
  .yt-comment-meta { display: flex; gap: 8px; align-items: baseline; }
  .yt-comment-author { font-size: 13px; font-weight: 600; }
  .yt-comment-time { font-size: 12px; color: var(--yt-text2); }
  .yt-comment-text { font-size: 14px; line-height: 1.4; margin: 4px 0 8px; }
  .yt-comment-actions {
    display: flex; align-items: center; gap: 8px;
  }
  .yt-comment-actions button {
    background: none; border: none; color: var(--yt-text2); cursor: pointer;
    padding: 2px; display: flex; align-items: center;
  }
  .yt-comment-actions button svg { width: 16px; height: 16px; }
  .yt-comment-actions span { font-size: 12px; color: var(--yt-text2); }
  .yt-reply-btn { font-size: 12px !important; font-weight: 600; }

  /* ── SIDEBAR ── */
  .yt-sidebar-card {
    display: flex; gap: 8px; margin-bottom: 8px; cursor: pointer;
    border-radius: 8px; padding: 4px;
  }
  .yt-sidebar-card:hover { background: rgba(255,255,255,0.05); }
  .yt-thumb {
    position: relative; width: 168px; height: 94px; flex-shrink: 0;
    border-radius: 8px; overflow: hidden;
  }
  .yt-thumb-inner {
    width: 100%; height: 100%;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  }
  .yt-thumb-dur {
    position: absolute; bottom: 4px; right: 4px;
    background: rgba(0,0,0,0.8); color: #fff;
    font-size: 12px; padding: 2px 4px; border-radius: 3px;
    font-weight: 500; font-variant-numeric: tabular-nums;
  }
  .yt-sidebar-info { flex: 1; min-width: 0; }
  .yt-sidebar-title {
    font-size: 14px; font-weight: 500; line-height: 1.3;
    margin: 0 0 4px;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .yt-sidebar-channel { display: block; font-size: 12px; color: var(--yt-text2); }
  .yt-sidebar-meta { display: block; font-size: 12px; color: var(--yt-text2); }

  /* ── RESPONSIVE ── */
  @media (max-width: 1000px) {
    .yt-sidebar { display: none; }
    .yt-content { padding: 8px; }
    .yt-player { border-radius: 0; }
  }
  @media (max-width: 640px) {
    .yt-topbar-center { display: none; }
    .yt-meta-row { flex-direction: column; align-items: flex-start; }
    .yt-title { font-size: 16px; line-height: 22px; }
  }
`;
