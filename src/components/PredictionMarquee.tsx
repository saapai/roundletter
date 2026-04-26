"use client";

import { useEffect, useState } from "react";

// PredictionMarquee — ESPN bottom-line. Infinite-scroll the most recent
// fills, paused on hover/focus. We duplicate the items list so the loop
// joins seamlessly. Reduced-motion users get a static, comma-joined line.

export type MarqueeItem = {
  team: string;        // e.g. "BOS"
  delta: string;       // e.g. "+3c" or "−2c"
  positive: boolean;   // for mint accent
  ago: string;         // "2m ago"
};

type Props = {
  items: MarqueeItem[];
};

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const fn = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return reduced;
}

function Item({ item }: { item: MarqueeItem }) {
  return (
    <span className="ticker-marquee-item" aria-label={`${item.team} ${item.delta} ${item.ago}`}>
      <span className="ticker-marquee-team">{item.team}</span>
      <span
        className={
          item.positive
            ? "ticker-marquee-delta ticker-marquee-delta--up"
            : "ticker-marquee-delta ticker-marquee-delta--flat"
        }
      >
        {item.delta}
      </span>
      <span className="ticker-marquee-sep">·</span>
      <span className="ticker-marquee-ago">{item.ago}</span>
      <span className="ticker-marquee-gap" aria-hidden>
        ◇
      </span>
    </span>
  );
}

export default function PredictionMarquee({ items }: Props) {
  const reduced = useReducedMotion();
  if (items.length === 0) return null;
  if (reduced) {
    return (
      <div className="ticker-marquee ticker-marquee--static" role="marquee" aria-live="off">
        <div className="ticker-marquee-static-track">
          {items.map((it, i) => (
            <Item key={`s-${i}`} item={it} />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div
      className="ticker-marquee"
      role="marquee"
      aria-live="off"
      tabIndex={0}
      aria-label="latest line moves"
    >
      <div className="ticker-marquee-track">
        {items.map((it, i) => (
          <Item key={`a-${i}`} item={it} />
        ))}
        {items.map((it, i) => (
          <Item key={`b-${i}`} item={it} />
        ))}
      </div>
    </div>
  );
}
