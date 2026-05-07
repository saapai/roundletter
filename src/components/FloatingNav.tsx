"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Floating top-right menu. Appears after the reader scrolls past the
// masthead so the site nav is always one tap away without a persistent
// sticky bar eating viewport.
//
// Tap the chip to toggle the menu; tap outside / press escape to close.
// Hidden on bare pages (/17, /keys) — those routes intentionally have
// no chrome.

// Mirrors BankNav's curated route list (src/components/BankNav.tsx).
// The unlinked / easter-egg routes are still reachable by URL via /eggs.
const NAV: Array<{ href: string; label: string; emph?: boolean }> = [
  { href: "/stocks",          label: "the portfolio" },
  { href: "/prediction",      label: "odds" },
  { href: "/art",             label: "art" },
  { href: "/argument",        label: "the panel" },
  { href: "/letters/round-0", label: "letters" },
  { href: "/invest",          label: "invest", emph: true },
];

const BARE_PATHS = ["/", "/17", "/keys"];

export default function FloatingNav() {
  const [open, setOpen] = useState(false);
  const [opacity, setOpacity] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // hide entirely on bare paths
    const path = window.location.pathname;
    if (BARE_PATHS.some((p) => path === p || path.startsWith(p + "/"))) {
      setHidden(true);
      return;
    }

    // scroll-direction-aware visibility.
    //   scrolling DOWN → fade to 0 (seamless reading, no chrome overhead)
    //   scrolling UP   → fade in, opacity proportional to scroll velocity
    //   idle           → decay back toward invisible unless panel is open
    // a modest floor kicks in once the reader is well past the masthead
    // so the chip is always tappable when the menu is actually open.
    const THRESHOLD = 220;
    let lastY = window.scrollY;
    let lastT = performance.now();
    let targetOpacity = 0;
    let rafScheduled = false;
    let current = 0;
    const ease = (from: number, to: number) => from + (to - from) * 0.18;

    const tick = () => {
      current = ease(current, targetOpacity);
      if (Math.abs(current - targetOpacity) < 0.01) current = targetOpacity;
      setOpacity(current);
      if (current !== targetOpacity) {
        window.requestAnimationFrame(tick);
      } else {
        rafScheduled = false;
      }
    };
    const schedule = () => {
      if (rafScheduled) return;
      rafScheduled = true;
      window.requestAnimationFrame(tick);
    };

    const onScroll = () => {
      const now = performance.now();
      const y = window.scrollY;
      const dy = y - lastY;
      const dt = Math.max(1, now - lastT);
      const velUpPxPerMs = -dy / dt;          // positive when scrolling UP
      lastY = y;
      lastT = now;

      if (y <= THRESHOLD) {
        targetOpacity = 0;
      } else if (dy < 0) {
        // scrolling up — opacity scales with velocity, clamped
        const v = Math.min(1, Math.max(0.35, velUpPxPerMs * 0.6));
        targetOpacity = v;
      } else if (dy > 0) {
        // scrolling down — fade out
        targetOpacity = open ? 1 : 0;
      }
      if (y <= THRESHOLD && open) setOpen(false);
      schedule();
    };

    // idle decay — after 2.5s of no-scroll, let the chip fade back toward 0
    // unless the menu is open. keeps the chip from sticking mid-page when
    // the reader stops at a section.
    let idleTimer: number | null = null;
    const resetIdle = () => {
      if (idleTimer != null) window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        if (!open) {
          targetOpacity = 0;
          schedule();
        }
      }, 2500);
    };

    const combined = () => {
      onScroll();
      resetIdle();
    };

    onScroll();
    window.addEventListener("scroll", combined, { passive: true });
    return () => {
      window.removeEventListener("scroll", combined);
      if (idleTimer != null) window.clearTimeout(idleTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // if the menu is open, force full opacity regardless of scroll state
  const effectiveOpacity = open ? 1 : opacity;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      if (t.closest(".fn-root")) return;
      setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick, true);
    };
  }, [open]);

  if (hidden) return null;

  return (
    <div
      className={`fn-root ${effectiveOpacity > 0 ? "is-visible" : ""} ${open ? "is-open" : ""}`}
      role="navigation"
      aria-label="floating site menu"
      style={{ opacity: effectiveOpacity, pointerEvents: effectiveOpacity > 0.1 ? "auto" : "none" }}
    >
      <button
        type="button"
        className="fn-chip"
        aria-expanded={open}
        aria-label={open ? "close menu" : "open menu"}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="fn-chip-lines" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="fn-chip-label">menu</span>
      </button>
      {open && (
        <nav className="fn-panel" aria-label="site navigation">
          <div className="fn-panel-head">
            <span className="fn-panel-title">aureliex<span className="fn-panel-dot">.</span></span>
            <span className="fn-panel-sub">round 0 · issue #001</span>
          </div>
          <ul className="fn-list">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`fn-link ${item.emph ? "fn-link-emph" : ""}`}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
