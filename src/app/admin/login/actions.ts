"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authenticate, createSessionValue, SESSION_COOKIE_NAME } from "@/lib/session";
import { isRateLimited } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";
import { logSecurityEvent } from "@/lib/security-log";

const LOGIN_ATTEMPT_LIMIT = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export async function loginAction(formData: FormData) {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const from = String(formData.get("from") ?? "/admin");
  const safeFrom = from.startsWith("/admin") ? from : "/admin";

  // Rate-limit every attempt (not just failures) so brute-forcing can't just
  // keep guessing at full speed even if it occasionally finds valid-looking input.
  const ip = await getClientIp();
  if (isRateLimited(`login:${ip}`, LOGIN_ATTEMPT_LIMIT, LOGIN_WINDOW_MS)) {
    // Logged before the redirect, because redirect() throws to unwind.
    await logSecurityEvent({ type: "login.rate_limited", ip, subject: username });
    redirect(`/admin/login?error=rate-limited&from=${encodeURIComponent(safeFrom)}`);
  }

  const result = await authenticate(username, password);
  if (!result.ok) {
    // The attempted username is recorded; the password never is, not even
    // hashed or truncated. A log of wrong guesses is a log of near-miss
    // passwords, and people reuse them across accounts.
    await logSecurityEvent({ type: "login.failed", ip, subject: username });
    redirect(`/admin/login?error=1&from=${encodeURIComponent(safeFrom)}`);
  }

  // Successes are recorded too: "logged in from an address you don't recognise"
  // is only answerable if the normal case is on record as well.
  await logSecurityEvent({ type: "login.succeeded", ip, subject: result.subject });

  const store = await cookies();
  // No maxAge/expires on purpose — this makes it a browser-session cookie, so
  // signing in only lasts until the browser (not just the tab) is closed, or
  // until "Sign out" is clicked. The signed token's own SESSION_TTL_MS in
  // session.ts still caps it at 7 days as a backstop, in case a browser or
  // extension restores cookies across a restart.
  store.set(SESSION_COOKIE_NAME, createSessionValue(result.subject), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    // Strict, not lax: the cookie is never sent on a request that originated
    // from another site, so a cross-site form post or image tag can't ride an
    // existing admin session. Trade-off: following an external link straight to
    // an /admin page shows the login screen once, since the browser withholds
    // the cookie on that first cross-site navigation.
    sameSite: "strict",
    path: "/",
  });

  redirect(safeFrom);
}

export async function logoutAction() {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
  redirect("/admin/login");
}
