"use client";
import { useState } from "react";
import { AGENT_COLOR, type AgentId, AGENTS } from "@/lib/agent-debate";

// Client component — interactive debate log. Legend chips are filter buttons:
// click any agent (or the Moderator) to show only that speaker's turns.
// Click ALL (default) to show everything. The underlying data read + the
// empty-state are handled by the parent server component (TodayDebate).

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

export type Debate = {
  id: string;
  ts: string;
  day_context: string;
  topic: { kind: string; subject: string; framing: string };
  turns: DebateTurn[];
  consensus: {
    reached: boolean;
    direction: "up" | "down" | "flat" | null;
    round: number | null;
  };
  max_argument_rounds: number;
};

type Filter = "all" | AgentId | "moderator";

const AGENT_NAME: Record<AgentId, string> = {
  bull: "the Bull",
  bear: "the Bear",
  macro: "Macro",
  flow: "Flow",
  historian: "the Historian",
};

export default function DebateInteractive({ debate }: { debate: Debate }) {
  const [filter, setFilter] = useState<Filter>("all");

  const visible = (t: DebateTurn) => filter === "all" || t.speaker === filter;

  const argumentRounds = Array.from(
    new Set(debate.turns.filter((t) => t.phase === "argument").map((t) => t.round)),
  ).sort((a, b) => a - b);

  const premiseTurns = debate.turns.filter((t) => t.phase === "premise").filter(visible);

  return (
    <>
      <FilterBar filter={filter} setFilter={setFilter} />

      <article className="debate-log">
        <header className="debate-log-head">
          <span className="dl-ts">
            {new Date(debate.ts).toISOString().replace("T", " ").slice(0, 16)}Z
          </span>
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

        {/* Premise phase (filtered) */}
        {premiseTurns.length > 0 && (
          <section className="debate-phase debate-phase-premise">
            <h3 className="debate-phase-h">premise — what are we arguing about</h3>
            <div className="debate-stream">
              {premiseTurns.map((t, i) => (
                <TurnCard key={`p-${i}`} turn={t} />
              ))}
            </div>
          </section>
        )}

        {/* Argument phase — one block per round (only render if any visible turns) */}
        {argumentRounds.map((round) => {
          const roundTurns = debate.turns
            .filter((t) => t.phase === "argument" && t.round === round)
            .filter(visible);
          if (roundTurns.length === 0) return null;
          return (
            <section className="debate-phase debate-phase-argument" key={`r-${round}`}>
              <h3 className="debate-phase-h">round {round}</h3>
              <div className="debate-stream">
                {roundTurns.map((t, i) => (
                  <TurnCard key={`a-${round}-${i}`} turn={t} />
                ))}
              </div>
            </section>
          );
        })}

        {debate.consensus.reached && filter === "all" && (
          <div className={`debate-agreement debate-agreement-${debate.consensus.direction}`}>
            <p className="debate-agreement-eyebrow">// the agreement</p>
            <p className="debate-agreement-line">
              <em>
                six voices, {argumentRounds.length} round
                {argumentRounds.length === 1 ? "" : "s"}, one direction —{" "}
                <strong>{debate.consensus.direction}</strong>. the method that produced it is
                the medicine.
              </em>
            </p>
          </div>
        )}
      </article>
    </>
  );
}

function FilterBar({
  filter,
  setFilter,
}: {
  filter: Filter;
  setFilter: (f: Filter) => void;
}) {
  return (
    <div className="debate-legend" role="tablist" aria-label="filter turns by speaker">
      <button
        type="button"
        className={`debate-legend-chip debate-legend-all ${filter === "all" ? "is-active" : ""}`}
        onClick={() => setFilter("all")}
        aria-pressed={filter === "all"}
      >
        ALL
      </button>
      {AGENTS.map((a) => (
        <button
          key={a.id}
          type="button"
          className={`debate-legend-chip agent-${a.id} ${filter === a.id ? "is-active" : ""}`}
          style={{ ["--agent-color" as string]: a.color }}
          onClick={() => setFilter(a.id)}
          aria-pressed={filter === a.id}
        >
          <span className="dlc-dot" aria-hidden="true" />
          {a.name}
        </button>
      ))}
      <button
        type="button"
        className={`debate-legend-chip debate-legend-moderator ${filter === "moderator" ? "is-active" : ""}`}
        onClick={() => setFilter("moderator")}
        aria-pressed={filter === "moderator"}
      >
        the Moderator
      </button>
    </div>
  );
}

function TurnCard({ turn }: { turn: DebateTurn }) {
  if (turn.speaker === "moderator") {
    const mt = turn as ModeratorTurn;
    return (
      <div className="turn turn-moderator">
        <span className="turn-role">moderator</span>
        <p className="turn-prose">
          <em>{mt.text}</em>
        </p>
        {mt.scorecard && (
          <ScorecardView
            sc={mt.scorecard}
            label={
              mt.phase === "premise"
                ? "premise scorecard · who shaped the question"
                : "argument scorecard · who moved the panel"
            }
          />
        )}
      </div>
    );
  }
  if (turn.phase === "premise") {
    const pt = turn as PremiseTurn;
    return (
      <div
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
  }
  const at = turn as ArgumentTurn;
  return (
    <div
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
