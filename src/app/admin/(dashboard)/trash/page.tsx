import { listDeletedAssets, listDeletedPurchases, TRASH_RETENTION_DAYS, trashExpiryDate } from "@/lib/store";
import { formatDate, formatPrice } from "@/lib/format";
import {
  permanentlyDeleteAssetAction,
  permanentlyDeletePurchaseAction,
  restoreAssetAction,
  restorePurchaseAction,
} from "@/app/admin/actions";

export default async function TrashPage() {
  const deletedAssets = await listDeletedAssets();
  const deletedPurchases = await listDeletedPurchases();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Trash</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Deleted assets and purchases land here first — restore them, or delete forever to remove them for good.
          Anything left here gets permanently deleted automatically after {TRASH_RETENTION_DAYS} days.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Deleted assets</h2>
        {deletedAssets.length === 0 ? (
          <p className="text-sm text-neutral-500">Nothing here.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-neutral-300 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <table className="min-w-full divide-y divide-neutral-200 text-sm dark:divide-neutral-800">
              <thead className="bg-neutral-50 text-left dark:bg-neutral-800">
                <tr>
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 font-medium">Model</th>
                  <th className="px-4 py-2 font-medium">Serial #</th>
                  <th className="px-4 py-2 font-medium">Price</th>
                  <th className="px-4 py-2 font-medium">Auto-deletes</th>
                  <th className="px-4 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {deletedAssets.map((asset) => (
                  <tr key={asset.id}>
                    <td className="px-4 py-2">{asset.name}</td>
                    <td className="px-4 py-2 text-neutral-500">{asset.model}</td>
                    <td className="px-4 py-2 font-mono text-xs text-neutral-500">{asset.serialNumber}</td>
                    <td className="px-4 py-2">{formatPrice(asset.priceCents)}</td>
                    <td className="whitespace-nowrap px-4 py-2 text-neutral-500">
                      {formatDate(trashExpiryDate(asset.deletedAt!))}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <form action={restoreAssetAction.bind(null, asset.id)}>
                          <button
                            type="submit"
                            className="text-sm font-medium text-brand-600 underline dark:text-brand-400"
                          >
                            Restore
                          </button>
                        </form>
                        <form action={permanentlyDeleteAssetAction.bind(null, asset.id)}>
                          <button type="submit" className="text-sm font-medium text-red-600 underline dark:text-red-400">
                            Delete forever
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Deleted purchases</h2>
        {deletedPurchases.length === 0 ? (
          <p className="text-sm text-neutral-500">Nothing here.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-neutral-300 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <table className="min-w-full divide-y divide-neutral-200 text-sm dark:divide-neutral-800">
              <thead className="bg-neutral-50 text-left dark:bg-neutral-800">
                <tr>
                  <th className="px-4 py-2 font-medium">Item</th>
                  <th className="px-4 py-2 font-medium">Vendor</th>
                  <th className="px-4 py-2 font-medium">Total cost</th>
                  <th className="px-4 py-2 font-medium">Auto-deletes</th>
                  <th className="px-4 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {deletedPurchases.map((purchase) => (
                  <tr key={purchase.id}>
                    <td className="px-4 py-2">{purchase.item}</td>
                    <td className="px-4 py-2 text-neutral-500">{purchase.vendor ?? "—"}</td>
                    <td className="px-4 py-2">{formatPrice(purchase.totalCostCents)}</td>
                    <td className="whitespace-nowrap px-4 py-2 text-neutral-500">
                      {formatDate(trashExpiryDate(purchase.deletedAt!))}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <form action={restorePurchaseAction.bind(null, purchase.id)}>
                          <button
                            type="submit"
                            className="text-sm font-medium text-brand-600 underline dark:text-brand-400"
                          >
                            Restore
                          </button>
                        </form>
                        <form action={permanentlyDeletePurchaseAction.bind(null, purchase.id)}>
                          <button type="submit" className="text-sm font-medium text-red-600 underline dark:text-red-400">
                            Delete forever
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
