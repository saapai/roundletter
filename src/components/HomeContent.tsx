"use client";
import { useEffect, useState, useRef } from "react";
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

function fmtMoney(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function CountUp({ target, prefix = "$", duration = 2000 }: { target: number; prefix?: string; duration?: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = Date.now();
          const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(target * eased));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref}>
      {prefix}{value.toLocaleString("en-US")}
    </span>
  );
}

function useScrollReveal() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

export default function HomeContent({
  totalNow, baseline, daysToBirthday, hashShort,
  stakesOutstanding, eggEquity, holdings, pendingCash,
}: Props) {
  const gainPct = baseline > 0 ? ((totalNow - baseline) / baseline) * 100 : 0;
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [tickerLoaded, setTickerLoaded] = useState(false);

  // Fetch live prices for the ticker
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
        setTickerLoaded(true);
      })
      .catch(() => {});
  }, [holdings]);

  const studioLine = useScrollReveal();
  const roomsSection = useScrollReveal();
  const capSection = useScrollReveal();
  const sealSection = useScrollReveal();

  return (
    <div className="hx">
      {/* ═══ § 1 · HERO · full viewport ═══ */}
      <section className="hx-hero">
        <div className="hx-hero-bg" />
        <div className="hx-hero-content">
          <p className="hx-hero-eyebrow">aureliex</p>
          <h1 className="hx-hero-wager">
            <span className="hx-hero-from">$3,453</span>
            <span className="hx-hero-arrow">→</span>
            <span className="hx-hero-to">$100,000</span>
          </h1>
          <div className="hx-hero-live">
            <span className="hx-hero-now">
              <CountUp target={Math.round(totalNow)} />
              <span className="hx-hero-now-label"> now</span>
            </span>
            <span className="hx-hero-sep">·</span>
            <span className={`hx-hero-pct ${gainPct >= 0 ? "up" : "down"}`}>
              {gainPct >= 0 ? "+" : ""}{gainPct.toFixed(1)}%
            </span>
            <span className="hx-hero-sep">·</span>
            <span className="hx-hero-days">T−{daysToBirthday}d</span>
          </div>
          {/* "If you had invested" stat */}
          <div className="hx-hero-ifyou">
            <span className="hx-hero-ifyou-label">if you had invested $100 at the start</span>
            <span className="hx-hero-ifyou-value">
              ${baseline > 0 ? Math.round(100 * (totalNow / baseline)).toLocaleString("en-US") : "—"} today
            </span>
          </div>
          <div className="hx-hero-seal">
            sealed · reveal 21 jun · {hashShort}···
          </div>
        </div>
        <div className="hx-hero-scroll-hint" aria-hidden="true">
          <span />
        </div>
      </section>

      {/* ═══ § 2 · STUDIO LINE ═══ */}
      <section
        className={`hx-studio ${studioLine.visible ? "is-visible" : ""}`}
        ref={studioLine.ref as any}
      >
        <p className="hx-studio-line">aureliex is a publicly-owned studio.</p>
        <p className="hx-studio-product">
          the product is <em>green credit</em> — redeemable on demand.
        </p>
        <p className="hx-studio-guarantee">
          personally guaranteed by saapai. sixty seconds. Venmo or Zelle.
        </p>
        <div className="hx-studio-ctas">
          <Link href="/buy" className="hx-cta-primary">$10 to start →</Link>
          <Link href="/green-credit" className="hx-cta-ghost">how it works</Link>
        </div>
      </section>

      {/* ═══ § 3 · THE ROOMS ═══ */}
      <section
        className={`hx-rooms ${roomsSection.visible ? "is-visible" : ""}`}
        ref={roomsSection.ref as any}
      >
        <div className="hx-rooms-grid">
          {[
            { href: "/art", name: "art", meta: "auction · floor $100", accent: "#C44325" },
            { href: "/prediction", name: "prediction", meta: "kalshi + poly · live", accent: "#4A7FA5" },
            { href: "/stocks", name: "investments", meta: "10 positions", accent: "#F5B740" },
            { href: "/panel", name: "the panel", meta: "five-agent AI", accent: "#5CAF6A" },
            { href: "/letters/round-1", name: "the letter", meta: "round 1", accent: "#9B2A4D" },
          ].map((room, i) => (
            <Link
              key={room.href}
              href={room.href}
              className="hx-room"
              style={{
                "--room-accent": room.accent,
                "--room-delay": `${i * 100}ms`,
              } as React.CSSProperties}
            >
              <span className="hx-room-accent" aria-hidden="true" />
              <span className="hx-room-name">{room.name}</span>
              <span className="hx-room-meta">{room.meta}</span>
              <span className="hx-room-arrow">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══ § 4 · CAP TABLE ═══ */}
      <section
        className={`hx-cap ${capSection.visible ? "is-visible" : ""}`}
        ref={capSection.ref as any}
      >
        <div className="hx-cap-grid">
          <div className="hx-cap-item">
            <span className="hx-cap-label">apparatus</span>
            <span className="hx-cap-value"><CountUp target={Math.round(totalNow)} /></span>
          </div>
          <div className="hx-cap-item">
            <span className="hx-cap-label">stakes outstanding</span>
            <span className="hx-cap-value">${stakesOutstanding}</span>
          </div>
          <div className="hx-cap-item hx-cap-eggs">
            <span className="hx-cap-label">hunt eggs paid</span>
            <span className="hx-cap-value">${eggEquity}</span>
          </div>
          <div className="hx-cap-item">
            <span className="hx-cap-label">countdown</span>
            <span className="hx-cap-value">T−{daysToBirthday}d</span>
          </div>
        </div>
        <div className="hx-cap-links">
          <Link href="/buy">the door is open</Link>
          <span className="hx-cap-dot">·</span>
          <Link href="/studio">the ledger is public</Link>
        </div>
      </section>

      {/* ═══ § 5 · LIVE TICKER ═══ */}
      {tickerLoaded && (
        <section className="hx-ticker">
          <div className="hx-ticker-track">
            <div className="hx-ticker-list">
              {holdings.map((h) => {
                const px = prices[h.ticker];
                const val = px ? h.shares * px : h.entry_value;
                const delta = val - h.entry_value;
                const pct = h.entry_value > 0 ? (delta / h.entry_value) * 100 : 0;
                const dir = pct > 0.5 ? "up" : pct < -0.5 ? "down" : "";
                return (
                  <span key={h.ticker} className={`hx-ticker-item ${dir}`}>
                    <span className="hx-ticker-sym">{h.ticker}</span>
                    <span className="hx-ticker-price">${Math.round(val)}</span>
                    <span className="hx-ticker-pct">
                      {pct >= 0 ? "+" : ""}{pct.toFixed(1)}%
                    </span>
                  </span>
                );
              })}
            </div>
            <div className="hx-ticker-list" aria-hidden="true">
              {holdings.map((h) => {
                const px = prices[h.ticker];
                const val = px ? h.shares * px : h.entry_value;
                const delta = val - h.entry_value;
                const pct = h.entry_value > 0 ? (delta / h.entry_value) * 100 : 0;
                const dir = pct > 0.5 ? "up" : pct < -0.5 ? "down" : "";
                return (
                  <span key={h.ticker} className={`hx-ticker-item ${dir}`}>
                    <span className="hx-ticker-sym">{h.ticker}</span>
                    <span className="hx-ticker-price">${Math.round(val)}</span>
                    <span className="hx-ticker-pct">
                      {pct >= 0 ? "+" : ""}{pct.toFixed(1)}%
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══ § 6 · THE SEAL ═══ */}
      <section
        className={`hx-seal ${sealSection.visible ? "is-visible" : ""}`}
        ref={sealSection.ref as any}
      >
        <p className="hx-seal-title">sealed · 5 claims · revealing 21 jun 18:00 PT</p>
        <p className="hx-seal-hash">{hashShort}············</p>
        <div className="hx-seal-links">
          <Link href="/letters/round-1">read the letter</Link>
          <Link href="/party">the party</Link>
          <Link href="/sealed/impossible">verify the seal</Link>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="hx-footer">
        <nav className="hx-footer-nav">
          <Link href="/art">art</Link>
          <Link href="/prediction">prediction</Link>
          <Link href="/stocks">investments</Link>
          <Link href="/panel">panel</Link>
          <Link href="/buy">buy</Link>
          <Link href="/eggs">archives</Link>
        </nav>
        <p className="hx-footer-credit">
          aureliex.com · real money · published in full · not investment advice
        </p>
      </footer>
    </div>
  );
}
