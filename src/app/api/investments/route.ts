import { NextResponse } from "next/server";
import { getPoolState } from "@/lib/invest-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const pool = await getPoolState();
    return NextResponse.json(pool);
  } catch (err) {
    console.error("Failed to get pool state:", err);
    return NextResponse.json({
      totalInvested: 0,
      totalWeight: 0,
      investorCount: 0,
      investments: [],
    });
  }
}
