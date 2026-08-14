import Link from "next/link";
import { listAvailableAssets } from "@/lib/store";
import { formatPrice } from "@/lib/format";
import { createCustomOrderAction } from "./custom-order/actions";
import { AssetThumbnail } from "./AssetThumbnail";

/** The four claims that actually separate OPTS from a typical MSP — surfaced in
 *  the hero rather than buried, since they're the reason to pick OPTS at all. */
const differentiators = [
  "Tier 3 and Tier 4 network engineers — not a call-center front desk",
  "Project or hourly work. No monthly contract, no fixed retainer",
  "Immediate 24/7 access to your preferred tech via SMS",
  "Every unit we sell is tracked down to its serial number",
];

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
  {
    title: "Custom Builds",
    description:
      "PCs, laptops, and tablets configured to your spec — a single workstation or a bulk order imaged identically for a whole team.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
        <rect x="3" y="4" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M2 20h20M9 8h6M12 8v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Refurbished Equipment",
    description:
      "Workstations, servers, and peripherals checked against the physical unit before listing — serial numbers and included parts verified, never copied off a spec sheet.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
        <path
          d="M4 6h16M4 6v13a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V6M4 6l2-3h12l2 3M9 11a3 3 0 0 0 6 0"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Repairs & Warranty",
    description:
      "Something failing? Send us the details and we'll take it from there — repair requests and warranty claims are tracked to the specific unit.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
        <path
          d="M14.7 6.3a4 4 0 0 1 5 5l-8.5 8.5a2.1 2.1 0 0 1-3-3L16.7 8.3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M9 4L4.5 8.5 7 11l4.5-4.5L9 4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
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
      <section className="flex flex-col gap-10 py-14 sm:py-20">
        <div className="flex flex-col items-start gap-6">
          <p className="text-xs font-semibold tracking-widest text-indigo-600 uppercase dark:text-indigo-400">
            Ohio Pro Tech &amp; Services LLC
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            IT equipment and services you can trust — down to the serial number.
          </h1>

          <ul className="flex flex-col gap-3">
            {differentiators.map((line) => (
              <li key={line} className="flex gap-3 text-slate-700 dark:text-slate-300">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400"
                  aria-hidden="true"
                >
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {line}
              </li>
            ))}
          </ul>

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
          </div>
        </div>

        {/* Contact strip sits under the pitch, laid out horizontally so it reads
            as a footer to the hero rather than a competing column. */}
        <div className="surface flex flex-col gap-6 rounded-2xl p-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <div>
            <p className="text-xs font-semibold tracking-widest text-indigo-600 uppercase dark:text-indigo-400">
              Talk to a tech
            </p>
            <p className="mt-2 text-lg font-semibold">Got something broken right now?</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Call us directly, or send the details and we&apos;ll pick it up from there.
            </p>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 text-sm sm:flex-row sm:gap-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10 dark:border-slate-800">
            <a
              href="tel:+14402909160"
              className="flex items-center gap-3 font-semibold hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true">
                <path
                  d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
              (440) 290-9160
            </a>
            <p className="flex items-start gap-3 text-slate-600 dark:text-slate-400">
              <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" aria-hidden="true">
                <path
                  d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
              </svg>
              7250 Commerce Drive
              <br />
              Mentor, Ohio 44060
            </p>
          </div>

          <Link
            href="/contact"
            className="shrink-0 rounded-full bg-orange-500 px-5 py-2.5 text-center text-sm font-semibold text-slate-900 shadow-[inset_0_1px_0_0_rgb(255_255_255_/_0.3),0_1px_2px_0_rgb(15_23_42_/_0.2)] transition-colors hover:bg-orange-400"
          >
            Send us the details
          </Link>
        </div>
      </section>

      <section id="what-we-do" className="flex flex-col gap-8 scroll-mt-20">
        <div>
          <p className="text-xs font-semibold tracking-widest text-indigo-600 uppercase dark:text-indigo-400">
            Services
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">What We Do</h2>
          <p className="mt-2 max-w-xl text-slate-600 dark:text-slate-400">
            A small team that does a few things well, rather than everything at once.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* Full-bleed dark band. The differentiator bullets that used to live here
          moved up into the hero, so this is now the mid-page call to action. */}
      <section className="relative left-1/2 -mx-[50vw] w-screen bg-slate-900 py-16 ring-1 ring-white/5 sm:py-20 dark:bg-slate-900/60">
        <div className="mx-auto flex max-w-5xl flex-col items-start gap-8 px-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-widest text-orange-400 uppercase">Not a typical MSP</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              No contracts. No call centers. Just the tech who knows your setup.
            </h2>
            <p className="mt-4 text-lg text-slate-300">
              Tell us what you need — a one-off project, an hourly fix, or a whole fleet of machines — and
              we&apos;ll tell you straight whether it&apos;s something we do well.
            </p>
          </div>
          <Link
            href="/contact"
            className="shrink-0 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-slate-900 shadow-[inset_0_1px_0_0_rgb(255_255_255_/_0.3),0_1px_2px_0_rgb(0_0_0_/_0.3)] transition-colors hover:bg-orange-400"
          >
            Contact us to discuss your needs
          </Link>
        </div>
      </section>

      {/* Full-bleed tinted band so the storefront reads as its own distinct area
          of the page rather than another block of text. */}
      {featured.length > 0 && (
        <section className="relative left-1/2 -mx-[50vw] w-screen border-y border-slate-200 bg-slate-100/70 py-16 sm:py-20 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold tracking-widest text-indigo-600 uppercase dark:text-indigo-400">
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                    <path
                      d="M4 6h16M4 6v13a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V6M4 6l2-3h12l2 3M9 11a3 3 0 0 0 6 0"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  The Store
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">Recently listed</h2>
                <p className="mt-2 max-w-xl text-slate-600 dark:text-slate-400">
                  Refurbished equipment that&apos;s in stock and ready to ship — every unit tracked down to its
                  serial number.
                </p>
              </div>
              <Link
                href="/shop"
                className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[inset_0_1px_0_0_rgb(255_255_255_/_0.2),0_1px_2px_0_rgb(15_23_42_/_0.2)] transition-colors hover:bg-indigo-500"
              >
                Shop all listings →
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {featured.map((asset) => (
                <Link
                  key={asset.id}
                  href={`/shop/${asset.id}`}
                  className="surface group flex flex-col overflow-hidden rounded-xl transition-colors hover:border-indigo-400 dark:hover:border-indigo-500"
                >
                  <div className="relative">
                    <AssetThumbnail
                      image={asset.images[0]}
                      alt={asset.name}
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="aspect-[4/3]"
                    />
                    {/* Price as a tag on the photo — reads as a shop listing at a glance. */}
                    <span className="absolute top-3 right-3 rounded-full bg-white/95 px-3 py-1 text-sm font-semibold text-slate-900 shadow-sm backdrop-blur dark:bg-slate-950/90 dark:text-slate-50">
                      {formatPrice(asset.priceCents)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 p-4">
                    <h3 className="font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {asset.name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{asset.model}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="custom-build" className="flex max-w-2xl scroll-mt-20 flex-col gap-8">
        <div>
          <p className="text-xs font-semibold tracking-widest text-indigo-600 uppercase dark:text-indigo-400">
            Custom Work
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Request a custom build</h2>
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
