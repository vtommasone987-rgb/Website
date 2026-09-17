/**
 * Global security configuration — the Next.js equivalent of Express's Helmet.
 *
 * Helmet itself has nothing to attach to here: it's Express middleware, and Next
 * never exposes an Express request pipeline. The protections it bundles are split
 * across two places instead, both of which read their values from this module:
 *
 * - Headers whose value never changes per request are declared once in
 *   `next.config.ts`'s `headers()`, so they apply to every response Next serves,
 *   including static files.
 * - Headers that *do* vary per request — the CSP nonce, and CORS echoing back an
 *   allowed origin — are set in `src/proxy.ts` (Next 16's renamed middleware).
 *
 * This file deliberately imports nothing from `next`, because `next.config.ts`
 * loads it while the framework config is still being resolved.
 */

import { TURNSTILE_ORIGIN } from "./turnstile";

export type HttpHeader = { readonly key: string; readonly value: string };

/** Two years, the minimum for HSTS preload eligibility. */
const HSTS_MAX_AGE_SECONDS = 63_072_000;

/**
 * Static response headers, applied to every route.
 *
 * Note there's no `preload` on HSTS: getting a domain onto the browsers' preload
 * list is easy and getting it *off* takes months, so that's a deliberate opt-in
 * to make once the domain is settled and known to be HTTPS-only forever.
 */
export const SECURITY_HEADERS: readonly HttpHeader[] = [
  // Force HTTPS for repeat visits. Ignored by browsers over plain http://,
  // so this is inert on localhost and only takes effect once deployed.
  { key: "Strict-Transport-Security", value: `max-age=${HSTS_MAX_AGE_SECONDS}; includeSubDomains` },
  // Never let a browser second-guess a Content-Type — an uploaded "image" that
  // is really HTML must not be sniffed and executed as a page.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Clickjacking. Modern browsers use the CSP frame-ancestors directive below;
  // this is the legacy equivalent for anything that doesn't.
  { key: "X-Frame-Options", value: "DENY" },
  // Send the full URL only to ourselves; cross-origin requests get the bare origin.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Nothing here uses these device APIs, so deny them outright.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  // Isolate this origin from any window that opens it, and stop other sites
  // from embedding our images/uploads as subresources.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  // Explicitly OFF, not "1; mode=block": the legacy XSS auditor is itself
  // exploitable, and the CSP below is the real defense. Same call Helmet makes.
  { key: "X-XSS-Protection", value: "0" },
];

/** A fresh, unguessable nonce per request — reusing one defeats the point. */
export function createNonce(): string {
  return btoa(crypto.randomUUID());
}

/**
 * Content-Security-Policy. Next.js finds the `'nonce-…'` in this header and
 * stamps the same nonce onto the framework scripts and inline styles it emits,
 * so no `'unsafe-inline'` is needed for scripts in production.
 *
 * The development relaxations are the ones React and Turbopack genuinely need:
 * `'unsafe-eval'` for React's enhanced error stacks, unnonced inline styles for
 * the hot-reloading CSS injector, and `ws:` for the HMR socket. None ship to production.
 */
