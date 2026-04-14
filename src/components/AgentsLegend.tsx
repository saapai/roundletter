const AGENTS: [string, string][] = [
  ["bull", "the Bull"],
  ["bear", "the Bear"],
  ["macro", "Macro"],
  ["flow", "Flow"],
  ["historian", "the Historian"],
];

export default function AgentsLegend() {
  return (
    <div className="agents-legend" aria-label="Five-agent editorial panel — hover any dot in the margin to read that agent's note">
      {AGENTS.map(([id, name]) => (
        <span key={id} className={`legend-chip legend-${id}`}>
          <span className="legend-dot" aria-hidden="true" />
          <span>{name}</span>
        </span>
      ))}
    </div>
  );
}
