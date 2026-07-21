"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS: { href: string; label: string; ownerOnly?: boolean }[] = [
  { href: "/admin", label: "Assets" },
  { href: "/admin/purchases", label: "Purchases" },
  { href: "/admin/analytics", label: "Analytics", ownerOnly: true },
  { href: "/admin/tickets", label: "Tickets" },
  { href: "/admin/custom-orders", label: "Custom Orders" },
  { href: "/admin/employees", label: "Employees" },
  { href: "/admin/trash", label: "Trash" },
];

/** Underlined tab bar for the admin nav — active tab tracked via the URL, not clicks. */
export function AdminNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="-mb-px flex flex-wrap gap-x-6 gap-y-1 text-sm font-medium">
      {TABS.filter((tab) => !tab.ownerOnly || isAdmin).map((tab) => {
        const active = tab.href === "/admin" ? pathname === "/admin" : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`border-b-2 pb-3 transition-colors ${
              active
                ? "border-indigo-600 text-slate-950 dark:text-slate-50"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-900 dark:hover:border-slate-700 dark:hover:text-slate-50"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
