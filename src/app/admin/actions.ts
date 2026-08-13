"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
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

function centsFromDollarsInput(value: FormDataEntryValue | null): number {
  const dollars = Number(value ?? 0);
  return Math.round(dollars * 100);
}

function groupFromFormData(formData: FormData): string | null {
  const value = String(formData.get("group") ?? "").trim();
  return value || null;
}

function locationFromFormData(formData: FormData): string | null {
  const value = String(formData.get("location") ?? "").trim();
  return value || null;
}

function optionalString(formData: FormData, key: string): string | null {
  const value = String(formData.get(key) ?? "").trim();
  return value || null;
}

function positiveIntFromFormData(formData: FormData, key: string): number {
  const parsed = Number(formData.get(key));
  return Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : 1;
}

function partsFromFormData(formData: FormData) {
  const parts: { name: string; serialNumber: string }[] = [];
  for (let i = 0; i < MAX_PARTS; i++) {
    const name = String(formData.get(`part-name-${i}`) ?? "").trim();
    const serialNumber = String(formData.get(`part-serial-${i}`) ?? "").trim();
    if (name || serialNumber) {
      parts.push({ name, serialNumber });
    }
  }
  return parts;
}

function storageDevicesFromFormData(formData: FormData) {
  const devices: { type: StorageType; capacityGb: number; serialNumber: string }[] = [];
  for (let i = 0; i < MAX_STORAGE_DEVICES; i++) {
    const rawType = String(formData.get(`storage-type-${i}`) ?? "").trim();
    const capacityGb = Number(formData.get(`storage-capacity-${i}`) ?? 0);
    const serialNumber = String(formData.get(`storage-serial-${i}`) ?? "").trim();
    if (!rawType && !capacityGb && !serialNumber) continue;
    const type = (VALID_STORAGE_TYPES as string[]).includes(rawType) ? (rawType as StorageType) : "other";
    devices.push({ type, capacityGb: Number.isFinite(capacityGb) ? capacityGb : 0, serialNumber });
  }
  return devices;
}

// Saves uploaded photos straight to /public/uploads. This is the "local disk in
// dev" storage decision from CLAUDE.md — swap this function for an upload to
// Cloudflare R2/Vercel Blob later without touching any caller.
async function savePhotos(formData: FormData): Promise<string[]> {
  const files = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return [];

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const urls: string[] = [];
  for (const file of files) {
    const extension = file.type.split("/")[1] ?? "jpg";
    const filename = `${randomUUID()}.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), buffer);
    urls.push(`/uploads/${filename}`);
  }
  return urls;
}

export async function createAssetAction(formData: FormData) {
  await assertAdmin();
  const imageUrls = await savePhotos(formData);
  await createAsset({
    name: String(formData.get("name") ?? ""),
    model: String(formData.get("model") ?? ""),
    serialNumber: String(formData.get("serialNumber") ?? ""),
    priceCents: centsFromDollarsInput(formData.get("price")),
    description: String(formData.get("description") ?? ""),
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
    name: String(formData.get("name") ?? ""),
    model: String(formData.get("model") ?? ""),
    serialNumber: String(formData.get("serialNumber") ?? ""),
    priceCents: centsFromDollarsInput(formData.get("price")),
    description: String(formData.get("description") ?? ""),
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
  await createGroup(String(formData.get("name") ?? ""));
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
  const assetId = String(formData.get("assetId") ?? "");
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
  const assetId = String(formData.get("assetId") ?? "");
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
    item: String(formData.get("item") ?? ""),
    vendor: optionalString(formData, "vendor"),
    quantity: positiveIntFromFormData(formData, "quantity"),
    totalCostCents: centsFromDollarsInput(formData.get("totalCost")),
    purchasedAt: String(formData.get("purchasedAt") ?? ""),
    notes: optionalString(formData, "notes"),
    group: groupFromFormData(formData),
    assetId: optionalString(formData, "assetId"),
  });
  revalidatePath("/admin/purchases");
  redirect("/admin/purchases");
}

export async function updatePurchaseAction(id: string, formData: FormData) {
  await assertAdmin();
  await updatePurchase(id, {
    item: String(formData.get("item") ?? ""),
    vendor: optionalString(formData, "vendor"),
    quantity: positiveIntFromFormData(formData, "quantity"),
    totalCostCents: centsFromDollarsInput(formData.get("totalCost")),
    purchasedAt: String(formData.get("purchasedAt") ?? ""),
    notes: optionalString(formData, "notes"),
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
  await createPurchaseGroup(String(formData.get("name") ?? ""));
  // "layout" so /admin/purchases/new and /admin/purchases/[id] (which render
  // the group dropdown) also pick up the new group immediately.
  revalidatePath("/admin", "layout");
  redirect("/admin/purchases");
}

export async function createEmployeeAction(formData: FormData) {
  await assertAdmin();
  const result = await createEmployee({
    name: String(formData.get("name") ?? ""),
    username: String(formData.get("username") ?? ""),
    password: String(formData.get("password") ?? ""),
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
  const password = String(formData.get("password") ?? "");
  const result = await updateEmployee(id, {
    name: String(formData.get("name") ?? ""),
    username: String(formData.get("username") ?? ""),
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
