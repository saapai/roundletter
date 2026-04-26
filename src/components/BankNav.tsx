"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// BankNav — fixed bottom nav for /portfolio + all sub-routes.
// Active route is highlighted. Always shows: home · investments ·
// art · prediction · article. Themed with currentColor so it picks
// up the per-route palette (--ink/--graphite from bank-page--<x>).

const ROUTES = [
  { href: "/", label: "home" },
  { href: "/portfolio", label: "all" },
  { href: "/portfolio/personal", label: "investments" },
  { href: "/portfolio/art", label: "art" },
  { href: "/portfolio/prediction", label: "prediction" },
  { href: "/letters/round-0", label: "article" },
];

export default function BankNav() {
  const pathname = usePathname() || "";
  return (
    <nav className="bank-nav" aria-label="bank navigation">
      {ROUTES.map((r) => {
        const active = pathname === r.href;
        return (
          <Link
            key={r.href}
            href={r.href}
            className={`bank-nav-item${active ? " bank-nav-item--active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            {r.label}
          </Link>
        );
      })}
    </nav>
  );
}
