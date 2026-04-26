import portfolio from "@/data/portfolio.json";
import artPortfolio from "@/data/art-portfolio.json";
import prediction from "@/data/prediction.json";
import { getLivePortfolio } from "@/lib/portfolio-live";
import {
  getLatestKalshiSnapshot,
  getLatestPolymarketSnapshot,
} from "@/lib/snapshots";

// Single source of truth for the /portfolio page + subroutes + /api/portfolio.
// Builds the unified portfolio response on the server. Pages call this
// directly (no extra fetch hop); the API route just JSON-encodes the result
// for external consumers (saathvikpai.com /statement, future bots, etc.).

export type SeriesPoint = { ts: number; value: number };

export type ExternalEntry = {
  id?: string;
  label?: string;
  amount: number;
  date: string;
  status?: string;
  book_at_entry?: number;
};

export type ArtPiece = {
  id: string;
  title?: string;
  medium?: string;
  date?: string;
  image?: string;
  start_bid?: number;
  current_bid?: number | null;
};

export type CategoryBlock = {
  current_value: number;
  history: SeriesPoint[];
};

export type PredictionBlock = CategoryBlock & {
  // Kalshi-only book history (cash + open exposures, walked back from the
  // latest snapshot via the fills timeline). Split out from the combined
  // `history` so the /prediction page can render a Kalshi-only growth chart
  // — Polymarket curve will follow once we accrue daily PM snapshots.
  kalshi_history: SeriesPoint[];
  breakdown: {
    kalshi: { cash: number; portfolio_value: number; total: number };
    polymarket: { bankroll: number };
  };
};

export type PortfolioData = {
  total: number;
  baseline: number;
  goal: number;
  live: boolean;
  generated_at: number;
  categories: {
    personal: CategoryBlock;
    external: CategoryBlock;
    art: CategoryBlock;
    prediction: PredictionBlock;
  };
};

function dateStrToTs(iso: string): number {
  const t = new Date(`${iso}T14:00:00Z`).getTime();
  return Number.isFinite(t) ? Math.floor(t / 1000) : Math.floor(Date.now() / 1000);
}

function nowTs(): number {
  return Math.floor(Date.now() / 1000);
}

export function getExternalEntries(): ExternalEntry[] {
  return ((portfolio as unknown as { external_entries?: ExternalEntry[] })
    .external_entries ?? []) as ExternalEntry[];
}

export function getArtPieces(): ArtPiece[] {
  return ((artPortfolio as unknown as { pieces?: ArtPiece[] }).pieces ?? []) as ArtPiece[];
}

export function getPersonalHoldings(): Array<{
  ticker: string;
  name?: string;
  shares: number;
  entry_price?: number;
  entry_value: number;
}> {
  const h = (portfolio as unknown as {
    holdings?: Array<{
      ticker: string;
      name?: string;
      shares: number;
      entry_price?: number;
      entry_value: number;
    }>;
  }).holdings ?? [];
  return h;
}

function buildExternal(): CategoryBlock {
  const entries = getExternalEntries();
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  let running = 0;
  const history: SeriesPoint[] = sorted.map((e) => {
    running += Number(e.amount) || 0;
    return { ts: dateStrToTs(e.date), value: running };
  });
  return {
    current_value: running,
    history: history.length === 0 ? [{ ts: nowTs(), value: 0 }] : history,
  };
}

function buildArt(): CategoryBlock {
  // Filter to pieces that actually have images delivered. Locked previews
  // are excluded from the public-facing portfolio + value.
  const pieces = getArtPieces().filter((p) => !!p.image);
  // Sort by piece date — cumulative bid value as the artist accrued the
  // catalog. Each new piece adds its starting bid to the running total.
  const sorted = [...pieces].sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  let running = 0;
  const history: SeriesPoint[] = sorted.map((p) => {
    const bid = typeof p.current_bid === "number" ? p.current_bid : (p.start_bid ?? 0);
    running += bid;
    return { ts: dateStrToTs(p.date || "2026-04-25"), value: running };
  });
  return {
    current_value: running,
    history: history.length === 0 ? [{ ts: nowTs(), value: 0 }] : history,
  };
}

