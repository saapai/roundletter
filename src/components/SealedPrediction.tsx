"use client";

// Public-facing display of sp-001 — the first sealed prediction on views.
// Static info (hash, baseline, horizon) renders immediately. The live section
// fetches /api/reveal which returns a countdown before the horizon closes
// and the plaintext + computed result after.
import { useEffect, useState } from "react";
import predictions from "@/data/sealed-predictions.json";

type Reveal =
  | { status: "loading" }
  | { status: "sealed"; seconds_until_reveal: number; sha256: string; horizon_end: string }
  | { status: "reveal_pending"; reason: string; sha256: string }
  | {
      status: "forfeited";
      sha256: string;
      horizon_end: string;
      forfeit: {
        declared_at?: string;
        reason?: string;
        consequence?: string;
        fix_for_future?: string;
      } | null;
    }
  | {
      status: "revealed";
      sha256: string;
      plaintext_raw: string;
      plaintext_parsed: unknown;
      threshold: number | null;
      baseline: number;
      current_total: number;
      delta_from_baseline: number;
      hit: boolean | null;
      revealed_at: string;
    }
  | { status: "error"; error: string };

function fmtTs(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleString("en-US", {
      timeZone: "America/New_York",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }) + " ET"
  );
}

function fmtCountdown(secs: number): string {
  if (secs <= 0) return "0s";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export default function SealedPrediction() {
  const p = predictions.predictions[0];
  const [reveal, setReveal] = useState<Reveal>({ status: "loading" });
  const [localSecs, setLocalSecs] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    async function pull() {
      try {
        const r = await fetch("/api/reveal", { cache: "no-store" });
        const j = (await r.json()) as Reveal;
        if (!alive) return;
        setReveal(j);
        if (j.status === "sealed") setLocalSecs(j.seconds_until_reveal);
      } catch (e) {
        if (!alive) return;
        setReveal({ status: "error", error: String(e) });
      }
    }
    pull();
    // re-poll every 15s while sealed, every 60s once revealed
    const id = setInterval(pull, reveal.status === "revealed" ? 60000 : 15000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [reveal.status]);

  useEffect(() => {
    if (reveal.status !== "sealed") return;
    const tick = setInterval(() => {
      setLocalSecs((c) => (c == null ? c : Math.max(0, c - 1)));
    }, 1000);
    return () => clearInterval(tick);
  }, [reveal.status]);

  if (!p) return null;

  return (
    <section className="sealed-prediction" aria-label="sealed prediction — the first calibration">
      <div className="sp-eyebrow">
        <span className="sp-eyebrow-mark">◈</span>
        <span>
          the first sealed prediction · {p.id} ·{" "}
          {reveal.status === "revealed" ? "revealed" : "sealed"}
        </span>
      </div>

      <h2 className="sp-thesis">{p.thesis_public}</h2>

      <div className="sp-metric">
        <span className="sp-metric-label">calibration metric</span>
        <span className="sp-metric-value">{p.calibration_metric}</span>
      </div>

      <dl className="sp-grid">
        <div className="sp-grid-cell">
          <dt>baseline</dt>
          <dd>{p.baseline.cumulative_reads.toLocaleString()} reads</dd>
          <dd className="sp-grid-sub">{fmtTs(p.baseline.as_of)}</dd>
        </div>
        <div className="sp-grid-cell">
          <dt>horizon · opens</dt>
          <dd>{fmtTs(p.horizon.start)}</dd>
          <dd className="sp-grid-sub">the drop · red → orange</dd>
        </div>
        <div className="sp-grid-cell">
          <dt>horizon · closes</dt>
          <dd>{fmtTs(p.horizon.end)}</dd>
          <dd className="sp-grid-sub">the revision · all green</dd>
        </div>
        <div className="sp-grid-cell">
          <dt>sealed at</dt>
          <dd>{fmtTs(p.sealed_at)}</dd>
          <dd className="sp-grid-sub">4:22 AM · nearly 4:20 · serendipitous</dd>
        </div>
      </dl>

      <div className="sp-hash">
        <div className="sp-hash-label">sha-256 seal</div>
        <code className="sp-hash-value">{p.sha256}</code>
      </div>

      {reveal.status === "sealed" && localSecs != null && (
        <div className="sp-live sp-live-sealed">
          <span className="sp-live-label">until reveal</span>
          <span className="sp-live-countdown">{fmtCountdown(localSecs)}</span>
        </div>
      )}

      {reveal.status === "reveal_pending" && (
        <div className="sp-live sp-live-pending">
          <span className="sp-live-label">horizon closed</span>
          <span className="sp-live-reason">plaintext publication pending · {reveal.reason}</span>
        </div>
      )}

      {reveal.status === "forfeited" && (
        <div className="sp-live sp-live-forfeit">
          <div className="sp-live-head">
            <span className="sp-live-label">forfeit — declared</span>
            <span className="sp-live-result sp-miss">✗ unrevealable</span>
          </div>
          <p className="sp-forfeit-reason">
            {reveal.forfeit?.reason ??
              "plaintext lost — the exact bytes that produced the committed sha-256 were not stored."}
          </p>
          <p className="sp-forfeit-consequence">
            {reveal.forfeit?.consequence ??
              "sp-001 stands as an unverifiable commitment. counts as a procedural miscalibration in the panel record."}
          </p>
          <p className="sp-forfeit-fix">
            <em>for the future:</em>{" "}
            {reveal.forfeit?.fix_for_future ??
              "see docs/SEALED_PREDICTIONS.md — sp-002 onward uses a stricter runbook."}
          </p>
        </div>
      )}

      {reveal.status === "revealed" && (
        <div className="sp-live sp-live-revealed">
          <div className="sp-live-head">
            <span className="sp-live-label">plaintext</span>
            {reveal.hit !== null && (
              <span className={`sp-live-result ${reveal.hit ? "sp-hit" : "sp-miss"}`}>
                {reveal.hit ? "✓ hit" : "✗ miss"}
              </span>
            )}
          </div>
          <code className="sp-live-plaintext">{reveal.plaintext_raw}</code>
          <dl className="sp-live-grid">
            {reveal.threshold != null && (
              <div>
                <dt>threshold</dt>
                <dd>{reveal.threshold.toLocaleString()}</dd>
              </div>
            )}
            <div>
              <dt>baseline</dt>
              <dd>{reveal.baseline.toLocaleString()}</dd>
            </div>
            <div>
              <dt>current</dt>
              <dd>{reveal.current_total.toLocaleString()}</dd>
            </div>
            <div>
              <dt>delta</dt>
              <dd>+{reveal.delta_from_baseline.toLocaleString()}</dd>
            </div>
          </dl>
        </div>
      )}

      <p className="sp-foot">
        Plaintext including the target threshold is under the hash. At {fmtTs(p.horizon.end)} the
        plaintext is revealed, the view count is pulled from <code>/api/views</code>, and the
        calibration is computed. The miscalibration becomes the input for sp-002.
      </p>
    </section>
  );
}
