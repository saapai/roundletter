"use client";

import { useEffect, useMemo, useState } from "react";
import { isMarketOpen, MARKET_OPEN_POLL_MS, MARKET_SHUT_POLL_MS } from "@/lib/market-hours";

type Holding = { ticker: string; shares: number; entry_value: number };

type PricesResponse = {
  data: Record<string, { timestamps: number[]; closes: number[] } | null>;
  hasData: boolean;
};

type Props = { holdings: Holding[]; pendingCash: number; baseline: number };

type Building = {
  ticker: string;
  value: number;
  entry: number;       // cost basis
  delta: number;
  pct: number;         // unit gain/loss since entry
  span: number;        // grid-column-span (building width variation)
  tall: number;        // 0-1 scaled height relative to max (roofline)
  floors: number;      // how many floors tall this building is
  brightness: "warm" | "hot" | "dim";
  isCash?: boolean;
};

/* --- deterministic PRNG --- */
function hash(s: string, i: number): number {
  let h = 2166136261 ^ i;
  for (let k = 0; k < s.length; k++) {
    h = (h ^ s.charCodeAt(k)) >>> 0;
    h = Math.imul(h, 16777619) >>> 0;
  }
  return (h >>> 0) / 2 ** 32;
}

function fmtMoney(n: number): string {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function fmtAmt(n: number): string {
  const v = Math.abs(n);
  return v >= 1000 ? `${(v / 1000).toFixed(2)}k` : v.toFixed(0);
}
function fmtUpdated(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/* total floors from top to bottom.  gives the tower a consistent
   scale; individual buildings occupy a sub-range of these floors. */
const TOTAL_FLOORS = 52;

/* per-column width variation — deterministic per ticker so the
   skyline is irregular but stable across renders. */
function buildingSpan(ticker: string): number {
  const h = hash(ticker, 7);
  // span of 2, 3, 4 columns (in a grid of many columns) → width variation
  if (h < 0.25) return 4;
  if (h < 0.62) return 3;
  return 2;
}

/* each floor of a building has a window type: tall, square, small,
   lobby, balcony, or rooftop. determined deterministically from
   (ticker, floorIndex) so a building has visual identity. */
type Cell =
  | { kind: "window"; state: "lit" | "hot" | "dim" | "off" | "down"; tall: boolean }
  | { kind: "balcony" }
  | { kind: "lobby" }
  | { kind: "rooftop" }
  | { kind: "sky" };

function cellAt(b: Building, floor: number): Cell {
  // floors > building height = sky
  if (floor > b.floors) return { kind: "sky" };

  // rooftop = the last floor
  if (floor === b.floors) return { kind: "rooftop" };

  // ground floor = lobby with bigger windows
  if (floor === 0) return { kind: "lobby" };

  // every 7th floor gets a balcony strip
  if (floor > 2 && floor % 7 === 0) return { kind: "balcony" };

  const r = hash(b.ticker, floor * 31 + 11);
  // choose window state using building's brightness profile
  const brightnessBias =
    b.brightness === "hot" ? 0.08 :
    b.brightness === "dim" ? -0.18 :
    0;

  // base = amber lit window
  let state: "lit" | "hot" | "dim" | "off" | "down";
  if (r < 0.06 - brightnessBias) state = "off";       // a few dark rooms
  else if (r < 0.18 - brightnessBias) state = "dim";   // dim curtains
  else if (b.pct > 0.06 && r < 0.28) state = "hot";    // strong gainers shine
  else if (b.pct < -0.04 && r < 0.35) state = "down";  // losers show rust
  else state = "lit";

  // tall-window alternates every few floors
  const tall = hash(b.ticker, floor) < 0.28;
  return { kind: "window", state, tall };
}

export default function LedgerColumn({ holdings, pendingCash, baseline }: Props) {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [updated, setUpdated] = useState<Date | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let alive = true;
    let timer: number | null = null;
    const pull = async () => {
      try {
        const r = await fetch("/api/prices", { cache: "no-store" });
        if (!r.ok) return;
        const j = (await r.json()) as PricesResponse;
        if (!alive || !j?.hasData) return;
        const next: Record<string, number> = {};
        for (const h of holdings) {
          const s = j.data[h.ticker];
          if (s && s.closes.length > 0) next[h.ticker] = s.closes[s.closes.length - 1];
        }
        if (Object.keys(next).length > 0) {
          setPrices(next);
          setUpdated(new Date());
          setLive(true);
        }
      } catch {
        /* silent */
      }
    };
    const schedule = () => {
      if (!alive) return;
      const delay = isMarketOpen() ? MARKET_OPEN_POLL_MS : MARKET_SHUT_POLL_MS;
      timer = window.setTimeout(async () => {
        await pull();
        schedule();
      }, delay);
    };
    pull().then(schedule);
    return () => {
      alive = false;
      if (timer != null) window.clearTimeout(timer);
    };
  }, [holdings]);

  const buildings: Building[] = useMemo(() => {
    const rows = holdings.map((h) => {
      const px = prices[h.ticker] ?? null;
      const value = px != null ? h.shares * px : h.entry_value;
      const delta = value - h.entry_value;
      const pct = h.entry_value > 0 ? delta / h.entry_value : 0;
      return { ticker: h.ticker, value, delta, pct, entry: h.entry_value };
    });
    const maxV = Math.max(1, ...rows.map((r) => r.value));
    const all: Building[] = rows.map((r) => {
      const tall = r.value / maxV;
      const floors = Math.max(18, Math.round(tall * TOTAL_FLOORS));
      // brightness bias: large positions = hot, small = dim, middle = warm
      const brightness: Building["brightness"] =
        tall > 0.8 ? "hot" : tall < 0.35 ? "dim" : "warm";
      return {
        ticker: r.ticker,
        value: r.value,
        entry: r.entry,
        delta: r.delta,
        pct: r.pct,
        span: buildingSpan(r.ticker),
        tall,
        floors,
        brightness,
      };
    });
    if (pendingCash > 0) {
      all.push({
        ticker: "CASH",
        value: pendingCash,
        entry: pendingCash,
        delta: 0,
        pct: 0,
        span: 2,
        tall: Math.max(0.12, Math.min(0.35, pendingCash / maxV)),
        floors: Math.max(10, Math.round((pendingCash / maxV) * TOTAL_FLOORS)),
        brightness: "dim",
        isCash: true,
      });
    }
    return all;
  }, [holdings, prices, pendingCash]);

  const totalValue = buildings.reduce((acc, b) => acc + b.value, 0);
  const totalDelta = totalValue - baseline;
  const totalUp = totalDelta >= 0;

  // total grid columns = sum of spans
  const totalCols = buildings.reduce((acc, b) => acc + b.span, 0);

  // depth-1 interaction: which building is focused
  const [focusedTicker, setFocusedTicker] = useState<string | null>(null);
  const focused = buildings.find((b) => b.ticker === focusedTicker) ?? null;
  useEffect(() => {
    if (!focusedTicker) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFocusedTicker(null);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [focusedTicker]);

  function glowClass(b: Building): string {
    if (b.isCash) return "glow-flat";
    if (b.pct > 0.05) return "glow-hot";
    if (b.pct > 0.005) return "glow-up";
    if (b.pct < -0.005) return "glow-down";
    return "glow-flat";
  }

  function antennaText(b: Building): string {
    return `$${Math.round(b.value).toLocaleString("en-US")}`;
  }

  function antennaDir(b: Building): "up" | "down" | "flat" {
    if (b.isCash) return "flat";
    if (b.delta > 0.5) return "up";
    if (b.delta < -0.5) return "down";
    return "flat";
  }

  return (
    <div
      className={`h2-city-wrap${focusedTicker ? " is-zoomed" : ""}`}
      aria-label="the book as a city of micro-worlds"
    >
      <div className="h2-city-eye">
        <span>
          <span className={`h2-city-pulse${live ? "" : " is-off"}`} aria-hidden="true" />
          the ledger · {buildings.length} buildings ·{" "}
          {buildings.reduce((a, b) => a + b.floors, 0)} floors · tap to zoom
        </span>
        <span>{live ? "lit" : "dark"}</span>
      </div>

      <div
        className="h2-tower"
        style={{ gridTemplateColumns: `repeat(${totalCols}, minmax(0, 1fr))` }}
        role="img"
        aria-label="the city · each building is a position"
      >
        {buildings.map((b) => {
          const floors = [];
          for (let f = TOTAL_FLOORS - 1; f >= 0; f--) {
            const c = cellAt(b, f);
            floors.push(<BuildingRow key={f} cell={c} />);
          }
          const isFocused = focusedTicker === b.ticker;
          const glow = glowClass(b);
          const aDir = antennaDir(b);
          return (
            <button
              key={b.ticker}
              type="button"
              className={`h2-building b-${b.brightness} ${glow}${b.isCash ? " is-cash" : ""}`}
              style={{ gridColumn: `span ${b.span}`, border: "none", padding: 0 }}
              aria-expanded={isFocused}
              aria-label={`${b.ticker} · ${fmtMoney(b.value)} · tap to open`}
              onClick={() => setFocusedTicker(b.ticker)}
            >
              {/* antenna · dollar strip above rooftop */}
              <span
                className={`h2-building-antenna ${aDir}`}
                style={{ top: -12 }}
                aria-hidden="true"
              >
                {antennaText(b)}
              </span>
              {floors}
              <div className="h2-building-label" aria-hidden="true">
                <span className="h2-building-t">{b.ticker}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* floor lines — subtle horizontal strokes spanning the city */}
      <div className="h2-floorlines" aria-hidden="true">
        <span /><span /><span /><span /><span /><span />
      </div>

      <div className="h2-city-foot">
        <span className="h2-city-foot-k">total · live</span>
        <span className="h2-city-foot-v">{fmtMoney(totalValue)}</span>
        <span className={`h2-city-foot-d ${totalUp ? "up" : "down"}`}>
          {totalUp ? "+" : "−"}${fmtAmt(totalDelta)} since 12 apr
        </span>
        <span className="h2-city-updated">
          {live ? `lit ${fmtUpdated(updated)}` : "waiting on prices…"}
        </span>
      </div>

      {focused ? (
        <FocusView
          building={focused}
          onClose={() => setFocusedTicker(null)}
          live={live}
        />
      ) : null}
    </div>
  );
}

/* depth-1 zoom · click a building → a focus-card shows that
   building larger, with position stats.  scroll-recursion into
   deeper levels (floor / trade / interior) ships in v2. */
function FocusView({
  building,
  onClose,
  live,
}: {
  building: Building;
  onClose: () => void;
  live: boolean;
}) {
  const floors = [];
  for (let f = TOTAL_FLOORS - 1; f >= 0; f--) {
    const c = cellAt(building, f);
    floors.push(<BuildingRow key={f} cell={c} />);
  }
  const dir = building.delta > 0.5 ? "up" : building.delta < -0.5 ? "down" : "";
  const pctLabel = (building.pct * 100).toFixed(2);
  return (
    <div
      className="h2-focus"
      role="dialog"
      aria-modal="true"
      aria-label={`${building.ticker} detail`}
      onClick={onClose}
    >
      <div
        className="h2-focus-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="h2-focus-close"
          onClick={onClose}
          aria-label="close detail view"
        >
          ×
        </button>

        <div className={`h2-focus-tower b-${building.brightness}`}>{floors}</div>

        <div className="h2-focus-meta">
          <div>
            <div className="h2-focus-tkr">{building.ticker}</div>
            <div className="h2-focus-name">
              {building.isCash ? "cash · SPAXX + pending" : `${building.floors} floors · ${building.brightness}`}
            </div>
          </div>

          <div className="h2-focus-stats">
            <div>
              <span className="h2-focus-stat-k">value</span>
              <span className="h2-focus-stat-v">{fmtMoney(building.value)}</span>
            </div>
            <div>
              <span className="h2-focus-stat-k">cost basis</span>
              <span className="h2-focus-stat-v">{fmtMoney(building.entry)}</span>
            </div>
            <div>
              <span className="h2-focus-stat-k">delta $</span>
              <span className={`h2-focus-stat-v ${dir}`}>
                {building.delta > 0 ? "+" : building.delta < 0 ? "−" : "·"}
                ${fmtAmt(building.delta)}
              </span>
            </div>
            <div>
              <span className="h2-focus-stat-k">delta %</span>
              <span className={`h2-focus-stat-v ${dir}`}>
                {building.pct > 0 ? "+" : ""}
                {pctLabel}%
              </span>
            </div>
          </div>

          <div className="h2-focus-foot">
            {live ? "live · lit now" : "waiting on prices"}
            {" · press esc or tap outside"}
          </div>
        </div>
      </div>
    </div>
  );
}

function BuildingRow({ cell }: { cell: Cell }) {
  if (cell.kind === "sky") return <span className="h2-row h2-row-sky" />;
  if (cell.kind === "rooftop") return <span className="h2-row h2-row-roof" />;
  if (cell.kind === "balcony") return <span className="h2-row h2-row-balcony" />;
  if (cell.kind === "lobby") return <span className="h2-row h2-row-lobby" />;
  // window
  return (
    <span
      className={`h2-row h2-row-win win-${cell.state}${cell.tall ? " is-tall" : ""}`}
    />
  );
}
