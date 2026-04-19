#!/usr/bin/env tsx
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { runDebate } from "../src/lib/agent-debate";

const ROOT = process.cwd();
const CURATION_JSON = resolve(ROOT, "src/data/curation.json");

type Tier = "Budget" | "Mid" | "Elite";

type CurationItem = { name: string; note?: string };

type CurationCategory = {
  id: string;
  label: string;
  tiers: Record<Tier, CurationItem[]>;
};

type CurationFile = {
  meta: {
    name: string;
    subtitle: string;
    mode: string;
    updated_at: string | null;
    last_debate: null | {
      id: string;
      ts: string;
      consensus: {
        reached: boolean;
        direction: "up" | "down" | "flat" | null;
        round: number | null;
      };
      topic: {
        kind: string;
        subject: string;
        framing: string;
      };
      summary: string;
    };
  };
  categories: CurationCategory[];
};

async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, "utf-8")) as T;
}

function formatCategory(c: CurationCategory): string {
  const lines = [c.label];
  for (const tier of ["Budget", "Mid", "Elite"] as const) {
    const items = c.tiers[tier].map((item) => item.name).join(" / ");
    lines.push(`  ${tier}: ${items}`);
  }
  return lines.join("\n");
}

function buildDayContext(curation: CurationFile): string {
  const today = new Date().toISOString().slice(0, 10);
  const panel = curation.categories.map(formatCategory).join("\n\n");
  return [
    `${today} — curation panel for shoes, speakers, music, clothes, songs, movies, art pieces, business, software product design, and best bets.`,
    "",
    panel,
    "",
    "Moderator directive: multiple agent personas should bash their heads, disagree on the picks, and keep revising until they reach a consensus. Only then may src/data/curation.json be updated.",
    "Call out the cleanest picks, the weakest picks, and the items that should move between Budget, Mid, and Elite before anything is written back.",
  ].join("\n");
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY missing");
    process.exit(1);
  }

  const curation = await readJson<CurationFile>(CURATION_JSON);
  const debate = await runDebate({ dayContext: buildDayContext(curation), maxArgumentRounds: 3 });

  if (!debate.consensus.reached) {
    console.log("no consensus; curation unchanged");
    return;
  }

  const finalModerator = [...debate.turns]
    .reverse()
    .find(
      (t): t is Extract<(typeof debate.turns)[number], { speaker: "moderator" }> =>
        t.speaker === "moderator" && Boolean((t as { scorecard?: unknown }).scorecard),
    );

  const next: CurationFile = {
    ...curation,
    meta: {
      ...curation.meta,
      updated_at: new Date().toISOString(),
      last_debate: {
        id: debate.id,
        ts: debate.ts,
        consensus: debate.consensus,
        topic: debate.topic,
        summary: finalModerator?.text ?? "",
      },
    },
  };

  await writeFile(CURATION_JSON, JSON.stringify(next, null, 2) + "\n", "utf-8");
  console.log(`updated curation after consensus: ${debate.consensus.direction}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
