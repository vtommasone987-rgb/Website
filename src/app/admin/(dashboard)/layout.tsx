import Link from "next/link";
import { logoutAction } from "../login/actions";
import { employeeIdFromSubject, isAdminSubject } from "@/lib/session";
import { getCurrentSubject } from "@/lib/auth";
import { getEmployee } from "@/lib/store";
import { AdminNav } from "./AdminNav";

async function currentDisplayName(subject: string | null): Promise<string | null> {
  if (subject === "admin") return "Admin";
  const employeeId = employeeIdFromSubject(subject);
  if (!employeeId) return null;
  // Falls back to a generic label if the employee was deleted while their
  // session was still valid — see the stateless-session note in lib/session.ts.
  return (await getEmployee(employeeId))?.name ?? "Employee";
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const subject = await getCurrentSubject();
  const isAdmin = isAdminSubject(subject);
  const displayName = await currentDisplayName(subject);
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-neutral-100 dark:bg-neutral-950 -mx-6 -my-8 px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="rounded bg-neutral-900 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-50 dark:bg-neutral-50 dark:text-neutral-900">
              Back office
            </span>
            <div className="flex items-center gap-4">
              {displayName && <span className="text-sm text-neutral-500">Signed in as {displayName}</span>}
              <Link href="/shop" className="text-sm text-neutral-500 hover:text-neutral-950 dark:hover:text-neutral-50">
                View storefront ↗
              </Link>
              <form action={logoutAction}>
                <button type="submit" className="text-sm font-medium text-neutral-600 underline dark:text-neutral-400">
                  Sign out
                </button>
              </form>
            </div>
          </div>
          <div className="border-b border-neutral-300 dark:border-neutral-800">
            <AdminNav isAdmin={isAdmin} />
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
