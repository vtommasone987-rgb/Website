import Image from "next/image";
import Link from "next/link";
import { listAvailableAssets } from "@/lib/store";
import { formatPrice } from "@/lib/format";

export default function ShopPage() {
  const assets = listAvailableAssets();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">For sale</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Every listing below is tracked down to the serial number.
        </p>
      </div>

      {assets.length === 0 ? (
        <p className="text-zinc-500">Nothing listed right now — check back soon.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => (
            <Link
              key={asset.id}
              href={`/shop/${asset.id}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                {asset.images[0] && (
                  <Image
                    src={asset.images[0].url}
                    alt={asset.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
                <span className="absolute top-3 right-3 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-zinc-900 shadow-sm backdrop-blur dark:bg-zinc-950/90 dark:text-zinc-50">
                  {formatPrice(asset.priceCents)}
                </span>
              </div>
              <div className="flex flex-col gap-1 p-4">
                <h2 className="font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {asset.name}
                </h2>
                <p className="text-sm text-zinc-500">{asset.model}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
