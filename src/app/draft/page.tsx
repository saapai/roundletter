"use client";

import { useState, useRef, useEffect } from "react";

/* ── helpers ── */
function fmtCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}

/* ── icons (inline SVG) ── */
const ThumbUpIcon = ({ size = 20 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={size} height={size}>
    <path d="M7 22V11L2 11V22H7ZM7 11L11.586 2.586C11.961 2.211 12.469 2 13 2V2C13.796 2 14.559 2.316 15.121 2.879L15.414 3.172C15.789 3.547 16 4.055 16 4.586V9H20.66C21.413 9 22.064 9.564 22.172 10.309L22.95 15.845C23.234 17.859 21.686 19.647 19.657 19.647H14.5" strokeLinejoin="round" strokeLinecap="round"/>
  </svg>
);

const ThumbUpFilledIcon = ({ size = 20 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
    <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
  </svg>
);

const ThumbDownIcon = ({ size = 20 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={size} height={size}>
    <path d="M17 2V13L22 13V2H17ZM17 13L12.414 21.414C12.039 21.789 11.531 22 11 22V22C10.204 22 9.441 21.684 8.879 21.121L8.586 20.828C8.211 20.453 8 19.945 8 19.414V15H3.34C2.587 15 1.936 14.436 1.828 13.691L1.05 8.155C0.766 6.141 2.314 4.353 4.343 4.353H9.5" strokeLinejoin="round" strokeLinecap="round"/>
  </svg>
);

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M15 5.63L20.66 12 15 18.37V14h-1c-3.96 0-7.14 1-9.75 3.09 1.84-4.07 5.11-6.4 9.89-7.1l.86-.13V5.63M14 3v6C6.22 10.13 3.11 15.33 2 21c2.78-3.97 6.44-6 12-6v6l8-9-8-9z" />
  </svg>
);

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M17 18v2H7v-2h10zM12 3v10.17l3.59-3.58L17 11l-5 5-5-5 1.41-1.41L12 13.17V3z" />
  </svg>
);

const MoreIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M6 12c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm8 0c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm8 0c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z" />
  </svg>
);

const SortIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" />
  </svg>
);

const VerifiedIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" style={{ color: "#aaa" }}>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);

const NotifBellIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
  </svg>
);

const MicIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
  </svg>
);

/* ── data ── */
const CHANNEL = {
  name: "Aaron Westberry",
  handle: "@aaron_westberry",
  avatar: "https://i.ytimg.com/vi/DPIoje1nfCQ/hqdefault.jpg",
  subscribers: "142K",
  verified: true,
};

const VIDEO = {
  id: "DPIoje1nfCQ",
  title: "Telling the Same Joke Over and Over and Over and Over",
  views: 2_847_291,
  date: "Apr 28, 2025",
  likes: 184_700,
  description: `What happens when you tell the exact same joke to different people in different places? You find out.

Featuring me, a joke, and way too much commitment.

I went to parks, grocery stores, coffee shops, and street corners. Same joke. Every single time. The reactions are everything.

Subscribe for more social experiments, comedy, and questionable decisions.

Follow me:
Instagram: @aaronwestberry
TikTok: @aaronwestberry
Twitter: @aaronwestberry

#comedy #socialmedia #jokes #standup #funny`,
};

