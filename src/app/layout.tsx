import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OPTS",
  description:
    "Ohio Pro Tech & Services LLC — quality IT equipment, tracked by serial number, with sales and inventory managed in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <header className="sticky top-0 z-10 border-b border-neutral-200/70 bg-[var(--background)]/80 backdrop-blur-md dark:border-neutral-800/70">
          {/* Three tracks so Shop stays optically centered regardless of how wide
              the logo or the right-hand buttons get. */}
          <nav className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-4">
            {/* The logo artwork is dark ink on transparent, so it needs a light
                plate behind it to stay legible in dark mode. */}
            <Link href="/" className="justify-self-start">
              <Image
                src="/opts-logo.png"
                alt="Ohio Pro Tech &amp; Services LLC"
                width={2770}
                height={1127}
                priority
                className="h-10 w-auto rounded dark:bg-white dark:px-2 dark:py-1"
              />
            </Link>

            <Link
              href="/shop"
              className="justify-self-center rounded-full px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-200/60 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-50"
            >
              Shop
            </Link>

            <div className="flex items-center justify-self-end gap-2">
              <Link
                href="/contact"
                className="flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold whitespace-nowrap text-white shadow-[inset_0_1px_0_0_rgb(255_255_255_/_0.3),0_1px_2px_0_rgb(0_0_0_/_0.2)] transition-colors hover:bg-brand-700"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                  <path
                    d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
                Contact
              </Link>
              {/* Label collapses to just the icon on narrow screens so the header
                  stays on one line — the aria-label keeps it announced either way. */}
              <Link
                href="/admin/login"
                aria-label="Sign in"
                className="surface flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors hover:border-neutral-400 sm:px-4 dark:hover:border-neutral-600"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-neutral-400" aria-hidden="true">
                  <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="2" />
                  <path d="M5 20a7 7 0 0 1 14 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className="hidden sm:inline">Sign in</span>
              </Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">{children}</main>
        <footer className="border-t border-neutral-200 dark:border-neutral-800">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-xs text-neutral-500">
            <span className="flex items-center gap-3">
              <Image
                src="/opts-logo.png"
                alt=""
                width={2770}
                height={1127}
                className="h-7 w-auto rounded dark:bg-white dark:px-1.5 dark:py-0.5"
              />
              <span>© {new Date().getFullYear()} Ohio Pro Tech &amp; Services LLC</span>
            </span>
            <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <Link href="/#what-we-do" className="transition-colors hover:text-neutral-900 dark:hover:text-neutral-100">
                What We Do
              </Link>
              <Link href="/faq" className="transition-colors hover:text-neutral-900 dark:hover:text-neutral-100">
                FAQ
              </Link>
              <Link href="/shipping-returns" className="transition-colors hover:text-neutral-900 dark:hover:text-neutral-100">
                Shipping &amp; returns
              </Link>
              <Link href="/contact" className="transition-colors hover:text-neutral-900 dark:hover:text-neutral-100">
                Contact
              </Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
