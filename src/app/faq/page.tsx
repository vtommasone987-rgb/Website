import { connection } from "next/server";

const faqs = [
  {
    q: "How accurate are the serial numbers and parts lists?",
    a: "Every listing is checked against the physical item before it goes up — the serial number and every included part are verified, not copied from a spec sheet.",
  },
  {
    q: "Can I get more photos of an item?",
    a: "Yes — reach out on the Contact page with the listing name and we'll send more photos or answer specific condition questions.",
  },
  {
    q: "Do you offer local pickup?",
    a: "This is a placeholder answer — update it once you've decided your pickup/shipping policy.",
  },
  {
    q: "What condition are items in?",
    a: "Each listing's description notes condition details (wear, missing accessories, etc.) individually — check the specific listing for details.",
  },
];

export default async function FaqPage() {
  // Rendered per request rather than prerendered at build: a CSP nonce only exists
  // once there is a request, and Next can't stamp one onto build-time HTML. See src/proxy.ts.
  await connection();

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Frequently asked questions</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Don&apos;t see your question here?{" "}
          <a href="/contact" className="font-medium text-brand-600 underline underline-offset-2 dark:text-brand-400">
            Contact us
          </a>
          .
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {faqs.map((faq) => (
          <div
            key={faq.q}
            className="surface rounded-xl p-5 transition-colors hover:border-neutral-400 dark:hover:border-neutral-600"
          >
            <h2 className="flex items-start gap-2 font-semibold">
              <span className="text-brand-500 dark:text-brand-400">Q.</span>
              {faq.q}
            </h2>
            <p className="mt-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{faq.a}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-neutral-400">
        These are placeholder questions and answers — edit them in{" "}
        <code className="rounded bg-neutral-200/60 px-1 py-0.5 dark:bg-neutral-800">src/app/faq/page.tsx</code>.
      </p>
    </div>
  );
}
