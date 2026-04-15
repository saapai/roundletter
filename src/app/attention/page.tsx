import Link from "next/link";

export const metadata = {
  title: "attention",
};

export default function AttentionEasterEgg() {
  return (
    <main className="attention-root">
      <div className="attention-wrap">
        <p className="attention-eyebrow">// easter egg</p>
        <h1 className="attention-hero">
          <em>attention is what matters the most.</em>
        </h1>
        <p className="attention-line">
          <em>this page is a placeholder — saapai is still deciding what belongs here.</em>
        </p>
        <Link href="/pitch" className="attention-back">← back to the pitch</Link>
      </div>
    </main>
  );
}
