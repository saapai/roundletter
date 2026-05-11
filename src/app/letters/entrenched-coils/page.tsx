import type { Metadata } from "next";
import { getLetter, getPortfolio } from "@/lib/data";
import { renderMarkdown } from "@/lib/md";
import ViewTracker from "@/components/ViewTracker";
import ViewsBadge from "@/components/ViewsBadge";
import AgentsLegend from "@/components/AgentsLegend";

export const metadata: Metadata = {
  title: "Entrenched Coils — aureliex",
  description:
    "Tension-weighted memory for agents that must not lie to themselves. A directed graph where contradictions surface first.",
  openGraph: {
    title: "Entrenched Coils",
    description:
      "A memory architecture where disagreement is the retrieval signal. Three layers of why it matters.",
    url: "https://aureliex.com/letters/entrenched-coils",
    siteName: "aureliex",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Entrenched Coils",
    description:
      "Tension-weighted memory for agents that must not lie to themselves.",
    creator: "@saapai",
  },
};

export default function EntrenchedCoilsPage() {
  const letter = getLetter("entrenched-coils");
  const p = getPortfolio();
  if (!letter) return <div>letter not found</div>;
  return (
    <article className="article">
      <div className="eyebrow">
        Entrenched Coils &middot; {letter.frontmatter.date}
      </div>
      <AgentsLegend />
      <div dangerouslySetInnerHTML={{ __html: renderMarkdown(letter.body) }} />
      <div className="byline">by {p.author?.name ?? "saapai"}</div>
      <div className="meta-chips">
        <ViewsBadge slugs={["entrenched-coils"]} mode="per-slug" />
      </div>
      <ViewTracker slug="entrenched-coils" />
    </article>
  );
}
