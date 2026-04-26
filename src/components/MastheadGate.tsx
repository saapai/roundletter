"use client";

import { usePathname } from "next/navigation";

// Paths that render WITHOUT the cream site-wide header + footer.
// Mirrors BARE_PATHS in layout.tsx but evaluates client-side via
// usePathname() — server-side `headers()` doesn't re-evaluate on
// client navigation, which created a "two-masthead sandwich" bug
// when going /portfolio → /.
const BARE_PATHS = new Set([
  "/",
  "/archive",
  "/17",
  "/keys",
  "/statement",
]);

// Path PREFIXES that are bare (e.g. all /portfolio/*).
// These are the dark "bank-page" routes that carry their own dark
// chrome — the cream layout masthead clashes visually.
const BARE_PREFIXES = ["/portfolio"];

export default function MastheadGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  if (BARE_PATHS.has(pathname)) return null;
  if (BARE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))) return null;
  return <>{children}</>;
}
