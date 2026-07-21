import Link from "next/link";
import { notFound } from "next/navigation";
import { getPurchase, listAssets, listPurchaseGroups } from "@/lib/store";
import { PurchaseForm } from "@/app/admin/PurchaseForm";
import { deletePurchaseAction, updatePurchaseAction } from "@/app/admin/actions";

export default async function EditPurchasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const purchase = getPurchase(id);
  if (!purchase) notFound();

  if (purchase.deletedAt) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Edit purchase</h1>
        <p className="text-sm text-slate-500">
          &quot;{purchase.item}&quot; was deleted. Restore it from{" "}
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
        <h1 className="text-2xl font-semibold">Edit purchase</h1>
        <form action={deletePurchaseAction.bind(null, purchase.id)}>
          <button type="submit" className="text-sm font-medium text-red-600 underline dark:text-red-400">
            Delete purchase
          </button>
        </form>
      </div>

      <PurchaseForm
        action={updatePurchaseAction.bind(null, purchase.id)}
        purchase={purchase}
        submitLabel="Save changes"
        existingGroups={listPurchaseGroups()}
        assets={listAssets()}
      />
    </div>
  );
}
