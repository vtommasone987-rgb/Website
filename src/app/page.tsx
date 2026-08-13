import Image from "next/image";
import Link from "next/link";
import { listAvailableAssets } from "@/lib/store";
import { formatPrice } from "@/lib/format";
import { createCustomOrderAction } from "./custom-order/actions";

const services = [
  {
    title: "Support",
    description:
      "When you want help, you want it NOW. Our techs have solid reputations for being extremely knowledgeable and extremely responsive.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Backup and Disaster Recovery",
    description:
      "We are Veeam Pro Partners and represent ONLY Veeam for reliable and secure backups. Why? Because it's the best – and so is our Cloud Connect network.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
        <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path
          d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M9 13l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Backoffice Services",
    description:
      "We are not just an IT company. We also offer a portfolio of backoffice services to help with your business administration tasks.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
        <path
          d="M14.7 6.3a3 3 0 1 0-4.24 4.24L4 17v3h3l6.46-6.46a3 3 0 1 0 4.24-4.24l-2 2-1.5-1.5 2-2z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string; error?: string }>;
}) {
  const { submitted, error } = await searchParams;
  const featured = (await listAvailableAssets()).slice(0, 3);

  return (
    <div className="flex flex-col gap-24 sm:gap-32">
      <section className="flex flex-col items-start gap-8 py-16 sm:py-28">
        <p className="text-sm font-medium tracking-wide text-slate-500 dark:text-slate-400">
          Ohio Pro Tech &amp; Services LLC
        </p>
        <h1 className="max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl">
          IT equipment and services you can trust — down to the serial number.
        </h1>
        <p className="max-w-xl text-xl text-slate-500 dark:text-slate-400">
          OPTS tracks every device by model, serial number, and included parts, so you know exactly what
          you&apos;re getting — whether it&apos;s a single workstation or a full server rack.
        </p>
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Link
            href="/shop"
            className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-[inset_0_1px_0_0_rgb(255_255_255_/_0.2),0_1px_2px_0_rgb(15_23_42_/_0.2)] transition-colors hover:bg-indigo-500"
          >
            Browse what&apos;s for sale
          </Link>
          <Link
            href="#custom-build"
            className="surface rounded-full px-6 py-3 text-sm font-semibold transition-colors hover:border-slate-400 dark:hover:border-slate-600"
          >
            Request a custom build
          </Link>
          <Link
            href="#what-we-do"
            className="surface rounded-full px-6 py-3 text-sm font-semibold transition-colors hover:border-slate-400 dark:hover:border-slate-600"
          >
            What we do
          </Link>
        </div>
      </section>

      <section id="what-we-do" className="flex flex-col gap-8 scroll-mt-20">
        <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
          <h2 className="text-2xl font-semibold tracking-tight">What We Do</h2>
          <p className="mt-2 max-w-xl text-slate-600 dark:text-slate-400">
            A small team that does a few things well, rather than everything at once.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {services.map((service) => (
            <div key={service.title} className="surface flex flex-col items-start gap-4 rounded-xl p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 shadow-[inset_0_1px_0_0_rgb(255_255_255_/_0.6)] dark:bg-indigo-500/10 dark:text-indigo-400 dark:shadow-[inset_0_1px_0_0_rgb(255_255_255_/_0.08)]">
                {service.icon}
              </span>
              <h3 className="text-lg font-semibold">{service.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{service.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Full-bleed section — breaks out of the page's max-width container, Apple/Microsoft-style. */}
      <section className="relative left-1/2 -mx-[50vw] w-screen bg-slate-900 py-20 ring-1 ring-white/5 sm:py-28 dark:bg-slate-900/60">
        <div className="mx-auto flex max-w-3xl flex-col items-start gap-8 px-6">
          <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">Not a typical MSP</h2>
          <ul className="flex flex-col gap-4 text-lg text-slate-300">
            {[
              "We are a small group of extremely talented Tier 3 and Tier 4 network focused individuals",
              "We are DELIGHTED to work on a project or hourly basis. No monthly fixed charges required.",
              "We don't have the \"we do everything\" attitude. What we do, we do extremely well.",
              "Immediate access 24/7 to your preferred tech via SMS.",
            ].map((line) => (
              <li key={line} className="border-l-2 border-slate-700 pl-4">
                {line}
              </li>
            ))}
          </ul>
          <Link
            href="/contact"
            className="rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-slate-900 shadow-[inset_0_1px_0_0_rgb(255_255_255_/_0.3),0_1px_2px_0_rgb(0_0_0_/_0.3)] transition-colors hover:bg-orange-400"
          >
            Contact us to discuss your needs
          </Link>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="flex flex-col gap-8">
          <div className="flex items-baseline justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
            <h2 className="text-2xl font-semibold tracking-tight">Recently listed</h2>
            <Link href="/shop" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {featured.map((asset) => (
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
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex flex-col gap-1 p-4">
                  <h3 className="font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {asset.name}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400">{formatPrice(asset.priceCents)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section id="custom-build" className="flex max-w-2xl scroll-mt-20 flex-col gap-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Request a custom build</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Need a PC build, laptop, or tablet configured for your specific needs — a single unit or a bulk order for
            a whole team? Tell us what you&apos;re looking for and we&apos;ll follow up with options and pricing.
          </p>
        </div>

        {submitted && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
            Thanks — your request has been received. We&apos;ll be in touch.
          </div>
        )}
        {error === "rate-limited" && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            Too many submissions from this connection. Please wait a while and try again.
          </div>
        )}

        <form action={createCustomOrderAction} className="surface flex flex-col gap-4 rounded-xl p-6">
          {/* Honeypot — hidden from real users via CSS; bots that fill in every
              field tend to fill this one in too, which flags them silently. */}
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0"
          />
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Name
              <input name="name" required className="field rounded-lg px-3 py-2.5 text-sm" />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Email
              <input type="email" name="email" required className="field rounded-lg px-3 py-2.5 text-sm" />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              What do you need?
              <select name="category" defaultValue="pc-build" className="field rounded-lg px-3 py-2.5 text-sm">
                <option value="pc-build">PC build</option>
                <option value="laptop">Laptop</option>
                <option value="tablet">Tablet</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              How many do you need?
              <input
                type="number"
                name="quantity"
                min={1}
                step={1}
                defaultValue={1}
                required
                className="field rounded-lg px-3 py-2.5 text-sm"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Specific model <span className="font-normal text-slate-500">(optional)</span>
              <input
                name="model"
                placeholder="e.g. Dell Latitude 5440"
                className="field rounded-lg px-3 py-2.5 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Budget <span className="font-normal text-slate-500">(optional)</span>
              <input
                name="budget"
                placeholder="e.g. $1,000–$1,500, or per unit"
                className="field rounded-lg px-3 py-2.5 text-sm"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Tell us what you&apos;re looking for
            <textarea
              name="details"
              required
              rows={4}
              placeholder="Use case, must-have specs, anything else that helps us scope it…"
              className="field rounded-lg px-3 py-2.5 text-sm"
            />
          </label>

          <button
            type="submit"
            className="self-start rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[inset_0_1px_0_0_rgb(255_255_255_/_0.2),0_1px_2px_0_rgb(15_23_42_/_0.2)] transition-colors hover:bg-indigo-500"
          >
            Submit request
          </button>
        </form>
      </section>
    </div>
  );
}
