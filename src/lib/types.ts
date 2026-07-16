export type Part = {
  id: string;
  name: string;
  serialNumber: string;
};

export type StorageType = "hdd" | "sata-ssd" | "nvme-ssd" | "emmc" | "other";

/** A storage drive inside an asset — separate from Part since it needs capacity, which a charger or battery doesn't. */
export type StorageDevice = {
  id: string;
  type: StorageType;
  capacityGb: number;
  serialNumber: string;
};

export type AssetImage = {
  id: string;
  url: string;
};

export type AssetStatus = "available" | "sold";

export type Asset = {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  priceCents: number;
  status: AssetStatus;
  description: string;
  parts: Part[];
  storageDevices: StorageDevice[];
  images: AssetImage[];
  createdAt: string;
  /** Freeform label for organizing inventory — e.g. "Reserved: Jane Doe" or "Recycle". Null/empty means ungrouped. */
  group: string | null;
  /** Where the physical item currently is — e.g. "Warehouse A, Shelf 3". Null/empty means not tracked. */
  location: string | null;
  /** Soft-delete marker — set when "deleted" from the UI so it can be restored from Trash. Null means active. */
  deletedAt: string | null;
  /** Employee handling this asset, if any. Freeform, optional. */
  assignedTo: string | null;
};

export type Sale = {
  id: string;
  assetId: string;
  assetName: string;
  salePriceCents: number;
  soldAt: string;
};

export type TicketCategory = "warranty" | "repair" | "feedback" | "other";

export type Ticket = {
  id: string;
  name: string;
  email: string;
  category: TicketCategory;
  description: string;
  completed: boolean;
  createdAt: string;
  /** Employee handling this ticket, if any. Freeform, optional, set by admin staff (not the submitter). */
  assignedTo: string | null;
};

export type CustomOrderCategory = "pc-build" | "laptop" | "tablet" | "other";

export type CustomOrder = {
  id: string;
  name: string;
  email: string;
  category: CustomOrderCategory;
  /** Specific model requested, if the customer knows one — e.g. "Dell Latitude 5420". Null if not given. */
  model: string | null;
  /** How many units of this build/device are needed — e.g. 12 for a bulk order of identical laptops. */
  quantity: number;
  details: string;
  /** Freeform, e.g. "$800–$1200". Optional — null if not given. */
  budget: string | null;
  completed: boolean;
  createdAt: string;
  /** Inventory assets allocated to fulfill this order — e.g. the specific units built/pulled for it. */
  assetIds: string[];
  /** Employee handling this order, if any. Freeform, optional, set by admin staff (not the submitter). */
  assignedTo: string | null;
};

/** Something OPTS bought for the company — supplies, tools, parts, etc. Distinct from Sale (what OPTS sells). */
export type Purchase = {
  id: string;
  item: string;
  vendor: string | null;
  quantity: number;
  totalCostCents: number;
  /** Date of the purchase (YYYY-MM-DD), not necessarily when this record was entered. */
  purchasedAt: string;
  notes: string | null;
  createdAt: string;
  /** Freeform label for organizing purchases — e.g. "Tools", "Office Supplies". Its own list, separate from asset groups. Null/empty means ungrouped. */
  group: string | null;
  /** Soft-delete marker — set when "deleted" from the UI so it can be restored from Trash. Null means active. */
  deletedAt: string | null;
};
