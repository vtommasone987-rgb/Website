import { createTicketAction } from "./actions";

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string; error?: string }>;
}) {
  const { submitted, error } = await searchParams;

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Contact us</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Questions about a listing, an order, or anything else — reach out and we&apos;ll get back to you.
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
        <div>
          <h2 className="text-sm font-semibold text-zinc-500">Address</h2>
          <p className="text-lg">7250 Commerce Drive. Mentor, Ohio 44060</p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-zinc-500">Email</h2>
          {/* PLACEHOLDER — replace with your real support address */}
          <p className="text-lg">support@example.com</p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-zinc-500">Phone</h2>
          <p className="text-lg">(440) 290-9160</p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-zinc-500">Hours</h2>
          {/* PLACEHOLDER — replace with your real hours */}
          <p className="text-lg">Mon–Fri, 9am–5pm</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-semibold">Submit a support ticket</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Have a warranty claim, need a repair, or just want to share feedback? Let us know what&apos;s going on.
          </p>
        </div>

        {submitted && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
            Thanks — your ticket has been received. We&apos;ll be in touch.
          </div>
        )}
        {error === "rate-limited" && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            Too many submissions from this connection. Please wait a while and try again.
          </div>
        )}

        <form action={createTicketAction} className="flex flex-col gap-4 rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
          {/* Honeypot — real users never see this field (hidden via CSS below), so
              anything that fills it in is almost certainly a bot. */}
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
              <input
                name="name"
                required
                className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium">
              Email
              <input
                type="email"
                name="email"
                required
                className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-sm font-medium">
            What is this about?
            <select
              name="category"
              defaultValue="repair"
              className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="warranty">Warranty claim</option>
              <option value="repair">Repair request</option>
              <option value="feedback">Feedback</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium">
            What&apos;s wrong, or what would you like us to know?
            <textarea
              name="description"
              required
              rows={4}
              placeholder="Describe the issue or your feedback…"
              className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>

          <button
            type="submit"
            className="self-start rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Submit ticket
          </button>
        </form>
      </div>

      <p className="text-xs text-zinc-400">
        The email and hours above are still placeholders — the address and phone number are real, but the rest
        isn&apos;t yet. Edit them in{" "}
        <code className="rounded bg-zinc-100 px-1 py-0.5 dark:bg-zinc-900">src/app/contact/page.tsx</code>.
      </p>
    </div>
  );
}
