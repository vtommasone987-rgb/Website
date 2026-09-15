"use client";

import { useState } from "react";
import type { StorageDevice } from "@/lib/types";

const STORAGE_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "hdd", label: "HDD" },
  { value: "sata-ssd", label: "SATA SSD" },
  { value: "nvme-ssd", label: "NVMe SSD" },
  { value: "emmc", label: "eMMC" },
  { value: "other", label: "Other" },
];

export function StorageFields({ existingDevices = [] }: { existingDevices?: StorageDevice[] }) {
  const [rowCount, setRowCount] = useState(Math.max(existingDevices.length, 1));

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-medium mb-1">Storage / disks</legend>
      {Array.from({ length: rowCount }, (_, i) => (
        <div key={i} className="grid grid-cols-3 gap-2">
          <select
            name={`storage-type-${i}`}
            defaultValue={existingDevices[i]?.type ?? ""}
            className="rounded border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          >
            <option value="">— Type —</option>
            {STORAGE_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <input
            type="number"
            name={`storage-capacity-${i}`}
            placeholder="Capacity (GB)"
            min={0}
            defaultValue={existingDevices[i]?.capacityGb}
            className="rounded border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
          <input
            name={`storage-serial-${i}`}
            placeholder="Serial number"
            defaultValue={existingDevices[i]?.serialNumber}
            className="rounded border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => setRowCount((count) => count + 1)}
        className="self-start text-sm font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400"
      >
        + Add another drive
      </button>
    </fieldset>
  );
}
