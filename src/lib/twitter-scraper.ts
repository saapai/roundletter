// Twitter/X scraper using twitterapi.io
// Pulls financial Twitter for sentiment, trader calls, hedge fund discussion
// Used by strategy research agents for social signal layer

export type Tweet = {
  id: string;
  text: string;
  author: string;
  authorFollowers: number;
  likes: number;
  retweets: number;
  replies: number;
  ts: string;
  url: string;
};

export type TwitterSearchResult = {
  query: string;
  tweets: Tweet[];
  scraped_at: string;
  sentiment: { bullish: number; bearish: number; neutral: number };
};

const API_BASE = "https://api.twitterapi.io/twitter";
const API_KEY = process.env.TWITTER_API_KEY ?? "new1_41ae7f85164a4b5792b30b75e7d3757b";

// Free tier: 1 request per 5 seconds
const RATE_LIMIT_MS = 5500;
let lastRequestTime = 0;

async function rateLimitWait(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < RATE_LIMIT_MS) {
    await new Promise((r) => setTimeout(r, RATE_LIMIT_MS - elapsed));
  }
  lastRequestTime = Date.now();
}

async function twitterFetch(endpoint: string, params: Record<string, string> = {}): Promise<any> {
  await rateLimitWait();
  const url = new URL(`${API_BASE}/${endpoint}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url.toString(), {
    headers: {
      "X-API-Key": API_KEY,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Twitter API ${res.status}: ${text}`);
  }
  return res.json();
}

function parseTweet(raw: any): Tweet {
  return {
    id: raw.id ?? raw.id_str ?? "",
    text: raw.text ?? raw.full_text ?? "",
    author: raw.author?.userName ?? raw.user?.screen_name ?? "unknown",
    authorFollowers: raw.author?.followers ?? raw.user?.followers_count ?? 0,
    likes: raw.likeCount ?? raw.favorite_count ?? 0,
    retweets: raw.retweetCount ?? raw.retweet_count ?? 0,
    replies: raw.replyCount ?? raw.reply_count ?? 0,
    ts: raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
    url: raw.url ?? `https://x.com/i/status/${raw.id ?? ""}`,
  };
}

function scoreSentiment(tweets: Tweet[]): { bullish: number; bearish: number; neutral: number } {
  const bullishWords = /\bbull(ish)?\b|\blong\b|\bbuy\b|\bbreakout\b|\bsqueeze\b|\brally\b|\bupside\b|\baccumulat/i;
  const bearishWords = /\bbear(ish)?\b|\bshort\b|\bsell\b|\bcrash\b|\bdrop\b|\bdump\b|\bovervalued\b|\bdownside\b|\btrim\b/i;

  let bullish = 0, bearish = 0, neutral = 0;
  for (const t of tweets) {
    const isBull = bullishWords.test(t.text);
    const isBear = bearishWords.test(t.text);
    if (isBull && !isBear) bullish++;
    else if (isBear && !isBull) bearish++;
    else neutral++;
  }
  const total = tweets.length || 1;
  return {
    bullish: Math.round((bullish / total) * 100),
    bearish: Math.round((bearish / total) * 100),
    neutral: Math.round((neutral / total) * 100),
  };
}

// ── Public API ──────────────────────────────────────────────────────────────

/** Search tweets by query */
export async function searchTweets(query: string, count = 20): Promise<TwitterSearchResult> {
  try {
    const data = await twitterFetch("tweet/advanced_search", {
      query,
      queryType: "Latest",
      cursor: "",
    });

    const rawTweets = data.tweets ?? data.data ?? [];
    const tweets = rawTweets.slice(0, count).map(parseTweet);

    return {
      query,
      tweets,
      scraped_at: new Date().toISOString(),
      sentiment: scoreSentiment(tweets),
    };
  } catch (e) {
    console.error(`Twitter search failed for "${query}":`, e);
    return { query, tweets: [], scraped_at: new Date().toISOString(), sentiment: { bullish: 0, bearish: 0, neutral: 0 } };
  }
}

/** Get tweets from a specific user */
export async function getUserTweets(username: string, count = 10): Promise<Tweet[]> {
  try {
    const data = await twitterFetch("user/last_tweets", {
      userName: username,
      cursor: "",
    });
    const rawTweets = data.tweets ?? data.data ?? [];
    return rawTweets.slice(0, count).map(parseTweet);
  } catch (e) {
    console.error(`Failed to get tweets for @${username}:`, e);
    return [];
  }
}

/** Get user profile info */
export async function getUserProfile(username: string): Promise<any> {
  try {
    return await twitterFetch("user/info", { userName: username });
  } catch (e) {
    console.error(`Failed to get profile for @${username}:`, e);
    return null;
  }
}

// ── Financial Twitter Queries ───────────────────────────────────────────────

/** Scrape FinTwit for a ticker */
export async function scrapeTicker(ticker: string): Promise<TwitterSearchResult> {
  return searchTweets(`$${ticker} OR #${ticker} stock -is:retweet lang:en`, 30);
}

/** Scrape hedge fund / strategy discussion */
export async function scrapeStrategyDiscussion(topic: string): Promise<TwitterSearchResult> {
  return searchTweets(`${topic} trading strategy OR returns OR performance -is:retweet lang:en`, 30);
}

/** Scrape top fintwit accounts for market sentiment */
export async function scrapeFinTwitSentiment(): Promise<{
  tweets: Tweet[];
  accounts: string[];
  overall_sentiment: { bullish: number; bearish: number; neutral: number };
}> {
  const accounts = [
    "unusual_whales",   // options flow
    "DeItaone",         // breaking news
    "zabormarket",      // market structure
    "elerianm",         // macro
    "modabormarket",    // institutional flow
    "markabormarket",   // technicals
  ];

  const allTweets: Tweet[] = [];
  for (const acct of accounts.slice(0, 3)) { // limit to 3 accounts to save rate budget
    try {
      const tweets = await getUserTweets(acct, 5);
      allTweets.push(...tweets);
    } catch {}
  }

  return {
    tweets: allTweets,
    accounts,
    overall_sentiment: scoreSentiment(allTweets),
  };
}

/** Full financial Twitter scan — ticker sentiment + fintwit + strategy chatter */
export async function fullTwitterScan(tickers: string[]): Promise<{
  ticker_sentiment: Record<string, TwitterSearchResult>;
  strategy_chatter: TwitterSearchResult[];
  fintwit_pulse: { bullish: number; bearish: number; neutral: number };
  scraped_at: string;
}> {
  // Serial scrape tickers (rate limit: 1 req per 5s on free tier)
  const tickerResults: Array<{ ticker: string; result: TwitterSearchResult }> = [];
  for (const t of tickers) {
    tickerResults.push({ ticker: t, result: await scrapeTicker(t) });
  }

  const ticker_sentiment: Record<string, TwitterSearchResult> = {};
  for (const { ticker, result } of tickerResults) {
    ticker_sentiment[ticker] = result;
  }

  // Strategy discussions (serial for rate limit)
  const strategyTopics = [
    "AI hedge fund trading",
    "momentum strategy small account",
    "quantitative trading retail",
    "options flow unusual activity",
  ];
  const strategy_chatter: TwitterSearchResult[] = [];
  for (const topic of strategyTopics) {
    strategy_chatter.push(await scrapeStrategyDiscussion(topic));
  }

  // FinTwit pulse
  const fintwit = await scrapeFinTwitSentiment();

  return {
    ticker_sentiment,
    strategy_chatter,
    fintwit_pulse: fintwit.overall_sentiment,
    scraped_at: new Date().toISOString(),
  };
}
