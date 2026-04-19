import type { Metadata } from "next";
import { getLetter, getPortfolio } from "@/lib/data";
import { renderMarkdown } from "@/lib/md";
import ViewTracker from "@/components/ViewTracker";
import ViewsBadge from "@/components/ViewsBadge";
import AgentsLegend from "@/components/AgentsLegend";

export const metadata: Metadata = {
  title: "The Math \u2014 aureliex",
  description: "The arithmetic behind a 29x. The S&P does 10x in 25 years; this is what the gap actually requires.",
  openGraph: {
    title: "The Math",
    description: "The arithmetic behind a 29x. The S&P does 10x in 25 years; this is what the gap actually requires.",
    url: "https://aureliex.com/letters/math",
    siteName: "aureliex",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Math",
    description: "What a 29x in twelve months actually requires, written down.",
    creator: "@saapai",
  },
};

export default function MathPage() {
  const letter = getLetter("math");
  const p = getPortfolio();
  if (!letter) return <div>letter not found</div>;
  return (
    <article className="article">
      <div className="eyebrow">The Math · {letter.frontmatter.date}</div>
      <AgentsLegend />
      <div dangerouslySetInnerHTML={{ __html: renderMarkdown(letter.body) }} />
      <div className="byline">by {p.author?.name ?? "saapai"}</div>
      <div className="meta-chips">
        <ViewsBadge slugs={["math"]} mode="per-slug" />
      </div>
      <ViewTracker slug="math" />
    </article>
  );
}
