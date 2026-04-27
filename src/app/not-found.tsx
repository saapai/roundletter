import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "not found · aureliex",
  description:
    "the page you reached for isn't where it was. the rest of the site is still here.",
};

export default function NotFound() {
  return (
    <article className="article notfound">
      <div className="eyebrow">404 · not found</div>
      <h1 className="notfound-hero">
        the page you reached for <em>isn&rsquo;t</em> where it was.
      </h1>
      <p className="notfound-deck">
        either it never existed, or it moved, or it&rsquo;s a wrong route on
        purpose — the site is built with a few of those.
      </p>

      <hr className="ornament" />

      <ul className="notfound-list">
        <li>
          <Link href="/" className="notfound-link">
            <span className="notfound-link-eyebrow">home</span>
            <span className="notfound-link-line">the latest issue, top of the page.</span>
          </Link>
        </li>
        <li>
          <Link href="/letters/round-0" className="notfound-link">
            <span className="notfound-link-eyebrow">round&nbsp;letter</span>
            <span className="notfound-link-line">round&nbsp;0 — the one the site is named after.</span>
          </Link>
        </li>
        <li>
          <Link href="/6969" className="notfound-link">
            <span className="notfound-link-eyebrow">credits</span>
            <span className="notfound-link-line">the wayfinder. every beat of the site, in order.</span>
          </Link>
        </li>
        <li>
          <Link href="/eggs" className="notfound-link">
            <span className="notfound-link-eyebrow">archives</span>
            <span className="notfound-link-line">the things that aren&rsquo;t supposed to be findable.</span>
          </Link>
        </li>
      </ul>

      <p className="notfound-coda">
        if you typed the address from a screenshot or a flyer, it&rsquo;s
        possible the address was the joke.
      </p>
    </article>
  );
}
