"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Sitewide view counter. Mounted once in the root layout. POSTs to
// /api/views on every pathname change. Client dedup has been REMOVED
// (server does IP+hour-bucket dedup now) so every real page load gets
// a fresh chance to count. same session repeatedly hitting one page
// inside one hour still only counts once thanks to the server's
// per-IP-per-hour dedup key.
//
// Slug rules: "/" → "home"; nested paths flatten to dashes.
// Bare surfaces (/17, /keys, /api) are skipped.

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
    // only dedup on the IDENTICAL slug sent IN THIS MOUNT — i.e., avoid
    // firing twice for an effect-rerun. real cross-session dedup happens
    // on the server.
    if (lastSent.current === slug) return;
    lastSent.current = slug;

    fetch("/api/views", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug, referrer: document.referrer || null }),
      keepalive: true,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { ok?: boolean; count?: number } | null) => {
        // broadcast the returned count so ViewsBadge can optimistically
        // update without waiting for its next poll tick.
        if (j && j.ok && typeof j.count === "number") {
          try {
            window.dispatchEvent(
              new CustomEvent("rl:view-hit", {
                detail: { slug, count: j.count },
              }),
            );
          } catch {}
        }
      })
      .catch(() => {});
  }, [pathname]);

  return null;
}
