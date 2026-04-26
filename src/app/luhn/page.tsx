"use client";

import { useMemo, useState } from "react";

// /luhn — easter egg utility on the bank: validate any card-number-style
// digit string via the Luhn algorithm. Fits the bank-as-bank conceit
// (the portfolio is the bank; a real bank can tell if a card is valid).

function luhn(digits: string): boolean {
  const s = digits.replace(/\D/g, "");
  if (s.length < 12 || s.length > 19) return false;
  let sum = 0;
  let alt = false;
  for (let i = s.length - 1; i >= 0; i--) {
    let n = parseInt(s.charAt(i), 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function brand(s: string): string {
  const d = s.replace(/\D/g, "");
  if (/^4/.test(d)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(d)) return "mastercard";
  if (/^3[47]/.test(d)) return "amex";
  if (/^6(011|5)/.test(d)) return "discover";
  if (/^3(0[0-5]|6|8)/.test(d)) return "diners";
  if (/^35/.test(d)) return "jcb";
  return "—";
}

function group(s: string): string {
  const d = s.replace(/\D/g, "");
  // Amex format 4-6-5; otherwise 4-4-4-4 (or trailing).
  if (/^3[47]/.test(d)) {
    return [d.slice(0, 4), d.slice(4, 10), d.slice(10, 15)].filter(Boolean).join(" ");
  }
  return d.replace(/(.{4})/g, "$1 ").trim();
}

export default function LuhnPage() {
  const [raw, setRaw] = useState("");
  const digits = useMemo(() => raw.replace(/\D/g, ""), [raw]);
  const ok = useMemo(() => digits.length >= 12 && luhn(digits), [digits]);
  const why = useMemo(() => {
    if (!digits) return "type a number.";
    if (digits.length < 12) return `${digits.length}/12 min digits.`;
    if (digits.length > 19) return `too long. cap is 19.`;
    return ok ? "passes the checksum." : "fails the checksum.";
  }, [digits, ok]);

  return (
    <main className="luhn-page">
      <header className="luhn-head">
        <p className="luhn-eyebrow">aureliex · easter egg</p>
        <h1 className="luhn-h1">luhn</h1>
        <p className="luhn-deck">
          a pocket calculator for whether a card number is well-formed.
          paste any string of digits — the algorithm doubles every other
          digit from the right, sums them, and checks that the result is
          divisible by ten. it doesn&rsquo;t prove the card exists. it
          just proves it isn&rsquo;t a typo.
        </p>
      </header>

      <section className="luhn-input">
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          autoFocus
          placeholder="4242 4242 4242 4242"
          value={group(raw)}
          onChange={(e) => setRaw(e.target.value)}
          aria-label="card number"
        />
      </section>

      <section className={`luhn-readout ${ok ? "is-ok" : "is-no"}`}>
        <div className="luhn-verdict">{ok ? "VALID" : digits ? "INVALID" : "—"}</div>
        <div className="luhn-why">{why}</div>
        {digits && (
          <div className="luhn-meta">
            <span>brand · <strong>{brand(digits)}</strong></span>
            <span>length · {digits.length}</span>
          </div>
        )}
      </section>

      <footer className="luhn-foot">
        <p>
          named after Hans Peter Luhn (IBM, 1954). public-domain math.
          one of three checksums in your wallet right now.
        </p>
        <p>
          <a href="/portfolio">return to the bank →</a>
        </p>
      </footer>
    </main>
  );
}
