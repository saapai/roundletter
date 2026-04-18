// Public-facing display of sp-001 — the first sealed prediction on views.
// Shows the SHA, the sealed timestamp, the horizon, and the calibration metric.
// The plaintext threshold is under the hash until 2026-04-20T16:20 ET.
import predictions from "@/data/sealed-predictions.json";

function fmtTs(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }) + " ET";
}

export default function SealedPrediction() {
  const p = predictions.predictions[0];
  if (!p) return null;
  const revealTs = Date.parse(p.horizon.end);
  const isRevealed = Date.now() >= revealTs;

  return (
    <section className="sealed-prediction" aria-label="sealed prediction — the first calibration">
      <div className="sp-eyebrow">
        <span className="sp-eyebrow-mark">◈</span>
        <span>the first sealed prediction · {p.id} · {isRevealed ? "revealed" : "sealed"}</span>
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

      <p className="sp-foot">
        Plaintext including the target threshold is under the hash. At {fmtTs(p.horizon.end)} the plaintext is revealed, the view count is pulled from <code>/api/views</code>, and the calibration is computed.
        The miscalibration becomes the input for sp-002.
      </p>
    </section>
  );
}
