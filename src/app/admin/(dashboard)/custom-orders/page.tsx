import Link from "next/link";
import { listAssignees, listCustomOrders } from "@/lib/store";
import { formatDate } from "@/lib/format";
import { CompletionCheckbox } from "../CompletionCheckbox";
import { setCustomOrderAssigneeAction, setCustomOrderStatusAction } from "@/app/admin/actions";
import type { CustomOrderCategory } from "@/lib/types";

const CATEGORY_LABELS: Record<CustomOrderCategory, string> = {
  "pc-build": "PC build",
  laptop: "Laptop",
  tablet: "Tablet",
  other: "Other",
};

export default async function CustomOrdersPage() {
  const orders = await listCustomOrders();
  const assignees = await listAssignees();
  const openCount = orders.filter((o) => !o.completed).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Custom orders</h1>
        <span className="text-sm text-slate-500">
          {openCount} open, {orders.length - openCount} completed
        </span>
      </div>

      <datalist id="order-assignees">
        {assignees.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>

      {orders.length === 0 ? (
        <p className="text-slate-500">No custom order requests yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-300 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
            <thead className="bg-slate-50 text-left dark:bg-slate-800">
              <tr>
                <th className="px-4 py-2 font-medium">Submitted</th>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Type</th>
                <th className="px-4 py-2 font-medium">Model</th>
                <th className="px-4 py-2 font-medium">Qty</th>
                <th className="px-4 py-2 font-medium">Budget</th>
                <th className="px-4 py-2 font-medium">Details</th>
                <th className="px-4 py-2 font-medium">Assets</th>
                <th className="px-4 py-2 font-medium">Assigned to</th>
                <th className="px-4 py-2 font-medium">Done</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {orders.map((order) => (
                <tr key={order.id} className={order.completed ? "opacity-50" : undefined}>
                  <td className="whitespace-nowrap px-4 py-2 text-slate-500">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-2">
                    <Link href={`/admin/custom-orders/${order.id}`} className="font-medium underline">
                      {order.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-slate-500">{order.email}</td>
                  <td className="whitespace-nowrap px-4 py-2">{CATEGORY_LABELS[order.category]}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-slate-500">{order.model ?? "—"}</td>
                  <td className="px-4 py-2">{order.quantity}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-slate-500">{order.budget ?? "—"}</td>
                  <td className="px-4 py-2 max-w-sm">{order.details}</td>
                  <td className="whitespace-nowrap px-4 py-2">
                    <Link href={`/admin/custom-orders/${order.id}`} className="text-slate-500 underline">
                      {order.assetIds.length} linked
                    </Link>
                  </td>
                  <td className="px-4 py-2">
                    <form
                      action={setCustomOrderAssigneeAction.bind(null, order.id)}
                      className="flex items-center gap-2"
                    >
                      <input
                        name="assignedTo"
                        list="order-assignees"
                        placeholder="Unassigned"
                        defaultValue={order.assignedTo ?? ""}
                        className="w-32 rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800"
                      />
                      <button type="submit" className="text-sm font-medium text-indigo-600 underline dark:text-indigo-400">
                        Save
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-2">
                    <CompletionCheckbox
                      id={order.id}
                      defaultChecked={order.completed}
                      action={setCustomOrderStatusAction}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
