"use client";

// SunGlyph — small SVG sun that rotates per `rotation` prop (degrees).
// Used in the Constellation sticky bottom totals bar.

type Props = {
  rotation: number;
  size?: number;
  className?: string;
};

const RAYS = 12;

export default function SunGlyph({ rotation, size = 28, className }: Props) {
  const half = size / 2;
  const rays = Array.from({ length: RAYS }, (_, i) => {
    const angle = (i * 360) / RAYS;
    return (
      <line
        key={i}
        x1={half}
        y1={2}
        x2={half}
        y2={6}
        stroke="currentColor"
        strokeWidth={1.2}
        strokeLinecap="round"
        transform={`rotate(${angle} ${half} ${half})`}
      />
    );
  });
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      style={{
        transform: `rotate(${rotation}deg)`,
        transition: "transform 600ms cubic-bezier(.2,.7,.2,1)",
      }}
    >
      <circle cx={half} cy={half} r={half * 0.42} fill="currentColor" />
      <circle
        cx={half}
        cy={half}
        r={half * 0.58}
        fill="none"
        stroke="currentColor"
        strokeWidth={0.8}
        opacity={0.55}
      />
      {rays}
    </svg>
  );
}
