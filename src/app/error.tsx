"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (typeof console !== "undefined") {
      console.error("[aureliex] runtime error:", error);
    }
  }, [error]);

  return (
    <article className="article notfound notfound--error">
      <div className="eyebrow">500 · something gave way</div>
      <h1 className="notfound-hero">
        the page tried to draw itself and <em>didn&rsquo;t</em>.
      </h1>
      <p className="notfound-deck">
        a piece of the build broke at runtime. the rest of the site is still
        standing — most of it, anyway. this surface will retry once you
        ask it to.
      </p>

      <hr className="ornament" />

      <div className="notfound-actions">
        <button type="button" className="notfound-retry" onClick={() => reset()}>
          try again
        </button>
        <Link href="/" className="notfound-home">← back to the front page</Link>
      </div>

      {error?.digest ? (
        <p className="notfound-digest">
          digest · <code>{error.digest}</code>
        </p>
      ) : null}

      <p className="notfound-coda">
        if this keeps happening on the same route, that&rsquo;s a real bug.
        every page on this site is a single editor — saapai — and a real
        bug is on him.
      </p>
    </article>
  );
}
