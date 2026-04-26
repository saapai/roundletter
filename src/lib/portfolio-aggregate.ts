import portfolio from "@/data/portfolio.json";
import artPortfolio from "@/data/art-portfolio.json";
import prediction from "@/data/prediction.json";
import { getLivePortfolio } from "@/lib/portfolio-live";
import { getLatestKalshiSnapshot } from "@/lib/snapshots";

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
  const pieces = getArtPieces();
  const total = pieces.reduce((acc, p) => {
    const bid = typeof p.current_bid === "number" ? p.current_bid : (p.start_bid ?? 0);
    return acc + bid;
  }, 0);
  return {
    current_value: total,
    history: [{ ts: nowTs(), value: total }],
  };
}

function buildPrediction(): PredictionBlock {
  const k = getLatestKalshiSnapshot();
  const cash = k?.cash ?? 0;
  const portfolio_value = k?.portfolio_value ?? 0;
  const bankroll = Number((prediction as { polymarket_bankroll?: number }).polymarket_bankroll) || 0;
  const total = cash + portfolio_value + bankroll;
  return {
    current_value: total,
    history: [{ ts: nowTs(), value: total }],
    breakdown: {
      kalshi: { cash, portfolio_value, total: cash + portfolio_value },
      polymarket: { bankroll },
    },
  };
}

export async function getPortfolioData(): Promise<PortfolioData> {
  const lp = await getLivePortfolio();
  const personal: CategoryBlock = {
    current_value: lp.value,
    history: [{ ts: nowTs(), value: lp.value }],
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
