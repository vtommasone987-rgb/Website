export default function ShippingReturnsPage() {
  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Shipping &amp; returns</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          This page is a placeholder policy — replace it with your actual terms before going live.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <section className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
          <h2 className="text-lg font-semibold">Shipping</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            [Placeholder] Describe how items are shipped or picked up, expected timelines, and who covers the cost.
          </p>
        </section>
        <section className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
          <h2 className="text-lg font-semibold">Returns</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            [Placeholder] Describe your return window, condition requirements, and how a buyer starts a return.
          </p>
        </section>
      </div>

      <p className="text-xs text-zinc-400">
        Edit this in{" "}
        <code className="rounded bg-zinc-100 px-1 py-0.5 dark:bg-zinc-900">src/app/shipping-returns/page.tsx</code>.
      </p>
    </div>
  );
}
