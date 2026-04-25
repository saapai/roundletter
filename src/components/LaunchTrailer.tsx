"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SONGS, youtubeSearchLink } from "@/lib/song-links";

type Props = {
  /** current portfolio value (live from server) — falls back to baseline */
  liveValue?: number;
  /** baseline / round-open value */
  baseline?: number;
};

/**
 * LaunchTrailer — HERO section at the top of /.
 *
 * Always autoplays scenes 0 → 5 on mount (~19.5s) with audio muted by default.
 * Respects prefers-reduced-motion (skips to poster, no audio). No "seen"
 * memory — the trailer is the arrival, every visit.
 *
 *   scene 0  brand          — silence · magazine-cover (issue #001)
 *   scene 1  the hook       — circo loco · "$3,453 / 100k"            (Drake + 21 Savage)
 *   scene 2  punchline build— circo loco continues · "name is bullshit"
 *   scene 3  the drop       — 2s metro clip · "fucking beautiful."    (Metro + Future)
 *   scene 4  the message    — silence · "aureliex leaves a message"
 *   scene 5  outro          — silence · "watch." · poster, stays put
 *
 * Natural scroll (no lock). IntersectionObserver pauses audio when the hero
 * scrolls out of view. "↓ continue" button smooth-scrolls to #after-hero.
 */

const MUTE_KEY = "rl:launch-trailer-muted";

type Scene = 0 | 1 | 2 | 3 | 4 | 5;
type AudioKey = "hook" | "drop" | "silence";

// Scene 0 (the magazine cover) held too briefly for viewers to read the
// "aureliex" wordmark + issue-number tag. All downstream beats shift by
// ~2.5s; progress-bar CSS keyframe matches the new tail.
const SCHEDULE: Array<{ scene: Scene; at: number; audio?: AudioKey }> = [
  { scene: 0, at: 0,     audio: "silence" },
  { scene: 1, at: 3300,  audio: "hook"    },
  { scene: 2, at: 9000,  audio: "hook"    },
  { scene: 3, at: 13500, audio: "drop"    },
  { scene: 4, at: 16000, audio: "silence" },
  { scene: 5, at: 19500, audio: "silence" },
];

const VOLUMES: Record<AudioKey, number> = {
  hook: 0.6, drop: 0.75, silence: 0,
};

