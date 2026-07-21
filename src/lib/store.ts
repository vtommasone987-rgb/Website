import { randomUUID } from "crypto";
import type {
  Asset,
  AssetImage,
  CustomOrder,
  CustomOrderCategory,
  Employee,
  Part,
  PublicEmployee,
  Purchase,
  Sale,
  StorageDevice,
  StorageType,
  Ticket,
  TicketCategory,
} from "./types";
import { hashPassword } from "./password";

/**
 * In-memory data store standing in for the database while the UI is under review.
 * Every function here has a signature that will map cleanly onto Prisma queries
 * later, so swapping this file's internals for real persistence shouldn't require
 * changing any page or action that calls it. Data resets whenever the dev server restarts.
 */

export const TRASH_RETENTION_DAYS = 7;
const TRASH_RETENTION_MS = TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000;

/** Date this item will be permanently purged from Trash if not restored first. */
export function trashExpiryDate(deletedAt: string): string {
  return new Date(new Date(deletedAt).getTime() + TRASH_RETENTION_MS).toISOString();
}

/**
 * Lazy sweep — there's no background job/cron here (no server to run one on
 * yet), so expired trash is purged whenever the Trash page is viewed rather
 * than on a schedule. Once this moves to a real deployment, pair this with
 * (or replace it with) a Vercel Cron job hitting a route that calls this, so
 * purging doesn't depend on someone happening to open the Trash page.
 */
function purgeExpiredTrash(): void {
  const cutoff = Date.now() - TRASH_RETENTION_MS;
  for (let i = assets.length - 1; i >= 0; i--) {
    const deletedAt = assets[i].deletedAt;
    if (deletedAt && new Date(deletedAt).getTime() < cutoff) assets.splice(i, 1);
  }
  for (let i = purchases.length - 1; i >= 0; i--) {
    const deletedAt = purchases[i].deletedAt;
    if (deletedAt && new Date(deletedAt).getTime() < cutoff) purchases.splice(i, 1);
  }
}

function image(url: string): AssetImage {
  return { id: randomUUID(), url };
}

function part(name: string, serialNumber: string): Part {
  return { id: randomUUID(), name, serialNumber };
}

function storageDevice(type: StorageType, capacityGb: number, serialNumber: string): StorageDevice {
  return { id: randomUUID(), type, capacityGb, serialNumber };
}

