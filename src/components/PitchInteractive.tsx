"use client";
import { useEffect } from "react";

// Attaches mousemove listeners on slides that opt into cursor-driven effects.
// Writes --mx / --my (px, relative to element) on matching slides so CSS
// can mask / pixelate / brighten based on cursor position.
//
// Also injects the single <svg> <filter id="pitch-pixelate"> at the document
// root so backdrop-filter: url(#pitch-pixelate) works from anywhere in the deck.

export default function PitchInteractive() {
  useEffect(() => {
    const slides = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".pitch-ink-reveal, .pitch-stars-reveal",
      ),
    );

    const handlers = slides.map((el) => {
      const onMove = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
        if (!el.classList.contains("is-hovering")) {
          el.classList.add("is-hovering");
        }
      };
      const onLeave = () => {
        el.classList.remove("is-hovering");
      };
      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
      return { el, onMove, onLeave };
    });

    return () => {
      handlers.forEach(({ el, onMove, onLeave }) => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
      });
    };
  }, []);

  return (
    <svg
      aria-hidden="true"
      style={{
        position: "absolute",
        width: 0,
        height: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <defs>
        {/* 8-pixel mosaic tile — flood a 1x1 into an 8x8 composite, tile it,
            composite back against the source = chunky pixelation. */}
        <filter id="pitch-pixelate" x="0" y="0" width="1" height="1">
          <feFlood x="2" y="2" width="1" height="1" />
          <feComposite width="4" height="4" />
          <feTile result="a" />
          <feComposite in="SourceGraphic" in2="a" operator="in" />
          <feMorphology operator="dilate" radius="2" />
        </filter>
      </defs>
    </svg>
  );
}
