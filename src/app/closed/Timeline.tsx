import type { Accomplishment } from "@/lib/closed";

export default function Timeline({ entries }: { entries: Accomplishment[] }) {
  return (
    <div className="timeline">
      {entries.map((e, i) => (
        <div key={i} className="timeline-row">
          <div className="timeline-date">{e.date}</div>
          <div className="timeline-rule">
            <span className="timeline-node" />
          </div>
          <div className="timeline-label">
            {e.label}
            {e.tag && <span className={`timeline-tag tag-${e.tag}`}>{e.tag}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
