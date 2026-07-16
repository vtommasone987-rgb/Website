import { PurchaseForm } from "@/app/admin/PurchaseForm";
import { createPurchaseAction } from "@/app/admin/actions";
import { listPurchaseGroups } from "@/lib/store";

export default function NewPurchasePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Add purchase</h1>
      <PurchaseForm action={createPurchaseAction} submitLabel="Add purchase" existingGroups={listPurchaseGroups()} />
    </div>
  );
}
