"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Error boundary for anything that throws while rendering a page.
 *
 * Next hides the real error from the browser in production and passes only a
 * `digest` — an id that matches a line in the server log. That split is the point:
 * the visitor gets a sentence and a way forward, while the stack trace, query and
 * connection details stay server-side. The digest is shown so someone reporting a
 * problem can quote it and we can find the exact entry.
 *
 * Must be a Client Component — an error boundary needs React state on the client.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaces in the browser console for our own debugging; in production this
    // object carries the digest, not the underlying message.
    console.error("Page failed to render:", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 py-16 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Something went wrong</h1>
        <p className="mx-auto max-w-md text-neutral-600 dark:text-neutral-400">
          This page didn&apos;t load properly. Trying again usually fixes it — if it doesn&apos;t,
          call us at{" "}
          <a href="tel:+14402909160" className="font-medium text-brand-600 dark:text-brand-400">
            (440) 290-9160
          </a>
          .
        </p>
        {error.digest && (
          <p className="mt-1 text-xs text-neutral-500">Reference: {error.digest}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Try again
        </button>
        <Link
          href="/"
          className="surface rounded-full px-5 py-2.5 text-sm font-semibold transition-colors hover:border-neutral-400 dark:hover:border-neutral-600"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
