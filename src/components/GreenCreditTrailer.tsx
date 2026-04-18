// 10-second looped trailer that leads /green-credit. Pure CSS keyframes —
// no client bundle, no JS state. Each "beat" is a single line of type with
// a staggered reveal-and-fade. Final beat holds the green-credit wordmark.

export default function GreenCreditTrailer({ dayN }: { dayN?: number }) {
  return (
    <section className="gc-trailer" aria-label="green credit · the 10-second trailer">
      <div className="gc-trailer-eyebrow">
        <span className="gc-trailer-dot" aria-hidden="true" />
        <span>// the trailer · 10 seconds · loops</span>
        {typeof dayN === "number" && <span className="gc-trailer-daychip">day {dayN} · live</span>}
      </div>

      <div className="gc-trailer-stage">
        <span className="gc-trailer-beat gc-beat-1">// brewing…</span>
        <span className="gc-trailer-beat gc-beat-2">$3,453</span>
        <span className="gc-trailer-beat gc-beat-3">
          <span className="gc-trailer-arrow">→</span> $100,000
        </span>
        <span className="gc-trailer-beat gc-beat-4">by my birthday.</span>
        <span className="gc-trailer-beat gc-beat-5">68 days. no job.</span>
        <span className="gc-trailer-beat gc-beat-6">five AI agents.</span>
        <span className="gc-trailer-beat gc-beat-7">one public book.</span>
        <span className="gc-trailer-beat gc-beat-8 gc-beat-final">green credit.</span>
      </div>

      <a href="#manifesto" className="gc-trailer-scroll" aria-label="scroll to the full manifesto">
        <span className="gc-trailer-scroll-label">the full manifesto</span>
        <span className="gc-trailer-scroll-arrow" aria-hidden="true">↓</span>
      </a>
    </section>
  );
}
