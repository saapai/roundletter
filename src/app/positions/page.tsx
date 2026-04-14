import { getPortfolio } from "@/lib/data";

export default function Positions() {
  const p = getPortfolio();
  const byBucket: Record<string, any[]> = {};
  p.holdings.forEach((h: any) => { (byBucket[h.bucket] ||= []).push(h); });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-serif">Positions</h1>
        <p className="text-sm text-graphite mt-1">Round 0 — entered 2026-04-14. Target weights are panel-consensus; actuals drift until rebalance.</p>
      </header>

      {Object.entries(p.buckets).map(([bucket_id, bucket]: any) => (
        <section key={bucket_id}>
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-serif">{bucket.label}</h2>
            <span className="text-xs text-graphite">target {bucket.target_pct}%</span>
          </div>
          <div className="ink-rule mt-1 mb-3" />
          <div className="grid md:grid-cols-2 gap-3">
            {(byBucket[bucket_id] || []).map((h: any) => (
              <div key={h.ticker} className="trench p-4">
                <div className="flex justify-between items-baseline">
                  <div className="text-xl font-serif">{h.ticker}</div>
                  <div className="font-mono text-xs text-graphite">agent: {h.owner_agent}</div>
                </div>
                <div className="text-xs text-graphite">{h.name}</div>
                <div className="ink-rule my-2" />
                <div className="grid grid-cols-3 text-xs gap-1">
                  <div><div className="text-graphite">Shares</div><div className="font-mono">{h.shares}</div></div>
                  <div><div className="text-graphite">Entry</div><div className="font-mono">${h.entry_price}</div></div>
                  <div><div className="text-graphite">Value</div><div className="font-mono">${h.entry_value}</div></div>
                  <div><div className="text-graphite">Target %</div><div className="font-mono">{h.target_pct}%</div></div>
                  <div><div className="text-graphite">Tier</div><div className="font-mono">{h.tier}</div></div>
                </div>
                {h.note && <p className="text-[11px] italic text-graphite mt-2">{h.note}</p>}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
