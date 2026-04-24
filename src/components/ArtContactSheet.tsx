import Link from "next/link";
import art from "@/data/art-portfolio.json";

type Piece = {
  id: string;
  title: string;
  medium: string;
  date: string;
  image: string;
  start_bid: number;
};

type Manifest = { pieces: Piece[] };

export default function ArtContactSheet() {
  const pieces = (art as Manifest).pieces.slice(0, 6);
  return (
    <section className="h2-art" aria-label="art portfolio · contact sheet">
      <div className="h2-art-head">
        <span className="h2-art-eye">// the portfolio · locked</span>
        <Link href="/#art" className="h2-art-count">14 pieces · opens with round 1 ↗</Link>
      </div>
      <div className="h2-art-grid">
        {pieces.map((p) => (
          <div key={p.id} className="h2-art-tile" aria-label={p.title}>
            <span className="h2-art-tile-title">{p.title}</span>
            <div className="h2-art-tile-inner">
              <span>
                {p.medium} · {p.date.slice(0, 4)} · from ${p.start_bid}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
