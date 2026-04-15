import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

// Server component — reads the latest entry from src/data/debates.json and
// renders it as an annotated log: round-by-round agent turns, closing with
// the consensus beat. Empty state when no debate has run yet.

type Turn = {
  agent: "bull" | "bear" | "macro" | "flow" | "historian";
  round: number;
  claim: string;
  warrant: string;
  prediction: "up" | "down" | "flat";
  confidence: number;
  rebuttal?: string;
};

type Debate = {
  id: string;
  ts: string;
  ticker: string;
  horizon_days: number;
  rounds: Turn[];
  consensus: {
    reached: boolean;
    prediction: "up" | "down" | "flat" | null;
    round: number | null;
  };
  max_rounds: number;
};

const AGENT_ORDER: Turn["agent"][] = ["bull", "bear", "macro", "flow", "historian"];

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
          <em>five agents. one ticker. until they agree.</em>
        </h2>
        <p className="today-debate-sub">
          <em>
            bull steelmans the upside; bear carries the drawdown tape; macro names the backdrop;
            flow watches the crowd; historian applies the base rates. they argue in rounds — every
            agent reads every other agent&rsquo;s warrant, then revises or stands. the transcript
            below is the last run, committed to git, public, wrong in legible ways.
          </em>
        </p>
      </div>

      {!debate ? (
        <div className="today-debate-empty">
          <p>
            <em>
              the cron hasn&rsquo;t fired yet. the first daily argument will land here — same shape,
              same five voices, rotating through the portfolio one ticker at a time. meanwhile, the
              method is the medicine.
            </em>
          </p>
        </div>
      ) : (
        <DebateLog debate={debate} />
      )}
    </section>
  );
}

function DebateLog({ debate }: { debate: Debate }) {
  const roundsSet = Array.from(new Set(debate.rounds.map((r) => r.round))).sort((a, b) => a - b);

  return (
    <article className="debate-log">
      <header className="debate-log-head">
        <span className="dl-ticker">{debate.ticker}</span>
        <span className="dl-ts">{new Date(debate.ts).toISOString().replace("T", " ").slice(0, 16)}Z</span>
        <span
          className={`dl-consensus dl-${
            debate.consensus.reached ? debate.consensus.prediction : "split"
          }`}
        >
          {debate.consensus.reached
            ? `agreement · ${debate.consensus.prediction} · round ${debate.consensus.round}`
            : `no agreement after ${roundsSet.length} rounds`}
        </span>
      </header>

      {roundsSet.map((round) => (
        <div className="debate-round" key={round}>
          <h3 className="debate-round-h">
            <span className="drh-rail" aria-hidden="true" />
            round {round}
          </h3>
          <div className="debate-turns">
            {AGENT_ORDER.map((agentId) => {
              const turn = debate.rounds.find((r) => r.round === round && r.agent === agentId);
              if (!turn) return <div key={agentId} className={`debate-turn agent-${agentId} is-empty`} />;
              return (
                <div key={agentId} className={`debate-turn agent-${agentId}`}>
                  <div className="dt-head">
                    <span className="dt-agent">{agentId}</span>
                    <span className={`dt-pred dt-pred-${turn.prediction}`}>{turn.prediction}</span>
                    <span className="dt-conf">{Math.round(turn.confidence * 100)}%</span>
                  </div>
                  <p className="dt-claim"><em>{turn.claim}</em></p>
                  <p className="dt-warrant">{turn.warrant}</p>
                  {turn.rebuttal && <p className="dt-rebuttal"><em>↪ {turn.rebuttal}</em></p>}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {debate.consensus.reached && (
        <div className={`debate-coda debate-coda-${debate.consensus.prediction}`}>
          <p className="debate-coda-eyebrow">// the agreement</p>
          <p className="debate-coda-line">
            <em>
              five voices, {roundsSet.length} round{roundsSet.length === 1 ? "" : "s"}, one
              direction — <strong>{debate.consensus.prediction}</strong>. the medicine is the method
              that produced it.
            </em>
          </p>
        </div>
      )}
    </article>
  );
}