const COMMENTS = [
  {
    author: "Jordan Miles",
    avatar: "J",
    time: "2 weeks ago",
    text: "The fact that the joke gets funnier every time he tells it is either a testament to his delivery or proof that I have the humor of a 5-year-old. Probably both.",
    likes: 12_847,
    pinned: true,
    hearted: true,
    replies: 342,
  },
  {
    author: "ComedyNerd42",
    avatar: "C",
    time: "1 week ago",
    text: `I'm a stand-up comedian and this is genuinely one of the best studies in comedic timing I've ever seen. The pause at 3:42 is TEXTBOOK.`,
    likes: 8_412,
    pinned: false,
    hearted: false,
    replies: 89,
  },
  {
    author: "Sarah K.",
    avatar: "S",
    time: "5 days ago",
    text: "The old guy at 6:15 who just silently walks away is the greatest reaction in YouTube history.",
    likes: 6_289,
    pinned: false,
    hearted: true,
    replies: 213,
  },
  {
    author: "Mike Chen",
    avatar: "M",
    time: "4 days ago",
    text: "I've now watched this 4 times and I laugh harder each time. This is the same joke paradox in action.",
    likes: 3_156,
    pinned: false,
    hearted: false,
    replies: 47,
  },
  {
    author: "bestcommentever",
    avatar: "B",
    time: "3 days ago",
    text: "Someone needs to study why repetition makes things funnier. Like there's a sweet spot between annoying and transcendent and this video found it.",
    likes: 2_891,
    pinned: false,
    hearted: false,
    replies: 156,
  },
  {
    author: "Emily Torres",
    avatar: "E",
    time: "2 days ago",
    text: `My roommate walked in while I was watching this and asked why I was crying laughing at what appeared to be the same 15 seconds on loop. I couldn't explain it. You just have to experience it.`,
    likes: 1_734,
    pinned: false,
    hearted: false,
    replies: 28,
  },
  {
    author: "Dave's Random Thoughts",
    avatar: "D",
    time: "1 day ago",
    text: "The commitment to doing this without ever breaking character is actually insane. Not a single crack. This man has the discipline of an astronaut.",
    likes: 947,
    pinned: false,
    hearted: false,
    replies: 15,
  },
];

