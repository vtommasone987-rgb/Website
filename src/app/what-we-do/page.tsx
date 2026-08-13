import Link from "next/link";

const services = [
  {
    title: "Support",
    description:
      "When you want help, you want it NOW. Our techs have solid reputations for being extremely knowledgeable and extremely responsive.",
    cta: "Learn More",
    href: "/contact",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" aria-hidden="true">
        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Backup and Disaster Recovery",
    description:
      "We are Veeam Pro Partners and represent ONLY Veeam for reliable and secure backups. Why? Because it's the best – and so is our Cloud Connect network.",
    cta: "Learn More",
    href: "/contact",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" aria-hidden="true">
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
    cta: "Learn More",
    href: "/contact",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" aria-hidden="true">
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

export default function WhatWeDoPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">What We Do</h1>
        <p className="mt-2 max-w-xl text-zinc-600 dark:text-zinc-400">
          A small team that does a few things well, rather than everything at once.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {services.map((service) => (
          <div
            key={service.title}
            className="flex flex-col items-center gap-4 rounded-2xl border border-zinc-200 p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-zinc-800"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              {service.icon}
            </span>
            <h2 className="text-lg font-semibold">{service.title}</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{service.description}</p>
            <Link
              href={service.href}
              className="mt-auto rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-zinc-900 shadow-md shadow-orange-500/20 transition-all hover:-translate-y-0.5 hover:bg-orange-400 hover:shadow-lg"
            >
              {service.cta}
            </Link>
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-16">
        <Link
          href="/"
          className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
