import Link from "next/link";
import { getPortfolio, getLetter } from "@/lib/data";

export default function Home() {
  const p = getPortfolio();
  const letter = getLetter("round-0");
  const drawdown = p.drawdown_pct_from_peak as number;
  const excerpt = letter?.body.split("\n").slice(0, 10).join("\n").replace(/^#.*$/gm, "").trim().slice(0, 420) + "…";

  return (
    <div className="space-y-10">
      <section className="grid md:grid-cols-3 gap-5">
        {/* Latest Letter */}
        <Link href="/letters/round-0" className="trench p-5 md:col-span-2">
          <div className="text-[11px] uppercase tracking-widest text-graphite">The Round Letter · Round 0</div>
          <h2 className="mt-1 text-3xl font-serif">The Pre-Mortem</h2>
          <div className="text-sm text-graphite mt-1">2026-04-14 · before the first cron fires</div>
          <p className="mt-3 text-[15px] leading-relaxed">{excerpt}</p>
          <div className="text-sm mt-3 underline">read the round letter →</div>
        </Link>

        {/* Drawdown Card — permanently visible, no euphemism */}
        <div className="trench p-5">
          <div className="text-[11px] uppercase tracking-widest text-graphite">Peak-to-Trough</div>
          <div className="font-mono text-5xl mt-2 text-rust">{drawdown.toFixed(1)}%</div>
          <div className="text-xs text-graphite mt-1">from ${p.peak_value.toLocaleString()} on {p.peak_date}</div>
          <div className="ink-rule my-3" />
          <div className="text-[11px] uppercase tracking-widest text-graphite">Account Value</div>
          <div className="font-mono text-2xl mt-1">${p.account_value_at_entry.toLocaleString()}</div>
          <div className="text-xs text-graphite mt-1">Round 0 entry · {p.baseline_date}</div>
        </div>
      </section>

      {/* Agent Box Score */}
      <section>
        <div className="flex items-baseline justify-between">
          <h3 className="text-xl font-serif">The Agent Box Score</h3>
          <span className="text-xs text-graphite">equal-weighted until ≥20 resolved predictions per agent</span>
        </div>
        <div className="ink-rule mt-2 mb-3" />
        <div className="grid md:grid-cols-5 gap-3">
          {["the Bull","the Bear","Macro","Flow","the Historian"].map((n,i)=>(
            <div key={n} className="trench p-3">
              <div className="text-[11px] uppercase tracking-widest text-graphite">Agent #{i+1}</div>
              <div className="text-lg font-serif mt-1">{n}</div>
              <div className="text-xs text-graphite mt-1">weight 20%</div>
              <div className="font-mono text-xs mt-2">Brier: —</div>
              <div className="font-mono text-xs">Resolved: 0</div>
            </div>
          ))}
        </div>
      </section>

      {/* How to read this site */}
      <section className="trench p-5">
        <h3 className="text-lg font-serif">How to read this site</h3>
        <div className="ink-rule my-2" />
        <ul className="text-[15px] leading-relaxed list-disc pl-5 space-y-1.5">
          <li><Link className="underline" href="/letters/round-0">Round letters</Link> are the core artifact — one per rebalance, skeleton: what I owned, what the agents disagreed about, what I got wrong, what I'm risking next.</li>
          <li><Link className="underline" href="/trades">Trades</Link> is a timestamped receipt log. Every buy, sell, and trim with a rationale.</li>
          <li><Link className="underline" href="/positions">Positions</Link> is the current book with entry prices, bucket assignments, and the agent who owns the thesis.</li>
          <li><Link className="underline" href="/canvas">Canvas</Link> is an infinite-pan sketchbook view of the book. Positions are trenches; edges are bucket/agent relationships.</li>
          <li><Link className="underline" href="/about-the-method">Method</Link> describes the five-agent panel, the Brier scoring, the kill-switches.</li>
        </ul>
      </section>
    </div>
  );
}
