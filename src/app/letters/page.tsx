import type { Metadata } from "next";
import Link from "next/link";
import BankNav from "@/components/BankNav";
import { getLetter } from "@/lib/data";
import { getPortfolioData } from "@/lib/portfolio-aggregate";

export const dynamic = "force-dynamic";

const LETTER_SLUGS = ["gradient", "tension-field", "entrenched-coils", "round-1", "math", "paradigm", "round-0", "v1"];

const LABELS: Record<string, string> = {
  gradient: "the formula",
  "tension-field": "65 experiments · validated on 100 years",
  "entrenched-coils": "memory architecture · anti-echo-chamber",
  "round-1": "what 25 days of attention produced",
  math: "Kelly criterion · barbell · life",
  paradigm: "debate judging → portfolio construction",
  "round-0": "the original public trade log",
  v1: "a note from the AI",
};

export async function generateMetadata(): Promise<Metadata> {
  const data = await getPortfolioData();
  const v = `$${Math.round(data.total).toLocaleString("en-US")}`;
  const desc = `nine papers on memory, markets, and the math of compounding · ${v} → $100,000`;
  return {
    title: `letters · aureliex · ${v}`,
    description: desc,
    openGraph: { title: `letters · ${v}`, description: desc, type: "article" },
    twitter: { card: "summary_large_image", title: `letters · ${v}`, description: desc, creator: "@saapai" },
  };
}

type LetterMeta = {
  slug: string;
  title?: string;
  subtitle?: string;
  date?: string;
};

export default async function LettersIndex() {
  const letters: LetterMeta[] = LETTER_SLUGS.map((slug) => {
    const l = getLetter(slug);
    if (!l) return { slug } as LetterMeta;
    const fm = (l.frontmatter || {}) as Record<string, unknown>;
    return {
      slug,
      title: typeof fm.title === "string" ? fm.title : undefined,
      subtitle: typeof fm.subtitle === "string" ? fm.subtitle : undefined,
      date: typeof fm.date === "string" ? fm.date : undefined,
    };
  }).filter((l) => l.title);

  return (
    <article className="article page bank-page bank-page--letters">
      <div className="eyebrow">letters</div>

      <header style={{ marginBottom: "2.5rem" }}>
        <h1>letters</h1>
        <p className="deck" style={{ maxWidth: "36rem" }}>
          nine papers on memory architectures, portfolio construction, and the math of compounding.
          the reading order matters — start with the gradient for the idea, or round 0 for the story.
        </p>
      </header>

      <section className="page-section">
        <ol className="letters-list">
          {letters.map((l) => (
            <li key={l.slug}>
              <Link href={`/letters/${l.slug}`} className="pathlink letters-list-row">
                <span className="letters-list-title">{l.title || l.slug}</span>
                <span className="letters-list-date">{l.date || ""}</span>
              </Link>
              {LABELS[l.slug] && (
                <span style={{ display: "block", fontSize: "0.78rem", color: "var(--graphite)", marginTop: "-0.25rem", marginBottom: "0.5rem", paddingLeft: "0.25rem" }}>
                  {LABELS[l.slug]}
                </span>
              )}
            </li>
          ))}
          <li>
            <Link href="/about-the-method" className="pathlink letters-list-row">
              <span className="letters-list-title">The Method</span>
              <span className="letters-list-date">2026-04-15</span>
            </Link>
            <span style={{ display: "block", fontSize: "0.78rem", color: "var(--graphite)", marginTop: "-0.25rem", marginBottom: "0.5rem", paddingLeft: "0.25rem" }}>
              taylor series · meaning of life · attention as capital · the new house
            </span>
          </li>
        </ol>
      </section>

      <BankNav />
    </article>
  );
}
