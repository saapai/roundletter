import { getTrades } from "@/lib/data";

export default function TradesPage() {
  const trades = getTrades().slice().sort((a, b) => b.ts.localeCompare(a.ts));
  return (
    <article className="article page">
      <div className="eyebrow">Trades · timestamped receipts</div>
      <h1 style={{ textAlign: "center" }}>Trades</h1>
      <p className="deck">Every buy, sell, and trim with a rationale. Nothing hidden, nothing smoothed.</p>

      <div className="trades">
        {trades.map((t, i) => {
          const action = t.action.toLowerCase() as "buy" | "sell" | "trim";
          return (
            <div key={i} className={`trade-row trade-${action}`}>
              <div className="trade-head">
                <span className="trade-date">{t.ts.replace("T", " ").slice(0, 16)}</span>
                <span className={`trade-action action-${action}`}>{t.action}</span>
                <span className="trade-ticker">{t.ticker}</span>
                <span className="trade-qty">{t.qty} sh</span>
                {t.price != null && <span className="trade-price">@ ${t.price}</span>}
                {typeof t.pnl_realized_approx === "number" && (
                  <span className={`trade-pnl ${t.pnl_realized_approx >= 0 ? "pnl-pos" : "pnl-neg"}`}>
                    {t.pnl_realized_approx >= 0 ? "+" : ""}${t.pnl_realized_approx}
                  </span>
                )}
              </div>
              <div className="trade-rationale">{t.rationale}</div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
