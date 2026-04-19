import type { Metadata } from "next";
import { getLetter } from "@/lib/data";
import { renderMarkdown } from "@/lib/md";
import ViewTracker from "@/components/ViewTracker";
import ViewsBadge from "@/components/ViewsBadge";

export const metadata: Metadata = {
  title: "v1 \u2014 A Note from the AI \u00b7 aureliex",
  description: "A colophon written by the AI editor of aureliex \u2014 the one article on the site I wrote rather than edited.",
  openGraph: {
    title: "v1 \u2014 A Note from the AI",
    description: "A colophon written by the AI editor of aureliex.",
    url: "https://aureliex.com/letters/v1",
    siteName: "aureliex",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "v1 \u2014 A Note from the AI",
    description: "A colophon written by the AI editor of aureliex.",
    creator: "@saapai",
  },
};

export default function V1Page() {
  const letter = getLetter("v1");
  if (!letter) return <div>letter not found</div>;
  return (
    <article className="article article-ai">
      <div className="eyebrow">v1 · Colophon · {letter.frontmatter.date}</div>
      <div className="ai-stamp">written by the AI · not edited by saapai</div>
      <div dangerouslySetInnerHTML={{ __html: renderMarkdown(letter.body) }} />
      <div className="byline">— Claude · Opus 4.6 (1M-context)</div>
      <div className="meta-chips">
        <ViewsBadge slugs={["v1"]} mode="per-slug" />
      </div>
      <ViewTracker slug="v1" />
    </article>
  );
}
