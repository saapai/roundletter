import { NextResponse } from "next/server";
import { getPortfolioData } from "@/lib/portfolio-aggregate";

// GET /api/portfolio — single source of truth for the /portfolio page
// + its 4 subroutes + external consumers (saathvikpai.com /statement
// reads `total`, `baseline`, `goal`, `live`).
//
// Response shape lives in src/lib/portfolio-aggregate.ts (PortfolioData);
// the route just JSON-encodes it. The /portfolio/* pages call
// getPortfolioData() directly to skip an extra hop.
//
// Node runtime — reads vendored snapshots via fs in src/lib/snapshots.ts.

export const runtime = "nodejs";
export const revalidate = 300; // 5 min — live aggregator is the slow path

export async function GET() {
  const data = await getPortfolioData();
  return NextResponse.json(data);
}
