"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * The insignia is a single fixed mark, bottom-right, on every non-bare page.
 *
 * On the arc home, it's scroll-aware: it tints warm ember at the Ghost Town
 * altar, drains to dust at the descent, and cools to bluehour in Let Down.
 * Off the arc (sub-pages), it falls back to the original rust color via the
 * base `.insignia-mark` CSS.
 */
export default function Insignia() {
  const [phase, setPhase] = useState<"ghost" | "descent" | "letdown" | null>(
    null
  );

  useEffect(() => {
    const arcRoot = document.querySelector(".arc-root");
    if (!arcRoot) {
      setPhase(null);
      return;
    }
    setPhase("ghost");

    function tick() {
      const doc = document.documentElement;
      const scrolled = window.scrollY + window.innerHeight * 0.6;
      const total = doc.scrollHeight - window.innerHeight;
      const pct = total > 0 ? scrolled / (total + window.innerHeight * 0.6) : 0;
      if (pct < 0.33) setPhase("ghost");
      else if (pct < 0.7) setPhase("descent");
      else setPhase("letdown");
    }

    tick();
    window.addEventListener("scroll", tick, { passive: true });
    window.addEventListener("resize", tick);
    return () => {
      window.removeEventListener("scroll", tick);
      window.removeEventListener("resize", tick);
    };
  }, []);

  const phaseClass = phase ? `insignia-arc-${phase}` : "";

  return (
    <Link
      href="/pitch"
      className={`insignia ${phaseClass}`.trim()}
      aria-label="a door, for a friend"
    >
      <span className="insignia-mark" aria-hidden="true">
        ●
      </span>
    </Link>
  );
}
