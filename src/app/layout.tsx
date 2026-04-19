import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { Cormorant_Garamond, EB_Garamond } from "next/font/google";
import ReaderMode from "@/components/ReaderMode";
import TableOfContents from "@/components/TableOfContents";
import Insignia from "@/components/Insignia";
import FridayMark from "@/components/FridayMark";

const PERSONAL_HOSTS: string[] = [];
const BARE_PATHS = new Set(["/17", "/keys"]);

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const body = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://aureliex.com"),
  title: "$3,453 → $100,000 by my birthday. No job. Five AI agents. — aureliex",
  description: "I have $3,453.83 and a birthday. I need a 29x. The S&P does 10x in 25 years. Five AI agents, a public logbook, and the pre-mortem, filed before I fail.",
  openGraph: {
    title: "$3,453 → $100,000 by my birthday. No job. Five AI agents.",
    description: "The pre-mortem, published before I fail. A public logbook. An ego mini-game with a P&L attached.",
    url: "https://aureliex.com",
    siteName: "aureliex",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "$3,453 → $100,000 by my birthday. No job. Five AI agents.",
    description: "A 29x. The S&P does 10x in 25 years. The gap is the entire joke, and the entire point.",
    creator: "@saapai",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  if (process.env.SHUTDOWN === "true") {
    return <html lang="en"><body /></html>;
  }

  const h = headers();
  const pathname = h.get("x-pathname") || "";
  const pathBare = BARE_PATHS.has(pathname);
  const bare = pathBare;

  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen font-body">
        {!bare && (
          <>
            <ReaderMode />
            <TableOfContents />
            <Insignia />
            <FridayMark />
            <header className="masthead">
              <Link href="/" className="wordmark">
                aureliex<span className="dot">.</span>
                <span className="wordmark-sep"> · </span>
                <span className="wordmark-sub">green credit · round 0</span>
              </Link>
              <div className="tagline">project 2, v1 · a portfolio kept in public, in derivative order</div>
              <div className="rule" />
              <nav className="nav">
                <Link href="/">letters</Link>
                <Link href="/positions">positions</Link>
                <Link href="/market">market</Link>
                <Link href="/green-credit">green credit</Link>
                <Link href="/trades">trades</Link>
                <Link href="/canvas">canvas</Link>
                <Link href="/archives">archives</Link>
              </nav>
            </header>
          </>
        )}
        <main>{children}</main>
        {!bare && (
          <footer className="max-w-6xl mx-auto px-6 py-12 text-[11px] tracking-[0.2em] uppercase text-graphite text-center">
            <div className="ink-rule mb-6" />
            <div>aureliex.com · real money · published in full · not investment advice</div>
          </footer>
        )}
      </body>
    </html>
  );
}