const assets: Asset[] = [
  {
    id: "asset-1",
    assetNumber: 101,
    name: "ThinkPad X1 Carbon Gen 9",
    model: "20XW-CTO1WW",
    serialNumber: "PF3K9J2A",
    priceCents: 89900,
    status: "available",
    description:
      "14\" business laptop, i7-1165G7, 16GB RAM, 512GB NVMe SSD. Light wear on the lid, keyboard and screen are excellent.",
    parts: [part("Original 65W USB-C charger", "CHG-4471-A"), part("Extended battery pack", "BAT-9012-C")],
    storageDevices: [storageDevice("nvme-ssd", 512, "SSD-TP-9911")],
    images: [
      image("https://picsum.photos/seed/thinkpad-1/800/600"),
      image("https://picsum.photos/seed/thinkpad-2/800/600"),
    ],
    createdAt: "2026-06-02T14:00:00.000Z",
    group: null,
    location: "Office, Desk 2",
    deletedAt: null,
    assignedTo: null,
  },
  {
    id: "asset-2",
    assetNumber: 102,
    name: "Canon EOS R5",
    model: "EOS R5 Body",
    serialNumber: "CN0834771",
    priceCents: 249900,
    status: "available",
    description:
      "Mirrorless full-frame body, ~8,200 shutter actuations. Comes with two batteries and the original box.",
    parts: [
      part("LP-E6NH battery #1", "BATT-6NH-001"),
      part("LP-E6NH battery #2", "BATT-6NH-002"),
      part("CFexpress card reader", "RDR-CFX-33"),
    ],
    storageDevices: [],
    images: [
      image("https://picsum.photos/seed/canon-1/800/600"),
      image("https://picsum.photos/seed/canon-2/800/600"),
      image("https://picsum.photos/seed/canon-3/800/600"),
    ],
    createdAt: "2026-06-10T09:30:00.000Z",
    group: "Reserved: Sarah Kim",
    location: "Warehouse A, Shelf 3",
    deletedAt: null,
    assignedTo: "Jordan Lee",
  },
  {
    id: "asset-3",
    assetNumber: 103,
    name: "DeWalt 20V MAX Drill/Driver Kit",
    model: "DCD791D2",
    serialNumber: "DW22190456",
    priceCents: 12900,
    status: "available",
    description: "Brushless drill/driver, two 2Ah batteries, charger, and hard case included.",
    parts: [part("2Ah battery #1", "DCB203-A"), part("2Ah battery #2", "DCB203-B"), part("Fast charger", "DCB107-X")],
    storageDevices: [],
    images: [image("https://picsum.photos/seed/dewalt-1/800/600")],
    createdAt: "2026-06-18T11:15:00.000Z",
    group: "Recycle",
    location: "Garage",
    deletedAt: null,
    assignedTo: null,
  },
  {
    id: "asset-4",
    assetNumber: 104,
    name: "Dell PowerEdge R730 Server",
    model: "PowerEdge R730",
    serialNumber: "DPE730-88213",
    priceCents: 64900,
    status: "sold",
    description: "2x Xeon E5-2680 v4, 128GB RAM, 8x 2.5\" bays populated with 600GB 10K SAS drives, dual PSU.",
    parts: [
      part("PSU #1", "PSU-750W-A"),
      part("PSU #2", "PSU-750W-B"),
      part("PERC H730 RAID controller", "H730-77102"),
    ],
    storageDevices: [
      storageDevice("hdd", 600, "SAS-R730-01"),
      storageDevice("hdd", 600, "SAS-R730-02"),
    ],
    images: [image("https://picsum.photos/seed/dell-server-1/800/600")],
    createdAt: "2026-05-20T08:00:00.000Z",
    group: null,
    location: "Warehouse A, Shelf 1",
    deletedAt: null,
    assignedTo: null,
  },
  {
    id: "asset-5",
    assetNumber: 105,
    name: "Herman Miller Aeron (Size B)",
    model: "Aeron Remastered",
    serialNumber: "HM-AER-33210",
    priceCents: 39900,
    status: "sold",
    description: "Fully adjustable, PostureFit SL, graphite frame. No rips or stains.",
    parts: [part("Adjustable lumbar support", "PFSL-4402")],
    storageDevices: [],
    images: [image("https://picsum.photos/seed/aeron-1/800/600")],
    createdAt: "2026-05-25T16:45:00.000Z",
    group: null,
    location: "Office, Storage Closet",
    deletedAt: null,
    assignedTo: null,
  },
];

// Next asset number to hand out — starts after the highest seeded number
// (101–105) so new assets keep counting up from 106. Assigned once at
// creation and never reused, even if the asset is later deleted.
let nextAssetNumber = 106;

// Groups are their own list rather than something only derived from assets in
// use, so a new group can be created up front (e.g. before any asset is
// assigned to it) instead of only appearing after typing it into an asset.
const groups: string[] = ["Recycle", "Reserved: Sarah Kim"];

const sales: Sale[] = [
  {
    id: "sale-1",
    assetId: "asset-4",
    assetName: "Dell PowerEdge R730 Server",
    salePriceCents: 61000,
    soldAt: "2026-06-28T13:20:00.000Z",
  },
  {
    id: "sale-2",
    assetId: "asset-5",
    assetName: "Herman Miller Aeron (Size B)",
    salePriceCents: 38500,
    soldAt: "2026-07-05T10:05:00.000Z",
  },
];

const tickets: Ticket[] = [
  {
    id: "ticket-1",
    name: "Marcus Webb",
    email: "marcus.webb@example.com",
    category: "repair",
    description: "The laptop I bought last month won't hold a charge past 20 minutes — might be a battery issue.",
    completed: false,
    createdAt: "2026-07-10T15:22:00.000Z",
    assignedTo: "Sam Rivera",
    assetIds: ["asset-1"],
  },
  {
    id: "ticket-2",
    name: "Priya Patel",
    email: "priya.patel@example.com",
    category: "warranty",
    description: "Requesting a warranty check on a server PSU that started making a grinding noise.",
    completed: true,
    createdAt: "2026-07-02T09:10:00.000Z",
    assignedTo: null,
    assetIds: [],
  },
];

