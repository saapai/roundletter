import type { Metadata } from "next";
import Link from "next/link";
import BankNav from "@/components/BankNav";
import { getLetter } from "@/lib/data";
import { renderMarkdown } from "@/lib/md";
import { getPortfolioData } from "@/lib/portfolio-aggregate";

export const dynamic = "force-dynamic";

const LETTER_SLUGS = ["round-0", "v1", "math", "paradigm"];

export async function generateMetadata(): Promise<Metadata> {
  const data = await getPortfolioData();
  const v = `$${Math.round(data.total).toLocaleString("en-US")}`;
  const desc = `the public letters of aureliex · current book ${v} → $100,000.`;
  return {
    title: `aureliex · letters · ${v}`,
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
  round?: number;
  body?: string;
};

export default async function LettersIndex() {
  const letters: LetterMeta[] = LETTER_SLUGS.map((slug) => {
    const l = getLetter(slug);
    if (!l) return { slug } as LetterMeta;
    const fm = (l.frontmatter || {}) as Record<string, unknown>;
    return {
      slug,
      title: typeof fm.title === "string" ? (fm.title as string) : undefined,
      subtitle: typeof fm.subtitle === "string" ? (fm.subtitle as string) : undefined,
      date: typeof fm.date === "string" ? (fm.date as string) : undefined,
      round: typeof fm.round === "number" ? (fm.round as number) : undefined,
      body: l.body,
    };
  }).filter((l) => l.title);
  const hero = letters.find((l) => l.slug === "round-0") || letters[0];
  const rest = letters.filter((l) => l.slug !== hero?.slug);
  const heroBody = hero?.body ? renderMarkdown(hero.body) : "";
  return (
    <article className="article page bank-page">
      <div className="eyebrow">letters</div>
      {hero && (
        <header style={{ maxWidth: "44rem", margin: "0 auto 2.5rem" }}>
          <p className="deck" style={{ marginBottom: "0.5rem" }}>
            {hero.date ? new Date(hero.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : ""} · round {hero.round ?? 0}
          </p>
          <h1 style={{ marginTop: 0 }}>{hero.title || hero.slug}</h1>
          {hero.subtitle && <p className="deck" style={{ fontStyle: "italic" }}>{hero.subtitle}</p>}
          <div className="prose" dangerouslySetInnerHTML={{ __html: heroBody }} />
        </header>
      )}
      {rest.length > 0 && (
        <section className="page-section" style={{ maxWidth: "44rem", margin: "3rem auto 0" }}>
          <div className="page-section-head">
            <h2>more letters</h2>
            <span className="page-section-meta">{rest.length} archived</span>
          </div>
          <ol style={{ listStyle: "none", padding: 0, margin: "1rem 0", display: "flex", flexDirection: "column", gap: "1rem" }}>
            {rest.map((l) => (
              <li key={l.slug}>
                <Link href={`/letters/${l.slug}`} className="pathlink" style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "0.85rem 0", borderBottom: "1px solid var(--rule)" }}>
                  <span style={{ fontStyle: "italic" }}>{l.title || l.slug}</span>
                  <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "0.7rem", color: "var(--graphite)" }}>{l.date || ""}</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}
      <BankNav />
    </article>
  );
}
