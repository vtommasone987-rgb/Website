"use server";

import { redirect } from "next/navigation";
import { createTicket } from "@/lib/store";
import type { TicketCategory } from "@/lib/types";
import { isRateLimited } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";
import { isTurnstileConfigured, verifyTurnstileToken } from "@/lib/turnstile";
import {
  FIELD_LIMITS,
  isValidEmail,
  multiLine,
  oneOf,
  singleLine,
  submittedTooFast,
} from "@/lib/validate";

const VALID_CATEGORIES: readonly TicketCategory[] = ["warranty", "repair", "feedback", "other"];
const SUBMIT_LIMIT = 5;
const SUBMIT_WINDOW_MS = 10 * 60 * 1000;

// Public — anyone can submit a ticket, no admin session needed. Contrast with
// src/app/admin/actions.ts, which is admin-only and checks assertAdmin().
export async function createTicketAction(formData: FormData) {
  // Layer 1 — honeypot: a field real users never see or fill in (hidden via CSS
  // on the form). If it's non-empty, a bot filled it — pretend success without
  // creating anything, so the bot has no signal that it was caught.
  if (String(formData.get("company") ?? "").trim()) {
    redirect("/contact?submitted=1");
  }

  // Layer 2 — timing: same silent fake-success, for bots that know to skip
  // hidden fields but still post faster than a person could type.
  if (submittedTooFast(formData.get("started"))) {
    redirect("/contact?submitted=1");
  }

  // Layer 3 — per-IP rate limit.
  const ip = await getClientIp();
  if (isRateLimited(`ticket:${ip}`, SUBMIT_LIMIT, SUBMIT_WINDOW_MS)) {
    redirect("/contact?error=rate-limited");
  }

  // Layer 4 — Turnstile, when configured. Unlike the honeypot and timing checks
  // above, a failure here is told to the visitor rather than faked as success:
  // this one has a real false-positive rate (a slow network, an expired token),
  // and silently discarding a genuine customer's message would be worse than a
  // bot learning it was blocked.
  if (isTurnstileConfigured()) {
    const token = String(formData.get("cf-turnstile-response") ?? "");
    if (!(await verifyTurnstileToken(token, ip))) {
      redirect("/contact?error=captcha");
    }
  }

  const name = singleLine(formData.get("name"), FIELD_LIMITS.name);
  const email = singleLine(formData.get("email"), FIELD_LIMITS.email);
  const description = multiLine(formData.get("description"), FIELD_LIMITS.freeText);

  // Invalid input now says so instead of silently discarding the submission and
  // claiming success — but the message stays generic (see /contact's banner):
  // which field failed and why is the submitter's business, not a probe's.
  if (!name || !description || !isValidEmail(email)) {
    redirect("/contact?error=invalid");
  }

  // Must be awaited: redirect() throws to unwind the request, so a floating
  // promise here would race the response and could lose the ticket entirely —
  // and any database error would vanish instead of surfacing.
  //
  // Only the write is inside the try. redirect() signals itself by throwing, so
  // wrapping it too would catch our own redirect and treat success as a failure.
  let saved = false;
  try {
    await createTicket({
      name,
      email,
      category: oneOf(formData.get("category"), VALID_CATEGORIES, "other"),
      description,
    });
    saved = true;
  } catch (error) {
    // Logged for us, not shown to them: the reason a write failed (connection
    // strings, driver internals) is exactly what shouldn't reach a visitor.
    console.error(
      "[ticket] submission failed:",
      error instanceof Error ? error.message : String(error),
    );
  }

  if (!saved) {
    redirect("/contact?error=unavailable");
  }

  redirect("/contact?submitted=1");
}
