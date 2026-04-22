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

const NAV: Array<{ href: string; label: string; emph?: boolean }> = [
  { href: "/",                     label: "home" },
  { href: "/let-down",             label: "let down", emph: true },
  { href: "/positions",            label: "positions" },
  { href: "/argument",             label: "argument · live" },
  { href: "/green-credit",         label: "green credit" },
  { href: "/market",               label: "market" },
  { href: "/trades",               label: "trades" },
  { href: "/canvas",               label: "canvas" },
  { href: "/archives",             label: "archives" },
  { href: "/arc",                  label: "arc" },
  { href: "/letters/round-0",      label: "letters · round 0" },
  { href: "/6969#hunt",            label: "the hunt · ledger" },
];

const BARE_PATHS = ["/17", "/keys"];

export default function FloatingNav() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // hide entirely on bare paths
    const path = window.location.pathname;
    if (BARE_PATHS.some((p) => path === p || path.startsWith(p + "/"))) {
      setHidden(true);
      return;
    }

    // appear once the reader scrolls past the masthead
    const THRESHOLD = 220;
    const onScroll = () => {
      setVisible(window.scrollY > THRESHOLD);
      if (window.scrollY <= THRESHOLD && open) setOpen(false);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
    // open is intentionally excluded so scrolling can auto-close without
    // re-binding the listener on every state change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      className={`fn-root ${visible ? "is-visible" : ""} ${open ? "is-open" : ""}`}
      role="navigation"
      aria-label="floating site menu"
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
