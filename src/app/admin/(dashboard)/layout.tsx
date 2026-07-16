import Link from "next/link";
import { logoutAction } from "../login/actions";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-100 dark:bg-slate-950 -mx-6 -my-8 px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between border-b border-slate-300 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <span className="rounded bg-slate-900 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-50 dark:bg-slate-50 dark:text-slate-900">
              Back office
            </span>
            <nav className="flex items-center gap-4 text-sm font-medium text-slate-600 dark:text-slate-400">
              <Link href="/admin" className="hover:text-slate-950 dark:hover:text-slate-50">
                Assets
              </Link>
              <Link href="/admin/purchases" className="hover:text-slate-950 dark:hover:text-slate-50">
                Purchases
              </Link>
              <Link href="/admin/analytics" className="hover:text-slate-950 dark:hover:text-slate-50">
                Analytics
              </Link>
              <Link href="/admin/tickets" className="hover:text-slate-950 dark:hover:text-slate-50">
                Tickets
              </Link>
              <Link href="/admin/custom-orders" className="hover:text-slate-950 dark:hover:text-slate-50">
                Custom Orders
              </Link>
              <Link href="/admin/trash" className="hover:text-slate-950 dark:hover:text-slate-50">
                Trash
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/shop" className="text-sm text-slate-500 hover:text-slate-950 dark:hover:text-slate-50">
              View storefront ↗
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="text-sm font-medium text-slate-600 underline dark:text-slate-400">
                Sign out
              </button>
            </form>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
