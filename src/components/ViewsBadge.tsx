"use client";
import { useEffect, useState } from "react";

type Store = { counts: Record<string, number> };

export default function ViewsBadge({ slugs, label = "Real Readers", mode = "aggregate" }: {
  slugs: string[];
  label?: string;
  mode?: "aggregate" | "per-slug";
}) {
  const [store, setStore] = useState<Store | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () => fetch("/api/views", { cache: "no-store" })
      .then(r => r.ok ? r.json() : null)
      .then(s => { if (!cancelled && s) setStore(s); })
      .catch(() => {});
    load();
    const t = setInterval(load, 15000);
    return () => { cancelled = true; clearInterval(t); };
  }, []);

  if (mode === "per-slug") {
    const n = store ? (store.counts[slugs[0]] || 0) : null;
    return (
      <span className="text-[11px] font-mono text-graphite">
        {n === null ? "— readers" : `${n} read to the end`}
      </span>
    );
  }

  const total = store ? slugs.reduce((a, s) => a + (store.counts[s] || 0), 0) : null;
  return (
    <div className="trench p-4">
      <div className="text-[11px] uppercase tracking-widest text-graphite">{label}</div>
      <div className="font-mono text-2xl mt-1">{total === null ? "—" : total}</div>
      <div className="text-xs text-graphite mt-1">scrolled to the bottom (aggregate)</div>
    </div>
  );
}
