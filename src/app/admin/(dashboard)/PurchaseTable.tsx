import Link from "next/link";
import type { Purchase } from "@/lib/types";
import { formatDateOnly, formatPrice } from "@/lib/format";
import { deletePurchaseAction } from "@/app/admin/actions";
import { getAsset } from "@/lib/store";

export function PurchaseTable({
  purchases,
  showGroupColumn = false,
}: {
  purchases: Purchase[];
  showGroupColumn?: boolean;
}) {
  if (purchases.length === 0) {
    return <p className="px-1 text-sm text-slate-500">No purchases here.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-300 bg-white dark:border-slate-800 dark:bg-slate-900">
      <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
        <thead className="bg-slate-50 text-left dark:bg-slate-800">
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
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {purchases.map((purchase) => {
            const linkedAsset = purchase.assetId ? getAsset(purchase.assetId) : undefined;
            return (
              <tr key={purchase.id}>
                <td className="whitespace-nowrap px-4 py-2 text-slate-500">{formatDateOnly(purchase.purchasedAt)}</td>
                <td className="whitespace-nowrap px-4 py-2 text-slate-500">
                  {linkedAsset ? (
                    <Link href={`/admin/assets/${linkedAsset.id}`} className="underline">
                      #{linkedAsset.assetNumber}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-2">{purchase.item}</td>
                <td className="px-4 py-2 text-slate-500">{purchase.vendor ?? "—"}</td>
                <td className="px-4 py-2">{purchase.quantity}</td>
                <td className="px-4 py-2">{formatPrice(purchase.totalCostCents)}</td>
                <td className="px-4 py-2 max-w-xs text-slate-500">{purchase.notes ?? "—"}</td>
                {showGroupColumn && <td className="px-4 py-2 text-slate-500">{purchase.group ?? "—"}</td>}
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
