import portfolio from "@/data/portfolio.json";
import trades from "@/data/trades.json";
import agents from "@/data/agents.json";
import fs from "node:fs";
import path from "node:path";

export function getPortfolio() { return portfolio as any; }
export function getTrades() { return (trades as any).trades as Trade[]; }
export function getAgents() { return (agents as any).agents as AgentMeta[]; }

export function getLetter(slug: string): { frontmatter: Record<string, any>; body: string } | null {
  const p = path.join(process.cwd(), "src/data/letters", `${slug}.md`);
  if (!fs.existsSync(p)) return null;
  const raw = fs.readFileSync(p, "utf8");
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fmMatch) return { frontmatter: {}, body: raw };
  const fm: Record<string, any> = {};
  fmMatch[1].split("\n").forEach((line) => {
    const m = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (m) fm[m[1]] = isNaN(+m[2]) ? m[2].replace(/^"|"$/g, "") : +m[2];
  });
  return { frontmatter: fm, body: fmMatch[2] };
}

export type Trade = {
  ts: string;
  round: number;
  action: "BUY" | "SELL" | "TRIM";
  ticker: string;
  qty: number;
  price: number | null;
  rationale: string;
  pnl_realized_approx?: number;
};

export type AgentMeta = {
  id: string;
  name: string;
  mandate: string;
  owns_buckets: string[];
};
