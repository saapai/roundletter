import type { Metadata } from "next";
import { getLetter, getPortfolio } from "@/lib/data";
import { renderMarkdown } from "@/lib/md";
import ViewTracker from "@/components/ViewTracker";
import ViewsBadge from "@/components/ViewsBadge";

export const metadata: Metadata = {
  title: "Tension Field — aureliex",
  description:
    "58 experiments on a $4,097 portfolio. When every analytical system disagrees, the disagreement is the finding.",
  openGraph: {
    title: "Tension Field: 58 Experiments on a $4,097 Portfolio",
    description:
      "When every analytical system disagrees, the disagreement is the finding. A single day of automated research on eight tickers.",
    url: "https://aureliex.com/letters/tension-field",
    siteName: "aureliex",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tension Field",
    description:
      "58 experiments. 7 research agents. 16 scripts. One portfolio. One day.",
    creator: "@saapai",
  },
};

export default function TensionFieldPage() {
  const letter = getLetter("tension-field");
  const p = getPortfolio();
  if (!letter) return <div>letter not found</div>;
  return (
    <article className="article">
      <div className="eyebrow">
        Tension Field &middot; {letter.frontmatter.date}
      </div>
      <div dangerouslySetInnerHTML={{ __html: renderMarkdown(letter.body) }} />
      <div className="byline">by {p.author?.name ?? "saapai"}</div>
      <div className="meta-chips">
        <ViewsBadge slugs={["tension-field"]} mode="per-slug" />
      </div>
      <ViewTracker slug="tension-field" />
    </article>
  );
}
