import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, isValidSessionValue } from "@/lib/session";
import {
  SECURITY_HEADERS,
  buildContentSecurityPolicy,
  corsFor,
  createNonce,
} from "@/lib/security";

/**
 * Runs on every request (see `config.matcher` at the bottom). Three jobs:
 *
 * 1. Per-request security headers — a fresh CSP nonce, plus the static header set
 *    from `src/lib/security.ts`. Those static ones are also declared in
 *    `next.config.ts` so they cover responses this proxy skips (static assets,
 *    prefetches); setting them here too is cheap and keeps redirects covered.
 * 2. Strict CORS for `/api/*`, driven by the ALLOWED_ORIGINS env var.
 * 3. The admin session gate. See src/lib/session.ts for why it's stateless.
 */

export const NONCE_HEADER = "x-nonce";

function withSecurityHeaders(response: NextResponse, csp: string): NextResponse {
  for (const { key, value } of SECURITY_HEADERS) {
    response.headers.set(key, value);
  }
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

function isApiPath(pathname: string): boolean {
  return pathname === "/api" || pathname.startsWith("/api/");
}

function requiresSession(pathname: string): boolean {
  return pathname.startsWith("/admin") && pathname !== "/admin/login";
}

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const nonce = createNonce();
  const csp = buildContentSecurityPolicy(nonce, process.env.NODE_ENV === "development");

  if (isApiPath(pathname)) {
    const cors = corsFor(request.headers.get("origin"));
    if (!cors.allowed) {
      return withSecurityHeaders(new NextResponse(null, { status: 403 }), csp);
    }

    // Answer the preflight here rather than letting it reach a route handler,
    // which would have to implement OPTIONS itself to respond correctly.
    const response =
      request.method === "OPTIONS" ? new NextResponse(null, { status: 204 }) : NextResponse.next();
    for (const { key, value } of cors.headers) {
      response.headers.set(key, value);
    }
    return withSecurityHeaders(response, csp);
  }

  if (requiresSession(pathname)) {
    const session = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!isValidSessionValue(session)) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return withSecurityHeaders(NextResponse.redirect(loginUrl), csp);
    }
  }

  // Next reads the CSP off the *request* headers to decide which nonce to stamp
  // onto its own script and style tags, so it has to be forwarded, not just returned.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(NONCE_HEADER, nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  return withSecurityHeaders(NextResponse.next({ request: { headers: requestHeaders } }), csp);
}

export const config = {
  matcher: [
    /*
     * Admin routes match unconditionally — no `missing` clause. The prefetch
     * exclusion below is a performance optimization for public pages, but
     * applying it here would let anyone fetch an admin page's RSC payload
     * unauthenticated just by sending a `purpose: prefetch` header.
     */
    "/admin/:path*",
    /*
     * Everything else except Next's own static output, which needs no CSP.
     * Link prefetches are skipped: they return RSC payloads, not HTML documents
     * with scripts to authorize.
     */
    {
      source: "/((?!admin|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
