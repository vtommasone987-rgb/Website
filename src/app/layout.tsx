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
      <body className="flex min-h-full flex-col bg-white text-zinc-900 dark:bg-black dark:text-zinc-50">
        <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-black/80">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-2 text-base font-semibold tracking-tight">
              <span className="flex h-7 w-7 items-center justify-center rounded bg-indigo-600 text-sm font-bold text-white">
                O
              </span>
              OPTS
            </Link>
            <Link
              href="/shop"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Shop
            </Link>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">{children}</main>
        <footer className="border-t border-zinc-200 py-6 dark:border-zinc-800">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 text-xs text-zinc-500">
            <span>© {new Date().getFullYear()} Ohio Pro Tech &amp; Services LLC</span>
            <nav className="flex flex-wrap items-center gap-4">
              <Link href="/faq" className="hover:text-zinc-700 dark:hover:text-zinc-300">
                FAQ
              </Link>
              <Link href="/shipping-returns" className="hover:text-zinc-700 dark:hover:text-zinc-300">
                Shipping &amp; returns
              </Link>
              <Link href="/contact" className="hover:text-zinc-700 dark:hover:text-zinc-300">
                Contact
              </Link>
              <Link href="/admin/login" className="hover:text-zinc-700 dark:hover:text-zinc-300">
                Seller sign in
              </Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
