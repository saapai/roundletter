"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * LaunchTrailer — the first-load cinematic overlay.
 *
 * Per panel round 16 (simplicity mandate): three songs, three jobs.
 *   hook            — "a lot" (21 Savage ft. J. Cole, 2018)
 *   punchline hit   — "just like me" (Metro Boomin + Future, 2022)
 *   auction teaser  — "nuevayol" (Bad Bunny, 2025)
 *
 * Seven scenes, ~22s:
 *   0  brand        — silence, magazine-cover (issue #001)
 *   1  the hook     — A Lot plays · "$3,453 → $100,000 · a lot"
 *   2  the punchline— A Lot fades · text build · "the name is bullshit"
 *   3  the drop     — 2s Metro clip on "fucking beautiful."
 *   4  the message  — silence · aureliex leaves a message
 *   5  the auction  — NUEVAYoL swells · ovation hollywood · you'll find it
 *   6  outro        — silence · "watch."
 *
 * Exit conditions (any = compartmentalize + localStorage flag):
 *   - skip button
 *   - wheel / touchmove / keyboard scroll
 *   - scene 7 reached
 *   - prefers-reduced-motion
 *   - returning visitor (localStorage flag set)
 */

const SEEN_KEY = "rl:launch-trailer-seen-v1";
const MUTE_KEY = "rl:launch-trailer-muted";

type Scene = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7; // 7 = gone

type AudioKey = "hook" | "drop" | "auction" | "silence";

const SCHEDULE: Array<{ scene: Scene; at: number; audio?: AudioKey }> = [
  { scene: 0, at: 0,     audio: "silence" },
  { scene: 1, at: 800,   audio: "hook"    },   // A Lot
  { scene: 2, at: 6500,  audio: "hook"    },   // A Lot continues underneath
  { scene: 3, at: 11000, audio: "drop"    },   // Metro · lands on "beautiful"
  { scene: 4, at: 13500, audio: "silence" },
  { scene: 5, at: 17000, audio: "auction" },   // NUEVAYoL
  { scene: 6, at: 20000, audio: "silence" },
  { scene: 7, at: 22500 },
];

const VOLUMES: Record<AudioKey, number> = {
  hook:    0.6,
  drop:    0.75,
  auction: 0.55,
  silence: 0,
};

export default function LaunchTrailer() {
  const [stage, setStage] = useState<Scene | null>(null);
  const [muted, setMuted] = useState(true);
  const timers = useRef<number[]>([]);

  const hookRef = useRef<HTMLAudioElement | null>(null);
  const dropRef = useRef<HTMLAudioElement | null>(null);
  const auctRef = useRef<HTMLAudioElement | null>(null);

  const pauseAll = useCallback(() => {
    [hookRef, dropRef, auctRef].forEach((r) => {
      try { r.current?.pause(); } catch {}
    });
  }, []);

  const exit = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    pauseAll();
    setStage(7);
    try { window.localStorage.setItem(SEEN_KEY, "1"); } catch {}
  }, [pauseAll]);

  // Mount: read flags, schedule scenes.
  useEffect(() => {
    let seen = false;
    try {
      seen = window.localStorage.getItem(SEEN_KEY) === "1";
      if (window.localStorage.getItem(MUTE_KEY) === "0") setMuted(false);
    } catch {}
    const prefersReduced =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || prefersReduced) {
      setStage(7);
      try { window.localStorage.setItem(SEEN_KEY, "1"); } catch {}
      return;
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    let lastAudio: AudioKey = "silence";
    SCHEDULE.forEach(({ scene, at, audio }) => {
      timers.current.push(
        window.setTimeout(() => {
          setStage(scene);
          if (scene === 7) { exit(); return; }
          if (!audio) return;
          // Only switch tracks when audio key actually changes — this lets
          // "hook" play continuously across scenes 1 → 2 without restarting.
          if (audio === lastAudio) return;
          lastAudio = audio;
          const play = (ref: React.MutableRefObject<HTMLAudioElement | null>, key: AudioKey) => {
            pauseAll();
            const a = ref.current;
            if (!a) return;
            a.volume = VOLUMES[key];
            a.currentTime = 0;
            a.play().catch(() => {});
          };
          if (audio === "hook")     play(hookRef, "hook");
          else if (audio === "drop")    play(dropRef, "drop");
          else if (audio === "auction") play(auctRef, "auction");
          else if (audio === "silence") pauseAll();
        }, at)
      );
    });

    return () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
      document.body.style.overflow = prevOverflow;
      pauseAll();
    };
  }, [exit, pauseAll]);

  // Manual-scroll and keyboard exit.
  useEffect(() => {
    if (stage === null || stage === 7) return;
    const onScroll = () => exit();
    const onKey = (e: KeyboardEvent) => {
      if (["PageDown", "PageUp", "ArrowDown", "ArrowUp", "Space", " ", "End", "Home"].includes(e.key)) {
        exit();
      }
    };
    window.addEventListener("wheel",     onScroll, { passive: true, once: true });
    window.addEventListener("touchmove", onScroll, { passive: true, once: true });
    window.addEventListener("keydown",   onKey);
    return () => {
      window.removeEventListener("wheel", onScroll);
      window.removeEventListener("touchmove", onScroll);
      window.removeEventListener("keydown", onKey);
    };
  }, [stage, exit]);

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

  if (stage === null || stage === 7) return null;

  // Render each letter of "AURELIEX" as a cut-paper tile (ransom-note style).
  const brand = ["a", "u", "r", "e", "l", "i", "e", "x"];

  return (
    <div className={`trailer trailer-scene-${stage}`} role="presentation">
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

      {/* scene 1 — the hook · A Lot · ambition frame */}
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

      {/* scene 2 — the punchline build */}
      <div className="trailer-scene trailer-scene-2c">
        <div className="trailer-eyebrow">the punchline</div>
        <p className="trailer-punch">every ai product you&rsquo;ve seen is useless but has a cool name.</p>
        <p className="trailer-punch trailer-punch-meet">meet <em>aureliex.</em></p>
        <p className="trailer-punch">the name is bullshit. but the product?</p>
      </div>

      {/* scene 3 — the drop on "fucking beautiful." */}
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

      {/* scene 4 — "aureliex leaves a message" */}
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

      {/* scene 6 — outro */}
      <div className="trailer-scene trailer-scene-6c">
        <div className="trailer-outro">watch.</div>
      </div>

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
        onClick={exit}
        aria-label="skip trailer"
      >
        <span aria-hidden="true">skip →</span>
      </button>

      <div className="trailer-progress" aria-hidden="true">
        <div className="trailer-progress-fill" />
      </div>
    </div>
  );
}
