import { headers } from "next/headers";

/** Best-effort client IP for rate-limiting keys. Falls back to a constant if unavailable (e.g. local dev). */
export async function getClientIp(): Promise<string> {
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return headersList.get("x-real-ip") ?? "unknown";
}
