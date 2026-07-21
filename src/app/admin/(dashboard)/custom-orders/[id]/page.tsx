import Link from "next/link";
import { notFound } from "next/navigation";
import { getCustomOrder, getCustomOrderAssets, listAssets, listAssignees } from "@/lib/store";
import { formatDate } from "@/lib/format";
import { CompletionCheckbox } from "../../CompletionCheckbox";
import { LinkedAssets } from "@/app/admin/LinkedAssets";
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

      <LinkedAssets
        linkedAssets={linkedAssets}
        availableToAdd={availableToAdd}
        attachAction={attachAssetToOrderAction.bind(null, order.id)}
        removeAction={removeAssetFromOrderAction.bind(null, order.id)}
      />
    </div>
  );
}
