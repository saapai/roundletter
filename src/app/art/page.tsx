import BankNav from "@/components/BankNav";
import type { Metadata } from "next";
import { getPortfolioData, getArtPieces } from "@/lib/portfolio-aggregate";
import SalonWall from "./SalonWall";
import styles from "./page.module.css";

// /art — Salon Wall gallery (per design-bank/art-gallery-pick.md).
// ART1 paper-white asymmetric grid + ART2 FLIP-handoff lightbox +
// ART4 italic-title/roman-meta captions and COLOPHON closer.
//
// Server component: data is read on the server, only the wall + lightbox
// are client-side (SalonWall.tsx). Pieces are filtered to those with a
// delivered image — locked previews are hidden until scanned.

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getPortfolioData();
  const v = `$${Math.round(data.categories.art.current_value).toLocaleString("en-US")}`;
  const desc = `12 originals (pencil, colored pencil, pen, watercolor) · sum of starting bids ${v} · auction round 1 unlocks soon.`;
  return {
    title: `aureliex · art · 12 pieces · ${v}`,
    description: desc,
    openGraph: { title: `art · 12 pieces · ${v}`, description: desc, type: "article" },
    twitter: { card: "summary_large_image", title: `art · 12 pieces · ${v}`, description: desc, creator: "@saapai" },
  };
}

function fmtMoney(n: number): string {
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export default async function ArtPage() {
  const data = await getPortfolioData();
  const cat = data.categories.art;
  const pieces = getArtPieces().filter((p) => !!p.image);

  return (
    <article className={`article page bank-page bank-page--art ${styles.wall}`}>
      <header className={styles.head}>
        <div className={styles.eyebrow}>art</div>
        <h1 className={styles.title}>twelve plates</h1>
        <p className={styles.deck}>
          sum of starting bids · current value <strong>{fmtMoney(cat.current_value)}</strong>
        </p>
      </header>

      <SalonWall pieces={pieces} />

      <BankNav />
    </article>
  );
}
