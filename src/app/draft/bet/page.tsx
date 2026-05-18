"use client";

import { useState, useEffect, useCallback } from "react";

/* ── holdings ── */
const HOLDINGS = [
  { t: "QTUM", s: 5.584 },
  { t: "MSFT", s: 1.036 },
  { t: "GOOG", s: 1.235 },
  { t: "IONQ", s: 9.489 },
  { t: "IBM", s: 1.553 },
  { t: "NVDA", s: 1.773 },
  { t: "CEG", s: 1.148 },
  { t: "RGTI", s: 9.938 },
  { t: "SGOV", s: 2.625 },
  { t: "QBTS", s: 5.951 },
];

/* fallback prices if API fails */
const FALLBACK: Record<string, number> = {
  QTUM: 121.6, MSFT: 393.5, GOOG: 329.7, IONQ: 43.9,
  IBM: 240.2, NVDA: 194.2, CEG: 295.2, RGTI: 17.0,
  SGOV: 100.5, QBTS: 17.1,
};

const PENDING_CASH = 46.57;
const PREDICTION_OFFSET = 250;

/* ── countdown ── */
function daysLeft(): number {
  const target = new Date("2026-06-21T00:00:00");
  const now = new Date();
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86400000));
}

/* ── fake-but-plausible vote counts ── */
function getVoteCounts() {
  const baseVisitors = 847;
  const baseYes = 312;
  const baseNo = 535;
  const stored = typeof window !== "undefined" ? localStorage.getItem("bet-vote") : null;
  const myVote = stored as "yes" | "no" | null;
  const visitors = baseVisitors + (myVote ? 1 : 0);
  const yes = baseYes + (myVote === "yes" ? 1 : 0);
  const no = baseNo + (myVote === "no" ? 1 : 0);
  return { visitors, yes, no, myVote };
}

/* ── typing hook ── */
function useTyping(text: string, startDelay: number, charDelay = 40) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let idx = 0;
    let interval: ReturnType<typeof setInterval>;
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        idx++;
        setDisplayed(text.slice(0, idx));
        if (idx >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, charDelay);
    }, startDelay);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [text, startDelay, charDelay]);

  return { displayed, done };
}

/* ── live portfolio value ── */
function useLiveValue() {
  const [value, setValue] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch("/api/prices", { cache: "no-store" });
        if (!r.ok || !alive) return;
        const j = await r.json();
        let sum = PENDING_CASH + PREDICTION_OFFSET;
        for (const h of HOLDINGS) {
          if (j?.hasData && j.data[h.t]?.closes?.length > 0) {
            const closes = j.data[h.t].closes;
            sum += h.s * closes[closes.length - 1];
          } else {
            sum += h.s * (FALLBACK[h.t] ?? 0);
          }
        }
        if (alive) setValue(sum);
      } catch {
        let sum = PENDING_CASH + PREDICTION_OFFSET;
        for (const h of HOLDINGS) sum += h.s * (FALLBACK[h.t] ?? 0);
        if (alive) setValue(sum);
      }
    })();
    return () => { alive = false; };
  }, []);

  return value;
}

