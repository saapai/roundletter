import Link from "next/link";
import type { Metadata } from "next";
import curation from "@/data/curation.json";
import hookDebate from "@/data/hook-debate.json";
import ApparatusThumb from "@/components/ApparatusThumb";
import OpenBets from "@/components/OpenBets";
import ArtPortfolio from "@/components/ArtPortfolio";
import FavoriteNumber from "@/components/FavoriteNumber";
import YouTubeCard from "@/components/YouTubeCard";
import LaunchTrailer from "@/components/LaunchTrailer";
import {
  WATCH_CODA_VIDEO_ID,
  APPARATUS_VIDEO_ID,
  BOTTOM_PINK_VIDEO_ID,
  WESLEY_WANG_VIDEO_ID,
  KANYE_BOOKEND_VIDEO_ID,
} from "@/lib/hunt";
import { SONGS, youtubeSearchLink } from "@/lib/song-links";

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

type HookDebate = typeof hookDebate;

export const metadata: Metadata = {
  title: "the archive — aureliex",
  description:
    "the rest of the magazine — coda, bookends, tyler posters, apparatus, bets, pink reprise. everything that didn't earn a spot on the cover.",
};

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

export default function ArchivePage() {
  const data = curation as CurationFile;
  const debate = hookDebate as HookDebate;

  return (
    <main className="home-root">
      <section className="home-bridge home-bridge-mast">
        <Link href="/" className="home-bridge-wordmark" aria-label="aureliex — home">
          aureliex<span className="home-bridge-wordmark-dot">.</span>
        </Link>
        <div className="home-bridge-sub">the archive</div>
        <div className="home-bridge-kicker">everything below the cover</div>
        <div className="home-bridge-line">the rest of the magazine.</div>
        <div className="home-bridge-arrow" aria-hidden="true">↓</div>
        <div className="home-bridge-rule" aria-hidden="true" />
      </section>

      <div className="home-stack">

        {/* THE TRAILER — the 20s cinematic lands first.  routed here
            from the homepage footer's "▶ the trailer" link.        */}
        <section id="trailer" aria-label="the trailer">
          <LaunchTrailer />
        </section>

        {/* coda · the "watch." embed */}
        <section className="home-coda" aria-label="watch">
          <div className="home-coda-eye">// watch</div>
          <div className="home-coda-frame">
            <iframe
              className="home-coda-iframe"
              src={`https://www.youtube-nocookie.com/embed/${WATCH_CODA_VIDEO_ID}?autoplay=0&mute=1&loop=1&playlist=${WATCH_CODA_VIDEO_ID}&controls=1&playsinline=1&rel=0&modestbranding=1`}
              title="the coda · aureliex"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
          <p className="home-coda-cap"><em>the best you can do is watch.</em></p>
        </section>

        {/* panel verdict · song register */}
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

        {/* open bets */}
        <OpenBets />

        {/* bookends · wesley wang + kanye */}
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

        {/* cmiygl variants */}
        <section className="home-cmiygl" aria-label="call me if you get lost — art portfolio teaser">
          <div className="home-cmiygl-eye">// art portfolio · coming soon</div>
          <div className="home-cmiygl-row">
            <Link href="/67" className="cmiygl-poster cmiygl-stars home-cmiygl-poster">
              <div className="cmiygl-title">call me<br/>if you get lost</div>
              <div className="cmiygl-sub">no. 67 · license of travel</div>
              <div className="cmiygl-phone">+1 (385) 368-7238</div>
              <div className="cmiygl-tag">— tyler homage · 2026</div>
            </Link>
            <Link href="/420" className="cmiygl-poster cmiygl-sunflower home-cmiygl-poster">
              <div className="cmiygl-title">call me<br/>if you get lost</div>
              <div className="cmiygl-sub">no. 420 · sunset</div>
              <div className="cmiygl-phone">+1 (385) 368-7238</div>
              <div className="cmiygl-tag">— tyler homage · 2026</div>
            </Link>
            <Link href="/6767" className="cmiygl-poster cmiygl-zine home-cmiygl-poster">
              <div className="cmiygl-title">call me<br/>if you get lost</div>
              <div className="cmiygl-sub">no. 6767 · side street</div>
              <div className="cmiygl-phone">+1 (385) 368-7238</div>
              <div className="cmiygl-tag">— tyler homage · 2026</div>
            </Link>
            <Link href="/6769" className="cmiygl-poster cmiygl-stars home-cmiygl-poster">
              <div className="cmiygl-title">call me<br/>if you get lost</div>
              <div className="cmiygl-sub">no. 6769 · off by one</div>
              <div className="cmiygl-phone">+1 (385) 368-7238</div>
              <div className="cmiygl-tag">— tyler homage · 2026</div>
            </Link>
            <Link href="/677777" className="cmiygl-poster cmiygl-road home-cmiygl-poster">
              <div className="cmiygl-title">call me<br/>if you get lost</div>
              <div className="cmiygl-sub">no. 677777 · long road</div>
              <div className="cmiygl-phone">+1 (385) 368-7238</div>
              <div className="cmiygl-tag">— tyler homage · 2026</div>
            </Link>
          </div>
          <p className="home-cmiygl-foot">
            <em>
              five variants, one instruction — <strong>tyler said it first.</strong>{" "}
              each poster&rsquo;s number routes to a hunt variant.
            </em>
          </p>
        </section>

        {/* art portfolio · full fourteen-piece gallery */}
        <ArtPortfolio />

        {/* ai's favorite number */}
        <FavoriteNumber />

        {/* apparatus prelude · the green video frame */}
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

        {/* apparatus · curation grid */}
        <section className="yt-chapter" id="apparatus">
          <div className="yt-chapter-frame">
            <div className="yt-chapter-head">
              <span className="yt-chapter-kicker">
                <span className="yt-chapter-n">·</span>
                apparatus
              </span>
              <h2 className="yt-chapter-title">aesthetic research curation engine</h2>
              <div className="yt-chapter-sub">budget · mid · elite · scored</div>
            </div>
            <div className="yt-chapter-body">
              <p className="home-apparatus-intro">
                every card is a decision about taste, argued by the panel. tiered{" "}
                <em>budget · mid · elite</em>, scored 0–96.
              </p>
              <div className="grid gap-6">
                {data.categories.map((c) => (
                  <CategoryCard key={c.id} category={c} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* pink coda · the blush reprise */}
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

        <footer className="home-dock">
          <Link href="/">← back to cover</Link>
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
