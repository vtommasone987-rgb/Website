import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { hashPassword } from "./password";
import type {
  Asset,
  AssetStatus,
  CustomOrder,
  CustomOrderCategory,
  Employee,
  PublicEmployee,
  Purchase,
  Sale,
  StorageType,
  Ticket,
  TicketCategory,
} from "./types";

/**
 * Data access layer over Postgres (via Prisma).
 *
 * Every function returns the plain TypeScript shapes in ./types rather than raw
 * Prisma rows, so pages and actions don't depend on the ORM. The main conversion
 * is dates: Prisma hands back `Date` objects, but the app passes ISO strings
 * around and formats them with the helpers in ./format, so rows are mapped to
 * strings here at the boundary.
 *
 * One deliberate exception: Purchase.purchasedAt is a calendar date stored as a
 * "YYYY-MM-DD" string, not a timestamp — see the note in prisma/schema.prisma.
 */

export const TRASH_RETENTION_DAYS = 7;
const TRASH_RETENTION_MS = TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000;

/** Date this item will be permanently purged from Trash if not restored first. */
export function trashExpiryDate(deletedAt: string): string {
  return new Date(new Date(deletedAt).getTime() + TRASH_RETENTION_MS).toISOString();
}

/**
 * Lazy sweep — there's no background job/cron here, so expired trash is purged
 * whenever the Trash page is viewed rather than on a schedule. Once this is
 * deployed, pair it with (or replace it by) a Vercel Cron job hitting a route
 * that calls this, so purging doesn't depend on someone opening the Trash page.
 */
async function purgeExpiredTrash(): Promise<void> {
  const cutoff = new Date(Date.now() - TRASH_RETENTION_MS);
  await prisma.asset.deleteMany({ where: { deletedAt: { lt: cutoff } } });
  await prisma.purchase.deleteMany({ where: { deletedAt: { lt: cutoff } } });
}

// --- Assets ---------------------------------------------------------------

const assetInclude = { parts: true, storageDevices: true, images: true } satisfies Prisma.AssetInclude;
type AssetRow = Prisma.AssetGetPayload<{ include: typeof assetInclude }>;

function toAsset(row: AssetRow): Asset {
  return {
    id: row.id,
    assetNumber: row.assetNumber,
    name: row.name,
    model: row.model,
    serialNumber: row.serialNumber,
    priceCents: row.priceCents,
    status: row.status as AssetStatus,
    description: row.description,
    parts: row.parts.map((p) => ({ id: p.id, name: p.name, serialNumber: p.serialNumber })),
    storageDevices: row.storageDevices.map((d) => ({
      id: d.id,
      type: d.type as StorageType,
      capacityGb: d.capacityGb,
      serialNumber: d.serialNumber,
    })),
    images: row.images.map((i) => ({ id: i.id, url: i.url })),
    createdAt: row.createdAt.toISOString(),
    group: row.group,
    location: row.location,
    deletedAt: row.deletedAt?.toISOString() ?? null,
    assignedTo: row.assignedTo,
  };
}

export async function listAssets(): Promise<Asset[]> {
  const rows = await prisma.asset.findMany({
    where: { deletedAt: null },
    include: assetInclude,
    orderBy: { assetNumber: "asc" },
  });
  return rows.map(toAsset);
}

