"use client";

import { useEffect, useState, useCallback } from "react";

type Section = { id: string; label: string };

/**
 * LetterChrome — cinematic reading aids for long-form letter pages.
 * Renders:
 *  1. A thin reading-progress bar at the top of the viewport
 *  2. A floating dot-nav on the right rail (desktop only) tied to h2 sections
 *  3. A back-to-top button that appears after scrolling past the hero
 */
export default function LetterChrome() {
  const [sections, setSections] = useState<Section[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [showBtt, setShowBtt] = useState(false);
  const [showNav, setShowNav] = useState(false);

  /* Discover all h2s inside the article on mount */
  useEffect(() => {
    const article = document.querySelector(".letter-hero + .article");
    if (!article) return;
    const h2s = article.querySelectorAll("h2[id]");
    const found: Section[] = [];
    h2s.forEach((el) => {
      found.push({ id: el.id, label: el.textContent ?? "" });
    });
    setSections(found);
  }, []);

  /* Scroll handler: progress bar + active section + btt visibility */
  const onScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? Math.min(1, scrollTop / docHeight) : 0;
    setProgress(pct * 100);

    // Show back-to-top after scrolling past the hero
    const heroH = document.querySelector(".letter-hero")?.getBoundingClientRect().height ?? 500;
    setShowBtt(scrollTop > heroH);
    setShowNav(scrollTop > heroH * 0.8);

    // Determine active section
    const article = document.querySelector(".letter-hero + .article");
    if (!article) return;
    const h2s = article.querySelectorAll("h2[id]");
    let current: string | null = null;
    const offset = window.innerHeight * 0.35;
    h2s.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < offset) current = el.id;
    });
    setActiveId(current);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* Reading progress */}
      <div className="letter-progress" aria-hidden="true">
        <div
          className="letter-progress-bar"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Section dot-nav (desktop) */}
      {sections.length > 0 && (
        <nav
          className={`letter-section-nav ${showNav ? "visible" : ""}`}
          aria-label="Jump to section"
        >
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={activeId === s.id ? "active" : ""}
              title={s.label}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              {s.label}
            </a>
          ))}
        </nav>
      )}

      {/* Back-to-top */}
      <button
        className={`letter-btt ${showBtt ? "visible" : ""}`}
        onClick={scrollToTop}
        aria-label="Back to top"
        title="Back to top"
      >
        ↑
      </button>
    </>
  );
}
