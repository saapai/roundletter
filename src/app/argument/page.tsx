import Link from "next/link";
import TodayDebate from "@/components/TodayDebate";
import SixNineGame from "@/components/SixNineGame";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

// /argument page — the daily five-agent + moderator debate. Leverages the
// TodayDebate server component for the current-run render. Below it, a
// compact list of the last N prior debates with their topic + consensus.

export const dynamic = "force-dynamic";

type DebateMeta = {
  id: string;
  ts: string;
  topic: { subject: string; kind: string };
  consensus: { reached: boolean; direction: "up" | "down" | "flat" | null; round: number | null };
};

async function readAll(): Promise<DebateMeta[]> {
  try {
    const raw = await readFile(resolve(process.cwd(), "src/data/debates.json"), "utf-8");
    const parsed = JSON.parse(raw) as { debates?: DebateMeta[] };
    return parsed.debates ?? [];
  } catch {
    return [];
  }
}

export default async function ArgumentPage() {
  const all = await readAll();
  const prior = all.slice(0, -1).reverse().slice(0, 30);

  return (
    <main className="argument-root">
      <div className="argument-wrap">
        <TodayDebate />

        {prior.length > 0 && (
          <section className="argument-history">
            <h2 className="argument-history-title">prior arguments</h2>
            <ol className="argument-history-list">
              {prior.map((d) => (
                <li key={d.id} className="argument-history-item">
                  <span className="hist-ts">
                    {new Date(d.ts).toISOString().slice(0, 10)}
                  </span>
                  <span className="hist-kind">[{d.topic.kind}]</span>
                  <span className="hist-subject">{d.topic.subject}</span>
                  <span
                    className={`hist-consensus hist-${
                      d.consensus.reached ? d.consensus.direction : "split"
                    }`}
                  >
                    {d.consensus.reached ? d.consensus.direction : "split"}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        )}

        <nav className="argument-nav">
          <Link href="/" className="argument-back">← home</Link>
          <span className="argument-dot">·</span>
          <Link href="/positions" className="argument-back">positions</Link>
          <span className="argument-dot">·</span>
          <Link href="/trades" className="argument-back">trades</Link>
        </nav>

        <SixNineGame />
      </div>
    </main>
  );
}
