import type { Metadata } from "next";
import { getLetter, getPortfolio } from "@/lib/data";
import { renderMarkdown } from "@/lib/md";
import ViewTracker from "@/components/ViewTracker";
import ViewsBadge from "@/components/ViewsBadge";
import AgentsLegend from "@/components/AgentsLegend";

export const metadata: Metadata = {
  title: "Round 1 — what the attention built · aureliex",
  description:
    "twenty-five days in. +25% in 25 days. annualized ~2,500%. the products are real. the odds have not changed.",
  openGraph: {
    title: "Round 1 — what the attention built",
    description:
      "+25% in 25 days. annualized ~2,500% — 250x the S&P. the products are real. the odds have not changed.",
    url: "https://aureliex.com/letters/round-1",
    siteName: "aureliex",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Round 1 — what the attention built",
    description:
      "+25% in 25 days. annualized ~2,500%. five ai agents. 37 pages. none planned.",
    creator: "@saapai",
  },
};

export default function Round1Page() {
  const letter = getLetter("round-1");
  const p = getPortfolio();
  if (!letter) return <div>letter not found</div>;
  return (
    <>
      {/* ═══ CINEMATIC HERO ═══ */}
      <section className="letter-hero">
        <div className="letter-hero-bg" />
        <div className="letter-hero-overlay" />
        <span className="letter-hero-side letter-hero-date">07 MAY 2026</span>
        <span className="letter-hero-side letter-hero-round">ROUND 1</span>
        <div className="letter-hero-center">
          <span className="letter-hero-tag">AURELIEX · LETTERS</span>
          <h1 className="letter-hero-title">
            What the<br />Attention Built
          </h1>
          <p className="letter-hero-sub">
            +25% in 25 days. Annualized ~2,500%.
            The products are real. The odds have not changed.
          </p>
        </div>
      </section>

      {/* ═══ ARTICLE ═══ */}
      <article className="article">
        <AgentsLegend />
        <div dangerouslySetInnerHTML={{ __html: renderMarkdown(letter.body) }} />
        <div className="byline">by {p.author?.name ?? "saapai"}</div>
        <nav className="letter-exit">
          <Link href="/invest" className="letter-exit-primary">The wager →</Link>
          <span className="letter-exit-sep">·</span>
          <Link href="/" className="letter-exit-link">home</Link>
          <span className="letter-exit-sep">·</span>
          <Link href="/argument" className="letter-exit-link">the argument</Link>
          <span className="letter-exit-sep">·</span>
          <Link href="/positions" className="letter-exit-link">positions</Link>
        </nav>
        <div className="meta-chips">
          <ViewsBadge slugs={["round-1"]} mode="per-slug" />
        </div>
        <ViewTracker slug="round-1" />
      </article>
    </>
  );
}
