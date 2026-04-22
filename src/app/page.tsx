import Link from "next/link";
import type { Metadata } from "next";
import curation from "@/data/curation.json";
import hookDebate from "@/data/hook-debate.json";
import ApparatusThumb from "@/components/ApparatusThumb";
import LaunchTrailer from "@/components/LaunchTrailer";
import AuctionCountdown from "@/components/AuctionCountdown";
import OpenBets from "@/components/OpenBets";
import AllocationBar from "@/components/AllocationBar";
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
        <div className="home-rights-eye">// holding a stake on 21 june</div>
        <p>
          everyone sitting on a position when the book closes on{" "}
          <strong>21 june 2026</strong> gets <strong>planning rights</strong> on
          round 1 — vote on the next theme, the panel line-up, the sidecar
          splits — and is <strong>reimbursable</strong> for any costs incurred
          on behalf of the book (research subscriptions, tools, travel to
          events like the friday auction). rights settle by text.
        </p>
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
            every decision argued by five agents, filed as a sealed prediction. the S&amp;P does 10× in 25 years. <strong>we&rsquo;re going 27× in two months.</strong> the gap is the joke and the point.
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
      <section className="home-yt" aria-label="the bookends — youtube-ui cards">
        <div className="home-yt-eye">// the bookends · video</div>

        <a
          className="yt-card yt-card-top"
          href="https://www.youtube.com/results?search_query=wesley+wang+nothing+except+everything"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="top · wesley wang · nothing, except everything"
        >
          <div className="yt-thumb" aria-hidden="true">
            <div className="yt-thumb-noise" />
            <div className="yt-thumb-vignette" />
            <span className="yt-thumb-play">
              <svg viewBox="0 0 68 48" width="52" height="36">
                <path
                  className="yt-play-bg"
                  d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z"
                />
                <path className="yt-play-tri" d="M45 24 27 14v20" />
              </svg>
            </span>
            <span className="yt-thumb-dur">9:28</span>
          </div>
          <div className="yt-meta">
            <span className="yt-avatar" aria-hidden="true">w</span>
            <div className="yt-text">
              <div className="yt-title">nothing, except everything.</div>
              <div className="yt-chan">wesley wang <span className="yt-verified" aria-hidden="true">✓</span></div>
              <div className="yt-counts">128K views · 2 years ago</div>
            </div>
          </div>
          <div className="yt-brand yt-brand-youtube" aria-hidden="true">
            <span className="yt-brand-rect" />
            <span className="yt-brand-word">YouTube</span>
          </div>
        </a>

        <p className="home-yt-mid">
          <em>
            two videos bookend the document. the top is the register i want
            the site to read in. the bottom is the feeling the descent ends
            in — tinted orange to say which counter-culture it's in.
          </em>
        </p>

        <a
          className="yt-card yt-card-bot yt-card-ph"
          href={youtubeSearchLink(SONGS.ghost_town)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="bottom · kanye west · ghost town"
        >
          <div className="yt-thumb yt-thumb-ph" aria-hidden="true">
            <div className="yt-thumb-noise" />
            <div className="yt-thumb-vignette" />
            <span className="yt-thumb-play yt-thumb-play-ph">
              <svg viewBox="0 0 68 48" width="52" height="36">
                <path
                  className="yt-play-bg yt-play-bg-ph"
                  d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z"
                />
                <path className="yt-play-tri" d="M45 24 27 14v20" />
              </svg>
            </span>
            <span className="yt-thumb-dur yt-thumb-dur-ph">4:27</span>
          </div>
          <div className="yt-meta yt-meta-ph">
            <span className="yt-avatar yt-avatar-ph" aria-hidden="true">k</span>
            <div className="yt-text">
              <div className="yt-title yt-title-ph">ghost town — i feel kinda free.</div>
              <div className="yt-chan yt-chan-ph">kanye west <span className="yt-verified" aria-hidden="true">✓</span> · ye · 2018</div>
              <div className="yt-counts yt-counts-ph">ye side B · the hinge of the album</div>
            </div>
          </div>
          <div className="yt-brand yt-brand-ph" aria-hidden="true">
            <span className="yt-brand-rect yt-brand-rect-ph">YEHub</span>
            <span className="yt-brand-word yt-brand-word-ph">Ghost Town</span>
          </div>
        </a>
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
            five variants, one instruction. <strong>tyler said it first.</strong>{" "}
            each poster routes to its own wrong number in the hunt. originals:{" "}
            <strong>call me if you get lost</strong> · tyler, the creator · 2021.{" "}
            <strong>the art portfolio rides on 10% of the total portfolio stake</strong>;
            every piece paid from it, every sale rolls back into it.
          </em>
        </p>
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
