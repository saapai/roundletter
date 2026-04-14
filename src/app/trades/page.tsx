import { getTrades } from "@/lib/data";

export default function TradesPage() {
  const trades = getTrades().slice().sort((a,b)=> b.ts.localeCompare(a.ts));
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-serif">Trades</h1>
        <p className="text-sm text-graphite mt-1">Timestamped receipts. Every buy, sell, and trim with a rationale.</p>
      </header>
      <div className="ink-rule" />
      <ul className="space-y-2">
        {trades.map((t, i) => (
          <li key={i} className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-5 font-mono text-sm border-b hairline pb-2">
            <span className="text-graphite text-xs w-44 shrink-0">{t.ts.replace("T"," ").slice(0, 16)}</span>
            <span className={`w-14 shrink-0 font-bold ${t.action === "BUY" ? "text-moss" : t.action === "SELL" ? "text-rust" : "text-graphite"}`}>{t.action}</span>
            <span className="w-14 shrink-0">{t.ticker}</span>
            <span className="w-24 shrink-0">{t.qty} sh</span>
            <span className="w-20 shrink-0">{t.price ? `@ $${t.price}` : ""}</span>
            <span className="text-graphite italic">{t.rationale}</span>
            {typeof t.pnl_realized_approx === "number" && (
              <span className={`ml-auto ${t.pnl_realized_approx >= 0 ? "text-moss" : "text-rust"}`}>{t.pnl_realized_approx >= 0 ? "+" : ""}${t.pnl_realized_approx}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
