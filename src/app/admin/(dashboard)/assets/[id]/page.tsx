import Link from "next/link";
import { notFound } from "next/navigation";
import { getAsset, listAssignees, listGroups, listLocations } from "@/lib/store";
import { AssetForm } from "@/app/admin/AssetForm";
import { deleteAssetAction, markSoldAction, updateAssetAction } from "@/app/admin/actions";

export default async function EditAssetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const asset = getAsset(id);
  if (!asset) notFound();

  if (asset.deletedAt) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Edit asset</h1>
        <p className="text-sm text-slate-500">
          &quot;{asset.name}&quot; was deleted. Restore it from{" "}
          <Link href="/admin/trash" className="underline">
            Trash
          </Link>{" "}
          to edit it again.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Edit asset <span className="font-mono text-lg font-normal text-slate-500">#{asset.assetNumber}</span>
        </h1>
        <form action={deleteAssetAction.bind(null, asset.id)}>
          <button type="submit" className="text-sm font-medium text-red-600 underline dark:text-red-400">
            Delete asset
          </button>
        </form>
      </div>

      <AssetForm
        action={updateAssetAction.bind(null, asset.id)}
        asset={asset}
        submitLabel="Save changes"
        existingGroups={listGroups()}
        existingLocations={listLocations()}
        existingAssignees={listAssignees()}
      />

      {asset.status === "available" ? (
        <div className="max-w-2xl rounded-lg border border-slate-300 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-2 text-sm font-semibold">Mark as sold</h2>
          <form action={markSoldAction.bind(null, asset.id)} className="flex items-end gap-3">
            <label className="flex flex-col gap-1 text-sm font-medium">
              Sale price (USD)
              <input
                type="number"
                name="salePrice"
                step="0.01"
                min="0"
                required
                defaultValue={(asset.priceCents / 100).toFixed(2)}
                className="rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
            </label>
            <button
              type="submit"
              className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              Record sale
            </button>
          </form>
          <p className="mt-2 text-xs text-slate-500">
            This records a sale for analytics and removes it from the storefront. It doesn&apos;t process a real
            payment — hook up a payment provider later if you want buyers to check out directly.
          </p>
        </div>
      ) : (
        <p className="text-sm text-zinc-500">This asset is marked sold and no longer listed on the storefront.</p>
      )}
    </div>
  );
}
