/**
 * Cloudflare Turnstile — a privacy-respecting CAPTCHA for the two public forms.
 *
 * Deliberately inert until configured. With no keys set, `isTurnstileConfigured()`
 * is false, the widget never renders, and the actions skip verification entirely,
 * so local development and the current deployment keep working untouched. Adding
 * the two environment variables is what switches it on — no code change needed.
 *
 * This is the third spam layer, not the only one: the honeypot and the
 * minimum-time-to-submit check in src/lib/validate.ts still run either way.
 */

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** The origin the browser loads the widget from — needed by the CSP in security.ts. */
export const TURNSTILE_ORIGIN = "https://challenges.cloudflare.com";

/** How long to wait on Cloudflare before giving up (see the fail-closed note below). */
const VERIFY_TIMEOUT_MS = 5_000;

export function turnstileSiteKey(): string | null {
  return process.env.TURNSTILE_SITE_KEY?.trim() || null;
}

function turnstileSecretKey(): string | null {
  return process.env.TURNSTILE_SECRET_KEY?.trim() || null;
}

/**
 * True only when BOTH keys are present. Requiring both avoids the worst
 * half-configured state: a visible widget whose answer is never actually checked,
 * which looks protected while protecting nothing.
 */
export function isTurnstileConfigured(): boolean {
  return Boolean(turnstileSiteKey() && turnstileSecretKey());
}

/**
 * Verifies the token the widget puts in the form.
 *
 * Fails CLOSED: if the token is missing, or Cloudflare is unreachable, or the
 * request times out, this returns false and the submission is refused. The
 * alternative — letting submissions through whenever the check is unavailable —
 * turns any outage into an open door, and an attacker can cause that outage by
 * simply blocking the call. The caller surfaces a generic "try again" message.
 */
export async function verifyTurnstileToken(token: string, remoteIp?: string): Promise<boolean> {
  const secret = turnstileSecretKey();
  if (!secret) return false;
  if (!token) return false;

  const body = new URLSearchParams({ secret, response: token });
  // Only send an IP we actually trust; see src/lib/request-ip.ts for why the
  // fallback value is a shared placeholder rather than a real address.
  if (remoteIp && remoteIp !== "unknown") {
    body.set("remoteip", remoteIp);
  }

  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: "POST",
      body,
      signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS),
    });
    if (!response.ok) {
      console.error(`[turnstile] siteverify returned HTTP ${response.status}`);
      return false;
    }

    const result = (await response.json()) as { success?: boolean; "error-codes"?: string[] };
    if (!result.success) {
      // Error codes describe the token, not the visitor, so they're safe to log
      // and are the only way to tell "expired token" from "wrong secret key".
      console.warn(`[turnstile] rejected: ${(result["error-codes"] ?? ["unknown"]).join(", ")}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error(
      "[turnstile] verification call failed:",
      error instanceof Error ? error.message : String(error),
    );
    return false;
  }
}
