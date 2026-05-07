"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Props = {
  totalNow: number;
  baseline: number;
  daysToBirthday: number;
  hashShort: string;
  stakesOutstanding: string;
  eggEquity: string;
  holdings: Array<{ ticker: string; shares: number; entry_value: number }>;
  pendingCash: number;
};

function LiveTotal({ holdings, pendingCash }: { holdings: Props["holdings"]; pendingCash: number }) {
  const [total, setTotal] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    let alive = true;
    const pull = async () => {
      try {
        const r = await fetch("/api/prices", { cache: "no-store" });
        if (!r.ok || !alive) return;
        const j = await r.json();
        if (!j?.hasData || !alive) return;
        let sum = pendingCash;
        for (const h of holdings) {
          const s = j.data[h.ticker];
          if (s?.closes?.length > 0) sum += h.shares * s.closes[s.closes.length - 1];
          else sum += h.entry_value;
        }
        setTotal((prev) => {
          if (prev !== null && Math.round(prev) !== Math.round(sum)) {
            setFlash(true);
            setTimeout(() => setFlash(false), 300);
          }
          return sum;
        });
      } catch {}
    };
    pull();
    const id = setInterval(pull, 30_000);
    return () => { alive = false; clearInterval(id); };
  }, [holdings, pendingCash]);

  if (total === null) return <span className="hx-live">—</span>;
  return (
    <span className={`hx-live ${flash ? "hx-live--flash" : ""}`}>
      ${Math.round(total).toLocaleString("en-US")}
    </span>
  );
}

function TickerStrip({ holdings }: { holdings: Props["holdings"] }) {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/prices", { cache: "no-store" })
      .then((r) => r.ok ? r.json() : null)
      .then((j) => {
        if (!j?.hasData) return;
        const next: Record<string, number> = {};
        for (const h of holdings) {
          const s = j.data[h.ticker];
          if (s?.closes?.length > 0) next[h.ticker] = s.closes[s.closes.length - 1];
        }
        setPrices(next);
        setLoaded(true);
      })
      .catch(() => {});
  }, [holdings]);

  if (!loaded) return null;

  const items = holdings.map((h) => {
    const px = prices[h.ticker];
    const val = px ? h.shares * px : h.entry_value;
    const pct = h.entry_value > 0 ? ((val - h.entry_value) / h.entry_value) * 100 : 0;
    const dir = pct > 0.5 ? "up" : pct < -0.5 ? "dn" : "";
    return (
      <span key={h.ticker} className={`hx-tick ${dir}`}>
        {h.ticker} ${Math.round(px || 0)} {pct >= 0 ? "+" : ""}{pct.toFixed(1)}%
      </span>
    );
  });

  return (
    <div className="hx-ticker">
      <div className="hx-ticker-track">
        <div className="hx-ticker-list">{items}</div>
        <div className="hx-ticker-list" aria-hidden="true">{items}</div>
      </div>
    </div>
  );
}

export default function HomeContent({
  totalNow, baseline, daysToBirthday, hashShort,
  stakesOutstanding, eggEquity, holdings, pendingCash,
}: Props) {
  const gainPct = baseline > 0 ? ((totalNow - baseline) / baseline) * 100 : 0;
  const ifYou = baseline > 0 ? Math.round(100 * (totalNow / baseline)) : null;

  return (
    <div className="hx">
      {/* ═══ HERO · 100vh · image background ═══ */}
      <section className="hx-hero">
        <img
          src="/hero/cityscape.png"
          alt=""
          className="hx-hero-img"
          aria-hidden="true"
        />
        <div className="hx-hero-overlay" aria-hidden="true" />

        {/* Nav — top right, over the city */}
        <nav className="hx-nav">
          <Link href="/art">art</Link>
          <Link href="/prediction">prediction</Link>
          <Link href="/stocks">investments</Link>
          <Link href="/panel">panel</Link>
          <Link href="/buy">buy</Link>
        </nav>

        {/* Content — left-aligned over the dark zone */}
        <div className="hx-stage">
          <p className="hx-mark">aureliex</p>

          <h1 className="hx-wager">
            <span className="hx-wager-past">$3,453</span>
            <span className="hx-wager-arrow">→</span>
            <span className="hx-wager-future">$100,000</span>
          </h1>

          <div className="hx-now-row">
            <LiveTotal holdings={holdings} pendingCash={pendingCash} />
            <span className="hx-now-label">now</span>
            <span className="hx-sep">·</span>
            <span className={`hx-pct ${gainPct >= 0 ? "up" : "dn"}`}>
              {gainPct >= 0 ? "+" : ""}{gainPct.toFixed(1)}%
            </span>
            <span className="hx-sep">·</span>
            <span className="hx-days">T−{daysToBirthday}d</span>
          </div>

          <p className="hx-thesis">
            a publicly-owned studio. green credit —
            redeemable on demand, personally guaranteed
            in sixty seconds via Venmo or Zelle.
          </p>

          {ifYou && ifYou !== 100 && (
            <p className="hx-ifyou">
              $100 invested at the start → ${ifYou} today
            </p>
          )}

          <Link href="/buy" className="hx-cta">$10 to start →</Link>
        </div>

        <div className="hx-scroll-cue" aria-hidden="true"><span /></div>
      </section>

      {/* ═══ PROOF · below fold ═══ */}
      <section className="hx-proof">
        <TickerStrip holdings={holdings} />

        <div className="hx-proof-inner">
          <dl className="hx-cap">
            <div><dt>apparatus</dt><dd>${Math.round(totalNow).toLocaleString("en-US")}</dd></div>
            <div><dt>stakes</dt><dd>${stakesOutstanding}</dd></div>
            <div><dt>hunt eggs paid</dt><dd>${eggEquity}</dd></div>
            <div><dt>countdown</dt><dd>T−{daysToBirthday}d</dd></div>
          </dl>

          <p className="hx-seal">
            <span className="hx-seal-label">sealed · 5 claims · reveal 21 jun 18:00 PT</span>
            <code className="hx-seal-hash">{hashShort}············</code>
            <Link href="/sealed/impossible" className="hx-seal-verify">verify</Link>
          </p>

          <div className="hx-proof-links">
            <Link href="/studio">the ledger is public</Link>
            <span className="hx-dot">·</span>
            <Link href="/letters/round-1">read the letter</Link>
            <span className="hx-dot">·</span>
            <Link href="/party">the party</Link>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="hx-foot">
        <nav>
          <Link href="/art">art</Link>
          <Link href="/prediction">prediction</Link>
          <Link href="/stocks">investments</Link>
          <Link href="/panel">panel</Link>
          <Link href="/buy">buy</Link>
          <Link href="/eggs">archives</Link>
        </nav>
        <small>aureliex.com · real money · published in full · not investment advice</small>
      </footer>
    </div>
  );
}
