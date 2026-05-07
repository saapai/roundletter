import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { computeFees, PARTY_DATE, daysUntilParty } from "@/lib/invest-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  let body: { amountCents?: number; name?: string; email?: string; discount?: number } = {};
  try { body = await req.json(); } catch {}

  const baseAmount = body.amountCents;
  if (!baseAmount || baseAmount < 100 || baseAmount > 500_000) {
    return NextResponse.json({ error: "Amount must be between $1 and $5,000" }, { status: 400 });
  }

  // Apply easter egg discount (max $10 = 1000 cents)
  const discount = Math.min(body.discount ?? 0, 1000);
  const discountedAmount = Math.max(baseAmount - discount, 100);

  const { totalCharge } = computeFees(discountedAmount);
  const days = daysUntilParty();

  const stripe = new Stripe(stripeKey);

  const origin = req.headers.get("origin") || "https://aureliex.com";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{
      price_data: {
        currency: "usd",
        unit_amount: totalCharge,
        product_data: {
          name: `Pool Investment — ${days}d before party`,
          description: `$${(discountedAmount / 100).toFixed(2)} investment + fees. Weight: ${discountedAmount * days} points.`,
        },
      },
      quantity: 1,
    }],
    metadata: {
      base_amount_cents: String(discountedAmount),
      fee_cents: String(totalCharge - discountedAmount),
      days_before_party: String(days),
      weight: String(discountedAmount * days),
      investor_name: body.name || "anonymous",
      investor_email: body.email || "",
      discount_cents: String(discount),
      party_date: PARTY_DATE,
    },
    success_url: `${origin}/invest?success=1`,
    cancel_url: `${origin}/invest?cancelled=1`,
  });

  return NextResponse.json({ url: session.url });
}
