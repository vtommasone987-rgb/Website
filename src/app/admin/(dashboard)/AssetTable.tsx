import Link from "next/link";
import type { Asset } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { deleteAssetAction } from "@/app/admin/actions";

export function AssetTable({ assets, showGroupColumn = false }: { assets: Asset[]; showGroupColumn?: boolean }) {
  if (assets.length === 0) {
    return <p className="px-1 text-sm text-neutral-500">No assets here.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-300 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <table className="min-w-full divide-y divide-neutral-200 text-sm dark:divide-neutral-800">
        <thead className="bg-neutral-50 text-left dark:bg-neutral-800">
          <tr>
            <th className="px-4 py-2 font-medium">Asset #</th>
            <th className="px-4 py-2 font-medium">Name</th>
            <th className="px-4 py-2 font-medium">Model</th>
            <th className="px-4 py-2 font-medium">Serial #</th>
            <th className="px-4 py-2 font-medium">Location</th>
            <th className="px-4 py-2 font-medium">Parts</th>
            <th className="px-4 py-2 font-medium">Price</th>
            <th className="px-4 py-2 font-medium">Status</th>
            {showGroupColumn && <th className="px-4 py-2 font-medium">Group</th>}
            <th className="px-4 py-2 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {assets.map((asset) => (
            <tr key={asset.id}>
              <td className="px-4 py-2 font-mono text-xs text-neutral-500">{asset.assetNumber}</td>
              <td className="px-4 py-2">{asset.name}</td>
              <td className="px-4 py-2 text-neutral-500">{asset.model}</td>
              <td className="px-4 py-2 font-mono text-xs text-neutral-500">{asset.serialNumber}</td>
              <td className="px-4 py-2 text-neutral-500">{asset.location ?? "—"}</td>
              <td className="px-4 py-2">{asset.parts.length}</td>
              <td className="px-4 py-2">{formatPrice(asset.priceCents)}</td>
              <td className="px-4 py-2">
                <span
                  className={
                    asset.status === "available"
                      ? "rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "rounded-full bg-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                  }
                >
                  {asset.status}
                </span>
              </td>
              {showGroupColumn && (
                <td className="px-4 py-2 text-neutral-500">{asset.group ?? "—"}</td>
              )}
              <td className="px-4 py-2">
                <div className="flex items-center gap-3">
                  <Link href={`/admin/assets/${asset.id}`} className="text-sm font-medium underline">
                    Edit
                  </Link>
                  <form action={deleteAssetAction.bind(null, asset.id)}>
                    <button type="submit" className="text-sm font-medium text-red-600 underline dark:text-red-400">
                      Delete
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
