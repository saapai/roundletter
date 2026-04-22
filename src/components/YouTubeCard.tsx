"use client";

import { useState } from "react";

// YouTubeCard · styled faux-YouTube card that swaps to a playable iframe
// on click. First paint stays cheap (no third-party iframe cost) and the
// visual register stays inside the site (thumbnail is CSS). On interaction
// the thumbnail is replaced by an autoplaying youtube-nocookie iframe so
// the reader never leaves the document.
//
// Two visual variants:
//   default — YouTube red / dark card
//   ph      — PornHub-orange tinting (Kanye bookend register allusion;
//             also used for the Claude-Code "YEHub" chip elsewhere).

type Props = {
  videoId: string;          // raw id or full url
  title: string;
  channel: string;
  meta?: string;            // third line (e.g., "128K views · 2 years ago")
  duration?: string;        // "9:28" style
  avatar?: string;          // single letter for the channel pill
  variant?: "default" | "ph";
  brand?: string;           // brand rect text (e.g., "YEHub")
  brandWord?: string;       // brand word next to the rect
};

function idOnly(raw: string): string {
  if (/^[\w-]{8,15}$/.test(raw)) return raw;
  const m = raw.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{8,15})/);
  return m ? m[1] : raw;
}

export default function YouTubeCard({
  videoId,
  title,
  channel,
  meta,
  duration,
  avatar,
  variant = "default",
  brand,
  brandWord,
}: Props) {
  const [playing, setPlaying] = useState(false);
  const id = idOnly(videoId);
  const isPh = variant === "ph";
  const rootClass = `yt-card yt-card-embed ${isPh ? "yt-card-ph" : ""}`;

  if (playing) {
    return (
      <div className={rootClass} data-embed="on">
        <div className="yt-embed-wrap">
          <iframe
            className="yt-embed-iframe"
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
        <div className={`yt-meta ${isPh ? "yt-meta-ph" : ""}`}>
          <span className={`yt-avatar ${isPh ? "yt-avatar-ph" : ""}`} aria-hidden="true">
            {avatar ?? channel[0] ?? "·"}
          </span>
          <div className="yt-text">
            <div className={`yt-title ${isPh ? "yt-title-ph" : ""}`}>{title}</div>
            <div className={`yt-chan ${isPh ? "yt-chan-ph" : ""}`}>
              {channel} <span className="yt-verified" aria-hidden="true">✓</span>
            </div>
            {meta ? (
              <div className={`yt-counts ${isPh ? "yt-counts-ph" : ""}`}>{meta}</div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      className={rootClass}
      onClick={() => setPlaying(true)}
      aria-label={`play ${title} by ${channel}`}
    >
      <div className={`yt-thumb ${isPh ? "yt-thumb-ph" : ""}`} aria-hidden="true">
        <div className="yt-thumb-noise" />
        <div className="yt-thumb-vignette" />
        <span className={`yt-thumb-play ${isPh ? "yt-thumb-play-ph" : ""}`}>
          <svg viewBox="0 0 68 48" width="52" height="36">
            <path
              className={`yt-play-bg ${isPh ? "yt-play-bg-ph" : ""}`}
              d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z"
            />
            <path className="yt-play-tri" d="M45 24 27 14v20" />
          </svg>
        </span>
        {duration ? (
          <span className={`yt-thumb-dur ${isPh ? "yt-thumb-dur-ph" : ""}`}>{duration}</span>
        ) : null}
      </div>
      <div className={`yt-meta ${isPh ? "yt-meta-ph" : ""}`}>
        <span className={`yt-avatar ${isPh ? "yt-avatar-ph" : ""}`} aria-hidden="true">
          {avatar ?? channel[0] ?? "·"}
        </span>
        <div className="yt-text">
          <div className={`yt-title ${isPh ? "yt-title-ph" : ""}`}>{title}</div>
          <div className={`yt-chan ${isPh ? "yt-chan-ph" : ""}`}>
            {channel} <span className="yt-verified" aria-hidden="true">✓</span>
          </div>
          {meta ? (
            <div className={`yt-counts ${isPh ? "yt-counts-ph" : ""}`}>{meta}</div>
          ) : null}
        </div>
      </div>
      {(brand || brandWord) ? (
        <div
          className={`yt-brand ${isPh ? "yt-brand-ph" : "yt-brand-youtube"}`}
          aria-hidden="true"
        >
          <span className={`yt-brand-rect ${isPh ? "yt-brand-rect-ph" : ""}`}>
            {isPh ? brand : ""}
          </span>
          <span className={`yt-brand-word ${isPh ? "yt-brand-word-ph" : ""}`}>
            {brandWord ?? (isPh ? "" : "YouTube")}
          </span>
        </div>
      ) : null}
    </button>
  );
}
