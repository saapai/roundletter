"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Sitewide view counter. Mounted once in the root layout. On every pathname
// change it derives a slug and fires one POST to /api/views, with a session-
// scoped dedup key so reloads/navigations back and forth don't inflate the
// count within a single browsing session.
//
// Slug rules: "/" → "home"; nested paths are flattened to dashes (e.g.
// "/letters/round-0" → "letters-round-0") so the abacus key path stays flat.
// Bare surfaces ("/17", "/keys") are skipped entirely — they're ephemeral
// funnels, not content.

const SKIP_PREFIXES = ["/17", "/keys", "/api"];

export default function SiteViewTracker() {
  const pathname = usePathname();
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    if (SKIP_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))) return;

    const slug = pathname === "/"
      ? "home"
      : pathname.replace(/^\//, "").replace(/\/+/g, "-");
    if (!slug) return;

    const key = `rl:viewed:${slug}`;
    if (lastSent.current === slug) return;
    try {
      if (sessionStorage.getItem(key)) {
        lastSent.current = slug;
        return;
      }
      sessionStorage.setItem(key, "1");
    } catch {
      /* storage blocked — still fire the POST, just no dedup */
    }
    lastSent.current = slug;

    fetch("/api/views", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug, referrer: document.referrer || null }),
      keepalive: true,
    }).catch(() => {
      /* best-effort — tracker never blocks UX */
    });
  }, [pathname]);

  return null;
}
