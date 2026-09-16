"use client";

import "./globals.css";

/**
 * Last-resort boundary: catches failures in the root layout itself, which the
 * regular error.tsx sits inside and therefore cannot handle.
 *
 * Because it replaces the whole document, it has to render its own <html> and
 * <body>. It also can't rely on anything the layout provides, so it imports the
 * stylesheet directly and uses no shared components — the point of this file is
 * to survive when the shell is what broke.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 py-16 text-center">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">Something went wrong</h1>
            <p className="mx-auto max-w-md text-neutral-600 dark:text-neutral-400">
              We hit a problem loading the site. Please try again in a moment, or call us at{" "}
              <a href="tel:+14402909160" className="font-medium text-brand-600 dark:text-brand-400">
                (440) 290-9160
              </a>
              .
            </p>
            {error.digest && (
              <p className="mt-1 text-xs text-neutral-500">Reference: {error.digest}</p>
            )}
          </div>

          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
