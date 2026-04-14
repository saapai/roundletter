import { getLetter, getPortfolio } from "@/lib/data";
import { renderMarkdown } from "@/lib/md";
import ViewTracker from "@/components/ViewTracker";
import ViewsBadge from "@/components/ViewsBadge";

export default function ParadigmPage() {
  const letter = getLetter("paradigm");
  const p = getPortfolio();
  if (!letter) return <div>letter not found</div>;
  return (
    <article className="article">
      <div className="eyebrow">P.S. · The Paradigm · {letter.frontmatter.date}</div>
      <div dangerouslySetInnerHTML={{ __html: renderMarkdown(letter.body) }} />
      <div className="byline">by {p.author?.name ?? "saapai"}</div>
      <div className="meta-chips">
        <ViewsBadge slugs={["paradigm"]} mode="per-slug" />
      </div>
      <ViewTracker slug="paradigm" />
    </article>
  );
}
