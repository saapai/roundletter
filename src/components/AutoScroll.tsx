"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Music that follows YOU — plays chronologically (play/pause resumes), but its
 * volume is continuously recalibrated to the salience of the slide you're on.
 *
 * Mental model:
 *   loud when the slide is sparse (music carries the emotion)
 *   quiet when the slide is dense (you are speaking / reader is reading)
 *   rises into punchy slides, fades on reading-heavy ones
 *
 * Recalibrates every 500ms based on scroll position, with RAF-smoothed volume.
 */

type Density = "sparse" | "medium" | "dense";

const SLIDE_DENSITY: Record<string, Density> = {
  s1:  "sparse",  // a quiet case.
  s2:  "medium",  // thesis
  s3:  "medium",  // range list (wide: what i build generally)
  s4:  "dense",   // receipts table (you talk it through — what i built for us)
  s5:  "sparse",  // punchline — sep's infrastructure (drop the mic)
  s6:  "medium",  // cities pivot (visual drama)
  s7:  "dense",   // three moves (you explain)
  s8:  "sparse",  // reframe (dramatic)
  s9:  "dense",   // manifesto (slow read)
  s10: "sparse",  // aurora finale (let it hit)
};

const SLIDE_IDS = Object.keys(SLIDE_DENSITY);

const VOLUME_FOR: Record<Density, number> = {
  sparse: 1.00,   // music carries
  medium: 0.62,   // music supports
  dense:  0.22,   // music whispers; your voice wins
};

const CALIBRATE_MS = 500;
const FADE_END_SEC = 3;
const END_SCROLL_FADE_FROM = 0.88; // start fading when scrollY/maxScroll > this

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

export default function AutoScroll() {
  const [playing, setPlaying] = useState(false);
  const [remaining, setRemaining] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const targetVolRef = useRef<number>(VOLUME_FOR.sparse);
  const calibrateTimerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const stopTimers = () => {
    if (calibrateTimerRef.current != null) {
      clearInterval(calibrateTimerRef.current);
      calibrateTimerRef.current = null;
    }
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const calibrate = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const viewportMid = window.scrollY + window.innerHeight / 2;

    type Rect = { id: string; top: number; bottom: number };
    const rects: Rect[] = SLIDE_IDS.map(id => {
      const el = document.getElementById(id);
      if (!el) return null;
      return { id, top: el.offsetTop, bottom: el.offsetTop + el.offsetHeight } as Rect;
    }).filter((x): x is Rect => !!x);
    if (rects.length === 0) return;

    let current = rects[0];
    for (const r of rects) {
      if (r.top <= viewportMid && r.bottom > viewportMid) { current = r; break; }
    }
    const idx = rects.findIndex(r => r.id === current.id);
    const next = idx >= 0 && idx < rects.length - 1 ? rects[idx + 1] : null;
    const prev = idx > 0 ? rects[idx - 1] : null;

    const span = Math.max(1, current.bottom - current.top);
    const relPos = Math.max(0, Math.min(1, (viewportMid - current.top) / span));

    const curVol = VOLUME_FOR[SLIDE_DENSITY[current.id] ?? "medium"];
    let target = curVol;

    // Blend with the PREVIOUS slide in the top 20% of the current slide
    if (relPos < 0.2 && prev) {
      const prevVol = VOLUME_FOR[SLIDE_DENSITY[prev.id] ?? "medium"];
      target = lerp(prevVol, curVol, relPos / 0.2);
    }
    // Blend with the NEXT slide in the bottom 25% — gives a little lift when
    // we're moving TOWARD a punchier slide (since sparse > dense in volume)
    else if (relPos > 0.75 && next) {
      const nextVol = VOLUME_FOR[SLIDE_DENSITY[next.id] ?? "medium"];
      target = lerp(curVol, nextVol, (relPos - 0.75) / 0.25);
    }

    // Scroll past 88% → fade volume linearly toward 0 at end of document
    const scrollMax = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const scrollProgress = Math.min(1, Math.max(0, window.scrollY / scrollMax));
    if (scrollProgress > END_SCROLL_FADE_FROM) {
      const remain = Math.max(0, (1 - scrollProgress) / (1 - END_SCROLL_FADE_FROM));
      target *= remain;
    }

    // Song's natural tail fade (last FADE_END_SEC of the track)
    if (audio.duration > 0) {
      const left = audio.duration - audio.currentTime;
      if (left < FADE_END_SEC) {
        target = Math.min(target, Math.max(0, left / FADE_END_SEC));
      }
    }

    targetVolRef.current = Math.max(0, Math.min(1, target));
  };

  const smooth = () => {
    const audio = audioRef.current;
    if (!audio) { rafRef.current = null; return; }
    if (audio.paused) { rafRef.current = null; return; }

    // Exponential smoothing — reaches target in ~500-700ms; prevents audible clicks
    audio.volume = lerp(audio.volume, targetVolRef.current, 0.08);

    if (audio.duration > 0) {
      const left = Math.max(0, audio.duration - audio.currentTime);
      const mm = Math.floor(left / 60);
      const ss = Math.floor(left % 60).toString().padStart(2, "0");
      setRemaining(`${mm}:${ss}`);
    }

    if (audio.ended) {
      setPlaying(false);
      stopTimers();
      return;
    }

    rafRef.current = requestAnimationFrame(smooth);
  };

  const play = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    const isFresh = audio.ended || (audio.duration > 0 && audio.currentTime >= audio.duration - 0.15);
    if (isFresh) { try { audio.currentTime = 0; } catch {} }
    audio.volume = 0.3; // start muted-ish; calibrate + smooth will pull toward target
    try { await audio.play(); } catch { return; }
    setPlaying(true);
    // Prime calibration & smoothing
    calibrate();
    stopTimers();
    calibrateTimerRef.current = window.setInterval(calibrate, CALIBRATE_MS);
    rafRef.current = requestAnimationFrame(smooth);
  };

  const pause = () => {
    const audio = audioRef.current;
    if (audio) audio.pause();
    setPlaying(false);
    stopTimers();
  };

  const toggle = () => (playing ? pause() : play());

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && /INPUT|TEXTAREA/i.test(t.tagName)) return;
      if (e.key === "a" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        toggle();
      }
      if (e.key === "Escape" && playing) pause();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  useEffect(() => () => { stopTimers(); audioRef.current?.pause(); }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onLoad = () => {
      if (audio.duration > 0) {
        const mm = Math.floor(audio.duration / 60);
        const ss = Math.floor(audio.duration % 60).toString().padStart(2, "0");
        setRemaining(`${mm}:${ss}`);
      }
    };
    audio.addEventListener("loadedmetadata", onLoad);
    audio.load();
    return () => audio.removeEventListener("loadedmetadata", onLoad);
  }, []);

  return (
    <>
      <button
        onClick={toggle}
        className={`autoscroll-btn${playing ? " is-active" : ""}`}
        aria-label={playing ? "pause music" : "play music"}
        title={playing ? `pause · ${remaining ?? ""} left · press a or esc` : "play · press a"}
      >
        <span className="autoscroll-glyph">{playing ? "♪" : "▶"}</span>
        <span className="autoscroll-label">{playing ? (remaining ?? "…") : "play"}</span>
      </button>
      <audio ref={audioRef} src="/ispy.mp3" preload="metadata" />
    </>
  );
}
