import Link from "next/link";
import ViewsBadge from "@/components/ViewsBadge";

export const metadata = {
  title: "attention · aureliex",
  description:
    "attention is what matters the most. the rest of the site is a working proof of that one sentence.",
};

export default function AttentionPage() {
  return (
    <main className="attention-root">
      <div className="attention-stipple" aria-hidden="true" />
      <article className="attention-wrap">
        <p className="attention-eyebrow">// the thesis · one sentence</p>
        <h1 className="attention-hero">
          <em>attention is what matters the most.</em>
        </h1>
        <p className="attention-line">
          everything else on this site — the round letter, the five-agent panel,
          the sealed predictions, green credit — is a working proof of that one
          sentence. attention paid in is attention rewarded with better
          reasoning. the record is the return.
        </p>

        <div className="attention-counter">
          <span className="attention-counter-label">readers, all-time</span>
          <span className="attention-counter-value">
            <ViewsBadge mode="total" />
          </span>
          <span className="attention-counter-note">
            each one a person who looked. that&rsquo;s the unit.
          </span>
        </div>

        <div className="attention-routes">
          <Link href="/green-credit" className="attention-route">
            <span className="attention-route-eyebrow">the product</span>
            <span className="attention-route-line">green credit — attention, priced.</span>
          </Link>
          <Link href="/letters/round-0" className="attention-route">
            <span className="attention-route-eyebrow">the article</span>
            <span className="attention-route-line">round&nbsp;0 — the page that earns its readers.</span>
          </Link>
          <Link href="/pitch" className="attention-route">
            <span className="attention-route-eyebrow">where you came from</span>
            <span className="attention-route-line">← the pitch.</span>
          </Link>
        </div>
      </article>
    </main>
  );
}