const customOrders: CustomOrder[] = [
  {
    id: "order-1",
    name: "Alicia Nguyen",
    email: "alicia.nguyen@example.com",
    category: "pc-build",
    model: null,
    quantity: 1,
    details: "Looking for a workstation for video editing — 32GB+ RAM, fast NVMe storage, a solid GPU for Premiere.",
    budget: "$1,500–$2,000",
    completed: false,
    createdAt: "2026-07-08T13:40:00.000Z",
    assetIds: [],
    assignedTo: null,
  },
  {
    id: "order-2",
    name: "Rachel Osei",
    email: "rachel.osei@example.com",
    category: "laptop",
    model: "Dell Latitude 5440",
    quantity: 12,
    details: "Onboarding a new team — need 12 identical laptops, imaged the same, for new hires starting next month.",
    budget: "$700–$900 each",
    completed: false,
    createdAt: "2026-07-12T10:05:00.000Z",
    assetIds: ["asset-1"],
    assignedTo: "Dana Kim",
  },
];

const purchases: Purchase[] = [
  {
    id: "purchase-1",
    item: "USB-C dock stations",
    vendor: "CDW",
    quantity: 5,
    totalCostCents: 62450,
    purchasedAt: "2026-06-20",
    notes: "For the new hire onboarding kits.",
    createdAt: "2026-06-20T16:00:00.000Z",
    group: "IT Supplies",
    deletedAt: null,
    assetId: null,
  },
  {
    id: "purchase-2",
    item: "Precision screwdriver set",
    vendor: "Amazon Business",
    quantity: 2,
    totalCostCents: 4598,
    purchasedAt: "2026-07-01",
    notes: null,
    createdAt: "2026-07-01T12:30:00.000Z",
    group: "Tools",
    deletedAt: null,
    assetId: null,
  },
];

// Purchase groups are their own list, separate from asset groups (different
// domain — expense/procurement categories, not inventory disposition).
const purchaseGroups: string[] = ["IT Supplies", "Tools"];

// No seed data here on purpose — unlike assets/purchases, employee accounts are
// real login credentials, so the list starts empty for whoever sets this up.
const employees: Employee[] = [];

export function listAssets(): Asset[] {
  return assets.filter((a) => !a.deletedAt);
}

export function listAvailableAssets(): Asset[] {
  return assets.filter((a) => a.status === "available" && !a.deletedAt);
}

export function getAsset(id: string): Asset | undefined {
  return assets.find((a) => a.id === id);
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

export function createAsset(input: AssetInput): Asset {
  const asset: Asset = {
    id: randomUUID(),
    assetNumber: nextAssetNumber++,
    name: input.name,
    model: input.model,
    serialNumber: input.serialNumber,
    priceCents: input.priceCents,
    description: input.description,
    status: "available",
    parts: input.parts.map((p) => part(p.name, p.serialNumber)),
    storageDevices: input.storageDevices.map((d) => storageDevice(d.type, d.capacityGb, d.serialNumber)),
    images: input.imageUrls.map(image),
    createdAt: new Date().toISOString(),
    group: input.group,
    location: input.location,
    deletedAt: null,
    assignedTo: input.assignedTo,
  };
  assets.push(asset);
  return asset;
}

export function updateAsset(id: string, input: AssetInput): Asset | undefined {
  const asset = getAsset(id);
  if (!asset) return undefined;
  asset.name = input.name;
  asset.model = input.model;
  asset.serialNumber = input.serialNumber;
  asset.priceCents = input.priceCents;
  asset.description = input.description;
  asset.parts = input.parts.map((p) => part(p.name, p.serialNumber));
  asset.storageDevices = input.storageDevices.map((d) => storageDevice(d.type, d.capacityGb, d.serialNumber));
  asset.group = input.group;
  asset.location = input.location;
  asset.assignedTo = input.assignedTo;
  if (input.imageUrls.length > 0) {
    asset.images = input.imageUrls.map(image);
  }
  return asset;
}

/** Distinct locations currently in use, for the location field's autocomplete. */
export function listLocations(): string[] {
  const locations = new Set<string>();
  for (const asset of assets) {
    if (asset.location) locations.add(asset.location);
  }
  return [...locations].sort((a, b) => a.localeCompare(b));
}

export function listGroups(): string[] {
  return [...groups].sort((a, b) => a.localeCompare(b));
}

/** Returns false (and adds nothing) if the name is blank or already exists, case-insensitively. */
export function createGroup(name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed) return false;
  const alreadyExists = groups.some((g) => g.toLowerCase() === trimmed.toLowerCase());
  if (alreadyExists) return false;
  groups.push(trimmed);
  return true;
}

