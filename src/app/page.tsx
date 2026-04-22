import Link from "next/link";
import type { Metadata } from "next";
import curation from "@/data/curation.json";
import hookDebate from "@/data/hook-debate.json";
import ApparatusThumb from "@/components/ApparatusThumb";
import LaunchTrailer from "@/components/LaunchTrailer";
import AuctionCountdown from "@/components/AuctionCountdown";
import OpenBets from "@/components/OpenBets";
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

      {/* ══════ CHAPTER 02 — THE STORY ══════ */}
      <Chapter
        n="02"
        id="chapter-02"
        kicker="the story"
        title="a portfolio kept in public. five agents. one product."
        meta="project 2, v1 · in derivative order"
      >
        <div className="home-story">
          <p>
            <strong>aureliex</strong> is a public portfolio experiment. baseline{" "}
            <strong>$3,453.83</strong>, now{" "}
            <strong>
              {fmtMoney(lp.value)}
              {lp.delta !== 0 && (
                <>
                  {" "}
                  <span
                    className={lp.up ? "home-story-up" : "home-story-down"}
                  >
                    ({lp.up ? "+" : "−"}
                    {fmtMoney(Math.abs(lp.delta))} / {lp.up ? "+" : "−"}
                    {Math.abs(lp.pct).toFixed(1)}%)
                  </span>
                </>
              )}
            </strong>
            , target <strong>$100,000 by 21 june 2026</strong>. that&rsquo;s a{" "}
            <strong>{lp.multiple}×</strong> from here. the S&amp;P does 10× in 25 years. the gap is
            the joke and the point.
          </p>
          <p>
            every decision is argued by five agents — <strong>Bull</strong>, <strong>Bear</strong>,
            <strong> Macro</strong>, <strong>Flow</strong>, <strong>Historian</strong> — and filed as a
            sealed prediction. debates at <Link href="/argument">/argument</Link>. book at{" "}
            <Link href="/positions">/positions</Link>. trades at <Link href="/trades">/trades</Link>.
          </p>
          <p className="home-story-big">
            <em>green credit</em> — this is the actual product.
          </p>
          <p>
            a platform where attention invested in reasoning is rewarded with better reasoning.
            the public only bets on success. the founder only bets against themselves. if it wins,
            the public gets paid. if it loses, the pool funds giveaways. the record is the return.{" "}
            <Link href="/green-credit">read the pitch →</Link>
          </p>
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

      {/* ══════ CHAPTER 04 — THE PANEL ARGUED ══════ */}
      <Chapter
        n="04"
        id="chapter-04"
        kicker="the panel argued"
        title="the record of every decision on this page."
        meta="Bull · Bear · Macro · Flow · Historian"
      >
        <div className="home-verdict">
          <div className="home-verdict-final">
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
                {" "}· lands on &ldquo;beautiful&rdquo;
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
              <span className="home-verdict-label">art direction</span>
              <span className="home-verdict-val">magazine-collage · issue #001 · published in public</span>
            </div>
            <div className="home-verdict-row">
              <span className="home-verdict-label">pre-mortem</span>
              <span className="home-verdict-val">
                <a href={youtubeSearchLink(SONGS.ibiza)} target="_blank" rel="noopener noreferrer" className="home-verdict-song">
                  i took a pill in ibiza — mike posner <span aria-hidden="true">↗</span>
                </a>
                {" "}· the sound /let-down is set to
              </span>
            </div>
            <div className="home-verdict-row">
              <span className="home-verdict-label">for later</span>
              <span className="home-verdict-val">
                <Link href="/let-down">/let-down</Link> · <Link href="/arc">/arc</Link>
              </span>
            </div>
          </div>

          <details className="home-verdict-rounds">
            <summary>unfold the debate · {debate.rounds.length} rounds, {debate.candidates.length} candidates</summary>
            {debate.rounds.map((r) => (
              <div key={r.round} className="home-verdict-round">
                <div className="home-verdict-round-n">round {r.round} · {r.direction}</div>
                {r.agents.map((a) => (
                  <div key={a.agent} className="home-verdict-turn">
                    <div className="home-verdict-agent">{a.agent}</div>
                    <div className="home-verdict-claim"><strong>{a.claim}</strong></div>
                    <div className="home-verdict-warrant">{a.warrant}</div>
                  </div>
                ))}
              </div>
            ))}
          </details>
        </div>
      </Chapter>

      {/* ══════ CHAPTER 05 — APPARATUS (the curation) ══════ */}
      <Chapter
        n="05"
        id="chapter-05"
        kicker="apparatus"
        title="aesthetic research curation engine"
        meta="budget · mid · elite · scored"
      >
        <p className="home-apparatus-intro">
          every card is a decision about taste, argued by the panel. tiered <em>budget · mid · elite</em>,
          scored 0–96. the method applied outside the book.
        </p>
        <div className="grid gap-6">
          {data.categories.map((c) => (
            <CategoryCard key={c.id} category={c} />
          ))}
        </div>
      </Chapter>

      {/* ══════ CHAPTER 06 — FOR LATER ══════ */}
      <Chapter
        n="06"
        id="chapter-06"
        kicker="for later"
        title="the frame this site is a derivative of"
        meta="let down · the arc · side B"
      >
        <div className="home-forlater">
          <p>
            the essay — short, quiet, after radiohead 1997 — lives at{" "}
            <Link href="/let-down">/let-down</Link>.
          </p>
          <p>
            the longer cinematic scroll — altarpiece to transit window — lives at{" "}
            <Link href="/arc">/arc</Link>.
          </p>
          <div className="home-forlater-ctas">
            <Link href="/let-down" className="home-forlater-cta">read the anchor →</Link>
            <Link href="/arc" className="home-forlater-cta home-forlater-cta-alt">open the arc →</Link>
          </div>
        </div>
      </Chapter>

      {/* open bets — panel lines for every sub-bet, yes/no cta opens
          sms composer. portfolio-to-$100k is yes-only per saapai's rule. */}
      <OpenBets />

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
          <em>five variants, one instruction. <strong>tyler said it first.</strong> each poster routes to its own wrong number in the hunt. originals: <strong>call me if you get lost</strong> · tyler, the creator · 2021.</em>
        </p>
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
