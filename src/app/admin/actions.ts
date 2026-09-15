"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { detectImageType, MAX_IMAGE_BYTES, MAX_IMAGES_PER_ASSET } from "@/lib/uploads";
import { multiLine, singleLine } from "@/lib/validate";
import {
  addAssetToCustomOrder,
  addAssetToTicket,
  createAsset,
  createEmployee,
  createGroup,
  createPurchase,
  createPurchaseGroup,
  deleteAsset,
  deleteEmployee,
  deletePurchase,
  markSold,
  permanentlyDeleteAsset,
  permanentlyDeletePurchase,
  removeAssetFromCustomOrder,
  removeAssetFromTicket,
  restoreAsset,
  restorePurchase,
  setCustomOrderAssignee,
  setCustomOrderCompleted,
  setTicketAssignee,
  setTicketCompleted,
  updateAsset,
  updateEmployee,
  updatePurchase,
} from "@/lib/store";
import { SESSION_COOKIE_NAME, isAdminSubject, isValidSessionValue, getSessionSubject } from "@/lib/session";
import type { StorageType } from "@/lib/types";

// Upper bounds for the parts/storage-device loops below — the form starts with
// one row and lets the user add more (PartsFields.tsx/StorageFields.tsx), so
// these just need to be generous enough to never realistically get hit, while
// still bounding how many fields a crafted request could make the server parse.
const MAX_PARTS = 30;
const MAX_STORAGE_DEVICES = 20;
const VALID_STORAGE_TYPES: StorageType[] = ["hdd", "sata-ssd", "nvme-ssd", "emmc", "other"];

// proxy.ts already gates /admin, but Next.js's own docs warn that a future
// matcher/route change could silently stop covering a server action, since
// actions are just POSTs to whatever route rendered them. Check here too.
async function assertAdmin() {
  const store = await cookies();
  if (!isValidSessionValue(store.get(SESSION_COOKIE_NAME)?.value)) {
    redirect("/admin/login");
  }
}

// Stricter than assertAdmin(): that just checks "is anyone logged in" (owner or
// employee); this additionally requires the shared owner login specifically, for
// actions employees shouldn't be able to take (e.g. removing another employee).
async function assertOwner() {
  await assertAdmin();
  const store = await cookies();
  const subject = getSessionSubject(store.get(SESSION_COOKIE_NAME)?.value);
  if (!isAdminSubject(subject)) {
    redirect("/admin/employees?error=" + encodeURIComponent("Only the shop owner can do that."));
  }
}

/**
 * Field limits for the admin forms.
 *
 * These are authenticated actions, so the threat model differs from the public
 * forms: not spam, but malformed or oversized values reaching the database. A
 * server action is a plain POST endpoint whoever is signed in can call directly,
 * and a stray paste or a request built outside the UI shouldn't be able to store
 * a megabyte of text, a negative price, or NaN.
 */
const ADMIN_LIMITS = {
  shortText: 200,
  freeText: 5_000,
  /** $1,000,000. Anything above this is a typo, not a price. */
  maxPriceCents: 100_000_000,
  maxQuantity: 10_000,
  maxCapacityGb: 1_000_000,
  /** scrypt is deliberately slow, so an unbounded password is a CPU-exhaustion vector. */
  maxPasswordLength: 200,
} as const;

/** Single-line admin field: control characters and line breaks stripped, length capped. */
function adminText(formData: FormData, key: string, maxLength: number = ADMIN_LIMITS.shortText): string {
  return singleLine(formData.get(key), maxLength);
}

/** Same, but empty becomes null for the optional columns. */
function optionalString(formData: FormData, key: string): string | null {
  return adminText(formData, key) || null;
}

/** Multi-line admin field (descriptions, notes): newlines kept, length capped. */
function adminLongText(formData: FormData, key: string): string {
  return multiLine(formData.get(key), ADMIN_LIMITS.freeText);
}

function optionalLongText(formData: FormData, key: string): string | null {
  return adminLongText(formData, key) || null;
}

function centsFromDollarsInput(value: FormDataEntryValue | null): number {
  const dollars = Number(value ?? 0);
  // Non-numeric input previously produced NaN and carried it into the database.
  if (!Number.isFinite(dollars) || dollars < 0) return 0;
  return Math.min(Math.round(dollars * 100), ADMIN_LIMITS.maxPriceCents);
}

function groupFromFormData(formData: FormData): string | null {
  return optionalString(formData, "group");
}

function locationFromFormData(formData: FormData): string | null {
  return optionalString(formData, "location");
}