export function searchAssets({ query, group }: { query?: string; group?: string }): Asset[] {
  const normalizedQuery = query?.trim().toLowerCase();
  return assets.filter((asset) => {
    if (asset.deletedAt) return false;
    if (group && asset.group !== group) return false;
    if (!normalizedQuery) return true;
    const haystack = [
      String(asset.assetNumber),
      asset.name,
      asset.model,
      asset.serialNumber,
      asset.group ?? "",
      asset.location ?? "",
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalizedQuery);
  });
}

/** Soft delete — hides the asset from normal views but keeps it around so it can be restored from Trash. */
export function deleteAsset(id: string): void {
  const asset = getAsset(id);
  if (asset) asset.deletedAt = new Date().toISOString();
}

export function restoreAsset(id: string): void {
  const asset = getAsset(id);
  if (asset) asset.deletedAt = null;
}

/** Actually removes the asset — only reachable from the Trash page's "Delete forever". */
export function permanentlyDeleteAsset(id: string): void {
  const index = assets.findIndex((a) => a.id === id);
  if (index !== -1) assets.splice(index, 1);
}

export function listDeletedAssets(): Asset[] {
  purgeExpiredTrash();
  return assets
    .filter((a) => a.deletedAt)
    .sort((a, b) => ((a.deletedAt ?? "") < (b.deletedAt ?? "") ? 1 : -1));
}

export function markSold(id: string, salePriceCents: number): Sale | undefined {
  const asset = getAsset(id);
  if (!asset) return undefined;
  asset.status = "sold";
  const sale: Sale = {
    id: randomUUID(),
    assetId: asset.id,
    assetName: asset.name,
    salePriceCents,
    soldAt: new Date().toISOString(),
  };
  sales.push(sale);
  return sale;
}

export function listSales(): Sale[] {
  return [...sales].sort((a, b) => (a.soldAt < b.soldAt ? 1 : -1));
}

export function salesSummary() {
  const totalRevenueCents = sales.reduce((sum, s) => sum + s.salePriceCents, 0);
  const totalSales = sales.length;
  const avgSaleCents = totalSales ? Math.round(totalRevenueCents / totalSales) : 0;
  return { totalRevenueCents, totalSales, avgSaleCents };
}

export type TicketInput = {
  name: string;
  email: string;
  category: TicketCategory;
  description: string;
};

export function createTicket(input: TicketInput): Ticket {
  const ticket: Ticket = {
    id: randomUUID(),
    name: input.name,
    email: input.email,
    category: input.category,
    description: input.description,
    completed: false,
    createdAt: new Date().toISOString(),
    assignedTo: null,
    assetIds: [],
  };
  tickets.push(ticket);
  return ticket;
}

export function listTickets(): Ticket[] {
  // Open tickets first (newest first within each group), so the queue reads top-to-bottom by what's left to do.
  return [...tickets].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return a.createdAt < b.createdAt ? 1 : -1;
  });
}

export function getTicket(id: string): Ticket | undefined {
  return tickets.find((t) => t.id === id);
}

export function setTicketCompleted(id: string, completed: boolean): void {
  const ticket = tickets.find((t) => t.id === id);
  if (ticket) ticket.completed = completed;
}

export function setTicketAssignee(id: string, assignedTo: string | null): void {
  const ticket = tickets.find((t) => t.id === id);
  if (ticket) ticket.assignedTo = assignedTo;
}

export function addAssetToTicket(ticketId: string, assetId: string): void {
  const ticket = getTicket(ticketId);
  if (!ticket) return;
  if (!ticket.assetIds.includes(assetId)) {
    ticket.assetIds.push(assetId);
  }
}

export function removeAssetFromTicket(ticketId: string, assetId: string): void {
  const ticket = getTicket(ticketId);
  if (!ticket) return;
  ticket.assetIds = ticket.assetIds.filter((id) => id !== assetId);
}

