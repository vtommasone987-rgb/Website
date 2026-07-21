import Link from "next/link";
import type { Asset } from "@/lib/types";
import { formatPrice } from "@/lib/format";

/** Shared "attach/detach inventory assets" section — used by custom orders, tickets, and purchases. */
export function LinkedAssets({
  linkedAssets,
  availableToAdd,
  attachAction,
  removeAction,
}: {
  linkedAssets: Asset[];
  availableToAdd: Asset[];
  attachAction: (formData: FormData) => void;
  removeAction: (assetId: string, formData: FormData) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-lg font-semibold">Linked assets</h2>
        <p className="text-sm text-slate-500">Attach inventory assets — e.g. the specific unit this relates to.</p>
      </div>

      {linkedAssets.length === 0 ? (
        <p className="text-sm text-slate-500">No assets linked yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-300 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
            <thead className="bg-slate-50 text-left dark:bg-slate-800">
              <tr>
                <th className="px-4 py-2 font-medium">Asset #</th>
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
                  <td className="px-4 py-2 font-mono text-xs text-slate-500">{asset.assetNumber}</td>
                  <td className="px-4 py-2">
                    <Link href={`/admin/assets/${asset.id}`} className="underline">
                      {asset.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-slate-500">{asset.model}</td>
                  <td className="px-4 py-2 font-mono text-xs text-slate-500">{asset.serialNumber}</td>
                  <td className="px-4 py-2">{formatPrice(asset.priceCents)}</td>
                  <td className="px-4 py-2">
                    <form action={removeAction.bind(null, asset.id)}>
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
        <form action={attachAction} className="flex items-end gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Add an asset
            <select
              name="assetId"
              required
              className="min-w-[20rem] rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            >
              {availableToAdd.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  #{asset.assetNumber} — {asset.name} ({asset.serialNumber})
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
        <p className="text-sm text-slate-500">Every inventory asset is already linked.</p>
      )}
    </div>
  );
}