function positiveIntFromFormData(formData: FormData, key: string): number {
  const parsed = Number(formData.get(key));
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.min(Math.floor(parsed), ADMIN_LIMITS.maxQuantity);
}

/** A plain calendar date (YYYY-MM-DD), as produced by <input type="date">. */
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Purchase dates are stored as bare "YYYY-MM-DD" strings (see CLAUDE.md for why
 * they never become timestamps). Anything not in that shape would be rendered
 * back verbatim, so fall back to today rather than storing junk.
 */
function dateOnlyFromFormData(formData: FormData, key: string): string {
  const value = singleLine(formData.get(key), 10);
  if (DATE_ONLY_PATTERN.test(value) && !Number.isNaN(Date.parse(value))) return value;
  return new Date().toISOString().slice(0, 10);
}

/**
 * A password is exactly the bytes the person chose, so this neither trims nor
 * strips it — "cleaning" a password silently changes it. Over-length is rejected
 * by the caller rather than truncated here, since truncating would store one
 * value and then fail to match the full one at login.
 */
function rawPassword(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function partsFromFormData(formData: FormData) {
  const parts: { name: string; serialNumber: string }[] = [];
  for (let i = 0; i < MAX_PARTS; i++) {
    const name = adminText(formData, `part-name-${i}`);
    const serialNumber = adminText(formData, `part-serial-${i}`);
    if (name || serialNumber) {
      parts.push({ name, serialNumber });
    }
  }
  return parts;
}

function storageDevicesFromFormData(formData: FormData) {
  const devices: { type: StorageType; capacityGb: number; serialNumber: string }[] = [];
  for (let i = 0; i < MAX_STORAGE_DEVICES; i++) {
    const rawType = adminText(formData, `storage-type-${i}`);
    const rawCapacity = Number(formData.get(`storage-capacity-${i}`) ?? 0);
    const serialNumber = adminText(formData, `storage-serial-${i}`);
    if (!rawType && !rawCapacity && !serialNumber) continue;
    const type = (VALID_STORAGE_TYPES as string[]).includes(rawType) ? (rawType as StorageType) : "other";
    const capacityGb =
      Number.isFinite(rawCapacity) && rawCapacity > 0
        ? Math.min(Math.floor(rawCapacity), ADMIN_LIMITS.maxCapacityGb)
        : 0;
    devices.push({ type, capacityGb, serialNumber });
  }
  return devices;
}

// Saves uploaded photos straight to /public/uploads. This is the "local disk in
// dev" storage decision from CLAUDE.md — swap this function for an upload to
// Cloudflare R2/Vercel Blob later without touching any caller.
async function savePhotos(formData: FormData): Promise<string[]> {
  const files = formData
    .getAll("photos")
    .filter((f): f is File => f instanceof File && f.size > 0)
    .slice(0, MAX_IMAGES_PER_ASSET);
  if (files.length === 0) return [];

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const urls: string[] = [];
  for (const file of files) {
    if (file.size > MAX_IMAGE_BYTES) {
      console.warn(`Upload rejected: ${file.size} bytes exceeds the ${MAX_IMAGE_BYTES} byte limit.`);
      continue;
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    /**
     * The extension comes from the file's own leading bytes, never from
     * file.type or file.name. A browser can label anything "image/png", and the
     * old code fed that straight into the stored filename — so a .html or
     * .svg+xml file could end up written into /public/uploads and served back
     * from this origin, where it would run as a page rather than render as a photo.
     */
    const extension = detectImageType(buffer);
    if (!extension) {
      console.warn("Upload rejected: file contents are not a JPEG, PNG, GIF, or WebP image.");
      continue;
    }

    const filename = `${randomUUID()}.${extension}`;
    await writeFile(path.join(uploadDir, filename), buffer);
    urls.push(`/uploads/${filename}`);
  }
  return urls;
}

export async function createAssetAction(formData: FormData) {
  await assertAdmin();
  const imageUrls = await savePhotos(formData);
  await createAsset({
    name: adminText(formData, "name"),
    model: adminText(formData, "model"),
    serialNumber: adminText(formData, "serialNumber"),
    priceCents: centsFromDollarsInput(formData.get("price")),
    description: adminLongText(formData, "description"),
    parts: partsFromFormData(formData),
    storageDevices: storageDevicesFromFormData(formData),
    imageUrls,
    group: groupFromFormData(formData),
    location: locationFromFormData(formData),
    assignedTo: optionalString(formData, "assignedTo"),
  });
  revalidatePath("/admin");
  revalidatePath("/shop");
  redirect("/admin");
}

export async function updateAssetAction(id: string, formData: FormData) {
  await assertAdmin();
  const imageUrls = await savePhotos(formData);
  await updateAsset(id, {
    name: adminText(formData, "name"),
    model: adminText(formData, "model"),
    serialNumber: adminText(formData, "serialNumber"),
    priceCents: centsFromDollarsInput(formData.get("price")),
    description: adminLongText(formData, "description"),
    parts: partsFromFormData(formData),
    storageDevices: storageDevicesFromFormData(formData),
    imageUrls,
    group: groupFromFormData(formData),
    location: locationFromFormData(formData),
    assignedTo: optionalString(formData, "assignedTo"),
  });
  revalidatePath("/admin");
  revalidatePath(`/admin/assets/${id}`);
  revalidatePath("/shop");
  revalidatePath(`/shop/${id}`);
  redirect("/admin");
}

export async function deleteAssetAction(id: string) {
  await assertAdmin();
  await deleteAsset(id);
  revalidatePath("/admin");
  revalidatePath("/shop");
  redirect("/admin");
}

export async function restoreAssetAction(id: string) {
  await assertAdmin();
  await restoreAsset(id);
  revalidatePath("/admin");
  revalidatePath("/admin/trash");
  revalidatePath("/shop");
  redirect("/admin/trash");
}

export async function permanentlyDeleteAssetAction(id: string) {
  await assertAdmin();
  await permanentlyDeleteAsset(id);
  revalidatePath("/admin/trash");
  redirect("/admin/trash");
}

export async function createGroupAction(formData: FormData) {
  await assertAdmin();
  await createGroup(adminText(formData, "name"));
  // "layout" revalidates every page under /admin (including assets/new and
  // assets/[id], which render the group dropdown) — those routes don't take
  // an id, so a single literal revalidatePath("/admin") wouldn't reach them.
  revalidatePath("/admin", "layout");
  redirect("/admin");
}

// Called directly from a Client Component (CompletionCheckbox) rather than bound
// to a <form action>, so — unlike the other actions here — these don't redirect;
// they just update state and revalidate so the list re-renders in place.
export async function setTicketStatusAction(ticketId: string, completed: boolean) {
  await assertAdmin();
  await setTicketCompleted(ticketId, completed);
  revalidatePath("/admin/tickets");
}

export async function setCustomOrderStatusAction(orderId: string, completed: boolean) {
  await assertAdmin();
  await setCustomOrderCompleted(orderId, completed);
  revalidatePath("/admin/custom-orders");
  revalidatePath(`/admin/custom-orders/${orderId}`);
}

// No redirect — like the status actions above, this just updates the record
// and revalidates, so it works the same whether the form is on the list page
// or the order detail page (either way, the user stays where they were). A
// plain form + Save button is enough here (unlike the checkbox, a text field
// doesn't need client JS to auto-submit).
export async function setTicketAssigneeAction(ticketId: string, formData: FormData) {
  await assertAdmin();
  await setTicketAssignee(ticketId, optionalString(formData, "assignedTo"));
  revalidatePath("/admin/tickets");
}

export async function attachAssetToTicketAction(ticketId: string, formData: FormData) {
  await assertAdmin();
  const assetId = adminText(formData, "assetId");
  if (assetId) {
    await addAssetToTicket(ticketId, assetId);
  }
  revalidatePath(`/admin/tickets/${ticketId}`);
  revalidatePath("/admin/tickets");
}

export async function removeAssetFromTicketAction(ticketId: string, assetId: string) {
  await assertAdmin();
  await removeAssetFromTicket(ticketId, assetId);
  revalidatePath(`/admin/tickets/${ticketId}`);
  revalidatePath("/admin/tickets");
}

export async function setCustomOrderAssigneeAction(orderId: string, formData: FormData) {
  await assertAdmin();
  await setCustomOrderAssignee(orderId, optionalString(formData, "assignedTo"));
  revalidatePath("/admin/custom-orders");
  revalidatePath(`/admin/custom-orders/${orderId}`);
}

export async function attachAssetToOrderAction(orderId: string, formData: FormData) {
  await assertAdmin();
  const assetId = adminText(formData, "assetId");
  if (assetId) {
    await addAssetToCustomOrder(orderId, assetId);
  }
  revalidatePath(`/admin/custom-orders/${orderId}`);
  revalidatePath("/admin/custom-orders");
}

export async function removeAssetFromOrderAction(orderId: string, assetId: string) {
  await assertAdmin();
  await removeAssetFromCustomOrder(orderId, assetId);
  revalidatePath(`/admin/custom-orders/${orderId}`);
  revalidatePath("/admin/custom-orders");
}

export async function markSoldAction(id: string, formData: FormData) {
  await assertAdmin();
  const salePriceCents = centsFromDollarsInput(formData.get("salePrice"));
  await markSold(id, salePriceCents);
  revalidatePath("/admin");
  revalidatePath("/shop");
  revalidatePath("/admin/analytics");
  redirect("/admin");
}

export async function createPurchaseAction(formData: FormData) {
  await assertAdmin();
  await createPurchase({
    item: adminText(formData, "item"),
    vendor: optionalString(formData, "vendor"),
    quantity: positiveIntFromFormData(formData, "quantity"),
    totalCostCents: centsFromDollarsInput(formData.get("totalCost")),
    purchasedAt: dateOnlyFromFormData(formData, "purchasedAt"),
    notes: optionalLongText(formData, "notes"),
    group: groupFromFormData(formData),
    assetId: optionalString(formData, "assetId"),
  });
  revalidatePath("/admin/purchases");
  redirect("/admin/purchases");
}

export async function updatePurchaseAction(id: string, formData: FormData) {
  await assertAdmin();
  await updatePurchase(id, {
    item: adminText(formData, "item"),
    vendor: optionalString(formData, "vendor"),
    quantity: positiveIntFromFormData(formData, "quantity"),
    totalCostCents: centsFromDollarsInput(formData.get("totalCost")),
    purchasedAt: dateOnlyFromFormData(formData, "purchasedAt"),
    notes: optionalLongText(formData, "notes"),
    group: groupFromFormData(formData),
    assetId: optionalString(formData, "assetId"),
  });
  revalidatePath("/admin/purchases");
  revalidatePath(`/admin/purchases/${id}`);
  redirect("/admin/purchases");
}

export async function deletePurchaseAction(id: string) {
  await assertAdmin();
  await deletePurchase(id);
  revalidatePath("/admin/purchases");
  redirect("/admin/purchases");
}

export async function restorePurchaseAction(id: string) {
  await assertAdmin();
  await restorePurchase(id);
  revalidatePath("/admin/purchases");
  revalidatePath("/admin/trash");
  redirect("/admin/trash");
}

export async function permanentlyDeletePurchaseAction(id: string) {
  await assertAdmin();
  await permanentlyDeletePurchase(id);
  revalidatePath("/admin/trash");
  redirect("/admin/trash");
}

export async function createPurchaseGroupAction(formData: FormData) {
  await assertAdmin();
  await createPurchaseGroup(adminText(formData, "name"));
  // "layout" so /admin/purchases/new and /admin/purchases/[id] (which render
  // the group dropdown) also pick up the new group immediately.
  revalidatePath("/admin", "layout");
  redirect("/admin/purchases");
}

export async function createEmployeeAction(formData: FormData) {
  await assertAdmin();
  const password = rawPassword(formData, "password");
  if (password.length > ADMIN_LIMITS.maxPasswordLength) {
    redirect(
      `/admin/employees/new?error=${encodeURIComponent(
        `Password must be ${ADMIN_LIMITS.maxPasswordLength} characters or fewer.`,
      )}`,
    );
  }

  const result = await createEmployee({
    name: adminText(formData, "name"),
    username: adminText(formData, "username"),
    password,
  });
  if (!result.ok) {
    redirect(`/admin/employees/new?error=${encodeURIComponent(result.error)}`);
  }
  revalidatePath("/admin/employees");
  // "layout" so every page with an "Assigned to" datalist picks up the new name.
  revalidatePath("/admin", "layout");
  redirect("/admin/employees");
}

export async function updateEmployeeAction(id: string, formData: FormData) {
  await assertAdmin();
  const password = rawPassword(formData, "password");
  if (password.length > ADMIN_LIMITS.maxPasswordLength) {
    redirect(
      `/admin/employees/${id}?error=${encodeURIComponent(
        `Password must be ${ADMIN_LIMITS.maxPasswordLength} characters or fewer.`,
      )}`,
    );
  }

  const result = await updateEmployee(id, {
    name: adminText(formData, "name"),
    username: adminText(formData, "username"),
    // Blank means "leave the existing password alone".
    password: password.trim() ? password : undefined,
  });
  if (!result.ok) {
    redirect(`/admin/employees/${id}?error=${encodeURIComponent(result.error)}`);
  }
  revalidatePath("/admin/employees");
  revalidatePath("/admin", "layout");
  redirect("/admin/employees");
}

export async function deleteEmployeeAction(id: string) {
  await assertOwner();
  await deleteEmployee(id);
  revalidatePath("/admin/employees");
  revalidatePath("/admin", "layout");
  redirect("/admin/employees");
}
