import { getAgents } from "@/lib/data";

export default function Method() {
  const agents = getAgents();
  return (
    <article className="space-y-6">
      <header>
        <h1 className="text-3xl font-serif">The method</h1>
        <p className="text-sm text-graphite mt-1 italic">Five agents, one judge, a written pre-mortem per round.</p>
      </header>

      <section className="trench p-5">
        <h2 className="text-xl font-serif">Why five agents</h2>
        <div className="ink-rule my-2" />
        <p className="text-[16px] leading-relaxed">
          Fifty copies of one agent converge to the same wrong answer. Five structurally different roles — bull, bear, macro, microstructure/flow, base-rate historian — see different inputs, write independently, then face an arbitrator. The research on multi-agent debate (Du et al. 2023; TradingAgents from Columbia/NYU) is unambiguous: gains come from role variance, not from count.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-serif">The panel</h2>
        <div className="ink-rule my-2" />
        <div className="grid md:grid-cols-2 gap-3">
          {agents.map(a=>(
            <div key={a.id} className="trench p-4">
              <div className="text-[11px] uppercase tracking-widest text-graphite">{a.id}</div>
              <div className="text-lg font-serif mt-1">{a.name}</div>
              <p className="text-sm mt-2">{a.mandate}</p>
              <p className="text-xs text-graphite mt-2">Owns: {a.owns_buckets.join(", ")}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="trench p-5">
        <h2 className="text-xl font-serif">Scoring</h2>
        <div className="ink-rule my-2" />
        <p className="text-[16px] leading-relaxed">
          Each agent writes probabilistic direction calls at T+30, T+90, T+365 for every holding. Thesis text is SHA-hashed at prediction time to prevent post-hoc rewriting. When the horizon passes, a Brier score is computed from realized direction. Weights are frozen at equal (0.2) until each agent has ≥20 resolved predictions, at which point exponential decay on cumulative Brier kicks in. Scoring rewards calibration, not P&L — variance swamps skill over fewer than ~50 rounds.
        </p>
      </section>

      <section className="trench p-5">
        <h2 className="text-xl font-serif">Kill-switches</h2>
        <div className="ink-rule my-2" />
        <ul className="list-disc pl-5 space-y-1.5 text-[16px] leading-relaxed">
          <li>Any position over 15% of the book (12% for pure-plays) — trim on breach.</li>
          <li>QTUM −30% from entry — deploy SGOV into QTUM, one-time.</li>
          <li>Any pure-play files an S-3 / ATM / 424B5 — cut that position 50% same day.</li>
          <li>Any name 10x's from entry — sell 50%, let the rest ride.</li>
          <li>More than 2 cron-triggered trades in any 12-month window — shut down the weekly cron. Barber-Odean says monitoring is net-negative for retail; when the evidence shows up in this book, we stop.</li>
        </ul>
      </section>

      <section className="trench p-5">
        <h2 className="text-xl font-serif">What this site is not</h2>
        <div className="ink-rule my-2" />
        <p className="text-[16px] leading-relaxed">
          Not a signal service. Not a newsletter. Not a community. Not investment advice. The portfolio is too small to copy and the method is too slow to trade. This is one person thinking in public with real money on a 10-year horizon, so that a future version of himself has a legible record of the reasoning — not just the P&L.
        </p>
      </section>
    </article>
  );
}
