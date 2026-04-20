import { getPortfolio } from "@/lib/data";

const positionsLayout: Record<string, { x: number; y: number }> = {
  MSFT: { x: 200, y: 160 }, GOOG: { x: 380, y: 140 },
  IBM:  { x: 290, y: 290 }, NVDA: { x: 470, y: 270 },
  QTUM: { x: 560, y: 420 },
  IONQ: { x: 160, y: 460 }, RGTI: { x: 290, y: 560 }, QBTS: { x: 210, y: 660 },
  CEG:  { x: 650, y: 210 }, SGOV: { x: 720, y: 540 },
};

const edges: [string, string][] = [
  ["MSFT","GOOG"],["GOOG","IBM"],["IBM","NVDA"],["MSFT","IBM"],
  ["IONQ","RGTI"],["RGTI","QBTS"],["IONQ","QBTS"],
  ["QTUM","IONQ"],["QTUM","NVDA"],["CEG","NVDA"],["SGOV","QTUM"],
];

export default function Canvas() {
  const p = getPortfolio();
  const H: Record<string, any> = {};
  p.holdings.forEach((h: any) => { H[h.ticker] = h; });

  return (
    <article className="article page">
      <div className="eyebrow">Canvas · the book as a graph</div>
      <h1>Canvas</h1>
      <p className="deck">Trenches are positions. Edges are co-ownership by bucket or agent. MVP layout — LLM semantic graph lands in v2.</p>

      <div className="canvas-frame">
        <svg viewBox="0 0 900 780" preserveAspectRatio="xMidYMid meet">
          {edges.map(([a, b], i) => {
            const pa = positionsLayout[a];
            const pb = positionsLayout[b];
            if (!pa || !pb) return null;
            return (
              <line
                key={i}
                x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
                stroke="#1C1A17" strokeOpacity="0.35"
                strokeWidth="1" strokeDasharray="3 5"
              />
            );
          })}
          {Object.entries(positionsLayout).map(([ticker, pos]) => {
            const h = H[ticker];
            if (!h) return null;
            const r = 28 + Math.sqrt(h.entry_value) * 1.35;
            return (
              <g key={ticker} transform={`translate(${pos.x},${pos.y})`}>
                <circle r={r} fill="#EDE5D5" stroke="#1C1A17" strokeOpacity="0.55" strokeWidth="1" />
                <text textAnchor="middle" y="-4" fontFamily="var(--font-display), serif" fontStyle="italic" fontSize="18" fill="#1C1A17">{ticker}</text>
                <text textAnchor="middle" y="14" fontFamily="ui-monospace, Menlo, monospace" fontSize="10" fill="#6B6560">${Math.round(h.entry_value)} · {h.target_pct}%</text>
                <text textAnchor="middle" y="28" fontFamily="ui-monospace, Menlo, monospace" fontSize="9" fill="#6B6560" fontStyle="italic">{h.owner_agent}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="canvas-caption">Node size scales with position value. Dashed edges indicate shared bucket or agent ownership. Tap a trench in v2 for thesis expansion.</p>
    </article>
  );
}
