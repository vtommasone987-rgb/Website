import { createCustomOrderAction } from "./actions";

const inputClass =
  "rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-zinc-900";

export default async function CustomOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string; error?: string }>;
}) {
  const { submitted, error } = await searchParams;

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Request a custom build</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Need a PC build, laptop, or tablet configured for your specific needs — a single unit or a bulk order for
          a whole team? Tell us what you&apos;re looking for and we&apos;ll follow up with options and pricing.
        </p>
      </div>

      {submitted && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
          Thanks — your request has been received. We&apos;ll be in touch.
        </div>
      )}
      {error === "rate-limited" && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          Too many submissions from this connection. Please wait a while and try again.
        </div>
      )}

      <form
        action={createCustomOrderAction}
        className="flex flex-col gap-4 rounded-2xl border border-zinc-200 p-6 shadow-sm dark:border-zinc-800"
      >
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
          <label className="flex flex-col gap-1 text-sm font-medium">
            Name
            <input name="name" required className={inputClass} />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Email
            <input type="email" name="email" required className={inputClass} />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium">
            What do you need?
            <select name="category" defaultValue="pc-build" className={inputClass}>
              <option value="pc-build">PC build</option>
              <option value="laptop">Laptop</option>
              <option value="tablet">Tablet</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            How many do you need?
            <input type="number" name="quantity" min={1} step={1} defaultValue={1} required className={inputClass} />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Specific model <span className="font-normal text-zinc-500">(optional)</span>
            <input name="model" placeholder="e.g. Dell Latitude 5440" className={inputClass} />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Budget <span className="font-normal text-zinc-500">(optional)</span>
            <input name="budget" placeholder="e.g. $1,000–$1,500, or per unit" className={inputClass} />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Tell us what you&apos;re looking for
          <textarea
            name="details"
            required
            rows={4}
            placeholder="Use case, must-have specs, anything else that helps us scope it…"
            className={inputClass}
          />
        </label>

        <button
          type="submit"
          className="self-start rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-lg"
        >
          Submit request
        </button>
      </form>
    </div>
  );
}
