import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "roundletter — aureliex",
  description: "A portfolio kept in public, so I can't lie to myself later.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="max-w-5xl mx-auto px-6 pt-10 pb-6">
          <div className="flex items-baseline justify-between">
            <Link href="/" className="text-2xl tracking-tight">roundletter<span className="text-graphite">.</span></Link>
            <nav className="flex gap-5 text-sm text-graphite">
              <Link href="/letters/round-0">letters</Link>
              <Link href="/positions">positions</Link>
              <Link href="/trades">trades</Link>
              <Link href="/canvas">canvas</Link>
              <Link href="/about-the-method">method</Link>
            </nav>
          </div>
          <div className="ink-rule mt-4" />
          <p className="text-xs text-graphite mt-3 italic">A portfolio kept in public, so I can't lie to myself later.</p>
        </header>
        <main className="max-w-5xl mx-auto px-6 pb-24">{children}</main>
        <footer className="max-w-5xl mx-auto px-6 pb-10 text-xs text-graphite">
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
