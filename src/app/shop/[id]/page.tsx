import Image from "next/image";
import { notFound } from "next/navigation";
import { getAsset } from "@/lib/store";
import { formatPrice } from "@/lib/format";
import type { StorageType } from "@/lib/types";

const STORAGE_TYPE_LABELS: Record<StorageType, string> = {
  hdd: "HDD",
  "sata-ssd": "SATA SSD",
  "nvme-ssd": "NVMe SSD",
  emmc: "eMMC",
  other: "Storage",
};

export default async function ShopItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const asset = getAsset(id);
  if (!asset || asset.status !== "available" || asset.deletedAt) notFound();

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <div className="flex flex-col gap-3">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900">
          {asset.images[0] && (
            <Image src={asset.images[0].url} alt={asset.name} fill sizes="50vw" className="object-cover" priority />
          )}
        </div>
        {asset.images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {asset.images.slice(1).map((img) => (
              <div key={img.id} className="relative aspect-square overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900">
                <Image src={img.url} alt={asset.name} fill sizes="120px" className="object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{asset.name}</h1>
          <p className="text-zinc-500">{asset.model}</p>
        </div>

        <p className="text-3xl font-bold">{formatPrice(asset.priceCents)}</p>

        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{asset.description}</p>

        <dl className="text-sm text-zinc-500">
          <div className="flex gap-2">
            <dt className="font-medium text-zinc-700 dark:text-zinc-300">Serial number:</dt>
            <dd className="font-mono">{asset.serialNumber}</dd>
          </div>
        </dl>

        {asset.parts.length > 0 && (
          <div>
            <h2 className="mb-2 text-sm font-semibold">Included parts</h2>
            <ul className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
              {asset.parts.map((part) => (
                <li key={part.id} className="flex justify-between gap-4 border-b border-zinc-100 py-1 dark:border-zinc-800">
                  <span>{part.name}</span>
                  <span className="font-mono text-xs text-zinc-400">{part.serialNumber}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {asset.storageDevices.length > 0 && (
          <div>
            <h2 className="mb-2 text-sm font-semibold">Storage</h2>
            <ul className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
              {asset.storageDevices.map((device) => (
                <li
                  key={device.id}
                  className="flex justify-between gap-4 border-b border-zinc-100 py-1 dark:border-zinc-800"
                >
                  <span>
                    {device.capacityGb}GB {STORAGE_TYPE_LABELS[device.type]}
                  </span>
                  <span className="font-mono text-xs text-zinc-400">{device.serialNumber}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-2 flex flex-col gap-2">
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-full bg-indigo-600/50 px-6 py-3 text-sm font-semibold text-white"
          >
            Buy now
          </button>
          <p className="text-xs text-zinc-400">
            Checkout isn&apos;t wired up yet — contact the seller directly for now.
          </p>
        </div>
      </div>
    </div>
  );
}
