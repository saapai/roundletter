import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { Cormorant_Garamond, EB_Garamond } from "next/font/google";
import ReaderMode from "@/components/ReaderMode";
import TableOfContents from "@/components/TableOfContents";
import Insignia from "@/components/Insignia";
import FridayMark from "@/components/FridayMark";
import HuntProvider from "@/components/HuntProvider";
import SiteViewTracker from "@/components/SiteViewTracker";
import ViewsBadge from "@/components/ViewsBadge";

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
  title: "aureliex · issue #001 — just dropped. the name is bullshit. the product is beautiful.",
  description:
    "launch trailer is live. $3,453 → $100,000 by my birthday. five ai agents. one product: green credit. plus — spray paint auction, ovation hollywood, this friday sunset → midnight. you'll find it.",
  openGraph: {
    title: "aureliex · issue #001 — just dropped.",
    description:
      "the launch trailer. $3,453 → $100,000 by 21 june. five ai agents. green credit. spray paint auction · ovation hollywood · friday sunset → midnight. you'll find it.",
    url: "https://aureliex.com",
    siteName: "aureliex",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "aureliex · issue #001 — just dropped.",
    description:
      "the launch trailer. $3,453 → $100,000 by my birthday. five ai agents. green credit. spray paint auction, ovation hollywood, friday. you'll find it.",
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
              </Link>
              <div className="wordmark-sub-row">green credit <span className="wordmark-sub-sep">·</span> round 0</div>
              <div className="wordmark-epigraph">in transit <span className="wordmark-epigraph-sep">·</span> starting and then stopping</div>
              <div className="tagline">project 2, v1 <span className="tagline-sep">·</span> a portfolio kept in public, in derivative order</div>
              <div className="rule" />
              <nav className="nav">
                <Link href="/let-down" className="nav-emph">let down</Link>
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
        <HuntProvider />
        <SiteViewTracker />
        {!bare && (
          <footer className="max-w-6xl mx-auto px-6 py-12 text-[11px] tracking-[0.2em] uppercase text-graphite text-center">
            <div className="ink-rule mb-6" />
            <div>aureliex.com · real money · published in full · not investment advice</div>
            <div className="masthead-epigraph">a pre-mortem · filed before failure · <Link href="/let-down">let down</Link></div>
            <div className="masthead-epigraph" style={{ marginTop: "0.5rem" }}>
              <ViewsBadge mode="total" />
            </div>
          </footer>
        )}
      </body>
    </html>
  );
}