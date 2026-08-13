export default function ShippingReturnsPage() {
  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Shipping &amp; returns</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          This page is a placeholder policy — replace it with your actual terms before going live.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <section className="surface rounded-xl p-5">
          <h2 className="text-lg font-semibold">Shipping</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            [Placeholder] Describe how items are shipped or picked up, expected timelines, and who covers the cost.
          </p>
        </section>
        <section className="surface rounded-xl p-5">
          <h2 className="text-lg font-semibold">Returns</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            [Placeholder] Describe your return window, condition requirements, and how a buyer starts a return.
          </p>
        </section>
      </div>

      <p className="text-xs text-slate-400">
        Edit this in{" "}
        <code className="rounded bg-slate-200/60 px-1 py-0.5 dark:bg-slate-800">
          src/app/shipping-returns/page.tsx
        </code>
        .
      </p>
    </div>
  );
}
