import Link from "next/link";
import { listEmployees } from "@/lib/store";
import { formatDate } from "@/lib/format";
import { deleteEmployeeAction } from "@/app/admin/actions";
import { isAdminSubject } from "@/lib/session";
import { getCurrentSubject } from "@/lib/auth";

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const employees = await listEmployees();
  const isOwner = isAdminSubject(await getCurrentSubject());

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Employees</h1>
        <Link
          href="/admin/employees/new"
          className="rounded bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + Add employee
        </Link>
      </div>

      <p className="text-sm text-neutral-500">
        Employees listed here can sign into the back office with their own username and password, and show up in
        every &quot;Assigned to&quot; field across assets, tickets, and custom orders.
      </p>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {employees.length === 0 ? (
        <p className="px-1 text-sm text-neutral-500">No employees yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-300 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <table className="min-w-full divide-y divide-neutral-200 text-sm dark:divide-neutral-800">
            <thead className="bg-neutral-50 text-left dark:bg-neutral-800">
              <tr>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Username</th>
                <th className="px-4 py-2 font-medium">Added</th>
                <th className="px-4 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td className="px-4 py-2">{employee.name}</td>
                  <td className="px-4 py-2 font-mono text-xs text-neutral-500">{employee.username}</td>
                  <td className="px-4 py-2 text-neutral-500">{formatDate(employee.createdAt)}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/employees/${employee.id}`} className="text-sm font-medium underline">
                        Edit
                      </Link>
                      {isOwner && (
                        <form action={deleteEmployeeAction.bind(null, employee.id)}>
                          <button
                            type="submit"
                            className="text-sm font-medium text-red-600 underline dark:text-red-400"
                          >
                            Delete
                          </button>
                        </form>
                      )}
                    </div>
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
