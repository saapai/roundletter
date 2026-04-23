import type { Metadata } from "next";
import Link from "next/link";
import { HUNT_PHONE_DISPLAY, HUNT_PHONE_SMS } from "@/lib/hunt";
import s from "./statement.module.css";

// saathvikpai.com serves this page at its root (see src/middleware.ts).
// It's the clean, minimal identity surface — a compact statement + the
// links into aureliex.com where the real document lives. The longer
// "panel convened on myself" piece is preserved at /statement/panel.

export const metadata: Metadata = {
  title: "saathvik pai · saapai",
  description:
    "nineteen. $3,453.83 + a birthday + no job. building aureliex.com — the portfolio kept in public.",
  openGraph: {
    title: "saathvik pai · saapai",
    description:
      "nineteen. $3,453.83 + a birthday + no job. building aureliex.com.",
    type: "profile",
  },
};

export default function Statement() {
  return (
    <main className={s.root}>
      <article className={s.wrap}>
        <header className={s.masthead}>
          <h1 className={s.name}>
            saathvik pai<span className={s.dot}>.</span>
          </h1>
          <div className={s.handle}>saapai · nineteen · salt lake</div>
        </header>

        <p className={s.lede}>
          <em>
            everyone comes here looking for a résumé. i publish a
            pre&#8209;mortem instead.
          </em>
        </p>

        <div className={s.vitals}>
          <div className={s.vital}>
            <span className={s.vitalK}>baseline</span>
            <span className={s.vitalV}>$3,453.83</span>
            <span className={s.vitalS}>sealed 12 apr 2026</span>
          </div>
          <div className={s.vital}>
            <span className={s.vitalK}>goal</span>
            <span className={s.vitalV}>$100,000</span>
            <span className={s.vitalS}>by 21 june · birthday</span>
          </div>
          <div className={s.vital}>
            <span className={s.vitalK}>stake</span>
            <span className={s.vitalV}>27×</span>
            <span className={s.vitalS}>in two months · no job</span>
          </div>
        </div>

        <section className={s.block}>
          <div className={s.kicker}>// the project</div>
          <p>
            <a className={s.link} href="https://aureliex.com">aureliex.com</a>
            {" "}— a portfolio experiment kept in public. five ai agents debate every decision and file it as a sealed prediction. one product: <strong>green credit</strong>. every trade, debate, and bet on the record. the ceremony closes on 21 june.
          </p>
        </section>

        <section className={s.block}>
          <div className={s.kicker}>// where to start</div>
          <ul className={s.links}>
            <li><a href="https://aureliex.com">aureliex.com</a><em>the document</em></li>
            <li><a href="https://aureliex.com/green-credit">green credit</a><em>the pitch</em></li>
            <li><a href="https://aureliex.com/positions">positions</a><em>the book, live</em></li>
            <li><a href="https://aureliex.com/argument">argument</a><em>the panel, live</em></li>
            <li><a href="https://aureliex.com/let-down">let down</a><em>the essay · pre-mortem</em></li>
            <li><a href="https://aureliex.com/6969#hunt">the hunt</a><em>thirteen eggs · three pay</em></li>
            <li><Link href="/statement/panel">a personal statement, by panel</Link><em>the longer read</em></li>
          </ul>
        </section>

        <section className={s.block}>
          <div className={s.kicker}>// reach</div>
          <p>
            <a className={s.link} href={HUNT_PHONE_SMS}>text {HUNT_PHONE_DISPLAY}</a>{" "}
            — the most reliable way. stakes, offers, submissions, and
            bets all settle by text.
          </p>
        </section>

        <footer className={s.foot}>
          <p className={s.coda}>
            <em>the counter culture is here.</em>
          </p>
          <p className={s.codaTwo}>
            <em>the best you can do is watch.</em>
          </p>
          <p className={s.sig}>— saapai</p>
        </footer>
      </article>
    </main>
  );
}