/** Resolves a ticket's linked asset IDs to full Asset records, silently dropping any that no longer exist. */
export function getTicketAssets(ticketId: string): Asset[] {
  const ticket = getTicket(ticketId);
  if (!ticket) return [];
  return ticket.assetIds.map((id) => getAsset(id)).filter((a): a is Asset => Boolean(a));
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

export function createCustomOrder(input: CustomOrderInput): CustomOrder {
  const order: CustomOrder = {
    id: randomUUID(),
    name: input.name,
    email: input.email,
    category: input.category,
    model: input.model,
    quantity: input.quantity,
    details: input.details,
    budget: input.budget,
    completed: false,
    createdAt: new Date().toISOString(),
    assetIds: [],
    assignedTo: null,
  };
  customOrders.push(order);
  return order;
}

export function listCustomOrders(): CustomOrder[] {
  // Same ordering as listTickets(): open first, newest first within each group.
  return [...customOrders].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return a.createdAt < b.createdAt ? 1 : -1;
  });
}

export function getCustomOrder(id: string): CustomOrder | undefined {
  return customOrders.find((o) => o.id === id);
}

export function setCustomOrderCompleted(id: string, completed: boolean): void {
  const order = customOrders.find((o) => o.id === id);
  if (order) order.completed = completed;
}

export function setCustomOrderAssignee(id: string, assignedTo: string | null): void {
  const order = customOrders.find((o) => o.id === id);
  if (order) order.assignedTo = assignedTo;
}

/** Employee directory names, for the "Assigned to" autocomplete on assets/tickets/custom orders. */
export function listAssignees(): string[] {
  return employees.map((e) => e.name).sort((a, b) => a.localeCompare(b));
}

function toPublicEmployee(e: Employee): PublicEmployee {
  return { id: e.id, name: e.name, username: e.username, createdAt: e.createdAt };
}

export function listEmployees(): PublicEmployee[] {
  return [...employees].map(toPublicEmployee).sort((a, b) => a.name.localeCompare(b.name));
}

export function getEmployee(id: string): PublicEmployee | undefined {
  const employee = employees.find((e) => e.id === id);
  return employee ? toPublicEmployee(employee) : undefined;
}

/** Full record including password hash — for verifying login, not for rendering. */
export function findEmployeeByUsername(username: string): Employee | undefined {
  return employees.find((e) => e.username.toLowerCase() === username.toLowerCase());
}

const MIN_PASSWORD_LENGTH = 8;

function usernameTaken(username: string, excludeId?: string): boolean {
  const trimmed = username.trim().toLowerCase();
  if (trimmed === (process.env.ADMIN_USERNAME ?? "").toLowerCase()) return true;
  return employees.some((e) => e.id !== excludeId && e.username.toLowerCase() === trimmed);
}

export type EmployeeResult = { ok: true; employee: PublicEmployee } | { ok: false; error: string };

export function createEmployee(input: { name: string; username: string; password: string }): EmployeeResult {
  const name = input.name.trim();
  const username = input.username.trim();
  if (!name || !username) return { ok: false, error: "Name and username are required." };
  if (input.password.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
  }
  if (usernameTaken(username)) return { ok: false, error: "That username is already taken." };

  const { hash, salt } = hashPassword(input.password);
  const employee: Employee = {
    id: randomUUID(),
    name,
    username,
    passwordHash: hash,
    passwordSalt: salt,
    createdAt: new Date().toISOString(),
  };
  employees.push(employee);
  return { ok: true, employee: toPublicEmployee(employee) };
}

