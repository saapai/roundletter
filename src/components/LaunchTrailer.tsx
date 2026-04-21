"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * LaunchTrailer — HERO section at the top of /.
 *
 * Always autoplays scenes 0 → 6 on mount (~22.5s) with audio muted by default.
 * Respects prefers-reduced-motion (skips to poster, no audio). No "seen"
 * memory — the trailer is the arrival, every visit.
 *
 *   scene 0  brand          — silence · magazine-cover (issue #001)
 *   scene 1  the hook       — a lot · "$3,453.83 / a lot"            (21 Savage)
 *   scene 2  punchline build— a lot continues · "name is bullshit"
 *   scene 3  the drop       — 2s metro clip · "fucking beautiful."    (Metro + Future)
 *   scene 4  the message    — silence · "aureliex leaves a message"
 *   scene 5  the auction    — nuevayol · "spray paint · friday"        (Bad Bunny)
 *   scene 6  outro          — silence · "watch." · poster, stays put
 *
 * Natural scroll (no lock). IntersectionObserver pauses audio when the hero
 * scrolls out of view. "↓ continue" button smooth-scrolls to #after-hero.
 */

const MUTE_KEY = "rl:launch-trailer-muted";

type Scene = 0 | 1 | 2 | 3 | 4 | 5 | 6;
type AudioKey = "hook" | "drop" | "auction" | "silence";

const SCHEDULE: Array<{ scene: Scene; at: number; audio?: AudioKey }> = [
  { scene: 0, at: 0,     audio: "silence" },
  { scene: 1, at: 800,   audio: "hook"    },
  { scene: 2, at: 6500,  audio: "hook"    },
  { scene: 3, at: 11000, audio: "drop"    },
  { scene: 4, at: 13500, audio: "silence" },
  { scene: 5, at: 17000, audio: "auction" },
  { scene: 6, at: 20000, audio: "silence" },
];

const VOLUMES: Record<AudioKey, number> = {
  hook: 0.6, drop: 0.75, auction: 0.55, silence: 0,
};

export default function LaunchTrailer() {
  const [stage, setStage] = useState<Scene>(0);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const timers = useRef<number[]>([]);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const hookRef = useRef<HTMLAudioElement | null>(null);
  const dropRef = useRef<HTMLAudioElement | null>(null);
  const auctRef = useRef<HTMLAudioElement | null>(null);

  const pauseAll = useCallback(() => {
    [hookRef, dropRef, auctRef].forEach((r) => {
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
      setStage(6);                // poster only — a11y
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
          else if (audio === "auction") play(auctRef, "auction");
          else if (audio === "silence") pauseAll();
        }, at)
      );
    });

    // After the final scene, park on the poster and pause audio.
    timers.current.push(
      window.setTimeout(() => {
        setPlaying(false);
        pauseAll();
      }, 22500)
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
    [hookRef, dropRef, auctRef].forEach((r) => { if (r.current) r.current.muted = muted; });
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
    setStage(6);
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
      <audio ref={hookRef} src="/audio/a-lot.mp3"             preload="auto" playsInline muted />
      <audio ref={dropRef} src="/audio/just-like-me-drop.mp3" preload="auto" playsInline muted />
      <audio ref={auctRef} src="/audio/nuevayol.mp3"          preload="auto" playsInline muted />

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
          <div className="trailer-a">$3,453.83.</div>
          <div className="trailer-q">how big&rsquo;s your goal?</div>
          <div className="trailer-a trailer-a-hi">a lot.</div>
        </div>
        <div className="trailer-attr">a lot · 21 savage ft. j. cole · 2018</div>
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
        <div className="trailer-attr">just like me · metro boomin + future · 2022</div>
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

      {/* scene 5 — the auction */}
      <div className="trailer-scene trailer-scene-5c">
        <div className="trailer-eyebrow">plus · the next event</div>
        <div className="trailer-title trailer-title-auction">spray paint auction</div>
        <div className="trailer-attr">ovation hollywood · friday · sunset → midnight</div>
        <div className="trailer-find">&ldquo;you&rsquo;ll find it.&rdquo;</div>
        <div className="trailer-attr trailer-attr-faint">nuevayol · bad bunny · 2025</div>
      </div>

      {/* scene 6 — outro · the resting poster */}
      <div className="trailer-scene trailer-scene-6c">
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
    </section>
  );
}
