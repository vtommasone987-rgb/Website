import Image from "next/image";
import Link from "next/link";
import { listAvailableAssets } from "@/lib/store";
import { formatPrice } from "@/lib/format";

export default async function ShopPage() {
  const assets = await listAvailableAssets();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold tracking-tight">For sale</h1>

      {assets.length === 0 ? (
        <p className="text-slate-500">Nothing listed right now — check back soon.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => (
            <Link
              key={asset.id}
              href={`/shop/${asset.id}`}
              className="surface group flex flex-col overflow-hidden rounded-xl transition-colors hover:border-slate-400 dark:hover:border-slate-600"
            >
              <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-800">
                {asset.images[0] && (
                  <Image
                    src={asset.images[0].url}
                    alt={asset.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                )}
              </div>
              <div className="flex flex-col gap-1 p-4">
                <h2 className="font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {asset.name}
                </h2>
                <p className="text-sm text-slate-500">{asset.model}</p>
                <p className="mt-1 font-semibold">{formatPrice(asset.priceCents)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
