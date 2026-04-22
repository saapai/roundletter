import type { Metadata } from "next";
import { getLetter, getPortfolio } from "@/lib/data";
import { renderMarkdown } from "@/lib/md";
import ViewTracker from "@/components/ViewTracker";
import ViewsBadge from "@/components/ViewsBadge";
import AgentsLegend from "@/components/AgentsLegend";

export const metadata: Metadata = {
  title: "Round 0 — the pre-mortem · aureliex",
  description:
    "the pre-mortem, filed before i fail. $3,453 → $100,000 by my birthday. five ai agents. no job. one public logbook.",
  openGraph: {
    title: "Round 0 — the pre-mortem",
    description:
      "$3,453 → $100,000 by my birthday. five ai agents. no job. one public logbook. the pre-mortem, filed before i fail.",
    url: "https://aureliex.com/letters/round-0",
    siteName: "aureliex",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Round 0 — the pre-mortem",
    description:
      "$3,453 → $100,000 by my birthday. five ai agents. the pre-mortem, filed before i fail.",
    creator: "@saapai",
  },
};

export default function Round0Page() {
  const letter = getLetter("round-0");
  const p = getPortfolio();
  if (!letter) return <div>letter not found</div>;
  return (
    <article className="article">
      <div className="eyebrow">Round 0 · the pre-mortem · {letter.frontmatter.date}</div>
      <AgentsLegend />
      <div dangerouslySetInnerHTML={{ __html: renderMarkdown(letter.body) }} />
      <div className="byline">by {p.author?.name ?? "saapai"}</div>
      <div className="meta-chips">
        <ViewsBadge slugs={["round-0"]} mode="per-slug" />
      </div>
      <ViewTracker slug="round-0" />
    </article>
  );
}
