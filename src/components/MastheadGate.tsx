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

export default function MastheadGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  if (BARE_PATHS.has(pathname)) return null;
  return <>{children}</>;
}
