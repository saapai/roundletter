import Link from "next/link";

// A small golden star, bottom-left of every page — mirror of the rust ◆ (bottom-right)
export default function FridayMark() {
  return (
    <Link href="/friday" className="friday-mark" aria-label="a calendar, for a friday">
      <span className="friday-mark-glyph">✦</span>
    </Link>
  );
}