const SIDEBAR_VIDEOS = [
  { title: "I Said the Same Compliment to 100 Strangers", channel: "Aaron Westberry", views: "1.2M views", time: "2 months ago", dur: "14:28", thumb: "linear-gradient(135deg, #2d1b4e 0%, #1a1a2e 50%, #4a1942 100%)" },
  { title: "Doing Stand-Up But Every Joke is the Same Joke", channel: "Aaron Westberry", views: "892K views", time: "3 months ago", dur: "18:42", thumb: "linear-gradient(135deg, #1a2a3a 0%, #2a1a3a 50%, #1a3a2a 100%)" },
  { title: "Why Repetition is the Secret to Comedy", channel: "Nerdwriter1", views: "3.4M views", time: "4 years ago", dur: "8:15", thumb: "linear-gradient(135deg, #3a2a1a 0%, #1a2a3a 50%, #2a3a1a 100%)" },
  { title: "I Tested How Many Times I Can Tell the Same Story", channel: "Ryan Trahan", views: "8.1M views", time: "1 year ago", dur: "22:07", thumb: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" },
  { title: "The Science Behind Why Things Get Funnier With Repetition", channel: "Vsauce", views: "12M views", time: "3 years ago", dur: "24:31", thumb: "linear-gradient(135deg, #0a2a1a 0%, #1a0a2a 50%, #2a1a0a 100%)" },
  { title: "Street Comedy That Actually Works", channel: "JiDion", views: "4.7M views", time: "6 months ago", dur: "16:55", thumb: "linear-gradient(135deg, #2a0a1a 0%, #0a2a2a 50%, #1a1a0a 100%)" },
  { title: "Telling My Barber the Same Joke Every Haircut for a Year", channel: "Aaron Westberry", views: "2.1M views", time: "5 months ago", dur: "11:33", thumb: "linear-gradient(135deg, #1a2a1a 0%, #2a1a2a 50%, #0a3a3a 100%)" },
  { title: "How Comedians Use Repetition — A Video Essay", channel: "Thomas Flight", views: "1.8M views", time: "2 years ago", dur: "12:44", thumb: "linear-gradient(135deg, #2a2a0a 0%, #0a2a3a 50%, #3a0a2a 100%)" },
  { title: "I Wore the Same Outfit for 30 Days and No One Noticed", channel: "Yes Theory", views: "6.3M views", time: "1 year ago", dur: "19:02", thumb: "linear-gradient(135deg, #0a1a3a 0%, #3a1a0a 50%, #1a3a1a 100%)" },
  { title: "The Longest Running Joke in Television History", channel: "Friendly Space Ninja", views: "5.2M views", time: "8 months ago", dur: "28:17", thumb: "linear-gradient(135deg, #1a0a2a 0%, #2a2a1a 50%, #0a2a1a 100%)" },
];

const CHIP_FILTERS = ["All", "Comedy", "Stand-up comedy", "Street interviews", "Recently uploaded", "Watched", "New to you"];

/* ── component ── */
export default function DraftPage() {
  const [descExpanded, setDescExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [activeChip, setActiveChip] = useState("All");
  const [commentSort, setCommentSort] = useState("Top");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [miniPlayer, setMiniPlayer] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);
  const primaryRef = useRef<HTMLDivElement>(null);

  // Close sort menu on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (showSortMenu) setShowSortMenu(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [showSortMenu]);

  // Mini-player on scroll
  useEffect(() => {
    const handler = () => {
      if (window.scrollY > 500) setMiniPlayer(true);
      else setMiniPlayer(false);
    };
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleLike = () => {
    setLiked(!liked);
    if (disliked) setDisliked(false);
  };
  const handleDislike = () => {
    setDisliked(!disliked);
    if (liked) setLiked(false);
  };

  return (
    <div className="yt-page">
      <style>{ytStyles}</style>

      {/* ── TOP BAR ── */}
      <header className="yt-topbar">
        <div className="yt-topbar-left">
          <button className="yt-hamburger">
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
            </svg>
          </button>
          <svg viewBox="0 0 90 20" width="90" height="20" className="yt-logo">
            <rect x="0" y="0" width="28" height="20" rx="4" fill="#ff0000" />
            <polygon points="11,4 11,16 21,10" fill="#fff" />
            <text x="32" y="15" fill="#fff" fontFamily="'Roboto', Arial, sans-serif" fontWeight="bold" fontSize="14">YouTube</text>
          </svg>
        </div>
        <div className="yt-topbar-center">
          <div className="yt-search-box">
            <input type="text" placeholder="Search" defaultValue="" />
            <button className="yt-search-btn">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
            </button>
          </div>
          <button className="yt-mic-btn"><MicIcon /></button>
        </div>
        <div className="yt-topbar-right">
          <button className="yt-icon-btn"><NotifBellIcon /></button>
          <div className="yt-avatar-small" style={{ background: "#c4302b", color: "#fff", fontWeight: 700 }}>S</div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <div className="yt-content">
        <div className="yt-primary" ref={primaryRef}>
          {/* Video player — thumbnail until clicked, then iframe */}
          <div className="yt-player">
            {videoStarted ? (
              <iframe
                src={`https://www.youtube.com/embed/${VIDEO.id}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3`}
                className="yt-video-iframe"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                title={VIDEO.title}
              />
            ) : (
              <div className="yt-poster" onClick={() => setVideoStarted(true)}>
                <img
                  src={`https://i.ytimg.com/vi/${VIDEO.id}/maxresdefault.jpg`}
                  alt=""
                  className="yt-poster-img"
                />
                <button className="yt-big-play" aria-label="Play">
                  <svg viewBox="0 0 68 48" width="68" height="48">
                    <path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="#f00"/>
                    <path d="M27 34l17-10-17-10z" fill="#fff"/>
                  </svg>
                </button>
              </div>
            )}
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
                <div className="yt-channel-name-row">
                  <span className="yt-channel-name">{CHANNEL.name}</span>
                  {CHANNEL.verified && <VerifiedIcon />}
                </div>
                <span className="yt-channel-subs">{CHANNEL.subscribers} subscribers</span>
              </div>
              {subscribed ? (
                <button className="yt-subscribed-btn" onClick={() => setSubscribed(false)}>
                  <NotifBellIcon /> Subscribed
                </button>
              ) : (
                <button className="yt-subscribe-btn" onClick={() => setSubscribed(true)}>Subscribe</button>
              )}
            </div>
            <div className="yt-actions">
              <div className="yt-like-group">
                <button className={`yt-action-btn yt-like-btn ${liked ? "yt-active" : ""}`} onClick={handleLike}>
                  {liked ? <ThumbUpFilledIcon /> : <ThumbUpIcon />}
                  <span>{fmtCount(VIDEO.likes + (liked ? 1 : 0))}</span>
                </button>
                <div className="yt-like-divider" />
                <button className={`yt-action-btn yt-dislike-btn ${disliked ? "yt-active" : ""}`} onClick={handleDislike}>
                  <ThumbDownIcon />
                </button>
              </div>
              <button className="yt-action-btn"><ShareIcon /> <span>Share</span></button>
              <button className="yt-action-btn"><DownloadIcon /> <span>Download</span></button>
              <button className="yt-action-btn yt-more-btn"><MoreIcon /></button>
            </div>
          </div>

          {/* Description */}
          <div
            className={`yt-description ${descExpanded ? "yt-desc-expanded" : ""}`}
            onClick={() => !descExpanded && setDescExpanded(true)}
          >
            <div className="yt-desc-stats">
              <span>{fmtCount(VIDEO.views)} views</span>
              <span>{VIDEO.date}</span>
            </div>
            <p className="yt-desc-text">{VIDEO.description}</p>
            {!descExpanded && <span className="yt-desc-more">...more</span>}
            {descExpanded && (
              <button className="yt-desc-less" onClick={(e) => { e.stopPropagation(); setDescExpanded(false); }}>
                Show less
              </button>
            )}
          </div>

          {/* Comments */}
          <div className="yt-comments">
            <div className="yt-comments-header">
              <h3 className="yt-comments-head">{fmtCount(1_248)} Comments</h3>
              <div className="yt-sort-wrapper" onClick={(e) => e.stopPropagation()}>
                <button className="yt-sort-btn" onClick={() => setShowSortMenu(!showSortMenu)}>
                  <SortIcon /> <span>Sort by</span>
                </button>
                {showSortMenu && (
                  <div className="yt-sort-menu">
                    <button className={commentSort === "Top" ? "active" : ""} onClick={() => { setCommentSort("Top"); setShowSortMenu(false); }}>Top comments</button>
                    <button className={commentSort === "Newest" ? "active" : ""} onClick={() => { setCommentSort("Newest"); setShowSortMenu(false); }}>Newest first</button>
                  </div>
                )}
              </div>
            </div>
            <div className="yt-comment-input">
              <div className="yt-comment-avatar" style={{ background: "#c4302b", color: "#fff" }}>S</div>
              <input type="text" placeholder="Add a comment..." className="yt-comment-field" />
            </div>
            {COMMENTS.map((c, i) => (
              <div key={i} className="yt-comment">
                <div className="yt-comment-avatar">{c.avatar}</div>
                <div className="yt-comment-body">
                  {c.pinned && (
                    <div className="yt-pinned-label">
                      <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" /></svg>
                      Pinned by {CHANNEL.name}
                    </div>
                  )}
                  <div className="yt-comment-meta">
                    <span className="yt-comment-author">{c.author}</span>
                    <span className="yt-comment-time">{c.time}</span>
                  </div>
                  <p className="yt-comment-text">{c.text}</p>
                  <div className="yt-comment-actions">
                    <button><ThumbUpIcon size={16} /></button>
                    <span>{fmtCount(c.likes)}</span>
                    <button><ThumbDownIcon size={16} /></button>
                    <button className="yt-reply-btn">Reply</button>
                    {c.hearted && (
                      <span className="yt-heart-badge" title={`❤ by ${CHANNEL.name}`}>
                        <svg viewBox="0 0 24 24" fill="#ff0000" width="14" height="14">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      </span>
                    )}
                  </div>
                  {c.replies > 0 && (
                    <button className="yt-view-replies">
                      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" /></svg>
                      {c.replies} replies
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── SIDEBAR ── */}
        <aside className="yt-sidebar">
          {/* Filter chips */}
          <div className="yt-chips">
            {CHIP_FILTERS.map((chip) => (
              <button
                key={chip}
                className={`yt-chip ${activeChip === chip ? "yt-chip-active" : ""}`}
                onClick={() => setActiveChip(chip)}
              >
                {chip}
              </button>
            ))}
          </div>

          {SIDEBAR_VIDEOS.map((sv, i) => (
            <div key={i} className="yt-sidebar-card">
              <div className="yt-thumb">
                <div className="yt-thumb-inner" style={{ background: sv.thumb }} />
                <span className="yt-thumb-dur">{sv.dur}</span>
              </div>
              <div className="yt-sidebar-info">
                <p className="yt-sidebar-title">{sv.title}</p>
                <span className="yt-sidebar-channel">{sv.channel}</span>
                <span className="yt-sidebar-meta">{sv.views} &middot; {sv.time}</span>
              </div>
            </div>
          ))}
        </aside>
      </div>

      {/* ── MINI PLAYER ── */}
      {miniPlayer && videoStarted && (
        <div className="yt-miniplayer">
          <iframe
            src={`https://www.youtube.com/embed/${VIDEO.id}?rel=0&modestbranding=1&iv_load_policy=3`}
            className="yt-mini-iframe"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={VIDEO.title}
          />
          <div className="yt-mini-info">
            <p className="yt-mini-title">{VIDEO.title}</p>
            <span className="yt-mini-channel">{CHANNEL.name}</span>
          </div>
          <button className="yt-mini-close" onClick={() => setMiniPlayer(false)}>✕</button>
        </div>
      )}
    </div>
  );
}

/* ── styles ── */
const ytStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');

  .yt-page {
    --yt-bg: #0f0f0f;
    --yt-surface: #272727;
    --yt-surface-hover: #3a3a3a;
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

  .yt-page, .yt-page * { box-sizing: border-box; margin: 0; }
  .yt-page button { font-family: inherit; }

  /* ── TOP BAR ── */
  .yt-topbar {
    position: sticky; top: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    height: 56px; padding: 0 16px;
    background: var(--yt-bg);
  }
  .yt-topbar-left { display: flex; align-items: center; gap: 16px; }
  .yt-hamburger {
    background: none; border: none; color: var(--yt-text); cursor: pointer;
    padding: 8px; border-radius: 50%; display: flex;
  }
  .yt-hamburger:hover { background: rgba(255,255,255,0.1); }
  .yt-logo { flex-shrink: 0; cursor: pointer; }
  .yt-topbar-center { flex: 1; max-width: 640px; margin: 0 40px; display: flex; align-items: center; gap: 8px; }
  .yt-search-box {
    display: flex; flex: 1; border: 1px solid #303030; border-radius: 40px; overflow: hidden;
    background: #121212;
  }
  .yt-search-box input {
    flex: 1; padding: 8px 4px 8px 16px; background: transparent; border: none;
    color: var(--yt-text); font-size: 16px; outline: none;
  }
  .yt-search-box input::placeholder { color: #888; }
  .yt-search-box:focus-within { border-color: #1c62b9; }
  .yt-search-btn {
    padding: 0 24px; background: #222; border: none; border-left: 1px solid #303030;
    color: var(--yt-text); cursor: pointer; display: flex; align-items: center;
  }
  .yt-search-btn:hover { background: #333; }
  .yt-mic-btn {
    width: 40px; height: 40px; border-radius: 50%; border: none;
    background: var(--yt-surface); color: var(--yt-text);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; flex-shrink: 0;
  }
  .yt-mic-btn:hover { background: var(--yt-surface-hover); }
  .yt-topbar-right { display: flex; align-items: center; gap: 8px; }
  .yt-icon-btn {
    width: 40px; height: 40px; border-radius: 50%; border: none;
    background: none; color: var(--yt-text);
    display: flex; align-items: center; justify-content: center; cursor: pointer;
  }
  .yt-icon-btn:hover { background: rgba(255,255,255,0.1); }
  .yt-avatar-small {
    width: 32px; height: 32px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center; font-size: 14px;
    cursor: pointer;
  }

  /* ── LAYOUT ── */
  .yt-content {
    display: flex; gap: 24px;
    max-width: 1720px; margin: 0 auto;
    padding: 24px 24px 80px;
  }
  .yt-primary { flex: 1; min-width: 0; max-width: 1020px; }
  .yt-sidebar { width: 402px; flex-shrink: 0; }

  /* ── PLAYER ── */
  .yt-player {
    position: relative; width: 100%; aspect-ratio: 16/9;
    background: #000; border-radius: 12px; overflow: hidden;
  }
  .yt-video-iframe {
    width: 100%; height: 100%; border: none; display: block;
  }
  .yt-poster {
    width: 100%; height: 100%; cursor: pointer; position: relative;
  }
  .yt-poster-img {
    width: 100%; height: 100%; object-fit: cover; display: block;
  }
  .yt-big-play {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    background: none; border: none; cursor: pointer;
    transition: filter 0.1s;
  }
  .yt-big-play svg { opacity: 0.85; transition: opacity 0.15s; }
  .yt-poster:hover .yt-big-play svg { opacity: 1; }

  /* ── TITLE ── */
  .yt-title {
    font-size: 20px; font-weight: 700; line-height: 28px;
    margin: 12px 0 0; color: var(--yt-text);
    letter-spacing: -0.2px;
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
    flex-shrink: 0; cursor: pointer;
  }
  .yt-channel-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .yt-channel-text { display: flex; flex-direction: column; }
  .yt-channel-name-row { display: flex; align-items: center; gap: 4px; }
  .yt-channel-name { font-size: 16px; font-weight: 600; cursor: pointer; }
  .yt-channel-name:hover { color: #fff; }
  .yt-channel-subs { font-size: 12px; color: var(--yt-text2); }
  .yt-subscribe-btn {
    background: #fff; color: #0f0f0f; border: none; border-radius: 20px;
    padding: 10px 20px; font-size: 14px; font-weight: 600; cursor: pointer;
    margin-left: 8px; transition: opacity 0.15s;
  }
  .yt-subscribe-btn:hover { opacity: 0.85; }
  .yt-subscribed-btn {
    background: var(--yt-surface); color: var(--yt-text); border: none; border-radius: 20px;
    padding: 10px 16px; font-size: 14px; font-weight: 600; cursor: pointer;
    margin-left: 8px; display: flex; align-items: center; gap: 8px;
  }
  .yt-subscribed-btn:hover { background: var(--yt-surface-hover); }
  .yt-subscribed-btn svg { width: 16px; height: 16px; }

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
    white-space: nowrap; transition: background 0.15s;
  }
  .yt-action-btn:hover { background: var(--yt-surface-hover); }
  .yt-action-btn.yt-active { color: var(--yt-blue); }
  .yt-like-btn, .yt-dislike-btn { border-radius: 0; }
  .yt-like-divider { width: 1px; background: #494949; }
  .yt-more-btn { padding: 8px 12px; }

  /* ── DESCRIPTION ── */
  .yt-description {
    background: var(--yt-surface); border-radius: 12px;
    padding: 12px; margin: 12px 0; cursor: pointer;
    max-height: 100px; overflow: hidden;
    transition: max-height 0.35s ease;
    position: relative;
  }
  .yt-desc-expanded {
    max-height: 800px; cursor: default;
    padding-bottom: 16px;
  }
  .yt-description:not(.yt-desc-expanded):hover { background: #333; }
  .yt-desc-stats {
    display: flex; gap: 8px; font-size: 14px; font-weight: 600; margin-bottom: 8px;
  }
  .yt-desc-text {
    font-size: 14px; line-height: 1.5; white-space: pre-wrap;
    color: var(--yt-text);
  }
  .yt-desc-more {
    font-size: 14px; font-weight: 600; color: var(--yt-text);
    cursor: pointer; display: inline-block; margin-top: 2px;
  }
  .yt-desc-less {
    font-size: 14px; font-weight: 600; color: var(--yt-text);
    cursor: pointer; display: block; margin-top: 12px;
    background: none; border: none; padding: 0;
  }
  .yt-desc-less:hover { text-decoration: underline; }

  /* ── COMMENTS ── */
  .yt-comments { margin-top: 24px; }
  .yt-comments-header {
    display: flex; align-items: center; gap: 24px; margin-bottom: 24px;
  }
  .yt-comments-head {
    font-size: 16px; font-weight: 700;
    font-family: "Roboto", Arial, sans-serif;
  }
  .yt-sort-wrapper { position: relative; }
  .yt-sort-btn {
    display: flex; align-items: center; gap: 8px;
    background: none; border: none; color: var(--yt-text);
    cursor: pointer; font-size: 14px; font-weight: 600;
    padding: 8px 4px;
  }
  .yt-sort-btn:hover { color: #fff; }
  .yt-sort-menu {
    position: absolute; top: 100%; left: 0; z-index: 10;
    background: #282828; border-radius: 12px;
    padding: 8px 0; min-width: 180px;
    box-shadow: 0 4px 32px rgba(0,0,0,0.6);
  }
  .yt-sort-menu button {
    display: block; width: 100%; text-align: left;
    background: none; border: none; color: var(--yt-text);
    padding: 10px 16px; font-size: 14px; cursor: pointer;
  }
  .yt-sort-menu button:hover { background: rgba(255,255,255,0.1); }
  .yt-sort-menu button.active { color: var(--yt-blue); }
  .yt-comment-input {
    display: flex; gap: 16px; align-items: flex-start; margin-bottom: 32px;
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
    color: var(--yt-text); font-size: 14px; padding: 8px 0;
    outline: none; transition: border-color 0.2s;
    font-family: "Roboto", Arial, sans-serif;
  }
  .yt-comment-field:focus { border-color: #fff; }
  .yt-comment {
    display: flex; gap: 16px; margin-bottom: 16px;
    padding: 4px 0;
  }
  .yt-pinned-label {
    display: flex; align-items: center; gap: 6px;
    font-size: 12px; color: var(--yt-text2); margin-bottom: 4px;
    font-weight: 500;
  }
  .yt-comment-body { flex: 1; }
  .yt-comment-meta { display: flex; gap: 8px; align-items: baseline; }
  .yt-comment-author {
    font-size: 13px; font-weight: 600;
    background: transparent; padding: 2px 6px; border-radius: 12px;
    margin-left: -6px;
  }
  .yt-comment-time { font-size: 12px; color: var(--yt-text2); }
  .yt-comment-text {
    font-size: 14px; line-height: 1.4; margin: 4px 0 8px;
    white-space: pre-wrap;
  }
  .yt-comment-actions {
    display: flex; align-items: center; gap: 8px;
  }
  .yt-comment-actions button {
    background: none; border: none; color: var(--yt-text2); cursor: pointer;
    padding: 4px; display: flex; align-items: center;
    border-radius: 50%;
  }
  .yt-comment-actions button:hover { background: rgba(255,255,255,0.1); }
  .yt-comment-actions span { font-size: 12px; color: var(--yt-text2); }
  .yt-reply-btn {
    font-size: 12px !important; font-weight: 600;
    border-radius: 16px !important; padding: 6px 12px !important;
  }
  .yt-reply-btn:hover { background: rgba(255,255,255,0.15) !important; }
  .yt-heart-badge {
    display: inline-flex; align-items: center; margin-left: 4px;
    position: relative;
  }
  .yt-view-replies {
    display: flex; align-items: center; gap: 4px;
    background: none; border: none; color: var(--yt-blue);
    font-size: 14px; font-weight: 600; cursor: pointer;
    padding: 8px 16px 8px 0; margin-top: 4px;
  }
  .yt-view-replies:hover { background: rgba(62,166,255,0.1); border-radius: 20px; }

  /* ── CHIPS ── */
  .yt-chips {
    display: flex; gap: 8px; overflow-x: auto; padding-bottom: 12px;
    margin-bottom: 12px; scrollbar-width: none;
  }
  .yt-chips::-webkit-scrollbar { display: none; }
  .yt-chip {
    padding: 6px 12px; border-radius: 8px; border: none;
    background: var(--yt-surface); color: var(--yt-text);
    font-size: 14px; font-weight: 500; white-space: nowrap;
    cursor: pointer; transition: background 0.15s;
  }
  .yt-chip:hover { background: var(--yt-surface-hover); }
  .yt-chip-active {
    background: #fff; color: #0f0f0f;
  }
  .yt-chip-active:hover { background: #e5e5e5; color: #0f0f0f; }

  /* ── SIDEBAR ── */
  .yt-sidebar-card {
    display: flex; gap: 8px; margin-bottom: 8px; cursor: pointer;
    border-radius: 8px; padding: 0;
  }
  .yt-sidebar-card:hover .yt-sidebar-title { color: #fff; }
  .yt-thumb {
    position: relative; width: 168px; height: 94px; flex-shrink: 0;
    border-radius: 8px; overflow: hidden;
  }
  .yt-thumb-inner {
    width: 100%; height: 100%;
  }
  .yt-thumb-dur {
    position: absolute; bottom: 4px; right: 4px;
    background: rgba(0,0,0,0.85); color: #fff;
    font-size: 12px; padding: 2px 4px; border-radius: 4px;
    font-weight: 500; font-variant-numeric: tabular-nums;
    letter-spacing: 0.5px;
  }
  .yt-sidebar-info { flex: 1; min-width: 0; padding-top: 2px; }
  .yt-sidebar-title {
    font-size: 14px; font-weight: 500; line-height: 1.3;
    margin: 0 0 4px; color: var(--yt-text);
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
    overflow: hidden; transition: color 0.1s;
  }
  .yt-sidebar-channel {
    display: block; font-size: 12px; color: var(--yt-text2);
    margin-bottom: 2px;
  }
  .yt-sidebar-channel:hover { color: var(--yt-text); }
  .yt-sidebar-meta { display: block; font-size: 12px; color: var(--yt-text2); }

  /* ── MINI PLAYER ── */
  .yt-miniplayer {
    position: fixed; bottom: 16px; right: 16px; z-index: 200;
    width: 400px; background: #1a1a1a; border-radius: 12px;
    overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.8);
    display: flex; flex-direction: column;
    animation: slideUp 0.3s ease-out;
  }
  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  .yt-mini-iframe { width: 100%; aspect-ratio: 16/9; border: none; }
  .yt-mini-info {
    padding: 8px 12px; display: flex; flex-direction: column; gap: 2px;
  }
  .yt-mini-title {
    font-size: 13px; font-weight: 500; line-height: 1.3;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .yt-mini-channel { font-size: 12px; color: var(--yt-text2); }
  .yt-mini-close {
    position: absolute; top: 8px; right: 8px;
    background: rgba(0,0,0,0.7); border: none; color: #fff;
    width: 28px; height: 28px; border-radius: 50%;
    cursor: pointer; font-size: 14px;
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity 0.2s;
  }
  .yt-miniplayer:hover .yt-mini-close { opacity: 1; }

  /* ── RESPONSIVE ── */
  @media (max-width: 1000px) {
    .yt-sidebar { display: none; }
    .yt-content { padding: 8px 8px 80px; }
    .yt-player { border-radius: 0; }
    .yt-miniplayer { width: 300px; }
  }
  @media (max-width: 640px) {
    .yt-topbar-center { display: none; }
    .yt-meta-row { flex-direction: column; align-items: flex-start; }
    .yt-title { font-size: 16px; line-height: 22px; }
    .yt-actions { width: 100%; overflow-x: auto; flex-wrap: nowrap; padding-bottom: 4px; }
    .yt-miniplayer { width: calc(100% - 32px); right: 16px; left: 16px; }
  }
`;
