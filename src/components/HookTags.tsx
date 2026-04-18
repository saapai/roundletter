// Orange-pill tag bar. Visually quotes the source platform; content is theses,
// not categories. No click targets — these are register, not routes.

const TAGS = [
  "BULLISH",
  "BEARISH",
  "QUANTUM",
  "MEGA-CAP",
  "DRY-POWDER",
  "LOTTERY",
  "10-YEAR",
  "29x",
];

export default function HookTags() {
  return (
    <section className="v3-tags" aria-label="the theses, as tags">
      <div className="v3-tags-eyebrow">// the book, as tags</div>
      <ul className="v3-tags-list">
        {TAGS.map((t) => (
          <li key={t} className="v3-tag">{t}</li>
        ))}
      </ul>
    </section>
  );
}
