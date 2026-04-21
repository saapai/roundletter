import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Let Down — aureliex",
  description:
    "The frame the rest of the site is a derivative of. A pre-mortem, after Radiohead, 1997. On the particular disappointment of being carried somewhere and knowing, while being carried, that the motion will stop.",
  openGraph: {
    title: "Let Down",
    description: "The frame the rest of the site is a derivative of.",
    url: "https://aureliex.com/let-down",
    siteName: "aureliex",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Let Down",
    description: "The frame the rest of the site is a derivative of.",
    creator: "@saapai",
  },
};

export default function LetDownPage() {
  return (
    <article className="article letdown">
      <div className="eyebrow">a pre-mortem · an elegy · apr 2026</div>
      <h1>Let Down</h1>
      <div className="byline">after Radiohead · 1997</div>
      <p className="deck">
        Everything on this site is a derivative of a single feeling — just how beautiful and
        unfortunate humanity is.
      </p>

      <hr className="ornament" />

      <p className="lede">
        There is a song from 1997, on an album that was not yet aware of what it was, in which
        Thom Yorke sings about transport. Motorways. Tramlines. Starting and then stopping. He is
        stuck on a bus. He is stuck in a century. He is going to grow wings, he says, as a
        chemical reaction — hysterical and useless. The song is called{" "}
        <em>Let Down</em>.
      </p>

      <p>
        The best songs name the thing the world tries to make you forget. That one names a
        specific texture of being alive: that when you are being carried somewhere, when the
        destination is on its way toward you, when the infrastructure of the century is holding
        you in place — there is a disappointment that does not go away. It is not a
        disappointment about outcome. It is a disappointment built into the being-carried
        itself. You are moving, and so are they, and so is everyone on every motorway in every
        country, and every one of those motions will also stop, and be useless, and the thing
        about the stopping is that it was known to be stopping even while it was moving.
      </p>

      <p>This website is an attempt to take that feeling seriously.</p>

      <p>
        I have $3,453.83. I am trying to turn it into $100,000 by my birthday. The S&amp;P does
        10x in 25 years. I want 29x in 12 months. The gap between what is reasonable and what I
        am asking for is the entire joke and the entire point. The site is the pre-mortem,
        filed before I fail. It is the receipt of an attempt that knew, while it was attempting,
        that it was mostly about the attempting.
      </p>

      <h2>Where the feeling shows up</h2>

      <p>
        Everything else on the site is a derivative of this single feeling, reported from a
        different angle.
      </p>

      <ul>
        <li>
          <Link href="/">apparatus</Link> — the curation engine. shoes, speakers, albums,
          films. tiered into Budget / Mid / Elite, scored 0–96. the act of ranking taste
          while knowing taste is the thing that gets you in the end.
        </li>
        <li>
          <Link href="/positions">positions</Link> — every trade has a thesis, a bull-case, a
          bear-case, a price at entry, and a date. a thesis is a bet against the feeling that
          all theses eventually rot.
        </li>
        <li>
          <Link href="/market">market</Link> — the green apple and the rotten apple. the
          polymarket line next to the private line. two prices on the same fruit.
        </li>
        <li>
          <Link href="/green-credit">green credit</Link> — the public ledger of who shipped
          versus who spoke. the difference is the thing the song is about.
        </li>
        <li>
          <Link href="/green-credit">sp-001</Link> — a sealed prediction. SHA-256 committed
          on April 18 at 4:22 AM, resolving today at 4:20 PM ET. either the threshold is beat or
          it is not. the calibration is the input for sp-002. being let down is baked into the
          design.
        </li>
        <li>
          <Link href="/statement">statement</Link> — a personal statement by panel. five
          agents disagreeing about the same nineteen-year-old. the disagreement is the
          statement.
        </li>
        <li>
          <Link href="/letters/paradigm">the paradigm</Link> — the frame the rest of the
          logbook is written inside. a paradigm is a letter to yourself from before the letter
          was true.
        </li>
      </ul>

      <hr className="ornament" />

      <p>
        If the writing feels quiet, it is because the song is quiet. If the numbers feel too
        big, it is because the song is not about numbers, and the site is about the song.
      </p>

      <hr className="shadow-rule" aria-hidden="true" />

      <p className="lede letdown-coda">
        One day I am going to grow wings. If that line lands on you the way it lands on me,
        you already know what the rest of this site is for.
      </p>

      <div className="byline">
        saapai · 2026-04-20 · the 4:20 window · sp-001 resolves today at 4:20 PM
        ET
      </div>
    </article>
  );
}
