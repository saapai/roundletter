"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Shareholder } from "@/lib/portfolio-aggregate";

type Props = {
  shareholder: Shareholder;
  portfolioValue: number;
};

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtPct(n: number) {
  return n.toFixed(2);
}

function fmtDate(iso: string) {
  const d = new Date(iso + "T12:00:00Z");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function ShareholderClient({ shareholder: initial, portfolioValue: initialPV }: Props) {
  const [sh, setSh] = useState(initial);
  const [pv, setPv] = useState(initialPV);
  const [updatedAt, setUpdatedAt] = useState<number>(Date.now());

  useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const r = await fetch("/api/shareholders", { cache: "no-store" });
        if (!r.ok || !alive) return;
        const j = await r.json();
        const found = j.shareholders?.find((s: Shareholder) => s.slug === initial.slug);
        if (found && alive) {
          setSh(found);
          setPv(j.portfolio_value);
          setUpdatedAt(j.generated_at ?? Date.now());
        }
      } catch { /* noop */ }
    };
    const id = setInterval(poll, 30 * 60 * 1000); // 30 min
    return () => { alive = false; clearInterval(id); };
  }, [initial.slug]);

  const gainColor = sh.total_gain >= 0 ? "#7dba6a" : "#c45a5a";

  return (
    <div className="sh">
      <style>{CSS}</style>

      <nav className="sh-nav">
        <Link href="/" className="sh-back">aureliex</Link>
      </nav>

      <main className="sh-main">
        <span className="sh-label">shareholder</span>
        <h1 className="sh-name">{sh.name}</h1>

        <div className="sh-hero-row">
          <div className="sh-stat">
            <span className="sh-stat-label">current value</span>
            <span className="sh-stat-value" style={{ color: "var(--gold-num)" }}>
              ${fmt(sh.total_current_value)}
            </span>
          </div>
          <div className="sh-stat">
            <span className="sh-stat-label">total invested</span>
            <span className="sh-stat-value">${fmt(sh.total_invested)}</span>
          </div>
          <div className="sh-stat">
            <span className="sh-stat-label">return</span>
            <span className="sh-stat-value" style={{ color: gainColor }}>
              {sh.total_gain >= 0 ? "+" : ""}{fmtPct(sh.total_return_pct)}%
            </span>
          </div>
          <div className="sh-stat">
            <span className="sh-stat-label">ownership</span>
            <span className="sh-stat-value">{fmtPct(sh.total_ownership_pct)}%</span>
          </div>
        </div>

        <div className="sh-portfolio-ctx">
          <span className="sh-ctx-label">of portfolio</span>
          <span className="sh-ctx-value">${fmt(pv)}</span>
        </div>

        <section className="sh-entries">
          <h2 className="sh-section-title">Entry points</h2>
          {sh.entries.map((e, i) => (
            <div key={e.id + i} className="sh-entry">
              <div className="sh-entry-header">
                <span className="sh-entry-date">{fmtDate(e.date)}</span>
                <span className="sh-entry-type">{e.type === "equity_gift" ? "equity gift" : "cash deposit"}</span>
              </div>
              <div className="sh-entry-row">
                <div className="sh-entry-stat">
                  <span className="sh-entry-label">amount</span>
                  <span className="sh-entry-value">${fmt(e.amount)}</span>
                </div>
                <div className="sh-entry-stat">
                  <span className="sh-entry-label">portfolio at entry</span>
                  <span className="sh-entry-value">${fmt(e.portfolio_value_at_entry)}</span>
                </div>
                <div className="sh-entry-stat">
                  <span className="sh-entry-label">ownership acquired</span>
                  <span className="sh-entry-value">{fmtPct(e.ownership_pct)}%</span>
                </div>
                <div className="sh-entry-stat">
                  <span className="sh-entry-label">current value</span>
                  <span className="sh-entry-value" style={{ color: "var(--gold-num)" }}>${fmt(e.current_value)}</span>
                </div>
              </div>
            </div>
          ))}
        </section>

        <div className="sh-gain-summary">
          <span className="sh-gain-label">total gain</span>
          <span className="sh-gain-value" style={{ color: gainColor }}>
            {sh.total_gain >= 0 ? "+" : ""}${fmt(sh.total_gain)}
          </span>
        </div>

        <footer className="sh-footer">
          <span className="sh-updated">
            updates every 30 min · last {new Date(updatedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
          </span>
          <span className="sh-guarantee">personally guaranteed by saapai · cashout june 20</span>
        </footer>
      </main>
    </div>
  );
}

const CSS = `
.sh {
  --paper: #F5EAD6;
  --ink: #3D2B0F;
  --amber: #C8A96E;
  --gold-num: #D4A94C;
  --dark: #0a0908;
  min-height: 100vh;
  background: #0a0908;
  color: rgba(229,221,210,0.85);
  -webkit-font-smoothing: antialiased;
}

.sh-nav {
  padding: 1.5rem 2rem;
}
.sh-back {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-style: italic; font-size: 0.9rem; color: rgba(229,221,210,0.3);
  text-decoration: none; letter-spacing: 0.08em;
  transition: color 200ms ease;
}
.sh-back:hover { color: rgba(229,221,210,0.7); }

.sh-main {
  max-width: 40rem; margin: 0 auto;
  padding: 2rem 2rem 4rem;
}

.sh-label {
  font-family: 'JetBrains Mono',monospace; font-size: 0.55rem;
  letter-spacing: 0.35em; text-transform: uppercase;
  color: rgba(229,221,210,0.25); display: block; margin-bottom: 12px;
}

.sh-name {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-size: clamp(2.2rem,6vw,3.2rem); font-weight: 400; font-style: italic;
  color: rgba(229,221,210,0.9); margin: 0 0 2rem; line-height: 1.15;
  letter-spacing: -0.01em;
}

.sh-hero-row {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem;
  padding: 1.5rem 0; border-top: 1px solid rgba(200,169,74,0.12);
  border-bottom: 1px solid rgba(200,169,74,0.12);
}

.sh-stat { display: flex; flex-direction: column; gap: 4px; }
.sh-stat-label {
  font-family: 'JetBrains Mono',monospace; font-size: 0.5rem;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: rgba(229,221,210,0.3);
}
.sh-stat-value {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-size: 1.4rem; font-weight: 500; color: rgba(229,221,210,0.8);
}

.sh-portfolio-ctx {
  display: flex; align-items: baseline; gap: 8px;
  padding: 1rem 0 0; margin-bottom: 2.5rem;
}
.sh-ctx-label {
  font-family: 'JetBrains Mono',monospace; font-size: 0.5rem;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: rgba(229,221,210,0.2);
}
.sh-ctx-value {
  font-family: 'JetBrains Mono',monospace; font-size: 0.7rem;
  color: rgba(229,221,210,0.35);
}

.sh-section-title {
  font-family: 'JetBrains Mono',monospace; font-size: 0.55rem;
  letter-spacing: 0.3em; text-transform: uppercase;
  color: rgba(229,221,210,0.25); margin: 0 0 1.25rem;
}

.sh-entries { display: flex; flex-direction: column; gap: 1.25rem; }

.sh-entry {
  background: rgba(229,221,210,0.03);
  border: 1px solid rgba(200,169,74,0.08);
  border-radius: 3px; padding: 1.25rem;
}
.sh-entry-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 1rem;
}
.sh-entry-date {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-style: italic; font-size: 1rem; color: rgba(229,221,210,0.6);
}
.sh-entry-type {
  font-family: 'JetBrains Mono',monospace; font-size: 0.48rem;
  letter-spacing: 0.15em; text-transform: uppercase;
  color: rgba(229,221,210,0.2); padding: 3px 8px;
  border: 1px solid rgba(229,221,210,0.08); border-radius: 2px;
}
.sh-entry-row {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;
}
.sh-entry-label {
  font-family: 'JetBrains Mono',monospace; font-size: 0.45rem;
  letter-spacing: 0.1em; text-transform: uppercase;
  color: rgba(229,221,210,0.25); display: block; margin-bottom: 3px;
}
.sh-entry-value {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-size: 1rem; font-weight: 500; color: rgba(229,221,210,0.7);
}

.sh-gain-summary {
  display: flex; align-items: baseline; gap: 12px;
  margin-top: 2rem; padding-top: 1.5rem;
  border-top: 1px solid rgba(200,169,74,0.12);
}
.sh-gain-label {
  font-family: 'JetBrains Mono',monospace; font-size: 0.55rem;
  letter-spacing: 0.2em; text-transform: uppercase;
  color: rgba(229,221,210,0.25);
}
.sh-gain-value {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-size: 1.8rem; font-weight: 500;
}

.sh-footer {
  margin-top: 3rem; display: flex; flex-direction: column; gap: 6px;
  text-align: center;
}
.sh-updated {
  font-family: 'JetBrains Mono',monospace; font-size: 0.48rem;
  letter-spacing: 0.1em; color: rgba(229,221,210,0.15);
}
.sh-guarantee {
  font-family: var(--font-display,'Cormorant Garamond'),Georgia,serif;
  font-style: italic; font-size: 0.85rem; color: rgba(229,221,210,0.2);
}

@media (max-width: 640px) {
  .sh-main { padding: 1.5rem 1.25rem 3rem; }
  .sh-hero-row { grid-template-columns: repeat(2, 1fr); gap: 1rem; }
  .sh-entry-row { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
  .sh-stat-value { font-size: 1.2rem; }
  .sh-name { font-size: 2rem; }
}
`;
