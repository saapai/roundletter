import Link from "next/link";
import type { Metadata } from "next";
import curation from "@/data/curation.json";
import hookDebate from "@/data/hook-debate.json";
import ApparatusThumb from "@/components/ApparatusThumb";
import LaunchTrailer from "@/components/LaunchTrailer";
import AuctionCountdown from "@/components/AuctionCountdown";
import OpenBets from "@/components/OpenBets";
import AllocationBar from "@/components/AllocationBar";
import ArtPortfolio from "@/components/ArtPortfolio";
import FavoriteNumber from "@/components/FavoriteNumber";
import YouTubeCard from "@/components/YouTubeCard";
import {
  WATCH_CODA_VIDEO_ID,
  APPARATUS_VIDEO_ID,
  BOTTOM_PINK_VIDEO_ID,
  WESLEY_WANG_VIDEO_ID,
  KANYE_BOOKEND_VIDEO_ID,
} from "@/lib/hunt";
import { getLivePortfolio, fmtMoney } from "@/lib/portfolio-live";
import { SONGS, youtubeSearchLink } from "@/lib/song-links";

/* ────────────────────────────────────────────────────────────
   / — the launch page.
   first load: <LaunchTrailer /> autoplays a ~23s cinematic over
   everything (magazine-collage aesthetic, audio, cut-paper type).
   after the trailer ends / is skipped / the user scrolls — the
   compartmentalized home sits beneath: a quiet set of chapters
   with no in-page audio, trimmed prose, magazine-register accents.
   returning visitors land straight on the quiet version.
   ──────────────────────────────────────────────────────────── */

type Tier = "Budget" | "Mid" | "Elite";
type CurationItem = {
  name: string;
  note?: string;
  palette?: string[];
  score?: number;
  image?: string | null;
};
type CurationCategory = {
  id: string;
  label: string;
  tiers: Record<Tier, CurationItem[]>;
};
type CurationFile = {
  meta: { name: string; subtitle: string; mode: string; updated_at: string | null };
  categories: CurationCategory[];
};

const TIERS: Tier[] = ["Budget", "Mid", "Elite"];
const AUCTION_ISO = "2026-04-24T19:30:00-07:00";

function Chapter({
  n,
  id,
  kicker,
  title,
  meta,
  live,
  children,
}: {
  n: string;
  id: string;
  kicker: string;
  title: React.ReactNode;
  meta?: string;
  live?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="yt-chapter" id={id}>
      <div className="yt-chapter-frame">
        <div className="yt-chapter-head">
          <span className="yt-chapter-kicker">
            <span className="yt-chapter-n">{n}</span>
            {kicker}
            {live ? <span className="yt-chapter-live">● live</span> : null}
          </span>
          <h2 className="yt-chapter-title">{title}</h2>
          {meta ? <div className="yt-chapter-sub">{meta}</div> : null}
        </div>
        <div className="yt-chapter-body">{children}</div>
      </div>
    </section>
  );
}