export async function listAvailableAssets(): Promise<Asset[]> {
  const rows = await prisma.asset.findMany({
    where: { deletedAt: null, status: "available" },
    include: assetInclude,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toAsset);
}

export async function getAsset(id: string): Promise<Asset | undefined> {
  const row = await prisma.asset.findUnique({ where: { id }, include: assetInclude });
  return row ? toAsset(row) : undefined;
}

/**
 * Asset numbers for the given ids, keyed by id. Lets a table render a linked
 * asset reference for many rows with one query instead of one lookup per row.
 */
export async function getAssetNumbers(ids: string[]): Promise<Map<string, number>> {
  const unique = [...new Set(ids)];
  if (unique.length === 0) return new Map();
  const rows = await prisma.asset.findMany({
    where: { id: { in: unique } },
    select: { id: true, assetNumber: true },
  });
  return new Map(rows.map((r) => [r.id, r.assetNumber]));
}

export type AssetInput = {
  name: string;
  model: string;
  serialNumber: string;
  priceCents: number;
  description: string;
  parts: { name: string; serialNumber: string }[];
  storageDevices: { type: StorageType; capacityGb: number; serialNumber: string }[];
  imageUrls: string[];
  group: string | null;
  location: string | null;
  assignedTo: string | null;
};

export async function createAsset(input: AssetInput): Promise<Asset> {
  const row = await prisma.asset.create({
    data: {
      name: input.name,
      model: input.model,
      serialNumber: input.serialNumber,
      priceCents: input.priceCents,
      description: input.description,
      status: "available",
      group: input.group,
      location: input.location,
      assignedTo: input.assignedTo,
      parts: { create: input.parts },
      storageDevices: { create: input.storageDevices },
      images: { create: input.imageUrls.map((url) => ({ url })) },
    },
    include: assetInclude,
  });
  return toAsset(row);
}

export async function updateAsset(id: string, input: AssetInput): Promise<Asset | undefined> {
  const existing = await prisma.asset.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return undefined;

  // Parts and storage devices are fully replaced by whatever the form submitted,
  // matching how the form re-sends every row. Images are only replaced when new
  // ones were uploaded, so saving the form without picking files keeps the
  // existing photos.
  const row = await prisma.asset.update({
    where: { id },
    data: {
      name: input.name,
      model: input.model,
      serialNumber: input.serialNumber,
      priceCents: input.priceCents,
      description: input.description,
      group: input.group,
      location: input.location,
      assignedTo: input.assignedTo,
      parts: { deleteMany: {}, create: input.parts },
      storageDevices: { deleteMany: {}, create: input.storageDevices },
      ...(input.imageUrls.length > 0
        ? { images: { deleteMany: {}, create: input.imageUrls.map((url) => ({ url })) } }
        : {}),
    },
    include: assetInclude,
  });
  return toAsset(row);
}

/** Distinct locations currently in use, for the location field's autocomplete. */
export async function listLocations(): Promise<string[]> {
  const rows = await prisma.asset.findMany({
    where: { location: { not: null } },
    select: { location: true },
    distinct: ["location"],
  });
  return rows
    .map((r) => r.location)
    .filter((l): l is string => Boolean(l))
    .sort((a, b) => a.localeCompare(b));
}

export async function listGroups(): Promise<string[]> {
  const rows = await prisma.assetGroup.findMany();
  return rows.map((g) => g.name).sort((a, b) => a.localeCompare(b));
}

/** Returns false (and adds nothing) if the name is blank or already exists, case-insensitively. */
export async function createGroup(name: string): Promise<boolean> {
  const trimmed = name.trim();
  if (!trimmed) return false;
  const existing = await prisma.assetGroup.findFirst({
    where: { name: { equals: trimmed, mode: "insensitive" } },
  });
  if (existing) return false;
  await prisma.assetGroup.create({ data: { name: trimmed } });
  return true;
}

export async function searchAssets({ query, group }: { query?: string; group?: string }): Promise<Asset[]> {
  const trimmed = query?.trim();
  const where: Prisma.AssetWhereInput = { deletedAt: null };
  if (group) where.group = group;

  if (trimmed) {
    const like = { contains: trimmed, mode: "insensitive" } as const;
    const asNumber = Number(trimmed);
    where.OR = [
      { name: like },
      { model: like },
      { serialNumber: like },
      { group: like },
      { location: like },
      // The asset number is an integer column, so it's matched exactly rather
      // than as a substring — searching "103" finds #103.
      ...(Number.isInteger(asNumber) ? [{ assetNumber: asNumber }] : []),
    ];
  }

  const rows = await prisma.asset.findMany({ where, include: assetInclude, orderBy: { assetNumber: "asc" } });
  return rows.map(toAsset);
}

/** Soft delete — hides the asset from normal views but keeps it around so it can be restored from Trash. */
export async function deleteAsset(id: string): Promise<void> {
  await prisma.asset.updateMany({ where: { id }, data: { deletedAt: new Date() } });
}

export async function restoreAsset(id: string): Promise<void> {
  await prisma.asset.updateMany({ where: { id }, data: { deletedAt: null } });
}

/** Actually removes the asset — only reachable from the Trash page's "Delete forever". */
export async function permanentlyDeleteAsset(id: string): Promise<void> {
  await prisma.asset.deleteMany({ where: { id } });
}

export async function listDeletedAssets(): Promise<Asset[]> {
  await purgeExpiredTrash();
  const rows = await prisma.asset.findMany({
    where: { deletedAt: { not: null } },
    include: assetInclude,
    orderBy: { deletedAt: "desc" },
  });
  return rows.map(toAsset);
}

export async function markSold(id: string, salePriceCents: number): Promise<Sale | undefined> {
  const asset = await prisma.asset.findUnique({ where: { id }, select: { id: true, name: true } });
  if (!asset) return undefined;

  // One transaction so a sale is never recorded without the asset also being
  // marked sold (or vice versa).
  const [, sale] = await prisma.$transaction([
    prisma.asset.update({ where: { id }, data: { status: "sold" } }),
    prisma.sale.create({ data: { assetId: asset.id, assetName: asset.name, salePriceCents } }),
  ]);

  return {
    id: sale.id,
    assetId: sale.assetId ?? "",
    assetName: sale.assetName,
    salePriceCents: sale.salePriceCents,
    soldAt: sale.soldAt.toISOString(),
  };
}

export async function listSales(): Promise<Sale[]> {
  const rows = await prisma.sale.findMany({ orderBy: { soldAt: "desc" } });
  return rows.map((s) => ({
    id: s.id,
    assetId: s.assetId ?? "",
    assetName: s.assetName,
    salePriceCents: s.salePriceCents,
    soldAt: s.soldAt.toISOString(),
  }));
}

export async function salesSummary() {
  const result = await prisma.sale.aggregate({ _sum: { salePriceCents: true }, _count: true });
  const totalRevenueCents = result._sum.salePriceCents ?? 0;
  const totalSales = result._count;
  const avgSaleCents = totalSales ? Math.round(totalRevenueCents / totalSales) : 0;
  return { totalRevenueCents, totalSales, avgSaleCents };
}

// --- Tickets --------------------------------------------------------------

const linkedAssetIds = { assets: { select: { id: true } } } satisfies Prisma.TicketInclude;
type TicketRow = Prisma.TicketGetPayload<{ include: typeof linkedAssetIds }>;

function toTicket(row: TicketRow): Ticket {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    category: row.category as TicketCategory,
    description: row.description,
    completed: row.completed,
    createdAt: row.createdAt.toISOString(),
    assignedTo: row.assignedTo,
    assetIds: row.assets.map((a) => a.id),
  };
}

