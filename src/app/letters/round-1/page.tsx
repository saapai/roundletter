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
    <article className="article">
      <div className="eyebrow">Round 1 · what the attention built · {letter.frontmatter.date}</div>
      <AgentsLegend />
      <div dangerouslySetInnerHTML={{ __html: renderMarkdown(letter.body) }} />
      <div className="byline">by {p.author?.name ?? "saapai"}</div>
      <div className="meta-chips">
        <ViewsBadge slugs={["round-1"]} mode="per-slug" />
      </div>
      <ViewTracker slug="round-1" />
    </article>
  );
}
