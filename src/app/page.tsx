import Image from "next/image";
import Link from "next/link";
import { listAvailableAssets } from "@/lib/store";
import { formatPrice } from "@/lib/format";

export default function Home() {
  const featured = listAvailableAssets().slice(0, 3);

  return (
    <div className="flex flex-col gap-16">
      <section className="flex flex-col items-start gap-6 py-8 sm:py-16">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
          Ohio Pro Tech &amp; Services LLC
        </p>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          IT equipment and services you can trust — down to the serial number.
        </h1>
        <p className="max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
          OPTS tracks every device by model, serial number, and included parts, so you know exactly what
          you&apos;re getting — whether it&apos;s a single workstation or a full server rack.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/shop"
            className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            Browse what&apos;s for sale
          </Link>
          <Link
            href="/custom-order"
            className="rounded-full border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-50 dark:hover:border-zinc-500"
          >
            Request a custom build
          </Link>
        </div>
      </section>

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
    </div>
  );
}