export type TicketInput = {
  name: string;
  email: string;
  category: TicketCategory;
  description: string;
};

export async function createTicket(input: TicketInput): Promise<Ticket> {
  const row = await prisma.ticket.create({ data: { ...input }, include: linkedAssetIds });
  return toTicket(row);
}

export async function listTickets(): Promise<Ticket[]> {
  // Open tickets first (newest first within each group), so the queue reads
  // top-to-bottom by what's left to do.
  const rows = await prisma.ticket.findMany({
    include: linkedAssetIds,
    orderBy: [{ completed: "asc" }, { createdAt: "desc" }],
  });
  return rows.map(toTicket);
}

export async function getTicket(id: string): Promise<Ticket | undefined> {
  const row = await prisma.ticket.findUnique({ where: { id }, include: linkedAssetIds });
  return row ? toTicket(row) : undefined;
}

export async function setTicketCompleted(id: string, completed: boolean): Promise<void> {
  await prisma.ticket.updateMany({ where: { id }, data: { completed } });
}

export async function setTicketAssignee(id: string, assignedTo: string | null): Promise<void> {
  await prisma.ticket.updateMany({ where: { id }, data: { assignedTo } });
}

export async function addAssetToTicket(ticketId: string, assetId: string): Promise<void> {
  await prisma.ticket.update({ where: { id: ticketId }, data: { assets: { connect: { id: assetId } } } });
}

