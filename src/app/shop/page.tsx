import Link from "next/link";
import { connection } from "next/server";
import { listAvailableAssets } from "@/lib/store";
import { formatPrice } from "@/lib/format";
import { AssetThumbnail } from "@/app/AssetThumbnail";

export default async function ShopPage() {
  // Rendered per request rather than prerendered at build: a CSP nonce only exists
  // once there is a request, and Next can't stamp one onto build-time HTML. See src/proxy.ts.
  await connection();

  const assets = await listAvailableAssets();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold tracking-tight">For sale</h1>

      {assets.length === 0 ? (
        <p className="text-neutral-500">Nothing listed right now — check back soon.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => (
            <Link
              key={asset.id}
              href={`/shop/${asset.id}`}
              className="surface group flex flex-col overflow-hidden rounded-xl transition-colors hover:border-neutral-400 dark:hover:border-neutral-600"
            >
              <AssetThumbnail
                image={asset.images[0]}
                alt={asset.name}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="aspect-[4/3]"
              />
              <div className="flex flex-col gap-1 p-4">
                <h2 className="font-medium group-hover:text-brand-600 dark:group-hover:text-brand-400">
                  {asset.name}
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{asset.model}</p>
                <p className="mt-1 font-semibold">{formatPrice(asset.priceCents)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
