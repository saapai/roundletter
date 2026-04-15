import Link from "next/link";

// Wraps the word "polymarket" anywhere in the site so clicking it routes
// directly to /argument — the live five-agent debate. Subtle styling:
// inherits color, faint underline on hover.

export default function PolymarketLink({
  children = "polymarket",
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href="/argument" className={`polymarket-link ${className ?? ""}`}>
      {children}
    </Link>
  );
}
