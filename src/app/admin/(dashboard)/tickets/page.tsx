import { listAssignees, listTickets } from "@/lib/store";
import { formatDate } from "@/lib/format";
import { CompletionCheckbox } from "../CompletionCheckbox";
import { setTicketAssigneeAction, setTicketStatusAction } from "@/app/admin/actions";
import type { TicketCategory } from "@/lib/types";

const CATEGORY_LABELS: Record<TicketCategory, string> = {
  warranty: "Warranty claim",
  repair: "Repair request",
  feedback: "Feedback",
  other: "Other",
};

export default function TicketsPage() {
  const tickets = listTickets();
  const assignees = listAssignees();
  const openCount = tickets.filter((t) => !t.completed).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Support tickets</h1>
        <span className="text-sm text-slate-500">
          {openCount} open, {tickets.length - openCount} completed
        </span>
      </div>

      <datalist id="ticket-assignees">
        {assignees.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>

      {tickets.length === 0 ? (
        <p className="text-slate-500">No tickets submitted yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-300 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
            <thead className="bg-slate-50 text-left dark:bg-slate-800">
              <tr>
                <th className="px-4 py-2 font-medium">Submitted</th>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Category</th>
                <th className="px-4 py-2 font-medium">Description</th>
                <th className="px-4 py-2 font-medium">Assigned to</th>
                <th className="px-4 py-2 font-medium">Done</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className={ticket.completed ? "opacity-50" : undefined}>
                  <td className="whitespace-nowrap px-4 py-2 text-slate-500">{formatDate(ticket.createdAt)}</td>
                  <td className="px-4 py-2">{ticket.name}</td>
                  <td className="px-4 py-2 text-slate-500">{ticket.email}</td>
                  <td className="whitespace-nowrap px-4 py-2">{CATEGORY_LABELS[ticket.category]}</td>
                  <td className="px-4 py-2 max-w-sm">{ticket.description}</td>
                  <td className="px-4 py-2">
                    <form action={setTicketAssigneeAction.bind(null, ticket.id)} className="flex items-center gap-2">
                      <input
                        name="assignedTo"
                        list="ticket-assignees"
                        placeholder="Unassigned"
                        defaultValue={ticket.assignedTo ?? ""}
                        className="w-32 rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800"
                      />
                      <button type="submit" className="text-sm font-medium text-indigo-600 underline dark:text-indigo-400">
                        Save
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-2">
                    <CompletionCheckbox id={ticket.id} defaultChecked={ticket.completed} action={setTicketStatusAction} />
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