function fmtMoney(n: number): string {
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export default function LaunchTrailer({ liveValue, baseline = 3453.83 }: Props = {}) {
  const [stage, setStage] = useState<Scene>(0);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const timers = useRef<number[]>([]);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const hookRef = useRef<HTMLAudioElement | null>(null);
  const dropRef = useRef<HTMLAudioElement | null>(null);

  const pauseAll = useCallback(() => {
    [hookRef, dropRef].forEach((r) => {
      try { r.current?.pause(); } catch {}
    });
  }, []);

  // Mount: always autoplay, unless the visitor has reduced-motion set.
  useEffect(() => {
    try {
      if (window.localStorage.getItem(MUTE_KEY) === "0") setMuted(false);
    } catch {}
    const prefersReduced =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setStage(5);                // poster only — a11y
      setPlaying(false);
      return;
    }
    setStage(0);
    setPlaying(true);

    let lastAudio: AudioKey = "silence";
    SCHEDULE.forEach(({ scene, at, audio }) => {
      timers.current.push(
        window.setTimeout(() => {
          setStage(scene);
          if (!audio || audio === lastAudio) return;
          lastAudio = audio;
          const play = (ref: React.MutableRefObject<HTMLAudioElement | null>, key: AudioKey) => {
            pauseAll();
            const a = ref.current;
            if (!a) return;
            a.volume = VOLUMES[key];
            a.currentTime = 0;
            a.play().catch(() => {});
          };
          if (audio === "hook")         play(hookRef, "hook");
          else if (audio === "drop")    play(dropRef, "drop");
          else if (audio === "silence") pauseAll();
        }, at)
      );
    });

    // After the final scene, park on the poster and pause audio.
    timers.current.push(
      window.setTimeout(() => {
        setPlaying(false);
        pauseAll();
      }, 19500)
    );

    return () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
      pauseAll();
    };
  }, [pauseAll]);

  // Pause audio when the hero scrolls out of view.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) pauseAll();
        });
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [pauseAll]);

  useEffect(() => {
    [hookRef, dropRef].forEach((r) => { if (r.current) r.current.muted = muted; });
  }, [muted]);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      try { window.localStorage.setItem(MUTE_KEY, next ? "1" : "0"); } catch {}
      return next;
    });
  }, []);

  const continueDown = useCallback(() => {
    // Skip the rest of the schedule and park on the poster scene.
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    pauseAll();
    setStage(5);
    setPlaying(false);
    const target = document.getElementById("after-hero");
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [pauseAll]);

  const brand = ["a", "u", "r", "e", "l", "i", "e", "x"];

  return (
    <section
      ref={rootRef}
      className={`trailer trailer-hero trailer-scene-${stage}`}
      role="presentation"
      aria-label="aureliex launch trailer"
    >
      <audio ref={hookRef} src="/audio/circo-loco.mp3"        preload="auto" playsInline muted />
      <audio ref={dropRef} src="/audio/just-like-me-drop.mp3" preload="auto" playsInline muted />

      <div className="trailer-bg" aria-hidden="true" />

      {/* scene 0 — magazine cover */}
      <div className="trailer-scene trailer-scene-0c">
        <div className="trailer-topbar">special once in a lifetime issue <span>#001</span></div>
        <div className="trailer-brand" aria-label="aureliex">
          {brand.map((ch, i) => (
            <span key={i} className="trailer-brand-tile" data-i={i}>{ch}</span>
          ))}
        </div>
        <div className="trailer-subtitle">the magazine for a portfolio kept in public</div>
        <div className="trailer-advisory">
          <span>published</span>
          <strong>in public</strong>
          <span>not investment advice</span>
        </div>
      </div>

      {/* scene 1 — the hook */}
      <div className="trailer-scene trailer-scene-1c">
        <div className="trailer-eyebrow">the hook</div>
        <div className="trailer-qa">
          <div className="trailer-q">how much money you got?</div>
          <div className="trailer-a">{fmtMoney(liveValue ?? baseline)}.</div>
          <div className="trailer-q">how big&rsquo;s your goal?</div>
          <div className="trailer-a trailer-a-hi">a hundred K.</div>
        </div>
        <a className="trailer-attr trailer-attr-link" href={youtubeSearchLink(SONGS.circo_loco)} target="_blank" rel="noopener noreferrer">
          circo loco · drake &amp; 21 savage · 2022 <span aria-hidden="true">↗</span>
        </a>
      </div>

      {/* scene 2 — punchline build */}
      <div className="trailer-scene trailer-scene-2c">
        <div className="trailer-eyebrow">the punchline</div>
        <p className="trailer-punch">every ai product you&rsquo;ve seen is useless but has a cool name.</p>
        <p className="trailer-punch trailer-punch-meet">meet <em>aureliex.</em></p>
        <p className="trailer-punch">the name is bullshit. but the product?</p>
      </div>

      {/* scene 3 — the drop */}
      <div className="trailer-scene trailer-scene-3c">
        <div className="trailer-cutwrap">
          {"fucking beautiful.".split("").map((ch, i) => (
            <span key={i} className="trailer-cut" data-i={i}>
              {ch === " " ? " " : ch}
            </span>
          ))}
        </div>
        <a className="trailer-attr trailer-attr-link" href={youtubeSearchLink(SONGS.just_like_me)} target="_blank" rel="noopener noreferrer">
          just like me · metro boomin + future · 2022 <span aria-hidden="true">↗</span>
        </a>
      </div>

      {/* scene 4 — the message */}
      <div className="trailer-scene trailer-scene-4c">
        <div className="trailer-message">
          <div className="trailer-message-kicker">aureliex</div>
          <div className="trailer-message-kicker trailer-message-kicker-big">leaves a message</div>
          <ul className="trailer-message-list">
            <li>— the counter culture is here.</li>
            <li>— you can&rsquo;t stop it if you tried.</li>
            <li>— the best you can do is watch.</li>
          </ul>
        </div>
      </div>

      {/* scene 5 — outro · the resting poster */}
      <div className="trailer-scene trailer-scene-5c">
        <div className="trailer-outro">watch.</div>
      </div>

      {/* controls */}
      <button
        type="button"
        className="trailer-ctrl trailer-sound"
        onClick={toggleMute}
        aria-label={muted ? "unmute" : "mute"}
      >
        <span aria-hidden="true">{muted ? "♪ off" : "♪ on"}</span>
      </button>
      <button
        type="button"
        className="trailer-ctrl trailer-skip"
        onClick={continueDown}
        aria-label="continue to the rest"
      >
        <span aria-hidden="true">↓ continue</span>
      </button>

      {playing ? (
        <div className="trailer-progress" aria-hidden="true">
          <div className="trailer-progress-fill" />
        </div>
      ) : null}

      {/* desktop-only tv chrome — hidden on mobile via css.
          these elements live on the wooden bezel and are the egg surface:
          clicking any combination of them triggers the "channel 69" egg once
          the total dial interactions cross a threshold. */}
      <div className="trailer-tv-chrome" aria-hidden="true" data-tv-chrome="true">
        <button
          type="button"
          tabIndex={-1}
          className="trailer-tv-knob trailer-tv-knob-vol"
          aria-label="volume dial"
          data-hunt-knob="vol"
        />
        <button
          type="button"
          tabIndex={-1}
          className="trailer-tv-knob trailer-tv-knob-ch"
          aria-label="channel dial"
          data-hunt-knob="ch"
        />
        <button
          type="button"
          tabIndex={-1}
          className="trailer-tv-power"
          aria-label="power"
          data-hunt-knob="pwr"
        />
      </div>
    </section>
  );
}
