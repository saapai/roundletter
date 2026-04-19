import Link from "next/link";
import { getPortfolio } from "@/lib/data";
import PortfolioChart from "@/components/PortfolioChart";
import BirthdayCountdown from "@/components/BirthdayCountdown";
import BettableOdds from "@/components/BettableOdds";
import ViewTracker from "@/components/ViewTracker";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import LiveThinking from "@/components/LiveThinking";
import HookTags from "@/components/HookTags";
import MarxCoda from "@/components/MarxCoda";
import MarketTeaser from "@/components/MarketTeaser";
import ChartScrubber from "@/components/ChartScrubber";

export default function Home() {
  const p = getPortfolio();
  const baselineTs = Date.parse(
    `${p.baseline_date}T${p.baseline_time_et ?? "09:30"}:00-04:00`,
  );
  // Day-scrub math for the YouTube-style progress bar. Baseline → upcoming birthday.
  const now = Date.now();
  const [, bMonth, bDay] = p.birthdate.split("-");
  const yr = new Date().getFullYear();
  const nextBday = Date.parse(`${yr}-${bMonth}-${bDay}T00:00:00-04:00`);
  const birthdayTs = nextBday > now ? nextBday : Date.parse(`${yr + 1}-${bMonth}-${bDay}T00:00:00-04:00`);
  const dayNumber = Math.max(1, Math.ceil((now - baselineTs) / 86_400_000));
  const daysToBirthday = Math.max(0, Math.ceil((birthdayTs - now) / 86_400_000));
  const daysTotal = Math.max(1, Math.ceil((birthdayTs - baselineTs) / 86_400_000));
  const progressPct = Math.min(100, Math.max(0, ((daysTotal - daysToBirthday) / daysTotal) * 100));
  const entryStr = `$${p.account_value_at_entry.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

  return (
    <>
      <YouTubeEmbed
        id="hif5eI5pBxo"
        title="nothing, except everything — Wesley Wang"
        eyebrow="// the film opens"
        position="open"
      />

      <section className="v3-hook">
        <h1 className="v3-hook-line">
          $3,453 <span className="v3-hook-arrow">→</span> $100,000 <span className="v3-hook-break" />by my birthday.
        </h1>
        <p className="v3-hook-sub">
          <span>No job.</span> <span className="v3-hook-sep">·</span> <span>Five AI agents.</span> <span className="v3-hook-sep">·</span> <span>One public book.</span>
        </p>
      </section>

      <section className="v3-hero yt-frame" aria-label="the portfolio — live">
        <header className="yt-head">
          <div className="yt-head-eyebrow">
            <span className="yt-head-play" aria-hidden="true">▶</span>
            <span>now playing · day {dayNumber} · <em>live</em></span>
            <span className="yt-head-countdown">
              <BirthdayCountdown birthdate={p.birthdate} />
            </span>
          </div>
          <h2 className="yt-title">
            {entryStr} <span className="yt-title-arrow">→</span> $100,000 by my birthday
          </h2>
          <div className="yt-channel">
            <span className="yt-channel-avatar" aria-hidden="true">s</span>
            <span className="yt-channel-handle">saapai</span>
            <span className="yt-channel-meta">
              <span>no job</span>
              <span className="yt-dot">·</span>
              <span>{daysToBirthday} days to 100k</span>
            </span>
          </div>
        </header>

        <div className="v3-chart-wrap yt-video">
          <PortfolioChart
            holdings={p.holdings}
            baselineTs={baselineTs}
            accountValueAtEntry={p.account_value_at_entry}
          />
        </div>

        <div className="yt-scrubber" aria-label={`day ${dayNumber} of ${daysTotal}, live`}>
          <span className="yt-scrubber-play" aria-hidden="true">▶</span>
          <div className="yt-scrubber-bar">
            <div className="yt-scrubber-fill" style={{ width: `${progressPct}%` }} />
            <div className="yt-scrubber-thumb" style={{ left: `${progressPct}%` }} aria-hidden="true" />
          </div>
          <span className="yt-scrubber-time">
            day {dayNumber} <span className="yt-scrubber-sep">/</span> {daysTotal} · <em>live</em>
          </span>
        </div>
      </section>

      <ChartScrubber
        entryValue={p.account_value_at_entry}
        startDate={p.baseline_date}
        birthdate={p.birthdate}
      />

      <LiveThinking />

      <HookTags />

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

      <MarketTeaser />

      <div className="v3-rule" aria-hidden="true" />

      <section className="v3-thesis" aria-label="v3 — the refusal">
        <div className="v3-eyebrow">// v3 · the architectural refusal of the offer</div>
        <p className="v3-thesis-body">
          v0 is the portfolio. v1 is the apparatus. v2 is the new house.
          <strong> v3 is the refusal of the one offer that would kill v2</strong> — the check and the deck that turn the room into a fund.
          No owner. No curator. No fee. No exit.
        </p>
        <p className="v3-thesis-trigger">
          v3 is live the day a sealed prediction is filed <em>against</em> my calibration score — not mine.
        </p>
        <p className="v3-thesis-cta">
          <Link href="/archives">Full derivation in the archives →</Link>
        </p>
      </section>

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
            <Link href="/archives">
              <span className="v3-ll-title">the archives — v0 + v1</span>
              <span className="v3-ll-sub">the prose that got us here · read v3 first, come here after</span>
            </Link>
          </li>
          <li>
            <Link href="/positions">
              <span className="v3-ll-title">positions</span>
              <span className="v3-ll-sub">the book, the hunches, the daily debate · live</span>
            </Link>
          </li>
          <li>
            <Link href="/market">
              <span className="v3-ll-title">the market — green apple vs rotten apple</span>
              <span className="v3-ll-sub">the mechanic · only i can lose · true odds · cashout any time</span>
            </Link>
          </li>
          <li>
            <Link href="/green-credit">
              <span className="v3-ll-title">green credit — the manifesto</span>
              <span className="v3-ll-sub">project 2 · v0 · books → movies → reels → green credit</span>
            </Link>
          </li>
          <li>
            <Link href="/17">
              <span className="v3-ll-title">/17 — the newest iteration</span>
              <span className="v3-ll-sub">quant → artistic trailer · the latest commits land here</span>
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

      <MarxCoda />

      <YouTubeEmbed
        id="ImHpFQSpl2k"
        title="the closing frame"
        eyebrow="// the film closes"
        position="close"
      />

      <ViewTracker slug="home-v3" />
    </>
  );
}
