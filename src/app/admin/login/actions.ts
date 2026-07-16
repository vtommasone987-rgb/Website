"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSessionValue, verifyCredentials, SESSION_COOKIE_NAME } from "@/lib/session";
import { isRateLimited } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";

const LOGIN_ATTEMPT_LIMIT = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export async function loginAction(formData: FormData) {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const from = String(formData.get("from") ?? "/admin");
  const safeFrom = from.startsWith("/admin") ? from : "/admin";

  // Rate-limit every attempt (not just failures) so brute-forcing can't just
  // keep guessing at full speed even if it occasionally finds valid-looking input.
  const ip = await getClientIp();
  if (isRateLimited(`login:${ip}`, LOGIN_ATTEMPT_LIMIT, LOGIN_WINDOW_MS)) {
    redirect(`/admin/login?error=rate-limited&from=${encodeURIComponent(safeFrom)}`);
  }

  if (!verifyCredentials(username, password)) {
    redirect(`/admin/login?error=1&from=${encodeURIComponent(safeFrom)}`);
  }

  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, createSessionValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect(safeFrom);
}

export async function logoutAction() {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
  redirect("/admin/login");
}
