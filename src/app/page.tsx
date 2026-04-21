import Link from "next/link";
import curation from "@/data/curation.json";
import ApparatusThumb from "@/components/ApparatusThumb";
import ArcOverture from "@/components/ArcOverture";
import ArcReplayButton from "@/components/ArcReplayButton";
import ArcAmbientAudio from "@/components/ArcAmbientAudio";

/* ────────────────────────────────────────────────────────────
   apparatus — a curation engine, arranged as a scroll arc:
   Ghost Town (kanye) → the descent → Let Down (radiohead)
   → coda: the study sale is over.

   categories are grouped by emotional register, not by the
   order in the json.
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
  meta: {
    name: string;
    subtitle: string;
    mode: string;
    updated_at: string | null;
  };
  categories: CurationCategory[];
};

const TIERS: Tier[] = ["Budget", "Mid", "Elite"];

// Arc grouping. Sacred things at the altar, clinical things at the window.
const ARC_ORDER: Record<"ghost_town" | "descent" | "let_down", string[]> = {
  ghost_town: ["music", "art-pieces", "movies"],
  descent: ["songs", "clothes", "speakers"],
  let_down: ["shoes", "software-product-design", "business", "best-bets"],
};

function CategoryBlock({ category }: { category: CurationCategory }) {
  return (
    <article className="arc-cat" id={`cat-${category.id}`}>
      <header className="arc-cat-head">
        <h2 className="arc-cat-label">{category.label}</h2>
        <span className="arc-cat-id">{category.id}</span>
      </header>
      <div className="arc-tiers">
        {TIERS.map((tier) => (
          <section key={tier} className="arc-tier">
            <div className="arc-tier-label">{tier}</div>
            <ul className="arc-items">
              {category.tiers[tier].map((item) => (
                <li key={item.name} className="arc-item">
                  <ApparatusThumb
                    image={item.image ?? undefined}
                    palette={item.palette}
                    alt={item.name}
                    tier={tier}
                  />
                  <div className="arc-item-body">
                    <div>
                      <span className="arc-item-name">{item.name}</span>
                      {item.note ? (
                        <>
                          {" · "}
                          <span className="arc-item-note">{item.note}</span>
                        </>
                      ) : null}
                    </div>
                    {item.palette && item.palette.length > 0 ? (
                      <div className="arc-palette" aria-label="palette">
                        {item.palette.map((hex, i) => (
                          <span
                            key={`${item.name}-p-${i}`}
                            style={{ backgroundColor: hex }}
                            title={hex}
                          />
                        ))}
                      </div>
                    ) : null}
                    {typeof item.score === "number" ? (
                      <div className="arc-score">
                        <div className="arc-score-bar">
                          <div
                            className="arc-score-fill"
                            style={{
                              width: `${Math.max(0, Math.min(100, item.score))}%`,
                            }}
                          />
                        </div>
                        <span className="arc-score-num">{item.score}</span>
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

export default function ApparatusPage() {
  const data = curation as CurationFile;
  const byId: Record<string, CurationCategory> = Object.fromEntries(
    data.categories.map((c) => [c.id, c])
  );

  return (
    <main className="arc-root">
      <ArcOverture />

      {/* ══════ MOVEMENT I — GHOST TOWN ══════ */}
      <section className="arc-ghost-town">
        <div className="arc-hero">
          <div className="arc-eyebrow">
            movement i <em>· ghost town</em>
          </div>
          <h1 className="arc-title">
            apparatus<span className="dot">.</span>
          </h1>
          <p className="arc-tag">
            an aesthetic research engine. kept in the open, arranged in derivative order,
            priced from <em>budget</em> to <em>elite</em>.
          </p>
          <div className="arc-lyric">
            <span>i&rsquo;ve been trying to make you love me</span>
            <span>but everything i try just takes you further from me.</span>
            <em>— and i feel kinda free.</em>
            <span className="arc-lyric-attr">kanye west · ghost town · 2018</span>
          </div>
        </div>

        <div className="arc-stack">
          {ARC_ORDER.ghost_town.map((id) =>
            byId[id] ? <CategoryBlock key={id} category={byId[id]} /> : null
          )}
        </div>
      </section>

      {/* ══════ HINGE — the room starts to echo ══════ */}
      <section className="arc-hinge">
        <em>the palette cools. the room starts to echo back.</em>
        <span className="arc-hinge-rule" aria-hidden="true" />
      </section>

      {/* ══════ MOVEMENT II — THE DESCENT ══════ */}
      <section className="arc-descent">
        <div className="arc-stack">
          {ARC_ORDER.descent.map((id) =>
            byId[id] ? <CategoryBlock key={id} category={byId[id]} /> : null
          )}
        </div>
      </section>

      {/* ══════ MOVEMENT III — LET DOWN ══════ */}
      <section className="arc-let-down">
        <ArcAmbientAudio
          src="/audio/let-down.mp3"
          label="let down"
          storageKey="rl:arc-let-down-muted"
        />
        <div className="arc-hinge">
          <em>
            transit window. cold glass. the train doesn&rsquo;t stop for you.
          </em>
          <span className="arc-hinge-rule" aria-hidden="true" />
        </div>

        <div className="arc-stack">
          {ARC_ORDER.let_down.map((id) =>
            byId[id] ? <CategoryBlock key={id} category={byId[id]} /> : null
          )}
        </div>

        {/* departures board — the rest of the site, rendered cold */}
        <nav className="arc-transit" aria-label="site navigation">
          <div className="arc-transit-head">departures · all times local</div>
          <ul className="arc-transit-list">
            <li><Link href="/letters/round-0">letters · round 0</Link><span>on time</span></li>
            <li><Link href="/positions">positions</Link><span>on time</span></li>
            <li><Link href="/market">market</Link><span>on time</span></li>
            <li><Link href="/green-credit">green credit</Link><span>delayed</span></li>
            <li><Link href="/trades">trades</Link><span>on time</span></li>
            <li><Link href="/canvas">canvas</Link><span>on time</span></li>
            <li><Link href="/archives">archives · v0 + v1</Link><span>on time</span></li>
          </ul>
        </nav>

        {/* viewable iMessage link — friday is still up, no one&rsquo;s texting back */}
        <div className="arc-imessage">
          <div className="arc-imessage-label">viewable · imessage</div>
          <span className="arc-bubble arc-bubble-in">
            friday? are you still up?
          </span>
          <Link href="/friday" className="arc-bubble arc-bubble-out">
            yes. she hasn&rsquo;t logged off. →
          </Link>
          <span className="arc-bubble-meta">delivered · tap to read</span>
        </div>
      </section>

      {/* ══════ CODA — the study sale is over ══════ */}
      <section className="arc-coda">
        <span className="arc-coda-rule" aria-hidden="true" />
        <h2 className="arc-coda-title">the study sale is over.</h2>
        <div className="arc-coda-sub">gallery closed · lots withdrawn</div>
        <div className="arc-coda-lyrics">
          <span>don&rsquo;t get sentimental —</span>
          <em>it always ends up drivel.</em>
          <span>one day, i am going to grow wings.</span>
          <em>a chemical reaction, hysterical and useless.</em>
        </div>
        <div className="arc-coda-attr">radiohead · let down · 1997</div>
        <ArcReplayButton />
      </section>
    </main>
  );
}
