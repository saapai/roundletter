import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { Cormorant_Garamond, EB_Garamond } from "next/font/google";
import ReaderMode from "@/components/ReaderMode";

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
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen font-body">
        <ReaderMode />
        <header className="max-w-3xl mx-auto px-6 pt-10 pb-4">
          <div className="flex items-baseline justify-between">
            <Link href="/" className="text-xl tracking-tight font-display italic">aureliex<span className="text-graphite">.</span></Link>
            <nav className="flex gap-5 text-[13px] text-graphite tracking-wide">
              <Link href="/positions">positions</Link>
              <Link href="/trades">trades</Link>
              <Link href="/canvas">canvas</Link>
              <Link href="/about-the-method">method</Link>
            </nav>
          </div>
          <div className="ink-rule mt-3" />
        </header>
        <main className="max-w-3xl mx-auto px-6 pb-24">{children}</main>
        <footer className="max-w-3xl mx-auto px-6 pb-10 text-xs text-graphite">
          <div className="ink-rule mb-3" />
          <div className="flex justify-between">
            <span>aureliex.com — real money, published in full</span>
            <span>not investment advice. a logbook, not a newsletter.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
