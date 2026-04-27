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

// Agent palette mirrors the global --anno-* tokens. Inline so SVG fills
// can resolve at render time without runtime CSS-var reads.
const AGENT_FILL: Record<string, string> = {
  bull:      "#A67A3A",
  bear:      "#5F7058",
  macro:     "#546478",
  flow:      "#8B3A2E",
  historian: "#733B43",
};

const AGENT_LABEL: Record<string, string> = {
  bull:      "bull · pure-play conviction",
  bear:      "bear · big-tech anchors + dry powder",
  macro:     "macro · power-for-compute",
  flow:      "flow",
  historian: "historian · diversified theme + IBM",
};

export const metadata = {
  title: "canvas · the book as a graph — aureliex",
  description:
    "every position is a node. node size scales with entry value. edges are co-ownership by bucket or agent.",
};

export default function Canvas() {
  const p = getPortfolio();
  const H: Record<string, any> = {};
  p.holdings.forEach((h: any) => { H[h.ticker] = h; });

  const agentsInBook = Array.from(new Set(p.holdings.map((h: any) => h.owner_agent)));
  const totalEntry = p.holdings.reduce((s: number, h: any) => s + h.entry_value, 0);

  return (
    <article className="article page canvas-page">
      <div className="eyebrow">canvas · the book as a graph</div>
      <h1>Canvas</h1>
      <p className="deck">
        every position is a node. node size scales with entry value. edges are
        co-ownership — same bucket, or same arguing agent. the LLM-driven
        semantic graph lands in v2; this is the MVP layout.
      </p>

      <div className="canvas-meta">
        <span className="canvas-meta-cell">
          <span className="canvas-meta-label">positions</span>
          <span className="canvas-meta-value">{p.holdings.length}</span>
        </span>
        <span className="canvas-meta-cell">
          <span className="canvas-meta-label">edges</span>
          <span className="canvas-meta-value">{edges.length}</span>
        </span>
        <span className="canvas-meta-cell">
          <span className="canvas-meta-label">entry · total</span>
          <span className="canvas-meta-value">${Math.round(totalEntry).toLocaleString()}</span>
        </span>
      </div>

      <div className="canvas-frame">
        <svg viewBox="0 0 900 780" preserveAspectRatio="xMidYMid meet" role="img" aria-label="portfolio graph: positions as nodes, edges as co-ownership">
          <defs>
            <pattern id="canvas-paper" width="6" height="6" patternUnits="userSpaceOnUse">
              <rect width="6" height="6" fill="transparent" />
              <circle cx="1" cy="1" r="0.4" fill="#1C1A17" fillOpacity="0.05" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="900" height="780" fill="url(#canvas-paper)" />

          {edges.map(([a, b], i) => {
            const pa = positionsLayout[a];
            const pb = positionsLayout[b];
            if (!pa || !pb) return null;
            return (
              <line
                key={i}
                x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
                stroke="#1C1A17" strokeOpacity="0.32"
                strokeWidth="1" strokeDasharray="3 5"
              />
            );
          })}
          {Object.entries(positionsLayout).map(([ticker, pos]) => {
            const h = H[ticker];
            if (!h) return null;
            const r = 28 + Math.sqrt(h.entry_value) * 1.35;
            const fill = AGENT_FILL[h.owner_agent] || "#EDE5D5";
            return (
              <g key={ticker} transform={`translate(${pos.x},${pos.y})`}>
                <circle
                  r={r}
                  fill={fill}
                  fillOpacity="0.14"
                  stroke={fill}
                  strokeOpacity="0.78"
                  strokeWidth="1.25"
                />
                <text textAnchor="middle" y="-4" fontFamily="var(--font-display), serif" fontStyle="italic" fontSize="18" fill="#1C1A17">{ticker}</text>
                <text textAnchor="middle" y="14" fontFamily="ui-monospace, Menlo, monospace" fontSize="10" fill="#6B6560">${Math.round(h.entry_value)} · {h.target_pct}%</text>
                <text textAnchor="middle" y="28" fontFamily="ui-monospace, Menlo, monospace" fontSize="9" fill={fill} fontStyle="italic">{h.owner_agent}</text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="canvas-legend">
        <p className="canvas-legend-eyebrow">legend</p>
        <ul className="canvas-legend-list">
          {agentsInBook.map((agent) => (
            <li key={agent} className="canvas-legend-row">
              <span
                className="canvas-legend-swatch"
                style={{ background: AGENT_FILL[agent] || "#1C1A17" }}
                aria-hidden="true"
              />
              <span className="canvas-legend-label">{AGENT_LABEL[agent] || agent}</span>
            </li>
          ))}
          <li className="canvas-legend-row canvas-legend-row--rule">
            <span className="canvas-legend-edge" aria-hidden="true" />
            <span className="canvas-legend-label">edge · shared bucket or agent</span>
          </li>
          <li className="canvas-legend-row canvas-legend-row--rule">
            <span className="canvas-legend-size" aria-hidden="true" />
            <span className="canvas-legend-label">node radius · √(entry value)</span>
          </li>
        </ul>
      </div>

      <p className="canvas-caption">
        v2 will replace the hand-laid layout with an LLM-derived semantic graph
        and let you tap a trench for thesis expansion.
      </p>
    </article>
  );
}
