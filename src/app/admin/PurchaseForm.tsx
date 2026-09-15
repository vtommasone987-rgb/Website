import Link from "next/link";
import type { Asset, Purchase } from "@/lib/types";

function today(): string {
  // Build from local date parts rather than toISOString() (which is UTC-based)
  // so the pre-filled date matches the viewer's actual "today" near midnight.
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function PurchaseForm({
  action,
  purchase,
  submitLabel,
  existingGroups = [],
  assets = [],
}: {
  action: (formData: FormData) => void;
  purchase?: Purchase;
  submitLabel: string;
  existingGroups?: string[];
  assets?: Asset[];
}) {
  return (
    <form action={action} className="flex flex-col gap-4 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Item
          <input
            name="item"
            required
            defaultValue={purchase?.item}
            className="rounded border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Vendor <span className="font-normal text-neutral-500">(optional)</span>
          <input
            name="vendor"
            defaultValue={purchase?.vendor ?? ""}
            className="rounded border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Quantity
          <input
            type="number"
            name="quantity"
            min={1}
            step={1}
            required
            defaultValue={purchase?.quantity ?? 1}
            className="rounded border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Total cost (USD)
          <input
            type="number"
            name="totalCost"
            step="0.01"
            min="0"
            required
            defaultValue={purchase ? (purchase.totalCostCents / 100).toFixed(2) : undefined}
            className="rounded border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Date
          <input
            type="date"
            name="purchasedAt"
            required
            defaultValue={purchase?.purchasedAt ?? today()}
            className="rounded border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Related asset <span className="font-normal text-neutral-500">(optional)</span>
          <select
            name="assetId"
            defaultValue={purchase?.assetId ?? ""}
            className="rounded border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          >
            <option value="">— None —</option>
            {assets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                #{asset.assetNumber} — {asset.name} ({asset.serialNumber})
              </option>
            ))}
          </select>
          <Link href="/admin/assets/new" target="_blank" className="text-xs font-normal text-brand-600 underline dark:text-brand-400">
            + New asset (opens in a new tab, gets its own asset # automatically)
          </Link>
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Notes <span className="font-normal text-neutral-500">(optional)</span>
        <textarea
          name="notes"
          rows={3}
          defaultValue={purchase?.notes ?? ""}
          className="rounded border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Group
        <select
          name="group"
          defaultValue={purchase?.group ?? ""}
          className="rounded border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        >
          <option value="">— None —</option>
          {existingGroups.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <p className="text-xs font-normal text-neutral-500">
          Don&apos;t see the group you want? Add it from the purchase history page first.
        </p>
      </label>

      <button
        type="submit"
        className="self-start rounded bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
      >
        {submitLabel}
      </button>
    </form>
  );
}
