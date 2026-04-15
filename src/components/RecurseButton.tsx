"use client";
import Link from "next/link";

// Rendered inside the 6969 error page. Instead of recursing further into
// /polymarket × N, clicking sends the visitor to /trailer — the "pretend
// 404" cinematic montage of everything built in the 2026-04-15 session.
// URL-level depth > 25 still returns a real 404 via the catch-all.

export default function RecurseButton({ currentDepth }: { currentDepth: number }) {
  const label =
    currentDepth >= 25
      ? "[ exit · the trailer ]"
      : `[ exit depth ${currentDepth} · roll the trailer ]`;
  return (
    <Link href="/trailer" className="six9-recurse">
      {label}
    </Link>
  );
}
