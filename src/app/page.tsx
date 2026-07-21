import Link from "next/link";
import { PageNav } from "./PageNav";

export default function Home() {
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
          <Link
            href="/what-we-do"
            className="rounded-full border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-50 dark:hover:border-zinc-500"
          >
            What we do
          </Link>
        </div>
      </section>

      <section className="flex flex-col gap-6 overflow-hidden rounded-2xl bg-blue-950 px-8 py-12 sm:px-12 sm:py-16">
        <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">Not a typical MSP</h2>
        <ul className="flex flex-col gap-3 text-white/90">
          <li className="flex gap-3">
            <span aria-hidden className="text-white/50">•</span>
            We are a small group of extremely talented Tier 3 and Tier 4 network focused individuals
          </li>
          <li className="flex gap-3">
            <span aria-hidden className="text-white/50">•</span>
            We are DELIGHTED to work on a project or hourly basis. No monthly fixed charges required.
          </li>
          <li className="flex gap-3">
            <span aria-hidden className="text-white/50">•</span>
            We don&apos;t have the &quot;we do everything&quot; attitude. What we do, we do extremely well.
          </li>
          <li className="flex gap-3">
            <span aria-hidden className="text-white/50">•</span>
            Immediate access 24/7 to your preferred tech via SMS.
          </li>
        </ul>
        <Link
          href="/contact"
          className="self-start rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-zinc-900 transition-colors hover:bg-orange-400"
        >
          Contact us to discuss your needs
        </Link>
      </section>

      <PageNav current={1} />
    </div>
  );
}
