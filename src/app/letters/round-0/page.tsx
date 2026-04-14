import { getLetter } from "@/lib/data";
import { renderMarkdown } from "@/lib/md";
import ViewTracker from "@/components/ViewTracker";

export default function RoundZeroLetter() {
  const letter = getLetter("round-0");
  if (!letter) return <div>letter not found</div>;
  return (
    <article className="prose max-w-none">
      <div className="text-xs text-graphite uppercase tracking-widest">Round Letter · {letter.frontmatter.round}</div>
      <div className="text-xs text-graphite mt-1">{letter.frontmatter.date}</div>
      <div dangerouslySetInnerHTML={{ __html: renderMarkdown(letter.body) }} />
      <ViewTracker slug="round-0" />
    </article>
  );
}