export async function removeAssetFromTicket(ticketId: string, assetId: string): Promise<void> {
  await prisma.ticket.update({ where: { id: ticketId }, data: { assets: { disconnect: { id: assetId } } } });
}

/** Resolves a ticket's linked assets to full Asset records. */
export async function getTicketAssets(ticketId: string): Promise<Asset[]> {
  const row = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { assets: { include: assetInclude, orderBy: { assetNumber: "asc" } } },
  });
  return row ? row.assets.map(toAsset) : [];
}

// --- Custom orders --------------------------------------------------------

type CustomOrderRow = Prisma.CustomOrderGetPayload<{ include: { assets: { select: { id: true } } } }>;

function toCustomOrder(row: CustomOrderRow): CustomOrder {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    category: row.category as CustomOrderCategory,
    model: row.model,
    quantity: row.quantity,
    details: row.details,
    budget: row.budget,
    completed: row.completed,
    createdAt: row.createdAt.toISOString(),
    assetIds: row.assets.map((a) => a.id),
    assignedTo: row.assignedTo,
  };
}

export type CustomOrderInput = {
  name: string;
  email: string;
  category: CustomOrderCategory;
  model: string | null;
  quantity: number;
  details: string;
  budget: string | null;
};

export async function createCustomOrder(input: CustomOrderInput): Promise<CustomOrder> {
  const row = await prisma.customOrder.create({ data: { ...input }, include: linkedAssetIds });
  return toCustomOrder(row);
}

export async function listCustomOrders(): Promise<CustomOrder[]> {
  // Same ordering as listTickets(): open first, newest first within each group.
  const rows = await prisma.customOrder.findMany({
    include: linkedAssetIds,
    orderBy: [{ completed: "asc" }, { createdAt: "desc" }],
  });
  return rows.map(toCustomOrder);
}

export async function getCustomOrder(id: string): Promise<CustomOrder | undefined> {
  const row = await prisma.customOrder.findUnique({ where: { id }, include: linkedAssetIds });
  return row ? toCustomOrder(row) : undefined;
}

export async function setCustomOrderCompleted(id: string, completed: boolean): Promise<void> {
  await prisma.customOrder.updateMany({ where: { id }, data: { completed } });
}

export async function setCustomOrderAssignee(id: string, assignedTo: string | null): Promise<void> {
  await prisma.customOrder.updateMany({ where: { id }, data: { assignedTo } });
}

export async function addAssetToCustomOrder(orderId: string, assetId: string): Promise<void> {
  await prisma.customOrder.update({ where: { id: orderId }, data: { assets: { connect: { id: assetId } } } });
}

export async function removeAssetFromCustomOrder(orderId: string, assetId: string): Promise<void> {
  await prisma.customOrder.update({ where: { id: orderId }, data: { assets: { disconnect: { id: assetId } } } });
}

/** Resolves an order's linked assets to full Asset records. */
export async function getCustomOrderAssets(orderId: string): Promise<Asset[]> {
  const row = await prisma.customOrder.findUnique({
    where: { id: orderId },
    select: { assets: { include: assetInclude, orderBy: { assetNumber: "asc" } } },
  });
  return row ? row.assets.map(toAsset) : [];
}

// --- Employees ------------------------------------------------------------

