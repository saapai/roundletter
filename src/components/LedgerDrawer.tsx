"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { SeriesPoint } from "@/lib/portfolio-aggregate";

// LedgerDrawer — the slide-up history sheet for /prediction.
//   trigger:   `the ledger ↗` chip in the masthead
//   contents:  realized P&L tombstone + dual-venue overlay chart +
//              closed-lines log (kalshi today; polymarket when present)
//
// The chart is rendered inline (small, two-line SVG with a dashed
// secondary line) so the drawer doesn't pull in the full
// PortfolioGrowthChart component (which carries 1D/2D/All filters that
// don't apply at this notional). Past tense, summary register.

type ClosedLine = {
  ticker: string;
  realized: number;
  traded: number;
  fees: number;
};

type Props = {
  realized: number;
  closedKalshi: ClosedLine[];
  closedPolymarket: ClosedLine[];
  kalshiSeries: SeriesPoint[];
  polymarketSeries: SeriesPoint[];
};

function fmtMoney2(n: number): string {
  const sign = n < 0 ? "−" : n > 0 ? "+" : "";
  return `${sign}$${Math.abs(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
function fmtMoney0(n: number): string {
  return `$${Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export default function LedgerDrawer({
  realized,
  closedKalshi,
  closedPolymarket,
  kalshiSeries,
  polymarketSeries,
}: Props) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      d.classList.add("is-entering");
      requestAnimationFrame(() => d.classList.remove("is-entering"));
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]);

  useEffect(() => {
    const onCancel = (e: Event) => {
      e.preventDefault();
      setOpen(false);
    };
    const d = dialogRef.current;
    if (!d) return;
    d.addEventListener("cancel", onCancel);
    return () => d.removeEventListener("cancel", onCancel);
  }, []);

  return (
    <>
      <button
        type="button"
        className="ledger-trigger"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        the ledger <span aria-hidden="true">↗</span>
      </button>

      <dialog
        ref={dialogRef}
        className="ledger-sheet"
        aria-labelledby={titleId}
        onClick={(e) => {
          // backdrop click closes
          if (e.target === e.currentTarget) setOpen(false);
        }}
      >
        <div className="ledger-sheet-inner" onClick={(e) => e.stopPropagation()}>
          <header className="ledger-head">
            <span className="ledger-eyebrow">the ledger · history</span>
            <button
              type="button"
              className="ledger-close"
              onClick={() => setOpen(false)}
              aria-label="close ledger"
            >
              ×
            </button>
          </header>

          <section className="ledger-realized" aria-label="realized pnl">
            <div className="ledger-realized-eyebrow">realized</div>
            <div className={`ledger-realized-num ${realized < 0 ? "is-down" : realized > 0 ? "is-up" : ""}`}>
              {fmtMoney2(realized)}
            </div>
            <div className="ledger-realized-sub">
              across {closedKalshi.length + closedPolymarket.length} closed lines
            </div>
          </section>

          <section className="ledger-chart-wrap" aria-label="book history (overlay)">
            <h3 id={titleId} className="ledger-section-h">book history</h3>
            <span className="ledger-legend">
              <span className="ledger-legend-item ledger-legend-item--kalshi">
                <span className="ledger-legend-mark ledger-legend-mark--solid" /> kalshi
              </span>
              <span className="ledger-legend-item ledger-legend-item--poly">
                <span className="ledger-legend-mark ledger-legend-mark--ring" /> polymarket
              </span>
            </span>
            <OverlayChart kalshi={kalshiSeries} polymarket={polymarketSeries} />
          </section>

          <section className="ledger-closed" aria-label="closed kalshi lines">
            <h3 className="ledger-section-h">
              <span className="ledger-dot ledger-dot--solid" aria-hidden /> closed kalshi lines
            </h3>
            {closedKalshi.length === 0 ? (
              <p className="ledger-empty">no closed kalshi lines yet.</p>
            ) : (
              <ul className="ledger-list">
                {closedKalshi.map((c) => (
                  <li key={c.ticker} className="ledger-row">
                    <span className="ledger-row-ticker">{c.ticker}</span>
                    <span className={`ledger-row-pnl ${c.realized < 0 ? "is-down" : c.realized > 0 ? "is-up" : ""}`}>
                      {fmtMoney2(c.realized)}
                    </span>
                    <span className="ledger-row-meta">
                      {fmtMoney0(c.traded)} traded · {fmtMoney2(c.fees)} fees
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="ledger-closed" aria-label="closed polymarket lines">
            <h3 className="ledger-section-h">
              <span className="ledger-dot ledger-dot--ring" aria-hidden /> closed polymarket lines
            </h3>
            {closedPolymarket.length === 0 ? (
              <p className="ledger-empty">awaiting first polymarket snapshot.</p>
            ) : (
              <ul className="ledger-list">
                {closedPolymarket.map((c, i) => (
                  <li key={`${c.ticker}-${i}`} className="ledger-row">
                    <span className="ledger-row-ticker">{c.ticker}</span>
                    <span className={`ledger-row-pnl ${c.realized < 0 ? "is-down" : c.realized > 0 ? "is-up" : ""}`}>
                      {fmtMoney2(c.realized)}
                    </span>
                    <span className="ledger-row-meta">
                      {fmtMoney0(c.traded)} traded
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </dialog>
    </>
  );
}

function OverlayChart({
  kalshi,
  polymarket,
}: {
  kalshi: SeriesPoint[];
  polymarket: SeriesPoint[];
}) {
  const W = 800;
  const H = 200;
  const padX = 8;
  const padY = 14;
  // Combined value range so the two lines share a y-axis.
  const allValues = [...kalshi, ...polymarket].map((p) => p.value);
  if (allValues.length < 2) {
    return <div className="ledger-empty">not enough data yet to draw a curve.</div>;
  }
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const range = max - min || 1;

  function pathFor(points: SeriesPoint[]) {
    if (points.length < 2) return "";
    const step = (W - padX * 2) / Math.max(1, points.length - 1);
    return points
      .map((p, i) => {
        const x = padX + i * step;
        const y = padY + (H - padY * 2) * (1 - (p.value - min) / range);
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
  }

  return (
    <svg
      className="ledger-svg"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {polymarket.length >= 2 && (
        <path
          d={pathFor(polymarket)}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.55"
          strokeWidth="1.4"
          strokeDasharray="4 3"
        />
      )}
      {kalshi.length >= 2 && (
        <path
          d={pathFor(kalshi)}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      )}
    </svg>
  );
}
