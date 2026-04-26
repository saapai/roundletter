"use client";

import { useEffect, useRef, useState } from "react";

// CountUp — masthead total animation. 600ms easeOutExpo, runs on mount.
// Honors prefers-reduced-motion (renders final value immediately).
// Mono-spec'd by the parent; this component only owns the digit churn.

type Props = {
  to: number;
  durationMs?: number;
  decimals?: number;
  prefix?: string;
  className?: string;
};

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function format(n: number, decimals: number): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export default function CountUp({
  to,
  durationMs = 600,
  decimals = 0,
  prefix = "",
  className,
}: Props) {
  const [value, setValue] = useState<number>(to);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setValue(to);
      return;
    }
    setValue(0);
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      setValue(easeOutExpo(t) * to);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setValue(to);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, durationMs]);

  return (
    <span className={className} aria-label={`${prefix}${format(to, decimals)}`}>
      {prefix}
      {format(value, decimals)}
    </span>
  );
}
