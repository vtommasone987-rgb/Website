import { createHmac, timingSafeEqual } from "crypto";
import { findEmployeeByUsername } from "./store";
import { verifyPassword } from "./password";

/**
 * Signed, stateless admin session tokens (payload = subject + expiry timestamp,
 * signed with an HMAC secret). No database is needed to validate a session, which
 * matters because this same check has to run in `proxy.ts` (fast, no DB access) and
 * in every admin server action as a defense-in-depth check per Next.js's own guidance
 * that a proxy matcher change could silently stop covering a route.
 *
 * Trade-off worth knowing: because validation never hits the store, deleting an
 * employee doesn't invalidate any session they already have — they stay signed in
 * until that cookie expires (7 days) or they sign out. Revoking sooner would need a
 * server-side session list, which defeats the "no DB lookup" point of this design.
 */

export const SESSION_COOKIE_NAME = "admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const ADMIN_SUBJECT = "admin";
const EMPLOYEE_SUBJECT_PREFIX = "employee:";

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

export function createSessionValue(subject: string): string {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = `${subject}|${expires}`;
  return `${payload}.${sign(payload)}`;
}

function splitPayload(value: string): { payload: string; signature: string } | null {
  const dotIndex = value.lastIndexOf(".");
  if (dotIndex === -1) return null;
  return { payload: value.slice(0, dotIndex), signature: value.slice(dotIndex + 1) };
}

export function isValidSessionValue(value: string | undefined | null): boolean {
  if (!value) return false;
  const split = splitPayload(value);
  if (!split || !split.payload || !split.signature) return false;

  const expectedSignature = sign(split.payload);
  const signatureBuffer = Buffer.from(split.signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (signatureBuffer.length !== expectedBuffer.length) return false;
  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) return false;

  const pipeIndex = split.payload.lastIndexOf("|");
  if (pipeIndex === -1) return false;
  const expires = Number(split.payload.slice(pipeIndex + 1));
  return Number.isFinite(expires) && Date.now() < expires;
}

/** Who a valid session belongs to: "admin" or "employee:<id>". Null if the session isn't valid. */
export function getSessionSubject(value: string | undefined | null): string | null {
  if (!isValidSessionValue(value)) return null;
  const split = splitPayload(value!);
  const pipeIndex = split!.payload.lastIndexOf("|");
  return split!.payload.slice(0, pipeIndex);
}

export function employeeIdFromSubject(subject: string | null): string | null {
  if (!subject || !subject.startsWith(EMPLOYEE_SUBJECT_PREFIX)) return null;
  return subject.slice(EMPLOYEE_SUBJECT_PREFIX.length);
}

/** True only for the shared owner login — not any employee account. */
export function isAdminSubject(subject: string | null): boolean {
  return subject === ADMIN_SUBJECT;
}

function timingSafeEqualString(input: string, expected: string): boolean {
  const inputBuffer = Buffer.from(input);
  const expectedBuffer = Buffer.from(expected);
  if (inputBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(inputBuffer, expectedBuffer);
}

export type AuthResult = { ok: true; subject: string; displayName: string } | { ok: false };

/**
 * Checks the shared owner login (.env.local) first, then the employee directory.
 *
 * The owner password is stored the same way employee passwords are: a scrypt hash
 * plus a salt, set with `npm run set-password`. It used to sit in .env.local as
 * readable text, which meant anyone who opened that file learned a password the
 * owner might also use elsewhere — the file has to hold unhashable secrets
 * (signing and encryption keys) regardless, but a password doesn't have to be one
 * of them.
 *
 * The old plain-text ADMIN_PASSWORD is still honoured if it's the only thing set,
 * purely so an existing install can't lock itself out before running the script.
 * It warns loudly, and set-password deletes that line when it runs.
 */
export async function authenticate(username: string, password: string): Promise<AuthResult> {
  const expectedUsername = process.env.ADMIN_USERNAME;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  const passwordSalt = process.env.ADMIN_PASSWORD_SALT;
  const legacyPassword = process.env.ADMIN_PASSWORD;

  if (expectedUsername && passwordHash && passwordSalt) {
    // Both checks always run, so a wrong username doesn't fail faster than a
    // wrong password and leak which one was right (timing side-channel).
    const usernameOk = timingSafeEqualString(username, expectedUsername);
    const passwordOk = verifyPassword(password, passwordHash, passwordSalt);
    if (usernameOk && passwordOk) {
      return { ok: true, subject: ADMIN_SUBJECT, displayName: "Admin" };
    }
  } else if (expectedUsername && legacyPassword) {
    console.warn(
      "[auth] ADMIN_PASSWORD is stored as readable text in .env.local. " +
        "Run `npm run set-password` to store it hashed instead.",
    );
    const usernameOk = timingSafeEqualString(username, expectedUsername);
    const passwordOk = timingSafeEqualString(password, legacyPassword);
    if (usernameOk && passwordOk) {
      return { ok: true, subject: ADMIN_SUBJECT, displayName: "Admin" };
    }
  }

  const employee = await findEmployeeByUsername(username);
  if (employee && verifyPassword(password, employee.passwordHash, employee.passwordSalt)) {
    return { ok: true, subject: `${EMPLOYEE_SUBJECT_PREFIX}${employee.id}`, displayName: employee.name };
  }

  return { ok: false };
}
