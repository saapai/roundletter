"use client";
import { useEffect, useState, useRef } from "react";

type Phase = "black" | "glow" | "pulse" | "expand" | "reveal" | "done";

export default function BootSequence({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>("black");
  const [skip, setSkip] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only show boot once per session
    try {
      if (sessionStorage.getItem("aureliex-booted") === "1") {
        setSkip(true);
        setPhase("done");
        return;
      }
    } catch {}

    const timers: ReturnType<typeof setTimeout>[] = [];
    const t = (fn: () => void, ms: number) => {
      timers.push(setTimeout(fn, ms));
    };

    // Phase timeline
    t(() => setPhase("glow"), 400);       // logo fades in
    t(() => setPhase("pulse"), 1800);     // logo pulses once
    t(() => setPhase("expand"), 2800);    // logo expands, screen whites out
    t(() => setPhase("reveal"), 3600);    // content begins to appear
    t(() => {
      setPhase("done");
      try { sessionStorage.setItem("aureliex-booted", "1"); } catch {}
    }, 4400);

    return () => timers.forEach(clearTimeout);
  }, []);

  // Click to skip
  const handleSkip = () => {
    setPhase("done");
    try { sessionStorage.setItem("aureliex-booted", "1"); } catch {}
  };

  if (skip || phase === "done") {
    return <div className="boot-content boot-content-visible">{children}</div>;
  }

  return (
    <>
      <div
        className={`boot-overlay boot-${phase}`}
        onClick={handleSkip}
        role="presentation"
      >
        {/* The logo */}
        <div className="boot-logo-wrap">
          <svg
            className="boot-logo"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Stylized "a" mark — a circle with a subtle break */}
            <circle
              cx="60"
              cy="60"
              r="40"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="220 32"
              strokeLinecap="round"
            />
            <circle
              cx="60"
              cy="60"
              r="12"
              fill="currentColor"
              opacity="0.9"
            />
          </svg>
          <span className="boot-wordmark">aureliex</span>
        </div>

        {/* Progress bar */}
        <div className="boot-progress">
          <div className="boot-progress-fill" />
        </div>
      </div>

      <div className={`boot-content ${phase === "reveal" ? "boot-content-entering" : ""}`}>
        {children}
      </div>
    </>
  );
}
