export function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

// OPTS is Ohio-based, so timestamps are shown in Eastern time rather than
// left to whatever timezone the server happens to run in (ambiguous once
// deployed — e.g. Vercel's Node runtime defaults to UTC). "America/New_York"
// (not a fixed "EST" offset) so this automatically follows EST/EDT correctly.
const BUSINESS_TIME_ZONE = "America/New_York";

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: BUSINESS_TIME_ZONE,
  });
}

/**
 * For plain calendar dates (e.g. "2026-07-01" from an <input type="date">) that
 * represent a day, not a moment in time. formatDate() would parse this as UTC
 * midnight and then render it in the viewer's local timezone, which can shift
 * it back a day for anyone west of UTC — this formats in UTC throughout instead
 * so the displayed date always matches what was entered.
 */
export function formatDateOnly(dateOnly: string): string {
  const [year, month, day] = dateOnly.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
