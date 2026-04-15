import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import DebateInteractive, { type Debate } from "./DebateInteractive";

// Server component — reads the latest entry from src/data/debates.json and
// delegates rendering (including interactive filter) to DebateInteractive.

async function readLatest(): Promise<Debate | null> {
  try {
    const raw = await readFile(resolve(process.cwd(), "src/data/debates.json"), "utf-8");
    const parsed = JSON.parse(raw) as { debates?: Debate[] };
    const debates = parsed.debates ?? [];
    return debates[debates.length - 1] ?? null;
  } catch {
    return null;
  }
}

export default async function TodayDebate() {
  const debate = await readLatest();

  return (
    <section className="today-debate">
      <div className="today-debate-head">
        <span className="today-debate-eyebrow">// today&rsquo;s argument</span>
        <h2 className="today-debate-title">
          <em>the moderator, the bull, the bear, macro, flow, the historian.</em>
        </h2>
        <p className="today-debate-sub">
          <em>
            six voices. two phases: first they agree on <strong>what</strong> to debate — one
            position, one news event, something we don&rsquo;t know. then they argue their
            positions until they agree on a direction, or don&rsquo;t. the moderator narrates.
            every run is committed to git, public, wrong in legible ways.
          </em>
        </p>
      </div>

      {!debate ? (
        <div className="today-debate-empty">
          <p>
            <em>
              the cron hasn&rsquo;t fired yet. once it does, the premise + the five voices
              + the agreement land here daily. method is the medicine.
            </em>
          </p>
        </div>
      ) : (
        <DebateInteractive debate={debate} />
      )}
    </section>
  );
}
