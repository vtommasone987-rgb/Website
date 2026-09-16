import { createCipheriv, createDecipheriv, createHash, randomBytes, scryptSync } from "crypto";
import { TOTP, Secret } from "otpauth";

/**
 * Two-factor authentication: time-based codes from an authenticator app, plus
 * single-use backup codes and remembered devices.
 *
 * Nothing cryptographic is invented here. The codes themselves are RFC 6238 TOTP
 * handled by `otpauth` (whose only dependency is the audited @noble/hashes), and
 * everything else uses Node's built-in `crypto`: AES-256-GCM to encrypt the shared
 * secret at rest, scrypt to hash backup codes, SHA-256 to fingerprint device tokens.
 */

/** Shown in the authenticator app next to the account name. */
const ISSUER = "OPTS";

/** How many 30-second steps either side of now are accepted. */
const TOTP_WINDOW = 1;

const BACKUP_CODE_COUNT = 10;

/** Trusted devices expire after 30 days, the interval chosen for this deployment. */
export const TRUSTED_DEVICE_DAYS = 30;

export const TRUSTED_DEVICE_COOKIE = "opts_td";

/**
 * Key for encrypting TOTP secrets at rest.
 *
 * Deliberately its own variable rather than reusing ADMIN_SESSION_SECRET: one key
 * per purpose means rotating the session signing key doesn't silently make every
 * enrolled authenticator undecryptable, and a leak of one doesn't hand over the other.
 */
function encryptionKey(): Buffer {
  const configured = process.env.MFA_ENCRYPTION_KEY;
  if (!configured) {
    throw new Error("MFA_ENCRYPTION_KEY is not set. Add it to .env.local — see .env.example.");
  }
  // scrypt stretches whatever string is configured into exactly 32 bytes, so the
  // value in .env.local doesn't have to be a precisely-sized binary key.
  return scryptSync(configured, "opts-mfa-key-v1", 32);
}

/** AES-256-GCM. The GCM tag is what makes this tamper-evident, not just unreadable. */
export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("hex"), tag.toString("hex"), encrypted.toString("hex")].join(":");
}

export function decryptSecret(stored: string): string {
  const [ivHex, tagHex, dataHex] = stored.split(":");
  if (!ivHex || !tagHex || !dataHex) {
    throw new Error("Stored MFA secret is malformed.");
  }
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return Buffer.concat([
    decipher.update(Buffer.from(dataHex, "hex")),
    decipher.final(),
  ]).toString("utf8");
}

/** A fresh base32 TOTP secret, the value an authenticator app stores. */
export function generateTotpSecret(): string {
  return new Secret({ size: 20 }).base32;
}

function totpFor(secretBase32: string, accountLabel: string): TOTP {
  return new TOTP({
    issuer: ISSUER,
    label: accountLabel,
    algorithm: "SHA1", // What every mainstream authenticator app implements.
    digits: 6,
    period: 30,
    secret: Secret.fromBase32(secretBase32),
  });
}

/**
 * The otpauth:// URI an authenticator app reads from the QR code. It embeds the
 * secret, so it is only ever rendered during enrollment, never stored or logged.
 */
export function totpEnrollmentUri(secretBase32: string, accountLabel: string): string {
  return totpFor(secretBase32, accountLabel).toString();
}

/**
 * Checks a 6-digit code. `validate` returns the clock-step delta when the code
 * matches and null when it doesn't, so a window of ±1 tolerates a phone whose
 * clock is slightly off without widening the guessing surface much.
 */
export function verifyTotp(secretBase32: string, code: string, accountLabel: string): boolean {
  const cleaned = code.replace(/\D/g, "");
  if (cleaned.length !== 6) return false;
  const delta = totpFor(secretBase32, accountLabel).validate({ token: cleaned, window: TOTP_WINDOW });
  return delta !== null;
}

/**
 * Recovery codes, formatted in two groups so they're readable when written down.
 * Returned in plaintext exactly once — the caller shows them and stores only hashes.
 */
export function generateBackupCodes(): string[] {
  // Crockford-ish alphabet: no O/0/I/1, which are the pairs people mis-transcribe.
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const codes: string[] = [];
  for (let i = 0; i < BACKUP_CODE_COUNT; i++) {
    const bytes = randomBytes(8);
    const chars = Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
    codes.push(`${chars.slice(0, 4)}-${chars.slice(4, 8)}`);
  }
  return codes;
}

export function normalizeBackupCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function hashBackupCode(code: string): { hash: string; salt: string } {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(normalizeBackupCode(code), salt, 64).toString("hex");
  return { hash, salt };
}

export function backupCodeMatches(code: string, hash: string, salt: string): boolean {
  const candidate = scryptSync(normalizeBackupCode(code), salt, 64).toString("hex");
  // Lengths are fixed by scrypt here, so a constant-time compare of equal-length
  // hex strings is what we want; Buffer comparison keeps it timing-safe.
  const a = Buffer.from(candidate, "hex");
  const b = Buffer.from(hash, "hex");
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i]! ^ b[i]!;
  return diff === 0;
}

/** The random value handed to the browser as the "remember this device" cookie. */
export function generateTrustedDeviceToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Only this fingerprint is stored. The token is high-entropy random rather than a
 * password, so a fast hash is appropriate — scrypt here would buy nothing and cost
 * a lookup on every admin request.
 */
export function hashTrustedDeviceToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Coarse device label for the revoke list — never the full user-agent string. */
export function describeDevice(userAgent: string | null): string {
  if (!userAgent) return "Unknown device";
  const browser = /Edg\//.test(userAgent)
    ? "Edge"
    : /Chrome\//.test(userAgent)
      ? "Chrome"
      : /Safari\//.test(userAgent)
        ? "Safari"
        : /Firefox\//.test(userAgent)
          ? "Firefox"
          : "Browser";
  const os = /Windows/.test(userAgent)
    ? "Windows"
    : /Mac OS X|Macintosh/.test(userAgent)
      ? "macOS"
      : /Android/.test(userAgent)
        ? "Android"
        : /iPhone|iPad/.test(userAgent)
          ? "iOS"
          : "device";
  return `${browser} on ${os}`;
}
