"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useEggs, EggToast, getDiscount } from "@/components/EasterEggs";

const TIERS = [25, 50, 100, 250, 500];
const VENMO_HANDLE = "saathvikpai";
const PHONE = "3853687238";
const PARTY_DATE = new Date("2026-06-21T23:59:59");

function daysUntil(): number {
  return Math.max(0, Math.ceil((PARTY_DATE.getTime() - Date.now()) / 86_400_000));
}

function computeFees(amountCents: number) {
  const totalCharge = Math.ceil((amountCents + 30) / (1 - 0.039));
  const stripeFee = Math.ceil(totalCharge * 0.029) + 30;
  const aureliexFee = Math.ceil(totalCharge * 0.01);
  return { stripeFee, aureliexFee, totalCharge, youPay: totalCharge };
}

type PoolState = {
  totalInvested: number;
  totalWeight: number;
  investorCount: number;
  investments: Array<{
    name: string;
    amountCents: number;
    weight: number;
    daysBeforeParty: number;
    investedAt: string;
    sharePct: number;
  }>;
};

export default function InvestPage() {
  const { eggs, justFound } = useEggs();
  const [amount, setAmount] = useState(100);
  const [custom, setCustom] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [pool, setPool] = useState<PoolState | null>(null);
  const [discount, setDiscount] = useState(0);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setDiscount(getDiscount());
    if (typeof window !== "undefined" && window.location.search.includes("success=1")) {
      setSuccess(true);
    }
  }, [eggs]);

  useEffect(() => {
    fetch("/api/investments")
      .then((r) => r.json())
      .then(setPool)
      .catch(() => {});
  }, []);

  const days = daysUntil();
  const effectiveAmount = amount * 100; // cents
  const discountCents = discount * 100;
  const fees = computeFees(Math.max(effectiveAmount - discountCents, 100));
  const weight = effectiveAmount * days;

  const handleStripeCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          amountCents: effectiveAmount,
          name: name || "anonymous",
          email: email || undefined,
          discount: discountCents,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="article invest-page">
        <div className="invest-success">
          <h1>You're in.</h1>
          <p>Your investment has been confirmed. Welcome to the pool.</p>
          <p className="invest-formula-note">
            Your allocation weight is locked — the earlier you invested, the larger your share.
          </p>
          <Link href="/" className="invest-back">← back to aureliex</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="article invest-page">
      <EggToast justFound={justFound} />

      <div className="eyebrow">aureliex · invest · {days} days to the party</div>
      <h1>Join the Pool</h1>
      <p className="deck">
        Invest early, invest more — your allocation grows with time.
        <br />
        <em>investment × days before party = your share of returns.</em>
      </p>

      {/* Allocation formula */}
      <div className="invest-formula">
        <div className="invest-formula-row">
          <span className="invest-formula-label">your investment</span>
          <span className="invest-formula-value">${amount.toLocaleString()}</span>
        </div>
        <div className="invest-formula-row">
          <span className="invest-formula-label">× days remaining</span>
          <span className="invest-formula-value">{days}</span>
        </div>
        <div className="invest-formula-divider" />
        <div className="invest-formula-row invest-formula-total">
          <span className="invest-formula-label">allocation weight</span>
          <span className="invest-formula-value">{weight.toLocaleString()} pts</span>
        </div>
        {pool && pool.totalWeight > 0 && (
          <div className="invest-formula-row">
            <span className="invest-formula-label">estimated share</span>
            <span className="invest-formula-value">
              {((weight / (pool.totalWeight + weight)) * 100).toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Tier selector */}
      <div className="invest-tiers">
        {TIERS.map((t) => (
          <button
            key={t}
            className={`invest-tier ${amount === t ? "is-active" : ""}`}
            onClick={() => { setAmount(t); setCustom(""); }}
          >
            ${t}
          </button>
        ))}
        <input
          type="number"
          className="invest-custom"
          placeholder="other"
          min={1}
          max={5000}
          value={custom}
          onChange={(e) => {
            setCustom(e.target.value);
            const v = parseInt(e.target.value, 10);
            if (v > 0 && v <= 5000) setAmount(v);
          }}
        />
      </div>

      {/* Discount badge */}
      {discount > 0 && (
        <div className="invest-discount">
          <span className="invest-discount-badge">
            ${discount} discount applied
          </span>
          {discount < 10 && (
            <span className="invest-discount-hint">
              {10 - discount > 5 ? "keep exploring..." : "one more to find..."}
            </span>
          )}
        </div>
      )}

      {/* Name / email */}
      <div className="invest-fields">
        <input
          type="text"
          className="invest-field"
          placeholder="your name (for the register)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          className="invest-field"
          placeholder="email (optional, for confirmation)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* Payment options — Venmo first */}
      <div className="invest-pay">
        <div className="invest-pay-direct">
          <h2>Pay Direct — No Fees</h2>
          <p>Your full ${amount} goes into the pool. No processing fees.</p>
          <a
            href={`https://venmo.com/${VENMO_HANDLE}?txn=pay&amount=${amount}&note=aureliex+pool+investment`}
            target="_blank"
            rel="noopener noreferrer"
            className="invest-btn invest-btn-primary"
          >
            Venmo @{VENMO_HANDLE}
          </a>
          <a
            href={`sms:${PHONE}&body=Investing $${amount} in the aureliex pool. Name: ${encodeURIComponent(name || "anonymous")}`}
            className="invest-btn invest-btn-secondary"
          >
            Text {PHONE.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")}
          </a>
          <p className="invest-pay-note">
            Paying directly avoids the Stripe fee — the full amount enters the pool.
          </p>
        </div>

        <div className="invest-pay-divider">
          <span>or</span>
        </div>

        <div className="invest-pay-stripe">
          <h2>Pay via Stripe</h2>
          <div className="invest-fee-breakdown">
            <div className="invest-fee-row">
              <span>Investment amount</span>
              <span>${((effectiveAmount - discountCents) / 100).toFixed(2)}</span>
            </div>
            <div className="invest-fee-row">
              <span>Stripe fee (2.9% + $0.30)</span>
              <span>${(fees.stripeFee / 100).toFixed(2)}</span>
            </div>
            <div className="invest-fee-row">
              <span>aureliex fee (1%)</span>
              <span>${(fees.aureliexFee / 100).toFixed(2)}</span>
            </div>
            <div className="invest-fee-row invest-fee-total">
              <span>You pay</span>
              <span>${(fees.youPay / 100).toFixed(2)}</span>
            </div>
          </div>
          <button
            className="invest-btn invest-btn-stripe"
            onClick={handleStripeCheckout}
            disabled={loading}
          >
            {loading ? "Redirecting..." : `Pay $${(fees.youPay / 100).toFixed(2)} via Stripe`}
          </button>
        </div>
      </div>

      {/* Pool state */}
      {pool && pool.investorCount > 0 && (
        <div className="invest-pool">
          <h2>The Register</h2>
          <div className="invest-pool-stats">
            <div className="invest-pool-stat">
              <span className="invest-pool-stat-v">${(pool.totalInvested / 100).toLocaleString()}</span>
              <span className="invest-pool-stat-k">total invested</span>
            </div>
            <div className="invest-pool-stat">
              <span className="invest-pool-stat-v">{pool.investorCount}</span>
              <span className="invest-pool-stat-k">investors</span>
            </div>
            <div className="invest-pool-stat">
              <span className="invest-pool-stat-v">{days}d</span>
              <span className="invest-pool-stat-k">until party</span>
            </div>
          </div>
          <div className="invest-pool-list">
            {pool.investments.map((inv, i) => (
              <div key={i} className="invest-pool-entry">
                <span className="invest-pool-name">{inv.name}</span>
                <span className="invest-pool-amount">${(inv.amountCents / 100).toFixed(0)}</span>
                <span className="invest-pool-days">{inv.daysBeforeParty}d early</span>
                <span className="invest-pool-share">{inv.sharePct.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="invest-how">
        <h2>How Allocation Works</h2>
        <p>
          Your share of the pool is proportional to <strong>how much</strong> you invest
          and <strong>how early</strong> you invest. The formula:
        </p>
        <div className="invest-formula-block">
          <code>your_share = (your_investment × days_before_party) / total_pool_weight</code>
        </div>
        <p>
          A $100 investment with 30 days left (weight: 3,000) earns more than
          $100 with 5 days left (weight: 500). Early conviction is rewarded.
        </p>
      </div>
    </div>
  );
}
