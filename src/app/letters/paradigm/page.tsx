import { getLetter } from "@/lib/data";
import { renderMarkdown } from "@/lib/md";
import ViewTracker from "@/components/ViewTracker";
import ViewsBadge from "@/components/ViewsBadge";

export default function ParadigmPage() {
  const letter = getLetter("paradigm");
  if (!letter) return <div>letter not found</div>;
  return (
    <article className="prose max-w-none">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-xs text-graphite uppercase tracking-widest">P.S. · The Paradigm</div>
          <div className="text-xs text-graphite mt-1">{letter.frontmatter.date}</div>
        </div>
        <ViewsBadge slugs={["paradigm"]} mode="per-slug" />
      </div>
      <div dangerouslySetInnerHTML={{ __html: renderMarkdown(letter.body) }} />
      <ViewTracker slug="paradigm" />
    </article>
  );
}
