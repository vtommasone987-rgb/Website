import { headers } from "next/headers";

/**
 * The client IP used as the rate-limiting key.
 *
 * The hard part is that `X-Forwarded-For` is just a request header: anyone can
 * send one. The previous version returned the leftmost entry unconditionally,
 * which meant an attacker could send a different value on every request, land in
 * a fresh rate-limit bucket each time, and never be throttled at all — the login
 * limiter in particular was bypassable by anyone who knew to set the header.
 *
 * A forwarded header is only trustworthy when something we control is guaranteed
 * to have written it, so nothing here is trusted unless it has been configured
 * explicitly, per deployment:
 *
 *   CLIENT_IP_HEADER   Name of a header the hosting platform sets itself and
 *                      overwrites on the way in, so a client-supplied copy can't
 *                      survive. Cloudflare: "cf-connecting-ip".
 *                      Vercel: "x-vercel-forwarded-for".
 *
 *   TRUSTED_PROXY_HOPS How many proxies of our own sit in front of the app, when
 *                      using plain X-Forwarded-For (e.g. 1 for a single nginx).
 *                      Each proxy appends the address that connected to it, so
 *                      the real client sits that many entries from the right —
 *                      anything further left was supplied by the caller and is
 *                      therefore forgeable.
 *
 * With neither set we deliberately fall back to a single shared bucket rather
 * than trusting a spoofable value. That is the conservative direction: the worst
 * case is over-throttling, not a silently bypassed limiter. It is also the
 * correct behaviour for local development, where there is no proxy at all.
 */

const SHARED_FALLBACK_KEY = "unknown";

/** Takes the first token of a header value, tolerating a "a, b" list. */
function firstEntry(value: string): string {
  return value.split(",")[0]!.trim();
}

let warnedAboutMissingConfig = false;

function warnOnceInProduction(): void {
  if (warnedAboutMissingConfig) return;
  warnedAboutMissingConfig = true;
  if (process.env.NODE_ENV === "production") {
    console.warn(
      "Rate limiting is falling back to one shared bucket for every visitor: " +
        "neither CLIENT_IP_HEADER nor TRUSTED_PROXY_HOPS is set. Set whichever " +
        "matches the host (see .env.example) so limits apply per client.",
    );
  }
}

export async function getClientIp(): Promise<string> {
  const headersList = await headers();

  // 1. A header the platform itself writes. Preferred: the platform overwrites
  //    it on ingress, so a value the client tried to send never reaches us.
  const trustedHeaderName = process.env.CLIENT_IP_HEADER?.trim().toLowerCase();
  if (trustedHeaderName) {
    const value = headersList.get(trustedHeaderName);
    if (value) return firstEntry(value);
    // Configured but absent means the deployment doesn't match the config, so
    // fall through rather than quietly reaching for a spoofable header instead.
  }

  // 2. X-Forwarded-For, counted from the right by how many proxies we own.
  const hops = Number(process.env.TRUSTED_PROXY_HOPS ?? 0);
  if (Number.isInteger(hops) && hops > 0) {
    const forwardedFor = headersList.get("x-forwarded-for");
    if (forwardedFor) {
      const entries = forwardedFor
        .split(",")
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0);
      const clientIndex = entries.length - hops;
      // A shorter list than configured means a request that didn't come through
      // the expected chain; treat it as untrusted rather than guessing.
      if (clientIndex >= 0 && entries[clientIndex]) return entries[clientIndex];
    }
  }

  // 3. Nothing trustworthy available.
  warnOnceInProduction();
  return SHARED_FALLBACK_KEY;
}
