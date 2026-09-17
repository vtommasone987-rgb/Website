import { listRecentSecurityEvents, summarizeSecurityEvents } from "@/lib/security-log";
import { formatDate } from "@/lib/format";
import { isAdminSubject } from "@/lib/session";
import { getCurrentSubject } from "@/lib/auth";

/**
 * Owner-only, like Analytics. Two reasons: the log names which accounts were
 * targeted, and if a staff account is ever the thing misbehaving, the record of
 * it shouldn't be visible to that account.
 */

/** Plain-English labels — the stored `type` values are for grepping, not reading. */
const EVENT_LABELS: Record<string, { label: string; tone: "bad" | "warn" | "ok" }> = {
  "login.failed": { label: "Failed sign-in", tone: "bad" },
  "login.rate_limited": { label: "Sign-in blocked (too many tries)", tone: "bad" },
  "admin.unauthorized": { label: "Blocked admin request", tone: "bad" },
  "form.captcha_failed": { label: "Form blocked (failed CAPTCHA)", tone: "warn" },
  "form.rate_limited": { label: "Form blocked (too many submissions)", tone: "warn" },
  "login.succeeded": { label: "Successful sign-in", tone: "ok" },
};

function describe(type: string) {
  return EVENT_LABELS[type] ?? { label: type, tone: "warn" as const };
}

const TONE_CLASSES = {
  bad: "text-red-700 dark:text-red-400",
  warn: "text-amber-700 dark:text-amber-400",
  ok: "text-neutral-600 dark:text-neutral-400",
} as const;

export default async function SecurityLogPage() {
  if (!isAdminSubject(await getCurrentSubject())) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Security log</h1>
        <p className="text-sm text-neutral-500">This page is only available to the shop owner.</p>
      </div>
    );
  }

  const [events, summary] = await Promise.all([
    listRecentSecurityEvents(200),
    summarizeSecurityEvents(24),
  ]);

  const failedSignIns = summary.find((s) => s.type === "login.failed")?.count ?? 0;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Security log</h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Sign-in attempts and blocked submissions. Passwords, form contents and customer email
          addresses are never recorded here.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold tracking-wide text-neutral-500 uppercase">
          Last 24 hours
        </h2>
        {summary.length === 0 ? (
          <p className="surface rounded-xl p-5 text-sm text-neutral-500">
            Nothing recorded in the last 24 hours.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {summary.map((row) => (
              <div key={row.type} className="surface rounded-xl p-5">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {describe(row.type).label}
                </p>
                <p className={`mt-1 text-2xl font-semibold ${TONE_CLASSES[describe(row.type).tone]}`}>
                  {row.count}
                </p>
              </div>
            ))}
          </div>
        )}

        {failedSignIns >= 10 && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            {failedSignIns} failed sign-in attempts in the last 24 hours. If that wasn&apos;t you,
            change the admin password and check the addresses below.
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold tracking-wide text-neutral-500 uppercase">
          Recent events
        </h2>
        {events.length === 0 ? (
          <p className="surface rounded-xl p-5 text-sm text-neutral-500">
            Nothing recorded yet. Events appear here as they happen.
          </p>
        ) : (
          <div className="surface overflow-x-auto rounded-xl">
            <table className="w-full text-sm">
              <thead className="border-b border-neutral-200 text-left dark:border-neutral-800">
                <tr>
                  <th className="px-4 py-3 font-medium">When</th>
                  <th className="px-4 py-3 font-medium">Event</th>
                  <th className="px-4 py-3 font-medium">Account / attempt</th>
                  <th className="px-4 py-3 font-medium">From</th>
                  <th className="px-4 py-3 font-medium">Where</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => {
                  const meta = describe(event.type);
                  return (
                    <tr key={event.id} className="border-b border-neutral-100 dark:border-neutral-900">
                      <td className="px-4 py-3 whitespace-nowrap text-neutral-600 dark:text-neutral-400">
                        {formatDate(event.createdAt)}
                      </td>
                      <td className={`px-4 py-3 font-medium ${TONE_CLASSES[meta.tone]}`}>
                        {meta.label}
                      </td>
                      <td className="px-4 py-3">{event.subject ?? "—"}</td>
                      <td className="px-4 py-3 font-mono text-xs">{event.ip}</td>
                      <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                        {event.detail ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-xs text-neutral-500">
          Showing the {events.length} most recent events. &quot;From&quot; shows{" "}
          <span className="font-mono">unknown</span> until the host is configured to pass the real
          visitor address — see CLIENT_IP_HEADER in .env.example.
        </p>
      </section>
    </div>
  );
}