function buildPrediction(): PredictionBlock {
  const k = getLatestKalshiSnapshot();
  const cash = k?.cash ?? 0;
  const portfolio_value = k?.portfolio_value ?? 0;
  // Polymarket bankroll: prefer the latest vendored snapshot from
  // src/data/snapshots/polymarket/YYYY-MM-DD.json (mirrors the Kalshi
  // pipeline); fall back to the constant in prediction.json when no
  // snapshots have been committed yet.
  const pm = getLatestPolymarketSnapshot();
  const fallbackBankroll =
    Number((prediction as { polymarket_bankroll?: number }).polymarket_bankroll) || 0;
  const bankroll = pm?.bankroll ?? fallbackBankroll;
  const kalshiTotal = cash + portfolio_value;
  const total = kalshiTotal + bankroll;

  // Build a real time-series from the Kalshi fills timeline (vendored
  // raw JSON). Walks every fill chronologically and reconstructs the
  // running Kalshi book value backwards from today's known total.
  // Polymarket curve is intentionally NOT folded in here — once daily PM
  // snapshots accrue we'll build a parallel `polymarket_history` and the
  // page can stack/sum them. For now PM is a constant baseline.
  type RawFill = {
    action?: string;
    side?: string;
    count_fp?: string | number;
    yes_price_dollars?: string | number;
    no_price_dollars?: string | number;
    fee_cost?: string | number;
    ts?: number;
    created_time?: string;
  };
  const rawFills: RawFill[] = (k as unknown as { fills?: RawFill[] })?.fills ?? [];
  const sortedFills = [...rawFills].sort(
    (a, b) => (a.created_time || "").localeCompare(b.created_time || ""),
  );
  const reversedKalshi: SeriesPoint[] = [];
  let walkCash = cash;
  let walkExp = portfolio_value;
  for (let i = sortedFills.length - 1; i >= 0; i--) {
    const f = sortedFills[i];
    const ts = Number(f.ts) || Math.floor(Date.parse(f.created_time || "") / 1000);
    if (!Number.isFinite(ts) || ts <= 0) continue;
    reversedKalshi.push({
      ts,
      value: Math.round((walkCash + walkExp) * 100) / 100,
    });
    const cnt = Number(f.count_fp) || 0;
    const yes = Number(f.yes_price_dollars) || 0;
    const no = Number(f.no_price_dollars) || 0;
    const px = f.side === "yes" ? yes : no;
    const fee = Number(f.fee_cost) || 0;
    if (f.action === "buy") {
      walkCash += cnt * px + fee;
      walkExp -= cnt * px;
    } else {
      walkCash -= cnt * px - fee;
      walkExp += cnt * px;
    }
  }
  const kalshiHistory = reversedKalshi.reverse();
  const SAMPLE_MAX = 80;
  const sampleEvery = (s: SeriesPoint[]) =>
    s.length <= SAMPLE_MAX
      ? s
      : s.filter((_, i) => i % Math.ceil(s.length / SAMPLE_MAX) === 0);
  const kalshiSampled = sampleEvery(kalshiHistory);
  kalshiSampled.push({ ts: nowTs(), value: kalshiTotal });

  // Combined history (Kalshi walk + constant PM baseline) — kept as the
  // public `history` field so existing portfolio rollups don't change.
  const combined: SeriesPoint[] = kalshiSampled.map((p) => ({
    ts: p.ts,
    value: Math.round((p.value + bankroll) * 100) / 100,
  }));

  return {
    current_value: total,
    history: combined.length === 0 ? [{ ts: nowTs(), value: total }] : combined,
    kalshi_history:
      kalshiSampled.length === 0
        ? [{ ts: nowTs(), value: kalshiTotal }]
        : kalshiSampled,
    breakdown: {
      kalshi: { cash, portfolio_value, total: kalshiTotal },
      polymarket: { bankroll },
    },
  };
}

export type PositionLive = {
  ticker: string;
  name?: string;
  shares: number;
  entry_price?: number;
  entry_value: number;
  current_price: number | null;
  current_value: number;
  delta_entry_dollars: number;
  delta_entry_pct: number;
  delta_today_dollars: number;
  delta_today_pct: number;
  sparkline: number[];   // last ~24 closes for sparkline
};

export type PersonalLive = {
  positions: PositionLive[];
  total_current: number;
  total_entry: number;
  total_delta_entry_dollars: number;
  total_delta_entry_pct: number;
  total_delta_today_dollars: number;
  total_delta_today_pct: number;
};

export async function getPersonalLive(): Promise<PersonalLive | null> {
  try {
    const base = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";
    const r = await fetch(`${base}/api/prices`, { cache: "no-store" });
    if (!r.ok) return null;
    const j = (await r.json()) as {
      hasData?: boolean;
      data?: Record<string, { timestamps: number[]; closes: number[] } | null>;
    };
    if (!j?.hasData || !j.data) return null;
    const holdings = getPersonalHoldings();
    const positions: PositionLive[] = holdings.map((h) => {
      const s = j.data?.[h.ticker];
      if (!s || !s.closes || s.closes.length === 0) {
        return {
          ticker: h.ticker, name: h.name, shares: h.shares,
          entry_price: h.entry_price, entry_value: h.entry_value,
          current_price: null, current_value: h.entry_value,
          delta_entry_dollars: 0, delta_entry_pct: 0,
          delta_today_dollars: 0, delta_today_pct: 0,
          sparkline: [],
        };
      }
      const closes = s.closes;
      const cur = closes[closes.length - 1];
      // Today's delta = vs first bar of the most recent trading day.
      // Approximation: use first bar of the last 14 bars (~7 hr).
      const todayWindow = Math.min(14, closes.length);
      const todayOpen = closes[closes.length - todayWindow] || cur;
      const curValue = h.shares * cur;
      const todayValue = h.shares * todayOpen;
      const deltaEntryDollars = curValue - h.entry_value;
      const deltaEntryPct = h.entry_value > 0 ? (deltaEntryDollars / h.entry_value) * 100 : 0;
      const deltaTodayDollars = curValue - todayValue;
      const deltaTodayPct = todayValue > 0 ? (deltaTodayDollars / todayValue) * 100 : 0;
      const sparkline = closes.slice(-24);
      return {
        ticker: h.ticker, name: h.name, shares: h.shares,
        entry_price: h.entry_price, entry_value: h.entry_value,
        current_price: cur, current_value: curValue,
        delta_entry_dollars: deltaEntryDollars, delta_entry_pct: deltaEntryPct,
        delta_today_dollars: deltaTodayDollars, delta_today_pct: deltaTodayPct,
        sparkline,
      };
    });
    const total_current = positions.reduce((a, p) => a + p.current_value, 0);
    const total_entry = positions.reduce((a, p) => a + p.entry_value, 0);
    const total_deltaEntryDollars = total_current - total_entry;
    const total_delta_entry_pct = total_entry > 0 ? (total_deltaEntryDollars / total_entry) * 100 : 0;
    const total_deltaTodayDollars = positions.reduce((a, p) => a + p.delta_today_dollars, 0);
    const totalTodayBase = total_current - total_deltaTodayDollars;
    const total_delta_today_pct = totalTodayBase > 0 ? (total_deltaTodayDollars / totalTodayBase) * 100 : 0;
    return {
      positions,
      total_current,
      total_entry,
      total_delta_entry_dollars: total_deltaEntryDollars,
      total_delta_entry_pct,
      total_delta_today_dollars: total_deltaTodayDollars,
      total_delta_today_pct,
    };
  } catch {
    return null;
  }
}

