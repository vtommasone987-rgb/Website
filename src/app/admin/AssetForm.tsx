import type { Asset } from "@/lib/types";
import { PartsFields } from "./PartsFields";
import { StorageFields } from "./StorageFields";

export function AssetForm({
  action,
  asset,
  submitLabel,
  existingGroups = [],
  existingLocations = [],
  existingAssignees = [],
}: {
  action: (formData: FormData) => void;
  asset?: Asset;
  submitLabel: string;
  existingGroups?: string[];
  existingLocations?: string[];
  existingAssignees?: string[];
}) {
  return (
    <form action={action} className="flex flex-col gap-6 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Name
          <input
            name="name"
            required
            defaultValue={asset?.name}
            className="rounded border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Model
          <input
            name="model"
            required
            defaultValue={asset?.model}
            className="rounded border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Serial number
          <input
            name="serialNumber"
            required
            defaultValue={asset?.serialNumber}
            className="rounded border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Price (USD)
          <input
            type="number"
            name="price"
            step="0.01"
            min="0"
            required
            defaultValue={asset ? (asset.priceCents / 100).toFixed(2) : undefined}
            className="rounded border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Description
        <textarea
          name="description"
          rows={3}
          defaultValue={asset?.description}
          className="rounded border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Location <span className="font-normal text-neutral-500">(optional — where the item physically is)</span>
        <input
          name="location"
          list="asset-locations"
          placeholder="e.g. Warehouse A, Shelf 3"
          defaultValue={asset?.location ?? ""}
          className="rounded border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
        <datalist id="asset-locations">
          {existingLocations.map((loc) => (
            <option key={loc} value={loc} />
          ))}
        </datalist>
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Group
        <select
          name="group"
          defaultValue={asset?.group ?? ""}
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
          Don&apos;t see the group you want? Add it from the asset inventory page first.
        </p>
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Assigned to <span className="font-normal text-neutral-500">(optional — your name or an employee&apos;s)</span>
        <input
          name="assignedTo"
          list="asset-assignees"
          placeholder="e.g. Jordan Lee"
          defaultValue={asset?.assignedTo ?? ""}
          className="rounded border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
        <datalist id="asset-assignees">
          {existingAssignees.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </label>

      <PartsFields existingParts={asset?.parts} />

      <StorageFields existingDevices={asset?.storageDevices} />

      <label className="flex flex-col gap-1 text-sm font-medium">
        Photos
        <input
          type="file"
          name="photos"
          accept="image/*"
          multiple
          className="text-sm file:mr-3 file:rounded file:border-0 file:bg-brand-600 file:px-3 file:py-1.5 file:text-sm file:text-white"
        />
        {asset && asset.images.length > 0 && (
          <p className="text-xs text-neutral-500">
            Uploading new photos replaces the {asset.images.length} existing photo
            {asset.images.length === 1 ? "" : "s"}. Leave empty to keep them.
          </p>
        )}
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
