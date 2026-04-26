import type { KalshiEventPosition, KalshiMarketPosition } from "@/lib/snapshots";

// EventCard — one Kalshi event, header + price chips for non-zero exposures.
// Server component. Stagger-fade-in via CSS animation-delay set inline.

// Humanize event/market tickers per design spec. Tickers look like
// "KXNBA-26" (event) or "KXNBA-26-BOS" (market — last segment is the team).
// Unmapped events fall back to a stripped form so we never show raw KX*.
const EVENT_TITLES: Record<string, string> = {
  "KXNBA-26": "NBA Championship 2026",
  "KXNBAEAST-26": "NBA East 2026",
  "KXTRILLIONAIRE-30": "Trillionaire by 2030",
  "KXUCL-26": "UCL 2026",
};

export function humanizeKalshiTicker(ticker: string): string {
  if (!ticker) return ticker;
  if (EVENT_TITLES[ticker]) return EVENT_TITLES[ticker];
  // Market ticker: KXNBA-26-BOS → "BOS"; only return suffix if it looks team-ish.
  const parts = ticker.split("-");
  if (parts.length >= 3) {
    const tail = parts[parts.length - 1];
    if (/^[A-Z]{2,4}$/.test(tail)) return tail;
  }
  // Strip leading "KX" + trailing "-NN" year for unmapped events.
  const cleaned = ticker.replace(/^KX/, "").replace(/-(\d{2,4})$/, " $1");
  return cleaned;
}

function fmtMoney(n: number, decimals = 2): string {
  return `$${n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

function chipPriceCents(m: KalshiMarketPosition): string {
  // position_fp ≈ shares (whole units). exposure / shares = avg cost in $/share.
  // Render as "Nc" (cents). Fall back gracefully when shares are zero.
  const exposure = parseFloat(m.market_exposure_dollars);
  const shares = parseFloat(m.position_fp);
  if (!Number.isFinite(shares) || shares <= 0) return "—";
  const cents = Math.round((exposure / shares) * 100);
  if (!Number.isFinite(cents)) return "—";
  return `${cents}c`;
}

type Props = {
  event: KalshiEventPosition;
  positions: KalshiMarketPosition[];
  index: number;
};

export default function EventCard({ event, positions, index }: Props) {
  const exposure = parseFloat(event.event_exposure_dollars);
  const realized = parseFloat(event.realized_pnl_dollars);
  // Filter to this event's open exposures only.
  const open = positions.filter(
    (p) =>
      p.ticker.startsWith(event.event_ticker + "-") &&
      parseFloat(p.market_exposure_dollars) > 0,
  );
  const delaySec = (index * 80) / 1000;
  return (
    <article
      className="ticker-event"
      style={{ animationDelay: `${delaySec.toFixed(3)}s` }}
    >
      <header className="ticker-event-head">
        <h3 className="ticker-event-title">{humanizeKalshiTicker(event.event_ticker)}</h3>
        <span className="ticker-event-exposure">{fmtMoney(exposure)}</span>
      </header>
      {open.length > 0 ? (
        <div className="ticker-chips">
          {open.map((p) => (
            <span key={p.ticker} className="ticker-chip">
              <span className="ticker-chip-team">{humanizeKalshiTicker(p.ticker)}</span>{" "}
              <span className="ticker-chip-price">{chipPriceCents(p)}</span>
            </span>
          ))}
        </div>
      ) : (
        <div className="ticker-chips ticker-chips--empty">
          <span className={realized < 0 ? "ticker-chip-strike" : "ticker-chip-flat"}>
            closed · realized {fmtMoney(realized)}
          </span>
        </div>
      )}
    </article>
  );
}
