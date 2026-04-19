import type { Metadata } from "next";
import Link from "next/link";
import s from "./keys.module.css";

export const metadata: Metadata = {
  title: "/keys — the hand-off protocol · sigma eta pi at ucla",
  description:
    "The presidency is not the product. The year is. A written, public transfer protocol for Sigma Eta Pi. Inventory, freeze, deprecation clock, alumni clause, first commit, the method, the re-write.",
  openGraph: {
    title: "/keys — the hand-off protocol",
    description: "The presidency is not the product. The year is.",
    url: "https://aureliex.com/keys",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "/keys — the hand-off protocol",
    description: "The presidency is not the product. The year is.",
    creator: "@saapai",
  },
};

export default function KeysPage() {
  return (
    <div className={s.root}>
      {/* ══════════════ HERO ══════════════ */}
      <section className={s.hero}>
        <div className={s.heroGrid} aria-hidden />
        <p className={s.kicker}>/keys · sigma eta pi at ucla · drafted 2026-04-17</p>
        <h1 className={s.heroMain}>
          <em>the presidency is not the product.</em>
        </h1>
        <p className={s.heroAccent}>
          <em>the year is.</em>
        </p>
        <p className={s.heroHint}>↓ the hand-off</p>
      </section>

      {/* ══════════════ PREAMBLE ══════════════ */}
      <section className={s.preamble}>
        <p className={s.preambleEyebrow}>preamble</p>
        <p className={s.preambleBody}>
          Most presidencies are written in the past tense — who did what, for whom. This one is
          written in the future tense — <em>who will inherit, under what protocol.</em> That is
          the only kind of founding that compounds.
        </p>
      </section>

      {/* ══════════════ ARTICLES ══════════════ */}
      <section className={s.articles}>

        <Article num="I" label="what transfers" title="The presidency is not transferred. The arena is.">
          <p>
            The office is temporary. The infrastructure is the inheritance. The next president
            receives, by name, the following artifacts — all readable in source, all re-runnable
            from scratch, all deprecated on a clock.
          </p>
          <ul className={s.articleList}>
            <li><span>rush-react</span><span>the front door for rush</span></li>
            <li><span>sep-ats</span><span>the applicant tracking system</span></li>
            <li><span>sep-ats-checkin</span><span>the event-day SMS layer</span></li>
            <li><span>friday.bot</span><span>the agent that runs friday standups</span></li>
            <li><span>agents.json</span><span>the five-voice panel pattern</span></li>
            <li><span>/keys itself</span><span>re-write Article VII before pledge night</span></li>
          </ul>
        </Article>

        <Article num="II" label="the ninety-day freeze" title="The first ninety days belong to the predecessor.">
          <p>
            For the first ninety days of the next term, the inheritor shall <strong>not</strong>:
            rebrand the wordmark, kill an active rush-cycle pipeline, replace the agent panel,
            or delete <code>/keys</code>.
          </p>
          <p>
            After ninety days — deprecate freely. Nothing is sacred twice. The freeze exists to
            force one full cycle of operating the inherited thing <em>before</em> judging it.
          </p>
        </Article>

        <Article num="III" label="the deprecation clock" title="Things die on a schedule, or they accrete.">
          <ul className={s.articleList}>
            <li><span>rush-react</span><span>sunset 2028 if no commits in six months</span></li>
            <li><span>agent panel</span><span>re-elect every fall pledge night</span></li>
            <li><span>this document</span><span>review every spring quarter</span></li>
            <li><span>the presidency</span><span>one year. never two.</span></li>
          </ul>
          <p className={s.pullquote}>
            <em>accretion is how institutions die slowly enough that no one notices.</em>
          </p>
        </Article>

        <Article num="IV" label="the alumni obligation" title="Membership is not LinkedIn. It is a clause.">
          <p>
            One shipped artifact per year, contributed back to chapter infrastructure.
            <strong> Money is not the obligation. Craft is.</strong>
          </p>
          <p>
            The artifact may be: a tool, a document, a pull request, a workshop, a hire
            brought in-house, a pledge brought to interview, a post-mortem on a shipped
            failure. It must be <em>named, dated, and listed publicly</em> in the chapter
            ledger.
          </p>
          <p>
            Break the clause and you are not in the credits.
          </p>
        </Article>

        <Article num="V" label="the first commit" title="The only move this document prescribes.">
          <p>
            The next president's first act, within seven days of accepting the office, is a
            commit to one of the inherited repos. It must be <strong>public</strong>, it must
            <strong> touch real code</strong> (not a README edit), and it must bear their
            signature in the commit message.
          </p>
          <p>
            That is the proof of the office. The first commit is the only coronation the
            chapter performs.
          </p>
        </Article>

        <Article num="VI" label="the method" title="The method is the medicine.">
          <p>
            Every decision that costs more than <strong>$500</strong> or affects more than
            <strong> ten brothers</strong> must be:
          </p>
          <ul className={s.articleList}>
            <li><span>pre-mortemed</span><span>the failure modes, written before the attempt</span></li>
            <li><span>published</span><span>in the chapter logbook, by the decision date</span></li>
            <li><span>kill-switched</span><span>a stated condition under which we reverse</span></li>
          </ul>
          <p>
            A lost round with a clean logbook is worth more than a won round with no reasoning.
            The logbook is the ballot. The paradigm is the office.
          </p>
        </Article>

        <Article num="VII" label="the re-write clause" title="This document is wrong about something.">
          <p>
            Find it. Re-write it. Ship it. Commit message: <code>keys: article VII, revision N.</code>
          </p>
          <p>
            Every president inherits <em>the authority to re-write Article VII.</em> No article
            is load-bearing enough to survive a year of operating it. If nothing here needs
            changing after twelve months, you were not paying attention.
          </p>
        </Article>

      </section>

      {/* ══════════════ SIGNATURE ══════════════ */}
      <section className={s.signature}>
        <p className={s.signatureMark}><em>saapai</em></p>
        <p className={s.signatureMeta}>
          drafted · april 17, 2026<br />
          sigma eta pi at ucla<br />
          aureliex.com/keys
        </p>
      </section>

      {/* ══════════════ COLOPHON ══════════════ */}
      <aside className={s.colophon}>
        This document was written, edited, and annotated with <em>Claude Opus 4.7</em>.
        Wherever an <em>[editor's note — AI]</em> blockquote appears anywhere on this site,
        that is also me, on the page, in the first person. The disagreement is the statement.
      </aside>

      <nav className={s.backlinks}>
        <Link href="/">← aureliex</Link>
        <Link href="/17?for=keys">↪ the trailer</Link>
        <Link href="/pitch">↪ the pitch</Link>
      </nav>
    </div>
  );
}

function Article({
  num,
  label,
  title,
  children,
}: {
  num: string;
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className={s.article}>
      <div className={s.articleHead}>
        <span className={s.articleNum}>{num}.</span>
        <span className={s.articleLabel}>{label}</span>
        <span className={s.articleRule} />
      </div>
      <h2 className={s.articleTitle}>
        <em>{title}</em>
      </h2>
      <div className={s.articleBody}>{children}</div>
    </article>
  );
}
