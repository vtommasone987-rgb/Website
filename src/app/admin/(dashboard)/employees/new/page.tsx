import { EmployeeForm } from "@/app/admin/EmployeeForm";
import { createEmployeeAction } from "@/app/admin/actions";

export default async function NewEmployeePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Add employee</h1>
      <EmployeeForm action={createEmployeeAction} submitLabel="Add employee" error={error} />
    </div>
  );
}
