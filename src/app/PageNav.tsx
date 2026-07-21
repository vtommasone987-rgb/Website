import Link from "next/link";

const PAGES = ["/", "/page-2"] as const;

/** Modern pill-style pager linking between the homepage's two pages. */
export function PageNav({ current }: { current: 1 | 2 }) {
  const other = current === 1 ? PAGES[1] : PAGES[0];

  return (
    <nav aria-label="Page navigation" className="flex items-center justify-center gap-3 pt-8">
      <Link
        href={other}
        aria-label="Previous page"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-50"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>

      <div className="flex items-center gap-2 rounded-full border border-zinc-200 px-3 py-2 dark:border-zinc-800">
        {PAGES.map((href, i) => {
          const pageNum = i + 1;
          const active = pageNum === current;
          return (
            <Link
              key={href}
              href={href}
              aria-label={`Go to page ${pageNum}`}
              aria-current={active ? "page" : undefined}
              className={`h-2 rounded-full transition-all ${
                active ? "w-6 bg-indigo-600" : "w-2 bg-zinc-300 hover:bg-zinc-400 dark:bg-zinc-700 dark:hover:bg-zinc-600"
              }`}
            />
          );
        })}
      </div>

      <Link
        href={other}
        aria-label="Next page"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-50"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </nav>
  );
}
