"use client";
import { useEffect, useState } from "react";

type Store = { counts: Record<string, number>; total?: number };

// ViewsBadge
//
//   <ViewsBadge slugs={["round-0"]} mode="per-slug" />
//     · shows a single slug's count
//   <ViewsBadge mode="total" />
//     · shows the server-maintained site-wide total across every tracked page.
//       accurate and doesn't double-count (the server sums once).
//   <ViewsBadge slugs={[...]} mode="aggregate" />
//     · client-side sum of the listed slugs; retained for existing call sites.
//
// All variants poll /api/views every 15s with cache: "no-store".

type Mode = "per-slug" | "aggregate" | "total";

export default function ViewsBadge({
  slugs,
  label,
  mode = "aggregate",
}: {
  slugs?: string[];
  label?: string;
  mode?: Mode;
}) {
  const [store, setStore] = useState<Store | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetch("/api/views", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((s) => {
          if (!cancelled && s) setStore(s);
        })
        .catch(() => {});
    load();
    const t = setInterval(load, 15000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  let n: number | null;
  if (!store) {
    n = null;
  } else if (mode === "total") {
    n = typeof store.total === "number" ? store.total : null;
  } else if (mode === "per-slug") {
    const s = slugs && slugs[0];
    n = s ? store.counts[s] || 0 : 0;
  } else {
    n = (slugs || []).reduce((a, s) => a + (store.counts[s] || 0), 0);
  }

  const suffix =
    label ??
    (mode === "total"
      ? "views · site-wide"
      : mode === "aggregate"
      ? "cumulative (double-counts)"
      : "read to here");

  return (
    <span className="inline-flex items-baseline gap-2">
      <span className="font-mono text-[13px] text-ink tabular-nums">
        {n === null ? "—" : n.toLocaleString()}
      </span>
      <span className="text-[10px] tracking-[0.22em] uppercase text-graphite">{suffix}</span>
    </span>
  );
}