/** Employee directory names, for the "Assigned to" autocomplete on assets/tickets/custom orders. */
export async function listAssignees(): Promise<string[]> {
  const rows = await prisma.employee.findMany({ select: { name: true }, orderBy: { name: "asc" } });
  return rows.map((e) => e.name);
}

export async function listEmployees(): Promise<PublicEmployee[]> {
  const rows = await prisma.employee.findMany({
    select: { id: true, name: true, username: true, createdAt: true },
    orderBy: { name: "asc" },
  });
  return rows.map((e) => ({ ...e, createdAt: e.createdAt.toISOString() }));
}

export async function getEmployee(id: string): Promise<PublicEmployee | undefined> {
  const row = await prisma.employee.findUnique({
    where: { id },
    select: { id: true, name: true, username: true, createdAt: true },
  });
  return row ? { ...row, createdAt: row.createdAt.toISOString() } : undefined;
}

/** Full record including password hash — for verifying login, not for rendering. */
export async function findEmployeeByUsername(username: string): Promise<Employee | undefined> {
  const row = await prisma.employee.findFirst({
    where: { username: { equals: username, mode: "insensitive" } },
  });
  return row ? { ...row, createdAt: row.createdAt.toISOString() } : undefined;
}

const MIN_PASSWORD_LENGTH = 8;

