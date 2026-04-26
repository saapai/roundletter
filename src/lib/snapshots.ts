import fs from "node:fs";
import path from "node:path";
import { kv } from "@vercel/kv";

// Snapshot loader for live position dumps (Kalshi + Polymarket).
//
// Two sources, in order of preference:
//   1. Vercel KV under `snapshot:<source>:latest` — written at runtime by
//      the polytrader bot via POST /api/snapshots/<source>. This is the
//      "live" path: latency is whatever the bot's cron interval is.
//   2. Filesystem at src/data/snapshots/<source>/YYYY-MM-DD.json — daily
//      vendored dumps committed to the repo. Fallback when KV is empty
//      (e.g. on a fresh Vercel project before the first push lands) and
//      the canonical archive (git log = audit trail).
//
// The async getters always try KV first and fall back to fs. The legacy
// sync getters at the bottom of the file are kept for callers that
// haven't been updated to async yet — they only read the filesystem.
//
// Node-only — uses fs at request time. The route handlers import this
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

export type KalshiFill = {
  ticker: string;
  market_ticker?: string;
  action: string;
  side: string;
  count_fp: string;
  yes_price_dollars?: string;
  no_price_dollars?: string;
  fee_cost?: string;
  created_time: string;
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
  fills: KalshiFill[];
};

