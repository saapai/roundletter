import { getPortfolio, getLetter } from "@/lib/data";
import { renderMarkdown } from "@/lib/md";
import ViewTracker from "@/components/ViewTracker";
import ViewsBadge from "@/components/ViewsBadge";
import Countdown from "@/components/Countdown";

const ARTICLES = ["round-0", "paradigm"];

export default function Home() {
  const p = getPortfolio();
  const round0 = getLetter("round-0");
  const paradigm = getLetter("paradigm");

  return (
    <>
      {round0 && (
        <article className="article">
          <div className="eyebrow">Round Letter · {round0.frontmatter.round} · {round0.frontmatter.date}</div>
          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(round0.body) }} />
          <div className="byline">by {p.author?.name ?? "Gopalakrishna Pai"} · @{p.author?.handle ?? "saapai"}</div>
          <div className="meta-chips">
            {p.birthdate && <Countdown birthdate={p.birthdate} />}
            <ViewsBadge slugs={["round-0"]} mode="per-slug" />
          </div>
          <ViewTracker slug="round-0" />
        </article>
      )}

      <div className="article"><div className="ornament" style={{ margin: "5rem 0" }}>❦</div></div>

      {paradigm && (
        <article className="article" style={{ marginTop: 0 }}>
          <div className="eyebrow">P.S. · The Paradigm · {paradigm.frontmatter.date}</div>
          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(paradigm.body) }} />
          <div className="byline">by {p.author?.name ?? "Gopalakrishna Pai"} · @{p.author?.handle ?? "saapai"}</div>
          <div className="meta-chips">
            <ViewsBadge slugs={["paradigm"]} mode="per-slug" />
            <ViewsBadge slugs={ARTICLES} mode="per-slug" label="total read to the end" />
          </div>
          <ViewTracker slug="paradigm" />
        </article>
      )}
    </>
  );
}
