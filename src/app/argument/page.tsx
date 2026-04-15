import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

async function readDebates(): Promise<Debate[]> {
  try {
    const raw = await readFile(
      resolve(process.cwd(), "src/data/debates.json"),
      "utf-8",
    );
    const parsed = JSON.parse(raw) as { debates?: Debate[] };
    return parsed.debates ?? [];
  } catch {
    return [];
  }
}

export default async function ArgumentPage() {
  const debates = await readDebates();
  const latest = debates[debates.length - 1];

  return (
    <main className="argument-root">
      <div className="argument-wrap">
        <div className="argument-head">
          <p className="argument-eyebrow">// the argument</p>
          <h1 className="argument-title">five agents. one ticker a day. until they agree.</h1>
          <p className="argument-sub">
            <em>
              bull, bear, macro, flow, historian — rotating through the portfolio, debating in
              rounds until consensus or round 4. every day, committed to git, public.
            </em>
          </p>
        </div>

        {!latest ? (
          <div className="argument-empty">
            <p>no debates yet. the first daily run hasn&rsquo;t fired.</p>
          </div>
        ) : (
          <DebateView debate={latest} />
        )}

        {debates.length > 1 && (
          <section className="argument-history">
            <h2 className="argument-history-title">prior arguments</h2>
            <ol className="argument-history-list">
              {debates
                .slice(0, -1)
                .reverse()
                .slice(0, 30)
                .map((d) => (
                  <li key={d.id} className="argument-history-item">
                    <span className="hist-ticker">{d.ticker}</span>
                    <span className="hist-ts">{new Date(d.ts).toISOString().slice(0, 10)}</span>
                    <span
                      className={`hist-consensus hist-${
                        d.consensus.reached ? d.consensus.prediction : "split"
                      }`}
                    >
                      {d.consensus.reached ? d.consensus.prediction : "split"}
                    </span>
                    <span className="hist-rounds">{d.rounds.length / 5}r</span>
                  </li>
                ))}
            </ol>
          </section>
        )}

        <nav className="argument-nav">
          <Link href="/" className="argument-back">← home</Link>
          <span className="argument-dot">·</span>
          <Link href="/positions" className="argument-back">positions</Link>
          <span className="argument-dot">·</span>
          <Link href="/trades" className="argument-back">trades</Link>
        </nav>
      </div>
    </main>
  );
}

function DebateView({ debate }: { debate: Debate }) {
  const roundsSet = Array.from(
    new Set(debate.rounds.map((r) => r.round)),
  ).sort((a, b) => a - b);

  return (
    <section className="argument-current">
      <header className="argument-current-head">
        <span className="cur-ticker">{debate.ticker}</span>
        <span className="cur-ts">{new Date(debate.ts).toISOString().replace("T", " ").slice(0, 16)}Z</span>
        <span
          className={`cur-consensus cur-${
            debate.consensus.reached ? debate.consensus.prediction : "split"
          }`}
        >
          {debate.consensus.reached
            ? `consensus: ${debate.consensus.prediction} (round ${debate.consensus.round})`
            : `no consensus after ${roundsSet.length} rounds`}
        </span>
      </header>

      {roundsSet.map((round) => (
        <div className="round-block" key={round}>
          <h3 className="round-heading">round {round}</h3>
          <div className="round-grid">
            {AGENT_ORDER.map((agentId) => {
              const turn = debate.rounds.find(
                (r) => r.round === round && r.agent === agentId,
              );
              if (!turn) return <div key={agentId} className={`agent-card agent-${agentId} is-empty`} />;
              return (
                <div key={agentId} className={`agent-card agent-${agentId}`}>
                  <div className="agent-card-head">
                    <span className="agent-name">{agentId}</span>
                    <span className={`agent-pred agent-pred-${turn.prediction}`}>
                      {turn.prediction}
                    </span>
                    <span className="agent-conf">{Math.round(turn.confidence * 100)}%</span>
                  </div>
                  <p className="agent-claim">{turn.claim}</p>
                  <p className="agent-warrant">{turn.warrant}</p>
                  {turn.rebuttal && <p className="agent-rebuttal"><em>↪ {turn.rebuttal}</em></p>}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
