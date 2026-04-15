import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { AGENT_COLOR, type AgentId, AGENTS } from "@/lib/agent-debate";

// Server component. Reads latest entry from src/data/debates.json and renders
// the premise phase, argument rounds, and closing agreement. Moderator turns
// render in regular prose (no color pill); agent turns are color-coded per
// agent (bull sage / bear rust / macro amber / flow indigo / historian stone).

type PremiseTurn = {
  speaker: AgentId;
  phase: "premise";
  round: 1;
  topic_kind: "position" | "news" | "macro" | "unknown" | "method";
  subject: string;
  why_it_matters: string;
};
type ArgumentTurn = {
  speaker: AgentId;
  phase: "argument";
  round: number;
  claim: string;
  warrant: string;
  prediction: "up" | "down" | "flat";
  confidence: number;
  rebuttal?: string;
};
type Scorecard = {
  percents: Record<AgentId, number>;
  reasoning: string;
  calibration?: string;
};
type ModeratorTurn = {
  speaker: "moderator";
  phase: "premise" | "argument";
  round: number;
  text: string;
  scorecard?: Scorecard;
};
type DebateTurn = PremiseTurn | ArgumentTurn | ModeratorTurn;

type Debate = {
  id: string;
  ts: string;
  day_context: string;
  topic: {
    kind: "position" | "news" | "macro" | "unknown" | "method";
    subject: string;
    framing: string;
  };
  turns: DebateTurn[];
  consensus: {
    reached: boolean;
    direction: "up" | "down" | "flat" | null;
    round: number | null;
  };
  max_argument_rounds: number;
};

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

const AGENT_NAME: Record<AgentId, string> = {
  bull: "the Bull",
  bear: "the Bear",
  macro: "Macro",
  flow: "Flow",
  historian: "the Historian",
};

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
        <AgentLegend />
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
        <DebateLog debate={debate} />
      )}
    </section>
  );
}

function ScorecardView({ sc, label }: { sc: Scorecard; label: string }) {
  const order: AgentId[] = ["bull", "bear", "macro", "flow", "historian"];
  return (
    <div className="scorecard">
      <p className="scorecard-label">{label}</p>
      <div className="scorecard-bars">
        {order.map((id) => {
          const pct = sc.percents[id] ?? 0;
          return (
            <div
              key={id}
              className={`scorecard-bar agent-${id}`}
              style={{ ["--agent-color" as string]: AGENT_COLOR[id] }}
            >
              <span className="sb-name">{AGENT_NAME[id]}</span>
              <div className="sb-track">
                <div className="sb-fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="sb-pct">{pct.toFixed(0)}%</span>
            </div>
          );
        })}
      </div>
      {sc.calibration && (
        <div className="scorecard-calibration">
          <p className="scorecard-cal-eyebrow">// how this was calibrated</p>
          <p className="scorecard-cal-body">{sc.calibration}</p>
        </div>
      )}
    </div>
  );
}

function AgentLegend() {
  return (
    <div className="debate-legend">
      {AGENTS.map((a) => (
        <span
          key={a.id}
          className={`debate-legend-chip agent-${a.id}`}
          style={{ ["--agent-color" as string]: a.color }}
        >
          <span className="dlc-dot" aria-hidden="true" />
          {a.name}
        </span>
      ))}
      <span className="debate-legend-chip debate-legend-moderator">the Moderator</span>
    </div>
  );
}

