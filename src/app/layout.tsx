import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { Bebas_Neue, Cormorant_Garamond, EB_Garamond, Fraunces, Ms_Madi } from "next/font/google";
import ReaderMode from "@/components/ReaderMode";
import TableOfContents from "@/components/TableOfContents";
import Insignia from "@/components/Insignia";
import FridayMark from "@/components/FridayMark";
import HuntProvider from "@/components/HuntProvider";
import SiteViewTracker from "@/components/SiteViewTracker";
import ViewsBadge from "@/components/ViewsBadge";
import FloatingNav from "@/components/FloatingNav";
import MastheadGate from "@/components/MastheadGate";

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bebas",
  display: "swap",
});

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const signature = Ms_Madi({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-signature",
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
  title: "aureliex · letters on building, taste, and what lasts",
  description:
    "563 commits. 6 eras. a public record of thinking out loud. by saathvik pai.",
  openGraph: {
    title: "aureliex · letters on building, taste, and what lasts",
    description:
      "563 commits. 6 eras. a public record of thinking out loud. by saathvik pai.",
    url: "https://aureliex.com",
    siteName: "aureliex",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "aureliex · letters on building, taste, and what lasts",
    description:
      "563 commits. 6 eras. a public record of thinking out loud. by saathvik pai.",
    creator: "@saapai",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  if (process.env.SHUTDOWN === "true") {
    return <html lang="en"><body /></html>;
  }

  return (
    <html lang="en" className={`${bebas.variable} ${display.variable} ${body.variable} ${fraunces.variable} ${signature.variable}`}>
      <body className="min-h-screen font-body">
        <MastheadGate>
          <ReaderMode />
          <TableOfContents />
          <Insignia />
          <FridayMark />
          <header className="masthead">
            <Link href="/" className="wordmark">
              aureliex<span className="dot">.</span>
            </Link>
            <div className="rule" />
            <nav className="nav">
              <Link href="/stocks">investments</Link>
              <Link href="/prediction">prediction</Link>
              <Link href="/panel">panel</Link>
              <Link href="/buy">buy</Link>
              <Link href="/eggs">archives</Link>
            </nav>
          </header>
        </MastheadGate>
        <main>{children}</main>
        <HuntProvider />
        <SiteViewTracker />
        <FloatingNav />
        <MastheadGate>
          <footer className="max-w-6xl mx-auto px-6 py-12 text-[11px] tracking-[0.2em] uppercase text-graphite text-center">
            <div className="ink-rule mb-6" />
            <div>aureliex.com · real money · published in full · not investment advice</div>
            <div className="masthead-epigraph" style={{ marginTop: "0.5rem" }}>
              <ViewsBadge mode="total" />
            </div>
          </footer>
        </MastheadGate>
      </body>
    </html>
  );
}