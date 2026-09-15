import Link from "next/link";
import { listPurchaseGroups, listPurchases, purchasesSummary, searchPurchases } from "@/lib/store";
import { formatPrice } from "@/lib/format";
import { createPurchaseGroupAction } from "@/app/admin/actions";
import { PurchaseTable } from "../PurchaseTable";

export default async function PurchasesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; group?: string }>;
}) {
  const { q, group } = await searchParams;
  const groups = await listPurchaseGroups();
  const summary = await purchasesSummary();
  const isFiltering = Boolean(q?.trim()) || Boolean(group);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Purchase history</h1>
        <Link
          href="/admin/purchases/new"
          className="rounded bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + Add purchase
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-neutral-300 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-sm text-neutral-500">Total spent</p>
          <p className="mt-1 text-2xl font-semibold">{formatPrice(summary.totalCents)}</p>
        </div>
        <div className="rounded-lg border border-neutral-300 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-sm text-neutral-500">Purchases logged</p>
          <p className="mt-1 text-2xl font-semibold">{summary.count}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <form className="flex flex-1 flex-wrap items-end gap-3 rounded-lg border border-neutral-300 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Search
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Item, vendor, notes…"
              className="rounded border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Group
            <select
              name="group"
              defaultValue={group ?? ""}
              className="rounded border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
            >
              <option value="">All groups</option>
              {groups.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
          >
            Search
          </button>
          {isFiltering && (
            <Link href="/admin/purchases" className="text-sm font-medium text-neutral-500 underline">
              Clear
            </Link>
          )}
        </form>

        <form
          action={createPurchaseGroupAction}
          className="flex flex-wrap items-end gap-3 rounded-lg border border-neutral-300 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <label className="flex flex-col gap-1 text-sm font-medium">
            Add a new group
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Tools"
              className="rounded border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
            />
          </label>
          <button
            type="submit"
            className="rounded bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Add group
          </button>
        </form>
      </div>

      {isFiltering ? <FilteredResults query={q} group={group} /> : <GroupedPurchases groups={groups} />}
    </div>
  );
}

async function FilteredResults({ query, group }: { query?: string; group?: string }) {
  const results = await searchPurchases({ query, group });
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-neutral-500">
        {results.length} result{results.length === 1 ? "" : "s"}
      </h2>
      <PurchaseTable purchases={results} showGroupColumn />
    </section>
  );
}

async function GroupedPurchases({ groups }: { groups: string[] }) {
  const all = await listPurchases();

  // No groups in use yet — just show one flat table rather than a redundant "Ungrouped" heading.
  if (groups.length === 0) {
    return <PurchaseTable purchases={all} />;
  }

  const ungrouped = all.filter((p) => !p.group);

  return (
    <div className="flex flex-col gap-8">
      {groups.map((g) => (
        <section key={g} className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-neutral-500">{g}</h2>
          <PurchaseTable purchases={all.filter((p) => p.group === g)} />
        </section>
      ))}
      {ungrouped.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-neutral-500">Ungrouped</h2>
          <PurchaseTable purchases={ungrouped} />
        </section>
      )}
    </div>
  );
}
