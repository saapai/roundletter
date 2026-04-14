import { getPortfolio, getLetter } from "@/lib/data";
import { renderMarkdown } from "@/lib/md";
import ViewTracker from "@/components/ViewTracker";
import ViewsBadge from "@/components/ViewsBadge";
import ShareOnX from "@/components/ShareOnX";
import Countdown from "@/components/Countdown";

const ARTICLES = ["round-0", "paradigm"];

export default function Home() {
  const p = getPortfolio();
  const round0 = getLetter("round-0");
  const paradigm = getLetter("paradigm");
  const drawdown = p.drawdown_pct_from_peak as number;
  const multipleToGoal = 100000 / p.account_value_at_entry;

  return (
    <div className="space-y-16">
      {round0 && (
        <article className="article">
          <div className="flourish">· · ·</div>
          <div className="flex items-baseline justify-between mt-4 flex-wrap gap-y-2">
            <div className="eyebrow">Round Letter · {round0.frontmatter.round} · by {p.author?.name ?? "Gopalakrishna Pai"} · @{p.author?.handle ?? "saapai"}</div>
            <div className="flex items-center gap-3">
              {p.birthday && <Countdown target={p.birthday} />}
              <ViewsBadge slugs={["round-0"]} mode="per-slug" />
            </div>
          </div>
          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(round0.body) }} />
          <div className="mt-8 flex items-center justify-between">
            <span className="eyebrow">if the hook landed</span>
            <ShareOnX text={"$3,453 → $100,000 by my birthday. No job. Five AI agents. The pre-mortem, published before I fail."} url="https://aureliex.com/" />
          </div>
          <ViewTracker slug="round-0" />
        </article>
      )}

      {/* Receipts — the hook has already landed; this is for readers who stayed */}
      <section className="max-w-3xl mx-auto">
        <div className="eyebrow text-center mb-4">· receipts ·</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="trench p-4">
            <div className="eyebrow">Account</div>
            <div className="font-mono text-2xl mt-1">${p.account_value_at_entry.toLocaleString()}</div>
            <div className="text-xs text-graphite mt-1">{p.baseline_date}</div>
          </div>
          <div className="trench p-4">
            <div className="eyebrow">Peak-to-Trough</div>
            <div className="font-mono text-2xl mt-1 text-rust">{drawdown.toFixed(1)}%</div>
            <div className="text-xs text-graphite mt-1">from ${p.peak_value.toLocaleString()}</div>
          </div>
          <div className="trench p-4">
            <div className="eyebrow">To $100K</div>
            <div className="font-mono text-2xl mt-1">{multipleToGoal.toFixed(2)}x</div>
            <div className="text-xs text-graphite mt-1">the scoreboard</div>
          </div>
          <ViewsBadge slugs={ARTICLES} label="Real Readers" />
        </div>
      </section>

      {paradigm && (
        <article className="article">
          <div className="flourish">· · ·</div>
          <div className="flex items-baseline justify-between mt-4">
            <div className="eyebrow">P.S. · The Paradigm · {paradigm.frontmatter.date}</div>
            <ViewsBadge slugs={["paradigm"]} mode="per-slug" />
          </div>
          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(paradigm.body) }} />
          <div className="mt-8 flex items-center justify-between">
            <span className="eyebrow">take it with you</span>
            <ShareOnX text={"The people who win take commission. You can't predict if a stock goes sideways, but you can get pretty damn close. — from an AI-annotated debate paradigm."} url="https://aureliex.com/letters/paradigm" />
          </div>
          <ViewTracker slug="paradigm" />
        </article>
      )}
    </div>
  );
}
