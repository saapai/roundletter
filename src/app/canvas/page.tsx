import { getPortfolio } from "@/lib/data";

const positionsLayout: Record<string, { x: number; y: number }> = {
  MSFT: { x: 180, y: 140 },  GOOG: { x: 340, y: 120 },
  IBM:  { x: 260, y: 260 },  NVDA: { x: 420, y: 240 },
  QTUM: { x: 540, y: 380 },
  IONQ: { x: 140, y: 420 },  RGTI: { x: 260, y: 520 }, QBTS: { x: 180, y: 620 },
  CEG:  { x: 620, y: 180 },  SGOV: { x: 720, y: 500 },
};

const edges: [string, string][] = [
  ["MSFT","GOOG"],["GOOG","IBM"],["IBM","NVDA"],["MSFT","IBM"],
  ["IONQ","RGTI"],["RGTI","QBTS"],["IONQ","QBTS"],
  ["QTUM","IONQ"],["QTUM","NVDA"],["CEG","NVDA"],["SGOV","QTUM"],
];

export default function Canvas() {
  const p = getPortfolio();
  const H: Record<string, any> = {};
  p.holdings.forEach((h:any)=> H[h.ticker]=h);

  return (
    <div>
      <header>
        <h1 className="text-3xl font-serif">Canvas</h1>
        <p className="text-sm text-graphite mt-1 mb-4">Trenches are positions. Edges are co-ownership by bucket or agent. MVP layout — LLM semantic graph lands in v2.</p>
      </header>
      <div className="trench overflow-auto" style={{ height: 720 }}>
        <svg viewBox="0 0 900 720" className="w-full h-full">
          <defs>
            <pattern id="paper" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.8" fill="#6B6560" opacity="0.12" />
            </pattern>
          </defs>
          <rect width="900" height="720" fill="url(#paper)" />
          {edges.map(([a,b],i)=>{
            const pa = positionsLayout[a]; const pb = positionsLayout[b];
            if(!pa||!pb) return null;
            return <line key={i} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke="#6B6560" strokeWidth="0.8" strokeDasharray="3 4" opacity="0.55" />;
          })}
          {Object.entries(positionsLayout).map(([ticker, pos])=>{
            const h = H[ticker];
            if(!h) return null;
            const r = 24 + Math.sqrt(h.entry_value) * 1.4;
            return (
              <g key={ticker} transform={`translate(${pos.x},${pos.y})`}>
                <circle r={r} fill="#EDE5D5" stroke="#1C1A17" strokeOpacity="0.55" strokeWidth="1" />
                <text textAnchor="middle" y="-4" className="font-serif" fontSize="17" fill="#1C1A17">{ticker}</text>
                <text textAnchor="middle" y="14" fontFamily="ui-monospace" fontSize="10" fill="#6B6560">${Math.round(h.entry_value)} · {h.target_pct}%</text>
                <text textAnchor="middle" y="28" fontFamily="ui-monospace" fontSize="9" fill="#6B6560" fontStyle="italic">{h.owner_agent}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="text-xs text-graphite mt-3">Node size scales with position value. Dashed edges indicate shared bucket or agent ownership. Tap a trench in v2 for thesis expansion.</p>
    </div>
  );
}