async function usernameTaken(username: string, excludeId?: string): Promise<boolean> {
  const trimmed = username.trim();
  // The shared owner login isn't in this table, so guard it separately —
  // otherwise an employee could register it and shadow the owner account.
  if (trimmed.toLowerCase() === (process.env.ADMIN_USERNAME ?? "").toLowerCase()) return true;
  const existing = await prisma.employee.findFirst({
    where: { username: { equals: trimmed, mode: "insensitive" }, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { id: true },
  });
  return Boolean(existing);
}

export type EmployeeResult = { ok: true; employee: PublicEmployee } | { ok: false; error: string };

export async function createEmployee(input: {
  name: string;
  username: string;
  password: string;
}): Promise<EmployeeResult> {
  const name = input.name.trim();
  const username = input.username.trim();
  if (!name || !username) return { ok: false, error: "Name and username are required." };
  if (input.password.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
  }
  if (await usernameTaken(username)) return { ok: false, error: "That username is already taken." };

  const { hash, salt } = hashPassword(input.password);
  const row = await prisma.employee.create({
    data: { name, username, passwordHash: hash, passwordSalt: salt },
    select: { id: true, name: true, username: true, createdAt: true },
  });
  return { ok: true, employee: { ...row, createdAt: row.createdAt.toISOString() } };
}

export async function updateEmployee(
  id: string,
  input: { name: string; username: string; password?: string },
): Promise<EmployeeResult> {
  const existing = await prisma.employee.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return { ok: false, error: "Employee not found." };

  const name = input.name.trim();
  const username = input.username.trim();
  if (!name || !username) return { ok: false, error: "Name and username are required." };
  if (await usernameTaken(username, id)) return { ok: false, error: "That username is already taken." };

  let credentials: { passwordHash: string; passwordSalt: string } | undefined;
  if (input.password) {
    if (input.password.length < MIN_PASSWORD_LENGTH) {
      return { ok: false, error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
    }
    const { hash, salt } = hashPassword(input.password);
    credentials = { passwordHash: hash, passwordSalt: salt };
  }

  const row = await prisma.employee.update({
    where: { id },
    data: { name, username, ...credentials },
    select: { id: true, name: true, username: true, createdAt: true },
  });
  return { ok: true, employee: { ...row, createdAt: row.createdAt.toISOString() } };
}

/** Hard delete, not soft-delete — removing an employee should revoke their access immediately. */
export async function deleteEmployee(id: string): Promise<void> {
  await prisma.employee.deleteMany({ where: { id } });
}

// --- Purchases ------------------------------------------------------------

type PurchaseRow = Prisma.PurchaseGetPayload<object>;

function toPurchase(row: PurchaseRow): Purchase {
  return {
    id: row.id,
    item: row.item,
    vendor: row.vendor,
    quantity: row.quantity,
    totalCostCents: row.totalCostCents,
    purchasedAt: row.purchasedAt,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    group: row.group,
    deletedAt: row.deletedAt?.toISOString() ?? null,
    assetId: row.assetId,
  };
}

export type PurchaseInput = {
  item: string;
  vendor: string | null;
  quantity: number;
  totalCostCents: number;
  purchasedAt: string;
  notes: string | null;
  group: string | null;
  assetId: string | null;
};

export async function listPurchases(): Promise<Purchase[]> {
  const rows = await prisma.purchase.findMany({
    where: { deletedAt: null },
    orderBy: { purchasedAt: "desc" },
  });
  return rows.map(toPurchase);
}

export async function getPurchase(id: string): Promise<Purchase | undefined> {
  const row = await prisma.purchase.findUnique({ where: { id } });
  return row ? toPurchase(row) : undefined;
}

export async function createPurchase(input: PurchaseInput): Promise<Purchase> {
  const row = await prisma.purchase.create({ data: { ...input } });
  return toPurchase(row);
}

export async function updatePurchase(id: string, input: PurchaseInput): Promise<Purchase | undefined> {
  const existing = await prisma.purchase.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return undefined;
  const row = await prisma.purchase.update({ where: { id }, data: { ...input } });
  return toPurchase(row);
}

/** Soft delete — hides the purchase from normal views but keeps it around so it can be restored from Trash. */
export async function deletePurchase(id: string): Promise<void> {
  await prisma.purchase.updateMany({ where: { id }, data: { deletedAt: new Date() } });
}

export async function restorePurchase(id: string): Promise<void> {
  await prisma.purchase.updateMany({ where: { id }, data: { deletedAt: null } });
}

/** Actually removes the purchase — only reachable from the Trash page's "Delete forever". */
export async function permanentlyDeletePurchase(id: string): Promise<void> {
  await prisma.purchase.deleteMany({ where: { id } });
}

export async function listDeletedPurchases(): Promise<Purchase[]> {
  await purgeExpiredTrash();
  const rows = await prisma.purchase.findMany({
    where: { deletedAt: { not: null } },
    orderBy: { deletedAt: "desc" },
  });
  return rows.map(toPurchase);
}

export async function purchasesSummary() {
  const result = await prisma.purchase.aggregate({
    where: { deletedAt: null },
    _sum: { totalCostCents: true },
    _count: true,
  });
  return { totalCents: result._sum.totalCostCents ?? 0, count: result._count };
}

export async function listPurchaseGroups(): Promise<string[]> {
  const rows = await prisma.purchaseGroup.findMany();
  return rows.map((g) => g.name).sort((a, b) => a.localeCompare(b));
}

/** Returns false (and adds nothing) if the name is blank or already exists, case-insensitively. */
export async function createPurchaseGroup(name: string): Promise<boolean> {
  const trimmed = name.trim();
  if (!trimmed) return false;
  const existing = await prisma.purchaseGroup.findFirst({
    where: { name: { equals: trimmed, mode: "insensitive" } },
  });
  if (existing) return false;
  await prisma.purchaseGroup.create({ data: { name: trimmed } });
  return true;
}

export async function searchPurchases({
  query,
  group,
}: {
  query?: string;
  group?: string;
}): Promise<Purchase[]> {
  const trimmed = query?.trim();
  const where: Prisma.PurchaseWhereInput = { deletedAt: null };
  if (group) where.group = group;

  if (trimmed) {
    const like = { contains: trimmed, mode: "insensitive" } as const;
    where.OR = [{ item: like }, { vendor: like }, { notes: like }, { group: like }];
  }

  const rows = await prisma.purchase.findMany({ where, orderBy: { purchasedAt: "desc" } });
  return rows.map(toPurchase);
}