function CategoryCard({ category }: { category: CurationCategory }) {
  return (
    <article className="rounded-3xl border border-black/10 bg-white/60 p-5 shadow-sm">
      <div className="flex items-baseline justify-between gap-4 border-b border-black/10 pb-4">
        <h3 className="text-2xl font-light tracking-tight">{category.label}</h3>
        <span className="text-[11px] uppercase tracking-[0.25em] text-black/40">{category.id}</span>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {TIERS.map((tier) => (
          <section key={tier} className="rounded-2xl bg-[#f8f5ef] p-4">
            <div className="text-[11px] uppercase tracking-[0.25em] text-black/45">{tier}</div>
            <ul className="mt-3 space-y-3">
              {category.tiers[tier].map((item) => (
                <li key={item.name} className="flex gap-3 text-sm leading-6 text-black/75">
                  <ApparatusThumb
                    image={item.image ?? undefined}
                    palette={item.palette}
                    alt={item.name}
                    tier={tier}
                  />
                  <div className="min-w-0 flex-1">
                    <div>
                      <span className="font-medium text-black/90">{item.name}</span>
                      {item.note ? <span className="text-black/55"> · {item.note}</span> : null}
                    </div>
                    {item.palette && item.palette.length > 0 ? (
                      <div className="mt-2 flex items-center gap-1.5" aria-label="palette">
                        {item.palette.map((hex, i) => (
                          <span
                            key={`${item.name}-p-${i}`}
                            className="inline-block h-2.5 w-2.5 rounded-full ring-1 ring-black/10"
                            style={{ backgroundColor: hex }}
                            title={hex}
                          />
                        ))}
                      </div>
                    ) : null}
                    {typeof item.score === "number" ? (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1 flex-1 overflow-hidden rounded-full bg-black/10">
                          <div
                            className="h-full bg-black/50"
                            style={{ width: `${Math.max(0, Math.min(100, item.score))}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/50 tabular-nums">
                          {item.score}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </article>
  );
}

type HookDebate = typeof hookDebate;

export async function generateMetadata(): Promise<Metadata> {
  const lp = await getLivePortfolio();
  const live = fmtMoney(lp.value);
  const delta = lp.up
    ? `+${fmtMoney(Math.abs(lp.delta))} (+${Math.abs(lp.pct).toFixed(1)}%)`
    : `−${fmtMoney(Math.abs(lp.delta))} (−${Math.abs(lp.pct).toFixed(1)}%)`;
  const title = `aureliex · issue #001 — now at ${live} (${delta}) · just dropped.`;
  const description =
    `launch trailer is live. ${live} on the book (${delta} vs baseline), target $100,000 by 21 june. five ai agents. one product: green credit. plus — spray paint auction, ovation hollywood, this friday sunset → midnight. you'll find it.`;
  return {
    title,
    description,
    openGraph: {
      title: `aureliex · issue #001 — now at ${live}.`,
      description,
      url: "https://aureliex.com",
      siteName: "aureliex",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `aureliex · issue #001 — now at ${live}.`,
      description,
      creator: "@saapai",
    },
  };
}

export default async function HomePage() {
  const data = curation as CurationFile;
  const debate = hookDebate as HookDebate;
  const lp = await getLivePortfolio();

  return (
    <main className="home-root">
      <LaunchTrailer liveValue={lp.value} baseline={lp.baseline} />

      {/* autoplay coda — picks up where the trailer's "best you can do
          is watch" line lands. muted + playsinline for autoplay
          compliance. sits as a centered, framed object with generous
          breathing room above + below rather than full-bleed chrome. */}
      <section className="home-coda" aria-label="watch">
        <div className="home-coda-eye">// watch</div>
        <div className="home-coda-frame">
          <iframe
            className="home-coda-iframe"
            src={`https://www.youtube-nocookie.com/embed/${WATCH_CODA_VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${WATCH_CODA_VIDEO_ID}&controls=1&playsinline=1&rel=0&modestbranding=1`}
            title="the coda · aureliex"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            loading="eager"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
        <p className="home-coda-cap">
          <em>the best you can do is watch.</em>
        </p>
      </section>

      {/* the bridge doubles as the home-page masthead. wordmark sits up top
          (reads as a proper identity, not a floating bridge), the nav row
          sits on the rule below, and the gradient starts at the trailer's
          resting teal so the seam doesn't slam into near-black. */}
      <section className="home-bridge home-bridge-mast" id="after-hero">
        <Link href="/" className="home-bridge-wordmark" aria-label="aureliex — home">
          aureliex<span className="home-bridge-wordmark-dot">.</span>
        </Link>
        <div className="home-bridge-sub">green credit · round 0</div>
        <div className="home-bridge-kicker">the rest of the magazine</div>
        <div className="home-bridge-line">the document begins where the film ends.</div>
        <div className="home-bridge-arrow" aria-hidden="true">↓</div>
        <div className="home-bridge-rule" aria-hidden="true" />
        <nav className="home-bridge-nav" aria-label="site navigation">
          <Link href="/let-down" className="home-bridge-nav-emph">let down</Link>
          <Link href="/positions">positions</Link>
          <Link href="/argument">argument</Link>
          <Link href="/market">market</Link>
          <Link href="/green-credit">green credit</Link>
          <Link href="/trades">trades</Link>
          <Link href="/canvas">canvas</Link>
          <Link href="/archives">archives</Link>
          <Link href="/arc">arc</Link>
        </nav>
        <div className="home-bridge-rule" aria-hidden="true" />
        <div className="home-bridge-after">keep scrolling</div>
      </section>

      <div className="home-stack">

      {/* ══════ CHAPTER 01 — THE PUNCHLINE (leads the quiet version) ══════ */}
      <Chapter
        n="01"
        id="chapter-01"
        kicker="the punchline"
        title={
          <>
            the name is bullshit.
            <br />
            the product is{" "}
            <span className="home-punch-hi">fucking beautiful.</span>
          </>
        }
      >
        <p className="home-punch-build">
          every ai product you&rsquo;ve seen is useless but has a cool name.
        </p>
        <p className="home-punch-build">
          meet <span className="home-punch-mark">aureliex</span>.
        </p>
        <div className="home-manifesto">
          <p>the counter culture is here.</p>
          <p>i promise you can&rsquo;t stop it if you tried.</p>
          <p className="home-manifesto-end">the best you can do is watch.</p>
        </div>
      </Chapter>

      {/* allocation bar — high on the page per saapai's call. segments
          are rendered as one rounded storage-style bar with a colored
          legend: owned (saapai), external $50 stock, 10% art, 10%
          prediction market. lands right after the punchline so the
          reader learns what they're looking at before they scroll. */}
      <AllocationBar baseline={lp.baseline} externalTotal={50} />

      <aside className="home-rights" aria-label="stake-holder rights">
        <div className="home-rights-eye">// holding a stake on 21 june 2026</div>
        <ul className="home-rights-chips">
          <li><span className="home-rights-k">birthday party</span><span className="home-rights-v">invite · stake-holders + 1, free</span></li>
          <li><span className="home-rights-k">round 1 vote</span><span className="home-rights-v">theme · panel · sidecar splits</span></li>
          <li><span className="home-rights-k">reimbursable</span><span className="home-rights-v">research · tools · travel (by text)</span></li>
        </ul>
      </aside>

      {/* ══════ CHAPTER 02 — THE STORY ══════ */}
      <Chapter
        n="02"
        id="chapter-02"
        kicker="the story"
        title="a portfolio kept in public. five agents. one product."
        meta="project 2, v1 · in derivative order"
      >
        <div className="home-story home-story-tight">
          {/* vitals row — numbers first, words later. */}
          <div className="home-vitals" aria-label="the portfolio, at a glance">
            <div className="home-vital">
              <span className="home-vital-k">baseline</span>
              <span className="home-vital-v">$3,453.83</span>
              <span className="home-vital-s">12 apr · seal date</span>
            </div>
            <div className="home-vital home-vital-now">
              <span className="home-vital-k">now</span>
              <span className="home-vital-v">
                {fmtMoney(lp.value)}
              </span>
              {lp.delta !== 0 ? (
                <span className={`home-vital-s ${lp.up ? "home-story-up" : "home-story-down"}`}>
                  {lp.up ? "+" : "−"}{fmtMoney(Math.abs(lp.delta))} · {lp.up ? "+" : "−"}{Math.abs(lp.pct).toFixed(1)}%
                </span>
              ) : (
                <span className="home-vital-s">flat since baseline</span>
              )}
            </div>
            <div className="home-vital">
              <span className="home-vital-k">goal</span>
              <span className="home-vital-v">$100,000</span>
              <span className="home-vital-s">21 jun · {lp.multiple}× from here</span>
            </div>
          </div>

          {/* five-agent chips — each a direct link to /argument */}
          <div className="home-agents" aria-label="the five-agent panel">
            <Link href="/argument" className="home-agent home-agent-bull">bull</Link>
            <Link href="/argument" className="home-agent home-agent-bear">bear</Link>
            <Link href="/argument" className="home-agent home-agent-macro">macro</Link>
            <Link href="/argument" className="home-agent home-agent-flow">flow</Link>
            <Link href="/argument" className="home-agent home-agent-historian">historian</Link>
          </div>

          <p className="home-story-lede">
            five agents. one sealed prediction. <strong>27× in two months.</strong> S&amp;P does 10× in 25 years — the gap is the joke.
          </p>

          <div className="home-story-ctas">
            <Link href="/argument" className="home-cta">panel → /argument</Link>
            <Link href="/positions" className="home-cta">book → /positions</Link>
            <Link href="/trades" className="home-cta">trades → /trades</Link>
          </div>

          <p className="home-story-big">
            <em>green credit</em> — this is the actual product.
          </p>
          <div className="home-story-ctas">
            <Link href="/green-credit" className="home-cta home-cta-emph">read the pitch →</Link>
          </div>

          <details className="home-expand">
            <summary>the longer story · 10/10/80 allocation · sidecar mechanics</summary>
            <div className="home-expand-body">
              <p>
                two sidecar books each ride on <strong>10% of the total portfolio stake</strong>.
                the <strong>prediction-market book</strong> takes the action in
                <Link href="#open-bets"> open bets</Link> below — kalshi referrals + yes/no contracts feed a
                public pool the AI hedges and redistributes to yeses. the{" "}
                <strong>art portfolio</strong> takes ted-lasso texts + call-me-if-you-get-lost finds +
                negotiated pieces, each appraised by panel and paid in cash or portfolio equity.
                every dollar paid into either sidecar is paid from that 10% slice; every gain rolls
                back into it — each book scales with the main one, never cannibalizes it.
              </p>
              <p>
                green credit is the frame around all of it: a platform where attention invested in
                reasoning is rewarded with better reasoning. the public only bets on success. the
                founder only bets against themselves. if it wins, the public gets paid. if it loses,
                the pool funds giveaways. the record is the return.
              </p>
            </div>
          </details>
        </div>
      </Chapter>

      {/* ══════ CHAPTER 03 — THE NEXT EVENT ══════ */}
      <Chapter
        n="03"
        id="chapter-03"
        kicker="the next event"
        title={<>spray paint auction · ovation hollywood</>}
        meta="this friday · sunset to midnight"
        live
      >
        <div className="home-auction home-auction-zine">
          <div className="home-auction-head">
            <span className="home-auction-dot" aria-hidden="true" />
            <AuctionCountdown targetIso={AUCTION_ISO} />
          </div>
          <p className="home-auction-lead">
            <strong>ovation hollywood.</strong> friday, <strong>24 april 2026</strong>. sunset (7:27 pm) → midnight.
          </p>
          <p className="home-auction-note">spray paint. live bids. bring cash. no RSVP, no list, no flyer.</p>
          <p className="home-auction-find"><em>&ldquo;you&rsquo;ll find it.&rdquo;</em></p>
        </div>
      </Chapter>

      {/* panel verdict — the home used to carry chapter 04 (the rounds of
          the debate expand) and chapter 06 (for-later ctas that duplicated
          the bridge nav). the panel met and cut both: debate full record
          now lives only at /argument (linked once from chapter 02); for-
          later is already a hop away from the bridge nav + the dock.
          kept here as a stripped verdict — the song credits + the full-
          debate pointer — because those readings are the register that
          the chapter 01 punchline is set to. */}
      <section className="home-verdict-strip" aria-label="panel verdict · song register">
        <div className="home-verdict-strip-eye">// the panel&rsquo;s register</div>
        <div className="home-verdict-final home-verdict-final-strip">
          <div className="home-verdict-row">
            <span className="home-verdict-label">hook</span>
            <span className="home-verdict-val">
              <a href={youtubeSearchLink(SONGS.a_lot)} target="_blank" rel="noopener noreferrer" className="home-verdict-song">
                a lot — 21 savage ft. j. cole <span aria-hidden="true">↗</span>
              </a>
            </span>
          </div>
          <div className="home-verdict-row">
            <span className="home-verdict-label">punchline</span>
            <span className="home-verdict-val">
              <a href={youtubeSearchLink(SONGS.just_like_me)} target="_blank" rel="noopener noreferrer" className="home-verdict-song">
                just like me — metro boomin + future <span aria-hidden="true">↗</span>
              </a>
            </span>
          </div>
          <div className="home-verdict-row">
            <span className="home-verdict-label">auction</span>
            <span className="home-verdict-val">
              <a href={youtubeSearchLink(SONGS.nuevayol)} target="_blank" rel="noopener noreferrer" className="home-verdict-song">
                nuevayol — bad bunny <span aria-hidden="true">↗</span>
              </a>
            </span>
          </div>
          <div className="home-verdict-row">
            <span className="home-verdict-label">pre-mortem</span>
            <span className="home-verdict-val">
              <a href={youtubeSearchLink(SONGS.ibiza)} target="_blank" rel="noopener noreferrer" className="home-verdict-song">
                i took a pill in ibiza — mike posner <span aria-hidden="true">↗</span>
              </a>
            </span>
          </div>
        </div>
        <div className="home-verdict-strip-foot">
          <Link href="/argument" className="home-cta">see the full debate → /argument</Link>
          <span className="home-verdict-strip-meta">
            {debate.rounds.length} rounds · {debate.candidates.length} candidates
          </span>
        </div>
      </section>

      {/* chapter 06 was removed here — the for-later ctas duplicated
          the bridge nav + the dock. let-down and arc are two clicks
          away from anywhere on the page already. panel voted 4-1 to
          cut; historian dissented, argued the explicit invite mattered.
          invite kept in the dock instead. */}

      {/* open bets — panel lines for every sub-bet, yes/no cta opens
          sms composer. portfolio-to-$100k is yes-only per saapai's rule. */}
      <OpenBets />

      {/* bookends — two faux-YouTube cards. top is a normal youtube-red
          wesley wang card; bottom is a kanye ghost town card recolored
          in pornhub-orange as an allusion to the album's counter-culture
          register. both external-link cards, no iframes, no copyright
          risk. CSS faithfully reconstructs the channel avatar, play
          button overlay, view/time line, and like/share affordances. */}
      <section className="home-yt" aria-label="the bookends — playable video">
        <div className="home-yt-eye">// the bookends · video</div>

        <YouTubeCard
          videoId={WESLEY_WANG_VIDEO_ID}
          title="wesley wang · short film"
          channel="wesley wang"
          meta="how the document sees itself · top frame"
          avatar="w"
          brandWord="YouTube"
        />

        <p className="home-yt-mid">
          <em>two bookends · the register (top) + the feeling (bottom, orange).</em>
        </p>

        <YouTubeCard
          videoId={KANYE_BOOKEND_VIDEO_ID}
          title="kanye · on record. no edits, no moderator."
          channel="yehub"
          meta="bottom frame · the rant"
          avatar="k"
          variant="ph"
          brand="YEHub"
          brandWord="The Rant"
        />
      </section>

      {/* art-portfolio teaser — cmiygl poster homage, doubles as a pointer
          toward the /67/420/6767/6769/677777 variant hunt. visible on the
          quiet home so the Tyler nod is part of the published register,
          not buried behind only the egg reward. */}
      <section className="home-cmiygl" aria-label="call me if you get lost — art portfolio teaser">
        <div className="home-cmiygl-eye">// art portfolio · coming soon</div>
        <div className="home-cmiygl-row">
          <Link href="/67" className="cmiygl-poster cmiygl-stars home-cmiygl-poster" aria-label="variant: star burst on cream">
            <div className="cmiygl-title">call me<br/>if you get lost</div>
            <div className="cmiygl-sub">no. 67 · license of travel</div>
            <div className="cmiygl-phone">+1 (385) 368-7238</div>
            <div className="cmiygl-tag">— tyler homage · 2026</div>
          </Link>
          <Link href="/420" className="cmiygl-poster cmiygl-sunflower home-cmiygl-poster" aria-label="variant: sunflower field sunset">
            <div className="cmiygl-title">call me<br/>if you get lost</div>
            <div className="cmiygl-sub">no. 420 · sunset</div>
            <div className="cmiygl-phone">+1 (385) 368-7238</div>
            <div className="cmiygl-tag">— tyler homage · 2026</div>
          </Link>
          <Link href="/6767" className="cmiygl-poster cmiygl-zine home-cmiygl-poster" aria-label="variant: color-block zine">
            <div className="cmiygl-title">call me<br/>if you get lost</div>
            <div className="cmiygl-sub">no. 6767 · side street</div>
            <div className="cmiygl-phone">+1 (385) 368-7238</div>
            <div className="cmiygl-tag">— tyler homage · 2026</div>
          </Link>
          <Link href="/6769" className="cmiygl-poster cmiygl-stars home-cmiygl-poster" aria-label="variant: star burst cream">
            <div className="cmiygl-title">call me<br/>if you get lost</div>
            <div className="cmiygl-sub">no. 6769 · off by one</div>
            <div className="cmiygl-phone">+1 (385) 368-7238</div>
            <div className="cmiygl-tag">— tyler homage · 2026</div>
          </Link>
          <Link href="/677777" className="cmiygl-poster cmiygl-road home-cmiygl-poster" aria-label="variant: the long road">
            <div className="cmiygl-title">call me<br/>if you get lost</div>
            <div className="cmiygl-sub">no. 677777 · long road</div>
            <div className="cmiygl-phone">+1 (385) 368-7238</div>
            <div className="cmiygl-tag">— tyler homage · 2026</div>
          </Link>
        </div>
        <p className="home-cmiygl-foot">
          <em>
            five variants, one instruction — <strong>tyler said it first.</strong>{" "}
            each poster's number routes to a hunt variant. (originals ·{" "}
            <strong>CMIYGL</strong> · tyler, the creator · 2021.)
          </em>
        </p>
      </section>

      {/* art portfolio · fourteen pieces, live bids, closes friday midnight PT */}
      <ArtPortfolio />

      {/* ai's favorite number · wesley-wang homage · settles at the same
          friday-midnight bell as the art portfolio + auction */}
      <FavoriteNumber />

      {/* apparatus prelude — a green, spotify-meets-youtube-meets-apple-tv
          video frame sitting right above the curation grid. elevated
          bezel, generous shadow, spotify-green play state, apple-tv
          rounded-corner "card" feeling. */}
      <section className="home-apv" aria-label="the apparatus · prelude">
        <div className="home-apv-eye">// the apparatus · prelude</div>
        <div className="home-apv-card">
          <div className="home-apv-screen">
            <iframe
              className="home-apv-iframe"
              src={`https://www.youtube-nocookie.com/embed/${APPARATUS_VIDEO_ID}?rel=0&modestbranding=1&playsinline=1`}
              title="the apparatus · prelude"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
          <div className="home-apv-meta">
            <div className="home-apv-dot" aria-hidden="true" />
            <div className="home-apv-copy">
              <div className="home-apv-title">before the cards</div>
              <div className="home-apv-sub">the method, narrated · aureliex</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ CHAPTER 05 — APPARATUS (the curation) ══════
          moved to the bottom of the stack: the panel called it a register
          surface, not a commerce one. kept here so returning readers find
          the tiered taste cards; the intro prose is now <details> so the
          fold above the grid stays quiet. */}
      <Chapter
        n="05"
        id="chapter-05"
        kicker="apparatus"
        title="aesthetic research curation engine"
        meta="budget · mid · elite · scored"
      >
        <details className="home-apparatus-expand">
          <summary>
            <em>what this is</em> — the method applied outside the book
          </summary>
          <p className="home-apparatus-intro">
            every card is a decision about taste, argued by the panel. tiered{" "}
            <em>budget · mid · elite</em>, scored 0–96.
          </p>
        </details>
        <div className="grid gap-6">
          {data.categories.map((c) => (
            <CategoryCard key={c.id} category={c} />
          ))}
        </div>
      </Chapter>

      {/* bottom pink coda — closing embed in the "fucking beautiful"
          blush register. custom pink chrome around a standard
          youtube-nocookie iframe. */}
      <section className="home-pink" aria-label="pink coda · video">
        <div className="home-pink-eye">// and one more</div>
        <div className="home-pink-card">
          <div className="home-pink-screen">
            <iframe
              className="home-pink-iframe"
              src={`https://www.youtube-nocookie.com/embed/${BOTTOM_PINK_VIDEO_ID}?rel=0&modestbranding=1&playsinline=1`}
              title="the pink coda · aureliex"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
          <div className="home-pink-meta">
            <span className="home-pink-dot" aria-hidden="true" />
            <div className="home-pink-copy">
              <div className="home-pink-title">fucking beautiful · reprise</div>
              <div className="home-pink-sub">the document lands in blush — aureliex</div>
            </div>
          </div>
        </div>
      </section>

      {/* dock */}
      <footer className="home-dock">
        <Link href="/positions">positions</Link>
        <Link href="/argument">argument · live</Link>
        <Link href="/green-credit">green credit</Link>
        <Link href="/letters/round-0">letters · round 0</Link>
        <Link href="/market">market</Link>
        <Link href="/archives">archives</Link>
        <Link href="/statement">statement</Link>
      </footer>
      </div>
    </main>
  );
}
