import type { PublicEmployee } from "@/lib/types";

export function EmployeeForm({
  action,
  employee,
  submitLabel,
  error,
}: {
  action: (formData: FormData) => void;
  employee?: PublicEmployee;
  submitLabel: string;
  error?: string;
}) {
  return (
    <form action={action} className="flex flex-col gap-4 max-w-md">
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <label className="flex flex-col gap-1 text-sm font-medium">
        Name
        <input
          name="name"
          required
          defaultValue={employee?.name}
          className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Username
        <input
          name="username"
          required
          autoComplete="username"
          defaultValue={employee?.username}
          className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        {employee ? "New password" : "Password"}{" "}
        {employee && <span className="font-normal text-zinc-500">(leave blank to keep current)</span>}
        <input
          type="password"
          name="password"
          autoComplete="new-password"
          required={!employee}
          minLength={8}
          className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <span className="text-xs font-normal text-zinc-500">At least 8 characters.</span>
      </label>

      <button
        type="submit"
        className="self-start rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
      >
        {submitLabel}
      </button>
    </form>
  );
}
