import { createHmac, timingSafeEqual } from "crypto";

/**
 * Signed, stateless admin session tokens (payload = expiry timestamp, signed with
 * an HMAC secret). No database is needed to validate a session, which matters
 * because this same check has to run in `proxy.ts` (fast, no DB access) and in
 * every admin server action as a defense-in-depth check per Next.js's own guidance
 * that a proxy matcher change could silently stop covering a route.
 */

export const SESSION_COOKIE_NAME = "admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not set. Add it to .env.local.");
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

export function createSessionValue(): string {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = String(expires);
  return `${payload}.${sign(payload)}`;
}

export function isValidSessionValue(value: string | undefined | null): boolean {
  if (!value) return false;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return false;

  const expectedSignature = sign(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (signatureBuffer.length !== expectedBuffer.length) return false;
  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) return false;

  const expires = Number(payload);
  return Number.isFinite(expires) && Date.now() < expires;
}

function timingSafeEqualString(input: string, expected: string): boolean {
  const inputBuffer = Buffer.from(input);
  const expectedBuffer = Buffer.from(expected);
  if (inputBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(inputBuffer, expectedBuffer);
}

export function verifyCredentials(username: string, password: string): boolean {
  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedUsername || !expectedPassword) return false;
  // Check both regardless of whether the first already failed, so a wrong
  // username doesn't return faster than a wrong password (timing side-channel).
  const usernameOk = timingSafeEqualString(username, expectedUsername);
  const passwordOk = timingSafeEqualString(password, expectedPassword);
  return usernameOk && passwordOk;
}
