import fs from "node:fs";
import path from "node:path";

// Snapshot loader for vendored bot exports (Kalshi, future: Polymarket on-chain).
// Files live in src/data/snapshots/<source>/YYYY-MM-DD.json — each is a raw dump
// from the polytrader bot. We resolve the latest by filename (date-sorted) so
// the operator just drops a new file in to roll forward; nothing else changes.
//
// Node-only — uses fs at request time. The /api/portfolio route imports this
// behind `runtime = "nodejs"`, never the Edge.

export type KalshiEventPosition = {
  event_ticker: string;
  event_exposure_dollars: string;
  fees_paid_dollars: string;
  realized_pnl_dollars: string;
  total_cost_dollars: string;
  total_cost_shares_fp: string;
};

export type KalshiMarketPosition = {
  ticker: string;
  market_exposure_dollars: string;
  fees_paid_dollars: string;
  realized_pnl_dollars: string;
  position_fp: string;
  total_traded_dollars: string;
  resting_orders_count: number;
  last_updated_ts: string;
};

export type KalshiSnapshot = {
  date: string;            // YYYY-MM-DD (from filename)
  cash: number;            // dollars
  portfolio_value: number; // dollars (sum of open market exposures)
  total: number;           // cash + portfolio_value
  pulled_at: string | null;
  event_positions: KalshiEventPosition[];
  market_positions: KalshiMarketPosition[];
  fills_count: number;
};

type RawKalshiFile = {
  summary?: {
    cash_dollars?: number;
    portfolio_value_dollars?: number;
    as_of?: string;
  };
  fills?: unknown[];
  positions?: {
    event_positions?: KalshiEventPosition[];
    market_positions?: KalshiMarketPosition[];
  };
  pulled_at?: string;
};

const SNAPSHOT_ROOT = path.join(process.cwd(), "src", "data", "snapshots");

function listSnapshotFiles(source: string): string[] {
  const dir = path.join(SNAPSHOT_ROOT, source);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .sort(); // ISO date filenames sort lexicographically === chronologically
}

function num(s: string | undefined | null, fallback = 0): number {
  if (s == null) return fallback;
  const n = typeof s === "number" ? s : parseFloat(s);
  return Number.isFinite(n) ? n : fallback;
}

export function getLatestKalshiSnapshot(): KalshiSnapshot | null {
  const files = listSnapshotFiles("kalshi");
  if (files.length === 0) return null;
  const latest = files[files.length - 1];
  const date = latest.replace(/\.json$/, "");
  const full = path.join(SNAPSHOT_ROOT, "kalshi", latest);
  let raw: RawKalshiFile;
  try {
    raw = JSON.parse(fs.readFileSync(full, "utf8")) as RawKalshiFile;
  } catch {
    return null;
  }
  const event_positions = raw.positions?.event_positions ?? [];
  const market_positions = raw.positions?.market_positions ?? [];
  // Computed portfolio_value (live exposures) — use as fallback when
  // summary.portfolio_value_dollars isn't present.
  const computedExposure = market_positions.reduce(
    (acc, p) => acc + num(p.market_exposure_dollars),
    0,
  );
  const cash = raw.summary?.cash_dollars ?? 0;
  const portfolio_value =
    raw.summary?.portfolio_value_dollars ?? computedExposure;
  return {
    date,
    cash,
    portfolio_value,
    total: cash + portfolio_value,
    pulled_at: raw.pulled_at ?? null,
    event_positions,
    market_positions,
    fills_count: Array.isArray(raw.fills) ? raw.fills.length : 0,
  };
}
