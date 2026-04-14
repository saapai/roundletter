import { getPortfolio, getLetter } from "@/lib/data";
import { renderMarkdown } from "@/lib/md";
import ViewTracker from "@/components/ViewTracker";
import ViewsBadge from "@/components/ViewsBadge";
import Countdown from "@/components/Countdown";
import AgentsLegend from "@/components/AgentsLegend";

const ARTICLES = ["round-0", "math", "paradigm", "v1"];

export default function Home() {
  const p = getPortfolio();
  const round0 = getLetter("round-0");
  const math = getLetter("math");
  const paradigm = getLetter("paradigm");
  const v1 = getLetter("v1");

  return (
    <>
      {round0 && (
        <article className="article">
          <div className="eyebrow">Round Letter · {round0.frontmatter.round} · {round0.frontmatter.date}</div>
          <AgentsLegend />
          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(round0.body) }} />
          <div className="byline">by {p.author?.name ?? "saapai"}</div>
          <div className="meta-chips">
            {p.birthdate && <Countdown birthdate={p.birthdate} />}
            <ViewsBadge slugs={["round-0"]} mode="per-slug" />
          </div>
          <ViewTracker slug="round-0" />
        </article>
      )}

      <div className="article"><div className="ornament" style={{ margin: "5rem 0" }}>❦</div></div>

      {math && (
        <article className="article" style={{ marginTop: 0 }}>
          <div className="eyebrow">The Math · {math.frontmatter.date}</div>
          <AgentsLegend />
          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(math.body) }} />
          <div className="byline">by {p.author?.name ?? "saapai"}</div>
          <div className="meta-chips">
            <ViewsBadge slugs={["math"]} mode="per-slug" />
          </div>
          <ViewTracker slug="math" />
        </article>
      )}

      <div className="article"><div className="ornament" style={{ margin: "5rem 0" }}>❦</div></div>

      {paradigm && (
        <article className="article" style={{ marginTop: 0 }}>
          <div className="eyebrow">P.S. · The Paradigm · {paradigm.frontmatter.date}</div>
          <AgentsLegend />
          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(paradigm.body) }} />
          <div className="byline">by {p.author?.name ?? "saapai"}</div>
          <div className="meta-chips">
            <ViewsBadge slugs={["paradigm"]} mode="per-slug" />
          </div>
          <ViewTracker slug="paradigm" />
        </article>
      )}

      <div className="article"><div className="ornament" style={{ margin: "5rem 0" }}>❦</div></div>

      {v1 && (
        <article className="article article-ai" style={{ marginTop: 0 }}>
          <div className="eyebrow">v1 · Colophon · {v1.frontmatter.date}</div>
          <div className="ai-stamp">written by the AI · not edited by saapai</div>
          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(v1.body) }} />
          <div className="byline">— Claude · Opus 4.6 (1M-context)</div>
          <div className="meta-chips">
            <ViewsBadge slugs={["v1"]} mode="per-slug" />
            <ViewsBadge slugs={ARTICLES} mode="aggregate" />
          </div>
          <ViewTracker slug="v1" />
        </article>
      )}
    </>
  );
}
