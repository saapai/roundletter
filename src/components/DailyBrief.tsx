"use client";

import { useEffect, useState } from "react";

// Daily agent brief card. Pulls /api/agents/daily-brief and renders the
// five agents + consensus line. Falls back to the endpoint's stub if the
// Anthropic API isn't configured — copy reflects that honestly.

type Agent = {
  agent: "bull" | "bear" | "macro" | "flow" | "historian";
  mandate: string;
  line: string;
};
type Brief = {
  source: "claude" | "stub";
  generated_at: string;
  bell: "open" | "close" | "adhoc";
  model: string;
  consensus: string;
  agents: Agent[];
};

const AGENT_COLOR: Record<Agent["agent"], string> = {
  bull: "var(--anno-bull, #5F8B4E)",
  bear: "var(--anno-bear, #8B3A2E)",
  macro: "var(--anno-macro, #A67A3A)",
  flow: "var(--anno-flow, #5E7098)",
  historian: "var(--anno-historian, #6B6560)",
};

function timeAgo(iso: string): string {
  const d = Date.parse(iso);
  if (Number.isNaN(d)) return "";
  const secs = Math.max(0, (Date.now() - d) / 1000);
  if (secs < 60) return "just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

export default function DailyBrief() {
  const [brief, setBrief] = useState<Brief | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/agents/daily-brief", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (alive && j) setBrief(j as Brief);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (!brief) return null;

  return (
    <section className="brief" aria-label="today's agent brief">
      <div className="brief-head">
        <span className="brief-eye">// today&rsquo;s brief · {brief.bell}</span>
        <span className="brief-ts">
          {brief.source === "claude" ? "generated" : "stub"} · {timeAgo(brief.generated_at)}
        </span>
      </div>
      {brief.consensus && (
        <p className="brief-consensus">
          <em>{brief.consensus}</em>
        </p>
      )}
      <ul className="brief-list">
        {brief.agents.map((a) => (
          <li key={a.agent} className="brief-row">
            <span
              className="brief-name"
              style={{ color: AGENT_COLOR[a.agent] }}
            >
              {a.agent}
            </span>
            <span className="brief-mandate">{a.mandate}</span>
            <p className="brief-line">{a.line}</p>
          </li>
        ))}
      </ul>
      <p className="brief-foot">
        <em>
          panel runs at market open (9:30 ET) + market close (4:00 ET) every
          trading day. ad-hoc pulls return the last cached read.
        </em>
      </p>
    </section>
  );
}
