import Link from "next/link";

/**
 * Custom 404.
 *
 * Replaces Next's built-in page, which ships its own markup and a `next-error-h1`
 * class — a free hint about which framework and therefore which CVE list to try.
 * This one says only that the page isn't here, and points back to somewhere useful.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 py-16 text-center">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold tracking-[0.2em] text-brand-600 dark:text-brand-400">404</p>
        <h1 className="text-3xl font-semibold tracking-tight">We can&apos;t find that page</h1>
        <p className="mx-auto max-w-md text-neutral-600 dark:text-neutral-400">
          The link may be out of date, or the item may no longer be listed.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          Back to home
        </Link>
        <Link
          href="/shop"
          className="surface rounded-full px-5 py-2.5 text-sm font-semibold transition-colors hover:border-neutral-400 dark:hover:border-neutral-600"
        >
          Browse what&apos;s for sale
        </Link>
        <Link
          href="/contact"
          className="surface rounded-full px-5 py-2.5 text-sm font-semibold transition-colors hover:border-neutral-400 dark:hover:border-neutral-600"
        >
          Contact us
        </Link>
      </div>
    </div>
  );
}
