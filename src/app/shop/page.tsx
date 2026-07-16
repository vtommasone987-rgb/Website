import Image from "next/image";
import Link from "next/link";
import { listAvailableAssets } from "@/lib/store";
import { formatPrice } from "@/lib/format";

export default function ShopPage() {
  const assets = listAvailableAssets();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold tracking-tight">For sale</h1>

      {assets.length === 0 ? (
        <p className="text-zinc-500">Nothing listed right now — check back soon.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => (
            <Link
              key={asset.id}
              href={`/shop/${asset.id}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800"
            >
              <div className="relative aspect-[4/3] bg-zinc-100 dark:bg-zinc-900">
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
                <p className="text-sm text-zinc-500">{asset.model}</p>
                <p className="mt-1 font-semibold">{formatPrice(asset.priceCents)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
