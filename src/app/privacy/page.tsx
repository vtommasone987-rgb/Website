import { connection } from "next/server";
import Link from "next/link";

/**
 * Privacy policy.
 *
 * Written to describe what this application actually does, verified against the
 * code rather than copied from a template: the two public forms in
 * contact/actions.ts and custom-order/actions.ts, the security log in
 * src/lib/security-log.ts, and the session cookie in admin/login/actions.ts.
 *
 * Anything requiring a business decision (how long submissions are kept) or a
 * lawyer (which regulations apply) is marked on the page rather than invented.
 */
export default async function PrivacyPage() {
  // Per-request for the CSP nonce, same as the other content pages. See src/proxy.ts.
  await connection();

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Privacy</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          What we collect when you use this site, why, and who it goes to. Short version: only what
          you type into a form, and it isn&apos;t sold or shared for advertising.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <section className="surface rounded-xl p-5">
          <h2 className="text-lg font-semibold">What we collect</h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Only what you enter into one of our two forms:
          </p>
          <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-sm text-neutral-600 dark:text-neutral-400">
            <li>
              <strong className="text-neutral-900 dark:text-neutral-100">Support ticket</strong> — your
              name, email address, the category you pick, and what you write.
            </li>
            <li>
              <strong className="text-neutral-900 dark:text-neutral-100">Custom build request</strong> —
              your name, email address, the type of device, quantity, and optionally a model and
              budget.
            </li>
          </ul>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            We use it to answer you. We don&apos;t sell it, rent it, or share it for advertising.
          </p>
        </section>

        <section className="surface rounded-xl p-5">
          <h2 className="text-lg font-semibold">What we don&apos;t collect</h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            There are no analytics, no advertising trackers, and no third-party scripts on this
            site. We don&apos;t build a profile of you, and browsing the site sets no tracking
            cookies. The only cookie this site can set is a sign-in cookie for our own staff, which
            you never receive as a visitor.
          </p>
        </section>

        <section className="surface rounded-xl p-5">
          <h2 className="text-lg font-semibold">Security records</h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            To spot break-in attempts, we keep a short record of failed staff sign-ins and blocked
            form submissions. That record includes the network (IP) address involved and the time.
            It deliberately never contains passwords, the contents of your message, or your email
            address.
          </p>
        </section>

        <section className="surface rounded-xl p-5">
          <h2 className="text-lg font-semibold">Spam protection</h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Our forms may use Cloudflare Turnstile to check that a submission comes from a person
            rather than a bot. When it&apos;s switched on, Cloudflare receives technical information
            about your browser in order to make that check. Cloudflare states it does not use
            Turnstile data to build advertising profiles — see{" "}
            <a
              href="https://www.cloudflare.com/privacypolicy/"
              className="font-medium text-brand-600 underline dark:text-brand-400"
              rel="noopener noreferrer"
              target="_blank"
            >
              Cloudflare&apos;s privacy policy
            </a>
            .
          </p>
        </section>

        <section className="surface rounded-xl p-5">
          <h2 className="text-lg font-semibold">How long we keep it</h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            [Placeholder — decide and state a retention period, e.g. &quot;we keep submissions for
            24 months after your enquiry is closed.&quot;] Items deleted from our internal records
            are permanently removed after 7 days.
          </p>
        </section>

        <section className="surface rounded-xl p-5">
          <h2 className="text-lg font-semibold">Asking for a copy, or deletion</h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Email or call us and we&apos;ll tell you what we hold about you, correct it, or delete
            it. Contact details are on the{" "}
            <Link
              href="/contact"
              className="font-medium text-brand-600 underline dark:text-brand-400"
            >
              Contact page
            </Link>
            .
          </p>
        </section>
      </div>

      <p className="text-xs text-neutral-500">
        This page describes how the site actually works today. It is not legal advice — if you trade
        with customers in a region with specific privacy laws, have it reviewed before relying on it.
      </p>
    </div>
  );
}
