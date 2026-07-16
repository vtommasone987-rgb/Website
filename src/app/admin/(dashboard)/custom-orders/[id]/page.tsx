import Link from "next/link";
import { notFound } from "next/navigation";
import { getCustomOrder, getCustomOrderAssets, listAssets, listAssignees } from "@/lib/store";
import { formatDate, formatPrice } from "@/lib/format";
import { CompletionCheckbox } from "../../CompletionCheckbox";
import {
  attachAssetToOrderAction,
  removeAssetFromOrderAction,
  setCustomOrderAssigneeAction,
  setCustomOrderStatusAction,
} from "@/app/admin/actions";
import type { CustomOrderCategory } from "@/lib/types";

const CATEGORY_LABELS: Record<CustomOrderCategory, string> = {
  "pc-build": "PC build",
  laptop: "Laptop",
  tablet: "Tablet",
  other: "Other",
};

export default async function CustomOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = getCustomOrder(id);
  if (!order) notFound();

  const linkedAssets = getCustomOrderAssets(id);
  const linkedIds = new Set(order.assetIds);
  const availableToAdd = listAssets().filter((a) => !linkedIds.has(a.id));
  const assignees = listAssignees();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/admin/custom-orders" className="text-sm text-slate-500 hover:underline">
          ← Back to custom orders
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{order.name}&apos;s request</h1>
          <label className="flex items-center gap-2 text-sm font-medium">
            Completed
            <CompletionCheckbox id={order.id} defaultChecked={order.completed} action={setCustomOrderStatusAction} />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-lg border border-slate-300 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <span className="text-slate-500">Email:</span> {order.email}
        </div>
        <div>
          <span className="text-slate-500">Submitted:</span> {formatDate(order.createdAt)}
        </div>
        <div>
          <span className="text-slate-500">Type:</span> {CATEGORY_LABELS[order.category]}
        </div>
        <div>
          <span className="text-slate-500">Quantity:</span> {order.quantity}
        </div>
        <div>
          <span className="text-slate-500">Model requested:</span> {order.model ?? "—"}
        </div>
        <div>
          <span className="text-slate-500">Budget:</span> {order.budget ?? "—"}
        </div>
        <div className="col-span-2">
          <span className="text-slate-500">Details:</span> {order.details}
        </div>
        <div className="col-span-2 flex items-center gap-2">
          <span className="text-slate-500">Assigned to:</span>
          <datalist id="order-detail-assignees">
            {assignees.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
          <form action={setCustomOrderAssigneeAction.bind(null, order.id)} className="flex items-center gap-2">
            <input
              name="assignedTo"
              list="order-detail-assignees"
              placeholder="Unassigned"
              defaultValue={order.assignedTo ?? ""}
              className="w-40 rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
            <button type="submit" className="text-sm font-medium text-indigo-600 underline dark:text-indigo-400">
              Save
            </button>
          </form>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-lg font-semibold">Linked assets</h2>
          <p className="text-sm text-slate-500">
            Attach inventory assets to this order as you build or allocate it — e.g. the specific units for this
            request.
          </p>
        </div>

        {linkedAssets.length === 0 ? (
          <p className="text-sm text-slate-500">No assets linked yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-300 bg-white dark:border-slate-800 dark:bg-slate-900">
            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
              <thead className="bg-slate-50 text-left dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 font-medium">Model</th>
                  <th className="px-4 py-2 font-medium">Serial #</th>
                  <th className="px-4 py-2 font-medium">Price</th>
                  <th className="px-4 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {linkedAssets.map((asset) => (
                  <tr key={asset.id}>
                    <td className="px-4 py-2">
                      <Link href={`/admin/assets/${asset.id}`} className="underline">
                        {asset.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-slate-500">{asset.model}</td>
                    <td className="px-4 py-2 font-mono text-xs text-slate-500">{asset.serialNumber}</td>
                    <td className="px-4 py-2">{formatPrice(asset.priceCents)}</td>
                    <td className="px-4 py-2">
                      <form action={removeAssetFromOrderAction.bind(null, order.id, asset.id)}>
                        <button type="submit" className="text-sm font-medium text-red-600 underline dark:text-red-400">
                          Remove
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {availableToAdd.length > 0 ? (
          <form action={attachAssetToOrderAction.bind(null, order.id)} className="flex items-end gap-3">
            <label className="flex flex-col gap-1 text-sm font-medium">
              Add an asset
              <select
                name="assetId"
                required
                className="min-w-[20rem] rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              >
                {availableToAdd.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name} — {asset.model} ({asset.serialNumber})
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              Add
            </button>
          </form>
        ) : (
          <p className="text-sm text-slate-500">Every inventory asset is already linked to this order.</p>
        )}
      </div>
    </div>
  );
}
