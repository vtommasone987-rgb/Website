import Link from "next/link";
import type { Purchase } from "@/lib/types";
import { formatDateOnly, formatPrice } from "@/lib/format";
import { deletePurchaseAction } from "@/app/admin/actions";
import { getAssetNumbers } from "@/lib/store";

export async function PurchaseTable({
  purchases,
  showGroupColumn = false,
}: {
  purchases: Purchase[];
  showGroupColumn?: boolean;
}) {
  if (purchases.length === 0) {
    return <p className="px-1 text-sm text-neutral-500">No purchases here.</p>;
  }

  // Resolved in one query up front rather than per row.
  const assetNumbers = await getAssetNumbers(
    purchases.map((p) => p.assetId).filter((id): id is string => Boolean(id)),
  );

  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-300 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <table className="min-w-full divide-y divide-neutral-200 text-sm dark:divide-neutral-800">
        <thead className="bg-neutral-50 text-left dark:bg-neutral-800">
          <tr>
            <th className="px-4 py-2 font-medium">Date</th>
            <th className="px-4 py-2 font-medium">Asset #</th>
            <th className="px-4 py-2 font-medium">Item</th>
            <th className="px-4 py-2 font-medium">Vendor</th>
            <th className="px-4 py-2 font-medium">Qty</th>
            <th className="px-4 py-2 font-medium">Total cost</th>
            <th className="px-4 py-2 font-medium">Notes</th>
            {showGroupColumn && <th className="px-4 py-2 font-medium">Group</th>}
            <th className="px-4 py-2 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {purchases.map((purchase) => {
            const assetNumber = purchase.assetId ? assetNumbers.get(purchase.assetId) : undefined;
            return (
              <tr key={purchase.id}>
                <td className="whitespace-nowrap px-4 py-2 text-neutral-500">{formatDateOnly(purchase.purchasedAt)}</td>
                <td className="whitespace-nowrap px-4 py-2 text-neutral-500">
                  {assetNumber !== undefined && purchase.assetId ? (
                    <Link href={`/admin/assets/${purchase.assetId}`} className="underline">
                      #{assetNumber}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-2">{purchase.item}</td>
                <td className="px-4 py-2 text-neutral-500">{purchase.vendor ?? "—"}</td>
                <td className="px-4 py-2">{purchase.quantity}</td>
                <td className="px-4 py-2">{formatPrice(purchase.totalCostCents)}</td>
                <td className="px-4 py-2 max-w-xs text-neutral-500">{purchase.notes ?? "—"}</td>
                {showGroupColumn && <td className="px-4 py-2 text-neutral-500">{purchase.group ?? "—"}</td>}
                <td className="px-4 py-2">
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/purchases/${purchase.id}`} className="text-sm font-medium underline">
                      Edit
                    </Link>
                    <form action={deletePurchaseAction.bind(null, purchase.id)}>
                      <button type="submit" className="text-sm font-medium text-red-600 underline dark:text-red-400">
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
