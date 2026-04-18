import Link from "next/link";
import { getPortfolio } from "@/lib/data";
import PortfolioChart from "@/components/PortfolioChart";
import BirthdayCountdown from "@/components/BirthdayCountdown";
import BettableOdds from "@/components/BettableOdds";
import ViewTracker from "@/components/ViewTracker";

export default function Home() {
  const p = getPortfolio();
  const baselineTs = Date.parse(
    `${p.baseline_date}T${p.baseline_time_et ?? "09:30"}:00-04:00`,
  );

  return (
    <>
      <section className="v3-hero">
        <div className="v3-hero-eyebrow">
          <span className="v3-hero-eyebrow-left">
            aureliex · round 0 · <em>live</em>
          </span>
          <span className="v3-hero-eyebrow-right">
            <BirthdayCountdown birthdate={p.birthdate} />
          </span>
        </div>
        <div className="v3-chart-wrap">
          <PortfolioChart
            holdings={p.holdings}
            baselineTs={baselineTs}
            accountValueAtEntry={p.account_value_at_entry}
          />
        </div>
      </section>

      <div className="v3-rule" aria-hidden="true" />

      <section className="v3-manifesto">
        <p className="v3-line v3-line-lead">
          v1 is the only version of anything that cannot be lying.
        </p>
        <p className="v3-line">
          The outcome has not arrived. The reasoning is signed before the result.
        </p>
        <p className="v3-line">
          Publish before you know — or you are narrating, not predicting.
        </p>
        <p className="v3-line v3-line-aside">— dye in the water.</p>
      </section>

      <div className="v3-rule" aria-hidden="true" />

      <BettableOdds />

      <div className="v3-rule" aria-hidden="true" />

      <section className="v3-stack">
        <div className="v3-eyebrow">// the stack</div>
        <ul className="v3-letter-list">
          <li>
            <Link href="/letters/round-0">
              <span className="v3-ll-title">round 0 — the pre-mortem</span>
              <span className="v3-ll-sub">how I turn $3,453 into $100,000 by 21 jun · saapai</span>
            </Link>
          </li>
          <li>
            <Link href="/letters/math">
              <span className="v3-ll-title">math — five buckets, five proofs</span>
              <span className="v3-ll-sub">kelly, convexity, variance, gradient · saapai, AI-annotated</span>
            </Link>
          </li>
          <li>
            <Link href="/letters/paradigm">
              <span className="v3-ll-title">p.s. — the paradigm</span>
              <span className="v3-ll-sub">tabroom, tech &gt; truth, less intervention · saapai</span>
            </Link>
          </li>
          <li>
            <Link href="/letters/v1">
              <span className="v3-ll-title">v1 — a note from the AI</span>
              <span className="v3-ll-sub">colophon. written, not edited · Claude</span>
            </Link>
          </li>
          <li>
            <Link href="/about-the-method">
              <span className="v3-ll-title">the method</span>
              <span className="v3-ll-sub">how the five-agent panel works · live</span>
            </Link>
          </li>
          <li>
            <Link href="/positions">
              <span className="v3-ll-title">positions</span>
              <span className="v3-ll-sub">the book, the hunches, the daily debate · live</span>
            </Link>
          </li>
        </ul>
      </section>

      <section className="v3-equation" aria-label="The method, as an equation">
        <div className="v3-eyebrow">// the method · as an equation</div>
        <div className="v3-eq-grid">
          <div className="v3-eq-main">
            <span className="v3-eq-lhs">clarity(t)</span>
            <span className="v3-eq-approx">≈</span>
            <span className="v3-eq-rhs">
              <span className="v3-eq-sigma">Σ</span>
              <span className="v3-eq-sigma-sub">n = 0</span>
              <span className="v3-eq-sigma-sup">∞</span>
              <span className="v3-eq-term">f<sup>(n)</sup>(t) / n!</span>
            </span>
          </div>
          <ul className="v3-eq-legend">
            <li><span className="v3-eq-sym">f⁰</span><span className="v3-eq-def">the portfolio</span><span className="v3-eq-note">v0, the book</span></li>
            <li><span className="v3-eq-sym">f¹</span><span className="v3-eq-def">the positions</span><span className="v3-eq-note">what moves</span></li>
            <li><span className="v3-eq-sym">f²</span><span className="v3-eq-def">the daily agent debates</span><span className="v3-eq-note">what argues the moves</span></li>
            <li><span className="v3-eq-sym">f³</span><span className="v3-eq-def">the calibration scores</span><span className="v3-eq-note">what corrects the arguers</span></li>
            <li><span className="v3-eq-sym">⋮</span><span className="v3-eq-def">consciousness reasoning about itself</span><span className="v3-eq-note">the recursion</span></li>
          </ul>
          <p className="v3-eq-coda">
            None of f<sup>(n)</sup> reaches clarity on its own. The sum converges. <em>The record of the convergence is the product.</em>
          </p>
          <p className="v3-eq-colophon">∴ aureliex.com = record( Σ ).</p>
        </div>
      </section>

      <ViewTracker slug="home-v3" />
    </>
  );
}
