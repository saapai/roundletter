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
  const [amount, setAmount] = useState(50);
  const [custom, setCustom] = useState("");
  const [name, setName] = useState("");
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
  const weight = effectiveAmount * days;

  const [gainPct, setGainPct] = useState<number | null>(null);

  useEffect(() => {
    // Match every equity surface: the account is the book (personal only —
    // the frozen kalshi book was a project-0 artifact)
    fetch("/api/portfolio")
      .then((r) => r.json())
      .then((j) => {
        const personal = j?.categories?.personal?.current_value;
        const baseline = j?.baseline;
        if (personal != null && baseline) {
          setGainPct(((personal - baseline) / baseline) * 100);
        }
      })
      .catch(() => {});
  }, []);

  if (success) {
    return (
      <div className="article invest-page">
        <div className="invest-success">
          <h1>You're in.</h1>
          <p>Your weight is locked. The pool remembers when you showed up.</p>
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
      <h1>Bet on the bet.</h1>
      <p className="deck">
        Early money carries more weight — because it took more of the risk.
        <br />
        <em>{days} days left. Every day you wait costs you points.</em>
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
      {gainPct !== null && (
        <p className="invest-hindsight">
          If you had invested <strong>${amount.toLocaleString()}</strong> on day one,
          it would be worth{" "}
          <strong>${(amount * (1 + gainPct / 100)).toFixed(2)}</strong> today.
          <span className="invest-hindsight-pct">
            {" "}+{gainPct.toFixed(1)}%
          </span>
        </p>
      )}

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

      {/* Name */}
      <div className="invest-fields">
        <input
          type="text"
          className="invest-field"
          placeholder="your name (for the register)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* Payment — Venmo + Zelle only */}
      <div className="invest-pay-reveal">
        <p className="invest-pay-heading">Choose how to pay</p>
        <a
          href={`https://venmo.com/${VENMO_HANDLE}?txn=pay&amount=${amount}&note=aureliex+pool+investment`}
          target="_blank"
          rel="noopener noreferrer"
          className="invest-pay-option"
        >
          <span className="invest-pay-option-left">
            <span className="invest-pay-option-name">Venmo</span>
            <span className="invest-pay-option-sub">@{VENMO_HANDLE}</span>
          </span>
          <span className="invest-pay-option-right">
            <span className="invest-pay-option-amount">${amount}</span>
            <span className="invest-pay-option-tag invest-pay-option-tag--free">no fees</span>
          </span>
        </a>
        <a
          href={`sms:${PHONE}&body=Investing $${amount} in the aureliex pool. Name: ${encodeURIComponent(name || "anonymous")}`}
          className="invest-pay-option"
        >
          <span className="invest-pay-option-left">
            <span className="invest-pay-option-name">Text / Zelle</span>
            <span className="invest-pay-option-sub">{PHONE.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")}</span>
          </span>
          <span className="invest-pay-option-right">
            <span className="invest-pay-option-amount">${amount}</span>
            <span className="invest-pay-option-tag invest-pay-option-tag--free">no fees</span>
          </span>
        </a>
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
          and <strong>how early</strong> you invest.
        </p>
        <div className="invest-frac">
          <span className="invest-frac-lhs">your share</span>
          <span className="invest-frac-eq">=</span>
          <span className="invest-frac-block">
            <span className="invest-frac-num">what you put in &times; how early you put it in</span>
            <span className="invest-frac-bar" />
            <span className="invest-frac-den">everyone&rsquo;s combined weight</span>
          </span>
        </div>
        <p className="invest-latex-note">
          $100 with 30 days left → weight 3,000.<br />
          $100 with 5 days left → weight 500.<br />
          Early conviction is rewarded.
        </p>
      </div>
    </div>
  );
}
