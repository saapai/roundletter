import Link from "next/link";
import curation from "@/data/curation.json";
import hookDebate from "@/data/hook-debate.json";
import ApparatusThumb from "@/components/ApparatusThumb";
import HookOverture from "@/components/HookOverture";
import AuctionCountdown from "@/components/AuctionCountdown";
import PlayAllButton from "@/components/PlayAllButton";

/* ────────────────────────────────────────────────────────────
   / — the launch page, arranged as a series of "youtube"
   chapters. each chapter is a framed block with its own title,
   channel, and scrubber cue. click "play the whole thing" to
   enter master-cut mode (auto-advance); otherwise the chapters
   compartmentalize into a scrollable grid.

   chapters:
     01  the hook              (magnolia → jimmy cooks)
     02  the punchline         (name is bullshit. product fucking beautiful.)
                               + (counter culture is here. watch.)
     03  the story             (portfolio · investing · green credit)
     04  the next event        (spray paint auction · ovation hollywood)
     05  the panel argued      (hook-debate verdict)
     06  apparatus             (curation engine, original tiered card grid)
     07  for later             (ghost town → let down at /arc)
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

// Friday sunset in LA, 2026-04-24. Sunset is ~7:27 PM PDT; doors at 7:30 PM.
const AUCTION_ISO = "2026-04-24T19:30:00-07:00";

function Chapter({
  n,
  id,
  kicker,
  title,
  channel,
  meta,
  live,
  children,
}: {
  n: string;
  id: string;
  kicker: string;
  title: React.ReactNode;
  channel: string;
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
          <div className="yt-chapter-channel">
            <span className="yt-chapter-avatar" aria-hidden="true">a</span>
            <span className="yt-chapter-handle">{channel}</span>
            {meta ? <span className="yt-chapter-meta">{meta}</span> : null}
          </div>
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

export default function HomePage() {
  const data = curation as CurationFile;
  const debate = hookDebate as HookDebate;

  return (
    <main className="home-root">
      {/* master-cut toggle */}
      <div className="home-cta">
        <PlayAllButton />
        <span className="home-cta-meta">
          {debate.candidates.length} songs in the pool · panel reached verdict · skip or scroll to compartmentalize
        </span>
      </div>

      {/* ══════ CHAPTER 01 — THE HOOK ══════ */}
      <Chapter
        n="01"
        id="chapter-01"
        kicker="the hook"
        title={<>magnolia <span className="yt-chapter-arrow">→</span> jimmy cooks</>}
        channel="aureliex"
        meta="name-drop · then the bar-swap"
        live
      >
        <HookOverture />
        <p className="home-hook-caption">
          <em>phase a</em> — playboi carti says the name. the whole song is the name.
          <br />
          <em>phase b</em> — 21 says &ldquo;i&rsquo;m sick as f***, finna cook.&rdquo; the product shows up.
        </p>
        <p className="home-hook-caption home-hook-caption-faint">
          (the panel argued over seven songs. scroll to chapter 05 for the receipts.)
        </p>
      </Chapter>

      {/* ══════ CHAPTER 02 — THE PUNCHLINE ══════ */}
      <Chapter
        n="02"
        id="chapter-02"
        kicker="the punchline"
        title="the name is bullshit. the product is fucking beautiful."
        channel="aureliex"
        meta="said plainly"
      >
        <p className="home-punch">
          every ai product you&rsquo;ve seen is useless
          <br />
          but has a cool name.
        </p>
        <p className="home-punch home-punch-emph">
          meet <span className="home-punch-mark">aureliex</span>.
        </p>
        <p className="home-punch">
          the name is bullshit.
          <br />
          but the product? <span className="home-punch-hi">fucking beautiful.</span>
        </p>

        <div className="home-manifesto">
          <p>the counter culture is here.</p>
          <p>i promise you can&rsquo;t stop it if you tried.</p>
          <p className="home-manifesto-end">the best you can do is watch.</p>
        </div>
      </Chapter>

      {/* ══════ CHAPTER 03 — THE STORY ══════ */}
      <Chapter
        n="03"
        id="chapter-03"
        kicker="the story"
        title="a portfolio kept in public. five agents. one product."
        channel="aureliex"
        meta="project 2, v1 · in derivative order"
      >
        <div className="home-story">
          <p>
            <strong>aureliex</strong> is a public portfolio experiment.
            <strong> $3,453.83</strong>, live, with a target of <strong>$100,000 by 21 june 2026</strong> —
            my birthday. that&rsquo;s a <strong>29×</strong>. the S&amp;P does 10× in 25 years. the gap is the
            joke, and the entire point. no job backs the account. all edge comes from reasoning or luck.
          </p>

          <p className="home-story-sub">
            <em>the five-agent panel.</em> every decision is argued live by five agents — <strong>Bull</strong>,
            <strong> Bear</strong>, <strong>Macro</strong>, <strong>Flow</strong>, <strong>Historian</strong> — each
            with its own mandate, references, and scoring record. they file <strong>sealed predictions</strong>
            (SHA-hashed theses + scoring rules, locked at prediction time, broken at resolution), and every debate
            is stamped, stored, and <Link href="/argument">viewable</Link>. Brier scoring weights the panel over
            time. kill-switches are non-discretionary. the <em>method</em> is the product — P&amp;L is the scoreboard.
          </p>

          <p className="home-story-sub">
            <em>the book.</em> ten positions across five buckets — quantum pure-plays, mega-cap hyperscalers,
            the QTUM ETF, CEG for the power constraint on AI compute, and SGOV as dry powder. held in the open at
            {" "}<Link href="/positions">/positions</Link>. every trade is tied to the agent that flagged it at
            {" "}<Link href="/trades">/trades</Link>. nothing hidden.
          </p>

          <p className="home-story-big">
            <em>green credit</em> — this is the actual product.
          </p>

          <p className="home-story-sub">
            green credit is what happens when the apparatus here scales. a platform where attention invested
            in reasoning is rewarded with better reasoning — not ads, not subscriptions, not sales funnels.
            every sealed prediction becomes a <strong>green credit</strong>: a public, forkable, signed claim
            on the future, priced at true odds, scored against outcome. the house takes a cut of reasoning
            getting closer to clarity, and redistributes it as giveaways. the public only bets on success.
            the founder only bets against themselves. if the thesis wins, the public gets paid. if it loses, the
            pool funds giveaways. the founder&rsquo;s expected value is structurally negative. the record is the return.
          </p>

          <p className="home-story-sub">
            read the full pitch at <Link href="/green-credit">/green-credit</Link>. the pre-mortem at{" "}
            <Link href="/letters/round-0">/letters/round-0</Link>. the reasoning in v0 + v1 at{" "}
            <Link href="/archives">/archives</Link>. the personal statement at{" "}
            <Link href="/statement">/statement</Link>.
          </p>
        </div>
      </Chapter>

      {/* ══════ CHAPTER 04 — THE NEXT EVENT ══════ */}
      <Chapter
        n="04"
        id="chapter-04"
        kicker="the next event"
        title={<>spray paint auction <span className="yt-chapter-arrow">·</span> ovation hollywood</>}
        channel="aureliex"
        meta="this friday · sunset to midnight"
        live
      >
        <div className="home-auction">
          <div className="home-auction-head">
            <span className="home-auction-dot" aria-hidden="true" />
            <AuctionCountdown targetIso={AUCTION_ISO} />
          </div>
          <p className="home-auction-lead">
            <strong>ovation hollywood.</strong> friday, <strong>24 april 2026</strong>.
            sunset (7:27 pm) to midnight.
          </p>
          <p className="home-auction-note">
            spray paint. live bids. bring cash. no RSVP, no list, no flyer.
          </p>
          <p className="home-auction-find">
            <em>&ldquo;you&rsquo;ll find it.&rdquo;</em>
          </p>
          <p className="home-auction-credit">
            auction soundtrack: <em>nuevayol</em> — bad bunny. city-flip on a city-flip night.
          </p>
        </div>
      </Chapter>

      {/* ══════ CHAPTER 05 — THE PANEL ARGUED ══════ */}
      <Chapter
        n="05"
        id="chapter-05"
        kicker="the panel argued"
        title="seven songs. three rounds. one verdict."
        channel="aureliex · panel"
        meta="Bull · Bear · Macro · Flow · Historian"
      >
        <div className="home-verdict">
          <div className="home-verdict-head">
            <div className="home-verdict-topic"><em>topic:</em> {debate.topic.subject}</div>
            <div className="home-verdict-framing">{debate.topic.framing}</div>
          </div>

          <div className="home-verdict-candidates">
            {debate.candidates.map((c) => (
              <span key={c.name} className="home-verdict-chip">
                {c.name.toLowerCase()} <span className="home-verdict-chip-year">{c.year}</span>
              </span>
            ))}
          </div>

          <details className="home-verdict-rounds">
            <summary>unfold the debate · 3 rounds, 15 turns</summary>
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

          <div className="home-verdict-final">
            <div className="home-verdict-row">
              <span className="home-verdict-label">hook</span>
              <span className="home-verdict-val">
                magnolia (playboi carti) <span className="yt-chapter-arrow">→</span> jimmy cooks (drake + 21)
              </span>
            </div>
            <div className="home-verdict-row">
              <span className="home-verdict-label">runner-up</span>
              <span className="home-verdict-val">sprinter (central cee + dave)</span>
            </div>
            <div className="home-verdict-row">
              <span className="home-verdict-label">auction</span>
              <span className="home-verdict-val">nuevayol (bad bunny)</span>
            </div>
            <div className="home-verdict-row">
              <span className="home-verdict-label">for later</span>
              <span className="home-verdict-val">
                ghost town → let down · at <Link href="/arc">/arc</Link>
              </span>
            </div>
            <div className="home-verdict-row">
              <span className="home-verdict-label">retired</span>
              <span className="home-verdict-val home-verdict-retired">sicko mode (too saturated)</span>
            </div>
          </div>
        </div>
      </Chapter>

      {/* ══════ CHAPTER 06 — APPARATUS ══════ */}
      <Chapter
        n="06"
        id="chapter-06"
        kicker="apparatus"
        title="aesthetic research curation engine"
        channel="aureliex"
        meta="budget · mid · elite · scored"
      >
        <div className="grid gap-6">
          {data.categories.map((c) => (
            <CategoryCard key={c.id} category={c} />
          ))}
        </div>
      </Chapter>

      {/* ══════ CHAPTER 07 — FOR LATER ══════ */}
      <Chapter
        n="07"
        id="chapter-07"
        kicker="for later"
        title="the frame this site is a derivative of"
        channel="aureliex"
        meta="let down · the arc · side B"
      >
        <div className="home-forlater">
          <p>
            everything on the site is a derivative of one feeling. the essay lives at{" "}
            <Link href="/let-down">/let-down</Link> — short, quiet, after radiohead 1997.
          </p>
          <p>
            the longer cinematic scroll — altarpiece to transit window,
            {" "}<em>&ldquo;i feel kinda free&rdquo;</em> to <em>&ldquo;don&rsquo;t get sentimental&rdquo;</em>
            {" "}— lives at <Link href="/arc">/arc</Link>. moved off the home so the launch
            isn&rsquo;t a funeral. still worth the scroll.
          </p>
          <div className="home-forlater-ctas">
            <Link href="/let-down" className="home-forlater-cta">
              read the anchor <span aria-hidden="true">→</span>
            </Link>
            <Link href="/arc" className="home-forlater-cta home-forlater-cta-alt">
              open the arc <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </Chapter>

      {/* dock — where to go after */}
      <footer className="home-dock">
        <Link href="/positions">positions</Link>
        <Link href="/argument">argument · live</Link>
        <Link href="/green-credit">green credit</Link>
        <Link href="/letters/round-0">letters · round 0</Link>
        <Link href="/market">market</Link>
        <Link href="/archives">archives</Link>
        <Link href="/statement">statement</Link>
        <Link href="/arc">arc</Link>
      </footer>
    </main>
  );
}
