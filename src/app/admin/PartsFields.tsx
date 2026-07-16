"use client";

import { useState } from "react";
import type { Part } from "@/lib/types";

export function PartsFields({ existingParts = [] }: { existingParts?: Part[] }) {
  const [rowCount, setRowCount] = useState(Math.max(existingParts.length, 1));

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-medium mb-1">Parts &amp; their serial numbers</legend>
      {Array.from({ length: rowCount }, (_, i) => (
        <div key={i} className="grid grid-cols-2 gap-2">
          <input
            name={`part-name-${i}`}
            placeholder="Part name"
            defaultValue={existingParts[i]?.name}
            className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <input
            name={`part-serial-${i}`}
            placeholder="Part serial number"
            defaultValue={existingParts[i]?.serialNumber}
            className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => setRowCount((count) => count + 1)}
        className="self-start text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
      >
        + Add another part
      </button>
    </fieldset>
  );
}
