import { createTicketAction } from "./actions";
import Link from "next/link";
import { TurnstileWidget } from "@/app/TurnstileWidget";

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string; error?: string }>;
}) {
  const { submitted, error } = await searchParams;

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Contact us</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Questions about a listing, an order, or anything else — reach out and we&apos;ll get back to you.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="surface rounded-xl p-4">
          <h2 className="text-xs font-semibold tracking-wide text-brand-600 uppercase dark:text-brand-400">
            Address
          </h2>
          <p className="mt-1 font-medium">7250 Commerce Drive. Mentor, Ohio 44060</p>
        </div>
        <div className="surface rounded-xl p-4">
          <h2 className="text-xs font-semibold tracking-wide text-brand-600 uppercase dark:text-brand-400">Email</h2>
          {/* PLACEHOLDER — replace with your real support address */}
          <p className="mt-1 font-medium">support@example.com</p>
        </div>
        <div className="surface rounded-xl p-4">
          <h2 className="text-xs font-semibold tracking-wide text-brand-600 uppercase dark:text-brand-400">Phone</h2>
          <p className="mt-1 font-medium">(440) 290-9160</p>
        </div>
        <div className="surface rounded-xl p-4">
          <h2 className="text-xs font-semibold tracking-wide text-brand-600 uppercase dark:text-brand-400">Hours</h2>
          {/* PLACEHOLDER — replace with your real hours */}
          <p className="mt-1 font-medium">Mon–Fri, 9am–5pm</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-semibold">Submit a support ticket</h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Have a warranty claim, need a repair, or just want to share feedback? Let us know what&apos;s going on.
          </p>
        </div>

        {submitted && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
            Thanks — your ticket has been received. We&apos;ll be in touch.
          </div>
        )}
        {error === "rate-limited" && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            Too many submissions from this connection. Please wait a while and try again.
          </div>
        )}
        {error === "invalid" && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            Something in that submission didn&apos;t look right. Please check your details and try again.
          </div>
        )}
        {error === "unavailable" && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
            We couldn&apos;t save that just now. Please try again in a moment, or call us at (440) 290-9160.
          </div>
        )}
        {error === "captcha" && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            We couldn&apos;t confirm you&apos;re human. Please tick the box and try again.
          </div>
        )}

        <form action={createTicketAction} className="surface flex flex-col gap-4 rounded-xl p-6">
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
          {/* Submission timestamp, paired with the check in the action: a post that
              arrives seconds after the page rendered is a bot, not a person typing. */}
          <input type="hidden" name="started" value={String(Date.now())} />
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Name
              <input name="name" required maxLength={100} className="field rounded-lg px-3 py-2.5 text-sm" />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Email
              <input type="email" name="email" required maxLength={254} className="field rounded-lg px-3 py-2.5 text-sm" />
            </label>
          </div>

          <label className="flex flex-col gap-1.5 text-sm font-medium">
            What is this about?
            <select name="category" defaultValue="repair" className="field rounded-lg px-3 py-2.5 text-sm">
              <option value="warranty">Warranty claim</option>
              <option value="repair">Repair request</option>
              <option value="feedback">Feedback</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium">
            What&apos;s wrong, or what would you like us to know?
            <textarea
              name="description"
              required
              maxLength={5000}
              rows={4}
              placeholder="Describe the issue or your feedback…"
              className="field rounded-lg px-3 py-2.5 text-sm"
            />
          </label>

          {/* Renders nothing until Turnstile keys are configured. */}
          <TurnstileWidget />

          <button
            type="submit"
            className="self-start rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[inset_0_1px_0_0_rgb(255_255_255_/_0.2),0_1px_2px_0_rgb(0_0_0_/_0.2)] transition-colors hover:bg-brand-700"
          >
            Submit ticket
          </button>

          <p className="text-xs text-neutral-500">
            We use your details only to reply to you. See our{" "}
            <Link href="/privacy" className="underline hover:text-neutral-700 dark:hover:text-neutral-300">
              privacy page
            </Link>
            .
          </p>
        </form>
      </div>

      <p className="text-xs text-neutral-400">
        The email and hours above are still placeholders — the address and phone number are real, but the rest
        isn&apos;t yet. Edit them in{" "}
        <code className="rounded bg-neutral-200/60 px-1 py-0.5 dark:bg-neutral-800">src/app/contact/page.tsx</code>.
      </p>
    </div>
  );
}