async function buildPersonalSeries(currentValue: number): Promise<SeriesPoint[]> {
  // Sum of (shares × close) across all 10 holdings, sampled at every
  // shared 30-min bar timestamp. Falls back to single-point if /api/prices
  // is unavailable at SSR time.
  //
  // The series is anchored at round 0's baseline (account_value_at_entry on
  // baseline_date) so the "All" filter computes the true round-to-date %
  // — without this, the first cached bar is ~5 trading days old and "All"
  // collapses to "5D", showing a tiny percent that's not the round's story.
  // External cash injections (e.g. the 22 apr $50) are added to the wager
  // baseline at their date so the curve doesn't fictionalize them as gains.
  const baselineDate = (portfolio as { baseline_date?: string }).baseline_date ?? "2026-04-12";
  const baselineValue =
    (portfolio as { account_value_at_entry?: number }).account_value_at_entry ?? 3453.83;
  const baselineTs = Math.floor(new Date(`${baselineDate}T14:00:00Z`).getTime() / 1000);
  const externalEntries = getExternalEntries();
  const injections = [...externalEntries]
    .filter((e) => Number(e.amount) > 0)
    .sort((a, b) => a.date.localeCompare(b.date));

  // Adjusted baseline = original baseline + every cash deposit before the
  // most recent live bar. Treats deposits as a step-up in the wager line so
  // gains/losses on the chart reflect only market movement, not transfers.
  const totalInjected = injections.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const adjBaseline = baselineValue + totalInjected;

  const head: SeriesPoint[] = [{ ts: baselineTs, value: adjBaseline }];

  try {
    const base = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";
    const r = await fetch(`${base}/api/prices`, { cache: "no-store" });
    if (!r.ok) throw new Error(`prices api ${r.status}`);
    const j = (await r.json()) as {
      hasData?: boolean;
      data?: Record<string, { timestamps: number[]; closes: number[] } | null>;
    };
    if (!j?.hasData || !j.data) throw new Error("no data");
    const holdings = getPersonalHoldings();
    let timestamps: number[] = [];
    for (const t of Object.keys(j.data)) {
      const s = j.data[t];
      if (s && s.timestamps && s.timestamps.length > timestamps.length) {
        timestamps = s.timestamps;
      }
    }
    if (timestamps.length === 0) throw new Error("no timestamps");
    const live: SeriesPoint[] = timestamps.map((ts, i) => {
      let total = 0;
      for (const h of holdings) {
        const s = j.data?.[h.ticker];
        if (s && s.closes[i] != null) total += h.shares * s.closes[i];
      }
      return { ts, value: Math.round(total * 100) / 100 };
    });
    live.push({ ts: nowTs(), value: currentValue });
    // Drop any cached bars older than baseline — keeps the curve forward-only.
    const liveAfterBaseline = live.filter((p) => p.ts >= baselineTs);
    return [...head, ...liveAfterBaseline];
  } catch {
    return [...head, { ts: nowTs(), value: currentValue }];
  }
}

export async function getPortfolioData(): Promise<PortfolioData> {
  const lp = await getLivePortfolio();
  const personal: CategoryBlock = {
    current_value: lp.value,
    history: await buildPersonalSeries(lp.value),
  };
  const external = buildExternal();
  const art = buildArt();
  const predictionBlock = buildPrediction();
  const total =
    personal.current_value +
    external.current_value +
    art.current_value +
    predictionBlock.current_value;
  return {
    total,
    baseline: lp.baseline,
    goal: lp.goal,
    live: lp.live,
    generated_at: Date.now(),
    categories: {
      personal,
      external,
      art,
      prediction: predictionBlock,
    },
  };
}
