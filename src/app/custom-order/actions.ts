"use server";

import { redirect } from "next/navigation";
import { createCustomOrder } from "@/lib/store";
import type { CustomOrderCategory } from "@/lib/types";
import { isRateLimited } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";
import { isTurnstileConfigured, verifyTurnstileToken } from "@/lib/turnstile";
import { logSecurityEvent } from "@/lib/security-log";
import {
  boundedQuantity,
  FIELD_LIMITS,
  isValidEmail,
  multiLine,
  oneOf,
  singleLine,
  submittedTooFast,
} from "@/lib/validate";

const VALID_CATEGORIES: readonly CustomOrderCategory[] = ["pc-build", "laptop", "tablet", "other"];
const SUBMIT_LIMIT = 5;
const SUBMIT_WINDOW_MS = 10 * 60 * 1000;

// Public — anyone can request a custom build, no admin session needed.
export async function createCustomOrderAction(formData: FormData) {
  // Honeypot, then timing check, then rate limit — the same three layers as the
  // ticket form; see src/app/contact/actions.ts for why each one is there.
  if (String(formData.get("company") ?? "").trim()) {
    redirect("/?submitted=1#custom-build");
  }

  if (submittedTooFast(formData.get("started"))) {
    redirect("/?submitted=1#custom-build");
  }

  const ip = await getClientIp();
  if (isRateLimited(`custom-order:${ip}`, SUBMIT_LIMIT, SUBMIT_WINDOW_MS)) {
    await logSecurityEvent({ type: "form.rate_limited", ip, detail: "custom build form" });
    redirect("/?error=rate-limited#custom-build");
  }

  // Told to the visitor rather than faked as success — see the ticket form for why.
  if (isTurnstileConfigured()) {
    const token = String(formData.get("cf-turnstile-response") ?? "");
    if (!(await verifyTurnstileToken(token, ip))) {
      await logSecurityEvent({ type: "form.captcha_failed", ip, detail: "custom build form" });
      redirect("/?error=captcha#custom-build");
    }
  }

  const name = singleLine(formData.get("name"), FIELD_LIMITS.name);
  const email = singleLine(formData.get("email"), FIELD_LIMITS.email);
  const model = singleLine(formData.get("model"), FIELD_LIMITS.model);
  const budget = singleLine(formData.get("budget"), FIELD_LIMITS.budget);
  const details = multiLine(formData.get("details"), FIELD_LIMITS.freeText);

  if (!name || !details || !isValidEmail(email)) {
    redirect("/?error=invalid#custom-build");
  }

  // Awaited for the same reason as the ticket form: redirect() throws, and an
  // unawaited write races the response. Only the write is inside the try —
  // redirect() throws to signal itself, so catching it would read as failure.
  let saved = false;
  try {
    await createCustomOrder({
      name,
      email,
      category: oneOf(formData.get("category"), VALID_CATEGORIES, "other"),
      model: model || null,
      quantity: boundedQuantity(formData.get("quantity")),
      details,
      budget: budget || null,
    });
    saved = true;
  } catch (error) {
    console.error(
      "[custom-order] submission failed:",
      error instanceof Error ? error.message : String(error),
    );
  }

  if (!saved) {
    redirect("/?error=unavailable#custom-build");
  }

  redirect("/?submitted=1#custom-build");
}
