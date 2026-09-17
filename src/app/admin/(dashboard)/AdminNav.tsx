"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const TABS: { href: string; label: string; ownerOnly?: boolean }[] = [
  { href: "/admin", label: "Assets" },
  { href: "/admin/purchases", label: "Purchases" },
  { href: "/admin/analytics", label: "Analytics", ownerOnly: true },
  { href: "/admin/tickets", label: "Tickets" },
  { href: "/admin/custom-orders", label: "Custom Orders" },
  { href: "/admin/employees", label: "Employees" },
  { href: "/admin/security-log", label: "Security", ownerOnly: true },
  { href: "/admin/trash", label: "Trash" },
];

function isActive(href: string, pathname: string): boolean {
  // "/admin" would prefix-match every other section, so it has to be exact.
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

/**
 * The tab strip, plus a menu button at the right-hand end of the same row.
 *
 * The tabs are the primary navigation and stay exactly as they were. The menu is
 * a second way to reach the same places — useful once the tabs start wrapping on
 * a narrow window, and a quicker jump when you already know where you're going.
 */
export function AdminNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const visibleTabs = TABS.filter((tab) => !tab.ownerOnly || isAdmin);

  // Close after navigating. The admin layout persists across client-side
  // navigation, so otherwise the menu stays open on the page you just opened.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Click-away and Escape — a menu you can only close by picking something is a trap.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="flex items-start justify-between gap-4">
      <nav className="-mb-px flex flex-wrap gap-x-6 gap-y-1 text-sm font-medium">
        {visibleTabs.map((tab) => {
          const active = isActive(tab.href, pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`border-b-2 pb-3 transition-colors ${
                active
                  ? "border-brand-600 text-neutral-950 dark:text-neutral-50"
                  : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-900 dark:hover:border-neutral-700 dark:hover:text-neutral-50"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <div ref={menuRef} className="relative shrink-0 pb-3">
        <button
          type="button"
          onClick={() => setOpen((wasOpen) => !wasOpen)}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label="All sections"
          title="All sections"
          className="flex items-center rounded-lg border border-neutral-300 px-2.5 py-1.5 text-neutral-600 transition-colors hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-600 dark:hover:text-neutral-50"
        >
          {/* The three lines. */}
          <span className="flex flex-col gap-[3px]" aria-hidden="true">
            <span className="block h-0.5 w-4 rounded-full bg-current" />
            <span className="block h-0.5 w-4 rounded-full bg-current" />
            <span className="block h-0.5 w-4 rounded-full bg-current" />
          </span>
        </button>

        {open && (
          <div
            role="menu"
            className="surface absolute top-full right-0 z-50 mt-2 flex w-56 flex-col overflow-hidden rounded-xl p-1.5 shadow-lg"
          >
            {visibleTabs.map((tab) => {
              const active = isActive(tab.href, pathname);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  role="menuitem"
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-brand-600 font-medium text-white"
                      : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  }`}
                >
                  {tab.label}
                  {tab.ownerOnly && (
                    <span
                      className={`text-[10px] tracking-wide uppercase ${
                        active ? "text-white/70" : "text-neutral-400"
                      }`}
                      title="Only the shop owner can see this"
                    >
                      Owner
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
