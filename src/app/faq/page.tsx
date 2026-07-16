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

export default function FaqPage() {
  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Frequently asked questions</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Don&apos;t see your question here? <a href="/contact" className="text-indigo-600 underline dark:text-indigo-400">Contact us</a>.
        </p>
      </div>

      <div className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
        {faqs.map((faq) => (
          <div key={faq.q} className="py-4">
            <h2 className="font-medium">{faq.q}</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{faq.a}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-zinc-400">
        These are placeholder questions and answers — edit them in{" "}
        <code className="rounded bg-zinc-100 px-1 py-0.5 dark:bg-zinc-900">src/app/faq/page.tsx</code>.
      </p>
    </div>
  );
}
