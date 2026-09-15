import type { NextConfig } from "next";
import { SECURITY_HEADERS, allowedServerActionHosts } from "./src/lib/security";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
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