export function updateEmployee(
  id: string,
  input: { name: string; username: string; password?: string },
): EmployeeResult {
  const employee = employees.find((e) => e.id === id);
  if (!employee) return { ok: false, error: "Employee not found." };
  const name = input.name.trim();
  const username = input.username.trim();
  if (!name || !username) return { ok: false, error: "Name and username are required." };
  if (usernameTaken(username, id)) return { ok: false, error: "That username is already taken." };
  if (input.password) {
    if (input.password.length < MIN_PASSWORD_LENGTH) {
      return { ok: false, error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
    }
    const { hash, salt } = hashPassword(input.password);
    employee.passwordHash = hash;
    employee.passwordSalt = salt;
  }
  employee.name = name;
  employee.username = username;
  return { ok: true, employee: toPublicEmployee(employee) };
}

/** Hard delete, not soft-delete — removing an employee should revoke their access immediately. */
export function deleteEmployee(id: string): void {
  const index = employees.findIndex((e) => e.id === id);
  if (index !== -1) employees.splice(index, 1);
}

export function addAssetToCustomOrder(orderId: string, assetId: string): void {
  const order = getCustomOrder(orderId);
  if (!order) return;
  if (!order.assetIds.includes(assetId)) {
    order.assetIds.push(assetId);
  }
}

export function removeAssetFromCustomOrder(orderId: string, assetId: string): void {
  const order = getCustomOrder(orderId);
  if (!order) return;
  order.assetIds = order.assetIds.filter((id) => id !== assetId);
}

/** Resolves an order's linked asset IDs to full Asset records, silently dropping any that no longer exist. */
export function getCustomOrderAssets(orderId: string): Asset[] {
  const order = getCustomOrder(orderId);
  if (!order) return [];
  return order.assetIds.map((id) => getAsset(id)).filter((a): a is Asset => Boolean(a));
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

export function listPurchases(): Purchase[] {
  return purchases.filter((p) => !p.deletedAt).sort((a, b) => (a.purchasedAt < b.purchasedAt ? 1 : -1));
}

export function getPurchase(id: string): Purchase | undefined {
  return purchases.find((p) => p.id === id);
}

export function createPurchase(input: PurchaseInput): Purchase {
  const purchase: Purchase = {
    id: randomUUID(),
    item: input.item,
    vendor: input.vendor,
    quantity: input.quantity,
    totalCostCents: input.totalCostCents,
    purchasedAt: input.purchasedAt,
    notes: input.notes,
    createdAt: new Date().toISOString(),
    group: input.group,
    deletedAt: null,
    assetId: input.assetId,
  };
  purchases.push(purchase);
  return purchase;
}

export function updatePurchase(id: string, input: PurchaseInput): Purchase | undefined {
  const purchase = getPurchase(id);
  if (!purchase) return undefined;
  purchase.item = input.item;
  purchase.vendor = input.vendor;
  purchase.quantity = input.quantity;
  purchase.totalCostCents = input.totalCostCents;
  purchase.purchasedAt = input.purchasedAt;
  purchase.notes = input.notes;
  purchase.group = input.group;
  purchase.assetId = input.assetId;
  return purchase;
}

/** Soft delete — hides the purchase from normal views but keeps it around so it can be restored from Trash. */
export function deletePurchase(id: string): void {
  const purchase = getPurchase(id);
  if (purchase) purchase.deletedAt = new Date().toISOString();
}

export function restorePurchase(id: string): void {
  const purchase = getPurchase(id);
  if (purchase) purchase.deletedAt = null;
}

/** Actually removes the purchase — only reachable from the Trash page's "Delete forever". */
export function permanentlyDeletePurchase(id: string): void {
  const index = purchases.findIndex((p) => p.id === id);
  if (index !== -1) purchases.splice(index, 1);
}

export function listDeletedPurchases(): Purchase[] {
  purgeExpiredTrash();
  return purchases
    .filter((p) => p.deletedAt)
    .sort((a, b) => ((a.deletedAt ?? "") < (b.deletedAt ?? "") ? 1 : -1));
}

export function purchasesSummary() {
  const active = purchases.filter((p) => !p.deletedAt);
  const totalCents = active.reduce((sum, p) => sum + p.totalCostCents, 0);
  return { totalCents, count: active.length };
}

export function listPurchaseGroups(): string[] {
  return [...purchaseGroups].sort((a, b) => a.localeCompare(b));
}

/** Returns false (and adds nothing) if the name is blank or already exists, case-insensitively. */
export function createPurchaseGroup(name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed) return false;
  const alreadyExists = purchaseGroups.some((g) => g.toLowerCase() === trimmed.toLowerCase());
  if (alreadyExists) return false;
  purchaseGroups.push(trimmed);
  return true;
}

export function searchPurchases({ query, group }: { query?: string; group?: string }): Purchase[] {
  const normalizedQuery = query?.trim().toLowerCase();
  return purchases
    .filter((purchase) => {
      if (purchase.deletedAt) return false;
      if (group && purchase.group !== group) return false;
      if (!normalizedQuery) return true;
      const haystack = [purchase.item, purchase.vendor ?? "", purchase.notes ?? "", purchase.group ?? ""]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    })
    .sort((a, b) => (a.purchasedAt < b.purchasedAt ? 1 : -1));
}
