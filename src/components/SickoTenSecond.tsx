"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// The 10-second hook. 8 seconds of sicko mode (or any mp4 the user drops in),
// then 2 seconds of stark fork: click v1 (the apparatus = /archives) or v2
// (the new house = /market). Muted autoplay per browser policy; click to unmute.
// Legal compliance: saathvik trims the clip from his own Premium-licensed copy
// and hosts it at /public/videos/sicko-10s.mp4 locally. Don't redistribute.

type Props = {
  src?: string;
  poster?: string;
  forkAtSec?: number;
  label?: string;
};

export default function SickoTenSecond({
  src = "/videos/sicko-10s.mp4",
  poster,
  forkAtSec = 8,
  label = "8 seconds · then you choose",
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [forkShown, setForkShown] = useState(false);
  const [muted, setMuted] = useState(true);
  const [hasSrcError, setHasSrcError] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => {
      setElapsed(v.currentTime);
      if (v.currentTime >= forkAtSec && !forkShown) {
        setForkShown(true);
        v.pause();
      }
    };
    const onEnded = () => {
      setForkShown(true);
    };
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("ended", onEnded);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("ended", onEnded);
    };
  }, [forkAtSec, forkShown]);

  const replay = () => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    setForkShown(false);
    v.play().catch(() => {});
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const secondsRemaining = Math.max(0, forkAtSec - elapsed);

  return (
    <section className="sicko-ten" aria-label="the 10-second hook">
      <div className="sicko-ten-eyebrow">
        <span className="sicko-ten-dot" aria-hidden="true" />
        <span>// the drop · {label}</span>
      </div>
      <div className="sicko-ten-frame">
        {!hasSrcError ? (
          <video
            ref={videoRef}
            className="sicko-ten-video"
            src={src}
            poster={poster}
            autoPlay
            muted
            playsInline
            preload="auto"
            onError={() => setHasSrcError(true)}
          />
        ) : (
          <div className="sicko-ten-placeholder" role="img" aria-label="video placeholder">
            <div className="sicko-ten-placeholder-line">drop the file</div>
            <code className="sicko-ten-placeholder-path">/public/videos/sicko-10s.mp4</code>
            <div className="sicko-ten-placeholder-sub">8s of sicko mode · hook only · trimmed from your own copy</div>
          </div>
        )}

        {!forkShown && !hasSrcError && (
          <div className="sicko-ten-timer" aria-hidden="true">
            <span>{secondsRemaining.toFixed(1)}</span>
          </div>
        )}

        {forkShown && (
          <div className="sicko-ten-fork" role="dialog" aria-label="choose v1 or v2">
            <Link href="/eggs" className="sicko-ten-choice sicko-ten-choice-v1">
              <span className="sicko-ten-choice-tag">v1</span>
              <span className="sicko-ten-choice-title">the apparatus</span>
              <span className="sicko-ten-choice-sub">five agents · sealed ballots · kill-switches</span>
            </Link>
            <Link href="/market" className="sicko-ten-choice sicko-ten-choice-v2">
              <span className="sicko-ten-choice-tag">v2</span>
              <span className="sicko-ten-choice-title">the new house</span>
              <span className="sicko-ten-choice-sub">green apple · rotten apple · true odds</span>
            </Link>
          </div>
        )}
      </div>

      <div className="sicko-ten-controls">
        <button type="button" className="sicko-ten-ctrl" onClick={toggleMute} aria-label={muted ? "unmute the drop" : "mute the drop"}>
          {muted ? "unmute" : "mute"}
        </button>
        <button type="button" className="sicko-ten-ctrl" onClick={replay} aria-label="replay the 10 seconds">
          replay ↻
        </button>
        <span className="sicko-ten-note">
          8s hook · 2s fork · pick your altitude
        </span>
      </div>
    </section>
  );
}
