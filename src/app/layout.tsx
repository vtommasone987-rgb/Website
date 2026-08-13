import type { Metadata } from "next";
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
        <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-[var(--background)]/80 backdrop-blur-md dark:border-slate-800/70">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-2.5 text-base font-semibold tracking-tight">
              <span className="flex h-7 w-7 items-center justify-center rounded bg-indigo-600 text-sm font-bold text-white">
                O
              </span>
              OPTS
            </Link>
            <Link
              href="/shop"
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200/60 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-50"
            >
              Shop
            </Link>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">{children}</main>
        <footer className="border-t border-slate-200 dark:border-slate-800">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-xs text-slate-500">
            <span className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-indigo-600 text-[10px] font-bold text-white">
                O
              </span>
              © {new Date().getFullYear()} Ohio Pro Tech &amp; Services LLC
            </span>
            <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <Link href="/#what-we-do" className="transition-colors hover:text-slate-900 dark:hover:text-slate-100">
                What We Do
              </Link>
              <Link href="/faq" className="transition-colors hover:text-slate-900 dark:hover:text-slate-100">
                FAQ
              </Link>
              <Link href="/shipping-returns" className="transition-colors hover:text-slate-900 dark:hover:text-slate-100">
                Shipping &amp; returns
              </Link>
              <Link href="/contact" className="transition-colors hover:text-slate-900 dark:hover:text-slate-100">
                Contact
              </Link>
              <Link href="/admin/login" className="transition-colors hover:text-slate-900 dark:hover:text-slate-100">
                Seller sign in
              </Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
