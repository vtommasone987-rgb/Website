import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, getSessionSubject } from "./session";

/**
 * Reads the session cookie and returns who it belongs to, or null if there isn't
 * a valid one. Kept out of session.ts because `next/headers` only works in the
 * Node.js request scope (Server Components, Route Handlers, Server Actions) —
 * `proxy.ts` runs in the Edge Middleware runtime and imports session.ts directly,
 * so session.ts itself has to stay free of `next/headers`.
 */
export async function getCurrentSubject(): Promise<string | null> {
  const store = await cookies();
  return getSessionSubject(store.get(SESSION_COOKIE_NAME)?.value);
}
