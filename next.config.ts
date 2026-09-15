import type { NextConfig } from "next";
import { SECURITY_HEADERS, allowedServerActionHosts } from "./src/lib/security";

const nextConfig: NextConfig = {
  /**
   * Drop the `X-Powered-By: Next.js` header. Knowing the framework tells an
   * attacker which CVE list to work through and which payloads to try first;
   * there is no reason to volunteer it.
   */
  poweredByHeader: false,
  images: {
    /**
     * No remote image hosts. Every image is either uploaded to our own storage
     * or shipped in /public, so leaving a remote pattern configured would only
     * mean the optimizer can be pointed at third-party URLs.
     */
    remotePatterns: [],
    // The optimizer will not rasterize SVG; an SVG can carry script.
    dangerouslyAllowSVG: false,
  },
  /**
   * The static half of the security headers (the Helmet equivalent) — declared
   * here so they cover every response Next serves, including the static assets
   * and prefetches that `src/proxy.ts` deliberately skips. The per-request half
   * (CSP nonce, CORS) is set in the proxy. Both read from src/lib/security.ts.
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [...SECURITY_HEADERS],
      },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "15mb",
      /**
       * Server actions are POSTs back to this same origin, and Next already
       * rejects any whose Origin doesn't match the Host. This adds the extra
       * hosts allowed to do that — needed only if a proxy/CDN domain fronts the
       * app. Empty by default, which means same-host only.
       */
      allowedOrigins: allowedServerActionHosts(),
    },
  },
};

export default nextConfig;
