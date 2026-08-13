import { notFound } from "next/navigation";
import { getEmployee } from "@/lib/store";
import { EmployeeForm } from "@/app/admin/EmployeeForm";
import { deleteEmployeeAction, updateEmployeeAction } from "@/app/admin/actions";
import { isAdminSubject } from "@/lib/session";
import { getCurrentSubject } from "@/lib/auth";

export default async function EditEmployeePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const employee = await getEmployee(id);
  if (!employee) notFound();
  const isOwner = isAdminSubject(await getCurrentSubject());

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit employee</h1>
        {isOwner && (
          <form action={deleteEmployeeAction.bind(null, employee.id)}>
            <button type="submit" className="text-sm font-medium text-red-600 underline dark:text-red-400">
              Delete employee
            </button>
          </form>
        )}
      </div>

      <EmployeeForm
        action={updateEmployeeAction.bind(null, employee.id)}
        employee={employee}
        submitLabel="Save changes"
        error={error}
      />
    </div>
  );
}
