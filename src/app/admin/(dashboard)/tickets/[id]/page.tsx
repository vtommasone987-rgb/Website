import Link from "next/link";
import { notFound } from "next/navigation";
import { getTicket, getTicketAssets, listAssets, listAssignees } from "@/lib/store";
import { formatDate } from "@/lib/format";
import { CompletionCheckbox } from "../../CompletionCheckbox";
import { LinkedAssets } from "@/app/admin/LinkedAssets";
import {
  attachAssetToTicketAction,
  removeAssetFromTicketAction,
  setTicketAssigneeAction,
  setTicketStatusAction,
} from "@/app/admin/actions";
import type { TicketCategory } from "@/lib/types";

const CATEGORY_LABELS: Record<TicketCategory, string> = {
  warranty: "Warranty claim",
  repair: "Repair request",
  feedback: "Feedback",
  other: "Other",
};

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ticket = await getTicket(id);
  if (!ticket) notFound();

  const linkedAssets = await getTicketAssets(id);
  const linkedIds = new Set(ticket.assetIds);
  const availableToAdd = (await listAssets()).filter((a) => !linkedIds.has(a.id));
  const assignees = await listAssignees();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/admin/tickets" className="text-sm text-slate-500 hover:underline">
          ← Back to support tickets
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{ticket.name}&apos;s ticket</h1>
          <label className="flex items-center gap-2 text-sm font-medium">
            Completed
            <CompletionCheckbox id={ticket.id} defaultChecked={ticket.completed} action={setTicketStatusAction} />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-lg border border-slate-300 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <span className="text-slate-500">Email:</span> {ticket.email}
        </div>
        <div>
          <span className="text-slate-500">Submitted:</span> {formatDate(ticket.createdAt)}
        </div>
        <div>
          <span className="text-slate-500">Category:</span> {CATEGORY_LABELS[ticket.category]}
        </div>
        <div className="col-span-2">
          <span className="text-slate-500">Description:</span> {ticket.description}
        </div>
        <div className="col-span-2 flex items-center gap-2">
          <span className="text-slate-500">Assigned to:</span>
          <datalist id="ticket-detail-assignees">
            {assignees.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
          <form action={setTicketAssigneeAction.bind(null, ticket.id)} className="flex items-center gap-2">
            <input
              name="assignedTo"
              list="ticket-detail-assignees"
              placeholder="Unassigned"
              defaultValue={ticket.assignedTo ?? ""}
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
        attachAction={attachAssetToTicketAction.bind(null, ticket.id)}
        removeAction={removeAssetFromTicketAction.bind(null, ticket.id)}
      />
    </div>
  );
}
