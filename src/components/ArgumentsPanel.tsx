import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

// Rolling 5h argument feed. Alternates position/design axis. Seeded 2026-04-17
// with five research reports; ongoing entries written by
// .github/workflows/5h-argument.yml → scripts/run-5h-argument.ts.

type ArgumentEntry =
  | {
      id: string;
      ts: string;
      axis: "position" | "design";
      kind: "debate";
      title: string;
      summary: string;
      debate?: unknown;
    }
  | {
      id: string;
      ts: string;
      axis: "position" | "design";
      kind: "report";
      title: string;
      summary: string;
      body: string;
    };

type ArgumentsFile = {
  note?: string;
  next_axis?: "position" | "design";
  arguments: ArgumentEntry[];
};

async function readArguments(): Promise<ArgumentsFile | null> {
  try {
    const raw = await readFile(resolve(process.cwd(), "src/data/arguments.json"), "utf-8");
    return JSON.parse(raw) as ArgumentsFile;
  } catch {
    return null;
  }
}

function fmtTs(iso: string): string {
  const d = new Date(iso);
  const y = d.getUTCFullYear();
  const m = (d.getUTCMonth() + 1).toString().padStart(2, "0");
  const day = d.getUTCDate().toString().padStart(2, "0");
  const hh = d.getUTCHours().toString().padStart(2, "0");
  const mm = d.getUTCMinutes().toString().padStart(2, "0");
  return `${y}-${m}-${day} ${hh}:${mm}z`;
}

export default async function ArgumentsPanel() {
  const file = await readArguments();
  const entries = (file?.arguments ?? []).slice(-8).reverse();
  const nextAxis = file?.next_axis ?? "position";

  return (
    <section className="arguments-panel">
      <div className="arguments-head">
        <span className="arguments-eyebrow">// the arguments · every 5h · position / design</span>
        <h2 className="arguments-title">
          <em>six voices, two axes, rotating.</em>
        </h2>
        <p className="arguments-sub">
          <em>
            every five hours the panel argues about a specific line of the book or a specific
            pixel of the site. the axis alternates. next run: <strong>{nextAxis}</strong>. the
            transcript commits to git. legible losing is the point.
          </em>
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="arguments-empty">
          <p>
            <em>the cron hasn&rsquo;t fired yet. first entry will land on the next :00 hour modulo 5.</em>
          </p>
        </div>
      ) : (
        <ol className="arguments-list">
          {entries.map((e) => (
            <li key={e.id} className={`argument-row argument-axis-${e.axis}`}>
              <div className="argument-head">
                <span className={`argument-badge argument-badge-${e.axis}`}>{e.axis}</span>
                <span className="argument-ts">{fmtTs(e.ts)}</span>
                <span className={`argument-kind argument-kind-${e.kind}`}>{e.kind}</span>
              </div>
              <div className="argument-title">{e.title}</div>
              <div className="argument-summary">{e.summary}</div>
              {e.kind === "report" && (
                <details className="argument-body">
                  <summary>
                    <em>read in full</em>
                  </summary>
                  <div className="argument-body-inner">
                    {e.body.split("\n\n").map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </details>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