type RawKalshiFile = {
  summary?: {
    cash_dollars?: number;
    portfolio_value_dollars?: number;
    as_of?: string;
  };
  fills?: KalshiFill[];
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

function readSnapshotFile(file: string): { date: string; raw: RawKalshiFile } | null {
  const date = file.replace(/\.json$/, "");
  const full = path.join(SNAPSHOT_ROOT, "kalshi", file);
  try {
    const raw = JSON.parse(fs.readFileSync(full, "utf8")) as RawKalshiFile;
    return { date, raw };
  } catch {
    return null;
  }
}

// ─── Polymarket ──────────────────────────────────────────────────────
// Mirror of the Kalshi loader. Reads vendored bot exports from
// src/data/snapshots/polymarket/YYYY-MM-DD.json. Each file is a daily dump
// from the polytrader Polymarket runner — operator drops a new file in to
// roll the bankroll forward; everything else recomputes.
//
// Today the only field we read is `bankroll` (USDC + open exposure in
// dollars). `positions` and `open_orders` are surfaced raw for future UI;
// schema stays loose intentionally so the dumper can evolve without
// breaking the web build.
//
// To wire daily polymarket snapshots, run
//   polytrader/scripts/dump_polymarket_snapshot.py  (TBD)
// and commit the YYYY-MM-DD.json output to this directory.

export type PolymarketPosition = {
  market?: string;
  outcome?: string;
  size?: number;
  avg_price?: number;
  current_price?: number;
  exposure_dollars?: number;
};

export type PolymarketOpenOrder = {
  market?: string;
  outcome?: string;
  side?: string;
  size?: number;
  price?: number;
};

export type PolymarketSnapshot = {
  date: string;          // YYYY-MM-DD (from filename)
  bankroll: number;      // dollars (USDC balance + open exposure)
  pulled_at: string | null;
  positions: PolymarketPosition[];
  open_orders: PolymarketOpenOrder[];
};

type RawPolymarketFile = {
  bankroll?: number;
  pulled_at?: string;
  positions?: PolymarketPosition[];
  open_orders?: PolymarketOpenOrder[];
};

function readPolymarketFile(
  file: string,
): { date: string; raw: RawPolymarketFile } | null {
  const date = file.replace(/\.json$/, "");
  const full = path.join(SNAPSHOT_ROOT, "polymarket", file);
  try {
    const raw = JSON.parse(fs.readFileSync(full, "utf8")) as RawPolymarketFile;
    return { date, raw };
  } catch {
    return null;
  }
}

export function getLatestPolymarketSnapshot(): PolymarketSnapshot | null {
  const files = listSnapshotFiles("polymarket");
  if (files.length === 0) return null;
  const latest = readPolymarketFile(files[files.length - 1]);
  if (!latest) return null;
  const { date, raw } = latest;
  const bankroll = num(
    raw.bankroll != null ? String(raw.bankroll) : undefined,
    Number.NaN,
  );
  if (!Number.isFinite(bankroll)) return null;
  return {
    date,
    bankroll,
    pulled_at: raw.pulled_at ?? null,
    positions: Array.isArray(raw.positions) ? raw.positions : [],
    open_orders: Array.isArray(raw.open_orders) ? raw.open_orders : [],
  };
}

export function getLatestKalshiSnapshot(): KalshiSnapshot | null {
  const files = listSnapshotFiles("kalshi");
  if (files.length === 0) return null;
  const latest = readSnapshotFile(files[files.length - 1]);
  if (!latest) return null;
  const { date, raw } = latest;
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
  // Fills sometimes get pruned from newer summary-only snapshots — walk back
  // through earlier files to find the most recent fills history. Surface up
  // to 50 most-recent fills (sorted desc); UI can slice further.
  let fills: KalshiFill[] = Array.isArray(raw.fills) ? raw.fills : [];
  let fills_count = fills.length;
  if (fills.length === 0) {
    for (let i = files.length - 2; i >= 0; i--) {
      const prior = readSnapshotFile(files[i]);
      if (prior?.raw.fills && prior.raw.fills.length > 0) {
        fills = prior.raw.fills;
        fills_count = fills.length;
        break;
      }
    }
  }
  fills = [...fills]
    .sort((a, b) => (a.created_time < b.created_time ? 1 : -1))
    .slice(0, 50);
  return parseKalshiRaw({ date, cash, portfolio_value, raw, fills });
}

// Shared parser used by both the filesystem path and the KV path so the
// returned KalshiSnapshot shape is identical regardless of source.
function parseKalshiRaw(input: {
  date: string;
  cash: number;
  portfolio_value: number;
  raw: RawKalshiFile;
  fills: KalshiFill[];
}): KalshiSnapshot {
  const { date, cash, portfolio_value, raw, fills } = input;
  const event_positions = raw.positions?.event_positions ?? [];
  const market_positions = raw.positions?.market_positions ?? [];
  const fills_count = fills.length;
  return {
    date,
    cash,
    portfolio_value,
    total: cash + portfolio_value,
    pulled_at: raw.pulled_at ?? null,
    event_positions,
    market_positions,
    fills_count,
    fills,
  };
}

// ─── KV-first async getters ───────────────────────────────────────────
// Preferred path on production: live data pushed by the polytrader bot
// to /api/snapshots/<source> lands in Vercel KV under
// `snapshot:<source>:latest`. These getters try KV first; if it's empty
// or unreachable (local dev without KV creds, fresh deploy) they fall
// back to the vendored filesystem snapshots — same return shape either
// way so callers don't care which source served the read.

const KV_KEY_KALSHI = "snapshot:kalshi:latest";
const KV_KEY_POLYMARKET = "snapshot:polymarket:latest";

type KVKalshiBlob = RawKalshiFile & { pushed_at?: string };
type KVPolymarketBlob = RawPolymarketFile & { pushed_at?: string };

export async function getLatestKalshiSnapshotLive(): Promise<KalshiSnapshot | null> {
  // KV creds aren't set in local dev; skip cleanly when missing.
  if (process.env.KV_REST_API_URL || process.env.KV_URL) {
    try {
      const raw = await kv.get<KVKalshiBlob>(KV_KEY_KALSHI);
      if (raw && typeof raw === "object") {
        const date = (raw.pushed_at || raw.pulled_at || new Date().toISOString()).slice(0, 10);
        const market_positions = raw.positions?.market_positions ?? [];
        const computedExposure = market_positions.reduce(
          (acc, p) => acc + num(p.market_exposure_dollars),
          0,
        );
        const cash = raw.summary?.cash_dollars ?? 0;
        const portfolio_value =
          raw.summary?.portfolio_value_dollars ?? computedExposure;
        const fills = (Array.isArray(raw.fills) ? raw.fills : [])
          .slice()
          .sort((a, b) => (a.created_time < b.created_time ? 1 : -1))
          .slice(0, 50);
        return parseKalshiRaw({ date, cash, portfolio_value, raw, fills });
      }
    } catch (e) {
      // Silent fallback — KV blip shouldn't take the page down.
      console.warn("[snapshots] KV kalshi read failed:", (e as Error).message);
    }
  }
  return getLatestKalshiSnapshot();
}

export async function getLatestPolymarketSnapshotLive(): Promise<PolymarketSnapshot | null> {
  if (process.env.KV_REST_API_URL || process.env.KV_URL) {
    try {
      const raw = await kv.get<KVPolymarketBlob>(KV_KEY_POLYMARKET);
      if (raw && typeof raw === "object") {
        const date = (raw.pushed_at || raw.pulled_at || new Date().toISOString()).slice(0, 10);
        const bankroll = num(
          raw.bankroll != null ? String(raw.bankroll) : undefined,
          Number.NaN,
        );
        if (Number.isFinite(bankroll)) {
          return {
            date,
            bankroll,
            pulled_at: raw.pulled_at ?? null,
            positions: Array.isArray(raw.positions) ? raw.positions : [],
            open_orders: Array.isArray(raw.open_orders) ? raw.open_orders : [],
          };
        }
      }
    } catch (e) {
      console.warn("[snapshots] KV polymarket read failed:", (e as Error).message);
    }
  }
  return getLatestPolymarketSnapshot();
}
