"use client";
import { useEffect, useState } from "react";

const SLOTS = 40;

function pathKey(p: string): string {
  if (!p || p === "/") return "root";
  return p.replace(/^\/+|\/+$/g, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "root";
}

export default function Heatmap() {
  const [open, setOpen] = useState(false);
  const [slots, setSlots] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && /INPUT|TEXTAREA/i.test(t.tagName)) return;
      if (e.key === "h" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const key = pathKey(window.location.pathname);
    fetch(`/api/heat?path=${encodeURIComponent(key)}`, { cache: "no-store" })
      .then(r => r.json())
      .then(j => setSlots(Array.isArray(j?.slots) ? j.slots : []))
      .catch(() => setSlots([]))
      .finally(() => setLoading(false));
  }, [open]);

  if (!open) return null;

  const max = Math.max(1, ...slots);
  const total = slots.reduce((a, b) => a + b, 0);

  return (
    <div className="heatmap-rail" aria-label="Attention heatmap">
      <div className="heatmap-title">attention · most read</div>
      <div className="heatmap-bar">
        {Array.from({ length: SLOTS }, (_, i) => {
          const count = slots[i] ?? 0;
          const intensity = count / max;
          return (
            <button
              key={i}
              className="heatmap-slot"
              style={{
                background: intensity > 0
                  ? `color-mix(in srgb, var(--rust) ${Math.max(6, Math.min(92, Math.round(intensity * 92)))}%, transparent)`
                  : "transparent",
              }}
              title={`slot ${i + 1}/${SLOTS} · ${count} reader${count === 1 ? "" : "s"}`}
              onClick={() => {
                const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
                const y = ((i + 0.5) / SLOTS) * scrollTotal;
                window.scrollTo({ top: y, behavior: "smooth" });
              }}
            />
          );
        })}
      </div>
      <div className="heatmap-legend">
        {loading ? "loading…" : total === 0 ? "no data yet" : `${total} attention points`}
      </div>
      <button className="heatmap-close" aria-label="Close heatmap" onClick={() => setOpen(false)}>
        close
      </button>
    </div>
  );
}