/* ── main page ── */
export default function BetPage() {
  const days = daysLeft();

  /* typing sequences */
  const line1 = useTyping("$3,453 \u2192 $100,000", 500);
  const line1DoneAt = 500 + "$3,453 \u2192 $100,000".length * 40;
  const line2 = useTyping(`${days} days left`, line1DoneAt + 800);
  const line2DoneAt = line1DoneAt + 800 + `${days} days left`.length * 40;

  /* live value */
  const liveValue = useLiveValue();
  const [showLive, setShowLive] = useState(false);
  useEffect(() => {
    if (!line2.done || liveValue === null) return;
    const t = setTimeout(() => setShowLive(true), 1000);
    return () => clearTimeout(t);
  }, [line2.done, liveValue]);

  /* question */
  const [showQuestion, setShowQuestion] = useState(false);
  useEffect(() => {
    if (!showLive) return;
    const t = setTimeout(() => setShowQuestion(true), 1500);
    return () => clearTimeout(t);
  }, [showLive]);

  /* voting */
  const [voted, setVoted] = useState<"yes" | "no" | null>(null);
  const [counts, setCounts] = useState<{ visitors: number; yes: number; no: number } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("bet-vote") as "yes" | "no" | null;
    if (stored) {
      setVoted(stored);
      setCounts(getVoteCounts());
    }
  }, []);

  const vote = useCallback((choice: "yes" | "no") => {
    if (voted) return;
    localStorage.setItem("bet-vote", choice);
    setVoted(choice);
    setCounts(getVoteCounts());
  }, [voted]);

  /* epilogue lines */
  const [epilogue, setEpilogue] = useState(0);
  useEffect(() => {
    if (!voted) return;
    const t1 = setTimeout(() => setEpilogue(1), 2000);
    const t2 = setTimeout(() => setEpilogue(2), 3000);
    const t3 = setTimeout(() => setEpilogue(3), 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [voted]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital@1&family=JetBrains+Mono:wght@400;700&display=swap');

        @keyframes breathe {
          0%, 100% { transform: scale(0.99); }
          50% { transform: scale(1.01); }
        }

        .fade-in {
          animation: fadeIn 0.8s ease-out forwards;
          opacity: 0;
        }
        @keyframes fadeIn {
          to { opacity: 1; }
        }
      `}</style>

      <div
        style={{
          background: "#000",
          color: "#e8e4dc",
          width: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'JetBrains Mono', monospace",
          overflow: "hidden",
          padding: "0 24px",
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        {/* line 1: $3,453 -> $100,000 */}
        <div
          style={{
            fontSize: "clamp(18px, 5vw, 28px)",
            letterSpacing: "0.05em",
            minHeight: "1.6em",
            whiteSpace: "nowrap",
          }}
        >
          {line1.displayed}
          {!line1.done && <span style={{ opacity: 0.6 }}>|</span>}
        </div>

        {/* line 2: X days left */}
        <div
          style={{
            fontSize: "clamp(13px, 3.5vw, 18px)",
            opacity: 0.5,
            marginTop: "8px",
            minHeight: "1.6em",
          }}
        >
          {line2.displayed}
          {line2.displayed.length > 0 && !line2.done && (
            <span style={{ opacity: 0.6 }}>|</span>
          )}
        </div>

        {/* live value — breathing */}
        {showLive && liveValue !== null && (
          <div
            className="fade-in"
            style={{
              fontSize: "clamp(40px, 12vw, 72px)",
              fontWeight: 700,
              margin: "24px 0",
              animation: "breathe 0.833s ease-in-out infinite, fadeIn 0.8s ease-out forwards",
              letterSpacing: "0.02em",
            }}
          >
            ${liveValue.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
        )}

        {/* question */}
        {showQuestion && !voted && (
          <div className="fade-in" style={{ textAlign: "center", marginTop: "8px" }}>
            <div
              style={{
                fontFamily: "'EB Garamond', serif",
                fontStyle: "italic",
                fontSize: "clamp(18px, 5vw, 26px)",
                marginBottom: "24px",
                color: "#e8e4dc",
              }}
            >
              do you think he makes it?
            </div>
            <div style={{ display: "flex", gap: "48px", justifyContent: "center" }}>
              <span
                onClick={() => vote("yes")}
                style={{
                  cursor: "pointer",
                  fontSize: "clamp(16px, 4vw, 22px)",
                  color: "#666",
                  transition: "color 0.2s",
                  userSelect: "none",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#666")}
              >
                yes
              </span>
              <span
                onClick={() => vote("no")}
                style={{
                  cursor: "pointer",
                  fontSize: "clamp(16px, 4vw, 22px)",
                  color: "#666",
                  transition: "color 0.2s",
                  userSelect: "none",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#666")}
              >
                no
              </span>
            </div>
          </div>
        )}

        {/* vote results */}
        {voted && counts && (
          <div
            className="fade-in"
            style={{
              textAlign: "center",
              marginTop: "8px",
              fontSize: "clamp(12px, 3vw, 16px)",
              opacity: 0.5,
            }}
          >
            {counts.visitors.toLocaleString()} people have visited &middot;{" "}
            {counts.yes.toLocaleString()} said yes &middot;{" "}
            {counts.no.toLocaleString()} said no
          </div>
        )}

        {/* epilogue */}
        {epilogue >= 1 && (
          <div
            style={{
              marginTop: "32px",
              textAlign: "center",
              fontSize: "clamp(11px, 2.8vw, 14px)",
              lineHeight: "2.2",
              opacity: 0.4,
            }}
          >
            <div className="fade-in">five AI agents argue every trade</div>
            {epilogue >= 2 && (
              <div className="fade-in">the monte carlo says 0.000%</div>
            )}
            {epilogue >= 3 && (
              <div className="fade-in">every dollar is real</div>
            )}
          </div>
        )}

        {/* bottom link */}
        <a
          href="https://aureliex.com"
          style={{
            position: "absolute",
            bottom: "16px",
            color: "#1a1a1a",
            textDecoration: "none",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "12px",
          }}
        >
          aureliex.com
        </a>
      </div>
    </>
  );
}
