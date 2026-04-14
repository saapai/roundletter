import { getLetter } from "@/lib/data";
import { renderMarkdown } from "@/lib/md";
import ViewTracker from "@/components/ViewTracker";
import ViewsBadge from "@/components/ViewsBadge";

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
