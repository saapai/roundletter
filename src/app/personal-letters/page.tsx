import type { Metadata } from "next";
import Link from "next/link";
import { getLetter } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "letters — saathvik pai",
  description: "Papers on memory architectures, portfolio construction, and the math of compounding lives.",
};

const LETTERS = [
  { slug: "gradient", label: "the formula" },
  { slug: "tension-field", label: "the evidence" },
  { slug: "entrenched-coils", label: "the architecture" },
  { slug: "round-1", label: "the first report" },
  { slug: "math", label: "the math" },
  { slug: "paradigm", label: "the origin" },
  { slug: "round-0", label: "the beginning" },
  { slug: "v1", label: "the colophon" },
] as const;

export default function PersonalLetters() {
  const letters = LETTERS.map((l) => {
    const data = getLetter(l.slug);
    return {
      ...l,
      title: (data?.frontmatter as any)?.title ?? l.slug,
      date: (data?.frontmatter as any)?.date ?? "",
    };
  });

  return (
    <main
      style={{
        maxWidth: "640px",
        margin: "0 auto",
        padding: "3rem 1.5rem 6rem",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        color: "#1a1a1a",
        lineHeight: 1.6,
      }}
    >
      <header style={{ marginBottom: "3rem" }}>
        <p style={{ fontSize: "0.8rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#888", marginBottom: "0.5rem" }}>
          <Link href="/" style={{ color: "#888", textDecoration: "none" }}>saathvik pai</Link> · letters
        </p>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 400, margin: 0, lineHeight: 1.3 }}>
          papers on memory, markets, and the math of compounding
        </h1>
        <p style={{ fontSize: "0.9rem", color: "#666", marginTop: "0.75rem" }}>
          nine pieces. the reading order matters — each one builds on the last.
          start with the gradient if you want the idea. start with round 0 if you want the story.
        </p>
      </header>

      <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {letters.map((l, i) => (
          <li key={l.slug} style={{ borderTop: i === 0 ? "1px solid #e0e0e0" : "none", borderBottom: "1px solid #e0e0e0" }}>
            <Link
              href={`/letters/${l.slug}`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                padding: "1rem 0",
                textDecoration: "none",
                color: "inherit",
                gap: "1rem",
              }}
            >
              <span style={{ display: "flex", flexDirection: "column", gap: "0.15rem", flex: 1 }}>
                <span style={{ fontSize: "1rem", fontWeight: 500 }}>{l.title}</span>
                <span style={{ fontSize: "0.78rem", color: "#999" }}>{l.label}</span>
              </span>
              <span style={{ fontSize: "0.78rem", color: "#aaa", whiteSpace: "nowrap" }}>{l.date}</span>
            </Link>
          </li>
        ))}
        <li style={{ borderBottom: "1px solid #e0e0e0" }}>
          <Link
            href="/about-the-method"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              padding: "1rem 0",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <span style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
              <span style={{ fontSize: "1rem", fontWeight: 500 }}>The Method</span>
              <span style={{ fontSize: "0.78rem", color: "#999" }}>taylor series · meaning · attention as capital</span>
            </span>
            <span style={{ fontSize: "0.78rem", color: "#aaa" }}>2026-04-15</span>
          </Link>
        </li>
      </ol>

      <footer style={{ marginTop: "3rem", paddingTop: "1.5rem", borderTop: "1px solid #e0e0e0", fontSize: "0.78rem", color: "#aaa" }}>
        <p>also at <a href="https://aureliex.com/letters" style={{ color: "#888" }}>aureliex.com/letters</a></p>
      </footer>
    </main>
  );
}
