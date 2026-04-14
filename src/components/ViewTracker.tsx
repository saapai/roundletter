"use client";
import { useEffect, useRef } from "react";

export default function ViewTracker({ slug }: { slug: string }) {
  const fired = useRef(false);

  useEffect(() => {
    const key = `rl:viewed:${slug}`;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(key)) { fired.current = true; return; }

    const sentinel = document.getElementById(`view-sentinel-${slug}`);
    if (!sentinel) return;

    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting && !fired.current) {
          fired.current = true;
          sessionStorage.setItem(key, "1");
          fetch("/api/views", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ slug, referrer: document.referrer || null }),
            keepalive: true,
          }).catch(() => {});
          io.disconnect();
        }
      }
    }, { threshold: 0.5 });

    io.observe(sentinel);
    return () => io.disconnect();
  }, [slug]);

  return <div id={`view-sentinel-${slug}`} aria-hidden className="h-px w-full" />;
}
