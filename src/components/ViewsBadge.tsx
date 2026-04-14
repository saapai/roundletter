"use client";
import { useEffect, useState } from "react";

type Store = { counts: Record<string, number> };

export default function ViewsBadge({
  slugs,
  label,
  mode = "aggregate",
}: {
  slugs: string[];
  label?: string;
  mode?: "aggregate" | "per-slug";
}) {
  const [store, setStore] = useState<Store | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetch("/api/views", { cache: "no-store" })
        .then(r => (r.ok ? r.json() : null))
        .then(s => { if (!cancelled && s) setStore(s); })
        .catch(() => {});
    load();
    const t = setInterval(load, 15000);
    return () => { cancelled = true; clearInterval(t); };
  }, []);

  const n = store ? slugs.reduce((a, s) => a + (store.counts[s] || 0), 0) : null;
  const suffix = label ?? (mode === "aggregate" ? "cumulative (double-counts)" : "read to here");

  return (
    <span className="inline-flex items-baseline gap-2">
      <span className="font-mono text-[13px] text-ink tabular-nums">{n === null ? "—" : n}</span>
      <span className="text-[10px] tracking-[0.22em] uppercase text-graphite">{suffix}</span>
    </span>
  );
}
