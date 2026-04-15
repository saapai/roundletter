"use client";
import { useEffect } from "react";

const SLOTS = 40;
const TICK_MS = 5000;
const MIN_TICKS = 3;

function pathKey(p: string): string {
  if (!p || p === "/") return "root";
  return p.replace(/^\/+|\/+$/g, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "root";
}

export default function AttentionTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("aureliex-no-heat") === "1") return;

    const path = pathKey(window.location.pathname);
    const ticks = new Array<number>(SLOTS).fill(0);

    const sample = () => {
      if (document.hidden) return;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total <= 0) return;
      const pct = Math.max(0, Math.min(1, window.scrollY / total));
      const slot = Math.min(SLOTS - 1, Math.floor(pct * SLOTS));
      ticks[slot]++;
    };

    const id = window.setInterval(sample, TICK_MS);
    sample();

    let sent = false;
    const send = () => {
      if (sent) return;
      const reached: number[] = [];
      for (let i = 0; i < SLOTS; i++) if (ticks[i] >= MIN_TICKS) reached.push(i);
      if (reached.length === 0) return;
      sent = true;
      const payload = JSON.stringify({ path, slots: reached });
      try {
        if (navigator.sendBeacon) {
          navigator.sendBeacon("/api/heat", new Blob([payload], { type: "application/json" }));
        } else {
          fetch("/api/heat", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: payload,
            keepalive: true,
          }).catch(() => {});
        }
      } catch {}
    };

    const onVis = () => { if (document.hidden) send(); };
    window.addEventListener("pagehide", send);
    window.addEventListener("beforeunload", send);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      clearInterval(id);
      window.removeEventListener("pagehide", send);
      window.removeEventListener("beforeunload", send);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return null;
}
