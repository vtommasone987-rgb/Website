"use server";

import { redirect } from "next/navigation";
import { createTicket } from "@/lib/store";
import type { TicketCategory } from "@/lib/types";
import { isRateLimited } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";

const VALID_CATEGORIES: TicketCategory[] = ["warranty", "repair", "feedback", "other"];
const SUBMIT_LIMIT = 5;
const SUBMIT_WINDOW_MS = 10 * 60 * 1000;

function categoryFromFormData(formData: FormData): TicketCategory {
  const raw = String(formData.get("category") ?? "");
  return (VALID_CATEGORIES as string[]).includes(raw) ? (raw as TicketCategory) : "other";
}

// Public — anyone can submit a ticket, no admin session needed. Contrast with
// src/app/admin/actions.ts, which is admin-only and checks assertAdmin().
export async function createTicketAction(formData: FormData) {
  // Honeypot: a field real users never see or fill in (hidden via CSS on the
  // form). If it's non-empty, a bot filled it — pretend success without
  // creating anything, so the bot has no signal that it was caught.
  if (String(formData.get("company") ?? "").trim()) {
    redirect("/contact?submitted=1");
  }

  const ip = await getClientIp();
  if (isRateLimited(`ticket:${ip}`, SUBMIT_LIMIT, SUBMIT_WINDOW_MS)) {
    redirect("/contact?error=rate-limited");
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (name && email && description) {
    createTicket({ name, email, category: categoryFromFormData(formData), description });
  }

  redirect("/contact?submitted=1");
}
