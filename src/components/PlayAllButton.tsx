"use client";

import { useCallback, useState } from "react";

/**
 * "▶ play the whole thing" — master-cut toggle.
 *
 * When on: body gets `.home-master`. The home's section grid compresses to
 * one-chapter-at-a-time, auto-advances by scrolling to the next chapter after
 * a dwell. When off (default, or after skip/compartmentalize): chapters
 * render as a scrollable grid.
 *
 * Smaller-scope than a full fullscreen player so it ships cleanly for the
 * launch. The CSS does most of the work.
 */

export default function PlayAllButton() {
  const [on, setOn] = useState(false);

  const enter = useCallback(() => {
    setOn(true);
    document.body.classList.add("home-master");
    const first = document.getElementById("chapter-01");
    if (first) first.scrollIntoView({ behavior: "smooth", block: "start" });
    autoAdvance();
  }, []);

  const compartmentalize = useCallback(() => {
    setOn(false);
    document.body.classList.remove("home-master");
  }, []);

  // Auto-advance loop: every ~8s scroll to the next chapter. Stops when user
  // manually scrolls (we detect via scroll listener).
  function autoAdvance() {
    const ids = Array.from(document.querySelectorAll("[id^=chapter-]")).map(
      (el) => (el as HTMLElement).id
    );
    let i = 0;
    let userScrolled = false;
    const onScroll = () => { userScrolled = true; };
    window.addEventListener("wheel", onScroll, { passive: true, once: true });
    window.addEventListener("touchmove", onScroll, { passive: true, once: true });

    const tick = () => {
      if (userScrolled || !document.body.classList.contains("home-master")) return;
      i = Math.min(i + 1, ids.length - 1);
      const el = document.getElementById(ids[i]);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      if (i < ids.length - 1) window.setTimeout(tick, 8000);
    };
    window.setTimeout(tick, 8000);
  }

  if (on) {
    return (
      <button type="button" className="play-all play-all-on" onClick={compartmentalize}>
        <span className="play-all-glyph" aria-hidden="true">▮▮</span>
        <span>compartmentalize · exit master cut</span>
      </button>
    );
  }
  return (
    <button type="button" className="play-all" onClick={enter}>
      <span className="play-all-glyph" aria-hidden="true">▶</span>
      <span>play the whole thing</span>
      <span className="play-all-sub">one video · all the songs</span>
    </button>
  );
}
