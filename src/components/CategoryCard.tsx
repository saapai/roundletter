"use client";
import { useId } from "react";
import Link from "next/link";

// Small editorial tile used on /portfolio for each category (Personal,
// External, Art, Prediction). Renders a label, current value (or "coming
// soon" stub), %change, and a tiny SVG sparkline. PR1 ships these as
// placeholders — `value` may be null and `series` may be empty/flat.
// PR2 will wire real data + the per-category subroutes.

export type CategoryCardProps = {
  label: string;
  value: number | null;
  pctChange?: number | null;
  // Tiny sparkline series — same { ts, value } shape as PortfolioGrowthChart.
  // Empty array renders a flat baseline.
  series?: Array<{ ts: number; value: number }>;
  // Optional href — PR1 leaves this unset (no subroutes yet); kept on the
  // type so PR2 can fill it in without changing call sites.
  href?: string;
  // Status copy for the value slot when `value` is null.
  placeholder?: string;
};

export default function CategoryCard({
  label,
  value,
  pctChange = null,
  series = [],
  href,
  placeholder = "current value coming soon",
}: CategoryCardProps) {
  const reactId = useId();
  const gradId = `cc-fill-${reactId.replace(/:/g, "")}`;

  const up = (pctChange ?? 0) >= 0;
  const valueText =
    value != null
      ? `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
      : placeholder;
  const pctText =
    pctChange != null
      ? `${up ? "+" : "−"}${Math.abs(pctChange).toFixed(2)}%`
      : "—";

  // Mini sparkline geometry — short and wide, ~70px tall.
  const W = 240;
  const H = 56;
  const padX = 4;
  const padY = 6;
  const points = series.length >= 2 ? series : [];
  const values = points.map((p) => p.value);
  const min = points.length ? Math.min(...values) : 0;
  const max = points.length ? Math.max(...values) : 1;
  const range = max - min || 1;
  const step = (W - padX * 2) / Math.max(1, points.length - 1);
  const path = points
    .map((p, i) => {
      const x = padX + i * step;
      const y = padY + (H - padY * 2) * (1 - (p.value - min) / range);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
  const area = points.length
    ? `${path} L ${(padX + (points.length - 1) * step).toFixed(2)} ${H - padY} L ${padX} ${H - padY} Z`
    : "";
  const color = up ? "#3B7A4A" : "#8B3A2E";

  const inner = (
    <article className="cat-card">
      <header className="cat-card-head">
        <span className="cat-card-label">{label}</span>
        <span className={`cat-card-pct ${up ? "is-up" : "is-down"}`}>{pctText}</span>
      </header>
      <div className={`cat-card-value ${value == null ? "is-stub" : up ? "is-up" : "is-down"}`}>
        {valueText}
      </div>
      <svg
        className="cat-card-spark"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {points.length >= 2 ? (
          <>
            <defs>
              <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.22" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={area} fill={`url(#${gradId})`} />
            <path
              d={path}
              fill="none"
              stroke={color}
              strokeWidth="1.4"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </>
        ) : (
          // Flat baseline when no data
          <line
            x1={padX}
            y1={H / 2}
            x2={W - padX}
            y2={H / 2}
            stroke="rgba(28,26,23,0.18)"
            strokeDasharray="3 3"
            strokeWidth="1"
          />
        )}
      </svg>
    </article>
  );

  return href ? (
    <Link href={href} className="cat-card-link">
      {inner}
    </Link>
  ) : (
    inner
  );
}
