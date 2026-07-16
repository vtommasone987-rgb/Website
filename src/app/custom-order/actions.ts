"use server";

import { redirect } from "next/navigation";
import { createCustomOrder } from "@/lib/store";
import type { CustomOrderCategory } from "@/lib/types";
import { isRateLimited } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";

const VALID_CATEGORIES: CustomOrderCategory[] = ["pc-build", "laptop", "tablet", "other"];
const SUBMIT_LIMIT = 5;
const SUBMIT_WINDOW_MS = 10 * 60 * 1000;

function categoryFromFormData(formData: FormData): CustomOrderCategory {
  const raw = String(formData.get("category") ?? "");
  return (VALID_CATEGORIES as string[]).includes(raw) ? (raw as CustomOrderCategory) : "other";
}

function quantityFromFormData(formData: FormData): number {
  const parsed = Number(formData.get("quantity"));
  return Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : 1;
}

// Public — anyone can request a custom build, no admin session needed.
export async function createCustomOrderAction(formData: FormData) {
  // Honeypot — see the matching hidden field in page.tsx for why.
  if (String(formData.get("company") ?? "").trim()) {
    redirect("/custom-order?submitted=1");
  }

  const ip = await getClientIp();
  if (isRateLimited(`custom-order:${ip}`, SUBMIT_LIMIT, SUBMIT_WINDOW_MS)) {
    redirect("/custom-order?error=rate-limited");
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const details = String(formData.get("details") ?? "").trim();
  const budget = String(formData.get("budget") ?? "").trim();

  if (name && email && details) {
    createCustomOrder({
      name,
      email,
      category: categoryFromFormData(formData),
      model: model || null,
      quantity: quantityFromFormData(formData),
      details,
      budget: budget || null,
    });
  }

  redirect("/custom-order?submitted=1");
}
