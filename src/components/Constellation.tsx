"use client";

import { useState } from "react";
import StarField from "./StarField";
import SunGlyph from "./SunGlyph";
import type { PositionLive } from "@/lib/portfolio-aggregate";

// Constellation — wraps StarField + SunGlyph + glyph card.
// Pure client; receives live data from the server page.

type Totals = {
  total_current: number;
  total_delta_today_pct: number;
  total_delta_today_dollars: number;
  total_delta_entry_pct: number;
  total_delta_entry_dollars: number;
};

type Props = {
  positions: PositionLive[];
  totals: Totals;
  showSunBar?: boolean;
  showGlyphCard?: boolean;
};

function fmt$(n: number, opts: { decimals?: number; sign?: boolean } = {}) {
  const decimals = opts.decimals ?? 0;
  const abs = Math.abs(n);
  const s = `$${abs.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
  if (!opts.sign) return s;
  if (n > 0.005) return `+${s}`;
  if (n < -0.005) return `−${s}`;
  return s;
}

function fmtPct(n: number, sign = true): string {
  if (Math.abs(n) < 0.005) return "—";
  const s = `${Math.abs(n).toFixed(2)}%`;
  if (!sign) return s;
  return n > 0 ? `+${s}` : `−${s}`;
}

export default function Constellation({
  positions,
  totals,
  showSunBar = true,
  showGlyphCard = true,
}: Props) {
  const [sel, setSel] = useState<PositionLive | null>(null);
  // Sun rotation: 6° per total update — derive from total_current cents.
  const rotation = ((Math.round(totals.total_current * 100) % 60) * 6) % 360;
  const todayUp = totals.total_delta_today_pct >= 0;

  return (
    <div className="constellation">
      <StarField
        holdings={positions}
        onSelect={setSel}
        selected={sel?.ticker ?? null}
      />

      {showGlyphCard && sel && (
        <div
          className="glyph-card"
          role="dialog"
          aria-label={`${sel.ticker} detail`}
        >
          <button
            type="button"
            className="glyph-card-close"
            aria-label="close"
            onClick={() => setSel(null)}
          >
            ×
          </button>
          <div className="glyph-card-head">
            <span className="glyph-ticker">{sel.ticker}</span>
            {sel.name && <span className="glyph-name">{sel.name}</span>}
          </div>
          <div className="glyph-card-grid">
            <div className="glyph-cell">
              <span className="glyph-label">shares</span>
              <span className="glyph-num">
                {sel.shares.toLocaleString("en-US", {
                  maximumFractionDigits: 3,
                })}
              </span>
            </div>
            <div className="glyph-cell">
              <span className="glyph-label">price</span>
              <span className="glyph-num">
                {sel.current_price != null
                  ? fmt$(sel.current_price, { decimals: 2 })
                  : "—"}
              </span>
            </div>
            <div className="glyph-cell">
              <span className="glyph-label">today</span>
              <span className="glyph-num">
                {sel.delta_today_pct >= 0 ? "▲" : "▼"}{" "}
                {fmtPct(sel.delta_today_pct, false)}
              </span>
              <span className="glyph-sub">
                {fmt$(sel.delta_today_dollars, { decimals: 2, sign: true })}
              </span>
            </div>
            <div className="glyph-cell">
              <span className="glyph-label">since entry</span>
              <span className="glyph-num">
                {sel.delta_entry_pct >= 0 ? "▲" : "▼"}{" "}
                {fmtPct(sel.delta_entry_pct, false)}
              </span>
              <span className="glyph-sub">
                {fmt$(sel.delta_entry_dollars, { decimals: 2, sign: true })}
              </span>
            </div>
          </div>
        </div>
      )}

      {showSunBar && (
        <div
          className={`sun-bar ${todayUp ? "sun-bar--up" : "sun-bar--down"}`}
          role="status"
          aria-label="portfolio total"
        >
          <SunGlyph rotation={rotation} className="sun-bar-glyph" />
          <span className="sun-bar-total">
            {fmt$(totals.total_current, { decimals: 2 })}
          </span>
          <span className="sun-bar-pill">
            {todayUp ? "▲" : "▼"} {fmtPct(totals.total_delta_today_pct, false)}
          </span>
        </div>
      )}
    </div>
  );
}
