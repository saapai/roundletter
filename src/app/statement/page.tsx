import type { Metadata } from "next";
import { HUNT_PHONE_DISPLAY, HUNT_PHONE_SMS } from "@/lib/hunt";
import { fmtMoneyCents } from "@/lib/portfolio-live";
import { getPortfolioData } from "@/lib/portfolio-aggregate";
import s from "./statement.module.css";

// saathvikpai.com serves this page at its root (see src/middleware.ts).
// It's the clean, minimal identity surface — a compact statement + the
// links into aureliex.com where the real document lives. The longer
// "panel convened on myself" piece is preserved at /statement/panel.

// Live link-preview: every share shows the current $ total per
// memory/feedback_live_link_metadata.md.
export async function generateMetadata(): Promise<Metadata> {
  const data = await getPortfolioData();
  const liveTotal = `$${Math.round(data.total).toLocaleString("en-US")}`;
  const pct = (data.total / data.goal) * 100;
  const desc = `${liveTotal} → $100,000 by 21 jun. ${pct.toFixed(2)}% of goal. one account, real money, on the page before each trade clears.`;
  return {
    title: `saathvik pai · ${liveTotal} → $100,000`,
    description: desc,
    openGraph: {
      title: `saathvik pai · ${liveTotal}`,
      description: desc,
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `saathvik pai · ${liveTotal}`,
      description: desc,
      creator: "@saapai",
    },
  };
}

const GOAL = 100_000;

export default async function Statement() {
  // Whole-bank total (personal + external + art + prediction), not just stocks.
  const data = await getPortfolioData();
  const total = data.total;
  const pct = (total / GOAL) * 100;

  // Days remaining to 21 june goal
  const daysToGoal = Math.max(
    0,
    Math.ceil(
      (Date.parse("2026-06-21T00:00:00-07:00") - Date.now()) / 86_400_000,
    ),
  );

  return (
    <main className={s.root}>
      <article className={s.wrap}>
        <header className={s.masthead}>
          <div className={s.handle}>saathvik pai · saapai · nineteen · salt lake</div>
        </header>

        {/* Pre-mortem line is the cover. Display size, not body. */}
        <p className={s.lede}>
          <em>
            everyone comes here looking for a résumé.
          </em>
          <br />
          <em>
            i publish a pre&#8209;mortem instead.
          </em>
        </p>

        {/* One number, not three boxed cards. */}
        <section className={s.bigNum} aria-label="the wager">
          <div className={s.bigNumFig}>
            {fmtMoneyCents(total)}
            <span className={s.bigNumArrow}> → </span>
            <span className={s.bigNumGoal}>$100,000</span>
          </div>
          <div className={s.bigNumMeta}>
            <span>{pct.toFixed(2)}% of goal</span>
            <span className={s.bigNumSep}>·</span>
            <span>T−{daysToGoal} days</span>
            <span className={s.bigNumSep}>·</span>
            <span>21 june · birthday</span>
          </div>
        </section>

        <p className={s.proseLede}>
          <a className={s.link} href="https://aureliex.com">aureliex.com</a>
          {" "}— one account, real money, on the page before each trade clears. five ai agents debate every decision and file it as a sealed prediction.
        </p>

        {/* Big chunky room links — visually inviting, no // code-comment headers. */}
        <nav className={s.rooms} aria-label="enter">
          <a href="https://aureliex.com/portfolio" className={s.room}>
            <span className={s.roomEy}>01</span>
            <span className={s.roomName}>the bank</span>
            <span className={s.roomMeta}>live · daily marks</span>
          </a>
          <a href="https://aureliex.com/portfolio/art" className={s.room}>
            <span className={s.roomEy}>02</span>
            <span className={s.roomName}>the art</span>
            <span className={s.roomMeta}>15 pieces · auction</span>
          </a>
          <a href="https://aureliex.com/letters/round-0" className={s.room}>
            <span className={s.roomEy}>03</span>
            <span className={s.roomName}>round 0</span>
            <span className={s.roomMeta}>the article</span>
          </a>
          <a href="https://aureliex.com/archives" className={s.room}>
            <span className={s.roomEy}>04</span>
            <span className={s.roomName}>archives</span>
            <span className={s.roomMeta}>eggs included</span>
          </a>
        </nav>

        <p className={s.reach}>
          <a className={s.link} href={HUNT_PHONE_SMS}>text {HUNT_PHONE_DISPLAY}</a>
          {" "}— stakes, offers, submissions, bets.
        </p>

        <footer className={s.foot}>
          <p className={s.sig}>— saapai</p>
        </footer>
      </article>
    </main>
  );
}
