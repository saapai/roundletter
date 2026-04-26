import type { PositionLive } from "@/lib/portfolio-aggregate";

// PnlCards — readable P&L stack below the constellation on /stocks.
// Vertical list: ticker + name (left), current value (right),
// two pills (TODAY · SINCE-ENTRY) per card. Plus a sticky TOTAL bar.
// Uses .pl-card / .pl-pill / .pl-total (already in globals.css).

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
};

function fmt$(n: number, decimals = 0): string {
  const abs = Math.abs(n);
  return `$${abs.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

function fmt$Signed(n: number, decimals = 2): string {
  const s = fmt$(n, decimals);
  if (n > 0.005) return `+${s}`;
  if (n < -0.005) return `−${s}`;
  return s;
}

function fmtPct(n: number): string {
  if (Math.abs(n) < 0.005) return "0.00%";
  const s = `${Math.abs(n).toFixed(2)}%`;
  return n > 0 ? `+${s}` : `−${s}`;
}

function pillTone(n: number): string {
  if (n > 0.005) return "pl-pill--pos";
  if (n < -0.005) return "pl-pill--neg";
  return "pl-pill--flat";
}

export default function PnlCards({ positions, totals }: Props) {
  if (positions.length === 0) return null;

  return (
    <>
      <ul className="pl-cards" aria-label="holdings p&l">
        {positions.map((p) => {
          const todayTone = pillTone(p.delta_today_pct);
          const entryTone = pillTone(p.delta_entry_pct);
          return (
            <li className="pl-card" key={p.ticker}>
              <div className="pl-head">
                <div className="pl-id">
                  <span className="pl-ticker">{p.ticker}</span>
                  {p.name && <span className="pl-name">{p.name}</span>}
                </div>
                <div className="pl-value">
                  <span className="pl-value-num">{fmt$(p.current_value, 2)}</span>
                  <span className="pl-value-sub">
                    {p.shares.toLocaleString("en-US", { maximumFractionDigits: 3 })} sh
                  </span>
                </div>
              </div>
              <div className="pl-pills">
                <div className={`pl-pill ${todayTone}`}>
                  <span className="pl-pill-label">today</span>
                  <span className="pl-pill-pct">{fmtPct(p.delta_today_pct)}</span>
                  <span className="pl-pill-dollar">{fmt$Signed(p.delta_today_dollars)}</span>
                </div>
                <div className={`pl-pill ${entryTone}`}>
                  <span className="pl-pill-label">since entry</span>
                  <span className="pl-pill-pct">{fmtPct(p.delta_entry_pct)}</span>
                  <span className="pl-pill-dollar">{fmt$Signed(p.delta_entry_dollars)}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="pl-total" role="status" aria-label="portfolio total">
        <div className="pl-total-row">
          <span className="pl-total-label">total</span>
          <span className="pl-total-value">{fmt$(totals.total_current, 2)}</span>
        </div>
        <div className="pl-total-row pl-total-deltas">
          <span>
            today {fmtPct(totals.total_delta_today_pct)} ·{" "}
            {fmt$Signed(totals.total_delta_today_dollars)}
          </span>
          <span className="pl-total-sep">|</span>
          <span>
            entry {fmtPct(totals.total_delta_entry_pct)} ·{" "}
            {fmt$Signed(totals.total_delta_entry_dollars)}
          </span>
        </div>
      </div>
    </>
  );
}
