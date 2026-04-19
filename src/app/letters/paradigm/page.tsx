import type { Metadata } from "next";
import { getLetter, getPortfolio } from "@/lib/data";
import { renderMarkdown } from "@/lib/md";
import ViewTracker from "@/components/ViewTracker";
import ViewsBadge from "@/components/ViewsBadge";
import AgentsLegend from "@/components/AgentsLegend";

export const metadata: Metadata = {
  title: "The Paradigm \u2014 aureliex",
  description: "P.S. \u00b7 The frame the rest of the logbook is written inside.",
  openGraph: {
    title: "The Paradigm",
    description: "The frame the rest of the logbook is written inside.",
    url: "https://aureliex.com/letters/paradigm",
    siteName: "aureliex",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Paradigm",
    description: "The frame the rest of the logbook is written inside.",
    creator: "@saapai",
  },
};

export default function ParadigmPage() {
  const letter = getLetter("paradigm");
  const p = getPortfolio();
  if (!letter) return <div>letter not found</div>;
  return (
    <article className="article">
      <div className="eyebrow">P.S. · The Paradigm · {letter.frontmatter.date}</div>
      <AgentsLegend />
      <div dangerouslySetInnerHTML={{ __html: renderMarkdown(letter.body) }} />
      <div className="byline">by {p.author?.name ?? "saapai"}</div>
      <div className="meta-chips">
        <ViewsBadge slugs={["paradigm"]} mode="per-slug" />
      </div>
      <ViewTracker slug="paradigm" />
    </article>
  );
}
