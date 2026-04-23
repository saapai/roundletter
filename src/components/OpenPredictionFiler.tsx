"use client";

import { useCallback, useMemo, useState } from "react";
import { HUNT_PHONE_DISPLAY, HUNT_PHONE_TEL } from "@/lib/hunt";

// Open-entry sealed prediction filer.
//
// Any visitor can file a prediction. The plaintext is hashed client-side
// with Web Crypto SHA-256 and never sent anywhere. The visitor gets a
// public seal-hash they can copy; they can also open iMessage pre-filled
// to saapai to deliver the seal over a verifiable channel, optionally
// including their phone for payout on resolution.
//
// This intentionally sidesteps server storage — the public receipt is the
// chat log between the filer and saapai. If they want the seal to appear
// on aureliex, they text it; saapai adds it to /data/sealed-predictions.

async function sha256Hex(s: string): Promise<string> {
  const enc = new TextEncoder().encode(s);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomNonce(): string {
  // 10 bytes of randomness → 20 hex chars, readable on mobile sms
  const a = new Uint8Array(10);
  crypto.getRandomValues(a);
  return Array.from(a).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function smsToSaapai(body: string): string {
  const num = HUNT_PHONE_TEL.replace(/^tel:/, "");
  return `sms:${num}?&body=${encodeURIComponent(body)}`;
}

export default function OpenPredictionFiler() {
  const [thesis, setThesis] = useState("");
  const [threshold, setThreshold] = useState("");
  const [scoringRule, setScoringRule] = useState("");
  const [horizon, setHorizon] = useState("");
  const [phone, setPhone] = useState("");
  const [nonce, setNonce] = useState(() => randomNonce());
  const [sealedAt, setSealedAt] = useState<string | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const canonical = useMemo(() => {
    const sealedIso = sealedAt ?? new Date().toISOString();
    return JSON.stringify({
      thesis: thesis.trim(),
      threshold: threshold.trim() === "" ? null : Number(threshold),
      scoring_rule: scoringRule.trim(),
      horizon: horizon.trim() || null,
      phone: phone.trim() || null,
      nonce,
      sealed_at: sealedIso,
    });
  }, [thesis, threshold, scoringRule, horizon, phone, nonce, sealedAt]);

  const seal = useCallback(async () => {
    if (!thesis.trim() || !scoringRule.trim()) return;
    setBusy(true);
    try {
      const now = new Date().toISOString();
      setSealedAt(now);
      const payload = JSON.stringify({
        thesis: thesis.trim(),
        threshold: threshold.trim() === "" ? null : Number(threshold),
        scoring_rule: scoringRule.trim(),
        horizon: horizon.trim() || null,
        phone: phone.trim() || null,
        nonce,
        sealed_at: now,
      });
      const h = await sha256Hex(payload);
      setHash(h);
    } finally {
      setBusy(false);
    }
  }, [thesis, threshold, scoringRule, horizon, phone, nonce]);

  const reset = useCallback(() => {
    setHash(null);
    setSealedAt(null);
    setNonce(randomNonce());
    setCopied(false);
  }, []);

  const copyHash = useCallback(async () => {
    if (!hash) return;
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — nothing to do */
    }
  }, [hash]);

  const sms = useMemo(() => {
    if (!hash) return "";
    const lines = [
      `sealed prediction · ${new Date(sealedAt ?? Date.now()).toISOString()}`,
      `thesis: ${thesis.trim()}`,
      threshold.trim() ? `threshold: ${threshold.trim()}` : null,
      scoringRule.trim() ? `scoring: ${scoringRule.trim()}` : null,
      horizon.trim() ? `horizon: ${horizon.trim()}` : null,
      `seal (sha256): ${hash}`,
      `nonce: ${nonce}`,
      phone.trim() ? `ping: ${phone.trim()}` : null,
      "",
      "— filed via aureliex.com/argument",
    ].filter(Boolean);
    return smsToSaapai(lines.join("\n"));
  }, [hash, sealedAt, thesis, threshold, scoringRule, horizon, nonce, phone]);

  return (
    <section className="seal-filer" aria-label="file a sealed prediction">
      <div className="seal-filer-head">
        <span className="seal-filer-eye">// file a sealed prediction</span>
        <span className="seal-filer-sub">no curator · anyone who files a sha-hashed prediction with a dated scoring rule is in the book</span>
      </div>

      {hash ? null : (
        <div className="seal-filer-form">
          <label className="seal-filer-field">
            <span>thesis</span>
            <textarea
              rows={3}
              placeholder="short, falsifiable. e.g. 'portfolio closes above $4,200 by friday midnight PT.'"
              value={thesis}
              onChange={(e) => setThesis(e.target.value)}
            />
          </label>
          <label className="seal-filer-field">
            <span>threshold (optional number)</span>
            <input
              inputMode="decimal"
              placeholder="e.g. 4200"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
            />
          </label>
          <label className="seal-filer-field">
            <span>scoring rule (how the public verifies)</span>
            <textarea
              rows={2}
              placeholder="e.g. 'close price on yahoo finance 4pm ET, published in /trades.'"
              value={scoringRule}
              onChange={(e) => setScoringRule(e.target.value)}
            />
          </label>
          <label className="seal-filer-field">
            <span>horizon (iso datetime or plain date)</span>
            <input
              placeholder="e.g. 2026-04-25T00:00:00-07:00"
              value={horizon}
              onChange={(e) => setHorizon(e.target.value)}
            />
          </label>
          <label className="seal-filer-field">
            <span>your phone (optional — we text you on resolve)</span>
            <input
              inputMode="tel"
              placeholder="+1 555 555 0123"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>
          <div className="seal-filer-actions">
            <button
              type="button"
              className="seal-filer-seal"
              disabled={!thesis.trim() || !scoringRule.trim() || busy}
              onClick={seal}
            >
              {busy ? "sealing…" : "seal · compute sha-256"}
            </button>
            <span className="seal-filer-hint">
              <em>everything hashes in your browser. nothing leaves this page until you text it.</em>
            </span>
          </div>
        </div>
      )}

      {hash && (
        <div className="seal-filer-receipt">
          <div className="seal-filer-receipt-head">
            <span className="seal-filer-receipt-eye">// seal · open</span>
            <span className="seal-filer-receipt-ts">
              sealed · {new Date(sealedAt!).toLocaleString("en-US", {
                timeZone: "America/Los_Angeles",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })} PT
            </span>
          </div>

          <dl className="seal-filer-kv">
            <div>
              <dt>thesis</dt>
              <dd>{thesis}</dd>
            </div>
            {threshold.trim() && (
              <div>
                <dt>threshold</dt>
                <dd className="seal-filer-mono">{threshold}</dd>
              </div>
            )}
            <div>
              <dt>scoring rule</dt>
              <dd>{scoringRule}</dd>
            </div>
            {horizon.trim() && (
              <div>
                <dt>horizon</dt>
                <dd className="seal-filer-mono">{horizon}</dd>
              </div>
            )}
            {phone.trim() && (
              <div>
                <dt>ping</dt>
                <dd className="seal-filer-mono">{phone}</dd>
              </div>
            )}
            <div>
              <dt>nonce</dt>
              <dd className="seal-filer-mono">{nonce}</dd>
            </div>
          </dl>

          <div className="seal-filer-hash">
            <span className="seal-filer-hash-label">seal · sha-256</span>
            <code className="seal-filer-hash-val">{hash}</code>
          </div>

          <div className="seal-filer-cta-row">
            <button type="button" className="seal-filer-cta seal-filer-cta-copy" onClick={copyHash}>
              {copied ? "copied · ✓" : "copy seal"}
            </button>
            <a
              className="seal-filer-cta seal-filer-cta-imessage"
              href={sms}
            >
              imessage seal to {HUNT_PHONE_DISPLAY} →
            </a>
            <button type="button" className="seal-filer-cta seal-filer-cta-reset" onClick={reset}>
              file another
            </button>
          </div>

          <p className="seal-filer-foot">
            <em>
              the seal above is the public receipt. if you want your prediction
              to appear in the document, text it with the thesis + the seal —
              saapai adds it to /data/sealed-predictions and publishes it on
              /argument. payouts (cash or portfolio equity) negotiate by text.
            </em>
          </p>
        </div>
      )}
    </section>
  );
}
