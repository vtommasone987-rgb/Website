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
            <h2 className="text-xl font-semibold">Recently listed</h2>
            <Link href="/shop" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {featured.map((asset) => (
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
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="flex flex-col gap-1 p-4">
                  <h3 className="font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {asset.name}
                  </h3>
                  <p className="font-semibold">{formatPrice(asset.priceCents)}</p>
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
