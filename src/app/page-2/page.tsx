import Image from "next/image";
import Link from "next/link";
import { listAvailableAssets } from "@/lib/store";
import { formatPrice } from "@/lib/format";
import { PageNav } from "../PageNav";

export default function Page2() {
  const featured = listAvailableAssets().slice(0, 3);

  return (
    <div className="flex flex-col gap-16">
      {featured.length > 0 && (
        <section className="flex flex-col gap-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Recently listed</h2>
            <Link href="/shop" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {featured.map((asset) => (
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
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                  <span className="absolute top-3 right-3 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-zinc-900 shadow-sm backdrop-blur dark:bg-zinc-950/90 dark:text-zinc-50">
                    {formatPrice(asset.priceCents)}
                  </span>
                </div>
                <div className="flex flex-col gap-1 p-4">
                  <h3 className="font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {asset.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <PageNav current={2} />
    </div>
  );
}
