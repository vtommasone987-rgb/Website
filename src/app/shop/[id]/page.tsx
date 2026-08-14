import Image from "next/image";
import { notFound } from "next/navigation";
import { getAsset } from "@/lib/store";
import { formatPrice } from "@/lib/format";
import { AssetThumbnail } from "@/app/AssetThumbnail";
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
  const asset = await getAsset(id);
  if (!asset || asset.status !== "available" || asset.deletedAt) notFound();

  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
      <div className="flex flex-col gap-3">
        <AssetThumbnail
          image={asset.images[0]}
          alt={asset.name}
          sizes="50vw"
          priority
          className="surface aspect-[4/3] rounded-2xl"
        />
        {asset.images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {asset.images.slice(1).map((img) => (
              <div
                key={img.id}
                className="surface relative aspect-square overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800"
              >
                <Image src={img.url} alt={asset.name} fill sizes="120px" className="object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{asset.name}</h1>
          <p className="text-slate-500">{asset.model}</p>
        </div>

        <p className="text-3xl font-semibold">{formatPrice(asset.priceCents)}</p>

        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{asset.description}</p>

        <dl className="text-sm text-slate-500">
          <div className="flex gap-2">
            <dt className="font-medium text-slate-700 dark:text-slate-300">Serial number:</dt>
            <dd className="font-mono">{asset.serialNumber}</dd>
          </div>
        </dl>

        {asset.parts.length > 0 && (
          <div className="surface rounded-xl p-4">
            <h2 className="mb-2 text-sm font-semibold">Included parts</h2>
            <ul className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-400">
              {asset.parts.map((part) => (
                <li
                  key={part.id}
                  className="flex justify-between gap-4 border-b border-slate-200 py-1.5 last:border-0 dark:border-slate-800"
                >
                  <span>{part.name}</span>
                  <span className="font-mono text-xs text-slate-400">{part.serialNumber}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {asset.storageDevices.length > 0 && (
          <div className="surface rounded-xl p-4">
            <h2 className="mb-2 text-sm font-semibold">Storage</h2>
            <ul className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-400">
              {asset.storageDevices.map((device) => (
                <li
                  key={device.id}
                  className="flex justify-between gap-4 border-b border-slate-200 py-1.5 last:border-0 dark:border-slate-800"
                >
                  <span>
                    {device.capacityGb}GB {STORAGE_TYPE_LABELS[device.type]}
                  </span>
                  <span className="font-mono text-xs text-slate-400">{device.serialNumber}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-2 flex flex-col gap-2">
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-lg bg-indigo-600/50 px-6 py-3 text-sm font-semibold text-white"
          >
            Buy now
          </button>
          <p className="text-xs text-slate-400">
            Checkout isn&apos;t wired up yet — contact the seller directly for now.
          </p>
        </div>
      </div>
    </div>
  );
}
