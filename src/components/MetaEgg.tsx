"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Meta easter egg: if music is playing AND the user scrolls to an extreme,
// then the opposite extreme, then back (TBT or BTB pattern), route them to
// a random rare page (P=1, O=2, K=8). Also records the "bounce" egg in the
// site-wide hunt ledger so it shows up at /6969#hunt. Fires once per session.

const RARE_NS = [1, 2, 8]; // P, O, K
const EDGE_THRESHOLD = 80; // px tolerance near top/bottom

export default function MetaEgg() {
  const router = useRouter();

  useEffect(() => {
    let fired = false;
    let history: ("top" | "bot")[] = [];

    const isMusicPlaying = () => {
      const audio = document.querySelector<HTMLAudioElement>("audio");
      return !!audio && !audio.paused && !audio.ended;
    };

    const onScroll = () => {
      if (fired) return;
      const y = window.scrollY;
      const maxY = (document.documentElement.scrollHeight || 0) - window.innerHeight;
      let edge: "top" | "bot" | null = null;
      if (y < EDGE_THRESHOLD) edge = "top";
      else if (y > maxY - EDGE_THRESHOLD) edge = "bot";
      if (!edge) return;
      if (history[history.length - 1] === edge) return; // same extreme, ignore
      history.push(edge);
      if (history.length > 3) history = history.slice(-3);
      if (history.length === 3) {
        const pattern = history.join("-");
        if (pattern === "top-bot-top" || pattern === "bot-top-bot") {
          if (!isMusicPlaying()) { history = []; return; }
          fired = true;
          try { window.__hunt?.fire("meta"); } catch { /* hunt not mounted */ }
          const n = RARE_NS[Math.floor(Math.random() * RARE_NS.length)];
          // flash-visible hint so the user knows they triggered something
          document.body.classList.add("meta-egg-fired");
          setTimeout(() => {
            router.push(`/v1/${n}`);
          }, 900);
        }
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [router]);

  return null;
}
