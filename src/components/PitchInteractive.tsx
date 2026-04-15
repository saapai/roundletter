"use client";
import { useEffect } from "react";

// Attaches mousemove listeners on slides that opt into cursor-driven effects.
// Writes --mx / --my (px, relative to element) on matching slides via rAF
// batching so the browser only repaints once per frame (not per mousemove).

export default function PitchInteractive() {
  useEffect(() => {
    const slides = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".pitch-ink-reveal, .pitch-stars-reveal",
      ),
    );

    const state = new WeakMap<HTMLElement, { x: number; y: number; raf: number | null }>();

    const handlers = slides.map((el) => {
      state.set(el, { x: 0, y: 0, raf: null });

      const flush = () => {
        const s = state.get(el);
        if (!s) return;
        s.raf = null;
        el.style.setProperty("--mx", `${s.x}px`);
        el.style.setProperty("--my", `${s.y}px`);
      };

      const onMove = (e: MouseEvent) => {
        const s = state.get(el);
        if (!s) return;
        const r = el.getBoundingClientRect();
        s.x = e.clientX - r.left;
        s.y = e.clientY - r.top;
        if (!el.classList.contains("is-hovering")) el.classList.add("is-hovering");
        if (s.raf == null) s.raf = requestAnimationFrame(flush);
      };
      const onLeave = () => {
        el.classList.remove("is-hovering");
      };

      el.addEventListener("mousemove", onMove, { passive: true });
      el.addEventListener("mouseleave", onLeave);
      return { el, onMove, onLeave };
    });

    return () => {
      handlers.forEach(({ el, onMove, onLeave }) => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
        const s = state.get(el);
        if (s?.raf != null) cancelAnimationFrame(s.raf);
      });
    };
  }, []);

  return null;
}