export function buildContentSecurityPolicy(
  nonce: string,
  isDevelopment: boolean,
  /** Widen the policy for the Turnstile widget only when it's actually configured. */
  turnstile: boolean = false,
): string {
  const directives: readonly string[] = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDevelopment ? " 'unsafe-eval'" : ""}`,
    // A nonce and 'unsafe-inline' are mutually exclusive: browsers ignore
    // 'unsafe-inline' the moment a nonce appears in the same directive. Turbopack's
    // dev-time CSS injector writes inline styles it can't nonce, so development
    // drops the nonce rather than adding a keyword the browser would ignore.
    isDevelopment ? "style-src 'self' 'unsafe-inline'" : `style-src 'self' 'nonce-${nonce}'`,
    /**
     * Style *attributes* only — the one deliberate `unsafe-` keyword in the
     * production policy, and the narrowest form available.
     *
     * Verified against a real production build: removing this makes the browser
     * block next/image's `style="color:transparent"` and log a violation on every
     * page carrying an image. next/image is used for the logo, the shop grid, and
     * the asset galleries, so the alternative is giving up image optimization on a
     * storefront built around photos.
     *
     * Why not a hash instead, which would be tighter? The browser suggests one
     * ('sha256-Wwucq8eX2r0YFymkQhDXm5hN0+FfSvI3s4JSSaqa4iw=' for `color:transparent`),
     * but next/image emits a *different* style attribute for `fill` images than for
     * fixed width/height ones. A hash allow-list would pass today, while no asset has
     * a photo, and then silently break customer-facing images the first time one is
     * uploaded. A stable policy beats a tighter one that fails quietly.
     *
     * What this does not permit, which is the part that matters: inline <style>
     * elements and injected stylesheets are still blocked by `style-src` above, and a
     * style attribute cannot execute JavaScript in any browser this app supports.
     */
    ...(isDevelopment ? [] : ["style-src-attr 'unsafe-inline'"]),
    // blob:/data: cover next/image's own output, not remote hosts.
    "img-src 'self' blob: data:",
    "font-src 'self'",
    `connect-src 'self'${isDevelopment ? " ws: wss:" : ""}${turnstile ? ` ${TURNSTILE_ORIGIN}` : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    // Server actions POST back to our own origin; nothing should post elsewhere.
    "form-action 'self'",
    "frame-ancestors 'none'",
    /**
     * The Turnstile challenge renders in an iframe, so its origin has to be
     * allowed here — but only while Turnstile is actually configured. With no
     * keys set this stays `frame-src 'none'`, so the policy never carries a
     * third-party origin the site isn't using.
     *
     * Note there is no matching entry in `script-src`: that directive uses
     * 'strict-dynamic', which makes browsers ignore host allow-lists entirely.
     * The widget's loader is permitted by the nonce on its <Script> tag (see
     * TurnstileWidget.tsx), and strict-dynamic then covers what that loader pulls in.
     */
    turnstile ? `frame-src ${TURNSTILE_ORIGIN}` : "frame-src 'none'",
    ...(isDevelopment ? [] : ["upgrade-insecure-requests"]),
  ];

  return directives.join("; ");
}

/**
 * Origins allowed to make cross-origin requests, from the `ALLOWED_ORIGINS`
 * environment variable (comma-separated, e.g. "https://ohprotech.com,https://www.ohprotech.com").
 *
 * Unset means an empty list, which is the safe default: same-origin only. There
 * is no wildcard support on purpose — `Access-Control-Allow-Origin: *` would
 * hand any site on the internet read access to responses from this one.
 */
export function allowedOrigins(): readonly string[] {
  const configured = process.env.ALLOWED_ORIGINS ?? "";
  return configured
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, "").toLowerCase())
    .filter((origin) => origin.length > 0);
}

/**
 * The same list as bare hostnames, for `serverActions.allowedOrigins` in
 * `next.config.ts` — that setting compares against the Host header, so it wants
 * "ohprotech.com", not "https://ohprotech.com".
 */
export function allowedServerActionHosts(): string[] {
  const hosts = allowedOrigins().map((origin) => {
    try {
      return new URL(origin).host;
    } catch {
      // Already a bare host, or unparseable — pass it through and let Next compare it verbatim.
      return origin;
    }
  });

  return [...new Set(hosts)];
}

export type CorsDecision =
  | { readonly allowed: true; readonly headers: readonly HttpHeader[] }
  | { readonly allowed: false };

const CORS_MAX_AGE_SECONDS = 600;

/**
 * Decides CORS for a cross-origin request.
 *
 * A request with no `Origin` header is same-origin (or a plain navigation) and
 * needs no CORS headers at all. An `Origin` that isn't on the allow-list is
 * refused outright rather than answered without the headers — the browser would
 * block the response either way, but refusing means we never run the handler.
 *
 * `Access-Control-Allow-Credentials` is deliberately absent: the session cookie
 * is SameSite=Strict, so it is never sent cross-site, and advertising credential
 * support we don't honor would only invite confusion.
 */
export function corsFor(requestOrigin: string | null): CorsDecision {
  if (!requestOrigin) {
    return { allowed: true, headers: [] };
  }

  const origin = requestOrigin.trim().replace(/\/+$/, "").toLowerCase();
  if (!allowedOrigins().includes(origin)) {
    return { allowed: false };
  }

  return {
    allowed: true,
    headers: [
      { key: "Access-Control-Allow-Origin", value: requestOrigin },
      // Without this, a shared cache could hand one origin's response to another.
      { key: "Vary", value: "Origin" },
      { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
      { key: "Access-Control-Allow-Headers", value: "Content-Type" },
      { key: "Access-Control-Max-Age", value: String(CORS_MAX_AGE_SECONDS) },
    ],
  };
}
