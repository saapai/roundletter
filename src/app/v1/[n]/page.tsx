import Link from "next/link";
import { notFound } from "next/navigation";
import { getThemeByN, V1_THEMES } from "@/lib/v1data";
import LetterInput from "@/components/LetterInput";

export const dynamic = "force-static";

export function generateStaticParams() {
  return V1_THEMES.map((t) => ({ n: String(t.n) }));
}

export default async function V1Page({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const theme = getThemeByN(Number(n));
  if (!theme) notFound();

  return (
    <main className="v1-root" style={{ ["--v1-green" as string]: theme.green }}>
      <div className="v1-wrap">
        <p className="v1-eyebrow">{theme.eyebrow}</p>

        {/* Storybook-style giant first letter of the page's key word.
            Prominent, decorative, stretches the typography bank. */}
        <div className="v1-hero-row">
          <span className="v1-dropcap" aria-hidden="true">{theme.hero[0]}</span>
          <span className="v1-hero-word">{theme.hero.slice(1)}</span>
        </div>

        <p className="v1-body">{theme.body}</p>
        <p className="v1-rhyme"><em>{theme.rhyme}</em></p>

        <div className="v1-rule" />
        <LetterInput theme={theme} />
        <p className="v1-hint">{theme.hint}</p>

        <nav className="v1-nav">
          <Link href="/pitch" className="v1-back">← back to the pitch</Link>
          <span className="v1-dot">·</span>
          <Link href="/" className="v1-back">home</Link>
        </nav>
      </div>
    </main>
  );
}
