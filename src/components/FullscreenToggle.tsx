"use client";
import { useEffect, useState } from "react";

// Small corner button that toggles the browser's Fullscreen API on the deck,
// so saapai can hide the Chrome tabs/URL bar and present as pure canvas.

export default function FullscreenToggle() {
  const [isFull, setIsFull] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFull(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggle = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="pitch-fullscreen-btn"
      aria-label={isFull ? "exit fullscreen" : "enter fullscreen"}
      title={isFull ? "exit fullscreen" : "enter fullscreen"}
    >
      {isFull ? (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M6 2v4H2M10 2v4h4M6 14v-4H2M10 14v-4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      <span className="pitch-fullscreen-label">{isFull ? "EXIT" : "FULL"}</span>
    </button>
  );
}
