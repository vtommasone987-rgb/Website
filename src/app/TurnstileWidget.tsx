import Script from "next/script";
import { headers } from "next/headers";
import { isTurnstileConfigured, turnstileSiteKey } from "@/lib/turnstile";
import { NONCE_HEADER } from "@/proxy";

/**
 * The Turnstile checkbox, rendered into both public forms.
 *
 * Renders nothing at all when the keys aren't configured, so the forms behave
 * exactly as they do today until Turnstile is switched on.
 *
 * The widget script needs the request's CSP nonce. The policy uses
 * 'strict-dynamic', which makes browsers ignore host allow-lists in script-src —
 * a nonce on this tag is what actually permits it, and strict-dynamic then covers
 * the further scripts Cloudflare's loader pulls in. `frame-src` in security.ts
 * separately allows the challenge iframe.
 *
 * Server Component: it reads the nonce header, and the widget itself needs no
 * React state — Cloudflare's script writes the token into a hidden input that the
 * form posts like any other field.
 */
export async function TurnstileWidget() {
  if (!isTurnstileConfigured()) return null;

  const nonce = (await headers()).get(NONCE_HEADER) ?? undefined;

  return (
    <div className="flex flex-col gap-2">
      <div
        className="cf-turnstile"
        data-sitekey={turnstileSiteKey()!}
        data-theme="auto"
        // Names the hidden input Cloudflare creates, which is what the action reads.
        data-response-field-name="cf-turnstile-response"
      />
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        nonce={nonce}
      />
      <noscript>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          This form needs JavaScript enabled to verify you&apos;re not a bot. You can also reach us
          at (440) 290-9160.
        </p>
      </noscript>
    </div>
  );
}
