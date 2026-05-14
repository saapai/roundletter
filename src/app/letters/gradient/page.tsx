import type { Metadata } from "next";
import { getLetter, getPortfolio } from "@/lib/data";
import { renderMarkdown } from "@/lib/md";
import ViewTracker from "@/components/ViewTracker";
import ViewsBadge from "@/components/ViewsBadge";

export const metadata: Metadata = {
  title: "The Gradient — aureliex",
  description:
    "One formula runs the portfolio, the memory architecture, and — if you let it — a life.",
  openGraph: {
    title: "The Gradient",
    description:
      "One formula runs the portfolio, the memory architecture, and a life. This is the formula.",
    url: "https://aureliex.com/letters/gradient",
    siteName: "aureliex",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Gradient",
    description:
      "One formula. The portfolio, the memory system, and the life. Same algorithm.",
    creator: "@saapai",
  },
};

export default function GradientPage() {
  const letter = getLetter("gradient");
  const p = getPortfolio();
  if (!letter) return <div>letter not found</div>;
  return (
    <article className="article">
      <div className="eyebrow">
        The Gradient &middot; {letter.frontmatter.date}
      </div>
      <div dangerouslySetInnerHTML={{ __html: renderMarkdown(letter.body) }} />
      <div className="byline">by {p.author?.name ?? "saapai"}</div>
      <div className="meta-chips">
        <ViewsBadge slugs={["gradient"]} mode="per-slug" />
      </div>
      <ViewTracker slug="gradient" />
    </article>
  );
}
