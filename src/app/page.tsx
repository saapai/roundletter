import curation from "@/data/curation.json";

// noop: refresh build after verifying path/imports

type Tier = "Budget" | "Mid" | "Elite";

type CurationItem = {
  name: string;
  note?: string;
  palette?: string[];
  score?: number;
  image?: string;
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
    last_debate: null | {
      id: string;
      ts: string;
      consensus: {
        reached: boolean;
        direction: "up" | "down" | "flat" | null;
        round: number | null;
      };
      topic: {
        kind: string;
        subject: string;
        framing: string;
      };
      summary: string;
    };
  };
  categories: CurationCategory[];
};

const tiers: Tier[] = ["Budget", "Mid", "Elite"];

function formatDate(value: string | null) {
  if (!value) return "not calibrated yet";
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function ApparatusPage() {
  const data = curation as CurationFile;

  return (
    <main className="min-h-screen bg-[#f4efe6] text-[#1c1a17]">
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-col gap-6 border-b border-black/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-black/45">bash and the panel</p>
            <h1 className="mt-3 text-5xl font-light tracking-tight md:text-7xl">apparatus</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-black/65">{data.meta.subtitle}</p>
          </div>
          <div className="text-[11px] uppercase tracking-[0.25em] text-black/45 md:text-right">
            <div>{data.meta.mode}</div>
            <div className="mt-1">{formatDate(data.meta.updated_at)}</div>
          </div>
        </div>

        {data.meta.last_debate ? (
          <div className="mt-6 rounded-3xl border border-black/10 bg-white/55 p-5 shadow-sm">
            <div className="text-[11px] uppercase tracking-[0.28em] text-black/40">last calibration</div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-black/70">
              {data.meta.last_debate.summary || data.meta.last_debate.topic.subject}
            </p>
            <p className="mt-3 text-[11px] uppercase tracking-[0.25em] text-black/40">
              {data.meta.last_debate.consensus.reached ? `consensus ${data.meta.last_debate.consensus.direction}` : "no consensus"}
            </p>
          </div>
        ) : null}

        <div className="mt-10 grid gap-6">
          {data.categories.map((category) => (
            <article key={category.id} className="rounded-3xl border border-black/10 bg-white/60 p-5 shadow-sm">
              <div className="flex items-baseline justify-between gap-4 border-b border-black/10 pb-4">
                <h2 className="text-2xl font-light tracking-tight">{category.label}</h2>
                <span className="text-[11px] uppercase tracking-[0.25em] text-black/40">{category.id}</span>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {tiers.map((tier) => (
                  <section key={tier} className="rounded-2xl bg-[#f8f5ef] p-4">
                    <div className="text-[11px] uppercase tracking-[0.25em] text-black/45">{tier}</div>
                    <ul className="mt-3 space-y-3">
                      {category.tiers[tier].map((item) => (
                        <li key={item.name} className="flex gap-3 text-sm leading-6 text-black/75">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt=""
                              loading="lazy"
                              className="h-14 w-14 flex-shrink-0 rounded-lg object-cover ring-1 ring-black/10"
                            />
                          ) : item.palette && item.palette.length > 0 ? (
                            <div
                              className="h-14 w-14 flex-shrink-0 rounded-lg ring-1 ring-black/10"
                              style={{
                                background: `linear-gradient(135deg, ${item.palette.join(", ")})`,
                              }}
                              aria-hidden
                            />
                          ) : null}
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
          ))}
        </div>

        <div className="mt-10 flex items-center justify-end border-t border-black/10 pt-6 text-[11px] uppercase tracking-[0.25em] text-black/40">
          <span>live curation engine</span>
        </div>
      </section>
    </main>
  );
}
