import Link from "next/link";
import { PageNav } from "./PageNav";

export default function Home() {
  return (
    <div className="flex flex-col gap-16">
      <section className="relative flex flex-col items-start gap-6 overflow-hidden py-8 sm:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl dark:bg-indigo-500/10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-10 right-0 h-72 w-72 rounded-full bg-orange-400/10 blur-3xl"
        />

        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
          Ohio Pro Tech &amp; Services LLC
        </p>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-6xl">
          IT equipment and services you can trust{" "}
          <span className="bg-gradient-to-r from-indigo-600 to-orange-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-orange-400">
            down to the serial number.
          </span>
        </h1>
        <p className="max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
          OPTS tracks every device by model, serial number, and included parts, so you know exactly what
          you&apos;re getting — whether it&apos;s a single workstation or a full server rack.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/shop"
            className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-xl hover:shadow-indigo-600/30"
          >
            Browse what&apos;s for sale
          </Link>
          <Link
            href="/custom-order"
            className="rounded-full border border-zinc-300 bg-white/50 px-6 py-3 text-sm font-semibold text-zinc-900 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-zinc-400 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-50 dark:hover:border-zinc-500"
          >
            Request a custom build
          </Link>
          <Link
            href="/what-we-do"
            className="rounded-full border border-zinc-300 bg-white/50 px-6 py-3 text-sm font-semibold text-zinc-900 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-zinc-400 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-50 dark:hover:border-zinc-500"
          >
            What we do
          </Link>
        </div>
      </section>

      <section className="relative flex flex-col gap-6 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 px-8 py-12 shadow-2xl shadow-indigo-950/50 sm:px-12 sm:py-16">
        <div aria-hidden className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 left-0 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />

        <h2 className="relative max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Not a typical MSP
        </h2>
        <ul className="relative flex flex-col gap-3 text-white/90">
          {[
            "We are a small group of extremely talented Tier 3 and Tier 4 network focused individuals",
            "We are DELIGHTED to work on a project or hourly basis. No monthly fixed charges required.",
            "We don't have the \"we do everything\" attitude. What we do, we do extremely well.",
            "Immediate access 24/7 to your preferred tech via SMS.",
          ].map((line) => (
            <li key={line} className="flex gap-3">
              <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 h-5 w-5 shrink-0 text-orange-400" aria-hidden="true">
                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {line}
            </li>
          ))}
        </ul>
        <Link
          href="/contact"
          className="relative self-start rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-zinc-900 shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5 hover:bg-orange-400 hover:shadow-xl hover:shadow-orange-500/30"
        >
          Contact us to discuss your needs
        </Link>
      </section>

      <PageNav current={1} />
    </div>
  );
}