function DebateLog({ debate }: { debate: Debate }) {
  const premiseTurns = debate.turns.filter(
    (t): t is PremiseTurn | (ModeratorTurn & { phase: "premise" }) => t.phase === "premise",
  );
  const argumentRounds = Array.from(
    new Set(
      debate.turns.filter((t) => t.phase === "argument").map((t) => t.round),
    ),
  ).sort((a, b) => a - b);

  return (
    <article className="debate-log">
      <header className="debate-log-head">
        <span className="dl-ts">{new Date(debate.ts).toISOString().replace("T", " ").slice(0, 16)}Z</span>
        <span className="dl-topic-kind">[{debate.topic.kind}]</span>
        <span className="dl-topic-subject">{debate.topic.subject}</span>
        <span
          className={`dl-consensus dl-${
            debate.consensus.reached ? debate.consensus.direction : "split"
          }`}
        >
          {debate.consensus.reached
            ? `agreement · ${debate.consensus.direction} · round ${debate.consensus.round}`
            : `no agreement after ${argumentRounds.length} rounds`}
        </span>
      </header>

      {/* Premise phase */}
      <section className="debate-phase debate-phase-premise">
        <h3 className="debate-phase-h">premise — what are we arguing about</h3>
        <div className="debate-stream">
          {premiseTurns.map((t, i) => {
            if (t.speaker === "moderator") {
              const mt = t as ModeratorTurn;
              return (
                <div className="turn turn-moderator" key={`p-${i}`}>
                  <span className="turn-role">moderator</span>
                  <p className="turn-prose">
                    <em>{mt.text}</em>
                  </p>
                  {mt.scorecard && <ScorecardView sc={mt.scorecard} label="premise scorecard · who shaped the question" />}
                </div>
              );
            }
            const pt = t as PremiseTurn;
            return (
              <div
                key={`p-${i}`}
                className={`turn turn-agent agent-${pt.speaker}`}
                style={{ ["--agent-color" as string]: AGENT_COLOR[pt.speaker] }}
              >
                <span className="turn-role">{AGENT_NAME[pt.speaker]}</span>
                <span className="turn-kind">[{pt.topic_kind}]</span>
                <p className="turn-claim">
                  <em>&ldquo;{pt.subject}&rdquo;</em>
                </p>
                <p className="turn-warrant">{pt.why_it_matters}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Argument phase — one block per round */}
      {argumentRounds.map((round) => {
        const roundTurns = debate.turns.filter((t) => t.phase === "argument" && t.round === round);
        return (
          <section className="debate-phase debate-phase-argument" key={`r-${round}`}>
            <h3 className="debate-phase-h">round {round}</h3>
            <div className="debate-stream">
              {roundTurns.map((t, i) => {
                if (t.speaker === "moderator") {
                  const mt = t as ModeratorTurn;
                  return (
                    <div className="turn turn-moderator" key={`a-${round}-${i}`}>
                      <span className="turn-role">moderator</span>
                      <p className="turn-prose">
                        <em>{mt.text}</em>
                      </p>
                      {mt.scorecard && (
                        <ScorecardView
                          sc={mt.scorecard}
                          label="argument scorecard · who moved the panel"
                        />
                      )}
                    </div>
                  );
                }
                const at = t as ArgumentTurn;
                return (
                  <div
                    key={`a-${round}-${i}`}
                    className={`turn turn-agent agent-${at.speaker}`}
                    style={{ ["--agent-color" as string]: AGENT_COLOR[at.speaker] }}
                  >
                    <span className="turn-role">{AGENT_NAME[at.speaker]}</span>
                    <span className={`turn-pred turn-pred-${at.prediction}`}>{at.prediction}</span>
                    <span className="turn-conf">{Math.round(at.confidence * 100)}%</span>
                    <p className="turn-claim">
                      <em>{at.claim}</em>
                    </p>
                    <p className="turn-warrant">{at.warrant}</p>
                    {at.rebuttal && (
                      <p className="turn-rebuttal">
                        <em>↪ {at.rebuttal}</em>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {debate.consensus.reached && (
        <div className={`debate-agreement debate-agreement-${debate.consensus.direction}`}>
          <p className="debate-agreement-eyebrow">// the agreement</p>
          <p className="debate-agreement-line">
            <em>
              six voices, {argumentRounds.length} round{argumentRounds.length === 1 ? "" : "s"},
              one direction — <strong>{debate.consensus.direction}</strong>. the method that
              produced it is the medicine.
            </em>
          </p>
        </div>
      )}
    </article>
  );
}
