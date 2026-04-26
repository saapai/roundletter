import type { Metadata } from "next";
import Link from "next/link";

// /archives — PR3 of the site simplification.
//
// Subtle, lowercase index of "easter egg" routes that remain reachable
// by URL but are no longer linked from the masthead nav. Plain text,
// no headers, footnote-tone. The longer derivative-stack essay that
// used to live here was retired with the nav trim — the routes
// themselves are still there, just unlinked from the front door.

export const metadata: Metadata = {
  title: "aureliex · archives",
  description: "the unlinked routes — still reachable by url.",
};

const ROUTES: string[] = [
  "/canvas",
  "/closed",
  "/pitch",
  "/17",
  "/6969",
  "/arc",
  "/argument",
  "/attention",
  "/friday",
  "/let-down",
  "/green-credit",
  "/keys",
  "/v1",
  "/letters/math",
  "/letters/paradigm",
  "/letters/v1",
  "/statement/panel",
  "/market",
  "/trades",
  "/positions",
];

export default function Archives() {
  return (
    <article className="article page archives">
      <p className="archives-epigraph">
        unlinked from the nav. still reachable by url.
      </p>
      <ul className="archives-index">
        {ROUTES.map((r) => (
          <li key={r}>
            <Link href={r}>{r}</Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
